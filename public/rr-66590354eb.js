/* rr-catering-1b: Plan my event buttons scroll to the form; sticky pill (only on /catering/) */
(function(){var rrs=document.getElementById('rrs'),form=document.getElementById('catering-form');if(!rrs||!form)return;
var rmq=matchMedia('(prefers-reduced-motion:reduce)');
function go(e){e.preventDefault();form.scrollIntoView({behavior:rmq.matches?'auto':'smooth',block:'center'})}
var plan=document.querySelector('#catering .rrh-plan');if(plan)plan.addEventListener('click',go);
var pill=document.createElement('a');pill.className='rrp';pill.id='rrp';pill.href='#catering-form';pill.textContent='Plan my event';
pill.addEventListener('click',go);document.body.appendChild(pill);
var tick=false;
function upd(){tick=false;var vh=innerHeight,r=rrs.getBoundingClientRect(),f=form.getBoundingClientRect();
 var past=r.bottom<vh-8,inForm=f.top<vh&&f.bottom>0;/* hide the pill as soon as the form's top edge enters the viewport */
 pill.classList.toggle('on',rrs.offsetWidth>0&&past&&!inForm)}
function req(){if(!tick){tick=true;requestAnimationFrame(upd)}}
addEventListener('scroll',req,{passive:true});addEventListener('resize',req);addEventListener('load',req);upd();
})();

;
/* rr-catering-2: Lighting the Durbar. Sparks run from the handi along the traced wires (wires.json), the wires light behind them, each stage switches on.
 Laptop: one sequence when the picture is 30% in view. Phone: row by row as each row is 40% in view. Then an idle current, and a hover/tap spotlight.
 Reduced motion: fully lit at once, no sparks, no idle current, no particles. Loops use opacity only and pause offscreen / on a hidden tab. */
