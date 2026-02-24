"""
Settings management — loads from / saves to settings.json next to main.py.
Dictionaries are stored inside the app's own data/ folder (imported, not linked).
"""

import json
import os
import shutil
from dataclasses import dataclass, field, asdict

SETTINGS_FILE = os.path.join(os.path.dirname(__file__), 'settings.json')
DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')


@dataclass
class Settings:
    # Anki
    ankiconnect_url: str = "http://localhost:8765"
    note_type: str = "Lapis"
    deck_name: str = "Mining"
    tags: list = field(default_factory=lambda: ["sentence-miner"])

    # Dictionary paths — stored inside data/ after import
    jitendex_path: str = ""
    freq_dict_path: str = ""

    # Media
    temp_dir: str = "./media_temp"

    # Processing
    freq_threshold: int = 10000   # mine words ranked 1–threshold; skip anything > threshold
    clip_padding_ms: int = 500    # ms added before + after subtitle for audio clip


def load() -> Settings:
    """Load settings from settings.json, or return defaults if not found."""
    os.makedirs(DATA_DIR, exist_ok=True)
    if not os.path.exists(SETTINGS_FILE):
        return Settings()
    try:
        with open(SETTINGS_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
        s = Settings()
        for k, v in data.items():
            if hasattr(s, k):
                setattr(s, k, v)
        return s
    except Exception:
        return Settings()


def save(settings: Settings) -> None:
    """Persist settings to settings.json."""
    try:
        with open(SETTINGS_FILE, 'w', encoding='utf-8') as f:
            json.dump(asdict(settings), f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"[settings] Failed to save: {e}")


def import_dictionary(src_path: str, dict_type: str) -> str:
    """
    Copy a dictionary zip into the app's data/ folder.
    dict_type: 'jitendex' or 'freq'
    Returns the destination path.
    """
    os.makedirs(DATA_DIR, exist_ok=True)
    filename = os.path.basename(src_path)
    # Prefix with type to avoid collisions
    dest_filename = f"{dict_type}_{filename}"
    dest_path = os.path.join(DATA_DIR, dest_filename)
    shutil.copy2(src_path, dest_path)
    return dest_path
