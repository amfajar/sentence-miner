"""
ffmpeg / ffprobe wrappers for audio clip and frame extraction.
ffmpeg must be in PATH.

Supports both video files and audio-only files (mp3, wav, m4a, ogg, flac, aac, etc.).
Audio-only files: extract_audio_clip works normally; extract_frame will raise (not applicable).
"""

import os
import subprocess


# Extensions treated as audio-only (no video stream)
_AUDIO_EXTENSIONS = {'.mp3', '.wav', '.m4a', '.ogg', '.flac', '.aac', '.opus', '.wma'}


def is_audio_only(path: str) -> bool:
    """Return True if the file is an audio-only format (no video stream expected)."""
    ext = os.path.splitext(path)[1].lower()
    return ext in _AUDIO_EXTENSIONS


def get_media_duration_ms(media_path: str) -> int:
    """Use ffprobe to get media duration in milliseconds (works for audio and video)."""
    cmd = [
        'ffprobe', '-v', 'quiet',
        '-show_entries', 'format=duration',
        '-of', 'csv=p=0',
        media_path
    ]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        duration_s = float(result.stdout.strip())
        return int(duration_s * 1000)
    except Exception as e:
        print(f"[media] ffprobe failed: {e}")
        return 0


# Legacy alias
def get_video_duration_ms(video_path: str) -> int:
    return get_media_duration_ms(video_path)


def extract_audio_clip(
    media_path: str,
    start_ms: int,
    end_ms: int,
    output_path: str,
    padding_ms: int = 500,
    duration_ms: int = 0,
) -> str:
    """
    Cut audio from media (video or audio file) between (start_ms - padding) and (end_ms + padding).
    Clamps to [0, duration]. Works for both video and audio-only source files.

    duration_ms: if non-zero, use this instead of calling ffprobe (for pre-cached duration).
    Returns output_path on success.
    """
    if not duration_ms:
        duration_ms = get_media_duration_ms(media_path)

    padded_start = max(0, start_ms - padding_ms)
    padded_end = end_ms + padding_ms
    if duration_ms > 0:
        padded_end = min(padded_end, duration_ms)

    start_s = padded_start / 1000.0
    end_s = padded_end / 1000.0

    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)

    cmd = [
        'ffmpeg',
        '-ss', f'{start_s:.3f}',
        '-to', f'{end_s:.3f}',
        '-i', media_path,
        '-vn',                    # no video stream
        '-acodec', 'libmp3lame',
        '-q:a', '5',              # VBR ~130kbps — smaller than q:a 3, still great quality
        output_path, '-y',
    ]
    try:
        subprocess.run(cmd, capture_output=True, check=True, timeout=60)
    except subprocess.CalledProcessError as e:
        raise RuntimeError(f"ffmpeg audio extract failed: {e.stderr.decode()}")
    return output_path


def extract_frame(
    video_path: str,
    start_ms: int,
    end_ms: int,
    output_path: str,
) -> str:
    """
    Extract a single JPEG frame from the start of the subtitle timestamp.
    Only valid for video files — raises ValueError for audio-only sources.
    Returns output_path on success.
    """
    if is_audio_only(video_path):
        raise ValueError(f"Cannot extract frame from audio-only file: {video_path}")

    seek_s = start_ms / 1000.0

    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)

    cmd = [
        'ffmpeg',
        '-ss', f'{seek_s:.3f}',
        '-i', video_path,
        '-vframes', '1',
        '-vf', r'scale=min(960\,iw):-2',  # cap at 960px width; halves size on 1080p/4K
        '-q:v', '5',                      # JPEG ~80% quality — perfect for flashcards
        output_path, '-y',
    ]
    try:
        subprocess.run(cmd, capture_output=True, check=True, timeout=60)
    except subprocess.CalledProcessError as e:
        raise RuntimeError(f"ffmpeg frame extract failed: {e.stderr.decode()}")
    return output_path


def extract_media(
    media_path: str,
    start_ms: int,
    end_ms: int,
    audio_output_path: str | None,
    frame_output_path: str | None,
    padding_ms: int = 0,
    duration_ms: int | None = None
) -> None:
    """
    Extract audio clip and/or a single frame from a video file in a single ffmpeg call.
    """
    if not audio_output_path and not frame_output_path:
        return

    if not duration_ms:
        duration_ms = get_media_duration_ms(media_path)

    padded_start = max(0, start_ms - padding_ms)
    padded_end = end_ms + padding_ms
    if duration_ms > 0:
        padded_end = min(padded_end, duration_ms)

    start_s = padded_start / 1000.0
    duration_s = (padded_end - padded_start) / 1000.0

    cmd = [
        'ffmpeg', '-y', '-hide_banner', '-loglevel', 'error',
        '-ss', f'{start_s:.3f}',
        '-i', media_path
    ]

    if audio_output_path:
        os.makedirs(os.path.dirname(os.path.abspath(audio_output_path)), exist_ok=True)
        cmd.extend([
            '-map', '0:a?',
            '-t', f'{duration_s:.3f}',
            '-acodec', 'libmp3lame',
            '-q:a', '5',
            audio_output_path
        ])

    if frame_output_path:
        os.makedirs(os.path.dirname(os.path.abspath(frame_output_path)), exist_ok=True)
        frame_offset_s = max(0, (start_ms - padded_start)) / 1000.0
        cmd.extend([
            '-map', '0:v?',
            '-ss', f'{frame_offset_s:.3f}',
            '-vframes', '1',
            '-vf', 'scale=min(960\\,iw):-2',
            '-q:v', '5',
            frame_output_path
        ])

    try:
        subprocess.run(cmd, capture_output=True, check=True, timeout=60)
    except subprocess.CalledProcessError as e:
        raise RuntimeError(f"ffmpeg combined extract failed: {e.stderr.decode()}")
