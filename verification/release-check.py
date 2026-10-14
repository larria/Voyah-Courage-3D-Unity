from playwright.sync_api import sync_playwright
from pathlib import Path
import json
root=Path(__file__).resolve().parent
results={}
with sync_playwright() as p:
    browser=p.chromium.launch()
    for name,viewport in [('desktop',{'width':1280,'height':900}),('mobile',{'width':390,'height':844}),('landscape',{'width':844,'height':390})]:
        context=browser.new_context(viewport=viewport)
        page=context.new_page(); errors=[];requests=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.on('request',lambda request:requests.append(request.url))
        page.route('**/*',lambda route:route.continue_() if route.request.url.startswith('http://127.0.0.1:18743/') else route.abort())
        if name=='mobile': page.add_init_script("Object.defineProperty(window,'crypto',{value:undefined,configurable:true})")
        page.goto('http://127.0.0.1:18743/examples/api.html')
        page.wait_for_function("window.player?.getState().lifecycle==='ready'",timeout=120000)
        page.wait_for_timeout(1000)
        before=page.locator('#viewer').bounding_box()
        page.get_by_role('button',name='LB窗开',exact=True).click()
        page.wait_for_function("player.getState().requested.windows?.LB===true",timeout=120000)
        page.wait_for_timeout(2200)
        page.get_by_role('button',name='LB窗关',exact=True).click()
        page.wait_for_timeout(2200)
        scroll=page.evaluate("()=>{const panel=document.querySelector('.controls');panel.scrollTop=panel.scrollHeight;return {panelScroll:panel.scrollTop,pageScroll:scrollY}}")
        page.get_by_role('button',name='收起控制台',exact=True).click()
        closed=page.locator('#viewer').bounding_box()
        page.get_by_role('button',name='展开控制台',exact=True).click()
        page.evaluate("document.querySelector('.controls').scrollTop=0")
        page.screenshot(path=str(root/f'release-{name}.png'))
        results[name]={'errors':errors,'viewerStable':before==closed,'scroll':scroll,'nonlocalRequests':[url for url in requests if not url.startswith('http://127.0.0.1:18743/')],'colors':{'paint':page.locator('#paint-buttons button').count(),'interior':page.locator('#interior-buttons button').count()}}
        context.close()
    browser.close()
(root/'release-check.json').write_text(json.dumps(results,indent=2))
print(json.dumps(results,indent=2))
