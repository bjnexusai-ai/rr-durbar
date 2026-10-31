#!/usr/bin/env python3
"""Proves the mobile block does not touch desktop: deletes the rules that use the mobile variables and compares computed styles of every element.
1280 and 1440 MUST say 'changed elements 0'. 768 may show only the floating bars (#m61-bar, #m61-toast, .od-mbar): the rule lifts them above the tab bar, which is shown up to 1099px (intended). 360 should be above 0. Needs a server on :8765. Run from repo root. (Do NOT use pixel diff on the home page: the slider moves.)"""
import sys
from playwright.sync_api import sync_playwright
JS = """()=>{const st=document.createElement('style');st.textContent='*,*::before,*::after{transition:none!important;animation:none!important}';document.head.appendChild(st);
const sig=()=>{const o=[];document.querySelectorAll('body *').forEach(e=>{const s=getComputedStyle(e);o.push([s.display,s.position,s.color,s.backgroundColor,s.width,s.height,s.top,s.bottom,s.objectPosition,s.fontSize,s.marginTop,s.opacity].join('|'))});return o};
const a=sig();let n=0;const toks=['--rr-tabbar-h','--rr-photo-h','--rr-crim'];
for(const sh of document.styleSheets){let rules;try{rules=sh.cssRules}catch(e){continue}for(let k=rules.length-1;k>=0;k--){if(toks.some(x=>rules[k].cssText.includes(x))){sh.deleteRule(k);n++}}}
const b=sig();let ch=[];for(let i=0;i<a.length;i++)if(a[i]!==b[i])ch.push([a[i],b[i]]);return {deleted:n,total:a.length,changed:ch.length,sample:ch.slice(0,2)}}"""
bad = 0
with sync_playwright() as p:
    br = p.chromium.launch()
    for path in (sys.argv[1:] or ["/"]):
        for w, h in ((1280, 800), (1440, 900), (768, 1024), (360, 780)):
            pg = br.new_page(viewport={"width": w, "height": h}); pg.goto("http://localhost:8765" + path, wait_until="load"); pg.wait_for_timeout(1500)
            r = pg.evaluate(JS)
            if w >= 1280 and r["changed"]: bad += 1
            print(f"{path} {w}px: deleted {r['deleted']} rules, changed elements {r['changed']} of {r['total']}" + (f" sample {r['sample']}" if r['changed'] and w != 360 else "")); pg.close()
    br.close()
print("RESULT:", "desktop (1280 and 1440) untouched" if not bad else f"{bad} desktop width(s) CHANGED, do not ship")
