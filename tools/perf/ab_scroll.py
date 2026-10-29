#!/usr/bin/env python3
"""
ab_scroll.py - A/B scroll test for the HOME page at phone width.

  python3 tools/perf/ab_scroll.py /tmp/old_pub public            # compare old vs new
  python3 tools/perf/ab_scroll.py public --page /menu/            # single report (no compare)

For each folder it serves the site, opens the page at 360x800, scrolls slowly to
the very bottom (so lazy images and scroll-reveal code get a chance to run), then lists:
  - page height, every top-level section's height
  - images that are broken (naturalWidth 0) or render under 4px
  - lazy images that never loaded
  - big elements stuck invisible (opacity ~0 / visibility hidden)
  - JS page errors and failed requests
With two folders it prints only the DIFFERENCES (old vs new). Exit 1 if new is worse.
"""
import argparse, http.server, socketserver, threading, functools, sys, json
from pathlib import Path
from playwright.sync_api import sync_playwright

JS_COLLECT = r"""
() => {
  const vis = e => { const r=e.getBoundingClientRect(); return {w:Math.round(r.width),h:Math.round(r.height)} };
  const tag = (e,i) => (e.id ? '#'+e.id : (e.className && typeof e.className==='string' ? '.'+e.className.trim().split(/\s+/)[0] : '')) || e.tagName.toLowerCase()+'['+i+']';
  const roots = [...document.body.children];
  const main = document.querySelector('main'); if (main) roots.push(...main.children);
  roots.push(...document.querySelectorAll('section'));
  const seen = new Set(), sections = [];
  roots.forEach((e,i)=>{ if(seen.has(e)||['SCRIPT','STYLE','LINK','NOSCRIPT'].includes(e.tagName)) return; seen.add(e);
    const v=vis(e); sections.push({k:tag(e,i), h:v.h, w:v.w}); });
  const imgs = [...document.images].map(im=>{ const v=vis(im);
    return {src:(im.currentSrc||im.src||'').replace(location.origin,'').slice(-60), lazy:im.loading==='lazy', done:im.complete, nat:im.naturalWidth,
            w:v.w, h:v.h, inDom:!!im.offsetParent || getComputedStyle(im).position==='fixed'}; });
  const hidden = [];
  document.querySelectorAll('body *').forEach(e=>{
    if(['SCRIPT','STYLE','LINK','NOSCRIPT','HEAD','META','SOURCE','PATH','SVG'].includes(e.tagName.toUpperCase())) return;
    const cs=getComputedStyle(e); if(cs.display==='none') return;
    const r=e.getBoundingClientRect(); if(r.height<60||r.width<60) return;
    if(parseFloat(cs.opacity)<0.05 || cs.visibility==='hidden') hidden.push({k:tag(e,0), h:Math.round(r.height), op:cs.opacity});
  });
  return {pageH: document.documentElement.scrollHeight, sections, imgs, hidden: hidden.slice(0,60)};
}
"""

def serve(folder):
    h = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(folder))
    h.log_message = lambda *a, **k: None
    class S(socketserver.TCPServer): allow_reuse_address = True
    srv = S(("127.0.0.1", 0), h)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, srv.server_address[1]

def scan(browser, folder, page, width):
    srv, port = serve(folder)
    ctx = browser.new_context(viewport={"width": width, "height": 800}, device_scale_factor=2, is_mobile=True, has_touch=True)
    pg = ctx.new_page()
    errors, failed = [], []
    pg.on("pageerror", lambda e: errors.append(str(e)[:160]))
    pg.on("requestfailed", lambda r: failed.append(r.url.split("/",3)[-1][-80:]))
    pg.on("response", lambda r: failed.append(f"{r.status} {r.url.split("/",3)[-1][-80:]}") if r.status >= 400 else None)
    pg.goto(f"http://127.0.0.1:{port}{page}", wait_until="load")
    pg.wait_for_timeout(800)
    last = -1
    for _ in range(400):                       # slow scroll to the very bottom
        pg.mouse.wheel(0, 500)
        pg.wait_for_timeout(120)
        y = pg.evaluate("window.scrollY + innerHeight")
        h = pg.evaluate("document.documentElement.scrollHeight")
        if y >= h - 2 and h == last:
            break
        last = h
    pg.wait_for_timeout(1200)
    data = pg.evaluate(JS_COLLECT)
    data["errors"], data["failed"] = errors, failed
    ctx.close(); srv.shutdown()
    return data

def problems(d):
    out = []
    for i in d["imgs"]:
        if i["done"] and i["nat"] == 0 and i["src"]:
            out.append(f"BROKEN img  {i['src']}")
        elif i["inDom"] and (i["h"] < 4 or i["w"] < 4) and i["nat"] != 0:
            out.append(f"COLLAPSED img {i['src']}  rendered {i['w']}x{i['h']}")
        elif i["lazy"] and not i["done"]:
            out.append(f"LAZY NEVER LOADED {i['src']}  (box {i['w']}x{i['h']})")
    for h in d["hidden"]:
        out.append(f"STUCK HIDDEN {h['k']}  {h['h']}px tall, opacity {h['op']}")
    for e in d["errors"]:
        out.append(f"JS ERROR {e}")
    for f in d["failed"]:
        out.append(f"REQUEST FAILED {f}")
    return out

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("folders", nargs="+")
    ap.add_argument("--page", default="/")
    ap.add_argument("--width", type=int, default=360)
    a = ap.parse_args()
    with sync_playwright() as p:
        b = p.chromium.launch()
        res = [scan(b, Path(f), a.page, a.width) for f in a.folders]
        b.close()
    worse = False
    if len(res) == 1:
        d = res[0]
        print(f"page height {d['pageH']}px, {len(d['sections'])} sections, {len(d['imgs'])} images")
        for s in d["sections"]: print(f"  {s['k']:<34} {s['h']:>6}px")
        pr = problems(d)
        print("\nPROBLEMS:" if pr else "\nNo problems found.")
        for x in pr: print("  ", x)
        worse = bool(pr)
    else:
        old, new = res[0], res[1]
        print(f"page height  OLD {old['pageH']}px   NEW {new['pageH']}px   diff {new['pageH']-old['pageH']}px")
        om = {s['k']: s['h'] for s in old['sections']}
        nm = {s['k']: s['h'] for s in new['sections']}
        print("\nSECTIONS WITH DIFFERENT HEIGHT (old -> new):")
        diff = [(k, om[k], nm[k]) for k in om if k in nm and abs(om[k]-nm[k]) > 5]
        for k, o, n in diff: print(f"  {k:<34} {o}px -> {n}px")
        if not diff: print("  none")
        gone = [k for k in om if k not in nm and om[k] > 0]
        if gone: print("\nVISIBLE IN OLD, MISSING IN NEW:", ", ".join(gone))
        po, pn = set(problems(old)), set(problems(new))
        newonly = sorted(pn - po)
        print("\nNEW PROBLEMS (not in old):" if newonly else "\nNo new problems.")
        for x in newonly: print("  ", x)
        worse = bool(newonly or diff)
    sys.exit(1 if worse else 0)

if __name__ == "__main__":
    main()
