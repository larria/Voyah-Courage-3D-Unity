#!/usr/bin/env python3
"""Real Unity UI verification; python verification/interior-mode-check.py."""
from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from threading import Thread
from playwright.sync_api import sync_playwright
from PIL import Image, ImageChops, ImageStat
import io, json, hashlib
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'verification'
class Handler(SimpleHTTPRequestHandler):
    def __init__(self,*a,**kw): super().__init__(*a,directory=str(ROOT),**kw)
    def do_GET(self):
        if self.path.startswith('/interior-subpath/'): self.path='/'+self.path[len('/interior-subpath/'):]
        super().do_GET()
    def log_message(self,*a): pass
def hashes():
    paths=list((ROOT/'unity-player/Build').glob('*'))+[ROOT/'components/door-controls.js',ROOT/'components/charging-controls.js']
    return {str(p.relative_to(ROOT)):hashlib.sha256(p.read_bytes()).hexdigest() for p in paths if p.is_file()}
def main():
    r={'checks':{},'errors':[],'failures':[],'boundary':'dispatched is not animation completion; pixels are sampled after waits'}
    baseline=hashes(); server=ThreadingHTTPServer(('127.0.0.1',0),Handler); thread=Thread(target=server.serve_forever,daemon=True);thread.start()
    frames={}
    try:
        with sync_playwright() as pw:
            browser=pw.chromium.launch(headless=True,args=['--disable-background-timer-throttling','--disable-renderer-backgrounding'])
            ctx=browser.new_context(viewport={'width':1100,'height':850})
            ctx.add_init_script("Object.defineProperty(crypto,'subtle',{value:undefined,configurable:true});")
            page=ctx.new_page();page.on('pageerror',lambda e:r['errors'].append(str(e)))
            page.goto(f'http://127.0.0.1:{server.server_port}/interior-subpath/examples/api.html')
            page.wait_for_function('window.player !== undefined')
            r['checks']['queued']=page.evaluate("()=>{window.events=[];player.addEventListener('command',e=>events.push({result:e.detail,state:player.getState()}));window.queued=Promise.all([player.setInterior('P'),player.enterInterior()]);return player.getState().lifecycle}")
            page.wait_for_function("player.getState().lifecycle==='ready'",timeout=180000)
            page.evaluate('()=>queued');page.wait_for_timeout(2500)
            r['checks']['queued_default']=page.evaluate('()=>events.slice(0,2)')
            r['checks']['crypto']=page.evaluate("()=>({subtle:typeof crypto.subtle,random:typeof crypto.getRandomValues})")
            def click(label):
                n=page.evaluate('events.length');page.get_by_role('button',name=label,exact=True).click()
                page.wait_for_function('(n)=>events.length>n',arg=n,timeout=30000)
                page.locator('canvas').focus();page.wait_for_timeout(2200)
            def shot(name):
                # Original scene transitions can briefly render all-white. Capture
                # only a visibly populated frame, bounded; never count white as success.
                for attempt in range(15):
                    raw=page.locator('#viewer').screenshot()
                    frame=Image.open(io.BytesIO(raw)).convert('RGB')
                    if sum(ImageStat.Stat(frame).stddev)>20: break
                    page.wait_for_timeout(1000)
                else: raise RuntimeError('blank rendered frame: '+name)
                (OUT/('interior-'+name+'.png')).write_bytes(raw)
                frames[name]=frame
                r['checks'][name]=page.evaluate('player.getState()')
            def delta(a,b):
                d=ImageChops.difference(frames[a],frames[b]);return round(sum(ImageStat.Stat(d).mean)/3,3)
            click('返回外观');shot('exterior')
            for code,label in [('R','旭日红'),('P','深海蓝'),('Q','皓月白')]:
                click(label);click('进入内饰');shot(code);click('返回外观');shot('exit-'+code)
            click('进入内饰');shot('before-color');click('旭日红');shot('inside-color')
            box=page.locator('canvas').bounding_box();x=box['x']+box['width']*.6;y=box['y']+box['height']*.5
            page.mouse.move(x,y);page.mouse.down();page.mouse.move(x-180,y+40,steps=30);page.mouse.up();page.wait_for_timeout(1800);shot('rotated')
            r['checks']['visual_diffs']={a+'->'+b:delta(a,b) for a,b in [('exterior','R'),('R','P'),('P','Q'),('Q','exit-Q'),('before-color','inside-color'),('inside-color','rotated')]}
            r['checks']['rapid']=page.evaluate("async()=>{const start=events.length;await Promise.all([player.enterInterior('P'),player.enterInterior('P'),player.exitInterior(),player.enterInterior('Q')]);return events.slice(start)}")
            r['checks']['invalid']=page.evaluate("async()=>{const out=[];for(const v of ['', 'r',null,1,{},['R']]){try{await player.enterInterior(v);out.push('ACCEPTED')}catch(e){out.push(e.code)}}return out}")
            click('返回外观');click('相机预设0')
            # Reuse the established rear-quarter orbit recipe for charging/door visibility.
            for _ in range(2):
                page.mouse.move(x,y);page.mouse.down();page.mouse.move(x-450,y,steps=40);page.mouse.up();page.wait_for_timeout(1600)
            for label,name in [('隐藏充电线','cable-hidden'),('显示充电线','cable-visible'),('开启充电','charging'),('停止充电','charging-stop'),('RB门开','door-open'),('RB门关','door-close'),('RB窗开','window-open'),('RB窗关','window-close')]: click(label);shot(name)
            r['checks']['regression_diffs']={a+'->'+b:delta(a,b) for a,b in [('cable-hidden','cable-visible'),('cable-visible','charging-stop'),('door-open','door-close'),('window-open','window-close')]}
            r['checks']['events']=page.evaluate('events')
            page.get_by_role('button',name='销毁',exact=True).click();page.wait_for_function("player.getState().lifecycle==='destroyed'",timeout=30000)
            r['checks']['destroyed']=page.evaluate("async()=>{let o=[];for(const m of ['enterInterior','exitInterior'])try{await player[m]();o.push('ACCEPTED')}catch(e){o.push(e.code)}return o}")
            page.get_by_role('button',name='重新挂载',exact=True).click()
            r['checks']['destroy_loading']=page.evaluate("async()=>{const phase=player.getState().lifecycle;const pending=[player.enterInterior(),player.exitInterior()].map(p=>p.then(()=> 'ACCEPTED',e=>e.code));await player.destroy();return {phase,results:await Promise.all(pending),state:player.getState()}}")
            browser.close()
    except Exception as e:r['failures'].append(str(e))
    finally:
        server.shutdown();server.server_close();thread.join(5)
        r['server_stopped']=not thread.is_alive();r['protected_hashes_unchanged']=baseline==hashes()
        c=r['checks']
        if c.get('invalid')!=['INVALID_ARGUMENT']*6:r['failures'].append('strict argument rejection')
        if c.get('destroyed')!=['DESTROYED']*2:r['failures'].append('destroyed rejection')
        loading=c.get('destroy_loading',{})
        if loading.get('phase')=='ready' or loading.get('results')!=['DESTROYED']*2 or loading.get('state',{}).get('lifecycle')!='destroyed':r['failures'].append('destroy while pre-ready queued rejection')
        if c.get('queued')=='ready':r['failures'].append('pre-ready not exercised')
        ev=c.get('queued_default',[])
        if len(ev)!=2 or ev[1]['result'].get('value')!='P':r['failures'].append('latest queued default')
        for k,v in c.get('visual_diffs',{}).items():
            if v<0.1:r['failures'].append('no visual change '+k)
        if len(c.get('visual_diffs',{}))!=6:r['failures'].append('missing visual coverage')
        for k,v in c.get('regression_diffs',{}).items():
            if v<0.01:r['failures'].append('no regression visual '+k)
        rapid=c.get('rapid',[])
        if [(e['result']['method'],e['result'].get('value')) for e in rapid]!=[('interiorTab','P'),('interiorTab','P'),('jumpState',1),('interiorTab','Q')]:r['failures'].append('rapid/repeat dispatch contract')
        if len(c.get('regression_diffs',{}))!=4:r['failures'].append('missing regression coverage')
        if c.get('crypto')!={'subtle':'undefined','random':'function'}:r['failures'].append('crypto fallback setup')
        for e in c.get('events',[]):
            if e['result']['observed'] is not False:r['failures'].append('observed contract')
            method=e['result']['method'];req=e['state']['requested']
            if method=='interiorTab' and (req.get('viewMode')!='interior' or req.get('interior')!=e['result']['value']):r['failures'].append('command event state ordering')
            if method=='jumpState' and req.get('viewMode')!='exterior':r['failures'].append('exit event state ordering')
        if c.get('before-color',{}).get('requested',{}).get('interior')!='Q':r['failures'].append('latest color default')
        if c.get('inside-color',{}).get('requested',{}).get('viewMode')!='interior':r['failures'].append('setInterior changed viewMode')
        if r['errors'] or not r['server_stopped'] or not r['protected_hashes_unchanged']:r['failures'].append('runtime/protected/server error')
        r['verdict']='FAIL' if r['failures'] else 'PASS'
        (OUT/'interior-mode-results.json').write_text(json.dumps(r,ensure_ascii=False,separators=(',',':'))+'\n')
        print(json.dumps({'verdict':r['verdict'],'failures':r['failures'],'visual':c.get('visual_diffs'),'regression':c.get('regression_diffs')},ensure_ascii=False))
    return int(r['verdict']!='PASS')
if __name__=='__main__':raise SystemExit(main())
