import os
import shutil
import tempfile
import webview
from api import Api


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
    _clear_webview_cache()
    api = Api()
    window = webview.create_window(
        title='Sentence Miner',
        url='frontend/index.html',
        js_api=api,
        width=1100,
        height=720,
        min_size=(900, 600),
        background_color='#0e0f13',
    )
    webview.start(debug=False, private_mode=True)


if __name__ == '__main__':
    main()
