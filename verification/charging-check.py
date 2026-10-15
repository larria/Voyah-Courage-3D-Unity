#!/usr/bin/env python3
"""Real API-page verification. Run: python verification/charging-check.py.
Starts/stops an isolated local HTTP server; never edits Unity Build assets.
Requires Playwright Chromium and Pillow. Evidence stays beside this script.
"""
from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from threading import Thread
from playwright.sync_api import sync_playwright
from PIL import Image, ImageChops, ImageStat, ImageDraw
import io, json, time

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'verification'
PREFIX = '/charging-subpath/'

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)
    def do_GET(self):
        if self.path.startswith(PREFIX):
            self.path = '/' + self.path[len(PREFIX):]
        super().do_GET()
    def log_message(self, *args):
        pass

def image(raw):
    return Image.open(io.BytesIO(raw)).convert('RGB')

def diff(a, b, roi=None):
    if roi:
        a, b = a.crop(roi), b.crop(roi)
    d = ImageChops.difference(a, b)
    # JPEG isn't involved: captures are lossless PNG. Count pixels above noise.
    pixels = list(d.getdata())
    return {'mean_abs_rgb': round(sum(ImageStat.Stat(d).mean)/3, 5),
            'pixels_gt_12': sum(max(p) > 12 for p in pixels),
            'total_pixels': len(pixels), 'bbox': d.getbbox()}

