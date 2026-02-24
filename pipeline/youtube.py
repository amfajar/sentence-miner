"""
yt-dlp wrapper — downloads YouTube video + manual Japanese subtitles only.
Raises NoManualSubtitlesError if no .srt file is created after download.
Supports cookies.txt for age-restricted / members-only content.
"""

import os
import glob
import subprocess


class NoManualSubtitlesError(Exception):
    pass


def _build_cmd(url: str, output_template: str, cookies_path: str = None) -> list:
    """Build the yt-dlp command list."""
    # Lenient format chain: try best mp4 first, then any best
    format_selector = 'bv[ext=mp4]+ba[ext=m4a]/b[ext=mp4]/bv+ba/b'

    cmd = [
        'yt-dlp',
        '--write-subs',
        '--sub-langs', 'ja.*,ja',        # Match ja, ja-JP, ja-Hira, etc.
        '--convert-subs', 'srt',
        '--no-write-auto-subs',          # CRITICAL: reject auto-generated subs
        '-f', format_selector,
        '--merge-output-format', 'mp4',
        '--retries', '5',
        '--skip-unavailable-fragments',
        '-o', output_template,
    ]

    if cookies_path and os.path.exists(cookies_path):
        cmd += ['--cookies', cookies_path]

    cmd.append(url)
    return cmd


def download(url: str, output_dir: str, cookies_path: str = None) -> tuple[str, str]:
    """
    Download video + manual Japanese subtitles.
    Returns (video_filepath, srt_filepath).
    Raises NoManualSubtitlesError if no manual subtitles exist.

    Strategy:
    1. First attempt: WITHOUT cookies (avoids issues from expired cookies)
    2. If fails: WITH cookies (for members-only / age-restricted content)
    """
    os.makedirs(output_dir, exist_ok=True)

    # Auto-detect cookies.txt in the project root if not specified
    if cookies_path is None:
        default = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'cookies.txt')
        if os.path.exists(default):
            cookies_path = default

    output_template = os.path.join(output_dir, '%(title)s.%(ext)s')

    # ── Phase 1: Try WITHOUT cookies first (for public videos) ──────────────
    print("[youtube] Phase 1: Attempting download without cookies...")
    cmd_no_cookie = _build_cmd(url, output_template, cookies_path=None)
    print(f"[youtube] Running: {' '.join(cmd_no_cookie)}")

    result = subprocess.run(cmd_no_cookie, timeout=600)
    mp4_files = glob.glob(os.path.join(output_dir, '*.mp4'))

    if result.returncode != 0 or not mp4_files:
        # ── Phase 2: Retry WITH cookies (members-only / age-restricted) ─────
        if cookies_path and os.path.exists(cookies_path):
            print(f"[youtube] Phase 1 failed. Retrying with cookies: {cookies_path}")
            cmd_with_cookie = _build_cmd(url, output_template, cookies_path=cookies_path)
            print(f"[youtube] Running: {' '.join(cmd_with_cookie)}")
            result2 = subprocess.run(cmd_with_cookie, timeout=600)
            if result2.returncode != 0:
                raise RuntimeError(
                    "yt-dlp failed even with cookies.\n"
                    "Possible fixes:\n"
                    "  1. Export a fresh cookies.txt from your browser (today)\n"
                    "  2. Ensure the video URL is correct and the video exists\n"
                    "  3. Update yt-dlp: pip install -U yt-dlp"
                )
            mp4_files = glob.glob(os.path.join(output_dir, '*.mp4'))
        else:
            raise RuntimeError(
                "yt-dlp failed with no cookies available.\n"
                "Place a valid 'cookies.txt' in the app folder for restricted content."
            )

    if not mp4_files:
        raise RuntimeError("yt-dlp did not produce an mp4 file.")
    video_path = max(mp4_files, key=os.path.getmtime)
    print(f"[youtube] Video saved: {video_path}")

    # Find the .srt file — yt-dlp names subtitles like title.ja.srt
    srt_files = glob.glob(os.path.join(output_dir, '*.srt'))
    if not srt_files:
        raise NoManualSubtitlesError(
            "This video has no manual subtitles. "
            "Auto-generated subtitles are not supported. "
            "If the video is members-only, make sure cookies.txt is placed in the app folder."
        )
    srt_path = max(srt_files, key=os.path.getmtime)
    print(f"[youtube] Subtitles saved: {srt_path}")

    return video_path, srt_path

