#!/usr/bin/env python3
"""
kyc_audit.py - READ-ONLY check of everything MSG91 / DLT reviewers look at on the website.

  python3 tools/perf/kyc_audit.py src/site.html public 2>/dev/null

Reports: legal name, policy sections (where, visible?), footer content and links, policy text
keywords, WhatsApp / phone numbers (and where else in the repo they appear). Changes nothing.
"""
import re, sys, subprocess, http.server, socketserver, threading, functools
from pathlib import Path
from playwright.sync_api import sync_playwright

LEGAL = "RR Fresh Foods"
IDS = ["pol-privacy", "pol-terms", "pol-refund"]
KEYWORDS = {
    "who we are / legal name": [LEGAL.lower()],
    "phone number / OTP / SMS": ["otp", "sms", "mobile number", "phone number"],
    "payment (PayU etc.)": ["payu", "payment"],
    "cookies": ["cookie"],
    "how long data is kept": ["retain", "retention", "kept for", "delete"],
    "your rights (access/correct/delete)": ["your rights", "access", "correct", "withdraw"],
    "grievance officer": ["grievance"],
    "contact email": ["@"],
    "effective / last updated date": ["effective", "last updated", "updated on"],
    "children": ["children", "minor"],
    "sharing with third parties": ["third part", "share your", "service provider"],
}
PLACEHOLDERS = ["lorem", "tbd", "xxx", "[your", "[insert", "to be added", "coming soon", "draft"]

def quiet_server(folder):
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a, **k): pass
    h = functools.partial(Q, directory=str(folder))
    class S(socketserver.TCPServer): allow_reuse_address = True
    srv = S(("127.0.0.1", 0), h)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv

JS = r"""
(ids) => {
  const out = {sections:{}, footer:null, robots:null, title:document.title};
  const m = document.querySelector('meta[name=robots]'); out.robots = m ? m.content : '(none = indexable)';
  ids.forEach(id => { const e = document.getElementById(id);
    if (!e) { out.sections[id] = null; return; }
    const r = e.getBoundingClientRect(), cs = getComputedStyle(e);
    out.sections[id] = {visible: e.checkVisibility ? e.checkVisibility() && r.height > 0 : r.height > 0,
                        h: Math.round(r.height), text: (e.textContent||'').replace(/\s+/g,' ').trim()}; });
  const f = document.querySelector('footer');
  if (f) out.footer = {text:(f.innerText||'').replace(/\s+/g,' ').trim().slice(0,500),
        links:[...f.querySelectorAll('a')].map(a=>[(a.textContent||'').trim().slice(0,40), a.getAttribute('href')||''])};
  return out;
}
"""

def main():
    if len(sys.argv) < 3: sys.exit(__doc__)
    src, pub = Path(sys.argv[1]), Path(sys.argv[2])
    s = src.read_text(encoding="utf-8")
    print("=" * 60); print("A. LEGAL NAME"); print("=" * 60)
    pages = sorted(pub.rglob("index.html"))
    has = [str(p.relative_to(pub)) for p in pages if LEGAL in p.read_text(encoding="utf-8", errors="ignore")]
    print(f"  '{LEGAL}' in src/site.html: {s.count(LEGAL)} time(s)")
    print(f"  pages that show it: {len(has)} of {len(pages)}  {has[:6]}")

    print("\n" + "=" * 60); print("B. POLICY SECTIONS + FOOTER (as a visitor sees them)"); print("=" * 60)
    policy_pages = [p for p in pages if any(f'id="{i}"' in p.read_text(encoding="utf-8", errors="ignore") for i in IDS)]
    if not policy_pages: print("  NO generated page contains pol-privacy / pol-terms / pol-refund")
    srv = quiet_server(pub); port = srv.server_address[1]
    alltext = ""
    with sync_playwright() as p:
        b = p.chromium.launch()
        targets = [("home", "/")] + [(str(pp.parent.relative_to(pub)), "/" + str(pp.parent.relative_to(pub)).strip(".") + "/") for pp in policy_pages if pp.parent != pub]
        seen = set()
        for name, url in targets:
            if url in seen: continue
            seen.add(url)
            for w in (360, 1280):
                ctx = b.new_context(viewport={"width": w, "height": 800}, is_mobile=(w < 500))
                pg = ctx.new_page(); pg.goto(f"http://127.0.0.1:{port}{url}", wait_until="load"); pg.wait_for_timeout(800)
                d = pg.evaluate(JS, IDS)
                print(f"\n  page {url}  @{w}px   title='{d['title'][:60]}'   robots={d['robots']}")
                for i, v in d["sections"].items():
                    if v is None: print(f"     {i:<12} not on this page")
                    else:
                        print(f"     {i:<12} {'VISIBLE' if v['visible'] else 'HIDDEN (needs a tab/link click?)':<34} height {v['h']}px, {len(v['text'])} chars")
                        if w == 1280: alltext += " " + v["text"].lower()
                if w == 1280 or True:
                    f = d["footer"]
                    if not f: print("     FOOTER: none found")
                    else:
                        print(f"     FOOTER text: {f['text'][:220]}")
                        legal = [(t, h) for t, h in f["links"] if re.search(r"privacy|terms|refund|polic|legal|pol-", t + h, re.I)]
                        print(f"     FOOTER legal links: {legal if legal else 'NONE (no Privacy/Terms/Refund link in footer)'}")
                        print(f"     FOOTER shows '{LEGAL}': {'YES' if LEGAL.lower() in f['text'].lower() else 'NO'}")
                ctx.close()
        b.close()
    srv.shutdown()

    print("\n" + "=" * 60); print("C. POLICY TEXT: what is there, what is missing"); print("=" * 60)
    if not alltext: print("  (no policy text found to scan)")
    else:
        for label, keys in KEYWORDS.items():
            print(f"  {'OK     ' if any(k in alltext for k in keys) else 'MISSING'}  {label}")
        ph = [k for k in PLACEHOLDERS if k in alltext]
        print(f"  placeholder-like words found: {ph if ph else 'none'}")

    print("\n" + "=" * 60); print("D. WHATSAPP / PHONE NUMBERS in src/site.html"); print("=" * 60)
    wa = re.findall(r'(?:wa\.me/|api\.whatsapp\.com/send\?(?:[^"\'\s]*&)?phone=|whatsapp://send\?(?:[^"\'\s]*&)?phone=)\+?(\d{10,13})', s)
    tel = re.findall(r'href=["\']tel:([^"\']+)["\']', s)
    from collections import Counter
    print(f"  WhatsApp link numbers: {dict(Counter(wa)) or 'none found'}")
    print(f"  tel: link numbers:     {dict(Counter(tel)) or 'none found'}")
    old10 = sorted({n[-10:] for n in wa})
    for n in old10:
        try:
            r = subprocess.run(["git", "grep", "-c", "-E", n[:5] + r"[ -]?" + n[5:], "--", ".", ":!public", ":!*.bak", ":!node_modules"],
                               capture_output=True, text=True)
            print(f"  old WhatsApp number {n} also appears in (file:count):")
            for ln in r.stdout.strip().splitlines(): print("      ", ln)
        except Exception as e:
            print("   git grep failed:", e)
    print(f"  target number 9849982052 already in src: {len(re.findall(r'98499[ -]?82052', s))} time(s)")
    print("\nDone. Nothing was changed.")

if __name__ == "__main__":
    main()
