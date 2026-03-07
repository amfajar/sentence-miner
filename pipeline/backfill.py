"""
pipeline/backfill.py — Backfill logic for updating existing Anki cards via Yomitan API.
All Yomitan API calls, chunk processing, pause/cancel management, and progress
reporting live here. No UI coupling.
"""
import base64
import json
import logging
import time
import traceback
import traceback
import urllib.request
import urllib.error
from typing import Callable, Optional
import threading
import concurrent.futures
import os
import random
import urllib.parse
from bs4 import BeautifulSoup
log = logging.getLogger('SentenceMiner.backfill')
# ── Constants ──────────────────────────────────────────────────────────────────
YOMITAN_BASE_URL = 'http://127.0.0.1:19633'
CHUNK_SIZE = 150
# All handlebar markers that the Yomitan API accepts.
# These are the BARE names (no braces) as expected by POST /ankiFields.
# The UI shows them with braces for clarity, but API calls use bare names.
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
        req = urllib.request.Request(url, method='POST')
        with urllib.request.urlopen(req, timeout=3) as resp:
            log.info(f'[backfill] Yomitan check: POST {url} -> status={resp.status} (API is up)')
            return True
    except urllib.error.HTTPError as e:
        # Server responded with an HTTP error — it IS running.
        log.info(f'[backfill] Yomitan check: HTTP {e.code} (server running, API is up)')
        return True
    except Exception as e:
        log.info(f'[backfill] Yomitan check: failed -- {type(e).__name__}: {e}')
        return False
_debug_logged_first = False  # Log full request/response for first word only
def lookup_word(word: str, reading: str = '', include_media: bool = True, max_retries: int = 3) -> Optional[dict]:
    """
    Call Yomitan API POST /ankiFields.
    Returns the FULL response dict (including 'fields', 'audioMedia', 'dictionaryMedia'),
    or None if not found / error.
    """
    global _debug_logged_first
    
    url = f'{YOMITAN_BASE_URL}/ankiFields'
    request_body = {
        'text': word,
        'type': 'term',
        'markers': HANDLEBAR_OPTIONS_BARE,
        'maxEntries': 1,
        'includeMedia': include_media,
    }
    if reading:
        request_body['reading'] = reading
    body_bytes = json.dumps(request_body, ensure_ascii=False).encode('utf-8')
    
    for attempt in range(max_retries):
        try:
            req = urllib.request.Request(
                url,
                data=body_bytes,
                headers={'Content-Type': 'application/json'},
                method='POST',
            )
            with urllib.request.urlopen(req, timeout=15) as resp:
                status = resp.status
                raw = resp.read()
                data = json.loads(raw.decode('utf-8'))
            
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
import base64
import os

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

