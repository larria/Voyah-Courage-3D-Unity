from playwright.sync_api import sync_playwright
from pathlib import Path
import json
root=Path(__file__).resolve().parent
with sync_playwright() as p:
 b=p.chromium.launch(headless=False)
 page=b.new_page(viewport={'width':1000,'height':760}); logs=[]
 page.on('console',lambda m: logs.append({'type':m.type,'text':m.text}))
 page.goto('http://127.0.0.1:18743/unity-player/index.html?featureCodes=LDB,T,DR19,MPVALLSHEHAHF');page.wait_for_function('window.isLoaded',timeout=120000)
 page.evaluate("dyglVoyah('exteriorTab','QGJ')");page.wait_for_timeout(3000)
 page.screenshot(path=str(root/'scene-api-before.png'))
 page.evaluate("async()=>{ const {createRuntimeControls}=await import('/components/runtime-controls.js');window.verifiedControls=createRuntimeControls(unityInstance); }")
 for i,(target,method,arg) in enumerate([('/ZY','toggleTrunk',None),('/ZY','toggleTrunk',None),('/ZY','toggleDoor',1),('/ZY','toggleDoor',1),('/ZY','toggleDoor',2),('/ZY','toggleDoor',2),('/ZY','toggleDoor',4),('/ZY','toggleDoor',4),('/ZY','toggleDoor',8),('/ZY','toggleDoor',8),('/ZY','toggleDoorWindow',1)]):
  logs.clear()
  try:
   if method=='toggleTrunk': page.evaluate('verifiedControls.toggleTrunk()')
   else: page.evaluate('([t,m,a])=>a===null?unityInstance.SendMessage(t,m):unityInstance.SendMessage(t,m,a)',[target,method,arg])
  except Exception as ex: logs.append({'exception':str(ex)})
  page.wait_for_timeout(2500)
  page.screenshot(path=str(root/f'scene-api-{i}-{target.replace("/","root-")}-{method}-{arg}.png'))
  print(target,method,arg,logs,flush=True)
 b.close()
