"""
Api class — the bridge between the JS frontend and Python backend.
Every public method is callable from JS via window.pywebview.api.method().
"""

import json
import os
import re
import threading
import time
import hashlib
import queue
from concurrent.futures import ThreadPoolExecutor
from dataclasses import asdict
from pathlib import Path
from uuid import uuid4

import webview

import settings as settings_module
from pipeline import nlp, furigana, dictionary, frequency, anki, audio_sources, media, youtube, epub
from pipeline.dictionary import DictionaryDB
from pipeline.frequency import FrequencyDB
from pipeline.youtube import NoManualSubtitlesError


def _strip_ass_tags(text: str) -> str:
    """Strip ASS/SSA override tags like {\\an8}, {\\pos(...)}."""
    return re.sub(r'\{[^}]*\}', '', text)


def _best_reading(jitendex_db, freq_db, lemma: str, sudachi_reading: str) -> str:
    """
    Pick the best reading for `lemma` by frequency rank.

    Algorithm:
      1. Collect ALL readings Jitendex has for this lemma (e.g. 本屋 → [ほんや, もとや])
      2. Add the SudachiPy reading as an extra candidate
      3. Deduplicate while preserving order
      4. Return the candidate with the lowest frequency rank

    Examples:
      本屋: Jitendex [もとや(200K), ほんや(8K)] + SudachiPy ほんや → ほんや ✓
      好き: Jitendex [すき(100), ずき(14K)] + SudachiPy ずき → すき ✓
      言う: Jitendex [いう(50)] + SudachiPy ゆう → いう ✓
    """
    jitendex_readings = dictionary.lookup_all_readings(jitendex_db, lemma)  # all Jitendex readings, hiragana
    candidates = list(dict.fromkeys(filter(None, jitendex_readings + [sudachi_reading])))
    return frequency.get_best_reading(freq_db, candidates) or sudachi_reading


def _parse_srt(srt_path: str, offset_ms: int, media_path: str, label: str) -> list[dict]:
    import srt
    with open(srt_path, encoding='utf-8', errors='replace') as f:
        content = f.read()
    if srt_path.lower().endswith('.ass'):
        content = _strip_ass_tags(content)
    subs = list(srt.parse(content))
    out = []
    for sub in subs:
        text = sub.content.replace('\n', '　').strip()
        start_ms = max(0, int(sub.start.total_seconds() * 1000) - offset_ms)
        end_ms = max(0, int(sub.end.total_seconds() * 1000) - offset_ms)
        out.append({
            'text': text, 'start_ms': start_ms, 'end_ms': end_ms,
            'media_path': media_path, 'source_name': label
        })
    return out


