from pathlib import Path
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from threading import Thread
from playwright.sync_api import sync_playwright
import hashlib,json
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'verification'
class Handler(SimpleHTTPRequestHandler):
 def __init__(self,*a,**kw):super().__init__(*a,directory=str(ROOT),**kw)
 def log_message(self,*a):pass
def hashes():return {p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in (ROOT/'unity-player/Build').glob('*') if p.is_file()}
r={'scope':'uncommitted lock semantic fix, 0 commits','frames':[],'errors':[],'failures':[],'build_before':hashes()}
s=ThreadingHTTPServer(('127.0.0.1',0),Handler);t=Thread(target=s.serve_forever,daemon=True);t.start()
try:
 with sync_playwright() as pw:
  b=pw.chromium.launch(headless=True,args=['--disable-background-timer-throttling','--disable-renderer-backgrounding'])
  p=b.new_page(viewport={'width':1440,'height':960});p.on('pageerror',lambda e:r['errors'].append(str(e)))
  p.goto(f'http://127.0.0.1:{s.server_port}/examples/api.html');p.wait_for_function("window.player && player.getState().lifecycle==='ready'",timeout=180000)
  p.evaluate("()=>{window.events=[];player.addEventListener('command',e=>events.push({command:e.detail,state:player.getState()}));}")
  def click(label,name):
   n=p.evaluate('events.length');p.get_by_role('button',name=label,exact=True).click();p.wait_for_function('(n)=>events.length>n',arg=n);p.locator('canvas').focus();p.wait_for_timeout(2600)
   p.locator('#viewer').screenshot(path=str(OUT/f'lock-{name}.png'));r['frames'].append({'name':name,'event':p.evaluate('events.at(-1)')})
  click('相机预设0','camera')
  for label,name in [('锁车','locked-1'),('解锁','unlocked'),('锁车','locked-2'),('后视镜开','mirrors-expanded'),('后视镜关','mirrors-folded'),('后视镜开','mirrors-expanded-2')]:click(label,name)
  r['invalid']=p.evaluate("async()=>{const start=events.length,out=[];for(const method of ['setLocked','setMirrors'])for(const value of [0,1,'true',null,undefined,{},[]]){try{await player[method](value);out.push({method,value:String(value),code:'ACCEPTED'})}catch(e){out.push({method,value:String(value),code:e.code})}}return {out,commands:events.length-start}}")
  r['events']=p.evaluate('events');b.close()
except Exception as e:r['failures'].append(str(e))
finally:
 s.shutdown();s.server_close();t.join(5);r['server_stopped']=not t.is_alive();r['build_after']=hashes();r['build_unchanged']=r['build_before']==r['build_after']
 for item in r['frames']:
  if item['name'].startswith(('locked','unlocked')):
   expected=item['name']!='unlocked';e=item['event'];state=e['state']['requested']
   if e['command']['value']!=(0 if expected else 1) or state.get('locked') is not expected:r['failures'].append('lock contract '+item['name'])
 if r.get('invalid',{}).get('commands')!=0 or any(x['code']!='INVALID_ARGUMENT' for x in r.get('invalid',{}).get('out',[])):r['failures'].append('invalid boolean accepted')
 (OUT/'lock-mirror-results.json').write_text(json.dumps(r,ensure_ascii=False,indent=2))
 print(json.dumps({'failures':r['failures'],'errors':r['errors'],'build_unchanged':r['build_unchanged'],'server_stopped':r['server_stopped']},ensure_ascii=False))
