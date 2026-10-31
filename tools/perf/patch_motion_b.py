#!/usr/bin/env python3
"""Motion B (31 Oct): three premium touches, nothing else changes.
  B1  smooth page-to-page transitions: the site already has the animation (header stays, page fades/slides in);
      this switches it on for real page loads (/menu/ -> /about-us/ ...). Browsers without support just load normally.
      Also names the phone tab bar so it stays put. Not on /checkout/v2/ (that page does not opt in).
  B2  add-to-cart flight: flies the DISH PHOTO (not a gold blob) when the + button sits in a card with a photo,
      starts from the photo, calmer curve, no spin.
  B3  signature dishes (home): each photo is uncovered once as it scrolls in (curtain lifts) with a slow push-in.
      Replaces the hover shine on those cards. Uses the cards' existing reveal trigger (sig-armed / sig-in).
All movement sits inside prefers-reduced-motion:no-preference. Transform/opacity only.
Exact-match edits: STOP (nothing written) unless every anchor occurs exactly once. Idempotent: second run says 'already done'.
Run from the repo root:  python3 tools/perf/patch_motion_b.py        Revert: restore src/site.html.bakmb"""
import pathlib, sys
p = pathlib.Path("src/site.html")
if not p.exists(): sys.exit("STOP: run from the repo root (src/site.html not found)")
s = p.read_text(encoding="utf-8")
if 'id="rr-motion-b"' in s: print("already done (nothing to change)"); sys.exit(0)

# B1 must sit in <head>: the NEW page has to know about the opt-in before its first paint, or the browser skips the transition.
HEAD = """<style id="rr-motion-b-vt">/* rr-motion-b: page-to-page transitions (B1). Delete this block to revert B1 */
@media(prefers-reduced-motion:no-preference){@view-transition{navigation:auto}#rr-tabbar{view-transition-name:rr-tabbar}}</style>
"""
CSS = """<style id="rr-motion-b">/* rr-motion-b START: B3 signature reveal. Delete this block to revert B3 */
@media(prefers-reduced-motion:no-preference){
html body #bestsellers .sig-bento.sig-armed>.rr-signature-card .rr-media img{scale:1.14;transition:transform 1.2s cubic-bezier(.2,.7,.15,1),scale 1.6s cubic-bezier(.16,1,.3,1) var(--sd,0ms)}
html body #bestsellers .sig-bento.sig-armed>.rr-signature-card.sig-in .rr-media img{scale:1}
html body #bestsellers .sig-bento.sig-armed>.rr-signature-card .rr-media::after{content:""!important;display:block!important;position:absolute!important;inset:0!important;left:0!important;width:100%!important;z-index:2;margin:0;background:#24050b!important;opacity:1!important;transform:scaleY(1)!important;transform-origin:50% 0;animation:none!important;transition:transform 1s cubic-bezier(.16,1,.3,1) calc(var(--sd,0ms) + 120ms)!important;pointer-events:none}
html body #bestsellers .sig-bento.sig-armed>.rr-signature-card.sig-in .rr-media::after{transform:scaleY(0)!important}
}
/* rr-motion-b END */</style>
"""

EDITS = [
 # B2a: use the card's dish photo, and start the flight from that photo
 ("var img=src.tagName==='IMG'?src:src.querySelector&&src.querySelector('img');",
  "var img=src.tagName==='IMG'?src:src.querySelector&&src.querySelector('img');"
  "/*rr-motion-b*/if(!img&&src.closest){var rrC=src.closest('.rr-food-card,.m52-t,.dish,.p3-d,article'),rrI=rrC&&rrC.querySelector('img');"
  "if(rrI&&rrI.currentSrc){img=rrI;var rrR=rrI.getBoundingClientRect();if(rrR.width&&rrR.height&&rrR.bottom>0&&rrR.top<innerHeight){s=rrR;"
  "size=Math.max(56,Math.min(opt.size||96,Math.max(s.width,s.height)));fly.style.width=fly.style.height=size+'px'}}}"),
 # B2b: no spin
 ("scale('+sc+') rotate('+(t*14)+'deg)',", "scale('+sc+')',"),
 # B2c: calmer curve (no ease-in at the start)
 ("{duration:opt.duration||680,easing:'cubic-bezier(.45,.05,.55,.95)',fill:'forwards'}",
  "{duration:opt.duration||640,easing:'cubic-bezier(.4,0,.2,1)',fill:'forwards'}"),
]
for old, new in EDITS:
    n = s.count(old)
    if n != 1: sys.exit("STOP: anchor found %d times (need 1): %s" % (n, old[:70]))
for tag in ("</head>", "</body>"):
    if s.count(tag) != 1: sys.exit("STOP: %s found %d times (need 1)" % (tag, s.count(tag)))
pathlib.Path("src/site.html.bakmb").write_text(s, encoding="utf-8")
for old, new in EDITS: s = s.replace(old, new)
s = s.replace("</head>", HEAD + "</head>").replace("</body>", CSS + "</body>")
p.write_text(s, encoding="utf-8")
print("PATCHED: B1 page transitions, B2 photo flight, B3 signature reveal (backup src/site.html.bakmb)")
