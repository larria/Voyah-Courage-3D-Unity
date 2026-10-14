from playwright.sync_api import sync_playwright
from pathlib import Path
from PIL import Image, ImageChops
import json

ROOT = Path(__file__).resolve().parent
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(viewport={'width': 609, 'height': 300}, device_scale_factor=2)
    results = {}
    for label, url in [('official', 'https://configuration-3d-web.dsmp.voyah.com.cn/voyah-app-h37b/index.html?featureCodes=LDB,T,DR19,MPVALLSHEHAHF'), ('local', 'http://127.0.0.1:18743/unity-player/index.html?featureCodes=LDB,T,DR19,MPVALLSHEHAHF')]:
        page = context.new_page()
        requests = []
        page.on('request', lambda req: requests.append(req.url))
        page.goto(url, wait_until='load', timeout=120000)
        page.wait_for_function('window.isLoaded === true', timeout=120000)
        page.wait_for_timeout(600)
        page.evaluate("window.dyglVoyah('exteriorTab','QGJ')")
        page.wait_for_timeout(3000)
        for state, point in [('closed', None), ('door-open', (306,141)), ('door-reclosed', (379,95)), ('front-window-click', (331,95)), ('rear-window-click', (400,97)), ('rear-door-click', (401,157))]:
            if point:
                page.mouse.move(*point)
                page.wait_for_timeout(200)
                page.mouse.down()
                page.wait_for_timeout(100)
                page.mouse.up()
                page.wait_for_timeout(2500)
            page.screenshot(path=str(ROOT/f'{label}-{state}.png'))
        results[label] = {'requests': requests, 'canvas': page.evaluate("({width:canvas.width,height:canvas.height,dpr:devicePixelRatio})")}
        page.close()
    browser.close()
for state in ['closed','door-open','door-reclosed','front-window-click','rear-window-click','rear-door-click']:
    a=Image.open(ROOT/f'official-{state}.png').convert('RGB')
    b=Image.open(ROOT/f'local-{state}.png').convert('RGB')
    diff=ImageChops.difference(a,b)
    diff.save(ROOT/f'diff-{state}.png')
    histogram=diff.histogram()
    results[state]={'identical':diff.getbbox() is None,'mean_absolute_channel_error':sum((i%256)*n for i,n in enumerate(histogram))/(a.width*a.height*3)}
(ROOT/'comparison.json').write_text(json.dumps(results,indent=2))
print(json.dumps(results,indent=2))
