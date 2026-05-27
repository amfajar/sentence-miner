import sys
from pipeline.backfill import _clean_yomitan_html, _YOMITAN_PLUGIN_CSS

fake_rendered = '''<div class="yomitan-glossary">
  <style>
    .bad-style { color: red; }
  </style>
  <span style="font-weight: bold;">Hello</span>
</div>'''

def test_yomitan_cleaning():
    clean = _clean_yomitan_html(fake_rendered)
    final = "<style>\n" + _YOMITAN_PLUGIN_CSS + "\n</style>\n" + clean

    print("--- BEFORE ---")
    print(fake_rendered)
    print("\n--- AFTER ---")
    # Print safely without throwing UnicodeEncodeError on Windows console
    sys.stdout.buffer.write(final.encode('utf-8'))
    sys.stdout.write('\n')

    assert "<style>" in final, "Missing Yomitan CSS"
    assert "<style>\n    .bad-style { color: red; }\n  </style>" not in final, "Failed to strip generic style tags"
    assert 'style="font-weight: bold;"' not in final, "Failed to strip inline style attributes"
    assert final.startswith("<style>\n\n/* ── Yomitan Glossary Dictionary Styles ── */"), "Yomitan CSS not prepended correctly"
    print("\nSUCCESS: Yomitan cleaning test passed.")

def test_frequency_extraction():
    from pipeline.backfill import _extract_single_frequency_by_kebab
    fake_freqs = '''<ul style="list-style-type: none; padding: 0; margin: 0;">
      <li>㋕ Jiten: 1,500</li>
      <li>jpdbv2: 300</li>
    </ul>'''
    res1 = _extract_single_frequency_by_kebab(fake_freqs, 'jiten')
    res2 = _extract_single_frequency_by_kebab(fake_freqs, 'jpdbv2')
    res3 = _extract_single_frequency_by_kebab(fake_freqs, 'nonexistent')
    
    assert res1 == '1,500', f"Expected '1,500', got {res1!r}"
    assert res2 == '300', f"Expected '300', got {res2!r}"
    assert res3 is None, f"Expected None, got {res3!r}"
    print("SUCCESS: Frequency extraction test passed.")

def test_multiple_glossary_merging():
    from pipeline.backfill import _extract_single_glossary_by_kebab
    fake_glossary = '''<ul>
      <li data-dictionary="JMdict [2026-04-21]"><i>JMdict [2026-04-21]</i> (我々 only) <span>we</span></li>
      <li data-dictionary="JMdict [2026-04-21]"><i>JMdict [2026-04-21]</i> (我々 only) <ul><li>吾々</li></ul></li>
    </ul>'''
    res = _extract_single_glossary_by_kebab(fake_glossary, 'jmdict-2026-04-21')
    
    assert res is not None, "Expected merged HTML, got None"
    assert '<div class="dict-content">' in res, "Missing dict-content class"
    assert 'style="border: 0; border-top: 1px dashed #777; margin: 8px 0;"' in res, "Missing horizontal line divider"
    assert 'we' in res, "Missing first definition"
    assert '吾々' in res, "Missing second definition"
    assert '<i>JMdict [2026-04-21]</i>' not in res, "Failed to strip redundant dictionary titles"
    print("SUCCESS: Multiple glossary merging test passed.")

if __name__ == '__main__':
    test_yomitan_cleaning()
    test_frequency_extraction()
    test_multiple_glossary_merging()
    print("\nALL TESTS PASSED SUCCESSFULLY.")
