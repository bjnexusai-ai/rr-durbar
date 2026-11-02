#!/usr/bin/env python3
"""Catering page: replace the 4 plain "Occasions we cater" cards with the lit stages picture (2 Nov).
 - laptop (>=900px): landscape picture, 5 stages.  phone (<900px): portrait picture, 6 stages (Baby Showers is phone only for now).
 - one <picture>, so each device downloads only its own picture. Plates are real <button>s. A hidden list keeps the events for Google/screen readers.
 - effects: lights on (focal moment), glow + labels one by one, steam (loops), hover/focus, detail card (bottom sheet on phone), phone tap hint.
 - Enquire scrolls to #catering-form and preselects the event. Adds the "Baby shower" option to the form.
 - Candle flicker (effect 5) is left out on purpose (the handoff says drop it if busy; lantern spots not mapped).
Exact-match: STOPS unless each anchor is found the expected number of times. Idempotent. Backup: src/site.html.bakcs. Run from the repo root.
Also copies tools/catering/img/*.webp into public/assets/."""
import pathlib, shutil, sys
p = pathlib.Path("src/site.html")
if not p.exists(): sys.exit("STOP: run from the repo root (src/site.html not found)")
s = p.read_text(encoding="utf-8")
imgs = sorted(pathlib.Path("tools/catering/img").glob("*.webp"))
if len(imgs) != 4: sys.exit("STOP: expected 4 webp files in tools/catering/img, found %d" % len(imgs))
for f in imgs:
    d = pathlib.Path("public/assets") / f.name
    if not d.exists() or d.read_bytes() != f.read_bytes(): shutil.copyfile(f, d); print("copied", d)
if 'id="rr-catering-stages"' in s: print("already done (nothing to change in src/site.html)"); sys.exit(0)

OPEN = '<section class="rr-section" id="catering-occasions" data-edit-section="catering-occasions">'
OPT_OLD = '<option>Large gathering</option><option>Other</option></select>'
OPT_NEW = '<option>Large gathering</option><option>Baby shower</option><option>Other</option></select>'
for name, a, n in (("occasions section", OPEN, 1), ("form options", OPT_OLD, 1), ("</body>", "</body>", 1)):
    if s.count(a) != n: sys.exit("STOP: %s found %d times (need %d)" % (name, s.count(a), n))
i = s.index(OPEN); j = s.index("</section>", i) + len("</section>")
old = s[i:j]
if old.count('<article class="rr-card">') != 4 or "<section" in old[len(OPEN):] or 'rr-grid-4' not in old:
    sys.exit("STOP: the old Occasions section is not the 4-card block we expect (page changed?)")

# ---- data: centre x,y and size w,h in % of the picture; order = glow order (centre handi first)
LAP = [("royal", 53.5, 71.4, 13.8, 8.5), ("weddings", 25.4, 39.1, 9.9, 6.5), ("corporate", 81.7, 39.9, 10.1, 6.6),
       ("celebrations", 17.4, 82.3, 12.3, 8.3), ("outdoor", 85.3, 84.4, 11.6, 8.1)]
PHO = [("royal", 50.1, 26.8, 19.1, 3.9), ("weddings", 24.9, 47.3, 16.4, 3.6), ("corporate", 75.5, 47.2, 16.5, 3.7),
       ("celebrations", 25.3, 67.5, 18.7, 4.1), ("outdoor", 75.5, 68.0, 17.2, 3.8), ("baby", 50.1, 91.7, 20.3, 4.2)]
NAME = {"royal": "Royal Catering", "weddings": "Weddings", "corporate": "Corporate Events", "celebrations": "Celebrations",
        "outdoor": "Outdoor Events", "baby": "Baby Showers"}
def btns(rows, extra=""):
    o = []
    for n, (k, x, y, w, h) in enumerate(rows):
        hint = " rrs-hint" if (extra == "p" and k == "royal") else ""
        o.append('<button type="button" class="rrs-b%s" data-k="%s" style="left:%.2f%%;top:%.2f%%;width:%.2f%%;height:%.2f%%;--d:%.2fs" aria-label="%s – catering details" aria-haspopup="dialog"><span class="rrs-t">%s</span><span class="rrs-v" aria-hidden="true">View</span></button>'
                 % (hint, k, x - w / 2, y - h / 2, w, h, 1.2 + n * 0.15, NAME[k], NAME[k]))
    return "".join(o)
