"""
AnkiConnect HTTP API wrapper.
All requests are POST to http://localhost:8765 with JSON body.

Startup optimisation: get_known_expressions_fast() loads from disk cache instantly,
then refreshes in background if note count changed.
"""

import json
import base64
import os
import re
import threading
import time
import requests


_CACHE_DIR = os.path.join(os.path.expanduser('~'), '.sentence_miner_cache')
_CACHE_FILE = os.path.join(_CACHE_DIR, 'known_words.json')
_CACHE_MAX_AGE_SECS = 60 * 60 * 2  # 2 hours


# ── Internal helpers ──────────────────────────────────────────────────────────

def _request(url: str, action: str, **params) -> any:
    """Base AnkiConnect request. Raises on error."""
    payload = {'action': action, 'version': 6}
    if params:
        payload['params'] = params
    try:
        response = requests.post(url, json=payload, timeout=10)
        response.raise_for_status()
        data = response.json()
        if data.get('error'):
            raise RuntimeError(f"AnkiConnect error: {data['error']}")
        return data['result']
    except requests.exceptions.ConnectionError:
        raise RuntimeError("Cannot connect to AnkiConnect. Is Anki open?")
    except requests.exceptions.Timeout:
        raise RuntimeError("AnkiConnect request timed out.")


def _load_cache() -> tuple[set[str], int]:
    """Load known words from disk cache. Returns (expressions_set, cached_note_count)."""
    try:
        if not os.path.exists(_CACHE_FILE):
            return set(), 0
        age = time.time() - os.path.getmtime(_CACHE_FILE)
        if age > _CACHE_MAX_AGE_SECS:
            print(f"[anki] Cache expired ({age/3600:.1f}h old), will refresh in background.")
        with open(_CACHE_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
        words = set(data.get('words', []))
        count = data.get('note_count', 0)
        print(f"[anki] Loaded {len(words):,} known words from cache (note_count={count:,}).")
        return words, count
    except Exception as e:
        print(f"[anki] Cache load failed: {e}")
        return set(), 0


def _save_cache(words: set[str], note_count: int):
    """Save known words to disk cache."""
    try:
        os.makedirs(_CACHE_DIR, exist_ok=True)
        with open(_CACHE_FILE, 'w', encoding='utf-8') as f:
            json.dump({'words': list(words), 'note_count': note_count}, f, ensure_ascii=False)
        print(f"[anki] Cache saved: {len(words):,} words.")
    except Exception as e:
        print(f"[anki] Cache save failed: {e}")


# ── Public API ────────────────────────────────────────────────────────────────

def check_connection(url: str) -> bool:
    """Returns True if AnkiConnect responds with a valid version."""
    try:
        result = _request(url, 'version')
        return isinstance(result, int) and result >= 6
    except Exception:
        return False


def get_deck_names(url: str) -> list[str]:
    """Return list of all deck names in Anki."""
    try:
        return sorted(_request(url, 'deckNames'))
    except Exception:
        return []


def get_model_names(url: str) -> list[str]:
    """Return list of all note type (model) names in Anki."""
    try:
        return sorted(_request(url, 'modelNames'))
    except Exception:
        return []


def get_all_known_expressions(url: str) -> set[str]:
    """
    Fetch known expressions from specific notetypes only.
    Each notetype has a designated field that holds the vocabulary term.

    Saves result to disk cache automatically.
    """
    # (notetype name, field to check)
    TARGETS = [
        ('Japanese sentences', 'VocabKanji'),
        ('Kaishi 1.5K',        'Word'),
        ('Kiku',               'Expression'),
    ]

    expressions = set()
    total_notes = 0

    try:
        for note_type, field_name in TARGETS:
            query = f'note:"{note_type}"'
            try:
                note_ids = _request(url, 'findNotes', query=query)
            except Exception as e:
                print(f"[anki] findNotes failed for '{note_type}': {e}")
                continue

            if not note_ids:
                print(f"[anki] No notes found for notetype '{note_type}'")
                continue

            total_notes += len(note_ids)
            print(f"[anki] Fetching {len(note_ids):,} notes for '{note_type}' → field '{field_name}'")

            chunk_size = 1000
            for i in range(0, len(note_ids), chunk_size):
                chunk = note_ids[i:i + chunk_size]
                notes = _request(url, 'notesInfo', notes=chunk)
                for note in notes:
                    fields = note.get('fields', {})
                    field_data = fields.get(field_name)
                    if not field_data:
                        continue
                    value = field_data.get('value', '') if isinstance(field_data, dict) else str(field_data)
                    if not value:
                        continue
                    # Strip HTML tags and Anki furigana bracket format [reading]
                    plain = re.sub(r'<[^>]+>', '', value).strip()
                    plain = re.sub(r'\[([^\]]+)\]', '', plain).strip()
                    if plain:
                        expressions.add(plain)

        print(f"[anki] Loaded {len(expressions):,} known expressions from {total_notes:,} notes.")
        _save_cache(expressions, total_notes)
        return expressions

    except Exception as e:
        print(f"[anki] get_all_known_expressions failed: {e}")
        return set()


def get_known_expressions_fast(url: str, on_refresh_done=None) -> set[str]:
    """
    Fast startup: returns cached words immediately, refreshes in background.

    Flow:
    1. Load disk cache → instant result returned to caller
    2. Background thread checks current note count vs cached count
    3. If count changed by >=5, does a full refresh and calls on_refresh_done(new_set)

    on_refresh_done: optional callback(new_set) called when background refresh finishes.
    """
    cached_words, cached_count = _load_cache()

    def _refresh():
        try:
            # Count notes across target notetypes only (must match get_all_known_expressions)
            target_queries = [
                'note:"Japanese sentences"',
                'note:"Kaishi 1.5K"',
                'note:"Kiku"',
            ]
            current_count = 0
            for q in target_queries:
                try:
                    ids = _request(url, 'findNotes', query=q)
                    current_count += len(ids)
                except Exception:
                    pass

            if abs(current_count - cached_count) < 5 and cached_words:
                print(f"[anki] Note count unchanged ({current_count:,}), cache is fresh.")
                return
            print(f"[anki] Note count changed ({cached_count:,} → {current_count:,}), refreshing...")
            new_words = get_all_known_expressions(url)
            if on_refresh_done and new_words:
                on_refresh_done(new_words)
        except Exception as e:
            print(f"[anki] Background refresh failed: {e}")

    threading.Thread(target=_refresh, daemon=True).start()
    return cached_words


def upload_media(url: str, filepath: str) -> str:
    """
    Upload a file to Anki's media collection via AnkiConnect.
    Returns the filename as stored.
    Deletes the local file after successful upload.
    """
    filename = os.path.basename(filepath)
    with open(filepath, 'rb') as f:
        data = base64.b64encode(f.read()).decode()

    stored_name = _request(url, 'storeMediaFile', filename=filename, data=data)
    try:
        os.remove(filepath)
    except Exception:
        pass
    return stored_name or filename


def add_note(url: str, deck_name: str, note_type: str,
             fields: dict, tags: list[str]) -> int:
    """
    Add a note to Anki. Returns note ID, or -1 if duplicate.
    """
    try:
        note_id = _request(url, 'addNote', note={
            'deckName': deck_name,
            'modelName': note_type,
            'fields': fields,
            'tags': tags,
            'options': {
                'allowDuplicate': False,
                'duplicateScope': 'collection',
            },
        })
        return note_id
    except RuntimeError as e:
        if 'duplicate' in str(e).lower():
            return -1
        raise
