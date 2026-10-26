#!/usr/bin/env python3
"""RR Durbar: add the analytics snippet (task 3.6, site gate P10) and/or the Search Console proof (P11, G1) to public/index.html.
Both values are PUBLIC codes (not secrets). Run from the website repo root, when the owner has them:
   python3 tools/patches/add_site_tags.py --cf-beacon <Cloudflare Web Analytics token> --gsc <google-site-verification code>
   add --check to only see what would change. Either option alone is fine.
Safety: runs only on the known file versions (live b1d4b89eae0468a6, or 72dc4ba7891d919d after patch set b); refuses to add a tag
that is already there; inserts just before </head>; writes nothing if anything is unexpected.
Check after: the site's _headers file must not block https://static.cloudflareinsights.com (look for a Content-Security-Policy line)."""
import argparse, hashlib, re, sys
from pathlib import Path

KNOWN = {'b1d4b89eae0468a6': 'live', '72dc4ba7891d919d': 'live + patch set b'}
ap = argparse.ArgumentParser()
ap.add_argument('--cf-beacon'); ap.add_argument('--gsc'); ap.add_argument('--check', action='store_true')
ap.add_argument('--file', default='public/index.html')
a = ap.parse_args()
if not a.cf_beacon and not a.gsc: print('Give --cf-beacon and/or --gsc. Nothing written.'); sys.exit(2)
if a.cf_beacon and not re.fullmatch(r'[0-9a-f]{32}', a.cf_beacon): print('STOP: the Cloudflare token should be 32 characters 0-9 a-f. Nothing written.'); sys.exit(1)
if a.gsc and not re.fullmatch(r'[A-Za-z0-9_-]{20,80}', a.gsc): print('STOP: the Google code looks wrong (copy only what is inside content="..."). Nothing written.'); sys.exit(1)
F = Path(a.file); raw = F.read_bytes(); h = hashlib.sha256(raw).hexdigest()[:16]
if h not in KNOWN: print(f'STOP: {F} is {h}, not a known version. Nothing written. Paste this line to the builder.'); sys.exit(1)
s = raw.decode('utf-8')
if s.count('</head>') != 1: print('STOP: expected exactly one </head>. Nothing written.'); sys.exit(1)
add = ''
if a.cf_beacon:
    if 'cloudflareinsights.com/beacon' in s: print('STOP: an analytics beacon is already there. Nothing written.'); sys.exit(1)
    add += f'<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon=\'{{"token": "{a.cf_beacon}"}}\'></script>'
if a.gsc:
    if 'google-site-verification' in s: print('STOP: a Search Console tag is already there. Nothing written.'); sys.exit(1)
    add = f'<meta name="google-site-verification" content="{a.gsc}">' + add
out = s.replace('</head>', add + '</head>').encode('utf-8')
nh = hashlib.sha256(out).hexdigest()[:16]
if a.check: print(f'CHECK ONLY ({KNOWN[h]}): would change {h} -> {nh} (+{len(out) - len(raw)} bytes). Nothing written.'); sys.exit(0)
F.write_bytes(out); print(f'WRITTEN ({KNOWN[h]}): {F} {h} -> {nh}. Preview first, then commit by explicit path.')
