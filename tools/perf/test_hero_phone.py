import sys,threading,http.server
from playwright.sync_api import sync_playwright
root=sys.argv[1] if len(sys.argv)>1 else 'public'
class Q(http.server.SimpleHTTPRequestHandler):
    def __init__(s,*a,**k): super().__init__(*a,directory=root,**k)
    def log_message(s,*a): pass
srv=http.server.ThreadingHTTPServer(('127.0.0.1',0),Q)
threading.Thread(target=srv.serve_forever,daemon=True).start()
URL='http://127.0.0.1:%d/'%srv.server_address[1]
JS=r"""()=>{
 const R=e=>{const b=e.getBoundingClientRect();return {l:b.left,t:b.top,r:b.right,b:b.bottom}};
 const hit=(a,b)=>a.l<b.r&&b.l<a.r&&a.t<b.b&&b.t<a.b;
 const row=document.querySelector('#home .rr-hero-order'); if(!row) return {err:'no CTA row'};
 const ctas=[...row.querySelectorAll('a')];
 const fl=[...document.querySelectorAll('#rrd a,#rrd button,#rrw')].filter(e=>e.offsetWidth>0).map(e=>({n:e.id||String(e.className).slice(0,20),r:R(e)}));
 const bad=[]; ctas.forEach(c=>fl.forEach(f=>{if(hit(R(c),f.r))bad.push(c.textContent.trim()+' x '+f.n)}));
 const cut=ctas.filter(c=>c.scrollWidth>c.clientWidth+1).map(c=>c.textContent.trim());
 const minw=Math.round(Math.min(...ctas.map(c=>c.getBoundingClientRect().width)));
 const cs=getComputedStyle(row.querySelector('.cb-go'));
 const edge=parseFloat(cs.borderTopWidth)>=1&&cs.borderTopStyle!=='none'&&cs.boxShadow!=='none';
 const al=(el,ps)=>{let m=0;((getComputedStyle(el,ps).backgroundImage).match(/rgba?\([^)]*\)/g)||[]).forEach(x=>{const n=x.match(/[\d.]+/g);const a=n.length>3?+n[3]:1;if(a>m)m=a});return +m.toFixed(2)};
 const hb=document.querySelector('#home .hero-bottom'),sl=document.querySelector('#home .slide.active');
 return {bad,cut,minw,edge,aHB:hb?al(hb,'::before'):9,aSA:sl?al(sl,'::after'):9,rowR:Math.round(R(row).r)};
}"""
fails=0
with sync_playwright() as p:
    b=p.chromium.launch()
    for w in (360,390,430):
        for h in (664,800,900):
            c=b.new_context(viewport={'width':w,'height':h},device_scale_factor=2,is_mobile=True,has_touch=True); pg=c.new_page()
            try:
                pg.goto(URL,wait_until='load'); pg.wait_for_selector('#home .rr-hero-order',state='attached',timeout=8000); pg.wait_for_timeout(2500); r=pg.evaluate(JS)
            except Exception as e: r={'err':str(e)[:80]}
            ok=('err' not in r) and not r['bad'] and not r['cut'] and r['minw']>=100 and r['edge'] and r['aHB']<=.75 and r['aSA']<=.55
            fails+=0 if ok else 1
            print(('PASS' if ok else 'FAIL'),'%dx%d'%(w,h),r)
            c.close()
    b.close()
srv.shutdown()
print('RESULT:','all ok' if not fails else '%d failed'%fails)
