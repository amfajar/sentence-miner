"""
ffmpeg / ffprobe wrappers for audio clip and frame extraction.
ffmpeg must be in PATH.
"""

import subprocess
import os


def get_video_duration_ms(video_path: str) -> int:
    """Use ffprobe to get video duration in milliseconds."""
    cmd = [
        'ffprobe', '-v', 'quiet',
        '-show_entries', 'format=duration',
        '-of', 'csv=p=0',
        video_path
    ]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        duration_s = float(result.stdout.strip())
        return int(duration_s * 1000)
    except Exception as e:
        print(f"[media] ffprobe failed: {e}")
        return 0


def extract_audio_clip(
    video_path: str,
    start_ms: int,
    end_ms: int,
    output_path: str,
    padding_ms: int = 500,
) -> str:
    """
    Cut audio from video between (start_ms - padding) and (end_ms + padding).
    Clamps to [0, video_duration].
    Returns output_path on success.
    """
    duration_ms = get_video_duration_ms(video_path)

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
        '-i', video_path,
        '-vn',
        '-acodec', 'libmp3lame',
        '-q:a', '3',
        output_path,
        '-y',
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
    Returns output_path on success.
    """
    seek_s = start_ms / 1000.0

    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)

    cmd = [
        'ffmpeg',
        '-ss', f'{seek_s:.3f}',
        '-i', video_path,
        '-vframes', '1',
        '-q:v', '2',
        output_path,
        '-y',
    ]
    try:
        subprocess.run(cmd, capture_output=True, check=True, timeout=60)
    except subprocess.CalledProcessError as e:
        raise RuntimeError(f"ffmpeg frame extract failed: {e.stderr.decode()}")
    return output_path
