/* rr-music (Step 3): "Royal ambience" travels with the visitor.
   localStorage (always in try/catch): rrMusic = on|off, rrMusicT = seconds into the track (saved every 2 s and on pagehide),
   rrMusicP = 1 when the visitor paused it with the mini player (so the next page shows it paused, not playing).
   If the browser refuses play() on a new page, the player says "Tap to resume" and the first tap anywhere resumes it (taps on the player's own x are ignored there). */
(function(){
var au=document.getElementById('royalAudio');
if(!au||/^\/checkout(\/|$)/.test(location.pathname))return;
var VOL=.72,K='rrMusic',KT='rrMusicT',KP='rrMusicP';
function g(k){try{return localStorage.getItem(k)}catch(e){return null}}
function s(k,v){try{localStorage.setItem(k,v)}catch(e){}}
function d(k){try{localStorage.removeItem(k)}catch(e){}}
var rm=matchMedia('(prefers-reduced-motion:reduce)');
var S={on:false,paused:false,wait:false},el,P,X,L,TP,toast,toastT=0,fadeT=0,saveT=0,tapOn=false,busy=false,hideT=0,inT=0;
au.loop=true;
function vol(v){try{au.volume=v}catch(e){}}
function fade(to,ms,cb){clearInterval(fadeT);var from=au.volume,t0=Date.now();
 if(ms<=0||from===to){vol(to);if(cb)cb();return}
 fadeT=setInterval(function(){var k=Math.min(1,(Date.now()-t0)/ms);vol(from+(to-from)*k);if(k>=1){clearInterval(fadeT);if(cb)cb()}},40)}
function heroUI(on){try{if(window.rrHeroMusicUI)window.rrHeroMusicUI(on)}catch(e){}}
function saveTime(){if(S.on&&isFinite(au.currentTime)&&au.currentTime>0)s(KT,String(Math.round(au.currentTime*10)/10))}
function armSave(){if(!saveT)saveT=setInterval(function(){if(!au.paused)saveTime()},2000)}
function stopSave(){clearInterval(saveT);saveT=0}
function seek(){var t=parseFloat(g(KT));if(!(t>1)||au.currentTime>=.5)return;
 try{au.currentTime=t}catch(e){}
 if(au.readyState<1)au.addEventListener('loadedmetadata',function(){if(au.currentTime<.5&&isFinite(au.duration)&&au.duration>0){try{au.currentTime=t%au.duration}catch(e){}}},{once:true})}
function build(){if(el)return;
 el=document.createElement('div');el.className='rrm';el.id='rrm';el.hidden=true;el.setAttribute('role','group');el.setAttribute('aria-label','Royal ambience music');
 el.innerHTML='<span class="rrm-eq" aria-hidden="true"><i></i><i></i><i></i></span><span class="rrm-lbl">Royal ambience</span>'
 +'<button type="button" class="rrm-p" aria-label="Pause music"><svg class="ic-pause" viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg><svg class="ic-play" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.2v13.6a1 1 0 0 0 1.5.86l11-6.8a1 1 0 0 0 0-1.72l-11-6.8A1 1 0 0 0 8 5.2z"/></svg></button>'
 +'<button type="button" class="rrm-x" aria-label="Turn music off"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>'
 +'<span class="rrm-tip" role="status"></span>';
 P=el.querySelector('.rrm-p');X=el.querySelector('.rrm-x');L=el.querySelector('.rrm-lbl');TP=el.querySelector('.rrm-tip');
 P.addEventListener('click',toggle);X.addEventListener('click',function(){off()});
 document.body.appendChild(el);
 var hero=document.querySelector('.hero');
 /* on the home page the hero has its own music pill: hide this one while the hero is in view */
 if(hero&&'IntersectionObserver' in window)new IntersectionObserver(function(es){el.classList.toggle('rrm-ho',es[0].intersectionRatio>=.35)},{threshold:[0,.35,.6]}).observe(hero)}
function render(){if(!el)return;
 var w=S.on&&S.wait&&!S.paused,pl=S.on&&!S.paused&&!S.wait;
 el.classList.toggle('is-play',pl);el.classList.toggle('is-pause',S.on&&S.paused);el.classList.toggle('is-wait',w);
 P.setAttribute('aria-label',pl?'Pause music':(w?'Tap to resume music':'Play music'));
 L.textContent=w?'Tap to resume':'Royal ambience';TP.textContent=w?'Tap to resume':'';
 heroUI(pl);var mt=document.getElementById('musicText');if(w&&mt)mt.textContent='Tap to resume'}
function show(anim){build();clearTimeout(hideT);el.classList.remove('rrm-out');el.hidden=false;
 if(anim&&!rm.matches){el.classList.add('rrm-in');clearTimeout(inT);inT=setTimeout(function(){el.classList.remove('rrm-in')},450)}}
function hide(){if(!el)return;el.classList.add('rrm-out');clearTimeout(hideT);hideT=setTimeout(function(){if(!S.on){el.hidden=true;el.classList.remove('rrm-out')}},rm.matches?0:320)}
function showToast(t){if(!toast){toast=document.createElement('div');toast.className='rrm-toast';toast.setAttribute('role','status');document.body.appendChild(toast)}
 toast.textContent=t;void toast.offsetWidth;toast.classList.add('on');clearTimeout(toastT);toastT=setTimeout(function(){toast.classList.remove('on')},1900)}
/* play from the saved time, fading 0 -> .72 over 1.2 s; rejects if the browser refuses */
function play(){seek();vol(0);var p;try{p=au.play()}catch(e){p=Promise.reject(e)}
 return Promise.resolve(p).then(function(){S.wait=false;fade(VOL,1200);armSave();render()},function(err){vol(VOL);throw err})}
function blocked(err){return S.on&&!S.paused&&err&&err.name!=='AbortError'}
function onTap(e){if(!S.on||!S.wait||busy)return;if(el&&el.contains(e.target))return;busy=true;
 play().then(disarm,function(){}).then(function(){busy=false})}
var EV=['pointerup','touchend','click','keydown'];
function arm(){if(tapOn)return;tapOn=true;EV.forEach(function(n){document.addEventListener(n,onTap,true)})}
function disarm(){if(!tapOn)return;tapOn=false;EV.forEach(function(n){document.removeEventListener(n,onTap,true)})}
function auto(){au.preload='auto';play().catch(function(err){if(!blocked(err))return;S.wait=true;render();arm()})}
function toggle(){if(!S.on)return;
 if(S.wait&&!S.paused){play().then(disarm,function(){});return}
 if(S.paused){S.paused=false;d(KP);S.wait=false;render();play().catch(function(err){if(!blocked(err))return;S.wait=true;render();arm()});return}
 S.paused=true;s(KP,'1');saveTime();render();fade(0,200,function(){au.pause();vol(VOL)})}
/* called by the home hero's own music button (a real tap) */
function start(){var was=S.on;S.on=true;S.paused=false;S.wait=false;s(K,'on');d(KP);
 if(!was){d(KT);try{au.currentTime=0}catch(e){}}
 show(!was);render();
 return play().catch(function(err){S.on=false;S.wait=false;s(K,'off');d(KT);hide();heroUI(false);throw err})}
function off(quiet){var was=S.on;S.on=false;S.paused=false;S.wait=false;s(K,'off');d(KT);d(KP);disarm();stopSave();
 fade(0,400,function(){try{au.pause()}catch(e){}vol(VOL)});
 hide();heroUI(false);if(was&&!quiet)showToast('Music off')}
function init(){
 if(g(K)!=='on'){if(S.on){S.on=false;S.paused=false;S.wait=false;disarm();stopSave();fade(0,400,function(){try{au.pause()}catch(e){}vol(VOL)});hide();heroUI(false)}return}
 S.on=true;S.paused=g(KP)==='1';S.wait=false;show(false);render();
 if(S.paused){if(!au.paused)au.pause();return}
 if(au.paused)auto();else{armSave();render()}}
function bye(){saveTime()}
addEventListener('pagehide',bye);
document.addEventListener('visibilitychange',function(){if(document.hidden)bye()});
addEventListener('pageshow',function(e){if(e.persisted)init()});
addEventListener('storage',function(e){if(e.key===K&&e.newValue==='off')init()});
window.rrMusic={start:start,off:off,state:function(){return{on:S.on,paused:S.paused,wait:S.wait}}};
init();
})();

