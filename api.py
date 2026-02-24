"""
Api class — the bridge between the JS frontend and Python backend.
Every public method is callable from JS via window.pywebview.api.method().
"""

import json
import os
import re
import threading
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
        """Test AnkiConnect connectivity and return card count."""
        try:
            ok = anki.check_connection(self._settings.ankiconnect_url)
            if not ok:
                return {'ok': False, 'error': 'AnkiConnect not responding.'}
            decks = anki.get_deck_names(self._settings.ankiconnect_url)
            models = anki.get_model_names(self._settings.ankiconnect_url)
            # Fetch known word count
            known = anki.get_all_known_expressions(self._settings.ankiconnect_url)
            self._known_words = known
            return {
                'ok': True,
                'known_count': len(known),
                'decks': decks,
                'models': models,
            }
        except Exception as e:
            return {'ok': False, 'error': str(e)}

    def clear_anki_cache(self) -> dict:
        """Delete the Anki known-words disk cache so next startup re-fetches from Anki."""
        import glob
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

                # Fast: load from cache immediately, refresh in background
                def _on_refresh(new_words: set):
                    self._known_words = new_words
                    _push(f"Anki cache refreshed — {len(new_words):,} expressions.")

                self._known_words = anki.get_known_expressions_fast(
                    self._settings.ankiconnect_url,
                    on_refresh_done=_on_refresh
                )
                _push(f"Anki connected — {len(self._known_words):,} expressions (from cache).")

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
            input_type = payload.get('input_type', 'video')

            # ── STEP 1: Get input ──────────────────────────────────────────
            video_path = None
            srt_path = None

            if input_type == 'youtube':
                push({'type': 'status', 'msg': 'Downloading YouTube video...'})
                video_path, srt_path = youtube.download(
                    payload['youtube_url'], s.temp_dir
                )
                push({'type': 'status', 'msg': f'Downloaded: {os.path.basename(video_path)}'})
            elif input_type == 'video':
                video_path = payload.get('video_path', '')
                srt_path = payload.get('srt_path', '')
                if not os.path.exists(video_path):
                    push({'type': 'error', 'msg': f'Video file not found: {video_path}'})
                    return

            # ── STEP 2: Parse into sentences ───────────────────────────────
            sentences = []
            if input_type in ('video', 'youtube'):
                with open(srt_path, encoding='utf-8', errors='replace') as f:
                    content = f.read()
                if srt_path.lower().endswith('.ass'):
                    content = _strip_ass_tags(content)
                subs = list(srt.parse(content))
                for sub in subs:
                    text = sub.content.replace('\n', '　').strip()
                    sentences.append({
                        'text': text,
                        'start_ms': int(sub.start.total_seconds() * 1000),
                        'end_ms': int(sub.end.total_seconds() * 1000),
                    })
            else:  # epub
                epub_path = payload.get('epub_path', '')
                char_start = int(payload.get('char_start') or 0)
                char_end_raw = payload.get('char_end')
                char_end = int(char_end_raw) if char_end_raw else None
                range_desc = f' (chars {char_start:,}–{char_end:,})' if char_end else ''
                push({'type': 'status', 'msg': f'Extracting sentences from EPUB{range_desc}...'})
                texts = epub.extract_sentences(epub_path, char_start, char_end)
                sentences = [{'text': t, 'start_ms': None, 'end_ms': None} for t in texts]

            push({'type': 'status', 'msg': f'Parsed {len(sentences):,} sentences.'})

            # ── STEP 3: Tokenize all sentences, collect candidates ─────────
            # {lemma: [ {text, start_ms, end_ms, token, rank} ]}
            candidates: dict[str, list] = {}
            total_sents = len(sentences)
            freq_skipped_words: set[str] = set()  # track for final count

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
                    if lemma in self._known_words:
                        continue

                    rank = frequency.get_rank(self._freq_dict, lemma)
                    in_dict = dictionary.lookup(self._jitendex, lemma) if self._jitendex else None

                    # Always skip words with no Jitendex definition
                    if not in_dict:
                        freq_skipped_words.add(lemma)
                        continue

                    # Skip words exceeding freq threshold, including words not in JPDB (rank 999999)
                    if rank > s.freq_threshold:
                        freq_skipped_words.add(lemma)
                        continue

                    if lemma not in candidates:
                        candidates[lemma] = []

                    candidates[lemma].append({
                        'text': sent['text'],
                        'start_ms': sent['start_ms'],
                        'end_ms': sent['end_ms'],
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

            # ── STEP 5: Create Anki cards ──────────────────────────────────
            os.makedirs(s.temp_dir, exist_ok=True)
            added = 0
            skipped_known = 0
            skipped_freq = len(freq_skipped_words)  # already counted in scan phase
            total = len(results)

            source_name = (
                Path(video_path).name if video_path
                else payload.get('youtube_url', '')
                     or Path(payload.get('epub_path', '')).name
            )

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

                # Re-check (this lemma may have been added earlier in this run)
                if lemma in self._known_words:
                    skipped_known += 1
                    push({'type': 'log', 'badge': 'skip', 'word': lemma,
                          'reading': token['reading'], 'detail': 'already in Anki'})
                    continue

                # Re-tokenize sentence for furigana generation
                sentence_tokens = nlp.tokenize(sentence_text)

                fields = {
                    'Expression': lemma,
                    'ExpressionFurigana': furigana.expression_furigana(
                        lemma, token['reading']
                    ),
                    'ExpressionReading': token['reading'],
                    'ExpressionAudio': '',
                    'SelectionText': '',  # User requested empty
                    'MainDefinition': dictionary.lookup(self._jitendex, lemma) or '',
                    'DefinitionPicture': '',
                    'Sentence': sentence_text,
                    'SentenceFurigana': furigana.sentence_furigana_html(
                        sentence_text, sentence_tokens, lemma
                    ),
                    'SentenceAudio': '',
                    'Picture': '',
                    'Glossary': dictionary.lookup(self._jitendex, lemma) or '',
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

                # Video-specific: audio clip + frame
                if input_type in ('video', 'youtube') and occ['start_ms'] is not None:
                    uid = uuid4().hex[:8]

                    # Audio clip
                    try:
                        clip_filename = f"{lemma}_{uid}_clip.mp3"
                        clip_path = os.path.join(s.temp_dir, clip_filename)
                        media.extract_audio_clip(
                            video_path, occ['start_ms'], occ['end_ms'],
                            clip_path, s.clip_padding_ms,
                        )
                        stored_clip = anki.upload_media(
                            s.ankiconnect_url, clip_path
                        )
                        fields['SentenceAudio'] = f"[sound:{stored_clip}]"
                    except Exception as e:
                        print(f"[api] Audio clip error for {lemma}: {e}")

                    # Frame
                    try:
                        frame_filename = f"{lemma}_{uid}_frame.jpg"
                        frame_path = os.path.join(s.temp_dir, frame_filename)
                        media.extract_frame(
                            video_path, occ['start_ms'], occ['end_ms'], frame_path
                        )
                        stored_frame = anki.upload_media(
                            s.ankiconnect_url, frame_path
                        )
                        fields['Picture'] = f"<img src='{stored_frame}'>"
                    except Exception as e:
                        print(f"[api] Frame error for {lemma}: {e}")

                # Word audio
                try:
                    audio_path = audio_sources.fetch_word_audio(
                        lemma, token['reading'], s.temp_dir
                    )
                    if audio_path:
                        stored_audio = anki.upload_media(s.ankiconnect_url, audio_path)
                        fields['ExpressionAudio'] = f"[sound:{stored_audio}]"
                except Exception as e:
                    print(f"[api] Word audio error for {lemma}: {e}")

                # Add to Anki
                try:
                    note_id = anki.add_note(
                        s.ankiconnect_url, s.deck_name,
                        s.note_type, fields, s.tags,
                    )
                    if note_id == -1:
                        skipped_known += 1
                        push({'type': 'log', 'badge': 'skip', 'word': lemma,
                              'reading': token['reading'], 'detail': 'duplicate in Anki'})
                    else:
                        self._known_words.add(lemma)
                        added += 1
                        push({
                            'type': 'log',
                            'badge': 'added',
                            'word': lemma,
                            'reading': token['reading'],
                            'rank': rank if rank < 999999 else None,
                        })
                except Exception as e:
                    push({'type': 'log', 'badge': 'error', 'word': lemma,
                          'reading': token['reading'], 'detail': str(e)})

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
            input_type = payload.get('input_type', 'video')
            s = self._settings

            # Refresh known words from Anki so duplicates are always up-to-date
            try:
                fresh_known = anki.get_all_known_expressions(self._settings.ankiconnect_url)
                if fresh_known:
                    self._known_words = fresh_known
            except Exception:
                pass  # Use cached known_words if Anki unreachable

            # ── Step 1: build sentence list ────────────────────────────────
            video_path = None
            srt_path = None
            sentences = []

            if input_type == 'youtube':
                video_path, srt_path = youtube.download(payload['youtube_url'], s.temp_dir)
            elif input_type == 'video':
                video_path = payload.get('video_path', '')
                srt_path = payload.get('srt_path', '')

            if input_type in ('video', 'youtube'):
                with open(srt_path, encoding='utf-8', errors='replace') as f:
                    content = f.read()
                if srt_path.lower().endswith('.ass'):
                    content = _strip_ass_tags(content)
                subs = list(srt.parse(content))
                # Apply subtitle offset for local video only (not YouTube)
                offset_ms = int(payload.get('sub_offset_ms', 0)) if input_type == 'video' else 0
                for sub in subs:
                    text = sub.content.replace('\n', '\u3000').strip()
                    start_ms = max(0, int(sub.start.total_seconds() * 1000) - offset_ms)
                    end_ms = max(0, int(sub.end.total_seconds() * 1000) - offset_ms)
                    sentences.append({'text': text, 'start_ms': start_ms, 'end_ms': end_ms})
            else:  # epub
                epub_path = payload.get('epub_path', '')
                char_start = int(payload.get('char_start') or 0)
                char_end_raw = payload.get('char_end')
                char_end = int(char_end_raw) if char_end_raw else None
                texts = epub.extract_sentences(epub_path, char_start, char_end)
                sentences = [{'text': t, 'start_ms': None, 'end_ms': None} for t in texts]

            # ── Step 2: collect candidates ─────────────────────────────────
            candidates: dict[str, list] = {}
            for sent in sentences:
                tokens = nlp.tokenize(sent['text'])
                for token in tokens:
                    if nlp.should_skip(token['surface'], token['lemma'], token['pos_tuple']):
                        continue
                    lemma = token['lemma']
                    if lemma in self._known_words:
                        continue
                    rank = frequency.get_rank(self._freq_dict, lemma)
                    if rank > s.freq_threshold:
                        continue
                    in_dict = dictionary.lookup(self._jitendex, lemma) if self._jitendex else None
                    if not in_dict:
                        continue
                    if lemma not in candidates:
                        candidates[lemma] = []
                    candidates[lemma].append({'text': sent['text'], 'start_ms': sent['start_ms'],
                                              'end_ms': sent['end_ms'], 'token': token, 'rank': rank})

            # ── Step 3: pick best sentence per word ────────────────────────
            def count_unknowns(sentence_text, exclude_lemma):
                toks = nlp.tokenize(sentence_text)
                return sum(1 for t in toks
                           if not nlp.should_skip(t['surface'], t['lemma'], t['pos_tuple'])
                           and t['lemma'] != exclude_lemma
                           and t['lemma'] not in self._known_words)

            result_items = []
            self._scan_cache = {}
            source_name = (Path(video_path).name if video_path
                           else payload.get('youtube_url', '')
                           or Path(payload.get('epub_path', '')).name)

            for lemma, occs in candidates.items():
                best = min(occs, key=lambda o: count_unknowns(o['text'], lemma))
                defn = dictionary.lookup(self._jitendex, lemma) or ''
                rank = best['rank']
                token = best['token']
                furi = furigana.expression_furigana(lemma, token['reading'])

                # Tokenize sentence for JS-side furigana rendering
                sent_tokens = nlp.tokenize(best['text'])

                # Store full data for add_single_card
                self._scan_cache[lemma] = {
                    'occ': best, 'token': token, 'rank': rank,
                    'source_name': source_name, 'input_type': input_type,
                    'video_path': video_path,
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
        if lemma in self._known_words:
            return {'ok': False, 'error': 'Already in Anki.'}

        s = self._settings
        cache = self._scan_cache[lemma]
        occ = cache['occ']
        token = cache['token']
        rank = cache['rank']
        source_name = cache['source_name']
        input_type = cache['input_type']
        video_path = cache.get('video_path')

        try:
            sentence_text = occ['text']
            sentence_tokens = nlp.tokenize(sentence_text)
            fields = {
                'Expression': lemma,
                'ExpressionFurigana': furigana.expression_furigana(lemma, token['reading']),
                'ExpressionReading': token['reading'],
                'ExpressionAudio': '',
                'SelectionText': '',
                'MainDefinition': dictionary.lookup(self._jitendex, lemma) or '',
                'DefinitionPicture': '',
                'Sentence': sentence_text,
                'SentenceFurigana': furigana.sentence_furigana_html(sentence_text, sentence_tokens, lemma),
                'SentenceAudio': '',
                'Picture': '',
                'Glossary': dictionary.lookup(self._jitendex, lemma) or '',
                'Hint': '',
                'IsWordAndSentenceCard': '', 'IsClickCard': '', 'IsSentenceCard': '',
                'IsAudioCard': '', 'PitchPosition': '', 'PitchCategories': '',
                'FreqSort': str(rank) if rank < 999999 else '',
                'Frequency': str(rank) if rank < 999999 else '',
                'MiscInfo': source_name,
            }

            os.makedirs(s.temp_dir, exist_ok=True)
            uid = uuid4().hex[:8]

            if input_type in ('video', 'youtube') and occ.get('start_ms') is not None:
                try:
                    clip_path = os.path.join(s.temp_dir, f'{lemma}_{uid}_clip.mp3')
                    media.extract_audio_clip(video_path, occ['start_ms'], occ['end_ms'],
                                             clip_path, s.clip_padding_ms)
                    fields['SentenceAudio'] = f'[sound:{anki.upload_media(s.ankiconnect_url, clip_path)}]'
                except Exception as e:
                    print(f'[api] single card audio error: {e}')
                try:
                    frame_path = os.path.join(s.temp_dir, f'{lemma}_{uid}_frame.jpg')
                    media.extract_frame(video_path, occ['start_ms'], occ['end_ms'], frame_path)
                    fields['Picture'] = f"<img src='{anki.upload_media(s.ankiconnect_url, frame_path)}'>"
                except Exception as e:
                    print(f'[api] single card frame error: {e}')

            try:
                audio_path = audio_sources.fetch_word_audio(lemma, token['reading'], s.temp_dir)
                if audio_path:
                    fields['ExpressionAudio'] = f'[sound:{anki.upload_media(s.ankiconnect_url, audio_path)}]'
            except Exception as e:
                print(f'[api] single card word audio error: {e}')

            note_id = anki.add_note(s.ankiconnect_url, s.deck_name, s.note_type, fields, s.tags)
            if note_id == -1:
                return {'ok': False, 'error': 'Duplicate in Anki.'}

            self._known_words.add(lemma)
            return {'ok': True}

        except Exception as e:
            return {'ok': False, 'error': str(e)}

    def get_epub_char_count(self, epub_path: str) -> dict:
        """Return the total extracted character count of an EPUB file."""
        try:
            count = epub.get_total_chars(epub_path)
            return {'ok': True, 'count': count}
        except Exception as e:
            return {'ok': False, 'error': str(e)}

    # ── File picker ───────────────────────────────────────────────────────────

    def pick_file(self, file_types: list[str] = None) -> str | None:
        """Open native file dialog. Returns selected path or None."""
        try:
            if file_types:
                result = webview.windows[0].create_file_dialog(
                    webview.OPEN_DIALOG,
                    file_types=tuple(file_types),
                )
            else:
                result = webview.windows[0].create_file_dialog(webview.OPEN_DIALOG)

            if result and len(result) > 0:
                return result[0]
            return None
        except Exception as e:
            print(f"[api] pick_file error: {e}")
            return None
