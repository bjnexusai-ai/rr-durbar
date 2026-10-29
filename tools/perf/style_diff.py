#!/usr/bin/env python3
"""
style_diff.py - what is different INSIDE one section, old vs new?

  python3 tools/perf/style_diff.py /tmp/old_pub/public /tmp/st_d7aa468/public '#reviews'

Loads both sites at 360px, scrolls to the bottom (so reveal/slider JS runs),
then walks the same section in both and prints the first elements that differ:
  CLASS differs / STYLE attr differs  -> JavaScript behaved differently (timing/order)
  only COMPUTED props differ          -> CSS order/cascade changed
"""
import sys, http.server, socketserver, threading, functools
from pathlib import Path
from playwright.sync_api import sync_playwright

PROPS = ["display","position","flexDirection","flexWrap","overflowX","overflowY","whiteSpace","width","height",
         "maxHeight","minHeight","transform","opacity","visibility","gridTemplateColumns","animationName",
         "scrollSnapType","columnCount","float"]

JS = r"""
([sel, props]) => {
  const root = document.querySelector(sel);
  if (!root) return null;
  const els = [root, ...root.querySelectorAll('*')].filter(e=>!['SCRIPT','STYLE'].includes(e.tagName)).slice(0,600);
  return els.map((e,i)=>{ const cs=getComputedStyle(e), o={};
    props.forEach(p=>o[p]=cs[p]);
    return {i, tag:e.tagName.toLowerCase(), cls:(typeof e.className==='string'?e.className:''), style:e.getAttribute('style')||'', cs:o,
            h:Math.round(e.getBoundingClientRect().height)}; });
}
"""

def serve(folder):
    h = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(folder))
    h.log_message = lambda *a, **k: None
    class S(socketserver.TCPServer): allow_reuse_address = True
    srv = S(("127.0.0.1", 0), h)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, srv.server_address[1]

def grab(browser, folder, sel):
    srv, port = serve(Path(folder))
    ctx = browser.new_context(viewport={"width": 360, "height": 800}, device_scale_factor=2, is_mobile=True, has_touch=True)
    pg = ctx.new_page()
    pg.goto(f"http://127.0.0.1:{port}/", wait_until="load")
    pg.wait_for_timeout(800)
    last = -1
    for _ in range(400):
        pg.mouse.wheel(0, 500); pg.wait_for_timeout(120)
        y = pg.evaluate("scrollY+innerHeight"); h = pg.evaluate("document.documentElement.scrollHeight")
        if y >= h - 2 and h == last: break
        last = h
    pg.wait_for_timeout(1200)
    data = pg.evaluate(JS, [sel, PROPS])
    ctx.close(); srv.shutdown()
    return data

def main():
    if len(sys.argv) < 4: sys.exit(__doc__)
    old_dir, new_dir, sel = sys.argv[1:4]
    with sync_playwright() as p:
        b = p.chromium.launch()
        o, n = grab(b, old_dir, sel), grab(b, new_dir, sel)
        b.close()
    if o is None or n is None:
        sys.exit(f"selector {sel} not found in {'OLD' if o is None else 'NEW'}")
    print(f"{sel}: OLD {len(o)} elements, NEW {len(n)} elements; height OLD {o[0]['h']}px NEW {n[0]['h']}px")
    shown = 0; cls_d = sty_d = css_d = 0
    for a, c in zip(o, n):
        why = []
        if a["cls"] != c["cls"]: why.append(f"CLASS  old='{a['cls'][:70]}'  new='{c['cls'][:70]}'"); cls_d += 1
        if a["style"] != c["style"]: why.append(f"STYLE  old='{a['style'][:70]}'  new='{c['style'][:70]}'"); sty_d += 1
        d = [f"{k}: {a['cs'][k]} -> {c['cs'][k]}" for k in PROPS if a["cs"][k] != c["cs"][k]]
        if d: why.append("COMPUTED " + "; ".join(d[:6])); css_d += 1
        if why and shown < 12:
            print(f"\n[{a['i']}] <{a['tag']}> h {a['h']} -> {c['h']}")
            for w in why: print("   ", w)
            shown += 1
    print(f"\nTOTAL elements differing: class {cls_d}, style attr {sty_d}, computed {css_d}")
    if cls_d or sty_d:
        print("READ: class/style attribute changes mean JavaScript ran differently (timing or order).")
    elif css_d:
        print("READ: only computed styles differ and classes are the same, so CSS order/cascade changed.")
    else:
        print("READ: no difference inside this section.")

if __name__ == "__main__":
    main()
