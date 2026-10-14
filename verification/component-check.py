from playwright.sync_api import sync_playwright
from pathlib import Path
from PIL import Image,ImageChops
import io,json
root=Path(__file__).resolve().parent
results={}
with sync_playwright() as p:
 b=p.chromium.launch();page=b.new_page(viewport={'width':1000,'height':900})
 page.goto('http://127.0.0.1:18743/examples/api.html');page.wait_for_function("window.player?.getState().lifecycle==='ready'",timeout=120000);page.wait_for_timeout(2000)
 base=Image.open(io.BytesIO(page.screenshot())).convert('RGB')
 for name in ['深海蓝','皓月白','旭日红','大灯开','大灯关','行驶开','行驶关','后视镜关','后视镜开','轮毂1','轮毂0','尾门切换','尾门切换','日行灯关','日行灯开','位置灯关','位置灯开','锁车开','锁车关','相机预设1','相机预设2','相机预设0']:
  before=Image.open(io.BytesIO(page.locator('#viewer').screenshot())).convert('RGB')
  page.get_by_role('button',name=name,exact=True).click();page.wait_for_timeout(2000)
  path=root/f'component-{name}.png';page.locator('#viewer').screenshot(path=str(path));after=Image.open(path).convert('RGB')
  results.setdefault(name,[]).append({'changed':ImageChops.difference(before,after).getbbox() is not None})
 results['invalid']=page.evaluate("async()=>{try{await player.setInterior('BAD')}catch(e){return e.code}}")
 results['second']=page.evaluate("async()=>{const {CarPlayer}=await import('/components/car-player.js');try{new CarPlayer(document.querySelector('#viewer'))}catch(e){return e.code}}")
 page.get_by_role('button',name='销毁',exact=True).click();page.wait_for_function("window.player.getState().lifecycle==='destroyed'",timeout=120000)
 results['after_destroy']=page.evaluate("async()=>{try{await player.setPaint('QGJ')}catch(e){return e.code}}")
 page.get_by_role('button',name='重新挂载',exact=True).click();page.wait_for_function("window.player.getState().lifecycle==='ready'",timeout=120000);results['remount']=True
 page.goto('http://127.0.0.1:18743/index.html');page.wait_for_function("window.car?.getState().lifecycle==='ready'",timeout=120000);page.get_by_title('深海蓝',exact=True).click();page.wait_for_timeout(1000);page.screenshot(path=str(root/'component-home.png'));results['home']=page.locator('#interior-name').inner_text()
 b.close()
(root/'component-check.json').write_text(json.dumps(results,ensure_ascii=False,indent=2));print(json.dumps(results,ensure_ascii=False,indent=2))
