from playwright.sync_api import sync_playwright
from pathlib import Path
from PIL import Image,ImageChops
import json
root=Path(__file__).resolve().parent
with sync_playwright() as p:
 b=p.chromium.launch();page=b.new_page(viewport={'width':609,'height':300},device_scale_factor=2)
 page.goto('http://127.0.0.1:18743/unity-player/index.html?featureCodes=LDB,T,DR19,MPVALLSHEHAHF');page.wait_for_function('window.isLoaded',timeout=120000);page.wait_for_timeout(3000)
 before=page.screenshot(); (root/'probe-before.png').write_bytes(before)
 rows=[]
 for method in ['toggleTrunk','toggleDoorWindow','toggleDoor']:
  for arg in ['0','1','2','3']:
   page.evaluate('([m,a])=>m==="toggleTrunk"?unityInstance.SendMessage("ZY",m):unityInstance.SendMessage("ZY",m,Number(a))',[method,arg]);page.wait_for_timeout(2000)
   name=f'probe-{method}-{arg}.png';page.screenshot(path=str(root/name))
   changed=ImageChops.difference(Image.open(root/'probe-before.png'),Image.open(root/name)).getbbox() is not None
   rows.append([method,arg,changed]);print(rows[-1],flush=True)
 (root/'probe.json').write_text(json.dumps(rows,indent=2));b.close()
