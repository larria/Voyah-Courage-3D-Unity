from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import argparse
import os

parser = argparse.ArgumentParser(description='Serve the offline 3D player')
parser.add_argument('--host', default='127.0.0.1')
parser.add_argument('--port', type=int, default=18743)
args = parser.parse_args()
os.chdir(Path(__file__).resolve().parents[1])
SimpleHTTPRequestHandler.extensions_map['.wasm'] = 'application/wasm'
print(f'3D player: http://{args.host}:{args.port}', flush=True)
ThreadingHTTPServer((args.host, args.port), SimpleHTTPRequestHandler).serve_forever()