def _clean_yomitan_html(html: str) -> str:
    """
    Remove bloated <style> tags, inline style attributes, and attribution noise
    from Yomitan dictionary output so our custom CSS can apply cleanly.
    """
    try:
        soup = BeautifulSoup(html, 'html.parser')

        # 1. Remove all generic <style> blocks
        for tag in soup.find_all('style'):
            tag.decompose()

        # 2. Remove inline style="..." attributes from ALL elements
        # (Yomitan ships hardcoded styles that break our clean CSS)
        for tag in soup.find_all(True):
            if 'style' in tag.attrs:
                del tag.attrs['style']

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
    payload = json.dumps({'action': action, 'version': 6, 'params': params}).encode('utf-8')
    req = urllib.request.Request(url, data=payload, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=30) as resp:
        result = json.loads(resp.read().decode('utf-8'))
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
    return yomitan_data.get(key)
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
        push('running', 0, total, f'Found {total:,} notes. Starting backfill...')
        # 2. Process in chunks
        chunks = [all_note_ids[i:i + CHUNK_SIZE] for i in range(0, total, CHUNK_SIZE)]
        total_chunks = len(chunks)
        current = 0
        for chunk_idx, chunk in enumerate(chunks):
            if cancel_event.is_set():
                log.info('[backfill] Cancel requested - stopping after chunk.')
                push('cancelled', current, total, f'Cancelled after {current:,}/{total:,} cards.')
                break
            # Check pause (waits until resumed)
            if pause_event.is_set():
                push('paused', current, total, f'Paused at {current:,}/{total:,} cards...')
                log.info('[backfill] Paused - waiting for resume.')
                while pause_event.is_set() and not cancel_event.is_set():
                    time.sleep(0.3)
                if cancel_event.is_set():
                    log.info('[backfill] Cancel during pause - stopping.')
                    push('cancelled', current, total, f'Cancelled after {current:,}/{total:,} cards.')
                    break
                log.info('[backfill] Resumed.')
            chunk_num = chunk_idx + 1
            push('running', current, total,
                 f'Processing chunk {chunk_num}/{total_chunks} ({current:,} / {total:,} cards)...')
            try:
                t0 = time.perf_counter()
                # a. Fetch note details
                notes_info = _anki_request(ankiconnect_url, 'notesInfo', notes=chunk)
                t_fetch = (time.perf_counter() - t0) * 1000
                # b+c+d. For each note, look up the expression field, call Yomitan, build update
                updates = []
                
                # Helper function for the thread pool
                def process_note(note):
                    note_fields = note.get('fields', {})
                    # Read the configured expression field
                    expr_field_data = note_fields.get(expression_field, {})
                    word = expr_field_data.get('value', '').strip() if isinstance(expr_field_data, dict) else ''
                    if not word:
                        return ('skipped', note.get('noteId'), 'Expression field empty')

                    # Optionally read the reading field
                    reading = ''
                    if reading_field:
                        reading_field_data = note_fields.get(reading_field, {})
                        reading = reading_field_data.get('value', '').strip() if isinstance(reading_field_data, dict) else ''

                    # Call Yomitan API
                    yomitan_data = lookup_word(
                        word, 
                        reading, 
                        include_media=(audio_needed or image_needed)
                    )
                    if not yomitan_data:
                        return ('skipped', note.get('noteId'), f'Not found: {word}')

                    # Write Yomitan media if needed
                    if anki_media_dir and (audio_needed or image_needed):
                        _write_yomitan_media(yomitan_data, anki_media_dir,
                                             audio_needed=audio_needed,
                                             image_needed=image_needed)

                    # Extract fields for rendering
                    fields_data = yomitan_data.get('fields', [{}])[0]
                    new_fields = {}
                    for anki_field, handlebar in field_mapping.items():
                        if handlebar == 'none' or not handlebar:
                            continue
                        rendered = _render_field(handlebar, fields_data)
                        if rendered is not None:
                            if isinstance(rendered, str) and 'class="yomitan-glossary"' in rendered:
                                rendered = _clean_yomitan_html(rendered)
                            new_fields[anki_field] = rendered
                    
                    if new_fields:
                        return ('update', note.get('noteId'), new_fields)
                    else:
                        return ('skipped', note.get('noteId'), 'No fields rendered')

                # Executing Yomitan lookups concurrently.
                workers = min(5, len(notes_info)) if (audio_needed or image_needed) else min(10, len(notes_info))
                completed_in_chunk = 0
                
                with concurrent.futures.ThreadPoolExecutor(max_workers=workers) as executor:
                    
                    # Wrapper to add a slight random stagger before hitting the API
                    def process_with_stagger(n):
                        time.sleep(random.uniform(0.01, 1.0))
                        return process_note(n)

                    futures = {executor.submit(process_with_stagger, note): note for note in notes_info}
                    for future in concurrent.futures.as_completed(futures):
                        try:
                            res_type, note_id, data = future.result()
                            if res_type == 'update':
                                updates.append({'id': note_id, 'fields': data})
                                updated += 1
                            else:
                                skipped += 1
                        except Exception as e:
                            log.error(f'[backfill] Error processing note {futures[future].get("noteId")}: {e}')
                            errors += 1
                        
                        completed_in_chunk += 1
                        push('running', current + completed_in_chunk, total,
                             f'Processing chunk {chunk_num}/{total_chunks} ({current + completed_in_chunk:,} / {total:,} cards)...')
                             
                # e. Batch update via AnkiConnect
                if updates:
                    t1 = time.perf_counter()
                    for upd in updates:
                        payload = {'id': upd['id'], 'fields': upd['fields']}
                        if updated == 1 and upd == updates[0]:  # Only log first update logic
                            log.info(f'[backfill] DEBUG update note ID={upd["id"]}')
                            log.info(f'[backfill]   fields to update: {json.dumps(upd["fields"], ensure_ascii=False)}')
                        
                        try:
                            res = _anki_request(ankiconnect_url, 'updateNoteFields', note=payload)
                            if updated == 1 and upd == updates[0]:
                                log.info(f'[backfill]   AnkiConnect response: {res}')
                        except Exception as e:
                            log.error(f'[backfill] Failed to update note {upd["id"]}: {e}')
                            errors += 1
                            updated -= 1
                    t_update = (time.perf_counter() - t1) * 1000
                    log.info(f'[perf] Chunk {chunk_num}: fetch {t_fetch:.0f}ms, '
                             f'update {len(updates)} notes {t_update:.0f}ms')
            except Exception as e:
                errors += 1
                tb = traceback.format_exc()
                log.error(f'[backfill] Error in chunk {chunk_num}: {e}\n{tb}')
                # Continue to next chunk
            current += len(chunk)
            push('running', current, total,
                 f'Chunk {chunk_num}/{total_chunks} done ({current:,} / {total:,})...')
        else:
            # Loop completed normally (no break)
            t_total = (time.perf_counter() - t_start)
            log.info(f'[perf] Backfill complete: {updated} updated, {skipped} skipped, '
                     f'{errors} errors in {t_total:.1f}s')
            push('done', total, total,
                 f'Backfill complete - {updated:,} updated, {skipped:,} skipped, {errors} errors.')
        return {'updated': updated, 'skipped': skipped, 'errors': errors, 'total': total}
    except Exception as e:
        tb = traceback.format_exc()
        log.error(f'[backfill] Fatal error: {e}\n{tb}')
        push('error', 0, 0, f'Fatal error: {e}')
        return {'updated': updated, 'skipped': skipped, 'errors': errors + 1, 'total': 0}
