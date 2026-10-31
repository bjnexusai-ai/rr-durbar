import sys, shutil
F='src/site.html'; ID='rr-mobile-v1'
CSS='''<style id="rr-mobile-v1">/* rr-mobile-v1 START: one mobile block; delete from here to END to revert */
:root{--rr-tabbar-h:calc(62px + env(safe-area-inset-bottom,0px))}
@media(max-width:900px){
#m61-bar{bottom:calc(var(--rr-tabbar-h) + 12px)!important}
#m61-toast{bottom:calc(var(--rr-tabbar-h) + 82px)!important}
#ordering .od-mbar{bottom:calc(var(--rr-tabbar-h) + 10px)!important}}
@media(max-width:700px){
:root{--rr-cream:#f8f0e5;--rr-crim:#881929;--rr-ink:#3a1408;--rr-photo-h:46svh}
html body #home.hero{background:var(--rr-cream)!important}
html body #home.hero::after,html body #home.hero .slide::before,html body #home.hero .slide::after,html body #home .slide .hero-copy::before,html body #home .slide .hero-copy::after{display:none!important}
html body #home .slide .slide-photo{position:absolute!important;left:0!important;right:0!important;top:0!important;bottom:auto!important;width:100%!important;height:var(--rr-photo-h)!important;overflow:hidden!important;transform:none!important;filter:none!important;-webkit-mask-image:none!important;mask-image:none!important}
html body #home .slide .slide-photo .hero-image{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;object-fit:cover!important;object-position:center 68%!important;transform:none!important;animation:none!important}
html body #home .slide .slide-content{inset:auto 0 0 0!important;top:calc(var(--rr-photo-h) - 22px)!important;align-items:flex-start!important;padding:22px 20px 0!important;background:var(--rr-cream)!important;border-radius:24px 24px 0 0!important;z-index:4!important}
html body #home .slide .hero-copy{width:100%!important;max-width:none!important;margin:0!important;padding:0!important;text-shadow:none!important}
html body #home .slide .hero-eyebrow{color:var(--rr-crim)!important;text-shadow:none!important}
html body #home .slide .hero-title{color:var(--rr-crim)!important;text-shadow:none!important;font-size:clamp(28px,8.6vw,34px)!important;line-height:1.08!important}
html body #home .slide .hero-title em{color:#a8761c!important}
html body #home .slide .hero-desc{color:var(--rr-ink)!important;text-shadow:none!important;max-width:none!important;font-size:14px!important;line-height:1.55!important;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
html body #home .slide .slide-index{color:var(--rr-ink)!important}
html body #home .hero-first{color:var(--rr-crim)!important;text-shadow:none!important}}
/* rr-mobile-v1 END */</style>
'''
s=open(F,encoding='utf-8').read()
if ID in s: print('already applied: nothing to do'); sys.exit(0)
if s.count('</body>')!=1: print('STOP: expected exactly one </body>, found',s.count('</body>')); sys.exit(1)
out=s.replace('</body>',CSS+'</body>')
print('OK: block %d bytes inserted before </body>'%len(CSS))
if '--write' in sys.argv:
    shutil.copy(F,F+'.bak3'); open(F,'w',encoding='utf-8').write(out); print('WRITTEN (backup src/site.html.bak3, never commit)')
else: print('DRY RUN: add --write to apply')
