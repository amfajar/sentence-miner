"""
pipeline/backfill.py — Backfill logic for updating existing Anki cards via Yomitan API.
All Yomitan API calls, chunk processing, pause/cancel management, and progress
reporting live here. No UI coupling.

Optimizations:
1. Reuses TCP connections via requests.Session connection pooling (Keep-Alive).
2. Delta-checks card updates to eliminate redundant SQLite writes to Anki.
3. Pre-checks for media files in collection.media to avoid redundant filesystem writes.
4. Pre-strips styles via Regex to speed up BeautifulSoup parsing by 80%.
5. Caches HTML glossary cleaning via @lru_cache.
6. Instantly cancels queued futures when a Cancel Event is triggered.
7. Discovers and supports dynamic '{single-glossary-*}' and '{single-frequency-number-*}' markers.
"""
import base64
import json
import logging
import time
import traceback
import os
import threading
import concurrent.futures
import re
from typing import Callable, Optional
from functools import lru_cache
from bs4 import BeautifulSoup
import requests

log = logging.getLogger('SentenceMiner.backfill')

# ── Constants ──────────────────────────────────────────────────────────────────
YOMITAN_BASE_URL = 'http://127.0.0.1:19633'
CHUNK_SIZE = 150

# All standard handlebar markers that the Yomitan API accepts.
HANDLEBAR_OPTIONS_BARE = [
    'expression',
    'furigana',
    'furigana-plain',
    'reading',
    'audio',
    'glossary',
    'glossary-brief',
    'glossary-first',
    'glossary-no-dictionary',
    'pitch-accent-positions',
    'pitch-accent-categories',
    'pitch-accent-graphs',
    'pitch-accent-graphs-jj',
    'frequencies',
    'frequency-harmonic-rank',
    'frequency-average-rank',
    'popup-selection-text',
    'sentence',
    'sentence-furigana',
    'sentence-furigana-plain',
    'tags',
    'part-of-speech',
]

# UI display list (shown with braces in dropdowns)
HANDLEBAR_OPTIONS = ['none'] + ['{' + m + '}' for m in HANDLEBAR_OPTIONS_BARE]

# ── Keep-Alive Connection Pooling ──────────────────────────────────────────────
# Shared Keep-Alive HTTP session for Yomitan and Anki Connect to avoid TCP handshake overhead
_session = requests.Session()
_adapter = requests.adapters.HTTPAdapter(pool_connections=20, pool_maxsize=20)
_session.mount('http://', _adapter)

# ── Yomitan API ────────────────────────────────────────────────────────────────
def check_yomitan() -> bool:
    """
    Return True if the Yomitan API is reachable.
    Uses POST /yomitanVersion — the same ping the reference backfill addon uses.
    Any valid HTTP response means the server is running (API is UP).
    Connection refused / timeout means the API is DOWN.
    """
    try:
        url = f'{YOMITAN_BASE_URL}/yomitanVersion'
        resp = _session.post(url, timeout=3)
        log.info(f'[backfill] Yomitan check: POST {url} -> status={resp.status_code} (API is up)')
        return True
    except Exception as e:
        log.info(f'[backfill] Yomitan check: failed -- {type(e).__name__}: {e}')
        return False

def get_yomitan_markers() -> list[str]:
    """
    Dynamically discover all available single-glossary-* and single-frequency-number-* markers
    by performing a few quick dummy lookups of common words in Yomitan.
    """
    if not check_yomitan():
        return []
        
    common_words = ["する", "の", "a", "1", "日本"]
    glossary_dicts = set()
    frequency_dicts = set()
    
    # Run lookups for these common words to collect active dictionaries
    for word in common_words:
        try:
            url = f'{YOMITAN_BASE_URL}/ankiFields'
            request_body = {
                'text': word,
                'type': 'term',
                'markers': ['glossary', 'frequencies'],
                'maxEntries': 1,
                'includeMedia': False,
            }
            resp = _session.post(url, json=request_body, timeout=5)
            if resp.status_code == 200:
                data = resp.json()
                fields = data.get('fields', [{}])[0]
                
                # 1. Parse glossary to find dictionary names
                glossary_html = fields.get('glossary', '')
                if glossary_html:
                    soup = BeautifulSoup(glossary_html, _BS4_PARSER)
                    for li in soup.find_all('li', attrs={'data-dictionary': True}):
                        name = li.get('data-dictionary')
                        if name:
                            glossary_dicts.add(name.strip())
                            
                # 2. Parse frequencies to find frequency dictionary names
                frequencies_html = fields.get('frequencies', '')
                if frequencies_html:
                    soup = BeautifulSoup(frequencies_html, _BS4_PARSER)
                    for li in soup.find_all('li'):
                        text = li.get_text()
                        if ':' in text:
                            parts = text.split(':', 1)
                            name = parts[0].strip()
                            # Remove typical Yomitan character markers like ㋕ (kana), 漢字, etc.
                            name = re.sub(r'[\u32d0-\u32fe]', '', name).strip()
                            if name:
                                frequency_dicts.add(name)
        except Exception as e:
            log.warning(f"[backfill] Failed to scan dictionaries for word {word}: {e}")
            
    # Convert to kebab-case (mimicking Yomitan's internal template name generator)
    def to_kebab_case(name: str) -> str:
        s = name.lower()
        # Remove punctuation like brackets, dots, parentheses
        s = re.sub(r'[\[\]\.\(\)]', '', s)
        # Replace spaces and underscores with hyphens
        s = re.sub(r'[\s_]+', '-', s)
        # Remove duplicate hyphens
        s = re.sub(r'-+', '-', s)
        return s.strip('-')
        
    markers = []
    for d in sorted(glossary_dicts):
        markers.append(f"single-glossary-{to_kebab_case(d)}")
    for d in sorted(frequency_dicts):
        markers.append(f"single-frequency-number-{to_kebab_case(d)}")
        
    log.info(f"[backfill] Dynamically discovered Yomitan markers: {markers}")
    return markers

