#!/usr/bin/env python3
"""Step L (3 Nov): loyalty = simple 5% cashback as Coins, no tiers. Dry run unless --write.
Patches src/site.html, public/checkout/index.html, cms/seed/seed.ndjson. Every anchor must match exactly as expected, else STOP (nothing written).
Idempotent: 2nd run says 'already done'. Backups: <file>.bak-L (do not commit them).
 1 tier section (Silver/Gold/Royal Durbar, pts) -> Earn / Redeem / How it adds up cards (home + /loyalty/ share this one section)
 2 pill/sub/eyebrow/terms/meta -> 5% cashback as Coins
 3 CSS: gold arc in the green card removed; new block rr-L-loyalty; piggy art never cropped (meet)
 4 checkout words: points -> Coins (API untouched)"""
import sys, pathlib, shutil
WRITE = '--write' in sys.argv
SITE, CHK, SEED = [pathlib.Path(x) for x in ('src/site.html', 'public/checkout/index.html', 'cms/seed/seed.ndjson')]
if 'id="rr-L-loyalty"' in SITE.read_text(encoding='utf-8'): print('already done'); sys.exit(0)
bad, log = [], []
def load(p): return p.read_text(encoding='utf-8')
s, c, d = load(SITE), load(CHK), load(SEED)
def rep(txt, a, b, label, expect=1):
    n = txt.count(a)
    if n != expect: bad.append(f'{label}: found {n}, expected {expect}'); return txt
    log.append(f'{label}: ok'); return txt.replace(a, b)
def cut(txt, start, end, new, label, incl_end=False):
    if txt.count(start) != 1 or txt.count(end) < 1: bad.append(f'{label}: start/end not found once'); return txt
    i = txt.find(start); j = txt.find(end, i)
    if j < 0: bad.append(f'{label}: end before start'); return txt
    if incl_end: j += len(end)
    log.append(f'{label}: ok'); return txt[:i] + new + txt[j:]