def main():
    result = {'surface': 'real examples/api.html buttons and public window.player',
              'observed_state_readback': 'read-only diagnostic bridge observer plus rendered pixels; all mutations via UI/public API', 'errors': [], 'checks': {}}
    server = ThreadingHTTPServer(('127.0.0.1', 0), Handler)
    thread = Thread(target=server.serve_forever, daemon=True); thread.start()
    url = f'http://127.0.0.1:{server.server_port}{PREFIX}examples/api.html'
    result['url'] = url
    frames = {}
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch(headless=True, args=['--disable-background-timer-throttling','--disable-renderer-backgrounding','--disable-backgrounding-occluded-windows'])
            context = browser.new_context(viewport={'width': 1100, 'height': 850})
            # In insecure deployment contexts SubtleCrypto is absent, but Unity still
            # needs crypto.getRandomValues for its native random device. Removing
            # the whole crypto object breaks Unity's loop, not the charging bridge.
            context.add_init_script("Object.defineProperty(window.crypto,'subtle',{value:undefined,configurable:true});")
            page = context.new_page()
            page.on('pageerror', lambda e: result['errors'].append(str(e)))
            print('Starting real browser at '+url, flush=True)
            page.goto(url); page.bring_to_front()
            page.wait_for_function("window.player?.getState().lifecycle === 'ready'", timeout=180000)
            page.wait_for_timeout(2200)
            result['checks']['no_crypto_ready'] = page.evaluate("typeof crypto.subtle === 'undefined' && player.getState().lifecycle === 'ready'")
            result['checks']['capabilities'] = page.evaluate('player.getCapabilities()')
            result['focus_diagnostic'] = page.evaluate("({visibility:document.visibilityState,hasFocus:document.hasFocus(),canvas:document.querySelector('canvas').getBoundingClientRect().toJSON()})")
            viewer = page.locator('#viewer')
            def click(label):
                page.get_by_role('button', name=label, exact=True).click()
                page.wait_for_function("!document.querySelector('#feedback').textContent.includes('无法')")
                page.wait_for_timeout(350)
                if label not in ['销毁','重新挂载']:
                    page.locator('canvas').focus()
                    page.locator('canvas').click(position={'x':20,'y':20})
                return page.locator('#feedback').inner_text()
            def sample(name, count=5, spacing=280):
                seq = []
                for i in range(count):
                    seq.append(image(viewer.screenshot()))
                    result.setdefault('runtime_at_capture', {}).setdefault(name, []).append(page.evaluate('async()=> (await player._getChargingControls()).getState()'))
                    page.wait_for_timeout(spacing)
                print('Captured '+name, flush=True)
                frames[name] = seq
                result.setdefault('requested_at_capture', {})[name] = page.evaluate('player.getState().requested')
                return seq
            # Stable camera: recipe supplied by runtime investigation, adjusted
            # only through genuine canvas pointer drag, never internal fields.
            click('相机预设0'); page.wait_for_timeout(1800)
            box = viewer.bounding_box()
            x, y = box['x']+box['width']*.7, box['y']+box['height']*.5
            for _ in range(2):
                page.mouse.move(x, y); page.mouse.down()
                page.mouse.move(x-450, y, steps=40)
                page.mouse.up(); page.wait_for_timeout(1600)
            result['checks']['hidden_button'] = click('隐藏充电线'); page.wait_for_timeout(1100)
            sample('hidden')
            result['checks']['static_button'] = click('显示充电线'); page.wait_for_timeout(1100)
            sample('static')
            result['checks']['animated_button'] = click('开启充电'); page.wait_for_timeout(1100)
            sample('animated', 7, 210)
            result['checks']['stopped_button'] = click('停止充电'); page.wait_for_timeout(1100)
            sample('stopped')
            # Showing the cable while flowing must explicitly leave a static cable.
            click('开启充电'); page.wait_for_timeout(700)
            result['checks']['flow_to_static_button'] = click('显示充电线'); page.wait_for_timeout(1100)
            sample('flow_to_static')
            result['checks']['invalid_boolean'] = page.evaluate("""async()=>{const r={};for(const m of ['setCharging','setChargingCableVisible']){r[m]=[];for(const v of [1,'true',null,{},undefined]){try{await player[m](v);r[m].push('ACCEPTED')}catch(e){r[m].push(e.code)}}}return r}""")
            for kind, label in [('door','门'),('window','窗')]:
                before = image(viewer.screenshot())
                result['checks'][kind+'_open_feedback'] = click('RB'+label+'开')
                page.wait_for_timeout(2000); opened = image(viewer.screenshot())
                result['checks'][kind+'_close_feedback'] = click('RB'+label+'关')
                page.wait_for_timeout(2000); closed = image(viewer.screenshot())
                result['checks'][kind+'_visual'] = {'open': diff(before, opened), 'close': diff(opened, closed)}
                frames[kind] = [before, opened, closed]
            page.screenshot(path=str(OUT/'charging-ui.png'))
            result['checks']['before_destroy'] = page.evaluate('player.getState()')
            click('销毁')
            page.wait_for_function("player.getState().lifecycle==='destroyed'", timeout=15000)
            result['checks']['destroyed_api'] = page.evaluate("async()=>{try{await player.setCharging(true);return 'ACCEPTED'}catch(e){return e.code}}")
            click('重新挂载')
            page.wait_for_function("player.getState().lifecycle==='ready'", timeout=180000)
            page.wait_for_timeout(2000)
            result['checks']['remount_feedback'] = click('开启充电')
            result['checks']['remount_state'] = page.evaluate('player.getState()')
            click('相机预设0'); page.wait_for_timeout(1800)
            for _ in range(2):
                page.mouse.move(x, y); page.mouse.down()
                page.mouse.move(x-450, y, steps=40)
                page.mouse.up(); page.wait_for_timeout(1600)
            sample('remounted', 7, 210)
            page.screenshot(path=str(OUT/'charging-ui.png'))
            browser.close()
    except Exception as error:
        result['fatal'] = str(error)
    finally:
        server.shutdown(); server.server_close(); thread.join(timeout=5)
        result['server_stopped'] = not thread.is_alive()
        # Right-rear charging-port/cable ROI derived from the inspected
        # investigation frame at the identical viewport and orbit recipe.
        roi = (405, 385, 535, 555)
        result['cable_roi'] = roi
        for name, seq in frames.items():
            result.setdefault('frame_diffs', {})[name] = [diff(a,b) for a,b in zip(seq,seq[1:])]
            result.setdefault('cable_roi_diffs', {})[name] = [diff(a,b,roi) for a,b in zip(seq,seq[1:])]
        if 'hidden' in frames and 'static' in frames:
            result['hidden_vs_static'] = diff(frames['hidden'][0], frames['static'][0])
        # Compact contact sheet keeps several continuous frames directly inspectable.
        thumbs = []
        for name, seq in frames.items():
            for i, frame in enumerate(seq):
                thumb = frame.copy(); thumb.thumbnail((360,410))
                tile = Image.new('RGB',(360,435),'#e9edf0'); tile.paste(thumb,(0,25))
                ImageDraw.Draw(tile).text((8,7),f'{name} frame {i}',fill='black'); thumbs.append(tile)
        if thumbs:
            cols=7; rows=(len(thumbs)+cols-1)//cols
            sheet=Image.new('RGB',(cols*360,rows*435),'white')
            for i,tile in enumerate(thumbs): sheet.paste(tile,((i%cols)*360,(i//cols)*435))
            sheet.save(OUT/'charging-frames.jpg',quality=82)
        failures = []
        checks = result['checks']
        if result.get('fatal'): failures.append(result['fatal'])
        if not checks.get('no_crypto_ready'): failures.append('no-crypto startup failed')
        for method in ['setCharging','setChargingCableVisible']:
            if checks.get('invalid_boolean',{}).get(method) != ['INVALID_ARGUMENT']*5:
                failures.append(method+' invalid boolean rejection failed')
        for name, expected in [('hidden',(False,False)),('static',(False,True)),('animated',(True,True)),('stopped',(False,False)),('flow_to_static',(False,True))]:
            req = result.get('requested_at_capture',{}).get(name,{})
            if (req.get('charging'),req.get('chargingCableVisible')) != expected:
                failures.append(name+' requested state mismatch')
        for name in ['animated', 'remounted']:
            moving = result.get('cable_roi_diffs',{}).get(name,[])
            if len(moving)<6 or sum(d['pixels_gt_12']>10 for d in moving)<4:
                failures.append(name+' continuous cable pixel motion not established')
        for name in ['hidden','static','stopped','flow_to_static']:
            ds = result.get('cable_roi_diffs',{}).get(name,[])
            if not ds or any(d['pixels_gt_12']>10 for d in ds): failures.append(name+' not visually stable')
        if result.get('hidden_vs_static',{}).get('pixels_gt_12',0)<30:
            failures.append('visible cable vs hidden not visually established')
        for kind in ['door','window']:
            if any(checks.get(kind+'_visual',{}).get(s,{}).get('pixels_gt_12',0)<30 for s in ['open','close']):
                failures.append(kind+' regression lacks real visual change')
        if checks.get('destroyed_api')!='DESTROYED': failures.append('destroyed API rejection not established')
        if checks.get('remount_state',{}).get('lifecycle')!='ready': failures.append('remount not established')
        if result['errors']: failures.append('page errors observed')
        if not result['server_stopped']: failures.append('isolated server did not stop')
        result['failures'] = failures
        result['verdict'] = 'FAIL' if failures else 'PASS'
        (OUT/'charging-results.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
        print(json.dumps(result,ensure_ascii=False,indent=2))
    return 1 if result['verdict'] != 'PASS' else 0

if __name__ == '__main__':
    raise SystemExit(main())
