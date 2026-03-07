import os
import sys
import shutil
from pipeline.backfill import _write_plugin_css, _clean_yomitan_html, _YOMITAN_PLUGIN_CSS

MEDIA_DIR = "test_media_dir"

def setup():
    if os.path.exists(MEDIA_DIR):
        shutil.rmtree(MEDIA_DIR)
    os.makedirs(MEDIA_DIR)
    
def teardown():
    if os.path.exists(MEDIA_DIR):
        shutil.rmtree(MEDIA_DIR)

def test_kiku_css():
    print("Testing plugin CSS logic...")
    setup()
    
    # 1. Doesn't exist yet, should create/append
    _write_plugin_css(MEDIA_DIR)
    css_path = os.path.join(MEDIA_DIR, '_kiku_plugin.css')
    assert os.path.exists(css_path), "CSS file was not created"
    
    with open(css_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    assert "/* ── Yomitan Glossary Dictionary Styles ── */" in content, "Missing CSS marker"
    assert ".yomitan-glossary li[data-dictionary]" in content, "Missing actual CSS content"
    
    # 2. Add some custom user CSS to it, simulating an existing file
    with open(css_path, "w", encoding="utf-8") as f:
        f.write(".custom-user-rule { color: red; }\n\n")
    
    _write_plugin_css(MEDIA_DIR) # should append
    with open(css_path, "r", encoding="utf-8") as f:
        content2 = f.read()
        
    assert ".custom-user-rule" in content2, "User CSS got overwritten!"
    assert "/* ── Yomitan Glossary Dictionary Styles ── */" in content2, "Appended CSS missing marker"
    
    # 3. Call it again, should NOT append duplicate
    _write_plugin_css(MEDIA_DIR)
    with open(css_path, "r", encoding="utf-8") as f:
        content3 = f.read()
        
    occurences = content3.count("/* ── Yomitan Glossary Dictionary Styles ── */")
    assert occurences == 1, f"CSS was duplicated! Found marker {occurences} times."
    
    # 4. Check clean HTML returned from Yomitan
    html = '''<div class="yomitan-glossary"><style>body{color:red;}</style><span style="color: blue;">hi</span></div>'''
    cleaned = _clean_yomitan_html(html)
    assert "<style>" not in cleaned, "Cleaned HTML still has <style> tags"
    assert "style=" not in cleaned, "Cleaned HTML still has style attributes"
    assert "<style>" not in _YOMITAN_PLUGIN_CSS, "The injected CSS has <style> tags which is invalid for a .css file!"
    
    print("\nSUCCESS: All terminal tests passed! No inline <style> injection, Kiku CSS written safely.")
    teardown()

if __name__ == "__main__":
    test_kiku_css()
