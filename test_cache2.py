import json
import os
import time

cache_path = r'd:\Language\Sentence_Miner_Claude\data\cache\anki\known_words.json'
if os.path.exists(cache_path):
    with open(cache_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        age = time.time() - os.path.getmtime(cache_path)
        print(f'Words: {len(data.get("words", []))}')
        print(f'Note count: {data.get("note_count")}')
        print(f'Max ID: {data.get("max_note_id")}')
        print(f'Version: {data.get("cache_version")}')
        print(f'Age: {age:.1f}s')
else:
    print('Cache file not found at', cache_path)