;
(function(){var L=window.RR_LISTINGS||{};var h=document.querySelector('#m52 .ord');if(!h)return;h.querySelectorAll('a.m52-btn').forEach(function(a){var u=L[a.textContent.trim().toLowerCase()];if(!u||a.getAttribute('href'))return;a.href=u;a.target='_blank';a.rel='noopener noreferrer';a.classList.remove('off');a.removeAttribute('aria-disabled');a.removeAttribute('title')})})();
;
(function(){function fix(){var s=document.getElementById("rr-order-outlet");if(!s)return;Array.prototype.slice.call(s.options).forEach(function(o){if(/patamatalanka/i.test(o.text+" "+o.value))s.removeChild(o)})}fix();var s=document.getElementById("rr-order-outlet");if(s&&window.MutationObserver)new MutationObserver(fix).observe(s,{childList:true});document.addEventListener("DOMContentLoaded",fix);window.addEventListener("load",fix)})();
;
(function(){var S=[[10,0],[8,0],[6,0],[4,0],[4,14],[3,13],[2,12.5],[2,12]];function q(x){return document.querySelector(x)}function fits(){var c=q(".nav-contact"),l=q(".nav-links"),a=q(".nav-actions"),n=q(".nav-inner");if(!c||!l||!a||!n)return true;var lr=l.getBoundingClientRect();if(!lr.width)return true;var cs=getComputedStyle(n),nr=n.getBoundingClientRect(),cr=c.getBoundingClientRect(),ar=a.getBoundingClientRect();return cr.right<=nr.right-parseFloat(cs.paddingRight)+1&&cr.right<=innerWidth-16&&lr.right<=ar.left}function apply(p,f){var L=document.querySelectorAll(".nav-links a");for(var i=0;i<L.length;i++){L[i].style.setProperty("padding-left",p+"px","important");L[i].style.setProperty("padding-right",p+"px","important");if(f)L[i].style.setProperty("font-size",f+"px","important");else L[i].style.removeProperty("font-size")}}function fit(){for(var i=0;i<S.length;i++){apply(S[i][0],S[i][1]);if(fits())return}}var t;function later(){clearTimeout(t);t=setTimeout(fit,60)}fit();window.addEventListener("resize",later);window.addEventListener("load",function(){fit();setTimeout(fit,1500)});if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fit)})();