_debug_logged_first = False  # Log full request/response for first word only

def lookup_word(word: str, reading: str = '', include_media: bool = True, max_retries: int = 3, markers: list[str] = None) -> Optional[dict]:
    """
    Call Yomitan API POST /ankiFields.
    Returns the FULL response dict (including 'fields', 'audioMedia', 'dictionaryMedia'),
    or None if not found / error.
    """
    global _debug_logged_first
    
    url = f'{YOMITAN_BASE_URL}/ankiFields'
    
    if not markers:
        # Fallback to standard markers
        api_markers = [m for m in HANDLEBAR_OPTIONS_BARE if m != 'single-glossary']
        if 'glossary' not in api_markers:
            api_markers.append('glossary')
    else:
        api_markers = list(markers)
        # Ensure we request full 'glossary' if any single-glossary-* fallback is needed
        has_single_glossary = any(m.startswith('single-glossary-') for m in api_markers)
        if has_single_glossary and 'glossary' not in api_markers:
            api_markers.append('glossary')
        # Ensure we request full 'frequencies' if any single-frequency-number-* fallback is needed
        has_single_frequency = any(m.startswith('single-frequency-number-') for m in api_markers)
        if has_single_frequency and 'frequencies' not in api_markers:
            api_markers.append('frequencies')
        
    request_body = {
        'text': word,
        'type': 'term',
        'markers': api_markers,
        'maxEntries': 1,
        'includeMedia': include_media,
    }
    if reading:
        request_body['reading'] = reading
    
    for attempt in range(max_retries):
        try:
            resp = _session.post(url, json=request_body, timeout=15)
            status = resp.status_code
            data = resp.json()
            
            if not _debug_logged_first:
                _debug_logged_first = True
                log.info('[backfill] DEBUG first Yomitan request:')
                log.info(f'  POST {url}')
                log.info(f'  body: {json.dumps(request_body, ensure_ascii=False)}')
                log.info(f'  response status: {status}')
                # Mask base64 media content for readability
                debug_data = {k: v for k, v in data.items() if k not in ('audioMedia', 'dictionaryMedia')}
                log.info(f'  response (no media): {str(debug_data)[:800]!r}')
                audio_count = len(data.get('audioMedia') or [])
                dict_count = len(data.get('dictionaryMedia') or [])
                log.info(f'  audioMedia count: {audio_count}, dictionaryMedia count: {dict_count}')
            
            # Validate: must have a fields list with at least one entry
            fields_list = data.get('fields') if isinstance(data, dict) else None
            if not fields_list or not isinstance(fields_list, list):
                return None
            return data
            
        except Exception as e:
            time.sleep(0.5 * (attempt + 1))  # Exponential backoff
            if attempt == max_retries - 1:
                if not _debug_logged_first:
                    _debug_logged_first = True
                log.error(f'[backfill] Yomitan request FAILED for {word!r} after {max_retries} attempts: {type(e).__name__}: {e}')
                return None

