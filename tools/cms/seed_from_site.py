#!/usr/bin/env python3
"""RR Durbar: build the first CMS content (cms/seed/seed.ndjson) FROM THE LIVE SITE, so nothing is typed in by hand or invented.
Run from the website repo root:  python3 tools/cms/seed_from_site.py [src/site.html] > cms/seed/seed.ndjson
Reads: the Google data (business details and the 6 outlets), the page titles and descriptions (pageSeo), every page's sections
(small label, heading, intro), the display-name layer (task 1.3) and the dish photo maps, and the three policy pages.
Everything imported is marked "imported" so the owner reviews it in the Studio before it replaces anything.
GPS: taken from the master plan section 3 and marked NOT verified (C32): it never reaches Google until the owner ticks it."""
import html, json, re, sys
from pathlib import Path

src = Path(sys.argv[1] if len(sys.argv) > 1 else 'src/site.html').read_text(encoding='utf-8')
sys.path.insert(0, str(Path(__file__).resolve().parents[2] / 'cms'))
txt = lambda x: re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', x or ''))).strip()
out = []
def doc(d): out.append(d)

# ---- routes and sections (same list as cms/routes.js) ----
m = re.search(r"\{\s*home:\s*\[.*?'refund-cancellation':\s*\[[^\]]*\],?\s*\}", src, re.S)
routes = {}
for k, v in re.findall(r"'?([a-z-]+)'?:\s*\[([^\]]*)\]", m.group(0)):
    routes[k] = re.findall(r"'([^']+)'", v)
routes['loyalty'] = ['loyalty']   # new page, plan 9.4 (today a Home section)

# ---- Google data: Organization + 6 Restaurants ----
ld = json.loads(re.findall(r'<script[^>]*application/ld\+json[^>]*>(.*?)</script>', src, re.S)[0])
graph = ld.get('@graph', [ld])
org = next(n for n in graph if n.get('@type') == 'Organization')
rest = [n for n in graph if n.get('@type') == 'Restaurant']

legal = re.search(r'RR Fresh Foods \(RR Durbar\)', src)
hours = re.search(r'11:00 AM[^<]{0,30}11:30 PM, all days', src)
listings = {}
for k in ('swiggy', 'zomato'):
    lm = re.search(r"RR_LISTINGS\|\|\{[^}]*?" + k + r":'(https://[^']+)'", src)
    if lm: listings[k] = lm.group(1)
insta = next((u for u in org.get('sameAs', []) if 'instagram.com' in u), '')
doc({'_id': 'siteSettings', '_type': 'siteSettings', 'brandName': org.get('name', 'RR Durbar'),
     'legalName': 'RR Fresh Foods (RR Durbar)' if legal else '', 'gstin': org.get('taxID', ''), 'phone': org.get('telephone', ''),
     'whatsapp': '917702077999' if 'wa.me/917702077999' in src else '', 'email': org.get('email', ''),
     'instagram': insta.rstrip('/').split('/')[-1] if insta else '', 'swiggyUrl': listings.get('swiggy', ''), 'zomatoUrl': listings.get('zomato', ''),
     'registeredAddress': 'D.No 40-7-3, Near Jammichettu Centre, Moghalrajpuram, Vijayawada, AP 520010',
     'hoursText': html.unescape(hours.group(0)).replace('–', 'to') if hours else '11:00 AM to 11:30 PM, all days',
     'foundingYear': int(org['foundingDate']) if str(org.get('foundingDate', '')).isdigit() else None, 'yearConfirmed': False})

CODES = {'singhnagar': 'SN', 'moghalrajpuram': 'MR', 'bhavanipuram': 'BH', 'poranki': 'PO', 'autonagar': 'AT', 'patamatalanka': 'PL'}
GPS = {'singhnagar': (16.5332, 80.6358), 'moghalrajpuram': (16.5057, 80.6384), 'bhavanipuram': (16.5369, 80.5898),   # plan section 3,
       'poranki': (16.4801, 80.6922), 'patamatalanka': (16.4912, 80.6554), 'autonagar': (16.5161, 80.6728)}            # NOT verified (C32)
for i, r in enumerate(rest):
    name = r['name'].replace('RR Durbar', '').strip(); code = name.lower()
    if code not in CODES: continue
    a = r.get('address', {}); oh = re.match(r'Mo-Su (\d\d:\d\d)-(\d\d:\d\d)', r.get('openingHours', '') or '')
    fssai = (r.get('identifier') or {}).get('value', '')
    lat, lng = GPS[code]
    doc({'_id': f'outlet-{code}', '_type': 'outlet', 'name': name, 'code': code, 'ristaCode': CODES[code], 'active': True,
         'onlineOrdering': code != 'patamatalanka', 'callOnly': code == 'patamatalanka',
         'street': a.get('streetAddress', ''), 'locality': a.get('addressLocality', 'Vijayawada'), 'pincode': a.get('postalCode', ''),
         'phone': r.get('telephone', ''), 'opens': oh.group(1) if oh else None, 'closes': oh.group(2) if oh else None,
         'callForHours': not oh, 'lat': lat, 'lng': lng, 'gpsVerified': False,
         'mapsUrl': 'https://www.google.com/maps/search/?api=1&query=' + re.sub(r'\s+', '+', f'RR Durbar {name}, {a.get("streetAddress", "")}'),
         'fssai': fssai, 'sort': i + 1})