STEAM = '<span class="rrs-steam" aria-hidden="true"><i></i><i></i><i></i></span>'
HTML = ('<section class="rr-section rr-dark" id="catering-occasions" data-edit-section="catering-occasions"><div class="rr-container">'
 '<p class="rr-eyebrow">Occasions we cater</p><h2 class="rr-heading">Every gathering, served the Durbar way.</h2>'
 '<div class="rrs" id="rrs"><div class="rrs-art"><picture>'
 '<source media="(min-width:900px)" type="image/webp" srcset="assets/rr-stages-l-1280.webp 1280w, assets/rr-stages-l-1672.webp 1672w" sizes="(min-width:1312px) 1280px, 96vw"/>'
 '<img src="assets/rr-stages-p-941.webp" srcset="assets/rr-stages-p-720.webp 720w, assets/rr-stages-p-941.webp 941w" sizes="(max-width:599px) 100vw, 560px" width="941" height="1672" loading="lazy" decoding="async" alt="Decorated RR Durbar catering stages around a copper biryani handi"/>'
 '</picture><span class="rrs-dim" aria-hidden="true"></span></div>'
 '<div class="rrs-l">' + btns(LAP) + STEAM + '</div><div class="rrs-p">' + btns(PHO, "p") + STEAM + '</div></div>'
 '<ul class="rrs-sr"><li>Weddings</li><li>Corporate Events</li><li>Royal Catering</li><li>Celebrations</li><li>Outdoor Events</li><li>Baby Showers</li></ul>'
 '<div class="rrs-scrim" hidden></div>'
 '<div class="rrs-card" role="dialog" aria-modal="true" aria-labelledby="rrs-ct" hidden tabindex="-1"><button type="button" class="rrs-x" aria-label="Close">&times;</button>'
 '<h3 id="rrs-ct"></h3><p class="rrs-cp"></p><a class="rr-gold-button rrs-enq" href="#catering-form">Enquire</a></div>'
 '</div></section>')

