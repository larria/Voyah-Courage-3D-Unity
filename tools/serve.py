from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import os

os.chdir(Path(__file__).resolve().parents[1])
SimpleHTTPRequestHandler.extensions_map['.wasm'] = 'application/wasm'
print('外观 3D：http://127.0.0.1:18743', flush=True)
ThreadingHTTPServer(('127.0.0.1', 18743), SimpleHTTPRequestHandler).serve_forever()
