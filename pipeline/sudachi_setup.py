"""
sudachi_setup.py — SudachiDict first-run auto-download.

Downloads the SudachiDict .dic file directly from GitHub Releases into
%APPDATA%\\SentenceMiner\\sudachi\\ using only Python's stdlib urllib
(no pip, no Python install needed on user machines).

Also copies the required resource files (char.def, unk.def, etc.) from
the bundled sudachipy package into the same folder, then writes
sudachi.json so SudachiPy uses that folder as its resource_dir.
"""

import logging
import json
import os
import shutil
import sys
import threading
import urllib.request
import zipfile

log = logging.getLogger('SentenceMiner.sudachi_setup')


# ── Paths ──────────────────────────────────────────────────────────────────────

def get_sudachi_dir() -> str:
    """Return %APPDATA%\\SentenceMiner\\sudachi\\ (created if needed)."""
    base = os.environ.get('APPDATA', os.path.expanduser('~'))
    path = os.path.join(base, 'SentenceMiner', 'sudachi')
    os.makedirs(path, exist_ok=True)
    return path


def get_dict_path(size: str = None) -> str | None:
    """
    Return the absolute path to the installed .dic file, or None if not found.
    size: 'small' | 'full' | None (auto-detect either)
    """
    d = get_sudachi_dir()
    candidates = []
    if size == 'small' or size is None:
        candidates.append(os.path.join(d, 'system_small.dic'))
    if size == 'full' or size is None:
        candidates.append(os.path.join(d, 'system_full.dic'))
    for c in candidates:
        if os.path.isfile(c):
            return c
    return None


def is_dict_installed() -> bool:
    """
    Return True if at least one SudachiDict .dic is in the sudachi dir,
    AND char.def is present. If .dic is present but char.def is missing
    (e.g. from an older install), try to copy the resources over now.
    """
    if get_dict_path() is None:
        return False
        
    d = get_sudachi_dir()
    if not os.path.exists(os.path.join(d, 'char.def')):
        log.warning('Dictionary found but char.def is missing. Attempting to copy resources now...')
        try:
            copy_sudachipy_resources(d)
        except Exception as e:
            log.error(f'Failed to copy sudachipy resources: {e}')
            return False
            
    return True


def get_installed_size() -> str | None:
    """Return 'small', 'full', or None."""
    d = get_sudachi_dir()
    if os.path.isfile(os.path.join(d, 'system_full.dic')):
        return 'full'
    if os.path.isfile(os.path.join(d, 'system_small.dic')):
        return 'small'
    return None


# ── Download URLs ───────────────────────────────────────────────────────────────

_URLS = {
    'small': 'https://github.com/WorksApplications/SudachiDict/releases/download/v20240409/sudachi-dictionary-20240409-small.zip',
    'full':  'https://github.com/WorksApplications/SudachiDict/releases/download/v20240409/sudachi-dictionary-20240409-full.zip',
}

# Name of the .dic inside the zip varies — we search for system_*.dic
_DIC_NAMES = {
    'small': 'system_small.dic',
    'full':  'system_full.dic',
}

# ── sudachipy Package Resource Files ───────────────────────────────────────────

def get_sudachipy_resources_dir() -> str | None:
    """
    Find the sudachipy package's built-in resources/ directory.
    This contains char.def, unk.def, and other files required at runtime.

    Checks (in order):
      1. sys._MEIPASS/sudachipy/resources/  (PyInstaller one-file bundle)
      2. The installed sudachipy package directory
    """
    # PyInstaller: bundled under sys._MEIPASS
    meipass = getattr(sys, '_MEIPASS', None)
    if meipass:
        candidate = os.path.join(meipass, 'sudachipy', 'resources')
        if os.path.isdir(candidate):
            log.debug(f'Found sudachipy resources in _MEIPASS: {candidate}')
            return candidate

    # Standard Python: ask importlib for the package location
    try:
        import importlib.util
        spec = importlib.util.find_spec('sudachipy')
        if spec and spec.origin:
            pkg_dir = os.path.dirname(spec.origin)
            candidate = os.path.join(pkg_dir, 'resources')
            if os.path.isdir(candidate):
                log.debug(f'Found sudachipy resources in package: {candidate}')
                return candidate
    except Exception as e:
        log.warning(f'Could not locate sudachipy package: {e}')

    log.error('sudachipy resources/ directory not found')
    return None


def copy_sudachipy_resources(dest_dir: str) -> list[str]:
    """
    Copy all resource files from the sudachipy package resources/ folder
    into dest_dir.  These include:
      char.def, unk.def, small_lex.csv, etc.

    Returns a list of copied filenames.
    Raises RuntimeError if the resources folder cannot be located.
    """
    src = get_sudachipy_resources_dir()
    if not src:
        raise RuntimeError(
            'Cannot find sudachipy resources/ folder.\n'
            'Make sure sudachipy is installed (pip install sudachipy).'
        )

    copied = []
    for fname in os.listdir(src):
        src_file = os.path.join(src, fname)
        if not os.path.isfile(src_file):
            continue
        dst_file = os.path.join(dest_dir, fname)
        # Never overwrite the user's .dic file
        if fname.endswith('.dic') and os.path.exists(dst_file):
            log.debug(f'Skipping existing .dic: {fname}')
            continue
        shutil.copy2(src_file, dst_file)
        copied.append(fname)
        log.debug(f'Copied resource: {fname}')

    log.info(f'Copied {len(copied)} sudachipy resource file(s) to {dest_dir}')
    return copied