class Api:
    def __init__(self):
        self._settings = settings_module.load()
        self._scan_cache: dict = {}  # lemma -> candidate data, populated by scan_candidates
        self._known_words: set[str] = set()
        self._jitendex: DictionaryDB | None = None
        self._freq_dict: FrequencyDB | None = None
        self._running = False
        self._nlp_ready = False

    # ── Settings ──────────────────────────────────────────────────────────────

    def get_settings(self) -> dict:
        """Return current settings as a plain dict for the frontend."""
        return asdict(self._settings)

    def save_settings(self, data: dict) -> None:
        """Save settings from the frontend dict."""
        for k, v in data.items():
            if hasattr(self._settings, k):
                setattr(self._settings, k, v)
        settings_module.save(self._settings)

    def import_dictionary(self, src_path: str, dict_type: str) -> dict:
        """
        Copy a dictionary zip into the app's data folder.
        dict_type: 'jitendex' | 'freq'
        Returns {ok, path, error}.
        """
        try:
            dest = settings_module.import_dictionary(src_path, dict_type)
            if dict_type == 'jitendex':
                self._settings.jitendex_path = dest
            else:
                self._settings.freq_dict_path = dest
            settings_module.save(self._settings)
            return {'ok': True, 'path': dest}
        except Exception as e:
            return {'ok': False, 'error': str(e)}

    # ── Anki ──────────────────────────────────────────────────────────────────

    def test_anki_connection(self) -> dict:
        """Test AnkiConnect connectivity and return known word count."""
        try:
            ok = anki.check_connection(self._settings.ankiconnect_url)
            if not ok:
                return {'ok': False, 'error': 'AnkiConnect not responding.'}
            decks = anki.get_deck_names(self._settings.ankiconnect_url)
            models = anki.get_model_names(self._settings.ankiconnect_url)
            # Reuse in-memory known words if already loaded by background refresh.
            # Only do a full fetch when the set is empty (first app launch, cache miss).
            if not self._known_words:
                self._known_words, _ = anki.get_all_known_expressions(
                    self._settings.ankiconnect_url,
                    targets=self._settings.known_word_targets,
                )
            return {
                'ok': True,
                'known_count': len(self._known_words),
                'decks': decks,
                'models': models,
            }
        except Exception as e:
            return {'ok': False, 'error': str(e)}

    def clear_anki_cache(self) -> dict:
        """Delete the Anki known-words disk cache so next startup re-fetches from Anki."""
        cache_dir = os.path.join(os.path.expanduser('~'), '.sentence_miner_cache')
        cache_file = os.path.join(cache_dir, 'known_words.json')
        try:
            if os.path.exists(cache_file):
                os.remove(cache_file)
                self._known_words = set()
                return {'ok': True, 'msg': 'Anki cache cleared. Restart app to reload from Anki.'}
            else:
                return {'ok': True, 'msg': 'No cache file found (already clean).'}
        except Exception as e:
            return {'ok': False, 'error': str(e)}

    def get_anki_data(self) -> dict:
        """Return list of deck names and model names from Anki."""
        try:
            decks = anki.get_deck_names(self._settings.ankiconnect_url)
            models = anki.get_model_names(self._settings.ankiconnect_url)
            return {'ok': True, 'decks': decks, 'models': models}
        except Exception as e:
            return {'ok': False, 'error': str(e), 'decks': [], 'models': []}

    def create_deck(self, deck_name: str) -> dict:
        """Create a new deck in Anki (no-op if it already exists). Returns {ok, decks}."""
        deck_name = deck_name.strip()
        if not deck_name:
            return {'ok': False, 'error': 'Deck name cannot be empty.'}
        try:
            ok = anki.create_deck(self._settings.ankiconnect_url, deck_name)
            decks = anki.get_deck_names(self._settings.ankiconnect_url)
            if ok:
                # Save the new deck as the active deck
                self._settings.deck_name = deck_name
                settings_module.save(self._settings)
            return {'ok': ok, 'decks': decks, 'deck_name': deck_name}
        except Exception as e:
            return {'ok': False, 'error': str(e)}

    # ── Initialize ────────────────────────────────────────────────────────────

    def initialize(self) -> dict:
        """
        Load dictionaries and fetch known words.
        Pushes status updates via evaluate_js.
        """
        def _push(msg: str):
            js = f"onProgress({json.dumps({'type': 'status', 'msg': msg}, ensure_ascii=False)})"
            try:
                webview.windows[0].evaluate_js(js)
            except Exception:
                pass

        errors = []

        # SudachiPy init
        if not self._nlp_ready:
            _push("Initializing Japanese tokenizer (SudachiPy)...")
            try:
                nlp.init()
                self._nlp_ready = True
                _push("Tokenizer ready.")
            except Exception as e:
                errors.append(f"SudachiPy init failed: {e}")

        # Jitendex
        jitendex_path = self._settings.jitendex_path
        if jitendex_path and os.path.exists(jitendex_path):
            _push(f"Loading Jitendex dictionary...")
            try:
                self._jitendex = dictionary.load(jitendex_path)
                _push(f"Jitendex: {len(self._jitendex):,} entries loaded.")
            except Exception as e:
                errors.append(f"Jitendex load failed: {e}")
        else:
            _push("⚠ Jitendex not configured. Go to Settings to import it.")

        # JPDB frequency
        freq_path = self._settings.freq_dict_path
        if freq_path and os.path.exists(freq_path):
            _push(f"Loading JPDB frequency dictionary...")
            try:
                self._freq_dict = frequency.load(freq_path)
                _push(f"JPDB freq: {len(self._freq_dict):,} entries loaded.")
            except Exception as e:
                errors.append(f"JPDB freq load failed: {e}")
        else:
            _push("⚠ JPDB frequency dictionary not configured.")

        # Anki
        _push("Connecting to Anki...")
        try:
            ok = anki.check_connection(self._settings.ankiconnect_url)
            if ok:
                decks = anki.get_deck_names(self._settings.ankiconnect_url)
                models = anki.get_model_names(self._settings.ankiconnect_url)

                # Init SudachiPy tokenizer eagerly so the first scan doesn't
                # pay the ~3s cold-start cost during the user's scan.
                if not self._nlp_ready:
                    _push("Initializing tokenizer (SudachiPy)...")
                    nlp.init()
                    self._nlp_ready = True

                # Fast: load from cache immediately, refresh in background
                def _on_refresh(new_words: set):
                    self._known_words = new_words
                    _push(f"Anki cache refreshed \u2014 {len(new_words):,} expressions.")

                self._known_words = anki.get_known_expressions_fast(
                    self._settings.ankiconnect_url,
                    targets=self._settings.known_word_targets,
                    on_refresh_done=_on_refresh
                )
                _push(f"Anki connected \u2014 {len(self._known_words):,} expressions (from cache).")

                result = {
                    'ok': True,
                    'known_count': len(self._known_words),
                    'decks': decks,
                    'models': models,
                    'warnings': errors,
                    'settings': asdict(self._settings)
                }

                # Push deck/model info so JS can populate dropdowns immediately
                try:
                    js = f"updateAnkiStatus({json.dumps(result, ensure_ascii=False)})"
                    webview.windows[0].evaluate_js(js)
                except Exception:
                    pass
                return result
            else:
                msg = "Anki not detected. Please open Anki and ensure AnkiConnect is installed."
                _push(f"⚠ {msg}")
                return {'ok': False, 'error': msg, 'decks': [], 'models': [], 'settings': asdict(self._settings)}
        except Exception as e:
            return {'ok': False, 'error': str(e), 'decks': [], 'models': [], 'settings': asdict(self._settings)}

    # ── Mining ────────────────────────────────────────────────────────────────

    def start_processing(self, payload: dict) -> None:
        """Start the mining pipeline in a background thread."""
        if self._running:
            return
        t = threading.Thread(
            target=self._process_thread,
            args=(payload, self._settings),
            daemon=True,
        )
        t.start()

    def stop_processing(self) -> None:
        """Signal the processing thread to stop."""
        self._running = False

    def _push(self, data: dict):
        """Push a progress update to the frontend."""
        js = f"onProgress({json.dumps(data, ensure_ascii=False)})"
        try:
            webview.windows[0].evaluate_js(js)
        except Exception as e:
            print(f"[api] evaluate_js error: {e}")

    def _process_thread(self, payload: dict, s: settings_module.Settings):
        self._running = True
        push = self._push

        try:
            import srt
            input_type = payload.get('input_type', 'media')

            # ── STEP 1: Get input & STEP 2: Parse into sentences ─────────────
            media_path = None  # global media if not batch
            srt_path = None
            sentences = []

            if input_type == 'youtube':
                push({'type': 'status', 'msg': 'Downloading YouTube video...'})
                media_path, srt_path = youtube.download(
                    payload['youtube_url'], s.temp_dir
                )
                push({'type': 'status', 'msg': f'Downloaded: {os.path.basename(media_path)}'})
                # For youtube, offset is 0
                sentences.extend(_parse_srt(srt_path, 0, media_path, os.path.basename(media_path)))
                
            elif input_type == 'media':
                media_path = payload.get('media_path', '')
                srt_path = payload.get('srt_path', '')
                if not os.path.exists(media_path):
                    push({'type': 'error', 'msg': f'Media file not found: {media_path}'})
                    return
                offset_ms = int(payload.get('sub_offset_ms', 0))
                sentences.extend(_parse_srt(srt_path, offset_ms, media_path, os.path.basename(media_path)))
                
            elif input_type == 'batch':
                pairs = payload.get('pairs', [])
                total_pairs = len(pairs)
                offset_ms = int(payload.get('sub_offset_ms', 0))
                for i, pair in enumerate(pairs):
                    mp = pair.get('media_path')
                    sp = pair.get('srt_path')
                    lbl = pair.get('label', os.path.basename(mp))
                    push({'type': 'status', 'msg': f'Parsing episode {i+1}/{total_pairs} — {lbl}...'})
                    sentences.extend(_parse_srt(sp, offset_ms, mp, lbl))
                    
            else:  # epub / txt
                text_path = payload.get('epub_path', '')
                char_start = int(payload.get('char_start') or 0)
                char_end_raw = payload.get('char_end')
                char_end = int(char_end_raw) if char_end_raw else None
                range_desc = f' (chars {char_start:,}–{char_end:,})' if char_end else ''
                ext = Path(text_path).suffix.lower()
                label = 'TXT' if ext == '.txt' else 'EPUB'
                push({'type': 'status', 'msg': f'Extracting sentences from {label}{range_desc}...'})
                texts = epub.extract_sentences(text_path, char_start, char_end)
                sentences = [{'text': t, 'start_ms': None, 'end_ms': None, 'media_path': None, 'source_name': os.path.basename(text_path)} for t in texts]

            push({'type': 'status', 'msg': f'Parsed {len(sentences):,} sentences.'})

            # ── STEP 3: Tokenize all sentences, collect candidates ─────────
            candidates: dict[str, list] = {}
            total_sents = len(sentences)
            freq_skipped_words: set[str] = set()

            for idx, sent in enumerate(sentences):
                if not self._running:
                    push({'type': 'stopped'})
                    return

                if idx % 200 == 0:
                    push({'type': 'status',
                          'msg': f'Scanning sentences {idx:,}/{total_sents:,}...'})

                tokens = nlp.tokenize(sent['text'])
                for token in tokens:
                    if nlp.should_skip(token['surface'], token['lemma'], token['pos_tuple']):
                        continue

                    lemma = token['lemma']

                    # Cross-deck dedup: only skip if allow_duplicates is OFF
                    if not s.allow_duplicates and lemma in self._known_words:
                        continue

                    rank = frequency.get_rank(self._freq_dict, lemma)
                    in_dict = dictionary.lookup(self._jitendex, lemma) if self._jitendex else None

                    if not in_dict:
                        freq_skipped_words.add(lemma)
                        continue

                    if rank > s.freq_threshold:
                        freq_skipped_words.add(lemma)
                        continue

                    if lemma not in candidates:
                        candidates[lemma] = []

                    candidates[lemma].append({
                        'text': sent['text'],
                        'start_ms': sent['start_ms'],
                        'end_ms': sent['end_ms'],
                        'media_path': sent.get('media_path'),
                        'source_name': sent.get('source_name'),
                        'token': token,
                        'rank': rank,
                    })

            push({'type': 'status',
                  'msg': f'Found {len(candidates):,} candidate words. ({len(freq_skipped_words):,} too rare, skipped)'})

            if not candidates:
                push({
                    'type': 'done',
                    'added': 0, 'skipped_known': 0, 'skipped_freq': len(freq_skipped_words),
                    'msg': 'No new words found — all content is already in Anki or below the frequency threshold.',
                })
                return

            # ── STEP 4: Pick best sentence per candidate (i+1 priority) ───
            def count_unknowns(sentence_text: str, exclude_lemma: str) -> int:
                toks = nlp.tokenize(sentence_text)
                count = 0
                for t in toks:
                    if nlp.should_skip(t['surface'], t['lemma'], t['pos_tuple']):
                        continue
                    if t['lemma'] == exclude_lemma:
                        continue
                    if t['lemma'] not in self._known_words:
                        count += 1
                return count

            results = []
            for lemma, occurrences in candidates.items():
                best = min(occurrences,
                           key=lambda occ: count_unknowns(occ['text'], lemma))
                results.append((lemma, best))

            push({'type': 'status',
                  'msg': f'Selected best sentences. Starting card creation for {len(results):,} words...'})

            # ── STEP 5: Create Anki cards (batch) ─────────────────────────
            os.makedirs(s.temp_dir, exist_ok=True)
            added = 0
            skipped_known = 0
            skipped_freq = len(freq_skipped_words)
            total = len(results)

            # Cache media format info (avoids ffprobe overhead per candidate in batch processing)
            media_info_cache = {}
            for _, occ in results:
                mp = occ.get('media_path', media_path)
                if mp and mp not in media_info_cache:
                    media_info_cache[mp] = {
                        'audio_only': media.is_audio_only(mp),
                        'duration_ms': media.get_media_duration_ms(mp)
                    }

            t_batch_start = time.perf_counter()
            _bt_sent_furi = 0.0; _bt_audio_clip = 0.0; _bt_screenshot = 0.0
            _bt_word_audio = 0.0; _bt_upload = 0.0; _bt_dict_lookup = 0.0; _bt_dedup = 0.0
            
            # 1. Fetch Anki's collection.media path (for direct file writing)
            # 2. Fetch existing media starting with "sm_" to skip re-extractions
            _t0 = time.perf_counter()
            existing_media = set()
            media_dir = None
            
            # If we don't need ANY media, skip connecting to Anki for media
            needs_media = input_type in ('media', 'youtube', 'batch') or s.use_word_audio
            if needs_media:
                try:
                    media_dir_res = anki._request(s.ankiconnect_url, 'getMediaDirPath')
                    if media_dir_res and os.path.exists(media_dir_res):
                        media_dir = media_dir_res
                        # Use lightning fast os.listdir if we have the directory
                        existing_media = set(f for f in os.listdir(media_dir) if f.startswith('sm_') or f.startswith('yomi_'))
                    else:
                        # Fallback for old AnkiConnect versions
                        msg = anki._request(s.ankiconnect_url, 'getMediaFilesNames', pattern='sm_*')
                        if msg: existing_media = set(msg)
                except Exception as e:
                    print(f"[api] AnkiConnect pre-flight checks failed: {e}")
            
            _bt_media_init = (time.perf_counter() - _t0) * 1000

            # Fallback for old AnkiConnect versions that don't support getMediaDirPath
            use_direct_write = bool(media_dir)
            if use_direct_write:
                print(f"[perf] Anki media dir: {media_dir}")
            else:
                print(f"[perf] Anki media dir not found! Falling back to HTTP uploads.")

            # ── Phase 1: Build + Extract ────────────────────────────────────
            pending: list[tuple[str, str, int, dict]] = []  # (lemma, reading, rank, fields)
            
            # Only used if fallback to HTTP uploads is active
            upload_queue = queue.Queue()
            pool = None
            if not use_direct_write:
                def _upload_worker():
                    while True:
                        item = upload_queue.get()
                        if item is None:
                            upload_queue.task_done()
                            break
                        local_path, fields_ref, field_key, target_name = item
                        try:
                            _t = time.perf_counter()
                            stored_name = anki.upload_media(s.ankiconnect_url, local_path, target_name)
                            if field_key in ('SentenceAudio', 'ExpressionAudio'):
                                fields_ref[field_key] = f'[sound:{stored_name}]'
                            elif field_key == 'Picture':
                                fields_ref[field_key] = f"<img src='{stored_name}'>"
                        except Exception as e:
                            print(f'[api] Upload error ({target_name}): {e}')
                        finally:
                            upload_queue.task_done()

                pool = ThreadPoolExecutor(max_workers=8)
                for _ in range(8):
                    pool.submit(_upload_worker)
                
            extract_pool = ThreadPoolExecutor(max_workers=8)
            extract_futs = []

            push({'type': 'status', 'msg': f'Building {total} cards...'})

            for i, (lemma, occ) in enumerate(results):
                if not self._running:
                    push({'type': 'stopped'})
                    return

                push({
                    'type': 'progress',
                    'current_word': lemma,
                    'current_reading': occ['token']['reading'],
                    'processed': i,
                    'total': total,
                    'added': added,
                    'skipped_known': skipped_known,
                    'skipped_freq': skipped_freq,
                })

                token = occ['token']
                sentence_text = occ['text']
                rank = occ['rank']

                # Cross-deck dedup: skip if already known
                _t0 = time.perf_counter()
                is_dup = not s.allow_duplicates and lemma in self._known_words
                _bt_dedup += (time.perf_counter() - _t0) * 1000
                if is_dup:
                    skipped_known += 1
                    push({'type': 'log', 'badge': 'skip', 'word': lemma,
                          'reading': token['reading'], 'detail': 'already in Anki'})
                    continue

                _t0 = time.perf_counter()
                sentence_tokens = nlp.tokenize(sentence_text)
                sentence_tokens = furigana.apply_jitendex_readings(
                    sentence_tokens,
                    lambda lm: dictionary.lookup_reading(self._jitendex, lm),
                    freq_fn=lambda c: frequency.get_best_reading(self._freq_dict, c),
                )
                _bt_sent_furi += (time.perf_counter() - _t0) * 1000

                _t0 = time.perf_counter()
                jitendex_word_reading = _best_reading(
                    self._jitendex, self._freq_dict, lemma, token['reading']
                )
                defn = dictionary.lookup_for_reading(self._jitendex, lemma, jitendex_word_reading) or ''
                _bt_dict_lookup += (time.perf_counter() - _t0) * 1000

                occ_media_path = occ.get('media_path', media_path)
                source_name = occ.get('source_name') or (
                    Path(occ_media_path).name if occ_media_path
                    else payload.get('youtube_url', '') or Path(payload.get('epub_path', '')).name
                )
                
                minfo = media_info_cache.get(occ_media_path, {'audio_only': False, 'duration_ms': 0})
                audio_only = minfo['audio_only']
                media_duration_ms = minfo['duration_ms']

                fields = {
                    'Expression': lemma,
                    'ExpressionFurigana': furigana.expression_furigana(lemma, jitendex_word_reading),
                    'ExpressionReading': jitendex_word_reading,
                    'ExpressionAudio': '',
                    'SelectionText': '',
                    'MainDefinition': defn,
                    'DefinitionPicture': '',
                    'Sentence': sentence_text,
                    'SentenceFurigana': furigana.sentence_furigana_html(sentence_text, sentence_tokens, lemma),
                    'SentenceAudio': '',
                    'Picture': '',
                    'Glossary': defn,
                    'Hint': '',
                    'IsWordAndSentenceCard': '',
                    'IsClickCard': '',
                    'IsSentenceCard': '',
                    'IsAudioCard': '',
                    'PitchPosition': '',
                    'PitchCategories': '',
                    'FreqSort': str(rank) if rank < 999999 else '',
                    'Frequency': str(rank) if rank < 999999 else '',
                    'MiscInfo': source_name,
                }

                # Media: extract files now (CPU-bound)
                if input_type in ('media', 'youtube', 'batch') and occ['start_ms'] is not None:
                    if not occ_media_path or not os.path.exists(occ_media_path):
                        print(f"[api] Warning: Video path {occ_media_path} missing or invalid for '{lemma}'. Skipping media extraction.")
                    else:
                        uid_str = f"{occ_media_path}_{occ['start_ms']}_{occ['end_ms']}"
                        uid = hashlib.md5(uid_str.encode('utf-8')).hexdigest()[:8]
                        
                        try:
                            clip_name = f"sm_{lemma}_{uid}_clip.mp3"
                            clip_path = os.path.join(media_dir if use_direct_write else s.temp_dir, clip_name)
                            clip_exists = clip_name in existing_media
                            if clip_exists:
                                fields['SentenceAudio'] = f"[sound:{clip_name}]"
                                
                            frame_name = f"sm_{lemma}_{uid}_frame.jpg"
                            frame_path = os.path.join(media_dir if use_direct_write else s.temp_dir, frame_name)
                            frame_exists = frame_name in existing_media
                            if not audio_only and frame_exists:
                                fields['Picture'] = f"<img src='{frame_name}'>"

                            do_audio = not clip_exists
                            do_frame = not audio_only and not frame_exists
                            
                            if do_audio or do_frame:
                                def _do_media(mp, start, end, ap, anam, fp, fnam, flds, direct):
                                    _t = time.perf_counter()
                                    media.extract_media(mp, start, end, ap, fp, s.clip_padding_ms, media_duration_ms)
                                    el = (time.perf_counter() - _t) * 1000
                                    if ap:
                                        if direct:
                                            flds['SentenceAudio'] = f"[sound:{anam}]"
                                        else:
                                            upload_queue.put((ap, flds, 'SentenceAudio', anam))
                                    if fp:
                                        if direct:
                                            flds['Picture'] = f"<img src='{fnam}'>"
                                        else:
                                            upload_queue.put((fp, flds, 'Picture', fnam))
                                    return ('media', el)
                                    
                                extract_futs.append(extract_pool.submit(
                                    _do_media, occ_media_path, occ['start_ms'], occ['end_ms'],
                                    clip_path if do_audio else None, clip_name,
                                    frame_path if do_frame else None, frame_name,
                                    fields, use_direct_write
                                ))
                        except Exception as e:
                            print(f"[api] Media extract error for {lemma}: {e}")

                # Word audio
                if s.use_word_audio:
                    try:
                        word_uid = hashlib.md5(f"{lemma}_{token['reading']}".encode('utf-8')).hexdigest()[:8]
                        audio_name = f"sm_word_{lemma}_{word_uid}.mp3"
                        
                        if audio_name in existing_media:
                            fields['ExpressionAudio'] = f"[sound:{audio_name}]"
                        else:
                            def _do_word_audio(lm, rdg, tmp_dir, target_name, flds, direct):
                                _t = time.perf_counter()
                                a_path = audio_sources.fetch_word_audio(lm, rdg, tmp_dir)
                                el = (time.perf_counter() - _t) * 1000
                                if a_path:
                                    if direct:
                                        # Move from temp to Anki collection.media immediately
                                        n_path = os.path.join(media_dir, target_name)
                                        # Use replace or copyfile to handle cross-drive moves
                                        import shutil
                                        shutil.move(a_path, n_path)
                                        flds['ExpressionAudio'] = f"[sound:{target_name}]"
                                    else:
                                        n_path = os.path.join(tmp_dir, target_name)
                                        import shutil
                                        shutil.move(a_path, n_path)
                                        upload_queue.put((n_path, flds, 'ExpressionAudio', target_name))
                                return ('word_audio', el)
                                
                            extract_futs.append(extract_pool.submit(
                                _do_word_audio, lemma, token['reading'], s.temp_dir, audio_name, fields, use_direct_write
                            ))
                    except Exception as e:
                        print(f"[api] Word audio error for {lemma}: {e}")

                pending.append((lemma, jitendex_word_reading, rank, fields))
            
            # Wait for all ffmpeg extractions and HTTP audio fetches to finish
            for fut in extract_futs:
                try:
                    resType, elapsed = fut.result()
                    if resType == 'media': _bt_audio_clip += elapsed
                    elif resType == 'word_audio': _bt_word_audio += elapsed
                except Exception as e:
                    print(f"[api] Background extraction failed: {e}")
            extract_pool.shutdown()

            # Close the upload loop (only if fallback mode)
            if not use_direct_write and pool is not None:
                for _ in range(8):
                    upload_queue.put(None)
                _t0 = time.perf_counter()
                upload_queue.join()
                pool.shutdown(wait=True)
                _bt_upload = (time.perf_counter() - _t0) * 1000

            t_extract_ms = (time.perf_counter() - t_batch_start) * 1000
            print(f'[perf] ── Extract & Upload phase ({len(pending)} notes) ──')
            print(f'[perf]    Media Init (Anki API/dir):         {_bt_media_init:.0f}ms')
            print(f'[perf]    Duplicate check (set):             {_bt_dedup:.0f}ms')
            print(f'[perf]    Dictionary lookups (all):          {_bt_dict_lookup:.0f}ms')
            print(f'[perf]    Sentence furigana (all):           {_bt_sent_furi:.0f}ms')
            if use_direct_write:
                print(f'[perf]    Combined ffmpeg extract (direct):  {_bt_audio_clip:.0f}ms')
            else:
                print(f'[perf]    Combined ffmpeg extract (temp):    {_bt_audio_clip:.0f}ms')
                print(f'[perf]    Trailing upload wait:              {_bt_upload:.0f}ms')
            print(f'[perf]    Word audio HTTP (all):             {_bt_word_audio:.0f}ms')
            print(f'[perf]    Phase total:                       {t_extract_ms:.0f}ms')

            # ── Phase 2: Batch addNotes — Chunked for stability ──────
            push({'type': 'status', 'msg': f'Sending {len(pending)} notes to Anki...'})
            note_dicts = [
                {
                    'deckName': s.deck_name,
                    'modelName': s.note_type,
                    'fields': fields,
                    'tags': s.tags,
                    'options': {'allowDuplicate': False, 'duplicateScope': 'deck'},
                }
                for _, _, _, fields in pending
            ]
            
            note_ids = []
            BATCH_CHUNK_SIZE = 100
            total_chunks = (len(note_dicts) + BATCH_CHUNK_SIZE - 1) // BATCH_CHUNK_SIZE
            _dt_batch_total = 0
            
            for i in range(0, len(note_dicts), BATCH_CHUNK_SIZE):
                chunk = note_dicts[i:i + BATCH_CHUNK_SIZE]
                chunk_idx = i // BATCH_CHUNK_SIZE + 1
                msg = f'Sending chunk {chunk_idx}/{total_chunks} ({len(chunk)} notes) to Anki...'
                push({'type': 'status', 'msg': msg})
                print(f'[anki] {msg}')
                
                _t0 = time.perf_counter()
                ids = anki.add_notes_batch(s.ankiconnect_url, chunk)
                _dt_batch_total += (time.perf_counter() - _t0) * 1000
                note_ids.extend(ids)
                
                if chunk_idx < total_chunks:
                    time.sleep(0.1)  # 100ms delay to let Anki breathe
                    
            print(f'[perf]    addNotes chunked ({len(note_dicts)} notes):        {_dt_batch_total:.0f}ms')

            # ── Phase 3: Process results and push log events ─────────────────
            for (lemma, jitendex_word_reading, rank, _), note_id in zip(pending, note_ids):
                if note_id is None:
                    skipped_known += 1
                    push({'type': 'log', 'badge': 'skip', 'word': lemma,
                          'reading': jitendex_word_reading, 'detail': 'duplicate in Anki'})
                else:
                    self._known_words.add(lemma)
                    added += 1
                    push({
                        'type': 'log',
                        'badge': 'added',
                        'word': lemma,
                        'reading': jitendex_word_reading,
                        'rank': rank if rank < 999999 else None,
                    })

            t_total_ms = (time.perf_counter() - t_batch_start) * 1000
            print(f'[perf]    Mining total:                      {t_total_ms:.0f}ms')

            push({
                'type': 'done',
                'added': added,
                'skipped_known': skipped_known,
                'skipped_freq': skipped_freq,
            })

        except NoManualSubtitlesError as e:
            push({'type': 'error', 'msg': str(e)})
        except Exception as e:
            import traceback
            push({'type': 'error', 'msg': f'Unexpected error: {e}',
                  'detail': traceback.format_exc()})
        finally:
            self._running = False

    # ── Scan & Preview ─────────────────────────────────────────────────────────

    def scan_candidates(self, payload: dict) -> dict:
        """
        Scan the source and return all candidate words with their best sentence
        and one-line definition. Does NOT add anything to Anki.
        Result is also stored in self._scan_cache for add_single_card.
        """
        try:
            import srt
            input_type = payload.get('input_type', 'media')
            s = self._settings

            # Refresh known words from Anki so duplicates are always up-to-date
            try:
                fresh_known, _ = anki.get_all_known_expressions(self._settings.ankiconnect_url)
                if fresh_known:
                    self._known_words = fresh_known
            except Exception:
                pass  # Use cached known_words if Anki unreachable

            # ── Step 1: build sentence list ────────────────────────────────
            media_path = None
            srt_path = None
            sentences = []
            t_scan_start = time.perf_counter()

            if input_type == 'youtube':
                media_path, srt_path = youtube.download(payload['youtube_url'], s.temp_dir)
                label = Path(media_path).name
                sentences.extend(_parse_srt(srt_path, 0, media_path, label))
            elif input_type == 'media':
                media_path = payload.get('media_path', '')
                srt_path = payload.get('srt_path', '')
                label = Path(media_path).name if media_path else ''
                offset_ms = int(payload.get('sub_offset_ms', 0))
                sentences.extend(_parse_srt(srt_path, offset_ms, media_path, label))
            elif input_type == 'batch':
                pairs = payload.get('pairs', [])
                total_pairs = len(pairs)
                offset_ms = int(payload.get('sub_offset_ms', 0))
                for i, pair in enumerate(pairs):
                    mp = pair.get('media_path')
                    sp = pair.get('srt_path')
                    lbl = pair.get('label', os.path.basename(mp))
                    self._push({'type': 'status', 'msg': f'Scanning episode {i+1}/{total_pairs} — {lbl}...'})
                    sentences.extend(_parse_srt(sp, offset_ms, mp, lbl))
            else:  # epub / txt
                text_path = payload.get('epub_path', '')
                char_start = int(payload.get('char_start') or 0)
                char_end_raw = payload.get('char_end')
                char_end = int(char_end_raw) if char_end_raw else None
                texts = epub.extract_sentences(text_path, char_start, char_end)
                lbl = Path(text_path).name
                sentences = [{'text': t, 'start_ms': None, 'end_ms': None, 'media_path': None, 'source_name': lbl} for t in texts]

            # ── Step 2: collect candidates ─────────────────────────────────
            # Phase 2a: tokenize all sentences, collect freq-passing lemmas
            candidates: dict[str, list] = {}
            freq_passing: dict[str, list] = {}  # lemma -> list of (sent, token, rank)
            t_tok = 0.0; t_freq = 0.0; t_dict = 0.0

            for sent in sentences:
                _t0 = time.perf_counter()
                tokens = nlp.tokenize(sent['text'])
                t_tok += time.perf_counter() - _t0

                for token in tokens:
                    if nlp.should_skip(token['surface'], token['lemma'], token['pos_tuple']):
                        continue
                    lemma = token['lemma']
                    if not s.allow_duplicates and lemma in self._known_words:
                        continue

                    _t0 = time.perf_counter()
                    rank = frequency.get_rank(self._freq_dict, lemma)
                    t_freq += time.perf_counter() - _t0

                    if rank > s.freq_threshold:
                        continue

                    if lemma not in freq_passing:
                        freq_passing[lemma] = []
                    freq_passing[lemma].append({
                        'text': sent['text'], 'start_ms': sent['start_ms'],
                        'end_ms': sent['end_ms'], 'token': token, 'rank': rank,
                        'media_path': sent.get('media_path'), 'source_name': sent.get('source_name')
                    })

            # Phase 2b: batch dictionary existence check (ONE SQL query)
            _t0 = time.perf_counter()
            in_dict_set = dictionary.lookup_terms_batch(self._jitendex, list(freq_passing.keys()))
            t_dict = (time.perf_counter() - _t0) * 1000

            for lemma, occs in freq_passing.items():
                if lemma in in_dict_set:
                    candidates[lemma] = occs

            n_sents = len(sentences)
            print(f'[perf] SudachiPy tokenize      ({n_sents} sents):  {t_tok*1000:.0f}ms')
            print(f'[perf] Frequency rank lookup                   :  {t_freq*1000:.0f}ms')
            print(f'[perf] Dictionary batch check  ({len(freq_passing)} terms):  {t_dict:.0f}ms')
            print(f'[perf] Candidates found                        :  {len(candidates)} words')

            # ── Step 3: pick best sentence per word ────────────────────────
            def count_unknowns(sentence_text, exclude_lemma):
                toks = nlp.tokenize(sentence_text)
                return sum(1 for t in toks
                           if not nlp.should_skip(t['surface'], t['lemma'], t['pos_tuple'])
                           and t['lemma'] != exclude_lemma
                           and t['lemma'] not in self._known_words)

            result_items = []
            self._scan_cache = {}
            source_name = (Path(media_path).name if media_path
                           else payload.get('youtube_url', '')
                           or Path(payload.get('epub_path', '')).name)

            t_best_sent = 0.0; t_reading = 0.0; t_furi_expr = 0.0
            t_sent_tok = 0.0; t_sent_furi = 0.0; t_defn = 0.0

            for lemma, occs in candidates.items():
                _t0 = time.perf_counter()
                best = min(occs, key=lambda o: count_unknowns(o['text'], lemma))
                t_best_sent += time.perf_counter() - _t0

                rank = best['rank']
                token = best['token']

                _t0 = time.perf_counter()
                jitendex_word_reading = _best_reading(
                    self._jitendex, self._freq_dict, lemma, token['reading']
                )
                t_reading += time.perf_counter() - _t0

                _t0 = time.perf_counter()
                defn = dictionary.lookup_for_reading(self._jitendex, lemma, jitendex_word_reading) or ''
                t_defn += time.perf_counter() - _t0

                _t0 = time.perf_counter()
                furi = furigana.expression_furigana(lemma, jitendex_word_reading)
                t_furi_expr += time.perf_counter() - _t0

                _t0 = time.perf_counter()
                sent_tokens = nlp.tokenize(best['text'])
                t_sent_tok += time.perf_counter() - _t0

                _t0 = time.perf_counter()
                sent_tokens = furigana.apply_jitendex_readings(
                    sent_tokens,
                    lambda lm: dictionary.lookup_reading(self._jitendex, lm),
                    freq_fn=lambda c: frequency.get_best_reading(self._freq_dict, c),
                )
                t_sent_furi += time.perf_counter() - _t0

                self._scan_cache[lemma] = {
                    'occ': best, 'token': token, 'rank': rank,
                    'source_name': source_name, 'input_type': input_type,
                    'media_path': media_path,
                }

                result_items.append({
                    'lemma': lemma,
                    'reading': token['reading'],
                    'furigana': furi,
                    'rank': rank if rank < 999999 else None,
                    'definition': defn,
                    'sentence': best['text'],
                    'sentence_tokens': [
                        {
                            'surface': t['surface'],
                            'reading': t['reading'],
                            'lemma': t['lemma'],
                            'start': t['start'],
                            'end': t['end'],
                        }
                        for t in sent_tokens
                    ],
                })

            n_words = len(candidates)
            print(f'[perf] Best-sentence selection ({n_words} words):  {t_best_sent*1000:.0f}ms  '
                  f'(re-tokenizes each candidate sentence)')
            print(f'[perf] _best_reading (freq+jitendex all reads):  {t_reading*1000:.0f}ms')
            print(f'[perf] Definition lookup (lookup_for_reading)  :  {t_defn*1000:.0f}ms')
            print(f'[perf] ExpressionFurigana generation           :  {t_furi_expr*1000:.0f}ms')
            print(f'[perf] SentenceFurigana tokenize               :  {t_sent_tok*1000:.0f}ms')
            print(f'[perf] SentenceFurigana apply_jitendex_readings:  {t_sent_furi*1000:.0f}ms')
            t_total = time.perf_counter() - t_scan_start
            print(f'[perf] ── Total scan time                      :  {t_total*1000:.0f}ms')

            # Sort by rank (most common first)
            result_items.sort(key=lambda x: x['rank'] if x['rank'] else 999999)

            return {'ok': True, 'items': result_items, 'total': len(result_items)}

        except Exception as e:
            import traceback
            return {'ok': False, 'error': str(e), 'detail': traceback.format_exc()}

    def add_single_card(self, lemma: str) -> dict:
        """
        Add a single card for the given lemma using cached scan data.
        Returns {'ok': True} on success or {'ok': False, 'error': '...'} on failure.
        """
        if lemma not in self._scan_cache:
            return {'ok': False, 'error': 'Word not in scan cache. Run Scan first.'}

        s = self._settings
        cache = self._scan_cache[lemma]
        occ = cache['occ']
        token = cache['token']
        rank = cache['rank']
        source_name = cache['source_name']
        input_type = cache['input_type']
        media_path = cache.get('media_path')

        # Only block if allow_duplicates is OFF
        if not s.allow_duplicates and lemma in self._known_words:
            return {'ok': False, 'error': 'Already in Anki.'}

        try:
            sentence_text = occ['text']
            sentence_tokens = nlp.tokenize(sentence_text)
            sentence_tokens = furigana.apply_jitendex_readings(
                sentence_tokens,
                lambda lm: dictionary.lookup_reading(self._jitendex, lm),
                freq_fn=lambda c: frequency.get_best_reading(self._freq_dict, c),
            )
            jitendex_word_reading = _best_reading(
                self._jitendex, self._freq_dict, lemma, token['reading']
            )

            # Check for same-deck duplicate (catches different note types too)
            if anki.expression_exists_in_deck(s.ankiconnect_url, s.deck_name, lemma):
                return {'ok': False, 'error': 'Already in deck (duplicate expression).'}
            fields = {
                'Expression': lemma,
                'ExpressionFurigana': furigana.expression_furigana(lemma, jitendex_word_reading),
                'ExpressionReading': jitendex_word_reading,
                'ExpressionAudio': '',
                'SelectionText': '',
                'MainDefinition': dictionary.lookup_for_reading(self._jitendex, lemma, jitendex_word_reading) or '',
                'DefinitionPicture': '',
                'Sentence': sentence_text,
                'SentenceFurigana': furigana.sentence_furigana_html(sentence_text, sentence_tokens, lemma),
                'SentenceAudio': '',
                'Picture': '',
                'Glossary': dictionary.lookup_for_reading(self._jitendex, lemma, jitendex_word_reading) or '',
                'Hint': '',
                'IsWordAndSentenceCard': '', 'IsClickCard': '', 'IsSentenceCard': '',
                'IsAudioCard': '', 'PitchPosition': '', 'PitchCategories': '',
                'FreqSort': str(rank) if rank < 999999 else '',
                'Frequency': str(rank) if rank < 999999 else '',
                'MiscInfo': source_name,
            }

            os.makedirs(s.temp_dir, exist_ok=True)
            uid = uuid4().hex[:8]

            audio_only = media_path and media.is_audio_only(media_path)

            if input_type in ('media', 'youtube') and occ.get('start_ms') is not None:
                try:
                    clip_path = os.path.join(s.temp_dir, f'{lemma}_{uid}_clip.mp3')
                    media.extract_audio_clip(media_path, occ['start_ms'], occ['end_ms'],
                                             clip_path, s.clip_padding_ms)
                    fields['SentenceAudio'] = f'[sound:{anki.upload_media(s.ankiconnect_url, clip_path)}]'
                except Exception as e:
                    print(f'[api] single card audio error: {e}')

                if not audio_only:
                    try:
                        frame_path = os.path.join(s.temp_dir, f'{lemma}_{uid}_frame.jpg')
                        media.extract_frame(media_path, occ['start_ms'], occ['end_ms'], frame_path)
                        fields['Picture'] = f"<img src='{anki.upload_media(s.ankiconnect_url, frame_path)}'>"
                    except Exception as e:
                        print(f'[api] single card frame error: {e}')

            if s.use_word_audio:
                try:
                    audio_path = audio_sources.fetch_word_audio(lemma, token['reading'], s.temp_dir)
                    if audio_path:
                        fields['ExpressionAudio'] = f'[sound:{anki.upload_media(s.ankiconnect_url, audio_path)}]'
                except Exception as e:
                    print(f'[api] single card word audio error: {e}')

            note_id = anki.add_note(s.ankiconnect_url, s.deck_name, s.note_type, fields, s.tags,
                                    allow_duplicate=s.allow_duplicates)
            if note_id == -1:
                return {'ok': False, 'error': 'Duplicate in Anki.'}

            self._known_words.add(lemma)
            return {'ok': True}

        except Exception as e:
            return {'ok': False, 'error': str(e)}

    def get_epub_char_count(self, path: str) -> dict:
        """Return the total extracted character count of an EPUB or TXT file."""
        try:
            count = epub.get_total_chars(path)
            return {'ok': True, 'count': count}
        except Exception as e:
            return {'ok': False, 'error': str(e)}

    # ── File picker ───────────────────────────────────────────────────────────

    def pick_file(self, file_types: list[str] = None) -> str | None:
        """Open native file dialog. Returns selected path or None."""
        try:
            if file_types:
                result = webview.windows[0].create_file_dialog(
                    webview.FileDialog.OPEN,
                    file_types=tuple(file_types),
                )
            else:
                result = webview.windows[0].create_file_dialog(webview.FileDialog.OPEN)

            if result and len(result) > 0:
                return result[0]
            return None
        except Exception as e:
            print(f"[api] pick_file error: {e}")
            return None

    def pick_folder(self) -> str | None:
        """Open native folder dialog. Returns selected path or None."""
        try:
            result = webview.windows[0].create_file_dialog(webview.FileDialog.FOLDER)
            if result and len(result) > 0:
                return result[0]
            return None
        except Exception as e:
            print(f"[api] pick_folder error: {e}")
            return None

    def scan_folder_for_pairs(self, folder_path: str) -> dict:
        """Scan a folder and group video and subtitle files by filename stem."""
        try:
            if not os.path.exists(folder_path):
                return {'ok': False, 'error': 'Folder not found.'}
            
            videos = {}
            subs = {}
            
            valid_vid_ext = {'.mp4', '.mkv', '.avi'}
            valid_sub_ext = {'.srt', '.ass'}
            
            for f in os.listdir(folder_path):
                f_path = os.path.join(folder_path, f)
                if not os.path.isfile(f_path):
                    continue
                    
                stem, ext = os.path.splitext(f)
                ext = ext.lower()
                
                if ext in valid_vid_ext:
                    videos[stem] = f_path
                elif ext in valid_sub_ext:
                    subs[stem] = f_path
                    
            pairs = []
            unpaired_vids = []
            
            for stem in sorted(set(videos.keys()) | set(subs.keys())):
                vid = videos.get(stem)
                sub = subs.get(stem)
                
                if vid and sub:
                    pairs.append({
                        'label': f"{stem}",
                        'media_path': vid,
                        'srt_path': sub
                    })
                elif vid:
                    unpaired_vids.append({
                        'label': f"{stem}",
                        'media_path': vid
                    })
                    
            return {
                'ok': True,
                'folder': folder_path,
                'pairs': pairs,
                'unpaired_vids': unpaired_vids
            }
        except Exception as e:
            return {'ok': False, 'error': str(e)}
