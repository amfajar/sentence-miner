"""
build.py — One-click build helper for SentenceMiner.exe

Usage:
    python build.py

What it does:
    1. Copies ffmpeg.exe, ffprobe.exe, and yt-dlp.exe into bin/ (if found in PATH).
    2. Runs PyInstaller with SentenceMiner.spec.
    3. Prints where the output .exe landed.

Requirements:
    pip install pyinstaller

Optional (to reduce exe size):
    Download UPX from https://github.com/upx/upx/releases and add it to PATH.
"""

import os
import shutil
import subprocess
import sys


ROOT = os.path.dirname(os.path.abspath(__file__))
BIN_DIR = os.path.join(ROOT, 'bin')
SPEC_FILE = os.path.join(ROOT, 'SentenceMiner.spec')


def _copy_binary_to_bin(name: str) -> bool:
    """
    Try to copy a binary (e.g. 'ffmpeg.exe') from PATH into bin/.
    Returns True if the binary is now present in bin/, False otherwise.
    """
    dest = os.path.join(BIN_DIR, name)
    if os.path.exists(dest):
        print(f"  [ok] {name} already in bin/")
        return True

    src = shutil.which(name)
    if src:
        shutil.copy2(src, dest)
        print(f"  [ok] Copied {name} from {src}")
        return True

    print(f"  [!!] {name} not found in PATH and not in bin/ — it won't be bundled.")
    print(f"       Manually copy {name} to: {dest}")
    return False


def main():
    print("=" * 60)
    print("  SentenceMiner — PyInstaller Build")
    print("=" * 60)

    # ── Step 1: Prepare bin/ ────────────────────────────────────────
    os.makedirs(BIN_DIR, exist_ok=True)
    print("\n[1/3] Collecting binaries into bin/")
    _copy_binary_to_bin('ffmpeg.exe')
    _copy_binary_to_bin('ffprobe.exe')
    _copy_binary_to_bin('yt-dlp.exe')

    # ── Step 2: Run PyInstaller ─────────────────────────────────────
    print("\n[2/3] Running PyInstaller...")
    cmd = [sys.executable, '-m', 'PyInstaller', '--clean', SPEC_FILE]
    result = subprocess.run(cmd, cwd=ROOT)

    if result.returncode != 0:
        print("\n[ERROR] PyInstaller failed. See output above for details.")
        sys.exit(result.returncode)

    # ── Step 3: Done ────────────────────────────────────────────────
    dist_path = os.path.join(ROOT, 'dist', 'SentenceMiner.exe')
    print("\n[3/3] Build complete!")
    if os.path.exists(dist_path):
        size_mb = os.path.getsize(dist_path) / (1024 * 1024)
        print(f"  Output : {dist_path}")
        print(f"  Size   : {size_mb:.1f} MB")
    else:
        print("  Output : dist/SentenceMiner.exe (check dist/ folder)")

    print("\nDone. Share dist\\SentenceMiner.exe with users.")
    print("Note: Users still need SudachiDict installed separately.")


if __name__ == '__main__':
    main()
