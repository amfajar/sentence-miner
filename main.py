import os
import sys
import io

<<<<<<< HEAD
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
=======
if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if sys.stderr and hasattr(sys.stderr, 'reconfigure'):
>>>>>>> 40d656f (Fix bugs: Unicode, Dict Reload, Anki Parallel Init, Duplicate Logs)
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

# -- Logging must be initialised FIRST so all subsequent imports/errors are captured --
from logger import setup_logging, log
setup_logging()

import shutil
import tempfile
import webview
from api import Api
from version import VERSION


def _get_frontend_url() -> str:
    """
    Return the file:// URL to index.html.

    - Dev mode  : frontend/index.html relative to this file
    - PyInstaller one-file exe: the frontend/ folder is extracted to
      sys._MEIPASS at runtime, so we must use that path.
    """
    if getattr(sys, 'frozen', False) and hasattr(sys, '_MEIPASS'):
        base = sys._MEIPASS
    else:
        base = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(base, 'frontend', 'index.html')


def _clear_webview_cache():
    """Delete WebView2's cached user data so stale JS/CSS is never served."""
    try:
        # WebView2 stores cache under %TEMP%\pywebview\Sentence Miner
        cache_dir = os.path.join(tempfile.gettempdir(), 'pywebview', 'Sentence Miner')
        if os.path.isdir(cache_dir):
            shutil.rmtree(cache_dir, ignore_errors=True)
    except Exception:
        pass  # Never crash on cache cleanup failure


def main():
    log.info(f'SentenceMiner v{VERSION} starting')
    log.info(f'Python {sys.version}')
    if getattr(sys, 'frozen', False):
        log.info(f'Running as frozen exe: {sys.executable}')
    else:
        log.info(f'Running from source: {__file__}')

    _clear_webview_cache()
    api = Api()
    window = webview.create_window(  # noqa: F841
        title=f'Sentence Miner v{VERSION}',
        url=_get_frontend_url(),
        js_api=api,
        width=1100,
        height=720,
        min_size=(900, 600),
        background_color='#0e0f13',
    )
    webview.start(debug=False, private_mode=True)
    log.info('SentenceMiner exited normally')


if __name__ == '__main__':
    import multiprocessing
    multiprocessing.freeze_support()
    try:
        main()
    except Exception:
        import traceback
        log.critical(f'Unhandled exception in main():\n{traceback.format_exc()}')
        raise
