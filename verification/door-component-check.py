from playwright.sync_api import sync_playwright
from pathlib import Path
import json
root=Path(__file__).resolve().parent/'door-component';root.mkdir(exist_ok=True)
results={}
with sync_playwright() as p:
 b=p.chromium.launch();page=b.new_page(viewport={'width':1100,'height':900})
 page.goto('http://127.0.0.1:18743/examples/api.html');page.wait_for_function("window.player?.getState().lifecycle==='ready'",timeout=120000);page.wait_for_timeout(1000)
 for kind,label in [('doors','门'),('windows','窗')]:
  for id in ['LF','LB','RF','RB']:
   for opened in [True,False]:
    name=id+label+('开' if opened else '关');page.get_by_role('button',name=name,exact=True).click();page.wait_for_timeout(2500)
    state=page.evaluate("async()=>{const c=await player._getDoorControls();return c.getState()}");results[name]=state
    page.locator('#viewer').screenshot(path=str(root/f'{name}.png'))
 results['invalid']=page.evaluate("async()=>{try{await player.setDoor('BAD',true)}catch(e){return e.code}}")
 results['no_animation']=page.evaluate("async()=>{await player.setWindow('LB',true,{animate:false});return (await player._getDoorControls()).getState()}")
 await_destroy=page.evaluate("async()=>{await player.destroy();return player.getState().lifecycle}");results['destroy']=await_destroy
 b.close()
(root/'results.json').write_text(json.dumps(results,ensure_ascii=False,indent=2));print(json.dumps(results,ensure_ascii=False,indent=2))
