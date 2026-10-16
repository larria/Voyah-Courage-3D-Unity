import http.server, threading, json, hashlib, shutil
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / '.publish/pwa-verification'
OUT.mkdir(parents=True, exist_ok=True)
SITE = OUT / 'site'
SITE.mkdir(exist_ok=True)
manifest = json.loads((ROOT / 'offline-manifest.json').read_text())
for item in manifest['files']:
    target = SITE / item['path']; target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(ROOT / item['path'], target)
shutil.copyfile(ROOT / 'offline-manifest.json', SITE / 'offline-manifest.json')
counts = {}
class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs): super().__init__(*args, directory=str(SITE), **kwargs)
    def translate_path(self, path):
        return super().translate_path(path.replace('/Voyah-Courage-3D-Unity/', '/', 1))
    def do_GET(self):
        name = self.path.split('?')[0]
        if name.endswith(('.data', '.wasm')): counts[name] = counts.get(name, 0) + 1
        super().do_GET()
    def log_message(self, *args): pass
server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), Handler)
threading.Thread(target=server.serve_forever, daemon=True).start()
base = f'http://127.0.0.1:{server.server_port}/Voyah-Courage-3D-Unity/'
result = {'steps': [], 'errors': []}
with sync_playwright() as p:
    browser = p.chromium.launch()
    context = browser.new_context(viewport={'width': 1280, 'height': 900})
    page = context.new_page()
    page.on('pageerror', lambda error: result['errors'].append(str(error)))
    page.goto(base)
    page.wait_for_function("window.car?.getState().lifecycle === 'ready'", timeout=180000)
    page.wait_for_function("document.querySelector('[aria-label=\"应用版本与离线状态\"]').textContent.includes('离线缓存就绪')", timeout=30000)
    page.screenshot(path=str(OUT / 'ready.png'))
    first = dict(counts)
    result['steps'].append({'first': first, 'scope': page.evaluate('navigator.serviceWorker.controller.scriptURL')})
    page.reload()
    page.wait_for_function("window.car?.getState().lifecycle === 'ready'", timeout=180000)
    assert counts == first, (counts, first)
    result['steps'].append({'refreshNoModelDownloads': True})
    page.locator('#immerse').click()
    page.wait_for_timeout(500)
    result['steps'].append({'immersiveFullscreen': page.evaluate('!!document.fullscreenElement'), 'versionHiddenWithPanel': not page.locator('.pwa-status').is_visible()})
    page.screenshot(path=str(OUT / 'immersive.png'))
    page.locator('#restore').click()
    context.set_offline(True)
    page.reload()
    page.wait_for_function("window.car?.getState().lifecycle === 'ready'", timeout=180000)
    page.locator('[data-tab=openings]').click()
    page.locator('[aria-label="左前车门：打开"]').click()
    page.wait_for_function("window.car.getState().requested.doors?.LF === true", timeout=30000)
    page.locator('[data-tab=experience]').click()
    page.locator('[aria-label="后视镜：折叠"]').click()
    page.wait_for_function("window.car.getState().requested.mirrorsFolded === true", timeout=30000)
    page.locator('[aria-label="充电流光：开启"]').click()
    page.wait_for_function("window.car.getState().requested.charging === true", timeout=30000)
    result['steps'].append({'offlineShowroomLazyControls': True})
    page.screenshot(path=str(OUT / 'offline.png'))
    page.goto(base + 'examples/api.html')
    page.wait_for_function("window.player?.getState().lifecycle === 'ready'", timeout=180000)
    result['steps'].append({'offlineAPI': True})
    page.goto(base + 'unity-player/index.html')
    page.wait_for_function("!!document.querySelector('canvas')", timeout=30000)
    page.wait_for_timeout(10000)
    page.screenshot(path=str(OUT / 'offline-unity.png'))
    result['steps'].append({'offlineUnity': page.title()})
    context.set_offline(False)
    page.goto(base)
    page.wait_for_function("window.car?.getState().lifecycle === 'ready'", timeout=180000)
    peer = context.new_page(); peer.goto(base)
    peer.wait_for_function("window.car?.getState().lifecycle === 'ready'", timeout=180000)
    # Stage a new lightweight release while retaining exactly the same binary resources.
    (SITE / 'version.json').write_text(json.dumps({'version': '1.1.1'}) + '\n')
    (SITE / 'index.html').write_text((SITE / 'index.html').read_text().replace('每个角度，皆是心动。', '新版展厅验证'))
    manifest['version'] = '1.1.1'
    for item in manifest['files']:
        data = (SITE / item['path']).read_bytes(); item['bytes'] = len(data); item['sha256'] = hashlib.sha256(data).hexdigest()
    (SITE / 'offline-manifest.json').write_text(json.dumps(manifest))
    page.bring_to_front()
    page.wait_for_function("Array.from(document.querySelectorAll('button')).some(b => b.textContent.includes('更新') && !b.hidden)", timeout=90000)
    before_update = dict(counts)
    result['steps'].append({'waitingPrompt': True, 'stillOldVersion': page.locator('[aria-label="应用版本与离线状态"]').inner_text()})
    page.screenshot(path=str(OUT / 'update-prompt.png'))
    page.on('dialog', lambda dialog: dialog.accept())
    page.get_by_role('button', name='新版已就绪 · 更新').click()
    page.wait_for_function("document.body.textContent.includes('v1.1.1') && window.car?.getState().lifecycle === 'ready'", timeout=180000)
    peer.wait_for_function("document.body.textContent.includes('v1.1.1') && window.car?.getState().lifecycle === 'ready'", timeout=180000)
    assert counts == before_update, (counts, before_update)
    result['steps'].append({'updateBothTabs': True, 'updateNoModelDownloads': True, 'counts': dict(counts)})
    page.screenshot(path=str(OUT / 'updated.png'))
    browser.close()
server.shutdown()
(OUT / 'results.json').write_text(json.dumps(result, ensure_ascii=False, indent=2))
print(json.dumps(result, ensure_ascii=False, indent=2))
