#!/usr/bin/env python3
"""
patch_kyc_final.py - the final safe patch for MSG91 / DLT / KYC website checks.

  python3 tools/perf/patch_kyc_final.py src/site.html            # dry run
  python3 tools/perf/patch_kyc_final.py src/site.html --write    # apply (backup .bak)
  options: --name "RR Fresh Foods"   --wa 919849982052   --also-text   --footer-only

Does 3 things (each safe to run twice, each stops with a clear message if its anchor is not found):
  1. Policy sections (pol-privacy, pol-terms, pol-refund): line "RR Durbar is operated by <name>."
  2. Footer: one line "RR Durbar is operated by <name>. All rights reserved." before </footer>
  3. WhatsApp: number inside wa.me / api.whatsapp.com / whatsapp://send links -> new number.
     Visible text copies of the OLD number are changed ONLY with --also-text, and never if the
     old number is also a tel: (call) number.
"""
import re, sys
from collections import Counter
from pathlib import Path

IDS = ["pol-privacy", "pol-terms", "pol-refund"]

def opt(name, default):
    return sys.argv[sys.argv.index(name) + 1] if name in sys.argv else default

def main():
    if len(sys.argv) < 2: sys.exit(__doc__)
    path = Path(sys.argv[1]); write = "--write" in sys.argv; also_text = "--also-text" in sys.argv
    name = opt("--name", "RR Fresh Foods"); wa_new = re.sub(r"\D", "", opt("--wa", "919849982052"))
    if len(wa_new) == 10: wa_new = "91" + wa_new
    html = path.read_text(encoding="utf-8"); log = []

    # 1. policy sections
    line = f'<p class="rr-legal-entity">RR Durbar is operated by <strong>{name}</strong>.</p>'
    for sid in IDS:
        hits = list(re.finditer(r'id\s*=\s*["\']' + re.escape(sid) + r'["\']', html))
        if len(hits) != 1: sys.exit(f"STOP: id '{sid}' found {len(hits)} times (need 1). Nothing written.")
        start = html.rfind("<", 0, hits[0].start())
        m = re.search(r"</h[1-4]>", html[start:start + 4000], re.I)
        if not m: sys.exit(f"STOP: no heading near '{sid}'. Nothing written.")
        at = start + m.end()
        if "--footer-only" in sys.argv: log.append(f"policy {sid}: skipped (--footer-only)")
        elif 'class="rr-legal-entity"' in html[at:at + 400]: log.append(f"policy {sid}: already done")
        elif name.lower() in html[at:at + 3000].lower(): log.append(f"policy {sid}: text already mentions {name} near the top, skipped")
        else: html = html[:at] + "\n" + line + html[at:]; log.append(f"policy {sid}: line added")

    # 2. footer
    fl = re.findall(r"<footer\b", html, re.I)
    if len(fl) != 1: sys.exit(f"STOP: found {len(fl)} <footer> elements (need exactly 1). Nothing written.")
    fm = re.search(r"</footer>", html, re.I)
    fblock = html[html.lower().find("<footer"):fm.end()]
    if 'class="rr-footer-entity"' in fblock: log.append("footer: already done")
    else:
        fline = f'<p class="rr-footer-entity">RR Durbar is operated by <strong>{name}</strong>. All rights reserved.</p>\n'
        html = html[:fm.start()] + fline + html[fm.start():]; log.append("footer: line added")

    # 3. WhatsApp
    pat = re.compile(r'((?:wa\.me/|api\.whatsapp\.com/send\?(?:[^"\'\s]*&(?:amp;)?)?phone=|whatsapp://send\?(?:[^"\'\s]*&(?:amp;)?)?phone=)\+?)(\d{10,13})')
    olds = Counter(m.group(2) for m in pat.finditer(html))
    changed_urls = sum(c for n, c in olds.items() if n != wa_new)
    html = pat.sub(lambda m: m.group(1) + wa_new, html)
    log.append(f"whatsapp links: {changed_urls} changed (old numbers found: {dict(olds) or 'none'}) -> {wa_new}")
    tel = " ".join(re.findall(r'href=["\']tel:([^"\']+)["\']', html))
    disp = f"{wa_new[-10:-5]} {wa_new[-5:]}"
    for old in olds:
        if old[-10:] == wa_new[-10:]: continue
        o10 = old[-10:]
        tpat = re.compile(r"(\+?91[\s-]?)?" + o10[:5] + r"[\s-]?" + o10[5:])
        found = tpat.findall(html)
        if o10 in re.sub(r"[\s-]", "", tel):
            log.append(f"  old number {o10} is ALSO a tel: call number -> visible text NOT changed (decide by hand)")
        elif also_text:
            html, n = tpat.subn(lambda m: (m.group(1) or "") + disp, html)
            log.append(f"  visible text copies of {o10} changed: {n}")
        else:
            log.append(f"  visible text copies of {o10}: {len(found)} (not changed; add --also-text to change them)")

    for l in log: print(" ", l)
    original = path.read_text(encoding="utf-8")
    if html == original:
        print("NOTHING TO CHANGE (already done). File and backup left as they are."); return
    if not write:
        print("DRY RUN (nothing written)"); return
    path.with_suffix(path.suffix + ".bak").write_text(original, encoding="utf-8")
    path.write_text(html, encoding="utf-8"); print(f"WROTE {path} (backup of the previous version: {path}.bak)")

if __name__ == "__main__":
    main()