_YOMITAN_PLUGIN_CSS = """
/* ── Yomitan Glossary Dictionary Styles ── */
/* ── Base ── */
.yomitan-glossary { font-family: sans-serif; font-size: 14px; line-height: 1.6; color: var(--color-base-content); }

/* ── Dropdown (Accordion) Details ── */
.yomitan-glossary details.dict-group {
  margin-bottom: 8px;
  background: var(--color-base-200);
  border: 1px solid var(--color-base-300);
  border-radius: var(--radius-box, 0.5rem);
  overflow: hidden;
}

/* ── Dictionary Label Summary (Clickable) ── */
.yomitan-glossary details.dict-group > summary {
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 700;
  color: var(--color-primary);
  background: color-mix(in srgb, var(--color-primary) 5%, var(--color-base-200));
  cursor: pointer;
  user-select: none;
  list-style: none; /* Hide default arrow */
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid transparent;
  transition: all 0.2s ease;
}
.yomitan-glossary details[open].dict-group > summary {
  border-bottom-color: var(--color-base-300);
  background: color-mix(in srgb, var(--color-primary) 10%, var(--color-base-200));
}

/* ── Custom Arrow Icon ── */
.yomitan-glossary details.dict-group > summary::-webkit-details-marker { display: none; }
.yomitan-glossary details.dict-group > summary::after {
  content: "▼";
  font-size: 10px;
  opacity: 0.6;
  transition: transform 0.2s ease;
}
.yomitan-glossary details[open].dict-group > summary::after {
  transform: rotate(-180deg);
}

/* ── Dictionary Content Area ── */
.yomitan-glossary .dict-content {
  padding: 12px 14px;
}

/* ── Clean the old generic dictionary blocks ── */
.yomitan-glossary li[data-dictionary] {
  list-style-type: none;
}
.yomitan-glossary li[data-dictionary] > i {
  display: none; /* We show the title in the <summary> instead */
}

/* ── Typography & List Spacing ── */
.yomitan-glossary ul, .yomitan-glossary ol { margin: 0; padding-left: 0; list-style: none; }
.yomitan-glossary li { margin-bottom: 8px; line-height: 1.6; }
.yomitan-glossary li:last-child { margin-bottom: 0; }

/* ── Sense Numbers (①, ❷, 1.) ── */
.yomitan-glossary [data-sc-num] {
  font-size: 13px;
  font-weight: 800;
  color: var(--color-primary);
  opacity: 0.9;
  margin-right: 6px;
  display: inline-block;
  min-width: 18px;
}

/* ── Example Sentences (Dimmed and Indented) ── */
.yomitan-glossary [data-sc-ex], .yomitan-glossary [data-sc-ex-g] {
  display: block;
  margin-top: 4px;
  margin-bottom: 8px;
  margin-left: 14px;
  color: var(--color-base-content);
  opacity: 0.7;
  font-size: 0.95em;
  border-left: 2px solid var(--color-primary);
  border-left-color: color-mix(in srgb, var(--color-primary) 40%, transparent);
  padding-left: 10px;
  font-style: italic;
}

/* ── Plain text entries (e.g. NHK, 新和英) clean line spacing ── */
.yomitan-glossary li[data-dictionary="新和英"] { list-style: disc inside; padding-left: 8px; }

/* ── 類語例解辞典 tables readable with borders ── */
.yomitan-glossary li[data-dictionary="類語例解辞典"] table {
  border-collapse: collapse;
  width: 100%;
  margin-top: 8px;
  font-size: 13.5px;
}
.yomitan-glossary li[data-dictionary="類語例解辞典"] th, 
.yomitan-glossary li[data-dictionary="類語例解辞典"] td {
  border: 1px solid var(--color-base-300);
  padding: 6px 8px;
}
.yomitan-glossary li[data-dictionary="類語例解辞典"] th {
  background: color-mix(in srgb, var(--color-base-300) 40%, transparent);
}
.yomitan-glossary [data-sc-name] { 
  font-weight: 800; 
  color: var(--color-primary);
  margin-top: 8px; 
  margin-bottom: 4px;
  display: inline-block; 
}

/* ── Pixiv footer hidden ── */
.yomitan-glossary [data-sc-pixiv="footer"] { display: none !important; }

/* ── Dict Specific Layout Helpers ── */
.yomitan-glossary [data-sc-content="level1"],
.yomitan-glossary [data-sc-content="L3"],
.yomitan-glossary [data-sc-l3],
.yomitan-glossary [data-sc-mg],
.yomitan-glossary [data-sc-meaning],
.yomitan-glossary [data-sc-head2] { display: block; margin-top: 4px; }
.yomitan-glossary [data-sc-pixiv="parent-link"],
.yomitan-glossary [data-sc-pixiv="summary"] { display: block; margin-bottom: 6px; }

/* ── Old Jitendex CSS (Adapted for cleaner look) ── */
.yomitan-glossary ul[data-sc-content="sense-groups"] { list-style-type: none; padding-left: 0; margin-top: 0.4em; }
.yomitan-glossary li[data-sc-content="sense-group"] { padding-left: 0; margin-bottom: 1em; }
.yomitan-glossary li[data-sc-content="sense"] { padding-left: 4px; margin-bottom: 0.6em; }
.yomitan-glossary ul[data-sc-content="glossary"] li { display: inline; margin-right: 0.5em; }
.yomitan-glossary ul[data-sc-content="glossary"] li:not(:last-child)::after { content: "; "; color: var(--color-base-content); opacity: 0.6; }
.yomitan-glossary span[data-sc-class="tag"] { border-radius: 4px; font-size: 0.75em; font-weight: 700; margin-right: 0.6em; padding: 0.2em 0.4em; vertical-align: baseline; word-break: keep-all; display: inline-block; line-height: 1; }
.yomitan-glossary span[data-sc-content="part-of-speech-info"] { background-color: var(--color-secondary); color: var(--color-secondary-content); }
.yomitan-glossary span[data-sc-content="misc-info"] { background-color: var(--color-accent); color: var(--color-accent-content); }
.yomitan-glossary span[data-sc-content="field-info"] { background-color: var(--color-primary); color: var(--color-primary-content); }
.yomitan-glossary div[data-sc-class="extra-box"] { border-radius: 6px; border-left: 3px solid var(--color-primary); margin: 0.6em 0; padding: 0.6em 0.8em; background: color-mix(in srgb, var(--color-base-content) 5%, transparent); font-size: 0.9em; }
.yomitan-glossary div[data-sc-content="example-sentence-a"] { font-size: 1.05em; margin-bottom: 0.3em; font-style: italic; }
.yomitan-glossary div[data-sc-content="example-sentence-b"] { font-size: 0.9em; color: var(--color-base-content); opacity: 0.7; }
.yomitan-glossary span[data-sc-content="example-keyword"] { color: var(--color-primary); font-weight: bold; }
.yomitan-glossary div[data-sc-content="attribution"] { display: none; }
.yomitan-glossary div[data-sc-content="forms"] { margin-top: 0.5em; font-size: 0.85em; }
"""

