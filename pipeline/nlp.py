"""
Japanese tokenization using SudachiPy in Split Mode C.
Initialize once at startup — takes ~3 seconds. Do NOT reinitialize per sentence.
"""

import json
import os
from functools import lru_cache
from sudachipy import tokenizer, dictionary
from pipeline.utils import kata_to_hira

# Initialize once; this is expensive (~3s)
_tokenizer_obj = None
_mode = tokenizer.Tokenizer.SplitMode.C

# Words that slip through POS filtering but are grammar-only
_SKIP_LEMMAS = {
    'する', 'いる', 'ある', 'なる', 'です', 'ます',
    'くる', 'くれる', 'もらう', 'あげる', 'ない',
}

# POS categories to skip
_SKIP_POS = {
    '助詞', '助動詞', '接続詞', '感動詞',
    '記号', '補助記号', '空白', 'フィラー',
}


import logging

log = logging.getLogger('SentenceMiner.nlp')

def init(resource_dir: str = None):
    """
    Initialize the SudachiPy tokenizer. Call once at startup.

    resource_dir: Optional path to the folder containing the SudachiDict .dic
                  and sudachi.json config (e.g. %APPDATA%\\SentenceMiner\\sudachi).
                  If None, SudachiPy uses its default package-bundled dict.
    """
    global _tokenizer_obj
    if _tokenizer_obj is not None:
        return _tokenizer_obj

    if resource_dir and os.path.isdir(resource_dir):
        # Find the .dic file
        dic_file = next(
            (f for f in os.listdir(resource_dir) if f.endswith('.dic')), 
            None
        )
        
        if dic_file is None:
            raise FileNotFoundError(f"No .dic file found in sudachi folder: {resource_dir}")
            
        dic_path = os.path.join(resource_dir, dic_file)

        try:
            dic_size_mb = os.path.getsize(dic_path) / 1048576
            log.info(f'SudachiPy using dict: {dic_path} ({dic_size_mb:.1f}MB)')
        except Exception:
            log.info(f'SudachiPy using dict: {dic_path}')

        # By passing the absolute path to the `dict` parameter, SudachiPy natively loads the dict
        # while safely falling back to the package's bundled sudachi.json and plugins.
        _tokenizer_obj = dictionary.Dictionary(dict=dic_path).create()
        log.info('SudachiPy initialized successfully')
    else:
        # Default: let SudachiPy find the dict in its installed package
        _tokenizer_obj = dictionary.Dictionary().create()
        log.info('SudachiPy initialized successfully (default package dict)')

    return _tokenizer_obj

@lru_cache(maxsize=4096)
def _get_lemma_reading(lemma: str) -> str:
    """
    Return hiragana reading of `lemma` by re-tokenizing in Mode A.
    Cached — same lemma is only tokenized once per session.
    """
    try:
        morphemes = _tokenizer_obj.tokenize(lemma, tokenizer.Tokenizer.SplitMode.A)
        return kata_to_hira(''.join(m.reading_form() for m in morphemes))
    except Exception:
        return ''


def _has_kanji(text: str) -> bool:
    """Return True if text contains at least one CJK kanji."""
    return any('\u4E00' <= ch <= '\u9FFF' or '\u3400' <= ch <= '\u4DBF' for ch in text)


def _is_all_ascii(text: str) -> bool:
    return all(ord(ch) < 128 for ch in text)


def should_skip(surface: str, lemma: str, pos_tuple: tuple) -> bool:
    """
    Return True if this token should NOT be mined.
    Only kanji-containing, non-proper-noun words are mined.
    """
    pos_main = pos_tuple[0] if pos_tuple else ''
    pos_sub  = pos_tuple[1] if len(pos_tuple) > 1 else ''

    # 1. Must contain at least one kanji — skip pure hiragana/katakana
    if not _has_kanji(lemma):
        return True

    # 2. Proper nouns — names, places, organisations (松本大学, 田中さん, etc.)
    if pos_sub == '固有名詞':
        return True

    # 3. Pure ASCII
    if _is_all_ascii(surface):
        return True

    # 4. Grammar-only POS categories
    if pos_main in _SKIP_POS:
        return True

    # 5. Too short to be meaningful
    if len(lemma) < 2:
        return True

    # 6. High-frequency grammar verbs that slip through
    if lemma in _SKIP_LEMMAS:
        return True

    return False


def tokenize(text: str) -> list[dict]:
    """
    Tokenize a Japanese sentence string.
    Returns a list of token dicts:
      {
        'surface': str,        # as it appears in the sentence
        'lemma': str,          # dictionary/base form
        'reading': str,        # hiragana reading of the SURFACE form
        'lemma_reading': str,  # hiragana reading of the LEMMA form (for furigana correction)
        'pos': str,            # main POS category string
        'pos_tuple': tuple,    # full POS tuple from SudachiPy
        'start': int,          # char index where surface starts
        'end': int,            # char index where surface ends
      }
    """
    if _tokenizer_obj is None:
        init()

    tokens = []
    try:
        morphemes = _tokenizer_obj.tokenize(text, _mode)
        for m in morphemes:
            pos_tuple = tuple(m.part_of_speech())
            surface = m.surface()
            lemma = m.dictionary_form()
            reading = kata_to_hira(m.reading_form())

            # Get the reading of the lemma (dictionary form) — cached to avoid
            # re-tokenizing the same lemma repeatedly across sentences.
            if surface == lemma:
                lemma_reading = reading
            else:
                lemma_reading = _get_lemma_reading(lemma) or reading

            tokens.append({
                'surface': surface,
                'lemma': lemma,
                'reading': reading,
                'lemma_reading': lemma_reading,
                'pos': pos_tuple[0] if pos_tuple else '',
                'pos_tuple': pos_tuple,
                'start': m.begin(),
                'end': m.end(),
            })
    except Exception as e:
        print(f"[nlp] Tokenize error: {e}")

    return tokens

