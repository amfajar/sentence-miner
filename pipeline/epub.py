"""
EPUB / plain-text extractor.
Parses all document items, splits on Japanese sentence-ending punctuation.
Supports optional character range filtering (char_start, char_end).
"""

import re
import warnings
import ebooklib
from ebooklib import epub
from bs4 import BeautifulSoup, XMLParsedAsHTMLWarning

# EPUB items are XHTML — lxml parses them correctly as HTML.
# Suppress the misleading warning that fires on every chapter.
warnings.filterwarnings('ignore', category=XMLParsedAsHTMLWarning)


_SPLIT_RE = re.compile(r'[。！？\n]+')
_MIN_LENGTH = 5


# ── EPUB ──────────────────────────────────────────────────────────────────────

def extract_text_epub(epub_path: str) -> str:
    """Extract the raw full text from the EPUB (all document items concatenated).
    Strips <rt> (furigana reading) and <rp> (fallback brackets) so that ruby-annotated
    EPUB text doesn't produce 漢字[よみ] bracket noise in the extracted plain text.
    """
    book = epub.read_epub(epub_path, options={'ignore_ncx': True})
    parts = []
    for item in book.get_items_of_type(ebooklib.ITEM_DOCUMENT):
        try:
            content = item.get_content().decode('utf-8', errors='ignore')
            soup = BeautifulSoup(content, 'lxml')
            # Remove furigana readings and fallback brackets before extracting text
            for tag in soup.find_all(['rt', 'rp']):
                tag.decompose()
            parts.append(soup.get_text())
        except Exception:
            continue
    return ''.join(parts)


# ── TXT ───────────────────────────────────────────────────────────────────────

def extract_text_txt(txt_path: str) -> str:
    """Read a plain text file as-is."""
    with open(txt_path, encoding='utf-8', errors='replace') as f:
        return f.read()


# ── Shared sentence splitter ──────────────────────────────────────────────────

def _split_sentences(text_slice: str) -> list[str]:
    sentences = []
    parts = _SPLIT_RE.split(text_slice)
    for part in parts:
        s = part.strip()
        if not s:
            continue
        if len(s) < _MIN_LENGTH:
            continue
        # Skip pure ASCII (English chapter headers, etc.)
        if all(ord(c) < 128 for c in s):
            continue
        sentences.append(s)
    return sentences


# ── Public API ────────────────────────────────────────────────────────────────

def extract_sentences(path: str, char_start: int = 0, char_end: int = None) -> list[str]:
    """
    Dispatcher: routes to EPUB or TXT based on file extension.
    Open file, extract plain text, optionally slice to [char_start:char_end],
    then split into Japanese sentences.
    Returns flat list of sentence strings.
    """
    lower = path.lower()
    if lower.endswith('.txt'):
        full_text = extract_text_txt(path)
    else:
        full_text = extract_text_epub(path)

    # Apply character range
    if char_end is not None:
        text_slice = full_text[char_start:char_end]
    else:
        text_slice = full_text[char_start:]

    return _split_sentences(text_slice)


def get_total_chars(path: str) -> int:
    """Return the total character count of the file's extracted text."""
    lower = path.lower()
    if lower.endswith('.txt'):
        return len(extract_text_txt(path))
    return len(extract_text_epub(path))


# Legacy alias kept for backwards compatibility
def extract_text(epub_path: str) -> str:
    return extract_text_epub(epub_path)
