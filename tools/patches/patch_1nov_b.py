#!/usr/bin/env python3
"""1 Nov, part B: small fixes on top of commit 99b3074. Dry run unless --write. Any unexpected match count = STOP.
  21. Branches map card: Singhnagar, Poranki, Autonagar showed no photo when picked on the map.
  22. About Us photo: the reveal frame kept a hard edge after opening, cutting off the soft fade into the red panel
      (now the frame opens past the photo edges). The 3.5 s safety reveal now only runs if the page script fails, so
      on phones the doors open when you actually scroll to the photo.
  23. Catering landing shade (see option chosen)."""
import sys, pathlib, json as _json
WRITE = '--write' in sys.argv
p = pathlib.Path('src/site.html'); s = p.read_text(encoding='utf-8'); bad = []; log = []

def rep(a, b, label, expect=1):
    global s
    n = s.count(a)
    if n != expect: bad.append(f'{label}: found {n}, expected {expect}'); return
    s = s.replace(a, b); log.append(f'{label}: ok')

# 21. Branches map card: Singhnagar, Poranki and Autonagar showed no photo when picked on the map (photo was empty in
#     the map data). Use the same storefront photos as their branch cards below.
PH = {'singhnagar': ('assets/br-singhnagar-m.webp', "RR's Joints storefront at the Singhnagar outlet at dusk"),
      'poranki': ('assets/br-poranki-m.webp', 'RR Durbar building and signage at the Poranki outlet'),
      'autonagar': ('assets/br-autonagar-m.webp', 'RR Durbar takeaway storefront at the Autonagar outlet at night')}
_i = s.find('const OUTLETS = ')
if _i < 0 or s.count('const OUTLETS = ') != 1: bad.append('21 map photos: OUTLETS not found once')
else:
    _e = s.find('\n', _i); _line = s[_i:_e]; _ok = 0
    for _id, (_src, _alt) in PH.items():
        _j = _line.find('{"id": "%s"' % _id); _k = _line.find('}', _j)
        _seg = _line[_j:_k]
        if _j >= 0 and _seg.count('"photo": null, "photoAlt": ""') == 1:
            _line = _line[:_j] + _seg.replace('"photo": null, "photoAlt": ""', '"photo": ' + _json.dumps(_src) + ', "photoAlt": ' + _json.dumps(_alt)) + _line[_k:]; _ok += 1
    if _ok != 3: bad.append(f'21 map photos: fixed {_ok}, expected 3')
    else: s = s[:_i] + _line + s[_e:]; log.append('21 map photos: ok')

# 22. About Us reveal: open past the photo edges (keeps the soft fade); safety reveal only when the script did not run.
rep(' html.rr-js #rraExt:not(.ext-in) .rra-frame{clip-path:inset(0 50% 0 50%);animation:rrExtSafeC 0s 3.5s forwards}',
    ' html.rr-js #rraExt:not(.ext-in) .rra-frame{clip-path:inset(-15% 50% -15% 50%);animation:rrExtSafeC 0s 3.5s forwards}\n html.rr-js #rraExt.ext-armed:not(.ext-in) .rra-frame,html.rr-js #rraExt.ext-armed:not(.ext-in) .ext-dusk{animation:none}', '22 closed state')
rep(' #rraExt.ext-in .rra-frame{clip-path:inset(0 0 0 0);transition:clip-path 1.2s cubic-bezier(.16,1,.3,1)}',
    ' #rraExt.ext-in .rra-frame{clip-path:inset(-15% -15% -15% -15%);transition:clip-path 1.2s cubic-bezier(.16,1,.3,1)}', '22 open state')
rep('@keyframes rrExtSafeC{to{clip-path:inset(0 0 0 0)}}', '@keyframes rrExtSafeC{to{clip-path:inset(-15% -15% -15% -15%)}}', '22 safety state')
rep("place();img.addEventListener('load',place);", "f.classList.add('ext-armed');place();img.addEventListener('load',place);", '22 script armed')

# 22b. Desktop: the photo's soft left fade sat mostly outside its frame, leaving a hard edge. Fade now runs inside the
#      visible area, so the building melts into the red panel.
rep('@keyframes rrExtGlow{to{opacity:1}}', '@keyframes rrExtGlow{to{opacity:1}}\n@media(min-width:981px){html body #about #rraExt .rra-frame img{-webkit-mask-image:linear-gradient(90deg,transparent 0,transparent 6%,rgba(0,0,0,.45) 16%,rgba(0,0,0,.85) 27%,#000 36%)!important;mask-image:linear-gradient(90deg,transparent 0,transparent 6%,rgba(0,0,0,.45) 16%,rgba(0,0,0,.85) 27%,#000 36%)!important}}', '22b soft edge')

print('\n'.join(log))
if bad: print('STOP, nothing written:\n  ' + '\n  '.join(bad)); sys.exit(1)
if WRITE: p.write_text(s, encoding='utf-8'); print('PATCHED src/site.html')
else: print('dry run OK (add --write)')
