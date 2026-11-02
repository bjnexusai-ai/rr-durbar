#!/usr/bin/env python3
"""Meta verification prep. Dry run unless --write. Any unexpected count = STOP, nothing written.
 1. Legal name is 'RR Fresh Foods' only (was 'RR Fresh Foods (RR Durbar)') in site, CMS seed, seed script.
 2. Footer: registered address line under the GSTIN.
 3. Contact page: stale 'email not provided' sentence replaced; registered business details card added."""
import sys, pathlib
WRITE = '--write' in sys.argv
F = {'src/site.html': 5, 'cms/seed/seed.ndjson': 2, 'tools/cms/seed_from_site.py': 1}
T = {f: pathlib.Path(f).read_text(encoding='utf-8') for f in F}
bad = []; log = []
OLD, NEW = 'RR Fresh Foods (RR Durbar)', 'RR Fresh Foods'
for f, n in F.items():
    c = T[f].count(OLD)
    if c != n: bad.append(f'1 name in {f}: found {c}, expected {n}')
    else: T[f] = T[f].replace(OLD, NEW); log.append(f'1 name in {f}: ok ({c})')
s = T['src/site.html']
def rep(a, b, label, expect=1):
    global s
    n = s.count(a)
    if n != expect: bad.append(f'{label}: found {n}, expected {expect}'); return
    s = s.replace(a, b); log.append(f'{label}: ok')
ADDR = 'D.No 40-7-3, Near Jammichettu Centre, Moghalrajpuram, Vijayawada, Andhra Pradesh 520010'
rep('<small>GSTIN 37AEQPP7583R1Z2 (Moghalrajpuram)</small><br/>',
    '<small>GSTIN 37AEQPP7583R1Z2 (Moghalrajpuram)</small><br/><small>Registered address: ' + ADDR + '</small><br/>', '2 footer address')
rep('<p class="rr-copy">Call RR Durbar at the verified outlet phone number below. Email and social links are not included because they were not provided in the approved data.</p><div class="rr-grid rr-grid-2"></div>',
    '<p class="rr-copy">Call or email RR Durbar, find your nearest outlet, or send us an enquiry below.</p>'
    '<div class="rr-grid rr-grid-2"><div class="rr-card" id="contact-business"><h3>RR Fresh Foods (RR Durbar)</h3>'.replace('RR Fresh Foods (RR Durbar)', 'RR Fresh Foods') +
    '<p>Registered address<br/>' + ADDR + '</p>'
    '<p>Phone: <a href="tel:+919849982052">+91 98499 82052</a><br/>Email: <a href="mailto:orders@rrdurbar.com">orders@rrdurbar.com</a></p>'
    '<p>Open 11:00 AM to 11:59 PM, all days (Autonagar: call for hours)<br/>GSTIN 37AEQPP7583R1Z2</p>'
    '<p><a href="?page=branches">All five outlets</a> &middot; <a href="https://www.instagram.com/rr_durbar/" rel="noopener">Instagram</a> &middot; <a href="https://www.facebook.com/RRDurbar" rel="noopener">Facebook</a></p></div></div>', '3 contact card')
T['src/site.html'] = s
print('\n'.join(log))
if bad: print('STOP, nothing written:\n  ' + '\n  '.join(bad)); sys.exit(1)
if WRITE:
    for f, t in T.items(): pathlib.Path(f).write_text(t, encoding='utf-8')
    print('PATCHED ' + ', '.join(T))
else: print('dry run OK (add --write)')
