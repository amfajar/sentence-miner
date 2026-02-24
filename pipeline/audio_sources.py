"""
Word audio fetcher — cascading priority across online audio sources.
Returns filepath of first valid audio (>1KB), or None if all fail.
"""

import os
import requests
import urllib.parse
from uuid import uuid4

# JPod101 returns an English "This audio clip is not available" MP3 when a word is missing.
# That error file is consistently ~52,288 bytes. We reject files in that size fingerprint range.
# Real word audio (short word = a few KB, long phrase = hundreds of KB) is outside this range.
_JPOD_ERROR_SIZE_MIN = 50_000   # bytes
_JPOD_ERROR_SIZE_MAX = 55_000   # bytes
_MIN_VALID_SIZE      =  3_000   # bytes — reject truly empty/corrupt downloads

# Headers to mimic a browser to avoid being blocked
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'audio/webm,audio/ogg,audio/wav,audio/*;q=0.9,application/ogg;q=0.7,video/*;q=0.6,*/*;q=0.5'
}


def _download(url: str, dest_path: str) -> bool:
    """Download url to dest_path. Returns True if download succeeded and file is valid."""
    try:
        resp = requests.get(url, timeout=12, headers=HEADERS, stream=True)
        if resp.status_code != 200:
            return False

        with open(dest_path, 'wb') as f:
            for chunk in resp.iter_content(8192):
                f.write(chunk)

        size = os.path.getsize(dest_path)

        # Reject too-small files (empty / corrupt)
        if size < _MIN_VALID_SIZE:
            os.remove(dest_path)
            return False

        # Reject JPod101 "audio not found" error file (fingerprinted by its known size)
        if _JPOD_ERROR_SIZE_MIN <= size <= _JPOD_ERROR_SIZE_MAX:
            print(f"[audio] Rejected JPod101 error-audio (size={size}b): {dest_path}")
            os.remove(dest_path)
            return False

        return True
    except Exception as e:
        print(f"[audio] Download error for {url}: {e}")
        if os.path.exists(dest_path):
            try: os.remove(dest_path)
            except: pass
        return False


def fetch_word_audio(lemma: str, reading: str, temp_dir: str) -> str | None:
    """
    Try audio sources in priority order.
    Returns local filepath of first valid audio file, or None.

    Sources:
    1. JPod101 (expression + reading)
    2. JPod101 (reading only)
    3. Jisho (reading)
    """
    os.makedirs(temp_dir, exist_ok=True)
    uid = uuid4().hex[:8]
    
    # Priority sources
    sources = [
        # Source 1: JPod101 with Kanji (Exact)
        {
            'name': 'jpod101-kanji',
            'url': f"https://assets.languagepod101.com/dictionary/japanese/audiomp3.php?kanji={urllib.parse.quote(lemma)}&kana={urllib.parse.quote(reading)}",
            'ext': 'mp3'
        },
        # Source 2: JPod101 Reading Fallback
        {
            'name': 'jpod101-kana',
            'url': f"https://assets.languagepod101.com/dictionary/japanese/audiomp3.php?kana={urllib.parse.quote(reading)}",
            'ext': 'mp3'
        },
        # Source 3: Jisho API
        {
            'name': 'jisho',
            'url': f"https://apps.jisho.org/api/v1/audio/{urllib.parse.quote(reading)}",
            'ext': 'mp3'
        }
    ]

    for source in sources:
        filename = f"audio_{source['name']}_{uid}.{source['ext']}"
        dest = os.path.join(temp_dir, filename)
        
        if _download(source['url'], dest):
            print(f"[audio] Success: {source['name']} for {lemma} ({reading})")
            return dest

    print(f"[audio] Failed to fetch audio for {lemma} ({reading})")
    return None
