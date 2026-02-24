"""
Jitendex (Yomitan zip format) loader and lookup.
Renders structured-content JSON to HTML following Yomitan's exact element
generation logic from structured-content-generator.js.

Performance: on first load the zip is indexed into a fixed SQLite DB at
data/dictionary.db (one-time, ~seconds). Subsequent loads open the DB
instantly.

DB layout:
  dictionary (term, definition)  — compact HTML, NO CSS per-row.
  meta (key, value)              — CSS block stored once here.

lookup() appends the CSS block to the returned HTML so Anki card fields
are self-contained and render correctly without any external stylesheet.
"""

import json
import os
import re
import sqlite3
import zipfile
from typing import Optional

import settings as settings_module


# Fixed DB path — always the same file regardless of which zip was imported.
_DB_PATH = os.path.join(settings_module.DATA_DIR, 'dictionary.db')


# ── Style property mapping (camelCase JSON → kebab-case CSS) ──────────────────
# Mirrors Yomitan's _setStructuredContentElementStyle.
_STYLE_PROPS = {
    'fontStyle', 'fontWeight', 'fontSize', 'color', 'background', 'backgroundColor',
    'verticalAlign', 'textAlign', 'textEmphasis', 'textShadow',
    'textDecorationLine', 'textDecorationStyle', 'textDecorationColor',
    'borderColor', 'borderStyle', 'borderRadius', 'borderWidth',
    'clipPath', 'wordBreak', 'whiteSpace', 'cursor', 'listStyleType',
    'margin', 'marginTop', 'marginLeft', 'marginRight', 'marginBottom',
    'padding', 'paddingTop', 'paddingLeft', 'paddingRight', 'paddingBottom',
}


def _camel_to_kebab(name: str) -> str:
    return re.sub(r'([A-Z])', lambda m: '-' + m.group(1).lower(), name)


def _build_style(style_obj: dict) -> str:
    parts = []
    for k, v in style_obj.items():
        if k not in _STYLE_PROPS:
            continue
        css_key = _camel_to_kebab(k)
        if k == 'textDecorationLine' and isinstance(v, list):
            v = ' '.join(v)
        parts.append(f'{css_key}: {v}')
    return '; '.join(parts)


def _build_dataset_attrs(data: dict) -> str:
    attrs = ''
    for k, v in data.items():
        attrs += f' data-sc-{k}="{v}"'
    return attrs


def _node_to_html(node) -> str:
    """
    Recursively convert a Yomitan structured-content node to HTML.
    No dict_name needed — CSS selectors are static (in style.css).
    """
    if node is None:
        return ''
    if isinstance(node, str):
        return node
    if isinstance(node, list):
        return ''.join(_node_to_html(child) for child in node)
    if not isinstance(node, dict):
        return str(node)

    if node.get('type') == 'structured-content':
        return _node_to_html(node.get('content', ''))

    tag = node.get('tag', '')
    if not tag:
        return _node_to_html(node.get('content', ''))

    attrs = f' class="gloss-sc-{tag}"'

    data_obj = node.get('data')
    if isinstance(data_obj, dict):
        attrs += _build_dataset_attrs(data_obj)

    lang = node.get('lang')
    if isinstance(lang, str):
        attrs += f' lang="{lang}"'

    title = node.get('title')
    if isinstance(title, str):
        attrs += f' title="{title}"'

    if node.get('open') is True:
        attrs += ' open'

    style_obj = node.get('style')
    if isinstance(style_obj, dict):
        style_str = _build_style(style_obj)
        if style_str:
            attrs += f' style="{style_str}"'

    tag_lower = tag.lower()

    if tag_lower == 'br':
        return f'<br{attrs}>'

    if tag_lower == 'table':
        inner = _node_to_html(node.get('content', ''))
        return f'<div class="gloss-sc-table-container"><table{attrs}>{inner}</table></div>'

    if tag_lower in ('th', 'td'):
        colspan = node.get('colSpan')
        rowspan = node.get('rowSpan')
        if isinstance(colspan, int):
            attrs += f' colspan="{colspan}"'
        if isinstance(rowspan, int):
            attrs += f' rowspan="{rowspan}"'
        inner = _node_to_html(node.get('content', ''))
        return f'<{tag}{attrs}>{inner}</{tag}>'

    if tag_lower == 'a':
        href = node.get('href', '')
        if isinstance(href, str):
            attrs += f' href="{href}"'
        inner = _node_to_html(node.get('content', ''))
        return f'<a{attrs}>{inner}</a>'

    if tag_lower == 'img':
        return ''  # Dictionary images not supported

    allowed = {
        'ruby', 'rt', 'rp',
        'thead', 'tbody', 'tfoot', 'tr',
        'div', 'span', 'ol', 'ul', 'li',
        'details', 'summary',
    }
    if tag_lower in allowed:
        inner = _node_to_html(node.get('content', ''))
        return f'<{tag}{attrs}>{inner}</{tag}>'

    return _node_to_html(node.get('content', ''))


