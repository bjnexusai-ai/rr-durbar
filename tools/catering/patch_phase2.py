#!/usr/bin/env python3
"""Step 2: "Lighting the Durbar" on /catering/ (3 Nov). APPLY AFTER rr-1B (needs #rrs-wrap, the wire overlay and the 1B script).
 One-time sequence when the stages picture is 30% in view:
   0     picture dimmed (dark overlay .6), wires dark, labels hidden
   0.3s  the centre handi lights (warm glow 0.9 -> 1) and the steam starts
   0.6s  one gold spark per wire leaves the handi, 250 ms apart, 0.9 s along its traced wire (wires.json); the wire lights behind it
   land  the stage switches on: its area opens in the dark overlay, glow flash, label rises, 6 gold particles
   end   the overlay fades out
 Phone: the chain lights row by row as each row is 40% in view; Baby Showers last.
 Idle current every 6-8 s (one random wire, peak opacity .5; pauses offscreen / hidden tab / open card).
 Hover (laptop) / tap (phone): that stage's wire glows from the handi, the other stages dim .15, then the card opens.
 Reduced motion: fully lit at once, no sparks / idle / particles.
Also: the sticky pill hides as soon as the form's top edge enters the viewport; the arrival burst starts above the label and flies upward, away from the text.
Only the /catering/ stages block of src/site.html changes (its CSS block, its script, one new script after the 1B script, and the pill rule in the 1B script).
Exact-match: STOPS unless each anchor is found the expected number of times. Idempotent. Backup: src/site.html.bak2. Run from the repo root, then rebuild."""
import pathlib, shutil, sys
HERE = pathlib.Path(__file__).resolve().parent
SITE = pathlib.Path("src/site.html")
for f in (SITE, HERE / "p2_css.txt", HERE / "p2_js.txt"):
    if not f.exists(): sys.exit("STOP: %s not found (run from the repo root, after unzipping rr-2.zip)" % f)
s = SITE.read_text(encoding="utf-8")
if 'id="rr-catering-2-js"' in s:
    print("already done (nothing to change in src/site.html)"); sys.exit(0)
if 'id="rr-catering-1b-js"' not in s: sys.exit("STOP: rr-1B is not applied yet (apply rr-1B first)")
def need(name, a, n=1):
    c = s.count(a)
    if c != n: sys.exit("STOP: %s found %d times (need %d)" % (name, c, n))
CSS_A = "@media(prefers-reduced-motion:no-preference){\n .rrs.js .rrs-dim{opacity:.55}\n"
CSS_B = " .rrs.on .rrs-hint{animation:rrsHint 1.1s ease-in-out 2.6s 2 backwards}\n}\n"
JS_ON = ("function on(){root.classList.add('on')}\nif('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){if(es[0].isIntersecting){on();io.disconnect()}},{threshold:.3});io.observe(root)}else on();\n")
JS_CLICK = "root.addEventListener('click',function(e){var b=e.target.closest('.rrs-b');if(b)show(b.getAttribute('data-k'),b)});\n"
JS_HIDE = "function hide(back){if(!isOpen)return;isOpen=false;card.classList.remove('open');scrim.classList.remove('open');\n"
JS_JS = "root.classList.add('js');\n"
PILL_OLD = " var past=r.bottom<vh-8,vis=Math.min(f.bottom,vh)-Math.max(f.top,0),inForm=vis>=Math.min(f.height*.35,vh*.35);\n"
PILL_NEW = " var past=r.bottom<vh-8,inForm=f.top<vh&&f.bottom>0;/* hide the pill as soon as the form's top edge enters the viewport */\n"
END1B = "addEventListener('scroll',req,{passive:true});addEventListener('resize',req);addEventListener('load',req);upd();\n})();\n</script>\n"
for n, a in (("css start", CSS_A), ("css end", CSS_B), ("old lights-on trigger", JS_ON), ("click handler", JS_CLICK), ("hide()", JS_HIDE), ("js class", JS_JS), ("end of 1B script", END1B), ("pill rule", PILL_OLD)):
    need(n, a)
i = s.index(CSS_A); j = s.index(CSS_B) + len(CSS_B)
if not (0 < j - i < 2000): sys.exit("STOP: the old motion CSS block is not the expected size (%d)" % (j - i))
shutil.copyfile(SITE, "src/site.html.bak2")
css = (HERE / "p2_css.txt").read_text(encoding="utf-8"); js = (HERE / "p2_js.txt").read_text(encoding="utf-8")
s = s[:i] + css + s[j:]
s = s.replace(JS_ON, "function on(){root.classList.add('on')}\n/* lights-on: see rr-catering-2-js (it adds .on when the sequence ends) */\n")
s = s.replace(JS_CLICK, ("root.addEventListener('click',function(e){var b=e.target.closest('.rrs-b');if(!b)return;var k=b.getAttribute('data-k');\n"
    " if(window.rrsSpot)window.rrsSpot(k);var lag=window.rrsSpotLag?window.rrsSpotLag():0;\n if(lag)setTimeout(function(){show(k,b)},lag);else show(k,b)});\n"))
s = s.replace(JS_HIDE, JS_HIDE + "if(window.rrsSpot&&!root.querySelector('.rrs-b:hover'))window.rrsSpot(null);\n")
s = s.replace(JS_JS, "")
s = s.replace(PILL_OLD, PILL_NEW)
s = s.replace(END1B, END1B + js)
SITE.write_text(s, encoding="utf-8")
print("PATCHED: catering wire effects (Lighting the Durbar) (backup src/site.html.bak2)")
