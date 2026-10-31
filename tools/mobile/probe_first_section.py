import sys
from playwright.sync_api import sync_playwright
JS="""()=>{const sec=[...document.querySelectorAll('main > section, main > header, main > div')].filter(e=>e.getBoundingClientRect().height>200)[0];if(!sec)return null;
const cs=getComputedStyle(sec),r=sec.getBoundingClientRect();
const sel=e=>e.tagName.toLowerCase()+(e.id?'#'+e.id:'')+(typeof e.className==='string'&&e.className?'.'+e.className.trim().split(/\\s+/).slice(0,2).join('.'):'');
const kids=[];sec.querySelectorAll('*').forEach(e=>{const t=[...e.childNodes].filter(n=>n.nodeType===3&&n.textContent.trim()).length;if(!t)return;const s=getComputedStyle(e);kids.push([sel(e).slice(0,52),s.color,s.fontSize,(e.textContent.trim().slice(0,22))])});
const pseudo=['::before','::after'].map(p=>{const s=getComputedStyle(sec,p);return p+' '+s.content.slice(0,10)+' bg='+s.backgroundColor+' img='+s.backgroundImage.slice(0,60)+' pos='+s.position});
const dec=[...sec.querySelectorAll('img,svg,video,canvas')].map(e=>sel(e).slice(0,40)+' '+Math.round(e.getBoundingClientRect().width)+'x'+Math.round(e.getBoundingClientRect().height));
return {sec:sel(sec),h:Math.round(r.height),bg:cs.backgroundColor,bgimg:cs.backgroundImage.slice(0,170),pseudo,kids:kids.slice(0,16),dec:dec.slice(0,6)}}"""
with sync_playwright() as p:
    b=p.chromium.launch()
    for path in sys.argv[1:]:
        pg=b.new_page(viewport={"width":360,"height":780}); pg.goto("http://localhost:8765"+path,wait_until="load"); pg.wait_for_timeout(1500)
        d=pg.evaluate(JS); print("=====",path); 
        if not d: print("none"); continue
        print(d["sec"],"h",d["h"],"bg",d["bg"],"| img",d["bgimg"]); print("  pseudo:",d["pseudo"]); print("  media:",d["dec"])
        for k in d["kids"]: print("   ",k)
        pg.close()
    b.close()