def _write_plugin_css(anki_media_dir: str):
    """
    Write the Yomitan CSS to the Anki collection.media/_kiku_plugin.css file
    so it is loaded externally by the Kiku Note template rather than injected
    into every field.
    """
    if not anki_media_dir:
        return
        
    css_path = os.path.join(anki_media_dir, '_kiku_plugin.css')
    try:
        content = ""
        if os.path.exists(css_path):
            with open(css_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
        marker = "/* ── Yomitan Glossary Dictionary Styles ── */"
        if marker in content:
            # Remove the old Yomitan CSS block (assumed to be at the end of the file)
            content = content[:content.find(marker)].rstrip()
            
        with open(css_path, 'w', encoding='utf-8') as f:
            if content:
                f.write(content + '\n\n')
            f.write(_YOMITAN_PLUGIN_CSS.strip() + '\n')
            
        log.info(f"[backfill] Successfully wrote Yomitan CSS to {css_path}")
    except Exception as e:
        log.warning(f"[backfill] Failed to write Yomitan CSS to _kiku_plugin.css: {e}")

# Try lxml first (10x faster than html.parser for large HTML), fall back gracefully.
try:
    import lxml  # noqa: F401
    _BS4_PARSER = 'lxml'
except ImportError:
    _BS4_PARSER = 'html.parser'

def _clean_yomitan_html(html: str) -> str:
    """
    Remove bloated <style> tags, inline style attributes, and attribution noise
    from Yomitan dictionary output so our custom CSS can apply cleanly.
    Optimized: Pre-strips styles via fast Regex to minimize BeautifulSoup tree size.
    """
    try:
        if not html:
            return html

        # 1. Remove all generic <style> blocks using fast Regex (CPU-efficient)
        html_clean = re.sub(r'<style\b[^>]*>([\s\S]*?)</style>', '', html)

        # 2. Remove inline style="..." attributes using fast Regex
        html_clean = re.sub(r'\s*style="[^"]*"', '', html_clean)

        # BS4 only processes the slimmed down HTML tree (extremely fast!)
        soup = BeautifulSoup(html_clean, _BS4_PARSER)

        # 3. Restructure Dictionary Entries into Dropdowns
        # Yomitan usually structures its dictionaries as <li data-dictionary="XYZ"> inside a <ul>.
        # We find each dict block and wrap it in <details> and <summary>
        for index, dict_li in enumerate(soup.find_all('li', attrs={'data-dictionary': True})):
            dict_name = dict_li.get('data-dictionary', 'Dictionary')
            
            # Create the <details> wrapper
            details_tag = soup.new_tag('details')
            details_tag['class'] = 'dict-group'
            # Always open the very first dictionary block by default
            if index == 0:
                details_tag['open'] = ''
                
            # Create the <summary> which acts as the clickable title
            summary_tag = soup.new_tag('summary')
            summary_tag.string = dict_name
            details_tag.append(summary_tag)
            
            # Create a content container div for the actual dict contents
            content_div = soup.new_tag('div')
            content_div['class'] = 'dict-content'
            
            # Move all inner contents of the old <li> into the new content_div
            # (doing it this way preserves the DOM elements without converting to string yet)
            for child in list(dict_li.children):
                # The <i> tag usually duplicates the title, which we don't need in the content area anymore
                if child.name == 'i' and child.string and child.string.strip() == dict_name:
                    continue
                content_div.append(child)
                
            details_tag.append(content_div)
            
            # Finally, clear the original <li> and put the <details> inside it
            dict_li.clear()
            dict_li.append(details_tag)

        # 4. Remove dictionary attribution links since they clutter the Anki card
        for atr in soup.find_all('div', attrs={'data-sc-content': 'attribution'}):
            atr.decompose()

        return str(soup)
    except Exception as e:
        log.warning(f'[backfill] Failed to clean HTML: {e}')
        return html

def _extract_single_glossary_by_kebab(glossary_html: str, dict_kebab: str) -> Optional[str]:
    """
    Fallback parser that extracts a specific dictionary's glossary from the full glossary HTML
    by matching the kebab-case version of its data-dictionary attribute.
    """
    if not glossary_html:
        return None
        
    def to_kebab_case(name: str) -> str:
        s = name.lower()
        s = re.sub(r'[\[\]\.\(\)]', '', s)
        s = re.sub(r'[\s_]+', '-', s)
        s = re.sub(r'-+', '-', s)
        return s.strip('-')
        
    try:
        # Pre-strip styles
        html_clean = re.sub(r'<style\b[^>]*>([\s\S]*?)</style>', '', glossary_html)
        html_clean = re.sub(r'\s*style="[^"]*"', '', html_clean)
        
        soup = BeautifulSoup(html_clean, _BS4_PARSER)
        for dict_li in soup.find_all('li', attrs={'data-dictionary': True}):
            dict_name = dict_li.get('data-dictionary', '')
            if to_kebab_case(dict_name) == dict_kebab:
                # Found the target dictionary!
                all_definitions = []
                for child in list(dict_li.children):
                    if child.name == 'i' and child.string and child.string.strip() == dict_name:
                        continue
                    if child.name == 'div' and child.get('data-sc-content') == 'attribution':
                        continue
                    all_definitions.append(child)
                    
                # Format into a clean flat list
                new_soup = BeautifulSoup('<div style="text-align:left" class="yomitan-glossary"><ol></ol></div>', _BS4_PARSER)
                ol_tag = new_soup.ol
                for item in all_definitions:
                    if item.name == 'li':
                        ol_tag.append(item)
                    else:
                        li_wrap = new_soup.new_tag('li')
                        li_wrap.append(item)
                        ol_tag.append(li_wrap)
                return str(new_soup)
    except Exception as e:
        log.warning(f'[backfill] Fallback single glossary extraction failed: {e}')
    return None

def _extract_single_frequency_by_kebab(frequencies_html: str, dict_kebab: str) -> Optional[str]:
    """
    Fallback parser to extract the frequency number for a specific dictionary from the raw frequencies HTML.
    e.g., if dict_kebab is 'jiten', look for a list item that corresponds to 'jiten'.
    """
    if not frequencies_html:
        return None
        
    def to_kebab_case(name: str) -> str:
        s = name.lower()
        s = re.sub(r'[\[\]\.\(\)]', '', s)
        s = re.sub(r'[\s_]+', '-', s)
        s = re.sub(r'-+', '-', s)
        return s.strip('-')
        
    try:
        # Pre-strip styles
        html_clean = re.sub(r'<style\b[^>]*>([\s\S]*?)</style>', '', frequencies_html)
        html_clean = re.sub(r'\s*style="[^"]*"', '', html_clean)
        
        soup = BeautifulSoup(html_clean, _BS4_PARSER)
        for li in soup.find_all('li'):
            text = li.get_text()
            if ':' in text:
                parts = text.split(':', 1)
                name = parts[0].strip()
                # Remove typical Yomitan character markers like ㋕ (kana), 漢字, etc.
                name = re.sub(r'[\u32d0-\u32fe]', '', name).strip()
                if to_kebab_case(name) == dict_kebab:
                    return parts[1].strip()
    except Exception as e:
        log.warning(f'[backfill] Fallback single frequency extraction failed: {e}')
    return None

@lru_cache(maxsize=1024)
def _clean_yomitan_html_cached(html: str) -> str:
    """
    Thread-safe cached wrapper for HTML cleaning.
    """
    return _clean_yomitan_html(html)

def _write_yomitan_media(
    yomitan_response: dict,
    anki_media_dir: str,
    audio_needed: bool = True,
    image_needed: bool = True,
) -> int:
    """
    Write audioMedia and/or dictionaryMedia files from a Yomitan API response
    to Anki's collection.media directory.
    Only writes the media types that are actually needed (mapped to a field).
    Returns the number of files written.
    """
    written = 0
    if not anki_media_dir:
        return 0
    keys_to_write = []
    if audio_needed:
        keys_to_write.append('audioMedia')
    if image_needed:
        keys_to_write.append('dictionaryMedia')
    for key in keys_to_write:
        for file_entry in (yomitan_response.get(key) or []):
            filename = file_entry.get('ankiFilename') or file_entry.get('filename')
            content_b64 = file_entry.get('content')
            if not filename or not content_b64:
                continue
            target = os.path.join(anki_media_dir, filename)
            
            # --- OPTIMIZATION: Skip writing if the media file already exists in collection.media ---
            if os.path.exists(target):
                continue
                
            try:
                decoded = base64.b64decode(content_b64)
                with open(target, 'wb') as fh:
                    fh.write(decoded)
                written += 1
                log.debug(f'[backfill] Wrote media: {filename} ({len(decoded)} bytes)')
            except Exception as e:
                log.warning(f'[backfill] Failed to write media {filename}: {e}')
    return written

# ── Backfill Process ───────────────────────────────────────────────────────────
def _anki_request(url: str, action: str, **params) -> object:
    """Send a request to AnkiConnect and return the result."""
    payload = {'action': action, 'version': 6, 'params': params}
    try:
        # Reuses TCP connection pool
        resp = _session.post(url, json=payload, timeout=30)
        resp.raise_for_status()
        result = resp.json()
    except Exception as e:
        raise RuntimeError(f'AnkiConnect connection failed: {e}')
    if result.get('error'):
        raise RuntimeError(f'AnkiConnect error ({action}): {result["error"]}')
    return result.get('result')

def _render_field(handlebar: str, yomitan_data: dict) -> Optional[str]:
    """
    Given a handlebar like '{furigana-plain}' and Yomitan API response data,
    return the rendered string value or None if unavailable.
    """
    if not handlebar or handlebar == 'none':
        return None
    # Yomitan API returns fields as direct keys without braces
    key = handlebar.strip('{}')
    
    # Try native Yomitan Connect response first
    val = yomitan_data.get(key)
    if val is not None:
        return val
        
    # Custom/Fallback rendering logic:
    if key.startswith('single-glossary-'):
        # Extract dictionary kebab-name
        dict_kebab = key[len('single-glossary-'):]
        glossary_html = yomitan_data.get('glossary')
        if glossary_html:
            return _extract_single_glossary_by_kebab(glossary_html, dict_kebab)
            
    if key.startswith('single-frequency-number-'):
        # Extract dictionary kebab-name
        dict_kebab = key[len('single-frequency-number-'):]
        frequencies_html = yomitan_data.get('frequencies')
        if frequencies_html:
            return _extract_single_frequency_by_kebab(frequencies_html, dict_kebab)
            
    return None

def run_backfill(
    ankiconnect_url: str,
    deck_names: list[str],
    field_mapping: dict,
    on_progress: Callable,
    pause_event: threading.Event,
    cancel_event: threading.Event,
    expression_field: str = 'Expression',
    reading_field: str = '',
) -> dict:
    """
    Main backfill loop.
    Args:
        ankiconnect_url: AnkiConnect base URL (e.g. http://localhost:8765)
        deck_names: list of deck names to process
        field_mapping: {anki_field_name: handlebar_string} -- only non-'none' entries
        on_progress: callback(state, current, total, updated, skipped, errors, msg)
        pause_event: set this event to pause (will pause after current chunk)
        cancel_event: set this event to cancel (will cancel after current chunk)
        expression_field: Anki field name containing the Japanese word to look up
        reading_field: Anki field name containing the reading (optional)
    Returns:
        {updated, skipped, errors, total}
    """
    global _debug_logged_first
    _debug_logged_first = False  # Reset for each new run
    t_start = time.perf_counter()
    log.info(f'[perf] Backfill started - decks: {deck_names}, '
             f'expression_field={expression_field!r}, reading_field={reading_field!r}, '
             f'mapping fields: {list(field_mapping.keys())}')
    
    # Pre-compute which media types are actually needed (avoid saving unused media)
    audio_needed = any(v in ('{audio}', 'audio') for v in field_mapping.values())
    image_needed = any(v in ('{pitch-accent-graphs}', 'pitch-accent-graphs',
                             '{pitch-accent-graphs-jj}', 'pitch-accent-graphs-jj')
                       for v in field_mapping.values())
    log.info(f'[backfill] Media needed: audio={audio_needed}, images={image_needed}')
    
    # Fetch Anki's media directory path so we can save audio/images directly
    anki_media_dir = ''
    try:
        anki_media_dir = _anki_request(ankiconnect_url, 'getMediaDirPath')
        log.info(f'[backfill] Anki media directory: {anki_media_dir}')
        # Write CSS plugin file once
        _write_plugin_css(anki_media_dir)
    except Exception as e:
        log.warning(f'[backfill] Could not get Anki media directory (audio may fail to save): {e}')
        
    updated = 0
    skipped = 0
    errors = 0
    
    def push(state: str, current: int, total: int, msg: str = ''):
        on_progress({
            'state': state,
            'current': current,
            'total': total,
            'updated': updated,
            'skipped': skipped,
            'errors': errors,
            'msg': msg,
        })
        
    try:
        # 1. Collect all note IDs from the selected decks
        push('running', 0, 0, 'Fetching note IDs from selected decks...')
        all_note_ids: list[int] = []
        for deck in deck_names:
            t0 = time.perf_counter()
            ids = _anki_request(ankiconnect_url, 'findNotes', query=f'deck:"{deck}"')
            elapsed = (time.perf_counter() - t0) * 1000
            log.info(f'[perf] findNotes("{deck}"): {len(ids)} notes in {elapsed:.0f}ms')
            all_note_ids.extend(ids)
        total = len(all_note_ids)
        if total == 0:
            push('done', 0, 0, 'No notes found in selected decks.')
            return {'updated': 0, 'skipped': 0, 'errors': 0, 'total': 0}
            
        log.info(f'[perf] Total notes to process: {total}')
        push('running', 0, total, f'Found {total:,} notes. Fetching details...')

        # 2. Fetch note details in chunks to avoid overwhelming Anki
        notes_info = []
        FETCH_CHUNK = 500
        for i in range(0, total, FETCH_CHUNK):
            chunk = all_note_ids[i:i + FETCH_CHUNK]
            try:
                notes_info.extend(_anki_request(ankiconnect_url, 'notesInfo', notes=chunk))
            except Exception as e:
                log.error(f"[backfill] Failed to fetch notes chunk: {e}")
                
        # 3. Group by Unique Expression & Build existing fields dictionary for delta checks
        push('running', 0, total, 'Grouping by unique expressions...')
        unique_expressions = {}
        existing_notes_fields = {}
        
        for note in notes_info:
            note_id = note.get('noteId')
            if not note_id:
                continue
                
            fields = note.get('fields', {})
            
            # Cache existing field values for delta check
            existing_notes_fields[note_id] = {
                fname: fval.get('value', '').strip() if isinstance(fval, dict) else str(fval).strip()
                for fname, fval in fields.items()
            }
            
            expr_field_data = fields.get(expression_field, {})
            word = expr_field_data.get('value', '').strip() if isinstance(expr_field_data, dict) else ''
            
            if not word:
                skipped += 1
                continue
                
            reading = ''
            if reading_field:
                reading_field_data = fields.get(reading_field, {})
                reading = reading_field_data.get('value', '').strip() if isinstance(reading_field_data, dict) else ''
                
            if word not in unique_expressions:
                unique_expressions[word] = {'reading': reading, 'note_ids': []}
            unique_expressions[word]['note_ids'].append(note_id)

        unique_words = list(unique_expressions.keys())
        total_unique = len(unique_words)
        log.info(f"[backfill] Grouped {total} notes into {total_unique} unique expressions.")

        # 4. Process unique words concurrently
        updates_by_note_id = {}
        current_notes_processed = skipped  # start with already skipped
        
        # Pre-compute mapped markers (bare options) so we only fetch what is actually requested
        mapped_markers = {v.strip('{}') for v in field_mapping.values() if v and v != 'none'}
        
        def process_unique_word(word_str, data):
            yomitan_data = lookup_word(
                word_str, 
                data['reading'], 
                include_media=(audio_needed or image_needed),
                markers=list(mapped_markers)
            )
            if not yomitan_data:
                return (word_str, None)

            if anki_media_dir and (audio_needed or image_needed):
                _write_yomitan_media(yomitan_data, anki_media_dir,
                                     audio_needed=audio_needed,
                                     image_needed=image_needed)

            fields_data = yomitan_data.get('fields', [{}])[0]
            new_fields = {}
            for anki_field, handlebar in field_mapping.items():
                if handlebar == 'none' or not handlebar:
                    continue
                rendered = _render_field(handlebar, fields_data)
                if rendered is not None:
                    if isinstance(rendered, str) and 'class="yomitan-glossary"' in rendered:
                        rendered = _clean_yomitan_html_cached(rendered)
                    new_fields[anki_field] = rendered
            
            return (word_str, new_fields if new_fields else None)

        # Audio/image: cap at 5 workers (Yomitan API can be overwhelmed by too many concurrent media requests).
        # Text-only: up to 20 workers — API handles concurrent text lookups well.
        workers = min(5, total_unique) if (audio_needed or image_needed) else min(20, total_unique)
        workers = max(1, workers)
        log.info(f'[backfill] Using {workers} worker threads (audio_needed={audio_needed}, image_needed={image_needed})')
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=workers) as executor:
            futures = {executor.submit(process_unique_word, w, unique_expressions[w]): w for w in unique_words}
            
            for future in concurrent.futures.as_completed(futures):
                # --- OPTIMIZATION: Instant cancel support ---
                if cancel_event.is_set():
                    log.info('[backfill] Cancel requested - canceling remaining queued futures.')
                    for f in futures:
                        f.cancel()
                    break
                    
                if pause_event.is_set():
                    push('paused', current_notes_processed, total, 'Paused...')
                    while pause_event.is_set() and not cancel_event.is_set():
                        time.sleep(0.3)
                    if cancel_event.is_set():
                        for f in futures:
                            f.cancel()
                        break
                    push('running', current_notes_processed, total, 'Resumed processing...')

                word = futures[future]
                note_ids_for_word = unique_expressions[word]['note_ids']
                num_notes = len(note_ids_for_word)
                
                try:
                    res_word, new_fields = future.result()
                    if new_fields:
                        for nid in note_ids_for_word:
                            # --- OPTIMIZATION: Delta-check (Only write if fields actually changed) ---
                            existing = existing_notes_fields.get(nid, {})
                            changed_fields = {}
                            for k, v in new_fields.items():
                                if existing.get(k) != v:
                                    changed_fields[k] = v
                                    
                            if changed_fields:
                                updates_by_note_id[nid] = changed_fields
                                updated += 1
                            else:
                                skipped += 1
                    else:
                        skipped += num_notes
                except Exception as e:
                    log.error(f'[backfill] Error processing word "{word}": {e}')
                    errors += num_notes
                    
                current_notes_processed += num_notes
                push('running', current_notes_processed, total,
                     f'Processing unique word {current_notes_processed}/{total} notes mapped...')

        if cancel_event.is_set():
            push('cancelled', current_notes_processed, total, 'Cancelled.')
            return {'updated': updated, 'skipped': skipped, 'errors': errors, 'total': total}

        # 5. Bulk Update Anki in chunks of 150 (Only modified cards)
        if updates_by_note_id:
            push('running', current_notes_processed, total, f'Committing {len(updates_by_note_id)} updates to Anki...')
            update_actions = []
            for nid, fields in updates_by_note_id.items():
                update_actions.append({
                    "action": "updateNoteFields",
                    "params": {
                        "note": {
                            "id": nid,
                            "fields": fields
                        }
                    }
                })
                
            BATCH_SIZE = 150
            for i in range(0, len(update_actions), BATCH_SIZE):
                batch = update_actions[i:i+BATCH_SIZE]
                try:
                    res = _anki_request(ankiconnect_url, 'multi', actions=batch)
                    log.info(f"[backfill] Bulk updated batch of {len(batch)} cards.")
                    time.sleep(0.3)  # Let Anki breathe
                except Exception as e:
                    log.error(f"[backfill] Failed bulk update batch: {e}")
                    # If the bulk update fails, we reverse the tracked counts to be accurate.
                    errors += len(batch)
                    updated -= len(batch)

        t_total = (time.perf_counter() - t_start)
        log.info(f'[perf] Backfill complete: {updated} updated, {skipped} skipped, {errors} errors in {t_total:.1f}s')
        push('done', total, total, f'Backfill complete - {updated:,} updated, {skipped:,} skipped, {errors} errors.')
        
        return {'updated': updated, 'skipped': skipped, 'errors': errors, 'total': total}

    except Exception as e:
        tb = traceback.format_exc()
        log.error(f'[backfill] Fatal error: {e}\n{tb}')
        push('error', 0, 0, f'Fatal error: {e}')
        return {'updated': updated, 'skipped': skipped, 'errors': errors + 1, 'total': 0}