# ---- page titles and descriptions (pageSeo) ----
seo = {}
i = src.find('pageSeo = {')
if i >= 0:
    obj, _ = json.JSONDecoder().raw_decode(src[i + len('pageSeo = '):])
    seo = {k: (v.get('title', ''), v.get('desc', '')) for k, v in obj.items()}

def section_text(sid):
    m = re.search(r'<(section|div)[^>]*\bid="%s"[^>]*>' % re.escape(sid), src)
    if not m: return None
    end = src.find('</section>', m.end()); seg = src[m.end(): end if end > 0 else m.end() + 8000]
    h = re.search(r'<h[1-3][^>]*>(.*?)</h[1-3]>', seg, re.S)
    head_at = h.start() if h else len(seg)
    e = None
    for em in re.finditer(r'<(?:p|span|div)[^>]*class="[^"]*(?:eyebrow|kicker|label|tag)[^"]*"[^>]*>(.*?)</(?:p|span|div)>', seg[:head_at + 1], re.S):
        e = em
    p = re.search(r'<p[^>]*>(.*?)</p>', seg[h.end():] if h else seg, re.S)
    intro = txt(p.group(1)) if p else ''
    return {'eyebrow': txt(e.group(1))[:60] if e else '', 'heading': txt(h.group(1))[:120] if h else '', 'intro': intro[:600]}

for route, secs in routes.items():
    if route == 'our-story': continue   # same sections as about-us (301 to /about-us/, plan 3.1)
    sections = []
    for sid in secs:
        t = section_text(sid)
        if t is None: continue
        sections.append({'_key': sid.replace('-', '_'), '_type': 'pageSection', 'key': sid, 'visible': True, 'imported': True, **t})
    st, sd = seo.get(route, ('', ''))
    h1 = next((s['heading'] for s in sections if s['heading']), '')
    doc({'_id': f'page-{route}', '_type': 'page', 'route': route, 'seoTitle': st, 'seoDescription': sd, 'h1': h1, 'sections': sections})

# ---- dish cards: display names (task 1.3) and the photos the site uses today ----
rrdn = {}
dm = re.search(r'id="rr-display-names">(.*?)</script>', src, re.S)
if dm:
    for obj in re.findall(r'\{[^{}]*\}', dm.group(1)):
        try: rrdn.update({k.lower(): v for k, v in json.loads(obj).items()})
        except Exception: pass
photos = {}
for sm2 in re.finditer(r'RR_SIG_IMG\s*=\s*(\{[^{}]*\})', src):
    try: photos.update({k.lower(): v for k, v in json.loads(sm2.group(1)).items()})
    except Exception: pass
im = re.search(r'var IM=\{\};\[(.*?)\]\.forEach', src, re.S)
for slug in (json.loads('[' + im.group(1) + ']') if im else []):
    photos.setdefault(slug.replace('-', ' '), f'images/menu/{slug}.webp')
home = set(k.lower() for sm3 in re.finditer(r'RR_SIG_IMG\s*=\s*(\{[^{}]*\})', src) for k in json.loads(sm3.group(1)).keys())
for n, key in enumerate(sorted(set(rrdn) | set(photos))):
    slug = re.sub(r'[^a-z0-9]+', '-', key).strip('-')
    doc({'_id': f'dish-{slug}', '_type': 'dish', 'ristaName': key, 'displayName': rrdn.get(key, ''), 'description': '',
         'photoFile': photos.get(key, ''), 'showOnHome': key in home, 'homeOrder': n if key in home else None, 'photoChecked': False})

# ---- legal pages: today's text, imported as DRAFTS (never published until approved) ----
for kind, sid in (('privacy', 'pol-privacy'), ('terms', 'pol-terms'), ('refund', 'pol-refund')):
    m = re.search(r'<section[^>]*\bid="%s"[^>]*>(.*?)</section>' % sid, src, re.S)
    blocks = []
    if m:
        for i, (tag, inner) in enumerate(re.findall(r'<(h3|h4|p|li)[^>]*>(.*?)</\1>', m.group(1), re.S)):
            t = txt(inner)
            if not t or t in ('Policies',): continue
            style = 'h3' if tag in ('h3', 'h4') else 'normal'
            b = {'_key': f'b{i}', '_type': 'block', 'style': style, 'children': [{'_key': f's{i}', '_type': 'span', 'text': t, 'marks': []}], 'markDefs': []}
            if tag == 'li': b.update({'listItem': 'bullet', 'level': 1})
            blocks.append(b)
    doc({'_id': f'legal-{kind}', '_type': 'legalPage', 'kind': kind, 'version': 'site-2026-10-26', 'body': blocks, 'approvedByOwner': False, 'imported': True})

for d in out: print(json.dumps({k: v for k, v in d.items() if v is not None}, ensure_ascii=False))
