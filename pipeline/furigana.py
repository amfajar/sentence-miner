"""
Furigana generation for Anki fields.
Uses SudachiPy readings — no pykakasi needed.

Anki furigana format: 食[た]べる
"""

import re


def _has_kanji(text: str) -> bool:
    """Return True if text contains at least one CJK kanji character."""
    return any('\u4e00' <= ch <= '\u9fff' or '\u3400' <= ch <= '\u4dbf' for ch in text)


def _is_kana(ch: str) -> bool:
    """Return True if ch is hiragana or katakana."""
    return '\u3040' <= ch <= '\u30ff'


# ── Jitendex reading correction ────────────────────────────────────────────────

def _kana_tail_len(text: str) -> int:
    """Count trailing kana chars in text. e.g. 言う→1, 食べる→2, 走る→1."""
    count = 0
    for ch in reversed(text):
        if _is_kana(ch):
            count += 1
        else:
            break
    return count


def correct_surface_reading(surface: str, lemma: str,
                             sudachi_surface_reading: str,
                             sudachi_lemma_reading: str,
                             jitendex_lemma_reading: str) -> str:
    """
    Correct the SudachiPy surface reading using the Jitendex lemma reading.

    Example: 言う surface=言った
      Jitendex:  いう  → stem い  (tail=1: う)
      SudachiPy: ゆう  → stem ゆ
      Surface:   ゆった → replace stem ゆ → いった ✓

    Falls back to sudachi_surface_reading if correction is not safe.
    """
    if not jitendex_lemma_reading or not sudachi_lemma_reading:
        return sudachi_surface_reading
    if sudachi_lemma_reading == jitendex_lemma_reading:
        return sudachi_surface_reading  # no correction needed

    tail = _kana_tail_len(lemma)
    sudachi_stem_len = len(sudachi_lemma_reading) - tail
    jitendex_stem_len = len(jitendex_lemma_reading) - tail

    if sudachi_stem_len <= 0 or jitendex_stem_len <= 0:
        return sudachi_surface_reading

    wrong_stem = sudachi_lemma_reading[:sudachi_stem_len]
    correct_stem = jitendex_lemma_reading[:jitendex_stem_len]

    if not sudachi_surface_reading.startswith(wrong_stem):
        return sudachi_surface_reading  # unexpected shape, leave it

    return correct_stem + sudachi_surface_reading[len(wrong_stem):]


def apply_jitendex_readings(tokens: list[dict], lookup_fn, freq_fn=None) -> list[dict]:
    """
    Return tokens with readings corrected using Jitendex dictionary readings.

    lookup_fn: callable(lemma) -> hiragana reading | None
    freq_fn:   optional callable(candidates: list[str]) -> str
               When provided, picks the best reading by frequency rank
               between Jitendex and SudachiPy lemma readings.
               Example: lambda c: frequency.get_best_reading(freq_db, c)

    Uses correct_surface_reading() to derive conjugated-form corrections.
    """
    result = []
    for tok in tokens:
        tok = dict(tok)  # shallow copy
        jitendex_reading = lookup_fn(tok['lemma'])
        if jitendex_reading:
            sudachi_lemma_reading = tok.get('lemma_reading', tok['reading'])
            # If freq_fn provided, pick the most frequent lemma reading
            if freq_fn and sudachi_lemma_reading and sudachi_lemma_reading != jitendex_reading:
                candidates = list(dict.fromkeys(filter(None, [jitendex_reading, sudachi_lemma_reading])))
                best_lemma_reading = freq_fn(candidates)
            else:
                best_lemma_reading = jitendex_reading

            tok['reading'] = correct_surface_reading(
                tok['surface'],
                tok['lemma'],
                tok['reading'],
                sudachi_lemma_reading,
                best_lemma_reading,
            )
        result.append(tok)
    return result





def _common_kana_suffix(lemma: str, reading: str) -> str:
    """
    Find the longest common kana suffix shared by lemma and reading.
    e.g. lemma='食べる', reading='たべる' → suffix='べる'
    """
    suffix_len = 0
    for i in range(1, min(len(lemma), len(reading)) + 1):
        if lemma[-i] == reading[-i]:
            suffix_len = i
        else:
            break
    return lemma[-suffix_len:] if suffix_len else ''




