#!/usr/bin/env python3
"""1C wording: one call-to-action everywhere, "Plan your event ->", and the small links go straight to the enquiry form.
Run AFTER patch_phase1c.py. Exact-match, idempotent, backups *.bak1cw. Footer and nav links stay /catering/ (the landing page)."""
import sys, pathlib
R=[('src/site.html',[
  ('<a href="/catering/">Planning an event? We cater too &rarr;</a>', '<a href="/catering/#catering-form">Catering &amp; Events: Plan your event &rarr;</a>', 1),
  ('<a href="/catering/">Planning an event? See catering &rarr;</a>', '<a href="/catering/#catering-form">Catering &amp; Events: Plan your event &rarr;</a>', 2),
  ('<a class="m52-cat" href="/catering/"><span class="m52-cat-t"><small>Catering &amp; Events</small><b>Hosting a crowd? Get a catering quote</b>',
   '<a class="m52-cat" href="/catering/#catering-form"><span class="m52-cat-t"><small>Catering &amp; Events</small><b>Hosting a crowd? Plan your event</b>', 1)]),
 ('public/checkout/index.html',[
  ('href="/catering/" style="display:inline-block;padding:12px 8px;color:var(--m);font-weight:700">Planning an event? We cater too &rarr;</a>',
   'href="/catering/#catering-form" style="display:inline-block;padding:12px 8px;color:var(--m);font-weight:700">Catering &amp; Events: Plan your event &rarr;</a>', 1)]),
 ('public/checkout/v2/index.html',[
  ('href="/catering/" style="display:inline-block;padding:10px 0;color:var(--m,#4a0e1a);font-weight:700">Planning an event? We cater too &rarr;</a>',
   'href="/catering/#catering-form" style="display:inline-block;padding:10px 0;color:var(--m,#4a0e1a);font-weight:700">Catering &amp; Events: Plan your event &rarr;</a>', 1)])]
todo=[]
for f,reps in R:
    s=pathlib.Path(f).read_text(encoding='utf-8'); t=s
    for a,b,n in reps:
        if b in t and a not in t: continue
        c=t.count(a)
        if c!=n: print(f'STOP: {f}: anchor found {c} times, expected {n}: {a[:60]}'); sys.exit(1)
        t=t.replace(a,b)
    if t!=s: todo.append((f,s,t))
if not todo: print('already done'); sys.exit(0)
for f,s,t in todo:
    pathlib.Path(f+'.bak1cw').write_text(s,encoding='utf-8'); pathlib.Path(f).write_text(t,encoding='utf-8')
print('PATCHED: "Plan your event" wording + links to the enquiry form ('+', '.join(f for f,_,_ in todo)+')')
