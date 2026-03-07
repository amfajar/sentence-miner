import sys
from pipeline.backfill import _clean_yomitan_html, _YOMITAN_CSS

fake_rendered = '''<div class="yomitan-glossary">
  <style>
    .bad-style { color: red; }
  </style>
  <span style="font-weight: bold;">Hello</span>
</div>'''

def test_yomitan_cleaning():
    clean = _clean_yomitan_html(fake_rendered)
    final = _YOMITAN_CSS + '\n' + clean

    print("--- BEFORE ---")
    print(fake_rendered)
    print("\n--- AFTER ---")
    print(final)

    assert "<style>" in final, "Missing Yomitan CSS"
    assert "<style>\n    .bad-style { color: red; }\n  </style>" not in final, "Failed to strip generic style tags"
    assert 'style="font-weight: bold;"' not in final, "Failed to strip inline style attributes"
    assert final.startswith("<style>\n.yomitan-glossary"), "Yomitan CSS not prepended correctly"
    
    print("\nSUCCESS: All tests passed. Output is exactly as expected.")

if __name__ == '__main__':
    test_yomitan_cleaning()
