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

    def get_rank(self, term: str) -> int:
        cursor = self._conn.cursor()
        cursor.execute("SELECT rank FROM frequency WHERE term = ?", (term,))
        row = cursor.fetchone()
        return row['rank'] if row else 999999

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
    cursor.execute("CREATE TABLE frequency (term TEXT, rank INTEGER)")
    cursor.execute("CREATE INDEX idx_term_freq ON frequency (term)")

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

                        if entry_type != 'freq':
                            continue
                        if not isinstance(meta, dict):
                            continue

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
                            if term not in temp_ranks or rank < temp_ranks[term]:
                                temp_ranks[term] = rank
                    
                    batch = list(temp_ranks.items())
                    cursor.executemany("INSERT INTO frequency (term, rank) VALUES (?, ?)", batch)
                    conn.commit()

                except Exception as e:
                    print(f"[frequency] Error indexing {name}: {e}")
    except Exception as e:
        print(f"[frequency] Failed to open {zip_path}: {e}")
    
    cursor.execute("SELECT COUNT(*) FROM frequency")
    count = cursor.fetchone()[0]
    conn.close()
    print(f"[frequency] Indexed {count:,} entries from JPDB to {db_path}")


def load(zip_path: str) -> FrequencyDB:
    db_path = _db_path(zip_path)
    
    # Re-index if ZIP is newer than DB
    if not os.path.exists(db_path) or os.path.getmtime(zip_path) > os.path.getmtime(db_path):
        print(f'[frequency] Indexing frequency zip to SQLite (one-time)...')
        _index_zip_to_db(zip_path, db_path)
    
    return FrequencyDB(db_path)


def get_rank(db: FrequencyDB, lemma: str) -> int:
    """Return frequency rank for lemma."""
    if db is None:
        return 999999
    return db.get_rank(lemma)