def _build_css_block(dict_name: str) -> str:
    """Build the full Jitendex CSS scoped to this dictionary name."""
    n = dict_name
    return f"""<style>
.yomitan-glossary [data-dictionary="{n}"] span[title] {{ cursor: help; }}
.yomitan-glossary [data-dictionary="{n}"] ul[data-sc-content="sense-groups"] {{ list-style-type: "＊"; }}
.yomitan-glossary [data-dictionary="{n}"] li[data-sc-content="sense-group"],
.yomitan-glossary [data-dictionary="{n}"] li[data-sc-content="forms"] {{ padding-left: 0.25em; }}
.yomitan-glossary [data-dictionary="{n}"] div[data-sc-content="sense-group"],
.yomitan-glossary [data-dictionary="{n}"] li[data-sc-content="sense-group"]:first-child {{ margin-top: 0.1em; }}
.yomitan-glossary [data-dictionary="{n}"] li[data-sc-content="sense-group"] + li[data-sc-content="sense-group"],
.yomitan-glossary [data-dictionary="{n}"] div[data-sc-content="forms"],
.yomitan-glossary [data-dictionary="{n}"] li[data-sc-content="forms"] {{ margin-top: 0.5em; }}
.yomitan-glossary [data-dictionary="{n}"] li[data-sc-content="sense"] {{ padding-left: 0.25em; }}
.yomitan-glossary [data-dictionary="{n}"] li[data-sc-content="sense"] ul[data-sc-content="glossary"] {{ list-style-type: none; padding-left: 0.25em; }}
.yomitan-glossary [data-dictionary="{n}"] ul[data-sc-content="glossary"] {{ list-style-type: disc; }}
.yomitan-glossary [data-dictionary="{n}"] span[data-sc-class="tag"] {{ border-radius: 0.3em; font-size: 0.8em; font-weight: bold; margin-right: 0.5em; padding: 0.2em 0.3em; vertical-align: text-bottom; word-break: keep-all; }}
.yomitan-glossary [data-dictionary="{n}"] span[data-sc-content="part-of-speech-info"] {{ background-color: rgb(86,86,86); color: white; }}
.yomitan-glossary [data-dictionary="{n}"] span[data-sc-content="misc-info"] {{ background-color: brown; color: white; }}
.yomitan-glossary [data-dictionary="{n}"] span[data-sc-content="field-info"] {{ background-color: purple; color: white; }}
.yomitan-glossary [data-dictionary="{n}"] span[data-sc-content="dialect-info"] {{ background-color: green; color: white; }}
.yomitan-glossary [data-dictionary="{n}"] span[data-sc-content="lang-source-wasei"] {{ background-color: orange; color: black; margin-left: 0.5em; }}
.yomitan-glossary [data-dictionary="{n}"] span[data-sc-content="forms-label"] {{ background-color: rgb(86,86,86); color: white; }}
.yomitan-glossary [data-dictionary="{n}"] span[data-sc-content="registered-trademark"] {{ vertical-align: super; font-size: 0.6em; }}
.yomitan-glossary [data-dictionary="{n}"] div[data-sc-class="extra-box"] {{ border-radius: 0.4rem; border-style: none none none solid; border-width: 3px; margin-bottom: 0.5rem; margin-top: 0.5rem; padding: 0.5rem; width: fit-content; }}
.yomitan-glossary [data-dictionary="{n}"] div[data-sc-content="info-gloss"] {{ border-color: green; background-color: color-mix(in srgb, green 5%, transparent); }}
.yomitan-glossary [data-dictionary="{n}"] div[data-sc-content="sense-note"] {{ border-color: goldenrod; background-color: color-mix(in srgb, goldenrod 5%, transparent); }}
.yomitan-glossary [data-dictionary="{n}"] div[data-sc-content="lang-source"] {{ border-color: purple; background-color: color-mix(in srgb, purple 5%, transparent); }}
.yomitan-glossary [data-dictionary="{n}"] div[data-sc-content="xref"] {{ border-color: rgb(26,115,232); background-color: color-mix(in srgb, rgb(26,115,232) 5%, transparent); }}
.yomitan-glossary [data-dictionary="{n}"] div[data-sc-content="antonym"] {{ border-color: brown; background-color: color-mix(in srgb, brown 5%, transparent); }}
.yomitan-glossary [data-dictionary="{n}"] div[data-sc-content="example-sentence"] {{ border-color: currentColor; background-color: color-mix(in srgb, currentColor 5%, transparent); }}
.yomitan-glossary [data-dictionary="{n}"] div[data-sc-content="extra-info"] {{ margin-left: 0.5em; }}
.yomitan-glossary [data-dictionary="{n}"] span[data-sc-content="reference-label"] {{ font-size: 0.8em; margin-right: 0.5rem; }}
.yomitan-glossary [data-dictionary="{n}"] div[data-sc-content="example-sentence-a"] {{ font-size: 1.3em; }}
.yomitan-glossary [data-dictionary="{n}"] div[data-sc-content="example-sentence-b"] {{ font-size: 0.8em; }}
.yomitan-glossary [data-dictionary="{n}"] span[data-sc-content="example-keyword"] {{ color: color-mix(in srgb, lime, currentColor); }}
.yomitan-glossary [data-dictionary="{n}"] div[data-sc-content="attribution"] {{ font-size: 0.7em; text-align: right; }}
.yomitan-glossary [data-dictionary="{n}"] div[data-sc-content="redirect-glossary"] {{ font-size: 180%; margin-top: 0.2em; }}
.yomitan-glossary [data-dictionary="{n}"] div[data-sc-content="forms"] {{ margin-top: 0.5em; }}
.yomitan-glossary [data-dictionary="{n}"] div[data-sc-content="forms"] table {{ margin-top: 0.2em; }}
.yomitan-glossary [data-dictionary="{n}"] div[data-sc-content="forms"] th,
.yomitan-glossary [data-dictionary="{n}"] div[data-sc-content="forms"] td {{ border-style: solid; border-width: 1px; border-color: currentColor; padding: 0.25em; vertical-align: top; text-align: center; }}
.yomitan-glossary [data-dictionary="{n}"] div[data-sc-content="forms"] tr[data-sc-content="forms-header-row"] th {{ font-size: 1.2em; font-weight: bold; }}
.yomitan-glossary [data-dictionary="{n}"] td[data-sc-class="form-pri"] > span {{ color: white; background: radial-gradient(green 50%, white 100%); clip-path: circle(); display: block; font-weight: bold; padding: 0 0.5em; }}
.yomitan-glossary [data-dictionary="{n}"] td[data-sc-class="form-pri"] > span::before {{ content: "△"; }}
.yomitan-glossary [data-dictionary="{n}"] td[data-sc-class="form-irr"] > span {{ color: white; background: radial-gradient(crimson 50%, white 100%); clip-path: circle(); display: block; font-weight: bold; padding: 0 0.5em; }}
.yomitan-glossary [data-dictionary="{n}"] td[data-sc-class="form-irr"] > span::before {{ content: "✕"; }}
.yomitan-glossary [data-dictionary="{n}"] td[data-sc-class="form-valid"] > span {{ background: radial-gradient(currentColor 50%, white 100%); clip-path: circle(); display: block; font-weight: bold; padding: 0 0.5em; }}
.yomitan-glossary [data-dictionary="{n}"] td[data-sc-class="form-valid"] > span::before {{ content: "◇"; }}
.yomitan-glossary [data-dictionary="{n}"] td[data-sc-class="form-rare"] > span {{ color: white; background: radial-gradient(purple 50%, white 100%); clip-path: circle(); display: block; font-weight: bold; padding: 0 0.5em; }}
.yomitan-glossary [data-dictionary="{n}"] td[data-sc-class="form-rare"] > span::before {{ content: "▽"; }}
.yomitan-glossary [data-dictionary="{n}"] td[data-sc-class="form-out"] > span {{ color: white; background: radial-gradient(blue 50%, white 100%); clip-path: circle(); display: block; font-weight: bold; padding: 0 0.5em; }}
.yomitan-glossary [data-dictionary="{n}"] td[data-sc-class="form-out"] > span::before {{ content: "古"; }}
.yomitan-glossary [data-dictionary="{n}"] td[data-sc-class="form-old"] > span {{ color: white; background: radial-gradient(blue 50%, white 100%); clip-path: circle(); display: block; font-weight: bold; padding: 0 0.5em; }}
.yomitan-glossary [data-dictionary="{n}"] td[data-sc-class="form-old"] > span::before {{ content: "旧"; }}
</style>"""