CSS = r"""/* rr-catering-stages: lit catering stages picture. Delete this block + the script below + restore the old section to revert */
html body #catering-occasions{background:radial-gradient(120% 90% at 50% 38%,#2a0508 0%,#16030a 55%,#0a0002 100%)!important;overflow:hidden}
.rrs{position:relative;margin:26px auto 0;width:100%;max-width:1280px;aspect-ratio:1672/941}
.rrs-art{position:absolute;inset:0;-webkit-mask-image:linear-gradient(180deg,transparent 0,#000 7%,#000 93%,transparent 100%),linear-gradient(90deg,transparent 0,#000 6%,#000 94%,transparent 100%);-webkit-mask-composite:source-in;mask-image:linear-gradient(180deg,transparent 0,#000 7%,#000 93%,transparent 100%),linear-gradient(90deg,transparent 0,#000 6%,#000 94%,transparent 100%);mask-composite:intersect}
.rrs-art picture,.rrs-art img{display:block;width:100%;height:100%}
.rrs-art img{object-fit:cover}
.rrs-dim{position:absolute;inset:0;background:#0b0001;opacity:0;pointer-events:none}
.rrs-p{display:none}
.rrs-sr{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
html body .rrs .rrs-b{position:absolute;display:flex;align-items:center;justify-content:center;margin:0;padding:0 .6%;border:0;border-radius:50%;background:none;box-shadow:none;cursor:pointer;color:#e9b85c;font:inherit;-webkit-tap-highlight-color:transparent;z-index:2;min-width:0!important;min-height:0!important}
.rrs-b::before{content:"";position:absolute;left:-26%;right:-26%;top:-90%;bottom:-90%;border-radius:50%;pointer-events:none;background:radial-gradient(closest-side,rgba(255,196,110,0) 52%,rgba(255,196,110,.42) 76%,rgba(255,196,110,0) 100%);opacity:.8;transition:opacity .25s,transform .25s;z-index:-1}
.rrs-t{display:block;max-width:100%;text-align:center;font:600 clamp(13px,1.25vw,22px)/1.05 'Cormorant Garamond',Georgia,'Times New Roman',serif;letter-spacing:.04em;color:#e9b85c;filter:drop-shadow(0 1px 2px rgba(0,0,0,.6));transition:transform .2s}
@supports ((-webkit-background-clip:text) or (background-clip:text)){.rrs-t{background:linear-gradient(180deg,#f2d99b,#d5b26c);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}}
.rrs-v{position:absolute;top:100%;left:50%;transform:translateX(-50%);margin-top:2px;font:800 11px/1 'Manrope',Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#f2d99b;text-shadow:0 1px 3px #000;opacity:0;transition:opacity .2s;pointer-events:none}
.rrs-b:focus-visible{outline:2px solid #e9b85c;outline-offset:3px}
.rrs-b:focus-visible .rrs-v{opacity:1}
@media(hover:hover){.rrs-b:hover::before{opacity:1;transform:scale(1.1)}.rrs-b:hover .rrs-t{transform:translateY(-2px)}.rrs-b:hover .rrs-v{opacity:1}}
.rrs-steam{position:absolute;left:52.6%;top:41%;width:0;height:0;pointer-events:none;z-index:1}
.rrs-p .rrs-steam{left:47.8%;top:16%}
.rrs-steam i{position:absolute;left:0;top:0;width:58px;height:58px;margin:-29px 0 0 -29px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.55),rgba(255,255,255,0) 70%);filter:blur(6px);opacity:0}
.rrs-p .rrs-steam i{width:40px;height:40px;margin:-20px 0 0 -20px}
.rrs-steam i:nth-child(2){margin-left:-37px}.rrs-steam i:nth-child(3){margin-left:-21px}
.rrs-scrim{position:fixed;inset:0;z-index:10040;background:transparent}
.rrs-card{position:absolute;z-index:10050;width:min(320px,92vw);box-sizing:border-box;padding:22px 22px 20px;border-radius:14px;border:1px solid rgba(213,178,108,.35);background:rgba(36,16,19,.92);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);box-shadow:0 18px 40px rgba(0,0,0,.45);color:#fff8ef;opacity:0;transform:translateY(8px);transition:opacity .22s,transform .22s}
.rrs-card.open{opacity:1;transform:none}
.rrs-card h3{margin:0 34px 0 0;color:#f2d99b;font:600 26px/1.15 'Cormorant Garamond',Georgia,'Times New Roman',serif}
.rrs-card .rrs-cp{margin:8px 0 16px;color:rgba(255,248,239,.85);font:500 15px/1.55 'Manrope',Arial,sans-serif}
html body .rrs-card .rrs-x{position:absolute;top:10px;right:10px;width:34px;height:34px;padding:0;border:1px solid rgba(213,178,108,.45);border-radius:50%;background:none;color:#f2d99b;font:400 22px/1 Arial,sans-serif;cursor:pointer;display:flex;align-items:center;justify-content:center}
html body .rrs-card .rrs-enq{display:inline-flex;align-items:center;justify-content:center;padding:12px 24px;border-radius:999px;font:800 14px/1 'Manrope',Arial,sans-serif;text-decoration:none}
.rrs-card :focus-visible{outline:2px solid #e9b85c;outline-offset:2px}
@media(max-width:899px){
 .rrs{aspect-ratio:941/1672;max-width:560px}
 .rrs-l{display:none}.rrs-p{display:block}
 .rrs-t{font-size:clamp(10px,3vw,15px);letter-spacing:.02em;line-height:1}
 .rrs-v{display:none}
 .rrs-card{position:fixed;left:0;right:0;bottom:0;top:auto;width:auto;border-radius:18px 18px 0 0;padding:24px 22px calc(22px + env(safe-area-inset-bottom,0px));opacity:1;transform:translateY(105%);transition:transform .32s cubic-bezier(.2,.8,.2,1)}
 .rrs-card.open{transform:none}
 .rrs-card h3{margin-right:40px}
 html body .rrs-card .rrs-enq{display:flex;width:100%;box-sizing:border-box}
 .rrs-scrim{background:rgba(10,0,2,.55);opacity:0;transition:opacity .25s}
 .rrs-scrim.open{opacity:1}
}
@media(max-width:599px){.rrs{width:100vw;max-width:none;margin-left:calc(50% - 50vw)}}
@media(prefers-reduced-motion:no-preference){
 .rrs.js .rrs-dim{opacity:.55}
 .rrs.js.on .rrs-dim{opacity:0;animation:rrsDim 1.2s ease-out backwards}
 .rrs.js .rrs-b::before,.rrs.js .rrs-t{opacity:0}
 .rrs.js.on .rrs-b::before{opacity:.8;animation:rrsGlow .6s ease-out var(--d) backwards}
 .rrs.js.on .rrs-b:hover::before{opacity:1}
 .rrs.js.on .rrs-t{opacity:1;animation:rrsRise .4s ease-out var(--d) backwards}
 .rrs.on .rrs-steam i{animation:rrsSteam 4.5s ease-out infinite}
 .rrs.on .rrs-steam i:nth-child(2){animation-delay:1.5s}.rrs.on .rrs-steam i:nth-child(3){animation-delay:3s}
 .rrs.on .rrs-hint{animation:rrsHint 1.1s ease-in-out 2.6s 2 backwards}
}
@media(prefers-reduced-motion:reduce){.rrs-steam{display:none}.rrs-card,.rrs-scrim,.rrs-b::before,.rrs-t{transition:none!important}.rrs-card{transform:none!important}}
@keyframes rrsDim{from{opacity:.55}to{opacity:0}}
@keyframes rrsGlow{from{opacity:0}to{opacity:.8}}
@keyframes rrsRise{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
@keyframes rrsSteam{0%{opacity:0;transform:translateY(0) scale(1)}25%{opacity:.35}100%{opacity:0;transform:translateY(-40px) scale(1.4)}}
@keyframes rrsHint{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}
"""

