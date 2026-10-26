#!/usr/bin/env python3
"""RR Durbar: patch set 26 Oct (b) for public/index.html. Exact old/new string patches, nothing else is touched.
Run from the website repo root:  python3 tools/patches/apply_26oct_b.py            (writes the file)
                                 python3 tools/patches/apply_26oct_b.py --check    (changes nothing, only says if it would apply)
Safety: refuses to run unless public/index.html is EXACTLY the live version b1d4b89eae0468a6 (so it can never clash with the
owner's page-split work or another patch). Every old string must be found the expected number of times, or nothing is written.

  A  (task 6.7)  Menu cart -> checkout v2 button. HIDDEN unless window.RR_CHECKOUT_V2 === true, so with this patch alone
                 the site looks and works exactly as before. Saves the cart as rr_cart_v2 and opens /checkout/v2/.
  B  (task 3.4)  The 6 Restaurant entries in the Google data get "image" (the logo) and "sameAs" (Instagram). Invisible.
  (A skip link was planned but the site ALREADY has one: <button class="rr-skip" id="rr-skip-btn">. Not added.)
"""
import hashlib, sys
from pathlib import Path

F = Path('public/index.html')
EXPECT = 'b1d4b89eae0468a6'
CHECK = '--check' in sys.argv

PATCHES = [
  ('A cart -> checkout v2 (hidden behind RR_CHECKOUT_V2)', 1,
   "if(goBtn)goBtn.disabled=!(q&&q.allOk);",
   "if(q&&q.allOk&&window.RR_CHECKOUT_V2===true){var cv=el('button','btn-gold rr-cv2','Checkout and pay online');cv.type='button';"
   "cv.addEventListener('click',function(){try{localStorage.setItem('rr_cart_v2',JSON.stringify({items:S.order.map(function(id){return {id:id,name:lineName(id),qty:S.lines[id].qty,p:(S.prices&&S.prices[id])||0}}),outlet:slugNow()||''}))}catch(e){}location.href='/checkout/v2/'});"
   "cartBox.appendChild(cv)}"
   "if(goBtn)goBtn.disabled=!(q&&q.allOk);"),
  ('B schema image + sameAs on the 6 outlets', 6,
   '"hasMenu": "https://rrdurbar.com/menu/", ',
   '"hasMenu": "https://rrdurbar.com/menu/", "image": "https://rrdurbar.com/assets/logo/rr-logo-800.webp", "sameAs": ["https://www.instagram.com/rr_durbar/"], '),
]

def sha(b): return hashlib.sha256(b).hexdigest()[:16]

raw = F.read_bytes()
h = sha(raw)
if h != EXPECT:
    print(f'STOP: public/index.html is {h}, expected {EXPECT}. Nothing written. Paste this line to the builder.'); sys.exit(1)
s = raw.decode('utf-8')
for name, n, old, new in PATCHES:
    c = s.count(old)
    if c != n:
        print(f'STOP: {name}: found {c} times, expected {n}. Nothing written.'); sys.exit(1)
    s = s.replace(old, new)
    print('ok  ', name)
out = s.encode('utf-8')
if CHECK:
    print(f'CHECK ONLY: would change {h} -> {sha(out)} (+{len(out) - len(raw)} bytes). Nothing written.'); sys.exit(0)
F.write_bytes(out)
print(f'WRITTEN: public/index.html {h} -> {sha(out)} (+{len(out) - len(raw)} bytes). Preview first, then commit by explicit path.')
