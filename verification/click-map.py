from playwright.sync_api import sync_playwright
from pathlib import Path
from PIL import Image,ImageChops
import io,json
root=Path(__file__).resolve().parent
with sync_playwright() as p:
 b=p.chromium.launch(headless=False);page=b.new_page(viewport={'width':609,'height':300},device_scale_factor=2)
 page.goto('http://127.0.0.1:18743/unity-player/index.html?featureCodes=LDB,T,DR19,MPVALLSHEHAHF');page.wait_for_function('window.isLoaded',timeout=120000);page.wait_for_timeout(600);page.evaluate("dyglVoyah('exteriorTab','QGJ')");page.wait_for_timeout(2000)
 base=Image.open(io.BytesIO(page.screenshot())).convert('RGB');results=[]
 for y in [112,120,128]:
  for x in [320,350,379,400,418,430]:
   page.mouse.click(x,y);page.wait_for_timeout(1600)
   shot=page.screenshot();im=Image.open(io.BytesIO(shot)).convert('RGB');changed=ImageChops.difference(base,im).getbbox() is not None
   if changed:
    (root/f'click-{x}-{y}.png').write_bytes(shot);results.append([x,y]);print(x,y,flush=True)
    page.mouse.click(x,y);page.wait_for_timeout(1600)
 (root/'click-map.json').write_text(json.dumps(results));b.close()
