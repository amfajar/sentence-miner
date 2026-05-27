"""
JPDB frequency dictionary (Yomitan zip format) loader.
Builds {term: int_rank}. Lower rank = more common word.
"""

import json
import sqlite3
import zipfile
import re
import os
from typing import Optional


class FrequencyDB:
    """Wrapper over SQLite for frequency rank lookups."""
    def __init__(self, db_path: str):
        self.db_path = db_path
        self._conn = sqlite3.connect(db_path, check_same_thread=False)
        self._conn.row_factory = sqlite3.Row
        # Read-optimised pragmas
        self._conn.execute('PRAGMA journal_mode=WAL')
        self._conn.execute('PRAGMA cache_size=-16000')  # ~16MB page cache

    def get_rank(self, term: str, reading: str = None) -> int:
        cursor = self._conn.cursor()
        
        # If reading is provided, try exact (term, reading) match first
        if reading:
            cursor.execute("SELECT rank FROM frequency WHERE term = ? AND reading = ?", (term, reading))
            row = cursor.fetchone()
            if row:
                return row['rank']
                
        # Fallback to the lowest rank for this term regardless of reading
        cursor.execute("SELECT MIN(rank) as min_rank FROM frequency WHERE term = ?", (term,))
        row = cursor.fetchone()
        return row['min_rank'] if row and row['min_rank'] is not None else 999999

    def close(self):
        if self._conn:
            self._conn.close()

    def __len__(self) -> int:
        cursor = self._conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM frequency")
        return cursor.fetchone()[0]


def _db_path(zip_path: str) -> str:
    return os.path.splitext(zip_path)[0] + '_freq.db'


def _index_zip_to_db(zip_path: str, db_path: str):
    """Read all term_meta_bank_*.json files from the zip and index into SQLite."""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("DROP TABLE IF EXISTS frequency")
    cursor.execute("CREATE TABLE frequency (term TEXT, reading TEXT, rank INTEGER)")
    cursor.execute("CREATE INDEX idx_term_reading_freq ON frequency (term, reading)")

    try:
        with zipfile.ZipFile(zip_path, 'r') as zf:
            names = sorted(
                [n for n in zf.namelist() if re.search(r'term_meta_bank_\d+\.json$', n)]
            )
            for name in names:
                try:
                    data = json.loads(zf.read(name).decode('utf-8'))
                    batch = []
                    # Keep track of lowest rank for batch insertion if needed, 
                    # but simple term:rank is usually sufficient for meta banks.
                    # We'll handle duplicates by taking the minimum rank if multiple occur.
                    temp_ranks = {} 

                    for entry in data:
                        if not isinstance(entry, list) or len(entry) < 3:
                            continue
                        term = entry[0]
                        entry_type = entry[1]
                        meta = entry[2]
                        
                        # Yomitan Frequency format sometimes puts the reading in a dict, sometimes not.
                        # JPDB sets entry[1] = 'freq', entry[2] = meta dict
                        reading = ''

                        if entry_type != 'freq':
                            continue
                        if not isinstance(meta, dict):
                            continue
                            
                        # Try to extract "reading" from the dict if provided, else empty string
                        reading = meta.get('reading', '')

                        # Extract the numeric rank
                        freq_data = meta.get('frequency', meta)
                        if isinstance(freq_data, dict):
                            rank = freq_data.get('value', None)
                        elif isinstance(freq_data, (int, float)):
                            rank = int(freq_data)
                        else:
                            rank = None

                        if rank is None:
                            rank = meta.get('value', None)

                        if rank is not None:
                            rank = int(rank)
                            key = (term, reading)
                            if key not in temp_ranks or rank < temp_ranks[key]:
                                temp_ranks[key] = rank

                    batch = [(t, r, rank) for ((t, r), rank) in temp_ranks.items()]
                    cursor.executemany("INSERT INTO frequency (term, reading, rank) VALUES (?, ?, ?)", batch)
                    conn.commit()

                except Exception as e:
                    print(f"[frequency] Error indexing {name}: {e}")
    except Exception as e:
        print(f"[frequency] Failed to open {zip_path}: {e}")
    
    cursor.execute("SELECT COUNT(*) FROM frequency")
    count = cursor.fetchone()[0]
    conn.close()
    print(f"[frequency] Indexed {count:,} entries from JPDB to {db_path}")


def _db_needs_reindex(db_path: str) -> bool:
    if not os.path.exists(db_path):
        return True
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("PRAGMA table_info(frequency)")
        columns = [row[1] for row in cursor.fetchall()]
        conn.close()
        return 'reading' not in columns
    except Exception:
        return True

def load(zip_path: str) -> FrequencyDB:
    db_path = _db_path(zip_path)
    
    # Re-index if ZIP is newer than DB or schema is outdated
    if not os.path.exists(db_path) or os.path.getmtime(zip_path) > os.path.getmtime(db_path) or _db_needs_reindex(db_path):
        print(f'[frequency] Indexing frequency zip to SQLite (one-time)...')
        _index_zip_to_db(zip_path, db_path)
    
    return FrequencyDB(db_path)


def get_rank(db: FrequencyDB, term: str, reading: str = None) -> int:
    """Return frequency rank for (lemma, optionally reading)."""
    if db is None:
        return 999999
    return db.get_rank(term, reading)


def get_best_reading(db: FrequencyDB, candidates: list[str]) -> str:
    """
    Given a list of candidate readings (hiragana/katakana strings),
    return the one with the lowest (most common) frequency rank.

    Example:
      candidates = ['すき', 'ずき']
      すき rank ≈ 100, ずき rank ≈ 14000
      -> returns 'すき'

    Falls back to candidates[0] if db is None or none found in freq dict.
    """
    if not candidates:
        return ''
    if db is None or len(candidates) == 1:
        return candidates[0]

    best = candidates[0]
    best_rank = 999999
    # Candidates are a list of readings. We assume the 'term' we are fetching for is the same as the 'lemma'.
    # Because frequency.py's get_best_reading is disconnected from 'lemma', we do NOT pass a term 
    # to db.get_rank (we just let it search where term=reading without explicitly passing reading).
    # NOTE: This means it will search `WHERE term = 'いう'`. 
    for reading in candidates:
        rank = db.get_rank(reading, reading)
        if rank < best_rank:
            best_rank = rank
            best = reading
    return best

