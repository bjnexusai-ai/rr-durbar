import sys
from playwright.sync_api import sync_playwright
PAGES=sys.argv[1:] or ["/"]
JS="""()=>{
const num=c=>c.match(/[\\d.]+/g).map(Number);
const out=[];
document.querySelectorAll('body *').forEach(e=>{
 const s=getComputedStyle(e);if(s.display==='none'||s.visibility==='hidden')return;
 const r=e.getBoundingClientRect();if(r.width<300||r.height<70)return;
 const c=s.backgroundColor,bi=s.backgroundImage;let dark=false,why='';
 if(c&&c!=='rgba(0, 0, 0, 0)'){const [R,G,B,A]=num(c);if((A===undefined||A>0.5)&&R>G*1.5&&R>B*1.5&&R<190){dark=true;why=c}}
 if(!dark&&bi&&bi.includes('gradient')){const m=bi.match(/rgba?\\([^)]*\\)/g)||[];const reds=m.filter(x=>{const [R,G,B,A]=num(x);return (A===undefined||A>0.5)&&R>G*1.5&&R>B*1.5&&R<190});if(reds.length&&reds.length>=m.length/2){dark=true;why='grad:'+reds[0]}}
 if(dark){const cl=(e.className&&e.className.baseVal===undefined?e.className:'').toString().split(/\\s+/).filter(Boolean).slice(0,2).join('.');
  out.push([e.tagName.toLowerCase()+(e.id?'#'+e.id:'')+(cl?'.'+cl:''),why,Math.round(r.top+scrollY),Math.round(r.height),s.position])}});
return out}"""
with sync_playwright() as p:
    b=p.chromium.launch()
    for path in PAGES:
        pg=b.new_page(viewport={"width":360,"height":780}); pg.goto("http://localhost:8765"+path,wait_until="load"); pg.wait_for_timeout(900)
        h=pg.evaluate("document.body.scrollHeight")
        for y in range(0,h,500): pg.evaluate("window.scrollTo(0,%d)"%y); pg.wait_for_timeout(40)
        pg.wait_for_timeout(400); res=pg.evaluate(JS); print(f"== {path} page {h}px, red/maroon blocks: {len(res)}")
        for r in sorted(res,key=lambda x:x[2]): print("   y%5d h%5d %-9s %-44s %s"%(r[2],r[3],r[4],r[0][:44],r[1][:48]))
        pg.close()
    b.close()
