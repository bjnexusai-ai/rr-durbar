#!/usr/bin/env python3
"""
css_rules_diff.py - which CSS rules exist in the OLD page but are missing in the NEW page?

  python3 tools/perf/css_rules_diff.py /tmp/old_pub/public /tmp/st_d7aa468/public 2>/dev/null

Loads both pages, flattens every CSS rule (incl. inside @media/@supports), and lists
rules that the old page had but the new page does not apply. Groups the missing rules
by the OLD stylesheet number (inline <style> blocks and <link> sheets, in page order),
so you know which original block lost its rules.
"""
import sys, http.server, socketserver, threading, functools
from collections import Counter, defaultdict
from pathlib import Path
from playwright.sync_api import sync_playwright

JS = r"""
() => {
  const out = [];
  const walk = (rules, ctx, si) => {
    for (const r of rules) {
      if (r.type === 1) out.push([si, ctx, r.selectorText + '{' + r.style.cssText + '}']);
      else if (r.type === 7) out.push([si, ctx, '@keyframes ' + r.name]);
      else if (r.type === 5) out.push([si, ctx, '@font-face ' + r.style.getPropertyValue('font-family')]);
      else if (r.cssRules) walk(r.cssRules, ctx + '@' + (r.conditionText || r.media && r.media.mediaText || r.constructor.name) + ' ', si);
    }
  };
  [...document.styleSheets].forEach((s, si) => {
    let rules; try { rules = s.cssRules; } catch (e) { return; }
    const med = s.media && s.media.mediaText ? '@media ' + s.media.mediaText + ' ' : '';
    walk(rules, med, si);
  });
  const names = [...document.styleSheets].map(s => (s.href ? s.href.replace(location.origin,'') : 'inline <style>') +
      (s.media && s.media.mediaText ? '  [media="' + s.media.mediaText + '"]' : '') + (s.disabled ? '  [DISABLED]' : ''));
  return {rules: out, names};
}
"""

class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a, **k): pass

def grab(browser, folder):
    h = functools.partial(Quiet, directory=str(Path(folder)))
    class S(socketserver.TCPServer): allow_reuse_address = True
    srv = S(("127.0.0.1", 0), h)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    ctx = browser.new_context(viewport={"width": 360, "height": 800}, is_mobile=True, has_touch=True)
    pg = ctx.new_page()
    pg.goto(f"http://127.0.0.1:{srv.server_address[1]}/", wait_until="load")
    pg.wait_for_timeout(1500)
    d = pg.evaluate(JS)
    ctx.close(); srv.shutdown()
    return d

def main():
    if len(sys.argv) < 3: sys.exit(__doc__)
    with sync_playwright() as p:
        b = p.chromium.launch()
        old, new = grab(b, sys.argv[1]), grab(b, sys.argv[2])
        b.close()
    print(f"OLD: {len(old['names'])} stylesheets, {len(old['rules'])} rules")
    print(f"NEW: {len(new['names'])} stylesheets, {len(new['rules'])} rules")
    nc = Counter(c + b for _, c, b in new["rules"])
    left = []
    for si, c, b in old["rules"]:
        if nc[c + b] > 0: nc[c + b] -= 1
        else: left.append((si, c, b))
    # rules still unmatched in new (by body)
    newbody = defaultdict(list)
    for si, c, b in new["rules"]:
        if nc[c + b] > 0:
            nc[c + b] -= 1; newbody[b].append(c)
    moved = Counter(); lost = defaultdict(list)
    for si, c, b in left:
        if newbody[b]:
            moved[(c, newbody[b].pop())] += 1
        else:
            lost[si].append(c + b)
    n_moved = sum(moved.values()); n_lost = sum(len(v) for v in lost.values())
    print(f"\nOLD rules not matched exactly in NEW: {len(left)}")
    print(f"  of these, SAME rule but under a DIFFERENT wrapper/context: {n_moved}")
    for (oc, nc_), n in moved.most_common(8):
        print(f"      {n:>5} x  old context '{oc}'  ->  new context '{nc_}'")
    print(f"  of these, truly MISSING in new: {n_lost}")
    for si in sorted(lost):
        v = lost[si]
        print(f"\n  OLD stylesheet #{si} ({old['names'][si]}): {len(v)} rules missing")
        for r in v[:6]: print("     ", r[:130])
    print("\nNEW stylesheets:")
    for i, n in enumerate(new["names"]): print(f"   #{i}  {n}")
    if n_lost == 0 and n_moved:
        print("\nREAD: no rule is lost. The rules are in the new page under a different wrapper (see above).")
    elif n_lost:
        print("\nREAD: some rules are truly missing in the new page (listed above).")
    else:
        print("\nREAD: same rules, same wrappers. The cause is rule ORDER (cascade).")

if __name__ == "__main__":
    main()