def _defs_to_html(defs_array: list, dict_name: str) -> str:
    """
    Convert a Jitendex definitions array to compact HTML (no CSS).
    The data-dictionary attribute on the <li> is required so that
    the CSS block selectors (.yomitan-glossary [data-dictionary=...]) match.
    """
    items_html = []
    for item in defs_array:
        if isinstance(item, str):
            items_html.append(item)
        elif isinstance(item, dict) and item.get('type') == 'structured-content':
            items_html.append(_node_to_html(item.get('content', '')))
        else:
            items_html.append(_node_to_html(item))

    inner = ''.join(items_html)
    escaped = dict_name.replace('"', '&quot;')
    return (
        f'<div style="text-align:left" class="yomitan-glossary">'
        f'<ol><li data-dictionary="{escaped}">{inner}</li></ol>'
        f'</div>'
    )


class DictionaryDB:
    """Wrapper over SQLite for dictionary lookups."""
    def __init__(self, db_path: str):
        self.db_path = db_path
        self._conn = sqlite3.connect(db_path, check_same_thread=False)
        self._conn.row_factory = sqlite3.Row
        # Read-optimised pragmas
        self._conn.execute('PRAGMA journal_mode=WAL')
        self._conn.execute('PRAGMA synchronous=NORMAL')
        self._conn.execute('PRAGMA cache_size=-32000')  # ~32MB page cache
        # Load the CSS block once at startup (stored in meta table)
        self._css_block = self._load_css()

    def _load_css(self) -> str:
        try:
            cursor = self._conn.cursor()
            cursor.execute("SELECT value FROM meta WHERE key = 'css_block'")
            row = cursor.fetchone()
            return row['value'] if row else ''
        except Exception:
            return ''

    def lookup(self, term: str) -> Optional[str]:
        cursor = self._conn.cursor()
        cursor.execute('SELECT definition FROM dictionary WHERE term = ?', (term,))
        row = cursor.fetchone()
        if not row:
            return None
        # Append CSS so Anki card fields are self-contained
        return row['definition'] + self._css_block

    def close(self):
        if self._conn:
            self._conn.close()

    def __len__(self) -> int:
        cursor = self._conn.cursor()
        cursor.execute('SELECT COUNT(*) FROM dictionary')
        return cursor.fetchone()[0]


