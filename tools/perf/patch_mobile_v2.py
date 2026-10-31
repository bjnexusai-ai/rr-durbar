import sys, shutil
F='src/site.html'
EDITS=[
('--rr-photo-h:46svh','--rr-photo-h:38svh'),
('html body #home .slide .slide-content{inset:auto 0 0 0!important;top:calc(var(--rr-photo-h) - 22px)!important;',
 'html body #home .slide .slide-content{position:absolute!important;inset:auto 0 0 0!important;top:auto!important;height:calc(100% - var(--rr-photo-h) + 22px)!important;min-height:0!important;transform:none!important;translate:none!important;margin:0!important;'),
('-webkit-line-clamp:3','-webkit-line-clamp:2'),
('html body #home .hero-first{color:var(--rr-crim)!important;',
 'html body #home .slide .slide-content::before,html body #home .slide .slide-content::after,html body #home .hero-bottom::before,html body #home .hero-bottom::after{display:none!important}\nhtml body #home .hero-first{color:var(--rr-crim)!important;'),
]
s=open(F,encoding='utf-8').read()
i=s.find('<style id="rr-mobile-v1">'); j=s.find('/* rr-mobile-v1 END */')
if i<0 or j<0: print('STOP: block not found'); sys.exit(1)
blk=s[i:j]
for a,b in EDITS:
    if b in blk and a not in blk: continue
    if blk.count(a)!=1: print('STOP: anchor count',blk.count(a),'for:',a[:70]); sys.exit(1)
    blk=blk.replace(a,b)
print('OK: all edits matched inside the rr-mobile-v1 block')
if '--write' in sys.argv:
    shutil.copy(F,F+'.bak4'); open(F,'w',encoding='utf-8').write(s[:i]+blk+s[j:]); print('WRITTEN (backup src/site.html.bak4, never commit)')
else: print('DRY RUN: add --write')
