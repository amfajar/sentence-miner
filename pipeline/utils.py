"""
Shared utilities used across the pipeline.
"""


def kata_to_hira(text: str) -> str:
    """Convert katakana characters to hiragana (basic + extended block)."""
    result = []
    for ch in text:
        code = ord(ch)
        if 0x30A1 <= code <= 0x30F6:
            result.append(chr(code - 0x60))
        else:
            result.append(ch)
    return ''.join(result)
