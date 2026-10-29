import sys
p='src/site.html'; s=open(p,encoding='utf-8').read()
E=[
('CTA row: let the 68px gutter apply (fixed width ran the row under the buttons)',
 'html body #home .rr-hero-order{display:flex!important;flex-wrap:nowrap!important;gap:8px!important;margin:0 68px 12px 14px!important}',
 'html body #home .rr-hero-order{display:flex!important;flex-wrap:nowrap!important;gap:8px!important;width:auto!important;margin:0 68px 12px 14px!important}'),
('ORDER NOW: light solid edge + stronger shadow',
 '.rr-hero-order .cb-go{background:linear-gradient(135deg,#ffd16a,#f68b1d);color:#341008;box-shadow:0 8px 22px rgba(0,0,0,.35)}',
 '.rr-hero-order .cb-go{background:linear-gradient(135deg,#ffd16a,#f68b1d);color:#341008;border:2px solid #fff3cf;box-shadow:0 6px 18px rgba(0,0,0,.55),0 0 0 1px rgba(90,15,24,.6)}'),
('Phone: lighter dark block behind the buttons',
 'background:linear-gradient(to top,rgba(14,3,6,.94) 0,rgba(14,3,6,.82) 48%,rgba(14,3,6,0) 100%)',
 'background:linear-gradient(to top,rgba(14,3,6,.7) 0,rgba(14,3,6,.46) 48%,rgba(14,3,6,0) 100%)'),
('Phone: lighter bottom/top fade over the photo',
 'linear-gradient(0deg,rgba(12,5,6,.78) 0%,rgba(12,5,6,.5) 30%,rgba(12,5,6,.1) 55%,transparent 70%),linear-gradient(180deg,rgba(12,5,6,.45) 0%,transparent 22%)!important',
 'linear-gradient(0deg,rgba(12,5,6,.5) 0%,rgba(12,5,6,.28) 30%,rgba(12,5,6,.05) 55%,transparent 70%),linear-gradient(180deg,rgba(12,5,6,.3) 0%,transparent 22%)!important'),
]
bad=0
for name,old,new in E:
    n=s.count(old); ln=s.count('\n',0,s.find(old))+1 if n else 0
    print(('OK   ' if n==1 else 'STOP '),'found',n,'at L%d'%ln,'-',name)
    bad+= (n!=1)
if bad: print('STOPPED: nothing written'); sys.exit(1)
if '--write' not in sys.argv: print('DRY RUN ok. Add --write to apply.'); sys.exit(0)
for name,old,new in E: s=s.replace(old,new,1)
open(p,'w',encoding='utf-8').write(s); print('WRITTEN')
