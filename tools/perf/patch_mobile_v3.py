#!/usr/bin/env python3
"""Mobile hero v3: replace the rr-mobile-v1 block with the corrected one. STOP unless the old block is exactly what was read (2840 chars)."""
import pathlib, sys
p = pathlib.Path("src/site.html"); s = p.read_text(encoding="utf-8")
START = '<style id="rr-mobile-v1">'
if s.count(START) != 1: sys.exit("STOP: block start found %d times" % s.count(START))
i = s.index(START); j = s.index("</style>", i)
if j - i != 2840: sys.exit("STOP: old block is %d chars, expected 2840 (it changed since it was read)" % (j - i))
NEW = r"""<style id="rr-mobile-v1">/* rr-mobile-v1 START: one mobile block; delete from here to END to revert */
:root{--rr-tabbar-h:calc(62px + env(safe-area-inset-bottom,0px))}
@media(max-width:900px){
#m61-bar{bottom:calc(var(--rr-tabbar-h) + 12px)!important}
#m61-toast{bottom:calc(var(--rr-tabbar-h) + 82px)!important}
#ordering .od-mbar{bottom:calc(var(--rr-tabbar-h) + 10px)!important}}
@media(max-width:700px){
:root{--rr-cream:#f8f0e5;--rr-crim:#881929;--rr-ink:#3a1408;--rr-gold:#a8761c;--rr-photo-h:42svh}
html body #home.hero{background:var(--rr-cream)!important}
html body #home.hero::after,html body #home.hero .slide::before,html body #home.hero .slide::after,html body #home .slide .hero-copy::before,html body #home .slide .hero-copy::after{display:none!important}
html body #home .slide .slide-photo{position:absolute!important;left:0!important;right:0!important;top:0!important;bottom:auto!important;width:100%!important;height:var(--rr-photo-h)!important;overflow:hidden!important;transform:none!important;filter:none!important;-webkit-mask-image:none!important;mask-image:none!important}
html body #home .slide .slide-photo .hero-image{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;object-fit:cover!important;object-position:center 78%!important;transform:none!important;animation:none!important}
html body #home.hero article.slide[data-scene].slide .slide-photo picture img.hero-image{object-position:center 78%!important}
html body #home.hero article.slide .slide-content{position:absolute!important;left:0!important;right:0!important;bottom:0!important;top:auto!important;width:100%!important;max-width:none!important;box-sizing:border-box!important;height:calc(100% - var(--rr-photo-h) + 22px)!important;min-height:0!important;transform:none!important;translate:none!important;margin:0!important;align-items:flex-start!important;padding:22px 20px 0!important;background:var(--rr-cream)!important;border-radius:24px 24px 0 0!important;z-index:4!important}
html body #home.hero article.slide .hero-copy{width:100%!important;max-width:none!important;margin:0!important;padding:0!important;text-shadow:none!important}
html body #home.hero article.slide .hero-eyebrow{display:block!important;margin:0 0 6px!important;color:var(--rr-crim)!important;-webkit-text-fill-color:var(--rr-crim)!important;text-shadow:none!important;font-size:11px!important;letter-spacing:.14em!important;font-weight:800!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;max-width:100%!important}
html body #home.hero article.slide .hero-title{color:var(--rr-crim)!important;text-shadow:none!important;font-size:clamp(26px,7.8vw,30px)!important;line-height:1.08!important;margin:0 0 8px!important}
html body #home.hero article.slide .hero-title em{color:var(--rr-gold)!important}
html body #home.hero article.slide .hero-desc{display:-webkit-box!important;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden!important;color:var(--rr-ink)!important;-webkit-text-fill-color:var(--rr-ink)!important;text-shadow:none!important;max-width:none!important;font-size:14px!important;line-height:1.5!important;font-weight:500!important;margin:0 0 8px!important;max-height:3em!important}
html body #home.hero article.slide .slide-index{margin:0!important;color:var(--rr-ink)!important;text-shadow:none!important;font-size:12px!important}
html body #home.hero article.slide .slide-index b,html body #home.hero article.slide .slide-index span{color:var(--rr-ink)!important;text-shadow:none!important}
html body #home.hero article.slide .slide-index .hero-cap{color:var(--rr-gold)!important;text-shadow:none!important;opacity:1!important}
html body #home .slide .slide-content::before,html body #home .slide .slide-content::after,html body #home .hero-bottom::before,html body #home .hero-bottom::after{display:none!important}
html body #home .hero-first{color:var(--rr-crim)!important;text-shadow:none!important}}
/* rr-mobile-v1 END */"""
pathlib.Path("src/site.html.bakm3").write_text(s, encoding="utf-8")
p.write_text(s[:i] + NEW + s[j:], encoding="utf-8")
print("PATCHED mobile block v3 (old %d chars, new %d chars, backup src/site.html.bakm3)" % (j - i, len(NEW)))
