from playwright.sync_api import sync_playwright
from pathlib import Path
from PIL import Image,ImageChops
import io,json
root=Path(__file__).resolve().parent
cases=[('interior','P'),('interior','Q'),('interior','R'),('setFrontLight',1),('setFrontLight',0),('carDrivingStatus',1),('setRearview',1),('setCarDoorHandle',1),('carLockStatus',1),('carCameraperspective',1),('ZY:toggleDoorWindow',1),('ZY:toggleDoorWindow',2),('ZY:toggleTrunk',None)]
results=[]
with sync_playwright() as p:
 b=p.chromium.launch()
 for method,arg in cases:
  page=b.new_page(viewport={'width':756,'height':600},device_scale_factor=1)
  logs=[];page.on('console',lambda m:logs.append(m.text) if m.type=='error' else None)
  page.goto('http://127.0.0.1:18743/unity-player/index.html?featureCodes=LDB,T,DR19,MPVALLSHEHAHF');page.wait_for_function('window.isLoaded',timeout=120000);page.wait_for_timeout(500);page.evaluate("dyglVoyah('exteriorTab','QGJ')");page.wait_for_timeout(2000)
  before=Image.open(io.BytesIO(page.screenshot())).convert('RGB');logs.clear()
  target,func=method.split(':') if ':' in method else ('API',method)
  page.evaluate('([t,m,a])=>a===null?unityInstance.SendMessage(t,m):unityInstance.SendMessage(t,m,a)',[target,func,arg]);page.wait_for_timeout(2500)
  name=f'api-{target}-{func}-{arg}.png';page.screenshot(path=str(root/name));after=Image.open(root/name).convert('RGB')
  results.append({'target':target,'method':func,'arg':arg,'changed':ImageChops.difference(before,after).getbbox() is not None,'errors':logs});print(results[-1],flush=True);page.close()
 b.close()
(root/'api-probe.json').write_text(json.dumps(results,indent=2))