def _align_furigana(lemma: str, reading: str) -> list[tuple[str, str]]:
    """
    Align lemma characters to reading chunks.
    Returns a list of (surface_segment, reading_segment) pairs.
    
    Algorithm: walk lemma left-to-right.
    - Kana in lemma → must match same kana in reading; emit (kana, '').
    - Kanji run → look ahead for next kana in lemma, find that kana in
      the remaining reading to determine where the kanji reading ends.
    """
    segments = []
    l_pos = 0   # position in lemma
    r_pos = 0   # position in reading

    while l_pos < len(lemma):
        ch = lemma[l_pos]

        if _is_kana(ch):
            # Kana: consume matching kana from reading
            if r_pos < len(reading) and reading[r_pos] == ch:
                r_pos += 1
            segments.append((ch, ''))
            l_pos += 1
        else:
            # Kanji: collect a contiguous run of kanji
            kanji_start = l_pos
            while l_pos < len(lemma) and not _is_kana(lemma[l_pos]):
                l_pos += 1
            kanji_run = lemma[kanji_start:l_pos]

            # Find where this kanji run's reading ends.
            # Look at the next kana in lemma (after the kanji run).
            if l_pos < len(lemma):
                next_kana = lemma[l_pos]
                # Find next_kana in reading from r_pos onwards
                search_start = r_pos + 1  # reading must consume at least 1 mora
                found = reading.find(next_kana, search_start)
                if found == -1:
                    # Fallback: give all remaining reading to this kanji run
                    kanji_reading = reading[r_pos:]
                    r_pos = len(reading)
                else:
                    kanji_reading = reading[r_pos:found]
                    r_pos = found
            else:
                # Last segment: give all remaining reading to kanji run
                kanji_reading = reading[r_pos:]
                r_pos = len(reading)

            segments.append((kanji_run, kanji_reading))

    return segments


def expression_furigana(lemma: str, reading: str) -> str:
    """
    Format furigana for the Expression field using plain Anki format.
    Per-kanji alignment, e.g.:
      食べる  (たべる)   → 食[た]べる
      お疲れ様 (おつかれさま) → お 疲[つか]れ 様[さま]
    If lemma is pure kana, return lemma as-is.
    """
    if not _has_kanji(lemma):
        return lemma

    segments = _align_furigana(lemma, reading)

    parts = []
    for surface, furi in segments:
        if furi:
            parts.append(f"{surface}[{furi}]")
        else:
            parts.append(surface)
    return ''.join(parts)


def sentence_furigana(sentence: str, tokens: list[dict], target_lemma: str) -> str:
    """
    Rebuild the sentence with furigana on every token EXCEPT the target word.

    For each token:
    - If token.lemma == target_lemma: copy surface as-is (no furigana — user must read it)
    - Otherwise: apply expression_furigana(surface, token_reading)
    Characters not covered by any token are copied as-is.
    """
    # Sort by start index
    sorted_tokens = sorted(tokens, key=lambda t: t['start'])

    result = []
    pos = 0

    for tok in sorted_tokens:
        start = tok['start']
        end = tok['end']

        if start < pos:
            continue  # overlapping token, skip

        # Copy any gap characters
        if start > pos:
            result.append(sentence[pos:start])

        surface = tok['surface']
        reading = tok['reading']

        if tok['lemma'] == target_lemma:
            # Target word: no furigana — user has to read it
            result.append(surface)
        else:
            if _has_kanji(surface):
                ruby = expression_furigana(surface, reading)
                result.append(ruby)
            else:
                result.append(surface)

        pos = end

    # Copy remaining characters
    if pos < len(sentence):
        result.append(sentence[pos:])

    return ''.join(result)


def _html_escape(text: str) -> str:
    """Minimal HTML escaping for plain text segments."""
    return (text
            .replace('&', '&amp;')
            .replace('<', '&lt;')
            .replace('>', '&gt;'))


def sentence_furigana_html(sentence: str, tokens: list[dict], target_lemma: str) -> str:
    """
    Rebuild the sentence as HTML with <ruby> furigana on every token
    EXCEPT the target word, which is wrapped in <b> instead.

    Output is safe HTML ready to be set as innerHTML.
    """
    sorted_tokens = sorted(tokens, key=lambda t: t['start'])

    parts = []
    pos = 0

    for tok in sorted_tokens:
        start = tok['start']
        end = tok['end']

        if start < pos:
            continue  # overlapping token, skip

        # Copy any gap characters (plain escaped text)
        if start > pos:
            parts.append(_html_escape(sentence[pos:start]))

        surface = tok['surface']
        reading = tok['reading']

        if _has_kanji(surface):
            # Build per-segment ruby markup using _align_furigana
            segs = _align_furigana(surface, reading)
            ruby_html = ''
            for seg_surface, seg_furi in segs:
                if seg_furi:
                    ruby_html += (
                        f'<ruby>{_html_escape(seg_surface)}'
                        f'<rt>{_html_escape(seg_furi)}</rt></ruby>'
                    )
                else:
                    ruby_html += _html_escape(seg_surface)

            if tok['lemma'] == target_lemma:
                # Target word: bold WITH furigana
                parts.append(f'<b>{ruby_html}</b>')
            else:
                parts.append(ruby_html)
        elif tok['lemma'] == target_lemma:
            # Target word is pure kana: bold only
            parts.append(f'<b>{_html_escape(surface)}</b>')
        else:
            parts.append(_html_escape(surface))

        pos = end

    # Remaining characters after last token
    if pos < len(sentence):
        parts.append(_html_escape(sentence[pos:]))

    return ''.join(parts)


def bold_target(sentence: str, token: dict) -> str:
    """
    Wrap the token's surface form in <b> tags in the sentence string.
    """
    start = token['start']
    end = token['end']
    surface = token['surface']
    return sentence[:start] + f"<b>{surface}</b>" + sentence[end:]
