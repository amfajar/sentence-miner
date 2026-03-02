import json
import os
import urllib.request
import time

url = 'http://localhost:8765'
def request(action, **params):
    req_json = json.dumps({'action': action, 'version': 6, 'params': params}).encode('utf-8')
    req = urllib.request.Request(url, data=req_json)
    try:
        response = urllib.request.urlopen(req)
        return json.loads(response.read().decode('utf-8'))['result']
    except Exception as e:
        return None

print('--- ANKI COUNTS ---')
t1 = len(request('findNotes', query='note:"Japanese sentences"'))
t2 = len(request('findNotes', query='note:"Kaishi 1.5K"'))
t3 = len(request('findNotes', query='note:"Kiku"'))
print(f'Japanese sentences: {t1}')
print(f'Kaishi 1.5K: {t2}')
print(f'Kiku: {t3}')
total = t1+t2+t3
print(f'Total Anki: {total}')

all_query = 'note:"Japanese sentences" OR note:"Kaishi 1.5K" OR note:"Kiku"'
print(f'Total from OR query: {len(request("findNotes", query=all_query))}')

print('\n--- CACHE FILE ---')
cache_path = os.path.join(os.path.expanduser('~'), '.sentence_miner_cache', 'known_words.json')
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
    print('Cache not found')
