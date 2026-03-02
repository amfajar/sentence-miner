import urllib.request
import json
import time
import base64
from concurrent.futures import ThreadPoolExecutor

url = "http://localhost:8765"

def request(action, **params):
    req_json = json.dumps({'action': action, 'version': 6, 'params': params}).encode('utf-8')
    req = urllib.request.Request(url, data=req_json)
    with urllib.request.urlopen(req) as response:
        return json.loads(response.read())

# Generate a small 1KB dummy file as base64
dummy_data = base64.b64encode(b"0" * 1024).decode('utf-8')

print("Testing sequential...")
t0 = time.perf_counter()
for i in range(5):
    request('storeMediaFile', filename=f'test_seq_{i}.mp3', data=dummy_data)
print(f"Sequential 5 files: {time.perf_counter() - t0:.2f}s")

print("Testing ThreadPoolExecutor (max_workers=16)...")
t0 = time.perf_counter()
with ThreadPoolExecutor(max_workers=16) as pool:
    futures = [pool.submit(request, 'storeMediaFile', filename=f'test_tpe_{i}.mp3', data=dummy_data) for i in range(20)]
    for f in futures:
        f.result()
print(f"ThreadPoolExecutor 20 files: {time.perf_counter() - t0:.2f}s")

print("Testing multi action...")
t0 = time.perf_counter()
actions = []
for i in range(20):
    actions.append({'action': 'storeMediaFile', 'params': {'filename': f'test_multi_{i}.mp3', 'data': dummy_data}})
request('multi', actions=actions)
print(f"Multi action 20 files: {time.perf_counter() - t0:.2f}s")
