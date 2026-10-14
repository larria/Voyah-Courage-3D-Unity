from playwright.sync_api import sync_playwright
from pathlib import Path
from PIL import Image, ImageChops
import json
ROOT=Path(__file__).resolve().parent
states=[('black','exterior','XYH'),('gray','exterior','JSH'),('white','exterior','NUB'),('gold','exterior','QGJ'),('front-window','triggerDoorWindowLF',None),('rear-window','triggerDoorWindowLB',None),('rear-door','triggerDoorLB',None),('trunk','triggerTrunk',None)]
results={}
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True)
 context=browser.new_context(viewport={'width':609,'height':300},device_scale_factor=2)
 for label,url in [('official','https://configuration-3d-web.dsmp.voyah.com.cn/voyah-app-h37b/index.html?featureCodes=LDB,T,DR19,MPVALLSHEHAHF'),('local','http://127.0.0.1:18743/unity-player/index.html?featureCodes=LDB,T,DR19,MPVALLSHEHAHF')]:
  page=context.new_page(); errors=[]
  page.on('console',lambda msg: errors.append(msg.text) if msg.type=='error' else None)
  if label=='local': page.route('**/*',lambda route: route.continue_() if route.request.url.startswith('http://127.0.0.1:18743/') else route.abort())
  page.goto(url);page.wait_for_function('window.isLoaded === true',timeout=120000);page.wait_for_timeout(600)
  page.evaluate("dyglVoyah('exteriorTab','QGJ')");page.wait_for_timeout(2500)
  for state,method,arg in states:
   page.evaluate('([method,arg])=>arg===null?dyglVoyah(method):dyglVoyah(method,arg)',[method,arg]);page.wait_for_timeout(2500)
   page.screenshot(path=str(ROOT/f'{label}-{state}.png'))
  results[label]={'console_errors':errors}
  page.close()
 browser.close()
for state,_,_ in states:
 a=Image.open(ROOT/f'official-{state}.png').convert('RGB');b=Image.open(ROOT/f'local-{state}.png').convert('RGB');diff=ImageChops.difference(a,b)
 results[state]={'identical':diff.getbbox() is None,'changed_from_gold': ImageChops.difference(b,Image.open(ROOT/'local-gold.png').convert('RGB')).getbbox() is not None}
 diff.save(ROOT/f'diff-{state}.png')
(ROOT/'exterior-check.json').write_text(json.dumps(results,indent=2));print(json.dumps(results,indent=2))