(function(){var root=document.getElementById('rrs');if(!root)return;
var NS='http://www.w3.org/2000/svg',rmq=matchMedia('(prefers-reduced-motion:reduce)'),wide=matchMedia('(min-width:900px)');
var dim=root.querySelector('.rrs-dim'),art=root.querySelector('.rrs-art');if(!dim||!art)return;
var KEYS={L:['royal','weddings','corporate','celebrations','outdoor'],P:['royal','weddings','corporate','celebrations','outdoor','baby']};
/* stage areas, % of the picture: centre x, centre y, radius x, radius y (the dark overlay opens a hole there) */
var Z={L:{royal:[53,52,24,40],weddings:[25,33,23,34],corporate:[81,33,21,32],celebrations:[17,78,21,26],outdoor:[84,79,18,26]},
 P:{royal:[50,16,46,23],weddings:[24,41,30,15],corporate:[76,41,30,15],celebrations:[24,64,30,15],outdoor:[76,64,30,15],baby:[50,87,44,16]}};
var HANDI={L:[53.2,53,40],P:[49.8,18.5,62]};
var ROWS=[[0,1],[2,3],[4,5]],ROWBAND=[['royal','corporate'],['weddings','outdoor'],['celebrations','baby']];
var gen=0,done=false,started=false,spotOn=false,inView=true,fx={},idleT=0,nextRow=0,rowBusy=false,rafTick=false;
function lay(){return wide.matches?'L':'P'}
function el(n,a,p){var e=document.createElementNS(NS,n);for(var k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e}
function div(c,p){var d=document.createElement('div');d.className=c;(p||root).appendChild(d);return d}
function ease(t){return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2}
function tween(ms,fn,end,g){var t0=performance.now();(function f(n){if(g!==gen)return;var p=Math.min(1,(n-t0)/ms);fn(p);if(p<1)requestAnimationFrame(f);else if(end)end()})(t0)}
function later(ms,fn,g){setTimeout(function(){if(g===gen)fn()},ms)}
var dim2=div('rrs-dim2',art),hg=div('rrs-hg');
/* ---- dark overlay with one soft hole per stage; --hN is how open each hole is (0..1) ---- */
function setMask(l){var ks=KEYS[l],m=ks.map(function(k,i){var z=Z[l][k];return 'radial-gradient(ellipse '+z[2]+'% '+z[3]+'% at '+z[0]+'% '+z[1]+'%,transparent calc(var(--h'+i+')*70%),#000 calc(var(--h'+i+')*100%))'}).join(',');
 ks.forEach(function(k,i){dim.style.setProperty('--h'+i,0)});dim.style.webkitMaskImage=dim.style.maskImage=m;dim.style.webkitMaskComposite='source-in';dim.style.maskComposite='intersect'}
function hole(l,k,ms,g){var i=KEYS[l].indexOf(k);if(i<0)return;tween(ms,function(p){dim.style.setProperty('--h'+i,ease(p).toFixed(3))},null,g)}
function allHoles(l){KEYS[l].forEach(function(k,i){dim.style.setProperty('--h'+i,1)})}
/* ---- the lit copy of each wire + the spark, built on demand for the layout on screen ---- */
function build(l){if(fx[l])return fx[l];var base=root.querySelector(l==='L'?'svg.rrs-wl:not(.rrs-fx)':'svg.rrs-wp:not(.rrs-fx)');if(!base)return null;
 var vb=base.getAttribute('viewBox'),VW=+vb.split(' ')[2],svg=el('svg',{'class':'rrs-fx '+(l==='L'?'rrs-wl':'rrs-wp'),viewBox:vb,'aria-hidden':'true',focusable:'false'});
 var df=el('defs',{},svg),gr=el('radialGradient',{id:'rrsSg'+l},df);el('stop',{offset:'0','stop-color':'#fff6d6','stop-opacity':'.95'},gr);el('stop',{offset:'.35','stop-color':'#ffc45a','stop-opacity':'.55'},gr);el('stop',{offset:'1','stop-color':'#ff9a2e','stop-opacity':'0'},gr);
 var ws=[].map.call(base.querySelectorAll('path'),function(p){var d=p.getAttribute('d'),w={to:p.getAttribute('data-to'),from:p.getAttribute('data-from')},g=el('g',{'class':'rrs-lw'},svg);
  el('path',{d:d,'class':'rrs-lg'},g);w.c=el('path',{d:d,'class':'rrs-lc'},g);w.g=g;w.a=g.firstChild;
  w.m=w.c;w.Lb=0;var br=p.getAttribute('data-bridge');if(br){w.bm=el('path',{d:br,fill:'none',stroke:'none'},svg)}
  var sp=el('g',{'class':'rrs-sp',style:'opacity:0'},svg);w.t=[3,2,1].map(function(){return el('circle',{fill:'#ffd27a'},sp)});w.h=el('circle',{fill:'url(#rrsSg'+l+')'},sp);w.k=el('circle',{fill:'#fff6d6'},sp);w.s=sp;return w});
 root.appendChild(svg);
 var o={svg:svg,vw:VW,ws:ws,len:function(){ws.forEach(function(w){w.L=w.c.getTotalLength();w.Lb=w.bm?w.bm.getTotalLength():0;[w.a,w.c].forEach(function(q){q.style.strokeDasharray=w.L+' '+(w.L+2);q.style.strokeDashoffset=w.L})})}};
 fx[l]=o;return o}
function scale(o){var r=o.svg.getBoundingClientRect();return r.width/o.vw||1}
function pt(w,d){if(w.bm&&d<w.Lb)return w.bm.getPointAtLength(d);return w.c.getPointAtLength(Math.max(0,Math.min(w.L,d-w.Lb)))}
function widths(o,s){o.ws.forEach(function(w){w.a.style.strokeWidth=(9/s)+'px';w.c.style.strokeWidth=(3/s)+'px'})}
/* a spark leaves the handi, the wire lights behind it */
function fly(o,w,ms,end,g){var s=scale(o),tot=w.Lb+w.L;w.g.style.transition='none';w.g.style.opacity=1;w.s.style.opacity=1;
 w.h.setAttribute('r',20/s);w.k.setAttribute('r',5/s);w.t.forEach(function(c,i){c.setAttribute('r',(4-i)/s)});
 tween(ms,function(p){var d=ease(p)*tot,h=pt(w,d);w.h.setAttribute('cx',h.x);w.h.setAttribute('cy',h.y);w.k.setAttribute('cx',h.x);w.k.setAttribute('cy',h.y);
  w.t.forEach(function(c,i){var q=pt(w,Math.max(0,d-(3-i)*11/s));c.setAttribute('cx',q.x);c.setAttribute('cy',q.y);c.setAttribute('opacity',(.2+.15*i).toFixed(2))});
  w.s.style.opacity=w.Lb&&d<w.Lb?(d/w.Lb).toFixed(2):(p>.92?((1-p)/.08).toFixed(2):1);
  var lit=Math.max(0,Math.min(w.L,d-w.Lb));w.a.style.strokeDashoffset=w.c.style.strokeDashoffset=w.L-lit},function(){w.s.style.opacity=0;w.a.style.strokeDashoffset=w.c.style.strokeDashoffset=0;end&&end()},g)}
function burst(l,k,g){var b=root.querySelector((l==='L'?'.rrs-l':'.rrs-p')+' .rrs-b[data-k="'+k+'"]'),t=b&&b.querySelector('.rrs-t');if(!b||!t||!b.animate)return;
 /* the burst starts just above the label and flies upward, so it never crosses the label text */
 var rr=root.getBoundingClientRect(),tr=t.getBoundingClientRect(),x=(tr.left+tr.width/2-rr.left)/rr.width*100,y=(tr.top-rr.top-10)/rr.height*100,box=div('rrs-pb');box.style.left=x+'%';box.style.top=y+'%';
 for(var i=0;i<6;i++){var a=document.createElement('i'),ang=-3.14159*(.12+.76*i/5),r=24+(i%2)*12;box.appendChild(a);
  a.animate([{opacity:1,transform:'translate(0,0) scale(1)'},{opacity:0,transform:'translate('+(Math.cos(ang)*r*1.4).toFixed(1)+'px,'+(Math.sin(ang)*r).toFixed(1)+'px) scale(.3)'}],{duration:800,easing:'ease-out',fill:'forwards'})}
 setTimeout(function(){box.remove()},900)}
function lightBtn(k){[].forEach.call(root.querySelectorAll('.rrs-b[data-k="'+k+'"]'),function(b){b.classList.add('lit')})}
function arrive(l,k,g){var b=root.querySelector((l==='L'?'.rrs-l':'.rrs-p')+' .rrs-b[data-k="'+k+'"]');if(b&&b.classList.contains('lit'))return;lightBtn(k);hole(l,k,600,g);burst(l,k,g)}
function handiOn(l,g){var h=HANDI[l],r=root.getBoundingClientRect();hg.style.left=(h[0]-h[2]/2)+'%';hg.style.width=h[2]+'%';hg.style.height=(h[2]*r.width/Math.max(1,r.height))+'%';hg.style.top=(h[1]-h[2]*r.width/Math.max(1,r.height)/2)+'%';
 hg.classList.remove('off');void hg.offsetWidth;hg.classList.add('on');root.classList.add('steam');hole(l,'royal',700,g);lightBtn('royal')}
function finish(l,g){root.classList.add('fin');hg.classList.remove('on');hg.classList.add('off');var o=fx[l];
 if(o)o.ws.forEach(function(w){w.g.style.transition='opacity 1.2s';w.g.style.opacity=0});
 later(1300,function(){dim.style.display='none';allHoles(l);if(fx[l])fx[l].ready=1;root.classList.add('on','rrs-done');done=true;idle()},g)}
function end(l,g){later(700,function(){finish(l,g)},g)}
function lightAll(l){root.classList.add('steam');[].forEach.call(root.querySelectorAll('.rrs-b'),function(b){b.classList.add('lit')});dim.style.display='none';root.classList.add('fin','on','rrs-done');done=true;started=true}
function instant(){gen++;var l=lay();lightAll(l);hg.classList.remove('on');if(!rmq.matches)idle()}
/* laptop: one go. phone: row by row */
function startLaptop(g){var l='L',o=build(l);if(!o){return instant()}o.len();widths(o,scale(o));handiOn(l,g);var n=o.ws.length,last=0;
 o.ws.forEach(function(w,i){var t0=600+i*250;later(t0,function(){fly(o,w,900,function(){arrive(l,w.to,g);if(++last===n)end(l,g)},g)},g)})}
function rowBand(r){var rr=root.getBoundingClientRect(),a=Z.P[ROWBAND[r][0]],b=Z.P[ROWBAND[r][1]];var top=rr.top+rr.height*(a[1]-a[3])/100,bot=rr.top+rr.height*(b[1]+b[3])/100;return [top,bot]}
function rowSeen(r){var bd=rowBand(r),h=bd[1]-bd[0],vis=Math.min(bd[1],innerHeight)-Math.max(bd[0],0);return h>0&&vis/h>=.4}
function startRow(r,g){var l='P',o=fx.P,ws=ROWS[r].map(function(i){return o.ws[i]}),n=ws.length,c=0;rowBusy=true;nextRow=r+1;
 ws.forEach(function(w,i){later(i*250,function(){fly(o,w,900,function(){arrive(l,w.to,g);if(++c===n){rowBusy=false;if(r===2)end(l,g);else later(300,check,g)}},g)},g)})}
function check(){rafTick=false;if(done||!started||rowBusy||nextRow>2||lay()!=='P')return;if(rowSeen(nextRow))startRow(nextRow,gen)}
function onScroll(){if(!rafTick&&started&&!done){rafTick=true;requestAnimationFrame(check)}}
function startPhone(g){var l='P',o=build(l);if(!o){return instant()}o.len();widths(o,scale(o));handiOn(l,g);later(600,function(){startRow(0,g)},g)}
function begin(){if(started)return;started=true;var g=++gen,l=lay();if(rmq.matches||!('IntersectionObserver' in window)){return instant()}
 setMask(l);if(l==='L')startLaptop(g);else startPhone(g)}
/* ---- first paint: dark and waiting. Reduced motion: lit at once ---- */
if(rmq.matches){lightAll(lay())}
else{root.classList.add('seq');setMask(lay());
 if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){if(es[0].isIntersecting){io.disconnect();begin()}},{threshold:.3});io.observe(root)}else begin();
 addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',onScroll);
 wide.addEventListener&&wide.addEventListener('change',function(){if(started&&!done)instant()})}
