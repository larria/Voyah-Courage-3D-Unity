from pathlib import Path
import json
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parent
with sync_playwright() as p:
    browser=p.chromium.launch()
    page=browser.new_page()
    messages=[];exceptions=[];failed=[]
    page.on('console',lambda m:messages.append({'level':m.type,'text':m.text,'location':m.location}))
    page.on('pageerror',lambda e:exceptions.append(str(e)))
    page.on('requestfailed',lambda r:failed.append({'url':r.url,'failure':r.failure}))
    page.goto('http://127.0.0.1:18743/index.html')
    page.wait_for_function("window.car?.getState().lifecycle==='ready'",timeout=120000)
    for name in ['深海蓝','皓月白','旭日红']:
        page.get_by_title(name,exact=True).click()
        page.wait_for_timeout(500)
    page.evaluate("async()=>{await car.setDoor('LF',true);await car.setDoor('LF',false)}")
    page.wait_for_timeout(1000)
    report={'exceptions':exceptions,'failedRequests':failed,'console':messages,'lifecycle':page.evaluate('car.getState().lifecycle')}
    (root/'log-check.json').write_text(json.dumps(report,indent=2,ensure_ascii=False))
    print(json.dumps({'exceptions':exceptions,'failedRequests':failed,'errorMessages':[m['text'] for m in messages if m['level']=='error'],'lifecycle':report['lifecycle']},ensure_ascii=False,indent=2))
    browser.close()
