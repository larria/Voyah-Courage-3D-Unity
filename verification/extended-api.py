from playwright.sync_api import sync_playwright
from pathlib import Path
from PIL import Image,ImageChops
import io,json
root=Path(__file__).resolve().parent/'extended-api';root.mkdir(exist_ok=True)
cases={'setRearview':[1,0,1],'setDaytimeRunningLight':[1,0],'setpositionLampLight':[1,0],'setRearLogoLightLight':[1,0],'setCarChargingCable':[1,0],'setCarDoorHandle':[0,1,0],'carLockStatus':[0,1,0],'setWheelType':[1,0,2],'setVersion':[1,0,2],'setLightBinker':[None],'carControlFindCar':[None],'carCameraperspective':[0,1,2,3,4,5],'jumpState':[0,1,2,3]}
results={}
with sync_playwright() as p:
 b=p.chromium.launch()
 for method,args in cases.items():
  page=b.new_page(viewport={'width':900,'height':650});logs=[];page.on('console',lambda m:logs.append(m.text) if m.type=='error' else None)
  page.goto('http://127.0.0.1:18743/unity-player/index.html?featureCodes=LDB,T,DR19,MPVALLSHEHAHF');page.wait_for_function('window.isLoaded',timeout=120000);page.wait_for_timeout(500);page.evaluate("dyglVoyah('exteriorTab','QGJ')");page.wait_for_timeout(1800)
  shots=[];base=Image.open(io.BytesIO(page.screenshot())).convert('RGB');base.save(root/f'{method}-baseline.png');previous=base
  for index,arg in enumerate(args):
   logs.clear()
   try:
    page.evaluate('([m,a])=>a===null?unityInstance.SendMessage("API",m):unityInstance.SendMessage("API",m,a)',[method,arg])
   except Exception as error:
    logs.append(str(error))
   page.wait_for_timeout(1800)
   path=root/f'{method}-{index}-{arg}.png';page.screenshot(path=str(path));im=Image.open(path).convert('RGB')
   shots.append({'arg':arg,'changed':ImageChops.difference(previous,im).getbbox() is not None,'baseline_equal':ImageChops.difference(base,im).getbbox() is None,'errors':list(logs)});previous=im
  results[method]=shots;(root/'results.json').write_text(json.dumps(results,indent=2));print(method,json.dumps(shots),flush=True);page.close()
 b.close()
(root/'results.json').write_text(json.dumps(results,indent=2))
