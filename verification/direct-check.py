from pathlib import Path
from playwright.sync_api import sync_playwright
from PIL import Image, ImageChops
import json
root = Path(__file__).resolve().parent
results = {}
with sync_playwright() as p:
    browser = p.chromium.launch()
    for name, size in [('desktop', {'width': 1280, 'height': 900}), ('mobile', {'width': 390, 'height': 844})]:
        page = browser.new_page(viewport=size, device_scale_factor=2)
        page.goto('http://127.0.0.1:18743/index.html')
        page.wait_for_function("document.querySelector('#status').textContent === '外观 3D 已就绪'", timeout=120000)
        page.wait_for_timeout(2000)
        results[name] = page.evaluate("({iframes:document.querySelectorAll('iframe').length,stageHeight:document.querySelector('#stage').clientHeight,canvasWidth:document.querySelector('canvas').width,canvasHeight:document.querySelector('canvas').height})")
        page.screenshot(path=str(root/f'direct-{name}.png'))
        page.get_by_title('玄英黑', exact=True).click()
        page.wait_for_timeout(1500)
        results[name]['paint'] = page.locator('#color-name').inner_text()
        results[name]['invalidPaint'] = page.evaluate("async()=>{try{await car.setPaint('INVALID');return 'unexpected success'}catch(e){return e.message}}")
        page.get_by_title('香槟金', exact=True).click()
        page.wait_for_timeout(1500)
        page.get_by_title('全屏', exact=True).click()
        page.wait_for_timeout(800)
        results[name]['fullscreen'] = page.evaluate("({active:!!document.fullscreenElement,height:document.querySelector('#stage').clientHeight})")
        page.evaluate('document.exitFullscreen()')
        page.close()
    # Same viewport comparison isolates embedding changes from the requested taller layout.
    page = browser.new_page(viewport={'width':609,'height':300}, device_scale_factor=2)
    page.goto('http://127.0.0.1:18743/index.html')
    page.add_style_tag(content='.stage{height:300px!important}.expand,.label,.tab{visibility:hidden!important}')
    page.wait_for_function("document.querySelector('#status').textContent === '外观 3D 已就绪'", timeout=120000)
    page.wait_for_timeout(2500)
    page.locator('canvas').screenshot(path=str(root/'direct-matched.png'))
    reference=Image.open(root/'official-closed.png').convert('RGB')
    actual=Image.open(root/'direct-matched.png').convert('RGB')
    diff=ImageChops.difference(reference,actual)
    diff.save(root/'direct-diff.png')
    results['matched_viewport']={'identical':diff.getbbox() is None}
    browser.close()
(root/'direct-check.json').write_text(json.dumps(results,indent=2,ensure_ascii=False))
print(json.dumps(results,indent=2,ensure_ascii=False))