JS = r"""/* rr-catering-stages: lights on when 30% in view, detail card, Enquire preselects the event in #catering-form */
(function(){var root=document.getElementById('rrs');if(!root)return;
var rmq=matchMedia('(prefers-reduced-motion:reduce)'),wide=matchMedia('(min-width:900px)');
root.classList.add('js');
var sec=document.getElementById('catering-occasions'),card=sec.querySelector('.rrs-card'),scrim=sec.querySelector('.rrs-scrim');
document.body.appendChild(scrim);document.body.appendChild(card);
var D={
 weddings:{t:'Weddings',l:'Wedding-day feasts and receptions, planned around your menu and your date.',o:'Wedding'},
 corporate:{t:'Corporate Events',l:'Office lunches, team meets and company functions, served on time.',o:'Corporate event'},
 royal:{t:'Royal Catering',l:'Our signature dum biryani and royal Andhra menus, for your guests.',o:'Other'},
 celebrations:{t:'Celebrations',l:'Birthdays, anniversaries and family celebrations, the Durbar way.',o:'Private party'},
 outdoor:{t:'Outdoor Events',l:'Garden parties, community events and big get-togethers.',o:'Large gathering'},
 baby:{t:'Baby Showers',l:'Warm, festive menus for baby showers and family get-togethers.',o:'Baby shower'}};
var cur=null,last=null,isOpen=false,timer=0;
function on(){root.classList.add('on')}
if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){if(es[0].isIntersecting){on();io.disconnect()}},{threshold:.3});io.observe(root)}else on();
function place(btn){
 if(!wide.matches){card.style.left=card.style.top='';return}
 var r=btn.getBoundingClientRect(),W=card.offsetWidth||320,H=card.offsetHeight||190;
 var left=(r.left+r.width/2<innerWidth/2)?r.right+16:r.left-W-16;
 left=Math.max(8,Math.min(innerWidth-W-8,left));
 var top=Math.max(8,Math.min(innerHeight-H-8,r.top+r.height/2-H/2));
 card.style.left=(left+scrollX)+'px';card.style.top=(top+scrollY)+'px'}
function show(k,btn){var d=D[k];if(!d)return;cur=k;last=btn;clearTimeout(timer);
 card.querySelector('h3').textContent=d.t;card.querySelector('.rrs-cp').textContent=d.l;
 card.hidden=false;scrim.hidden=false;place(btn);void card.offsetWidth;
 card.classList.add('open');scrim.classList.add('open');isOpen=true;
 card.querySelector('.rrs-x').focus({preventScroll:true})}
function hide(back){if(!isOpen)return;isOpen=false;card.classList.remove('open');scrim.classList.remove('open');
 var done=function(){card.hidden=true;scrim.hidden=true};
 if(rmq.matches)done();else timer=setTimeout(done,330);
 if(back&&last)last.focus({preventScroll:true})}
root.addEventListener('click',function(e){var b=e.target.closest('.rrs-b');if(b)show(b.getAttribute('data-k'),b)});
scrim.addEventListener('click',function(){hide(true)});
card.querySelector('.rrs-x').addEventListener('click',function(){hide(true)});
document.addEventListener('keydown',function(e){if(!isOpen)return;
 if(e.key==='Escape'){e.preventDefault();hide(true)}
 else if(e.key==='Tab'){var f=[card.querySelector('.rrs-x'),card.querySelector('.rrs-enq')],i=f.indexOf(document.activeElement);
  e.preventDefault();f[(i+(e.shiftKey?-1:1)+f.length)%f.length].focus()}});
card.querySelector('.rrs-enq').addEventListener('click',function(e){e.preventDefault();var d=D[cur];hide(false);
 var f=document.getElementById('catering-form'),s=document.getElementById('c-type');
 if(s&&d){for(var i=0;i<s.options.length;i++){if(s.options[i].text===d.o){s.selectedIndex=i;s.dispatchEvent(new Event('input',{bubbles:true}));s.dispatchEvent(new Event('change',{bubbles:true}));break}}}
 if(f)f.scrollIntoView({behavior:rmq.matches?'auto':'smooth',block:'center'});
 setTimeout(function(){if(s)s.focus({preventScroll:true})},rmq.matches?0:600)});
addEventListener('resize',function(){if(isOpen)hide(false)});
})();
"""
BLOCK = '<style id="rr-catering-stages">' + CSS + '</style>\n<script id="rr-catering-stages-js">' + JS + '</script>\n'
pathlib.Path("src/site.html.bakcs").write_text(s, encoding="utf-8")
s2 = s[:i] + HTML + s[j:]
s2 = s2.replace(OPT_OLD, OPT_NEW).replace("</body>", BLOCK + "</body>")
p.write_text(s2, encoding="utf-8")
print("PATCHED: catering stages (backup src/site.html.bakcs)")