COIN = '<svg class="lc-medal" viewBox="-20 -20 40 40" aria-hidden="true"><use href="#lc-coin"/></svg>'
CARDS = ('<div class="lc-grid">\n'
'<article class="lc-card lc-silver lc-r">\n' + COIN + '\n<h3>Earn</h3><p class="lc-tag">5% back on every bill</p>\n'
'<ul><li><b>5%</b><span>of your bill subtotal comes back as Coins</span></li><li><b>200<small>Coins</small></b><span>is the most you can earn on one purchase</span></li></ul>\n</article>\n'
'<article class="lc-card lc-gold lc-r">\n' + COIN + '\n<h3>Redeem</h3><p class="lc-tag">Spend your Coins like cash</p>\n'
'<ul><li><b>&#8377;1</b><span>1 Coin is worth &#8377;1</span></li><li><b>&#8377;150</b><span>minimum purchase to redeem</span></li><li><b>50%</b><span>of a bill can be paid with Coins</span></li></ul>\n</article>\n'
'<article class="lc-card lc-royal lc-r">\n' + COIN + '\n<div class="lc-rt"><h3>How it adds up</h3><p class="lc-tag">A simple example</p></div>\n'
'<ul><li><b>&#8377;1,000</b><span>your bill subtotal</span></li><li><b>50<small>Coins</small></b><span>5% back, added to your account</span></li><li><b>&#8377;50</b><span>off on your next bill of &#8377;150 or more</span></li></ul>\n</article>\n')
TERMS = ('<div class="lc-tc" id="lc-tc" hidden><ul>'
'<li>Coins are added when you share your registered phone number at billing, on dine-in and takeaway orders.</li>'
'<li>You earn 5% of the bill subtotal (before taxes and charges) as Coins, up to 200 Coins per purchase. 1 Coin = &#8377;1.</li>'
'<li>Coins can be redeemed on a minimum purchase of &#8377;150. Up to 50% of a bill can be paid with Coins.</li>'
'<li>Coins are used in store only and cannot be exchanged for cash. Two offers cannot be clubbed.</li>'
'<li>RR Durbar may update the programme or its rewards with notice on this website.</li></ul></div>')
CSS = '''<style id="rr-L-loyalty">/* ===== Step L (3 Nov): loyalty = 5% cashback as Coins. No tiers. Nothing decorative sits over card text. ===== */
html body #loyalty .lc-royal::after,html body #loyalty .lc-card::before{content:none!important;display:none!important}
html body #loyalty .lc-royal{background:linear-gradient(135deg,#1f5a3a,#123a24)!important;border-color:#C58A2A}
html body #loyalty .lc-card,html body #loyalty .lc-card>*{position:relative}
html body #loyalty .lc-card .lc-medal{width:clamp(46px,5vw,64px);height:auto}
html body #loyalty .lc-card li b{white-space:nowrap}
html body #loyalty .lc-card li span{min-width:0;overflow-wrap:break-word}
html body #loyalty .lc-pill{font-size:clamp(15px,1.25vw,19px)}
@media(min-width:1100px){
html body #loyalty .lc-card ul{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(0,1fr);gap:16px}
html body #loyalty .lc-card li{flex-direction:column;align-items:flex-start;gap:4px;padding-top:10px!important}
html body #loyalty .lc-card li b{border-right:0;padding-right:0;min-width:0}
}
html body #loyalty .lc-art{background:#2a0d10}
html body #loyalty .lc-art svg{width:100%;height:100%;display:block}
@media(max-width:900px){html body #loyalty .lc-art{aspect-ratio:auto;height:clamp(360px,106vw,440px)}}
@media(max-width:600px){html body #loyalty .lc-card ul{display:block}html body #loyalty .lc-card li{border-top:1px solid rgba(74,8,16,.16)}html body #loyalty .lc-royal li{border-top-color:rgba(231,184,92,.4)}}
</style>
'''
a = 'src/site.html'
s = rep(s, '#loyalty .lc-royal::after{content:"";position:absolute;right:-6%;bottom:-40%;width:50%;height:120%;border-radius:50%;border:2px solid rgba(231,184,92,.4);pointer-events:none}\n', '', 'arc rule removed')
s = rep(s, '<p class="lc-eye"><span>RR Durbar Royal Club</span></p>', '<p class="lc-eye"><span>RR Durbar Rewards</span></p>', 'eyebrow')
s = rep(s, '</svg>&#8377;1 Spent = 1 Point</p>', '</svg>5% cashback as Coins &middot; 1 Coin = &#8377;1</p>', 'pill')
s = rep(s, '<p class="lc-sub">Dine in or take away, share your phone number at billing and your points are added. Collect points, earn your badge.</p>', '<p class="lc-sub">Dine in or take away, share your phone number at billing and 5% of your bill comes back to you as Coins.</p>', 'sub')
s = cut(s, '<div class="lc-grid">\n<article class="lc-card lc-silver lc-r">', '<figure class="lc-art lc-r"', CARDS, 'cards')
s = cut(s, '<g id="lc-medal-s">', '</defs></svg>\n<div class="lc-in">', '', 'medal defs removed')
s = cut(s, '<div class="lc-tc" id="lc-tc" hidden><ul>', '</ul></div></div>\n</div>\n</section>', TERMS, 'terms')
s = rep(s, 'V460H0z" fill="#3a0a10" opacity=".55"/>', 'V460H0z" fill="#3a0a10" opacity=".55"/><rect x="-900" y="460" width="2200" height="1000" fill="#3a0a10" opacity=".55"/>', 'art ground fills past the edge')
s = rep(s, '<linearGradient id="lc-bg" x1="0" y1="0" x2="0" y2="1">', '<linearGradient id="lc-bg" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="600">', 'art gradient')
s = rep(s, '<rect width="400" height="600" fill="url(#lc-bg)"/>', '<rect x="-900" y="-900" width="2200" height="2400" fill="url(#lc-bg)"/>', 'art backdrop')
s = rep(s, '<svg viewBox="0 0 400 600" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Illustration of a maroon and gold piggy bank', '<svg viewBox="0 0 400 600" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Illustration of a maroon and gold piggy bank', 'art never cropped')
OLDDESC = 'Join the RR Durbar Royal Club. Earn points on every order at our Vijayawada outlets and redeem them on your next visit.'
NEWDESC = 'Join RR Durbar Rewards. Earn 5% cashback as Coins on every bill at our Vijayawada outlets and redeem them on your next visit.'
s = rep(s, OLDDESC, NEWDESC, 'meta description')
s = rep(s, '<script id="rr-v41-loyalty-js">', CSS + '<script id="rr-v41-loyalty-js">', 'new style block')
d = rep(d, OLDDESC, NEWDESC, 'seed description')
# checkout words only (API / earn numbers untouched)
for x, y, lab in [
 ('Earn points on every order.', 'Earn Coins on every order.', 'chk earn line'),
 ('<span>Points balance</span>', '<span>Coins balance</span>', 'chk balance'),
 ("+'+q.earn+' points</b></div>", "+'+q.earn+' Coins</b></div>", 'chk +N'),
 ("<p>You would earn <b>'+q.earn+' points</b> with this order.</p>", "<p>You would earn <b>'+q.earn+' Coins</b> with this order.</p>", 'chk would earn'),
 ('Join RR Durbar rewards to collect them. Points are added', 'Join RR Durbar rewards to collect them. Coins are added', 'chk added'),
 ('Join to earn points</button>', 'Join to earn Coins</button>', 'chk join'),
 ('<span>Points</span><b class="ok">+', '<span>Coins</span><b class="ok">+', 'chk done row'),
 ('points will not be shown for this order.', 'Coins will not be shown for this order.', 'chk unavailable')]:
    c = rep(c, x, y, lab)
if bad:
    print('STOP, nothing written:'); [print(' ', b) for b in bad]; sys.exit(1)
print('\n'.join(log))
if not WRITE: print('dry run ok (add --write)'); sys.exit(0)
for p, t in ((SITE, s), (CHK, c), (SEED, d)):
    shutil.copy(p, str(p) + '.bak-L'); p.write_text(t, encoding='utf-8')
print('written. Now run the rebuild steps in APPLY.md')