/* ---- idle current: every 6-8 s one random wire carries a faint pulse (peak opacity .5). Pauses offscreen, on a hidden tab, while a card is open ---- */
function idle(){clearTimeout(idleT);if(rmq.matches||!done)return;idleT=setTimeout(function(){
  var o=fx[lay()]||build(lay());if(o&&inView&&!document.hidden&&!spotOn&&!document.querySelector('.rrs-card.open')&&o.ws.length&&o.ws[0].g.animate){if(!o.ready){o.len();widths(o,scale(o));o.ws.forEach(function(w){w.a.style.strokeDashoffset=w.c.style.strokeDashoffset=0});o.ready=1}
   var w=o.ws[Math.floor(Math.random()*o.ws.length)];w.g.style.transition='none';w.g.animate([{opacity:0},{opacity:.5,offset:.45},{opacity:0}],{duration:1600,easing:'ease-in-out'})}
  idle()},6000+Math.random()*2000)}
if('IntersectionObserver' in window){new IntersectionObserver(function(es){inView=es[0].isIntersecting}).observe(root)}
/* ---- spotlight: the stage's wire glows from the handi, the other stages dim .15, then the card opens (the stages script calls rrsSpot) ---- */
function chain(ws,k){var out=[];if(k==='royal'){return ws.slice()}var seen={};(function up(t){ws.forEach(function(w){if(w.to===t&&!seen[ws.indexOf(w)]){seen[ws.indexOf(w)]=1;out.push(w);if(w.from)up(w.from)}})})(k);return out}
window.rrsSpot=function(k){var l=lay(),o=fx[l]||build(l);if(!o)return;
 if(!done&&!rmq.matches){return}
 if(!o.ready){o.len();widths(o,scale(o));o.ws.forEach(function(w){w.a.style.strokeDashoffset=w.c.style.strokeDashoffset=0});o.ready=1}
 var on=k?chain(o.ws,k):[];spotOn=!!k;
 o.ws.forEach(function(w){var lit=on.indexOf(w)>=0;w.g.getAnimations&&w.g.getAnimations().forEach(function(a){a.cancel()});w.g.style.transition='opacity .25s';w.g.style.opacity=lit?.95:0});
 if(k&&Z[l][k]&&k!=='royal'){var z=Z[l][k];dim2.style.setProperty('--sx',z[0]+'%');dim2.style.setProperty('--sy',z[1]+'%');dim2.style.setProperty('--sw',z[2]+'%');dim2.style.setProperty('--sh',z[3]+'%');dim2.classList.add('on')}
 else dim2.classList.remove('on')};
window.rrsSpotLag=function(){return(!wide.matches&&!rmq.matches&&done)?380:0};
root.addEventListener('mouseover',function(e){var b=e.target.closest&&e.target.closest('.rrs-b');if(b)window.rrsSpot(b.getAttribute('data-k'))});
root.addEventListener('mouseout',function(e){var b=e.target.closest&&e.target.closest('.rrs-b');if(!b)return;var n=e.relatedTarget&&e.relatedTarget.closest&&e.relatedTarget.closest('.rrs-b');if(!n&&!document.querySelector('.rrs-card.open'))window.rrsSpot(null)});
root.addEventListener('focusin',function(e){var b=e.target.closest&&e.target.closest('.rrs-b');if(b&&b.matches(':focus-visible'))window.rrsSpot(b.getAttribute('data-k'))});
root.addEventListener('focusout',function(e){var b=e.target.closest&&e.target.closest('.rrs-b');if(b&&!document.querySelector('.rrs-card.open')&&!root.querySelector('.rrs-b:hover'))window.rrsSpot(null)});
})();
