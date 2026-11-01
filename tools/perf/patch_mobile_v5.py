#!/usr/bin/env python3
"""Mobile v5 (31 Oct, from the owner's phone screenshots):
  1 Phone home top: gold words darker (#a8761c -> #8a5a12, was hard to read on cream).
  2 Phone home top: the music button overlapped the slide counter/description on shorter phones.
    On phones it becomes a small round chip (button + bars) sitting on the photo, just above the cream panel.
  3 Phone signature dishes: names and the long description sat on top of the food. On phones the text now sits
    BELOW the photo on the card's own dark background, so the dish is clear.
  5 Phone Branches page: the section had a fixed height and cut the illustrated map off; only the green leaf
    decoration showed. On phones the section now grows to fit, the full map shows, and the leaf decoration is hidden.
  4 Desktop-site mode on a phone / tablets held upright: the wide desktop photo was zoomed to fill a tall screen
    (looked blurred / "not loading"). Upright screens up to 1366px now get the tall photo made for phones.
Desktop (landscape) is not changed. Exact-match edits: STOP unless every anchor count is right. Idempotent.
Run from the repo root. Revert: restore src/site.html.bakm5"""
import pathlib, sys
p = pathlib.Path("src/site.html")
if not p.exists(): sys.exit("STOP: run from the repo root (src/site.html not found)")
s = p.read_text(encoding="utf-8")
if 'id="rr-mobile-v5"' in s: print("already done (nothing to change)"); sys.exit(0)
i = s.find('<style id="rr-mobile-v1">'); j = s.find("</style>", i)
if i < 0 or j < 0: sys.exit("STOP: rr-mobile-v1 block not found")
blk = s[i:j]
OLD_GOLD, NEW_GOLD = "--rr-gold:#a8761c", "--rr-gold:#8a5a12"
if blk.count(OLD_GOLD) != 1: sys.exit("STOP: %s found %d times in rr-mobile-v1 (need 1)" % (OLD_GOLD, blk.count(OLD_GOLD)))
SRC_OLD = '<source media="(max-width:700px)" srcset="assets/hero-m-'
SRC_NEW = '<source media="(max-width:700px), (orientation:portrait) and (max-width:1366px)" srcset="assets/hero-m-'
if s.count(SRC_OLD) != 8: sys.exit("STOP: hero phone photo sources found %d times (need 8)" % s.count(SRC_OLD))
if s.count("</body>") != 1: sys.exit("STOP: </body> found %d times (need 1)" % s.count("</body>"))
SIG = "html body #bestsellers .sig-bento.sig-bento.sig-bento>.rr-food-card.rr-signature-card"
BLOCK = """<style id="rr-mobile-v5">/* rr-mobile-v5 START (phone fixes 31 Oct). Delete this block + the script below to revert the CSS/JS part */
@media(max-width:700px){
/* 2 music chip on the photo */
html body #home>#musicBox.rr-mb-chip{position:absolute!important;left:12px!important;right:auto!important;bottom:auto!important;top:calc(var(--rr-photo-h,42svh) - 70px)!important;z-index:7!important;margin:0!important;min-width:0!important;width:auto!important;max-width:none!important;padding:5px 10px 5px 5px!important;gap:8px!important;transform:none!important}
html body #home>#musicBox.rr-mb-chip .music-info{display:none!important}
html body #home .slide.active .slide-index{color:#3a1408!important}
/* 5 branches map: no cut-off, no leaf decoration */
html body #br-locator{height:auto!important;min-height:0!important;max-height:none!important}
html body #br-locator .leaves{display:none!important}
/* 3 signature dishes: text under the photo */
html body #bestsellers .sig-bento.sig-bento.sig-bento{grid-auto-rows:auto!important;grid-template-rows:none!important;align-items:stretch!important}
SIG.rr-signature-card:nth-child(n){height:auto!important;min-height:0!important;aspect-ratio:auto!important;display:flex!important;flex-direction:column!important}
SIG::before{display:none!important}
SIG .rr-media{position:relative!important;inset:auto!important;width:100%!important;height:132px!important;flex:none!important;border-bottom-left-radius:0!important;border-bottom-right-radius:0!important}
SIG:nth-child(1) .rr-media{height:190px!important}
SIG .rr-media img{height:100%!important}
SIG .rr-food-copy{position:relative!important;inset:auto!important;flex:1 1 auto!important;padding:10px 12px 12px!important;background:#2a0a0e!important}
}
/* rr-mobile-v5 END */</style>
<script id="rr-mobile-v5-js">/* phones: move the music button onto the photo (same element, so the music still works); back on wider screens */
(function(){var mq=matchMedia('(max-width:700px)'),box=document.getElementById('musicBox'),home=document.getElementById('home');if(!box||!home)return;
var par=box.parentNode,next=box.nextSibling;
function place(){if(mq.matches){if(box.parentNode!==home){home.appendChild(box)}box.classList.add('rr-mb-chip')}else{box.classList.remove('rr-mb-chip');if(box.parentNode!==par){par.insertBefore(box,next&&next.parentNode===par?next:null)}}}
place();if(mq.addEventListener)mq.addEventListener('change',place);else if(mq.addListener)mq.addListener(place)})();</script>
""".replace("SIG", SIG)
pathlib.Path("src/site.html.bakm5").write_text(s, encoding="utf-8")
s = s[:i] + blk.replace(OLD_GOLD, NEW_GOLD) + s[j:]
s = s.replace(SRC_OLD, SRC_NEW).replace("</body>", BLOCK + "</body>")
p.write_text(s, encoding="utf-8")
print("PATCHED: darker gold, music chip on photo, signature text under photo, upright tablets get the tall photo, full branches map (backup src/site.html.bakm5)")
