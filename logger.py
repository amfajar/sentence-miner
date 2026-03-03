"""
logger.py — centralised logging setup for SentenceMiner.

Call setup_logging() once at startup (in main.py, before anything else).
All other modules import `log` from here, or use the standard
`logging.getLogger(__name__)` pattern — both route to the same file.
"""

import logging
import os
import sys
from logging.handlers import RotatingFileHandler


def _get_log_path() -> str:
    """
    Return the path to the log file next to the exe (frozen) or
    the project root (development).
    """
    if getattr(sys, 'frozen', False):
        exe_dir = os.path.dirname(sys.executable)
    else:
        exe_dir = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(exe_dir, 'SentenceMiner.log')


def setup_logging() -> logging.Logger:
    """
    Configure the root logger with:
    - RotatingFileHandler -> SentenceMiner.log (5 MB × 2 backups)
    - StreamHandler       -> stdout (for console / dev mode)

    Returns the root logger so callers can use it directly.
    Should be called ONCE as the very first thing in main.py.
    """
    root = logging.getLogger()
    if root.handlers:
        return logging.getLogger('SentenceMiner')

    log_path = _get_log_path()

    fmt = logging.Formatter(
        fmt='%(asctime)s [%(levelname)s] %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S',
    )

    # File handler — 5 MB max, 2 backups
    try:
        fh = RotatingFileHandler(
            log_path,
            maxBytes=5 * 1024 * 1024,  # 5 MB
            backupCount=2,
            encoding='utf-8',
        )
        fh.setFormatter(fmt)
        fh.setLevel(logging.DEBUG)
    except Exception:
        fh = None  # If log file isn't writable, keep going silently

    # Console handler (useful in dev mode & if the exe is run from cmd)
    sh = logging.StreamHandler(sys.stdout)
    sh.setFormatter(fmt)
    sh.setLevel(logging.DEBUG)

    root = logging.getLogger()
    root.setLevel(logging.DEBUG)
    root.handlers.clear()
    if fh:
        root.addHandler(fh)
    root.addHandler(sh)

    # Quieten noisy third-party loggers
    logging.getLogger('urllib3').setLevel(logging.WARNING)
    logging.getLogger('PIL').setLevel(logging.WARNING)
    logging.getLogger('webview').setLevel(logging.WARNING)

    log = logging.getLogger('SentenceMiner')
    log.info(f'Log file: {log_path}')
    return log


# Module-level convenience logger for code that imports this file directly
log = logging.getLogger('SentenceMiner')