def _index_zip_to_db(zip_path: str, db_path: str):
    """Parse Yomitan zip and write compact SQLite DB."""
    os.makedirs(os.path.dirname(db_path), exist_ok=True)

    conn = sqlite3.connect(db_path)
    # Write-optimised pragmas for indexing
    conn.execute('PRAGMA journal_mode=WAL')
    conn.execute('PRAGMA synchronous=OFF')
    conn.execute('PRAGMA page_size=8192')
    conn.execute('PRAGMA cache_size=-64000')  # 64MB during build

    cursor = conn.cursor()
    cursor.execute('DROP TABLE IF EXISTS dictionary')
    cursor.execute('DROP TABLE IF EXISTS meta')
    cursor.execute('CREATE TABLE dictionary (term TEXT, definition TEXT)')
    cursor.execute('CREATE TABLE meta (key TEXT PRIMARY KEY, value TEXT)')

    dict_name = 'Jitendex'
    with zipfile.ZipFile(zip_path, 'r') as zf:
        if 'index.json' in zf.namelist():
            try:
                idx = json.loads(zf.read('index.json').decode('utf-8'))
                dict_name = idx.get('title', 'Jitendex')
            except Exception:
                pass

        # Build the CSS block once using the actual dict name, store in meta
        escaped_name = dict_name.replace('"', '&quot;')
        css_block = _build_css_block(escaped_name)
        cursor.executemany(
            'INSERT INTO meta (key, value) VALUES (?, ?)',
            [('dict_name', dict_name), ('css_block', css_block)]
        )

        names = sorted([n for n in zf.namelist() if re.search(r'term_bank_\d+\.json$', n)])
        for name in names:
            try:
                data = json.loads(zf.read(name).decode('utf-8'))
                batch = []
                seen = set()
                for entry in data:
                    if not isinstance(entry, list) or len(entry) < 6:
                        continue
                    term = entry[0]
                    if term in seen:
                        continue
                    defs = entry[5]
                    html = _defs_to_html(defs, dict_name)
                    if html:
                        batch.append((term, html))
                        seen.add(term)

                cursor.executemany(
                    'INSERT INTO dictionary (term, definition) VALUES (?, ?)',
                    batch
                )
                conn.commit()
            except Exception as e:
                print(f'[dictionary] Error indexing {name}: {e}')

    # Build index AFTER all inserts (faster than index-per-insert)
    cursor.execute('CREATE INDEX idx_term ON dictionary (term)')
    conn.commit()

    # Defragment and verify
    conn.execute('VACUUM')
    conn.close()
    print(f'[dictionary] Indexed "{dict_name}" → {db_path}')


def load(zip_path: str) -> DictionaryDB:
    """
    Load dictionary from fixed DB path.
    Re-indexes if DB is missing or ZIP is newer than DB.
    """
    db_path = _DB_PATH
    os.makedirs(os.path.dirname(db_path), exist_ok=True)

    db_missing = not os.path.exists(db_path)
    zip_newer = (
        not db_missing and
        os.path.getmtime(zip_path) > os.path.getmtime(db_path)
    )

    if db_missing or zip_newer:
        print('[dictionary] Indexing zip → dictionary.db (one-time)…')
        _index_zip_to_db(zip_path, db_path)

    return DictionaryDB(db_path)


def lookup(db: DictionaryDB, lemma: str) -> Optional[str]:
    """Look up lemma. Returns HTML string or None."""
    if db is None:
        return None
    return db.lookup(lemma)
