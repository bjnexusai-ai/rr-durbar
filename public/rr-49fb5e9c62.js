/* rr-igbox (Step 4A + 4B): floating "Latest from Instagram" box.
   Data: ONE GET <API>/api/whats-new per page, shared with the home What's new section through window.rrWNFetch (cached promise, cloned response).
   Live (instagram.live=true): up to 6 posts, #rroffer posts first, labels OFFER / REEL / NEW, first caption line cleaned, "Code: XXXX" gets a Copy chip.
   Not live yet (no IG_TOKEN): the 4 site reels + a Follow @rr_durbar card. API error: nothing is shown.
   sessionStorage rrIgC=1 keeps it collapsed to the disc for the visit. Phone collapses itself after 10 s.
   4B: a tap opens the What's new pop-up player on EVERY page (home uses RR_WHATSNEW.open, other pages use a copy of the same pop-up built here with the same rr-wn-* classes).
       /catering/: the box shows only posts with #rrcatering in the caption, no fallback reels; no such post = nothing shown. Lifts above the "Plan my event" pill on phones.
   Sets --rrm-b on <html> so the music player sits above the box (the box owns the bottom-left corner). */
(function(){'use strict';
var path=location.pathname.replace(/\/+$/,'')||'/';
if(/^\/(checkout|pickup|track-order|policies|privacy-policy|terms-of-service|refund-cancellation|404)(\/|$)/.test(path))return;
var wnSec=document.getElementById('whats-new'),isHome=!!wnSec,isCat=/^\/catering(\/|$)/.test(path);
var API=((wnSec&&wnSec.getAttribute('data-api'))||'https://rr-durbar-api.ramana-peravali.workers.dev').replace(/\/$/,'');
var IG='https://www.instagram.com/rr_durbar/',COUPON='Show this code at the counter or mention it on WhatsApp';
var FB=[
 {kind:'reel',image:'/assets/0417d3203e.jpg',video:'/assets/c077145f2c.mp4',caption:'Make it right, the delicious way'},
 {kind:'reel',image:'/assets/65bce1ab6b.jpg',video:'/assets/841cd67814.mp4',caption:'Tandoori Chicken at RR Durbar'},
 {kind:'reel',image:'/assets/770e171a29.jpg',video:'/assets/995b413995.mp4',caption:'Raju Gari Kodi Vepudu'},
 {kind:'reel',image:'/assets/3f96fcb7c0.jpg',video:'/assets/6c6e7337d7.mp4',caption:'Ambience that feels royal'},
 {kind:'follow',caption:'Follow @rr_durbar for reels and offers'}];
var mqPhone=matchMedia('(max-width:1050px) and (min-height:500px)'),mqRM=matchMedia('(prefers-reduced-motion:reduce)');
var root=document.documentElement,TICK=100,ROT=6000;
function ss(k,v){try{if(v===undefined)return sessionStorage.getItem(k);sessionStorage.setItem(k,v)}catch(e){return null}}
function mk(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e}
function okHttps(u){return typeof u==='string'&&/^https:\/\//.test(u)}
function phone(){return root.classList.contains('rr-tabs')&&mqPhone.matches}

/* ---- one shared fetch (the home What's new calls this too) ---- */
var shared=null;
window.rrWNFetch=function(api){
  if(!shared){var ac=('AbortController' in window)?new AbortController():null,t=setTimeout(function(){if(ac)ac.abort()},8000);
    shared=fetch((api||API)+'/api/whats-new',{credentials:'omit',signal:ac?ac.signal:undefined}).then(function(r){clearTimeout(t);return r},function(e){clearTimeout(t);throw e})}
  return shared.then(function(r){return r.clone()});
};

/* ---- items ---- */
function cleanLine(c){
  var lines=String(c||'').split(/\r?\n/);
  for(var i=0;i<lines.length;i++){
    var l=lines[i].replace(/#\S+/g,' ').replace(/@\S+/g,' ').replace(/\s+/g,' ').replace(/^[\s\-\u2013\u2014:|.,!]+/,'').trim();
    if(l){if(l.length>70){l=l.slice(0,70);var k=l.lastIndexOf(' ');if(k>40)l=l.slice(0,k);l=l.replace(/[\s,.;:\-]+$/,'')+'\u2026'}return l}
  }
  return '';
}
function findCode(c){
  var m=/(?:code|coupon|use)\s*[:\-]?\s*([A-Z0-9]{4,12})\b/i.exec(String(c||''));if(!m)return '';
  var v=m[1];return (v===v.toUpperCase()||/\d/.test(v))?v.toUpperCase():'';
}
function norm(m){
  if(!m||!okHttps(m.image)||!/^https:\/\/(www\.)?instagram\.com\//.test(m.permalink||''))return null;
  var v=okHttps(m.video)?m.video:null,cap=String(m.caption||'').slice(0,300);
  return {kind:(m.kind==='reel'||v)?'reel':'photo',offer:!!m.offer,cat:/#rrcatering(?![A-Za-z0-9_])/i.test(String(m.caption||'')),caption:cap,image:m.image,video:v,link:m.permalink};
}
function fromApi(j){
  var ig=j&&j.instagram;if(!ig||!ig.live||!Array.isArray(ig.items))return [];
  var all=ig.items.slice(0,30).map(norm).filter(Boolean);
  if(isCat)all=all.filter(function(x){return x.cat});else all=all.slice(0,9);
  var o=all.filter(function(x){return x.offer}),n=all.filter(function(x){return !x.offer});
  return o.concat(n).slice(0,6);
}
function fallback(){return FB.map(function(x){var o={kind:x.kind,offer:false,cat:false,caption:x.caption,image:x.image||null,video:x.video||null,link:IG};return o})}
function label(it){return it.kind==='follow'?'FOLLOW':it.offer?'OFFER':it.kind==='reel'?'\u25B6 REEL':'NEW'}

/* ---- DOM ---- */
var A,card,sl,th,img,lb,cd,cv,cp,tx,ct,pr,disc,badge,xb;
var items=[],idx=0,mode='full',shown=false,elapsed=0,hold=0,tickT=0,autoT=0,swT=0,armed=false,touchT=0,copyT=0;
var ICON='<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r=".6" fill="currentColor"/></svg>';
function build(){
  A=mk('aside','rrig');A.id='rrig';A.setAttribute('aria-label','Latest from Instagram');A.hidden=true;A.setAttribute('data-m','full');
  card=mk('div','rrig-card');sl=mk('div','rrig-sl');
  th=mk('button','rrig-th');th.type='button';img=mk('img');img.alt='';img.width=80;img.height=80;img.decoding='async';img.referrerPolicy='no-referrer';
  th.appendChild(img);th.appendChild(mk('i','rrig-pl'));th.insertAdjacentHTML('beforeend',ICON);
  var bd=mk('div','rrig-bd'),mt=mk('div','rrig-mt');
  lb=mk('span','rrig-lb');cd=mk('span','rrig-cd');cd.hidden=true;cv=mk('span','rrig-cv');cp=mk('button','rrig-cp','Copy');cp.type='button';cd.appendChild(cv);cd.appendChild(cp);
  mt.appendChild(lb);mt.appendChild(cd);
  tx=mk('button','rrig-tx');tx.type='button';ct=mk('div','rrig-ct',COUPON);ct.hidden=true;
  bd.appendChild(mt);bd.appendChild(tx);bd.appendChild(ct);sl.appendChild(th);sl.appendChild(bd);
  xb=mk('button','rrig-x');xb.type='button';xb.setAttribute('aria-label','Minimise Instagram updates');xb.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 5l14 14M19 5L5 19"/></svg>';
  pr=mk('i','rrig-pr');pr.setAttribute('aria-hidden','true');
  card.appendChild(sl);card.appendChild(mk('span','rrig-view','VIEW \u203A'));card.appendChild(xb);card.appendChild(pr);
  disc=mk('button','rrig-disc');disc.type='button';disc.setAttribute('aria-label','Show latest from Instagram');disc.innerHTML=ICON;badge=mk('i','','');disc.appendChild(badge);
  A.appendChild(card);A.appendChild(disc);document.body.appendChild(A);
  th.addEventListener('click',open);tx.addEventListener('click',open);
  cp.addEventListener('click',copy);
  xb.addEventListener('click',function(){setMode('disc',true)});
  disc.addEventListener('click',function(){setMode('full',true);schedAuto()});
  card.addEventListener('mouseenter',function(){hold|=1});card.addEventListener('mouseleave',function(){hold&=~1});
  card.addEventListener('focusin',function(e){try{if(e.target.matches(':focus-visible'))hold|=2}catch(x){hold|=2}});card.addEventListener('focusout',function(){hold&=~2});
  card.addEventListener('touchstart',function(){hold|=4;clearTimeout(touchT)},{passive:true});
  card.addEventListener('touchend',function(){clearTimeout(touchT);touchT=setTimeout(function(){hold&=~4},1500)},{passive:true});
  card.addEventListener('touchcancel',function(){hold&=~4},{passive:true});
}
function render(i){
  var it=items[i];if(!it)return;idx=i;
  var follow=it.kind==='follow',code=follow?'':findCode(it.caption),line=follow?it.caption:(cleanLine(it.caption)||'New on @rr_durbar');
  th.classList.toggle('is-follow',follow);th.classList.toggle('is-photo',!follow&&it.kind!=='reel');
  if(!follow){img.src=it.image}
  lb.textContent=label(it);tx.textContent=line;
  var cap=follow?'Follow @rr_durbar on Instagram':(it.kind==='reel'?'Watch reel: ':'Open post: ')+line;
  th.setAttribute('aria-label',cap);tx.setAttribute('aria-label',cap);
  cd.hidden=!code;ct.hidden=!code;cv.textContent=code;cp.textContent='Copy';cp.setAttribute('aria-label','Copy code '+code);
  A.classList.toggle('has-code',!!code);
  elapsed=0;pr.style.transform='scaleX(0)';
  var nx=items[(i+1)%items.length];if(nx&&nx.image){var p=new Image();p.referrerPolicy='no-referrer';p.src=nx.image}
}
function swap(to){
  clearTimeout(swT);
  if(mqRM.matches||!shown||mode!=='full'){render(to);return}
  sl.classList.add('o');
  swT=setTimeout(function(){render(to);sl.classList.remove('o');sl.classList.add('n');void sl.offsetWidth;sl.classList.remove('n')},180);
}
function open(){
  var it=items[idx];if(!it)return;
  if(it.kind==='follow'){window.open(it.link||IG,'_blank','noopener');return}
  if(isHome&&window.RR_WHATSNEW&&typeof window.RR_WHATSNEW.open==='function'){window.RR_WHATSNEW.open(it,th);return}
  popOpen(it,th);
}
/* ---- pop-up for pages without the home What's new section: same markup and rr-wn-* classes as the home pop-up ---- */
var pm=null,pOpener=null;
function popBuild(){
  var m=mk('div','rr-wn-modal');m.setAttribute('role','dialog');m.setAttribute('aria-modal','true');m.setAttribute('aria-label','Instagram post from @rr_durbar');m.setAttribute('aria-hidden','true');
  var p=mk('div','rr-wn-panel'),x=mk('button','rr-wn-x','\u00D7');x.type='button';x.setAttribute('aria-label','Close');
  var media=mk('div','rr-wn-media'),info=mk('div','rr-wn-info'),cap=mk('p','rr-wn-mcap'),act=mk('div','rr-wn-act');
  var ord=mk('a','rr-wn-btn','Order now');ord.href='/order-now/';
  var ig=mk('a','rr-wn-btn rr-wn-btn2','Watch on Instagram');ig.target='_blank';ig.rel='noopener noreferrer';
  act.appendChild(ord);act.appendChild(ig);info.appendChild(cap);info.appendChild(act);
  p.appendChild(x);p.appendChild(media);p.appendChild(info);m.appendChild(p);document.body.appendChild(m);
  m.addEventListener('click',function(e){if(e.target===m)popClose()});
  x.addEventListener('click',function(){popClose()});ord.addEventListener('click',function(){popClose(true)});
  m.addEventListener('keydown',function(e){
    if(e.key==='Escape'){e.preventDefault();popClose();return}
    if(e.key!=='Tab')return;
    var f=[].filter.call(m.querySelectorAll('button,a[href]'),function(n){return !n.disabled});if(!f.length)return;
    var a=f[0],z=f[f.length-1];
    if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}
  });
  pm={el:m,media:media,cap:cap,ig:ig,x:x};
}
function popOpen(it,from){
  if(!pm)popBuild();
  pOpener=from;pm.media.textContent='';
  if(it.video){
    var v=mk('video');v.src=it.video;if(it.image)v.poster=it.image;v.muted=true;v.defaultMuted=true;v.loop=true;v.playsInline=true;v.setAttribute('playsinline','');v.autoplay=true;v.setAttribute('aria-label',it.caption||'Reel from @rr_durbar');
    var s=mk('button','rr-wn-snd','\uD83D\uDD07');s.type='button';s.setAttribute('aria-label','Turn sound on');s.setAttribute('aria-pressed','false');
    s.addEventListener('click',function(){v.muted=!v.muted;s.textContent=v.muted?'\uD83D\uDD07':'\uD83D\uDD0A';s.setAttribute('aria-label',v.muted?'Turn sound on':'Turn sound off');s.setAttribute('aria-pressed',v.muted?'false':'true')});
    pm.media.appendChild(v);pm.media.appendChild(s);
    var pr2=v.play();if(pr2&&pr2.catch)pr2.catch(function(){});
  }else{var im=mk('img');im.src=it.image;im.alt=it.caption||'Post from @rr_durbar';im.referrerPolicy='no-referrer';pm.media.appendChild(im)}
  var c=String(it.caption||'').replace(/\s*#\S+/g,'').replace(/[ \t]+/g,' ').trim().slice(0,110);
  pm.cap.textContent=c;pm.cap.hidden=!c;pm.ig.href=okHttps(it.link)?it.link:IG;
  root.classList.add('rr-wn-lock');
  pm.el.classList.add('is-open');pm.el.setAttribute('aria-hidden','false');pm.x.focus();
}
function popClose(skipFocus){
  if(!pm||!pm.el.classList.contains('is-open'))return;
  pm.el.classList.remove('is-open');pm.el.setAttribute('aria-hidden','true');
  var v=pm.media.querySelector('video');if(v){v.pause();v.removeAttribute('src');v.load()}
  pm.media.textContent='';root.classList.remove('rr-wn-lock');
  if(skipFocus!==true&&pOpener&&document.contains(pOpener))pOpener.focus();pOpener=null;
}
document.addEventListener('keydown',function(e){if(e.key==='Escape')popClose()});
function copy(){
  var v=cv.textContent;if(!v)return;
  function done(){cp.textContent='Copied \u2713';clearTimeout(copyT);copyT=setTimeout(function(){cp.textContent='Copy'},1800)}
  function old(){try{var t=mk('textarea');t.value=v;t.setAttribute('readonly','');t.style.cssText='position:fixed;left:-9999px;top:0;opacity:0';document.body.appendChild(t);t.select();document.execCommand('copy');document.body.removeChild(t);done()}catch(e){}}
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(v).then(done,old);else old();
}

/* ---- layout: box owns the bottom-left corner, music player goes above it ---- */
function pillOn(){var p=document.getElementById('rrp');return !!p&&p.classList.contains('on')}
function pushVar(){
  if(!shown){root.style.removeProperty('--rrm-b');return}
  var full=mode==='full',v=phone()?(full?174:146):(full?140:80);
  if(isCat&&phone()&&pillOn())v+=64;
  root.style.setProperty('--rrm-b',v+'px');
}
function setMode(m,keep){
  mode=m;A.setAttribute('data-m',m);pr.style.transform='scaleX(0)';elapsed=0;
  if(keep)ss('rrIgC',m==='disc'?'1':'0');
  clearTimeout(autoT);pushVar();
}
function schedAuto(){
  clearTimeout(autoT);if(!phone()||mode!=='full')return;
  autoT=setTimeout(function(){if(mode!=='full')return;if(hold){schedAuto();return}setMode('disc',true)},10000);
}
function show(){
  if(shown||!items.length)return;shown=true;
  badge.textContent=items.length;render(0);
  mode=ss('rrIgC')==='1'?'disc':'full';A.setAttribute('data-m',mode);
  A.hidden=false;A.classList.add('in');pushVar();schedAuto();
  if(items.length>1&&!mqRM.matches)tickT=setInterval(tick,TICK);
}
function tick(){
  if(mode!=='full'||hold||document.hidden||root.classList.contains('rr-wn-lock'))return;
  elapsed+=TICK;pr.style.transform='scaleX('+Math.min(1,elapsed/ROT)+')';
  if(elapsed>=ROT){elapsed=0;swap((idx+1)%items.length)}
}

/* ---- when to appear ---- */
function check(){
  if(armed||!items.length)return;
  if(isHome){var r=wnSec.getBoundingClientRect();if(r.height>0&&r.bottom<innerHeight*.35)armed=true}
  else if((window.pageYOffset||root.scrollTop||0)>innerHeight*.6)armed=true;
  if(armed)show();
}
function ready(list){
  items=list;if(!items.length)return;build();
  if(isHome){addEventListener('scroll',check,{passive:true});check()}
  else{addEventListener('scroll',check,{passive:true});setTimeout(function(){if(!armed){armed=true;show()}},6000);check()}
}
function load(){
  if(load.d)return;load.d=true;
  window.rrWNFetch(API).then(function(r){if(!r.ok)throw new Error('http');return r.json()})
    .then(function(j){var l=fromApi(j);if(isCat){if(l.length)ready(l);return}ready(l.length?l:fallback())})
    .catch(function(){});            /* API error: show nothing */
}
var first=function(){removeEventListener('scroll',first);load()};
addEventListener('scroll',first,{passive:true});
if(document.readyState==='complete')setTimeout(load,2000);else addEventListener('load',function(){setTimeout(load,2000)});
if(isCat&&'MutationObserver' in window){var pw=function(){var p=document.getElementById('rrp');if(!p)return false;new MutationObserver(function(){if(shown)pushVar()}).observe(p,{attributes:true,attributeFilter:['class']});return true};if(!pw())addEventListener('load',pw)}
function relayout(){if(shown){pushVar();if(phone())schedAuto();else clearTimeout(autoT)}}
addEventListener('resize',relayout);if(mqPhone.addEventListener)mqPhone.addEventListener('change',relayout);
window.rrIgBox={state:function(){return {shown:shown,mode:mode,idx:idx,n:items.length,cat:isCat}},load:load};
})();

;
(function(){var L=window.RR_LISTINGS||{};var h=document.querySelector('#m52 .ord');if(!h)return;h.querySelectorAll('a.m52-btn').forEach(function(a){var u=L[a.textContent.trim().toLowerCase()];if(!u||a.getAttribute('href'))return;a.href=u;a.target='_blank';a.rel='noopener noreferrer';a.classList.remove('off');a.removeAttribute('aria-disabled');a.removeAttribute('title')})})();
;
(function(){function fix(){var s=document.getElementById("rr-order-outlet");if(!s)return;Array.prototype.slice.call(s.options).forEach(function(o){if(/patamatalanka/i.test(o.text+" "+o.value))s.removeChild(o)})}fix();var s=document.getElementById("rr-order-outlet");if(s&&window.MutationObserver)new MutationObserver(fix).observe(s,{childList:true});document.addEventListener("DOMContentLoaded",fix);window.addEventListener("load",fix)})();
;
(function(){var S=[[10,0],[8,0],[6,0],[4,0],[4,14],[3,13],[2,12.5],[2,12]];function q(x){return document.querySelector(x)}function fits(){var c=q(".nav-contact"),l=q(".nav-links"),a=q(".nav-actions"),n=q(".nav-inner");if(!c||!l||!a||!n)return true;var lr=l.getBoundingClientRect();if(!lr.width)return true;var cs=getComputedStyle(n),nr=n.getBoundingClientRect(),cr=c.getBoundingClientRect(),ar=a.getBoundingClientRect();return cr.right<=nr.right-parseFloat(cs.paddingRight)+1&&cr.right<=innerWidth-16&&lr.right<=ar.left}function apply(p,f){var L=document.querySelectorAll(".nav-links a");for(var i=0;i<L.length;i++){L[i].style.setProperty("padding-left",p+"px","important");L[i].style.setProperty("padding-right",p+"px","important");if(f)L[i].style.setProperty("font-size",f+"px","important");else L[i].style.removeProperty("font-size")}}function fit(){for(var i=0;i<S.length;i++){apply(S[i][0],S[i][1]);if(fits())return}}var t;function later(){clearTimeout(t);t=setTimeout(fit,60)}fit();window.addEventListener("resize",later);window.addEventListener("load",function(){fit();setTimeout(fit,1500)});if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fit)})();