# -*- mode: python ; coding: utf-8 -*-
#
# SentenceMiner.spec  — PyInstaller spec file
#
# HOW TO BUILD:
#   python build.py
#   (or directly: pyinstaller SentenceMiner.spec)
#
# FFMPEG NOTE:
#   Place ffmpeg.exe and ffprobe.exe inside a folder called "bin/" in the
#   project root before building.  The spec bundles them into the exe so
#   users do NOT need ffmpeg installed separately.
#   e.g.:
#     bin/ffmpeg.exe
#     bin/ffprobe.exe
#
# YT-DLP NOTE:
#   Place yt-dlp.exe inside "bin/" as well.
#   e.g.:
#     bin/yt-dlp.exe
#
# SUDACHIDICT NOTE:
#   NOT bundled in the exe.  Users must install sudachidict-full separately.
#   SudachiPy resolves the dictionary from the Python environment at runtime
#   using its own resource-location mechanism.
#
# JITENDEX / FREQUENCY DB NOTE:
#   NOT bundled.  Users import those via the app's Settings panel.
#

import os
import sys
from PyInstaller.utils.hooks import collect_data_files, collect_submodules

block_cipher = None

# ── Locate the project root (same directory as this spec file) ────────────────
ROOT = os.path.dirname(os.path.abspath(SPEC))  # noqa: F821  (SPEC is a PyInstaller global)

# ── Data files to bundle ──────────────────────────────────────────────────────
datas = []

# 1. Frontend UI (HTML / CSS / JS)
datas += [(os.path.join(ROOT, 'frontend'), 'frontend')]

# 2. pipeline package (Python source — collected as data so relative imports work)
#    Note: the pipeline/ .py files are ALSO collected as bytecode via the
#    Analysis() imports below; this entry ensures any non-.py files in
#    pipeline/ are carried over as well.
datas += [(os.path.join(ROOT, 'pipeline'), 'pipeline')]

# 3. ffmpeg / ffprobe / yt-dlp binaries from bin/
#    Copy these EXEs into the project's bin/ folder before building.
_bin_dir = os.path.join(ROOT, 'bin')
for _binary in ('ffmpeg.exe', 'ffprobe.exe', 'yt-dlp.exe'):
    _bpath = os.path.join(_bin_dir, _binary)
    if os.path.exists(_bpath):
        datas += [(_bpath, 'bin')]
    else:
        print(f"[spec] WARNING: {_binary} not found in bin/ — it will NOT be bundled.")

# 4. Collect pywebview data files (WebView2 loader DLLs, etc.)
datas += collect_data_files('webview')

# 5. ebooklib data files (if any)
try:
    datas += collect_data_files('ebooklib')
except Exception:
    pass

# ── Hidden imports ─────────────────────────────────────────────────────────────
# PyInstaller's static analysis misses these because they are loaded
# conditionally or are C-extension entry points.
hidden_imports = [
    # ── pywebview ──────────────────────────────────────────────────────────
    'webview',
    'webview.platforms.winforms',    # Windows backend (EdgeChromium / WebView2)
    'webview.guilib',
    'clr',                           # pythonnet (required by pywebview on Windows)

    # ── SudachiPy ──────────────────────────────────────────────────────────
    # SudachiPy uses entry_points to load its tokenizer; PyInstaller often
    # misses the C-extension plugin.
    'sudachipy',
    'sudachipy.tokenizer',
    'sudachipy.dictionary',
    'sudachipy.morphemelist',
    'sudachipy.config',

    # ── yt-dlp / downloader plugins ────────────────────────────────────────
    # yt-dlp dynamically imports many extractors; bundled as exe it is
    # invoked via subprocess so these hidden imports are only needed if you
    # import yt_dlp as a library (which this app does NOT — it uses the CLI).
    # Kept here as a safety net in case a future refactor imports it directly.
    'yt_dlp',

    # ── Other runtime imports found via `import x` inside functions ────────
    'srt',
    'lxml',
    'lxml.etree',
    'lxml._elementpath',    # Required by lxml at runtime
    'bs4',
    'ebooklib',
    'ebooklib.epub',
    'requests',
    'urllib3',
    'charset_normalizer',
    'certifi',

    # ── Standard library modules that PyInstaller sometimes misses ─────────
    'dataclasses',
    'sqlite3',
    'zipfile',
    'queue',
    'uuid',
    'hashlib',
    'threading',
    'concurrent.futures',
]

# Collect all submodules of packages that use dynamic loading
hidden_imports += collect_submodules('sudachipy')

a = Analysis(
    [os.path.join(ROOT, 'main.py')],
    pathex=[ROOT],
    binaries=[],
    datas=datas,
    hiddenimports=hidden_imports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[
        # Keep the bundle lean — exclude things we definitely don't need
        'tkinter',
        'matplotlib',
        'numpy',
        'scipy',
        'PIL',
        'IPython',
        'pytest',
        'setuptools',
        'pip',
        'wheel',
        # SudachiDict is resolved at run-time from the user's environment,
        # NOT bundled — exclude to avoid accidentally pulling it in.
        'sudachidict_full',
        'sudachidict_core',
        'sudachidict_small',
    ],
    noarchive=False,
    optimize=0,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)  # noqa: F821

# ── Check for icon ─────────────────────────────────────────────────────────────
_icon_path = os.path.join(ROOT, 'icon.ico')
_icon = _icon_path if os.path.exists(_icon_path) else None

exe = EXE(  # noqa: F821
    pyz,
    a.scripts,
    a.binaries,
    a.datas,
    [],
    name='SentenceMiner',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,          # compress if UPX is available (optional; set to False to skip)
    upx_exclude=[],
    runtime_tmpdir=None,
    console=False,     # No console window — set to True temporarily for debugging
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon=_icon,
    onefile=True,      # Single .exe output
)
