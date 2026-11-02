
/* What's new at RR Durbar (home, under the hero). Row 1: CMS announcements. Row 2: @rr_durbar stream. Data: GET <API>/api/whats-new. Delete this script + #whats-new to revert. */
(function(){'use strict';
var sec=document.getElementById('whats-new');if(!sec)return;
var API=(sec.getAttribute('data-api')||'').replace(/\/$/,'');
var annRow=sec.querySelector('.rr-wn-ann'),stream=sec.querySelector('.rr-wn-stream'),track=sec.querySelector('.rr-wn-track'),
    pauseBtn=sec.querySelector('.rr-wn-pause'),liveEl=sec.querySelector('.rr-wn-live');
var mqReduce=window.matchMedia('(prefers-reduced-motion:reduce)');
var IG_URL='https://www.instagram.com/rr_durbar/',ORDER='?page=order-now#ordering';
var items=[],lastW=0,loaded=false,modal=null,opener=null;
function mk(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e}
function okHttps(u){return typeof u==='string'&&/^https:\/\//.test(u)}
function okLink(u){return typeof u==='string'&&/^(https:\/\/|\/(?!\/)|\?page=)/.test(u)}
function pic(src,alt){var i=mk('img');i.src=src;i.alt=alt||'';i.loading='lazy';i.decoding='async';i.width=720;i.height=900;i.referrerPolicy='no-referrer';return i}

/* ---------- row 1: announcements ---------- */
function endLabel(s){var d=new Date(s);if(isNaN(d))return '';try{return 'Until '+d.toLocaleDateString('en-IN',{day:'numeric',month:'short',timeZone:'Asia/Kolkata'})}catch(e){return ''}}
function annCard(a,k){
  var c=mk('article','rr-wn-ac is-pre');c.style.setProperty('--d',(k*0.18)+'s');
  var inn=mk('div',a.img2?'rr-wn-inn is-poster':'rr-wn-inn'),ph=mk('div','rr-wn-ph');
  ph.appendChild(pic(a.img,a.alt));ph.appendChild(mk('span','rr-wn-offer','OFFER'));ph.appendChild(mk('i','rr-wn-veil'));inn.appendChild(ph);
  if(a.img2){var p2=mk('div','rr-wn-ph rr-wn-ph2');p2.appendChild(pic(a.img2,a.alt2||a.alt));p2.appendChild(mk('i','rr-wn-veil'));inn.appendChild(p2)}
  else{
    var bd=mk('div','rr-wn-bd');bd.appendChild(mk('p','rr-wn-line',a.line));
    var e=endLabel(a.endsAt);if(e)bd.appendChild(mk('p','rr-wn-until',e));
    var b=mk('a','rr-wn-btn','Order now');b.href=a.link;if(/^https:/.test(a.link)){b.target='_blank';b.rel='noopener noreferrer'}
    bd.appendChild(b);inn.appendChild(bd);
  }
  c.appendChild(inn);return c;
}
function showAnn(list){
  var ok=(Array.isArray(list)?list:[]).filter(function(a){return a&&okHttps(a.img)&&((a.line&&String(a.line).trim())?!okHttps(a.img2):okHttps(a.img2))&&okLink(a.link||'/order-now/')}).slice(0,2);
  annRow.textContent='';
  if(!ok.length){annRow.hidden=true;return}
  ok.forEach(function(a,k){a.link=a.link||'/order-now/';annRow.appendChild(annCard(a,k))});
  annRow.setAttribute('data-n',String(ok.length));annRow.hidden=false;
  var cards=[].slice.call(annRow.children),go=function(){cards.forEach(function(c){c.classList.add('is-in')});setTimeout(function(){cards.forEach(function(c){c.classList.remove('is-pre','is-in')})},2200)};
  if(mqReduce.matches||!('IntersectionObserver' in window)){go();return}
  var io=new IntersectionObserver(function(es){if(es.some(function(e){return e.isIntersecting})){io.disconnect();go()}},{threshold:.15});io.observe(annRow);
}

/* ---------- row 2: the stream ---------- */
function cardEl(it){
  var c=mk('div','rr-wn-card');
  if(it.kind==='follow'){
    var f=mk('a','rr-wn-follow');f.href=IG_URL;f.target='_blank';f.rel='noopener noreferrer';
    f.appendChild(mk('span','rr-wn-fl1','Follow'));f.appendChild(mk('strong','rr-wn-fl2','@rr_durbar'));f.appendChild(mk('span','rr-wn-fl3','Reels, offers and more'));
    c.appendChild(f);return c;
  }
  var b=mk('button','rr-wn-reel');b.type='button';
  b.setAttribute('aria-label',(it.kind==='reel'?'Open reel: ':'Open post: ')+(it.caption||'from @rr_durbar'));
  var i=mk('img');i.src=it.image;i.alt='';i.loading='lazy';i.decoding='async';i.width=270;i.height=480;i.referrerPolicy='no-referrer';b.appendChild(i);
  if(it.offer)b.appendChild(mk('span','rr-wn-badge','OFFER'));
  if(it.kind==='reel')b.appendChild(mk('span','rr-wn-play','\u25B6'));
  if(it.caption)b.appendChild(mk('span','rr-wn-cap',it.caption));
  b.addEventListener('click',function(){openModal(it,b)});
  c.appendChild(b);return c;
}
function clone(c){c.classList.add('is-clone');c.setAttribute('aria-hidden','true');[].forEach.call(c.querySelectorAll('button,a'),function(x){x.tabIndex=-1});return c}
function layout(){
  var w=stream.clientWidth;if(!w||!items.length)return;
  lastW=w;track.textContent='';
  items.forEach(function(it,k){var c=cardEl(it);c.style.setProperty('--i',k);track.appendChild(c)});
  if(mqReduce.matches)return;                        /* reduced motion: a normal swipe row, no copies */
  var first=track.firstElementChild,cw=first.offsetWidth+(parseFloat(getComputedStyle(first).marginRight)||0)||200;
  var reps=Math.max(1,Math.ceil(w*1.1/(cw*items.length))),seq=[],r;
  for(r=0;r<reps;r++)items.forEach(function(it){seq.push(it)});
  seq.forEach(function(it,k){if(k>=items.length){var c=clone(cardEl(it));c.style.setProperty('--i',k);track.appendChild(c)}});
  seq.forEach(function(it,k){var c=clone(cardEl(it));c.style.setProperty('--i',k);track.appendChild(c)});   /* same wave phase as its twin, so the loop restart has no jump */
}
function toItem(m){
  if(!m||!okHttps(m.image)||!/^https:\/\/(www\.)?instagram\.com\//.test(m.permalink||''))return null;
  return {kind:m.kind==='reel'?'reel':'photo',offer:!!m.offer,caption:String(m.caption||'').slice(0,110),image:m.image,video:okHttps(m.video)?m.video:null,link:m.permalink};
}
function setLive(on){
  liveEl.classList.toggle('is-live',on);
  liveEl.querySelector('.rr-wn-livetx').textContent=on?'Live from Instagram \u00B7 updated hourly':'Our latest reels';
}
function readStatic(){
  return [].map.call(track.querySelectorAll('.rr-wn-card'),function(c){
    var k=c.getAttribute('data-kind');if(k==='follow')return {kind:'follow'};
    return {kind:'reel',offer:false,caption:c.getAttribute('data-caption')||'',image:c.getAttribute('data-image'),video:c.getAttribute('data-video'),link:c.getAttribute('data-link')||IG_URL};
  }).filter(function(x){return x.kind==='follow'||x.image});
}
/* pause: the visible button (user), an open reel (held). Hover and off-screen are handled in CSS and by the site's motion-a script. */
pauseBtn.addEventListener('click',function(){
  var p=!stream.classList.contains('is-paused');stream.classList.toggle('is-paused',p);
  pauseBtn.setAttribute('aria-pressed',p?'true':'false');
  pauseBtn.querySelector('.rr-wn-pt').textContent=p?'Play stream':'Pause stream';
  pauseBtn.querySelector('.rr-wn-pi').textContent=p?'\u25B6':'\u275A\u275A';
});

/* touch: the stream stands still while a finger is on it (so a tap never lands on a moving card) and for 1.8 s after */
var touchTm=0;
stream.addEventListener('touchstart',function(){clearTimeout(touchTm);stream.classList.add('is-touch')},{passive:true});
['touchend','touchcancel'].forEach(function(n){stream.addEventListener(n,function(){clearTimeout(touchTm);touchTm=setTimeout(function(){stream.classList.remove('is-touch')},1800)},{passive:true})});

/* ---------- pop-up ---------- */
function buildModal(){
  var m=mk('div','rr-wn-modal');m.setAttribute('role','dialog');m.setAttribute('aria-modal','true');m.setAttribute('aria-label','Instagram post from @rr_durbar');m.setAttribute('aria-hidden','true');
  var p=mk('div','rr-wn-panel'),x=mk('button','rr-wn-x','\u00D7');x.type='button';x.setAttribute('aria-label','Close');
  var media=mk('div','rr-wn-media'),info=mk('div','rr-wn-info'),cap=mk('p','rr-wn-mcap'),act=mk('div','rr-wn-act');
  var ord=mk('a','rr-wn-btn','Order now');ord.href=ORDER;
  var ig=mk('a','rr-wn-btn rr-wn-btn2','Watch on Instagram');ig.target='_blank';ig.rel='noopener noreferrer';
  act.appendChild(ord);act.appendChild(ig);info.appendChild(cap);info.appendChild(act);
  p.appendChild(x);p.appendChild(media);p.appendChild(info);m.appendChild(p);document.body.appendChild(m);
  m.addEventListener('click',function(e){if(e.target===m)closeModal()});
  x.addEventListener('click',closeModal);ord.addEventListener('click',function(){closeModal(true)});
  m.addEventListener('keydown',function(e){
    if(e.key==='Escape'){e.preventDefault();closeModal();return}
    if(e.key!=='Tab')return;
    var f=[].filter.call(m.querySelectorAll('button,a[href]'),function(n){return !n.disabled});if(!f.length)return;
    var a=f[0],z=f[f.length-1];
    if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}
  });
  modal={el:m,media:media,cap:cap,ig:ig,x:x};
}
function openModal(it,from){
  if(!modal)buildModal();
  opener=from;modal.media.textContent='';
  if(it.video){
    var v=mk('video');v.src=it.video;if(it.image)v.poster=it.image;v.muted=true;v.defaultMuted=true;v.loop=true;v.playsInline=true;v.setAttribute('playsinline','');v.autoplay=true;v.setAttribute('aria-label',it.caption||'Reel from @rr_durbar');
    var s=mk('button','rr-wn-snd','\uD83D\uDD07');s.type='button';s.setAttribute('aria-label','Turn sound on');s.setAttribute('aria-pressed','false');
    s.addEventListener('click',function(){v.muted=!v.muted;s.textContent=v.muted?'\uD83D\uDD07':'\uD83D\uDD0A';s.setAttribute('aria-label',v.muted?'Turn sound on':'Turn sound off');s.setAttribute('aria-pressed',v.muted?'false':'true')});
    modal.media.appendChild(v);modal.media.appendChild(s);
    var pr=v.play();if(pr&&pr.catch)pr.catch(function(){});
  }else{var im=mk('img');im.src=it.image;im.alt=it.caption||'Post from @rr_durbar';im.referrerPolicy='no-referrer';modal.media.appendChild(im)}
  modal.cap.textContent=it.caption||'';modal.cap.hidden=!it.caption;modal.ig.href=okHttps(it.link)?it.link:IG_URL;
  stream.classList.add('is-held');document.documentElement.classList.add('rr-wn-lock');
  modal.el.classList.add('is-open');modal.el.setAttribute('aria-hidden','false');modal.x.focus();
}
function closeModal(skipFocus){
  if(!modal||!modal.el.classList.contains('is-open'))return;
  modal.el.classList.remove('is-open');modal.el.setAttribute('aria-hidden','true');
  var v=modal.media.querySelector('video');if(v){v.pause();v.removeAttribute('src');v.load()}
  modal.media.textContent='';stream.classList.remove('is-held');document.documentElement.classList.remove('rr-wn-lock');
  if(skipFocus!==true&&opener&&document.contains(opener))opener.focus();opener=null;
}

/* ---------- start ---------- */
function load(){
  if(loaded||!API)return;loaded=true;
  var ac=('AbortController' in window)?new AbortController():null,t=setTimeout(function(){if(ac)ac.abort()},8000);
  fetch(API+'/api/whats-new',{credentials:'omit',signal:ac?ac.signal:undefined})
    .then(function(r){if(!r.ok)throw new Error('http');return r.json()})
    .then(function(j){
      clearTimeout(t);showAnn(j&&j.announcements);
      var ig=j&&j.instagram,list=ig&&ig.live&&Array.isArray(ig.items)?ig.items.slice(0,9).map(toItem).filter(Boolean):[];
      if(list.length){items=list;setLive(true);layout()}      /* otherwise the 4 own reels + Follow card stay */
    })
    .catch(function(){clearTimeout(t)});
}
items=readStatic();
if('ResizeObserver' in window){var tm=0;new ResizeObserver(function(){clearTimeout(tm);tm=setTimeout(function(){if(!lastW||Math.abs(stream.clientWidth-lastW)>40)layout()},150)}).observe(stream)}
else{addEventListener('load',layout);addEventListener('resize',function(){layout()})}
if(mqReduce.addEventListener)mqReduce.addEventListener('change',function(){layout()});
document.addEventListener('keydown',function(e){if(e.key==='Escape')closeModal()});
if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){if(es.some(function(e){return e.isIntersecting})){io.disconnect();load()}},{rootMargin:'400px 0px'});io.observe(sec)}else load();
window.RR_WHATSNEW={layout:layout,load:load,count:function(){return track.querySelectorAll('.rr-wn-card:not(.is-clone)').length}};
})();