# ── Download + Extract ──────────────────────────────────────────────────────────

# Cancellation flag — set to True to abort an in-progress download
_cancel_flag = threading.Event()


def cancel_download():
    """Signal any active download to stop."""
    _cancel_flag.set()


def download_and_install(
    size: str,
    on_progress=None,   # callable(downloaded_bytes, total_bytes)
    on_done=None,       # callable()
    on_error=None,      # callable(error_str)
):
    """
    Download and extract SudachiDict in a background thread.

    Args:
        size: 'small' or 'full'
        on_progress: called repeatedly during download with (bytes_downloaded, total_bytes)
        on_done: called when extraction is complete
        on_error: called if anything fails
    """
    _cancel_flag.clear()

    def _run():
        url = _URLS[size]
        dic_dest_name = _DIC_NAMES[size]
        dest_dir = get_sudachi_dir()
        zip_path = os.path.join(dest_dir, f'_sudachi_{size}.zip')

        try:
            # ── Step 1: Download ────────────────────────────────────────────
            log.info(f'Downloading SudachiDict ({size}) from: {url}')
            req = urllib.request.Request(
                url,
                headers={'User-Agent': 'SentenceMiner/1.0 (github.com/user/sentence-miner)'}
            )
            with urllib.request.urlopen(req, timeout=60) as resp:
                total = int(resp.headers.get('Content-Length', 0))
                downloaded = 0
                chunk_size = 65536  # 64KB chunks

                with open(zip_path, 'wb') as out:
                    while True:
                        if _cancel_flag.is_set():
                            raise InterruptedError('Download cancelled.')
                        chunk = resp.read(chunk_size)
                        if not chunk:
                            break
                        out.write(chunk)
                        downloaded += len(chunk)
                        if on_progress:
                            on_progress(downloaded, total)

            log.info(f'Download complete: {downloaded / 1048576:.1f} MB')

            # ── Step 2: Extract .dic ────────────────────────────────────────
            if _cancel_flag.is_set():
                raise InterruptedError('Download cancelled.')

            if on_progress:
                on_progress(downloaded, total)  # ensure 100% shown

            log.info('Extracting .dic file from zip...')
            _extract_dic(zip_path, dest_dir, dic_dest_name)

            # ── Step 3: Copy sudachipy resource files (char.def, unk.def…) ──
            log.info('Copying sudachipy resource files (char.def, unk.def, etc.)...')
            copy_sudachipy_resources(dest_dir)

            # Clean up zip
            try:
                os.remove(zip_path)
            except Exception:
                pass
            log.info('SudachiDict setup complete.')
            if on_done:
                on_done()

        except InterruptedError as e:
            # Clean up partial download
            if os.path.exists(zip_path):
                try:
                    os.remove(zip_path)
                except Exception:
                    pass
            log.info('SudachiDict download cancelled by user.')
            if on_error:
                on_error('Download was cancelled.')
        except Exception as e:
            import traceback
            log.error(f'SudachiDict download/install failed: {e}\n{traceback.format_exc()}')
            if on_error:
                on_error(str(e))
        else:
            # Clean up zip
            try:
                os.remove(zip_path)
            except Exception:
                pass
            log.info(f'SudachiDict ({size}) installed successfully to {dest_dir}')
            if on_done:
                on_done()

    t = threading.Thread(target=_run, daemon=True)
    t.start()
    return t


def _extract_dic(zip_path: str, dest_dir: str, dic_dest_name: str):
    """
    Extract only the system_*.dic from the zip into dest_dir.
    The SudachiDict zip contains a subfolder; we flatten it.
    NOTE: char.def / unk.def are NOT in this zip — they come from the
          sudachipy package and are copied by copy_sudachipy_resources().
    """
    with zipfile.ZipFile(zip_path, 'r') as zf:
        members = zf.namelist()
        log.debug(f'Zip contains {len(members)} entries')

        # Find the .dic file inside (any depth)
        dic_members = [m for m in members if m.endswith('.dic') and 'system_' in m]

        if not dic_members:
            # Fallback: any .dic file
            dic_members = [m for m in members if m.endswith('.dic')]

        if not dic_members:
            raise RuntimeError(
                f'Could not find .dic file inside the downloaded zip.\n'
                f'First 20 entries: {members[:20]}'
            )

        # Extract .dic → rename to expected name
        dic_member = dic_members[0]
        log.info(f'Extracting {dic_member} -> {dic_dest_name}')
        dic_data = zf.read(dic_member)
        dic_out = os.path.join(dest_dir, dic_dest_name)
        with open(dic_out, 'wb') as f:
            f.write(dic_data)
        log.info(f'Dictionary extracted: {len(dic_data) / 1048576:.1f} MB')
