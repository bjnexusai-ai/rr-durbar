#!/usr/bin/env python3
"""Google Analytics 4 (stream 'RR Durbar Website', rrdurbar.com, G-1E6TC2HSXV). Dry run unless --write. Any unexpected count = STOP.
 - gtag loads after window load, ONLY on rrdurbar.com / www.rrdurbar.com (or with ?ga=on for a test), so workers.dev and preview never pollute the data.
 - Privacy policy updated to say Google Analytics is used (it said 'if we add analytics')."""
import sys, pathlib
WRITE = '--write' in sys.argv
site = pathlib.Path('src/site.html'); s = site.read_text(encoding='utf-8')
bad = []; log = []
def rep(a, b, label, expect=1):
    global s
    n = s.count(a)
    if n != expect: bad.append(f'{label}: found {n}, expected {expect}'); return
    s = s.replace(a, b); log.append(f'{label}: ok')
if 'rr-ga4' in s: bad.append('already applied (rr-ga4 present)')
ID = 'G-1E6TC2HSXV'
JS = ('<script id="rr-ga4">/* Google Analytics 4. Loads after the page has loaded, only on the live domain (or with ?ga=on for testing). */\n'
 "(function(){var H=location.hostname;if(H!=='rrdurbar.com'&&H!=='www.rrdurbar.com'&&!/[?&]ga=on/.test(location.search))return;\n"
 "window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('js',new Date());gtag('config','" + ID + "');\n"
 "function load(){var s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id=" + ID + "';document.head.appendChild(s)}\n"
 "if(document.readyState==='complete')load();else addEventListener('load',load,{once:true})})();\n</script>\n")
A = '<script id="rr-show-prices-flag">'
rep(A, JS + A, 'ga4 script')
rep('<li>Service providers who help us run the website and send messages, and a payment provider if online payment is introduced.</li>',
    '<li>Service providers who help us run the website and send messages, and a payment provider if online payment is introduced.</li><li>Google Analytics (Google), which helps us understand how the website is used.</li>', 'pp-5 share')
rep('If we add analytics, it will be used only to understand how the site is used and improve it.',
    'We use Google Analytics to understand how the site is used (pages viewed, device and browser, and approximate location) so we can improve it. It sets cookies in your browser. You can block them in your browser settings or with Google&rsquo;s opt-out add-on.', 'pp-6 cookies')
rep('or send us an enquiry.</p><div class="pol-meta"><span>Last updated: 12 October 2026</span>',
    'or send us an enquiry.</p><div class="pol-meta"><span>Last updated: 1 November 2026</span>', 'privacy date')
rep('<p>What we collect, why, and the rights you have over your data.</p><small>Updated 12 October 2026</small>',
    '<p>What we collect, why, and the rights you have over your data.</p><small>Updated 1 November 2026</small>', 'hub card date')
print('\n'.join(log))
if bad: print('STOP, nothing written:\n  ' + '\n  '.join(bad)); sys.exit(1)
if WRITE: site.write_text(s, encoding='utf-8'); print('PATCHED src/site.html')
else: print('dry run OK (add --write)')
