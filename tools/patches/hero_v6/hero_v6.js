/* rr-hero-v6-js START: home hero effects (sweep, steam, heading rise, pause offscreen, floating buttons). Delete with the rr-hero-v6 style block to revert. */
(function(){'use strict';
var hero=document.getElementById('home');if(!hero)return;
var de=document.documentElement,RM=matchMedia('(prefers-reduced-motion:reduce)');
var slides=[].slice.call(hero.querySelectorAll('.slide')),sweep=hero.querySelector('.rr-sweep');
/* heading rise: wrap each line of every heading once */
slides.forEach(function(s){var h=s.querySelector('.hero-title');if(!h||h.querySelector('.rr-ln'))return;
 h.innerHTML=h.innerHTML.split(/<br\s*\/?>/i).map(function(l){return '<span class="rr-ln"><span class="rr-li">'+l+'</span></span>'}).join('')});
function go(el,cls){if(!el)return;el.classList.remove(cls);void el.offsetWidth;el.classList.add(cls)}
function cur(){for(var i=0;i<slides.length;i++)if(slides[i].classList.contains('active'))return i;return 0}
var last=-1;
function sync(first){var i=cur(),s=slides[i];if(!s)return;
 hero.setAttribute('data-rr-scene',i);hero.setAttribute('data-steam',s.getAttribute('data-rr-steam')==='1'?'1':'0');
 var fx=parseFloat(getComputedStyle(s).getPropertyValue('--fx')),fy=parseFloat(getComputedStyle(s).getPropertyValue('--fy'));
 if(!isNaN(fx))hero.style.setProperty('--sx-d',fx+'%');if(!isNaN(fy))hero.style.setProperty('--sy-d',Math.max(10,fy-16)+'%');
 if(i!==last){if(!first&&!RM.matches)go(sweep,'go');last=i}}
sync(true);
var mo=new MutationObserver(function(){if(!de.classList.contains('rr-doors-wait'))sync(false);else{sync(true)}});
slides.forEach(function(s){mo.observe(s,{attributes:true,attributeFilter:['class']})});
/* first sweep after the doors (or at once when there are none) */
function firstSweep(){if(!RM.matches)go(sweep,'go')}
if(de.classList.contains('rr-doors-wait')){
 if(window.rrHeroPause)window.rrHeroPause();
 document.addEventListener('rr-doors-open',function(){
  /* restart slide 1 from the start: full slide time, heading rise, push-in and sweep all run now */
  if(window.rrHeroResume)window.rrHeroResume();
  slides.forEach(function(s){s.classList.remove('active','leaving')});void hero.offsetWidth;
  if(window.goSlide)window.goSlide(0);else if(slides[0])slides[0].classList.add('active');
  last=-1;sync(true);firstSweep()},{once:true});
}else firstSweep();
/* pause loops and autoplay when the hero is offscreen or the tab is hidden */
var vis=true,tab=true,pausedEngine=false;
function apply(){var on=vis&&tab;hero.classList.toggle('rr-fx-paused',!on);
 if(!on&&!pausedEngine&&!de.classList.contains('rr-doors-wait')){pausedEngine=true;if(window.rrHeroPause)window.rrHeroPause()}
 else if(on&&pausedEngine){pausedEngine=false;if(window.rrHeroResume)window.rrHeroResume()}}
document.addEventListener('visibilitychange',function(){tab=!document.hidden;apply()});
if('IntersectionObserver' in window){
 new IntersectionObserver(function(es){var r=es[0].intersectionRatio;vis=r>0.05;de.classList.toggle('rr-hero-vis',r>=0.35);apply()},{threshold:[0,0.05,0.35,0.6,1]}).observe(hero);
}else de.classList.add('rr-hero-vis');
})();
/* rr-hero-v6-js END */
