#!/usr/bin/env python3
"""30 Oct edits to src/site.html. Dry run unless --write. Any unexpected match count = STOP, nothing written."""
import sys, re, pathlib
WRITE = '--write' in sys.argv
p = pathlib.Path('src/site.html'); s = p.read_text(encoding='utf-8'); log = []; bad = []

def span_obj(t, i):
    d = 0; q = None; k = i
    while k < len(t):
        c = t[k]
        if q:
            if c == '\\': k += 1
            elif c == q: q = None
        elif c in '"\'': q = c
        elif c == '{': d += 1
        elif c == '}':
            d -= 1
            if d == 0: return k + 1
        k += 1
    raise ValueError('unbalanced braces')

def remove_objs(marker, expect, label):
    global s
    n = s.count(marker)
    if n != expect: bad.append(f'{label}: found {n}, expected {expect}'); return
    out = []; pos = 0
    while True:
        i = s.find(marker, pos)
        if i < 0: break
        j = span_obj(s, i); m = re.match(r'\s*,\s*', s[j:])
        if m: out.append(s[pos:i]); j += m.end()
        else:
            seg = s[pos:i]; pre = re.search(r',\s*$', seg); out.append(seg[:pre.start()] if pre else seg)
        pos = j
    out.append(s[pos:]); s = ''.join(out); log.append(f'{label}: removed {n}')

def replace_once(a, b, label, expect=1):
    global s
    n = s.count(a)
    if n != expect: bad.append(f'{label}: found {n}, expected {expect}'); return
    s = s.replace(a, b); log.append(f'{label}: done')

def regex_remove(pat, expect, label):
    global s
    n = len(re.findall(pat, s))
    if n != expect: bad.append(f'{label}: found {n}, expected {expect}'); return
    s = re.sub(pat, '', s); log.append(f'{label}: removed {n}')

def article_bounds(h3):
    res = []
    for m in re.finditer(re.escape(h3), s):
        st = s.rfind('<article', 0, m.start())
        if st < 0 or s.rfind('</article>', st, m.start()) != -1: return None
        en = s.find('</article>', m.end())
        if en < 0: return None
        res.append((st, en + 10))
    return res

# 1. Glimpse section
g = '<section class="rr-section" id="gallery" data-edit-section="home-gallery">'
if s.count(g) != 1: bad.append(f'glimpse: section start found {s.count(g)}, expected 1')
else:
    a = s.index(g); b = s.index('</section>', a) + 10
    if '<section' in s[a + 10:b]: bad.append('glimpse: nested <section> inside, stopping')
    else:
        b2 = b + len(re.match(r'\s*', s[b:]).group(0)); s = s[:a] + s[b2:]; log.append('glimpse section: removed')
        print('refs to #gallery / home-gallery left:', len(re.findall(r'#gallery|home-gallery', s)))

# 2. Patamatalanka
remove_objs('{"@type": "Restaurant", "name": "RR Durbar Patamatalanka"', 1, 'JSON-LD')
remove_objs("{n:'Patamatalanka',", 1, 'JS outlet list')
remove_objs('{"id": "patamatalanka", "name": "Patamatalanka"', 2, 'map OUTLETS/O')
remove_objs('{"name": "Patamatalanka", "address"', 1, 'branches JSON')
bs = article_bounds('<h3>Patamatalanka</h3>')
if bs is None or len(bs) != 2: bad.append(f'cards: found {None if bs is None else len(bs)}, expected 2')
else:
    for a, b in reversed(bs): s = s[:a] + s[b:]
    log.append('location + branch cards: removed 2')
    for h3, old, new in (('<h3>Autonagar</h3>', '<span class="rr-location-number">06</span>', '<span class="rr-location-number">05</span>'), ('<h3>Autonagar</h3>', '<span class="brx-num">06</span>', '<span class="brx-num">05</span>')):
        for a, b in (article_bounds(h3) or []):
            if old in s[a:b]: s = s[:a] + s[a:b].replace(old, new) + s[b:]; log.append('renumbered Autonagar 06 -> 05'); break
regex_remove(r'<li><a href="[^"]*" target="_blank" rel="noopener noreferrer" aria-label="Patamatalanka on Google Maps">Patamatalanka</a></li>', 1, 'footer branch link')
regex_remove(r"g\.appendChild\(lnk\('rrw-chip','tel:\+'\+STAFF_NUMBER,'Patamatalanka[^']*'\)\);\s*", 1, 'widget call chip')
replace_once('Poranki, Patamatalanka and Autonagar.', 'Poranki and Autonagar.', 'SEO text')

# 3. Footer
replace_once('<p class="rr-footer-entity">© <strong>RR Fresh Foods</strong>. All rights reserved.</p>', '', 'footer extra line')
replace_once('&copy; 2026 RR Durbar. All rights reserved.<br/><small>RR Fresh Foods (RR Durbar) &middot; GSTIN', '&copy; 2026 RR Fresh Foods. All rights reserved.<br/><small>GSTIN', 'footer bottom line')
replace_once('the unmistakable RR Durbar spirit &mdash; served across 6 outlets', 'the unmistakable royal spirit &mdash; served across 6 outlets', 'footer blurb')

print('\n'.join('  ' + x for x in log))
if bad: print('STOP, nothing written:\n' + '\n'.join('  ' + x for x in bad)); sys.exit(1)
print('--- Patamatalanka text still left (kept on purpose, check):')
seen = set()
for m in re.finditer('patamatalanka', s, re.I):
    ln = s.count('\n', 0, m.start()) + 1
    if ln in seen: continue
    seen.add(ln); print(f'  L{ln}: ' + re.sub(r'\s+', ' ', s[max(0, m.start() - 70):m.start() + 70]))
if WRITE:
    pathlib.Path('src/site.html.bak4').write_text(p.read_text(encoding='utf-8'), encoding='utf-8'); p.write_text(s, encoding='utf-8'); print('WROTE src/site.html (backup src/site.html.bak4)')
else: print('DRY RUN (nothing written)')
