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
_CACHE_MAX_AGE_SECS = 60 * 60 * 2  # 2 hours — cache older than this is force-refreshed

# Global mutex \u2014 only one full fetch runs at a time.
# A direct call will wait for an in-progress refresh instead of launching a second one.
_fetch_lock = threading.Lock()


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


# ── Cache helpers ─────────────────────────────────────────────────────────────

def _load_cache() -> tuple[set[str], int, int]:
    """
    Load known words from disk.
    Returns (expressions_set, cached_note_count, max_note_id).
    max_note_id is used for incremental refresh (only fetch notes with id > this).
    """
    try:
        if not os.path.exists(_CACHE_FILE):
            return set(), 0, 0
        age = time.time() - os.path.getmtime(_CACHE_FILE)
        if age > _CACHE_MAX_AGE_SECS:
            print(f'[anki] Cache expired ({age/3600:.1f}h old), will refresh in background.')
        with open(_CACHE_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
        words = set(data.get('words', []))
        count = data.get('note_count', 0)
        max_id = data.get('max_note_id', 0)
        print(f'[anki] Loaded {len(words):,} known words from cache (note_count={count:,}).')
        return words, count, max_id
    except Exception as e:
        print(f'[anki] Cache load failed: {e}')
        return set(), 0, 0


def _save_cache(words: set[str], note_count: int, max_note_id: int = 0):
    """Save known words to disk cache (JSON)."""
    try:
        os.makedirs(_CACHE_DIR, exist_ok=True)
        with open(_CACHE_FILE, 'w', encoding='utf-8') as f:
            json.dump({
                'words': list(words),
                'note_count': note_count,
                'max_note_id': max_note_id,
                'cache_version': 2,
            }, f, ensure_ascii=False)
        print(f'[anki] Cache saved: {len(words):,} words.')
    except Exception as e:
        print(f'[anki] Cache save failed: {e}')


def _extract_field_value(note: dict, field_name: str) -> str:
    """Extract a plain-text field value from a notesInfo result, stripping HTML."""
    fields = note.get('fields', {})
    field_data = fields.get(field_name)
    if not field_data:
        return ''
    value = field_data.get('value', '') if isinstance(field_data, dict) else str(field_data)
    if not value:
        return ''
    plain = re.sub(r'<[^>]+>', '', value).strip()
    plain = re.sub(r'\[([^\]]+)\]', '', plain).strip()
    return plain


def _fetch_expressions_for_type(
    url: str, note_type: str, field_name: str,
    only_ids: list[int] | None = None,
) -> tuple[set[str], int]:
    """
    Fetch expression field values for one note type.
    If only_ids is given, fetches only those IDs (for incremental refresh).
    Returns (expressions_set, max_note_id_seen).
    """
    try:
        if only_ids is None:
            # Full fetch: get all note IDs for this type
            note_ids = _request(url, 'findNotes', query=f'note:"{note_type}"')
        else:
            note_ids = only_ids

        if not note_ids:
            return set(), 0

        print(f'[anki] Fetching {len(note_ids):,} notes for \'{note_type}\' → field \'{field_name}\'')
        words = set()
        chunk_size = 1000
        for i in range(0, len(note_ids), chunk_size):
            chunk = note_ids[i:i + chunk_size]
            notes = _request(url, 'notesInfo', notes=chunk)
            for note in notes:
                val = _extract_field_value(note, field_name)
                if val:
                    words.add(val)

        max_id = max(note_ids) if note_ids else 0
        return words, max_id

    except Exception as e:
        print(f'[anki] Fetch failed for \'{note_type}\': {e}')
        return set(), 0


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


def create_deck(url: str, deck_name: str) -> bool:
    """Create a new deck in Anki (no-op if it already exists). Returns True on success."""
    try:
        _request(url, 'createDeck', deck=deck_name)
        return True
    except Exception as e:
        print(f'[anki] create_deck failed: {e}')
        return False


def get_all_known_expressions(
    url: str,
    targets: list | None = None,
    incremental_ids: dict[str, list[int]] | None = None,
    base_words: set[str] | None = None,
) -> tuple[set[str], int]:
    """
    Fetch known expressions from Anki note types.

    targets: list of [note_type_name, field_name] pairs.
    incremental_ids: {note_type: [new_note_ids]} — only fetch these IDs (incremental mode).
    base_words: existing expressions to merge into (used in incremental mode).

    Returns (expressions_set, max_note_id).

    Thread-safe: uses _fetch_lock so only one full fetch runs at a time.
    Parallel: each note type is fetched in a separate thread simultaneously.
    """
    if targets is None:
        targets = [
            ['Japanese sentences', 'VocabKanji'],
            ['Kaishi 1.5K',        'Word'],
            ['Kiku',               'Expression'],
        ]

    with _fetch_lock:
        expressions: set[str] = set(base_words) if base_words else set()
        total_notes = 0
        global_max_id = 0

        # ── Parallel fetch: one thread per note type ─────────────────────────
        per_type_results: dict[str, tuple[set[str], int]] = {}
        threads = []

        def _run(note_type, field_name, only_ids):
            words, mid = _fetch_expressions_for_type(url, note_type, field_name, only_ids)
            per_type_results[note_type] = (words, mid)

        for note_type, field_name in targets:
            only_ids = (incremental_ids or {}).get(note_type)
            t = threading.Thread(target=_run, args=(note_type, field_name, only_ids), daemon=True)
            threads.append(t)
            t.start()

        for t in threads:
            t.join()

        # ── Merge results ────────────────────────────────────────────────────
        for note_type, (words, mid) in per_type_results.items():
            expressions.update(words)
            total_notes += len(words)
            global_max_id = max(global_max_id, mid)

        print(f'[anki] Loaded {len(expressions):,} known expressions from {total_notes:,} notes.')
        _save_cache(expressions, total_notes, global_max_id)
        return expressions, global_max_id


def get_known_expressions_fast(url: str, targets: list | None = None,
                                on_refresh_done=None) -> set[str]:
    """
    Fast startup: returns cached words immediately, then optionally refreshes in background.

    Refresh logic:
    - If note count unchanged (±4): skip, cache is fresh.
    - If notes added: INCREMENTAL — only fetch new note IDs (> cached max_note_id).
    - If notes deleted: FULL refresh (can't know which words were removed otherwise).

    targets: forwarded to get_all_known_expressions(); from settings.
    on_refresh_done: optional callback(new_set) called when refresh completes.
    """
    cached_words, cached_count, cached_max_id = _load_cache()

    _targets = targets or [
        ['Japanese sentences', 'VocabKanji'],
        ['Kaishi 1.5K',        'Word'],
        ['Kiku',               'Expression'],
    ]

    def _refresh():
        try:
            # One OR query to count all target notes quickly
            note_type_parts = ' OR '.join(f'note:"{nt}"' for nt, _ in _targets)
            try:
                all_ids = _request(url, 'findNotes', query=note_type_parts)
                current_count = len(all_ids)
            except Exception:
                print('[anki] Background refresh: cannot reach AnkiConnect, skipping.')
                return

            delta = current_count - cached_count

            if abs(delta) < 5 and cached_words:
                print(f'[anki] Note count unchanged ({current_count:,}), cache is fresh.')
                return

            if delta > 0 and cached_words and cached_max_id > 0:
                # ── Incremental refresh ──────────────────────────────────────
                # We have a valid cache. Get all IDs per note type, filter to new ones only.
                print(f'[anki] {delta} new notes detected — incremental refresh.')
                incremental_ids: dict[str, list[int]] = {}
                all_new_ids = [nid for nid in all_ids if nid > cached_max_id]
                if not all_new_ids:
                    print('[anki] No truly new note IDs found, cache is fresh.')
                    return

                # Map new IDs back to their note type for targeted fetching
                for note_type, _ in _targets:
                    type_ids = _request(url, 'findNotes', query=f'note:"{note_type}"')
                    new_for_type = [nid for nid in type_ids if nid > cached_max_id]
                    if new_for_type:
                        incremental_ids[note_type] = new_for_type

                new_words, new_max_id = get_all_known_expressions(
                    url, targets=_targets,
                    incremental_ids=incremental_ids,
                    base_words=cached_words,
                )
            else:
                # ── Full refresh ─────────────────────────────────────────────
                print(f'[anki] Note count changed ({cached_count:,} → {current_count:,}), full refresh.')
                new_words, new_max_id = get_all_known_expressions(url, targets=_targets)

            if on_refresh_done and new_words:
                on_refresh_done(new_words)

        except Exception as e:
            print(f'[anki] Background refresh failed: {e}')

    threading.Thread(target=_refresh, daemon=True).start()
    return cached_words


def fetch_all_expressions_in_deck(url: str, deck_name: str) -> set[str]:
    """
    Bulk pre-fetch all Expression field values from the target deck.
    Returns a set of expression strings.

    Called ONCE at the start of a mining run to replace N per-word
    expression_exists_in_deck() HTTP calls with a single bulk query.
    """
    try:
        note_ids = _request(url, 'findNotes', query=f'deck:"{deck_name}"')
        if not note_ids:
            return set()
        expressions = set()
        chunk_size = 1000
        for i in range(0, len(note_ids), chunk_size):
            chunk = note_ids[i:i + chunk_size]
            notes = _request(url, 'notesInfo', notes=chunk)
            for note in notes:
                fields = note.get('fields', {})
                expr_field = fields.get('Expression')
                if not expr_field:
                    continue
                value = expr_field.get('value', '') if isinstance(expr_field, dict) else str(expr_field)
                value = re.sub(r'<[^>]+>', '', value).strip()
                value = re.sub(r'\[([^\]]+)\]', '', value).strip()
                if value:
                    expressions.add(value)
        print(f"[anki] Pre-fetched {len(expressions):,} expressions from deck '{deck_name}'.")
        return expressions
    except Exception as e:
        print(f"[anki] fetch_all_expressions_in_deck failed: {e}")
        return set()


def upload_media(url: str, filepath: str, target_name: str | None = None) -> str:
    """
    Upload a file to Anki's media collection via AnkiConnect.
    If target_name is provided, it will be saved as that name instead of the local basename.
    Returns the filename as stored.
    Deletes the local file after successful upload.
    """
    filename = target_name if target_name else os.path.basename(filepath)
    with open(filepath, 'rb') as f:
        data = base64.b64encode(f.read()).decode()

    stored_name = _request(url, 'storeMediaFile', filename=filename, data=data)
    try:
        os.remove(filepath)
    except Exception:
        pass
    return stored_name or filename


def expression_exists_in_deck(url: str, deck_name: str, expression: str) -> bool:
    """
    Check if a note with the given Expression already exists in deck_name,
    regardless of note type. Uses AnkiConnect findNotes query.
    Returns True if duplicate found.
    """
    try:
        # Escape double quotes inside expression for the query string
        safe_expr = expression.replace('"', '\\"')
        query = f'deck:"{deck_name}" Expression:"{safe_expr}"'
        note_ids = _request(url, 'findNotes', query=query)
        return bool(note_ids)
    except Exception:
        return False  # on error, don't block the add


def add_note(url: str, deck_name: str, note_type: str,
             fields: dict, tags: list[str],
             allow_duplicate: bool = False) -> int:
    """
    Add a single note to Anki. Returns note ID, or -1 if duplicate.
    Use add_notes_batch() for bulk mining — addNote one-by-one causes ~2s
    Anki sync overhead per note.
    """
    try:
        note_id = _request(url, 'addNote', note={
            'deckName': deck_name,
            'modelName': note_type,
            'fields': fields,
            'tags': tags,
            'options': {
                'allowDuplicate': False,
                'duplicateScope': 'deck',
            },
        })
        return note_id
    except RuntimeError as e:
        if 'duplicate' in str(e).lower():
            return -1
        raise


def add_notes_batch(url: str, notes: list[dict]) -> list:
    """
    Add multiple notes in ONE AnkiConnect request ('addNotes' action).

    Each element of `notes` must be a full note dict:
        {'deckName': str, 'modelName': str, 'fields': dict,
         'tags': list, 'options': {'allowDuplicate': bool, 'duplicateScope': str}}

    Returns list[int | None] — None means rejected (duplicate or error).

    Replaces N sequential addNote calls, eliminating Anki's ~2s per-note sync
    overhead: 89 notes → ~2s total instead of ~3 minutes.
    """
    if not notes:
        return []
    try:
        result = _request(url, 'addNotes', notes=notes)
        return result if result is not None else [None] * len(notes)
    except Exception as e:
        print(f'[anki] add_notes_batch failed: {e}')
        return [None] * len(notes)
