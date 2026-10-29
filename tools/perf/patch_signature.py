#!/usr/bin/env python3
"""Step E on SOURCE src/site.html: no 01/02/03, home signature cards show only the + button (44px, focus, active). Dry run unless --write."""
import sys
from pathlib import Path
WRITE = '--write' in sys.argv
p = Path('src/site.html'); s = p.read_text(encoding='utf-8')
def rep(old, new):
    global s
    assert s.count(old) == 1, f'not found exactly once: {old[:70]}'
    s = s.replace(old, new)
rep("b.innerHTML=PLUS+' Add';", "b.innerHTML=PLUS+(label==='plus'?'':' Add');")
rep("f.appendChild(qaddBtn(d));copy.", "f.appendChild(qaddBtn(d,'plus'));copy.")
CSS = ("\nhtml body #bestsellers .rr-food-card.rr-signature-card .rr-media::before{content:none!important}"
       "\nhtml body #bestsellers .rr-sig-foot .rr-qadd{width:44px;height:44px;min-width:44px;padding:0;border-radius:50%;display:inline-flex;align-items:center;justify-content:center}"
       "\nhtml body #bestsellers .rr-sig-foot .rr-qadd:focus-visible{outline:3px solid #f0c86e;outline-offset:3px}"
       "\nhtml body #bestsellers .rr-sig-foot .rr-qadd:active{transform:scale(.97)}\n")
rep('<style id="rr-v65-signature">', '<style id="rr-v65-signature">' + CSS)
if WRITE: p.write_text(s, encoding='utf-8')
print('OK, 3 edits' + ('' if WRITE else ' (dry run, nothing written)'))