;
/* rr-motion-a: pause never-ending loops while their section is off the screen. Delete this script to revert. */
(function(){'use strict';
if(!('IntersectionObserver' in window)||!document.getAnimations||!Element.prototype.getAnimations)return;
var parked=new Map(),seen=new Map(),total=0;
function pinned(el,sec){for(var e=el;e&&e!==sec;e=e.parentElement){var p=getComputedStyle(e).position;if(p==='fixed'||p==='sticky')return true}return false}
function park(sec){var list=parked.get(sec)||[];
 sec.getAnimations({subtree:true}).forEach(function(a){try{
  var t=a.effect&&a.effect.getTiming&&a.effect.getTiming();
  if(!t||t.iterations!==Infinity||a.playState!=='running')return;
  var el=a.effect.target;if(!el||pinned(el,sec))return;
  a.pause();list.push(a)}catch(e){}});
 parked.set(sec,list)}
function wake(sec){var l=parked.get(sec);if(!l)return;parked.delete(sec);
 l.forEach(function(a){try{if(a.playState==='paused')a.play()}catch(e){}})}
var io=new IntersectionObserver(function(es){es.forEach(function(e){seen.set(e.target,e.isIntersecting);if(e.isIntersecting)wake(e.target);else park(e.target)})},{rootMargin:'200px 0px'});
function rescan(){seen.forEach(function(on,sec){if(!on)park(sec)})}
function start(){[].forEach.call(document.querySelectorAll('section[id],footer'),function(s){io.observe(s)});
 /* loops that start late (menus and cards built by script) get caught on these passes */
 addEventListener('load',function(){setTimeout(rescan,300);setTimeout(rescan,3000)});setTimeout(rescan,1500)}
window.RR_OFFSCREEN={parkedCount:function(){var n=0;parked.forEach(function(l){l.forEach(function(a){if(a.playState==='paused')n++})});return n}};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();