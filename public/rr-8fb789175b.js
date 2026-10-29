
(function(){
var reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
/* badge: fade out before it reaches the fixed header instead of being cut in half */
var nav=document.querySelector('.top-nav'),tk=false;
function badge(){tk=false;var b=document.querySelector('.cx-badge');if(!b||!nav)return;var nb=nav.getBoundingClientRect().bottom,r=b.getBoundingClientRect();
 var k=Math.max(0,Math.min(1,(r.top-nb+40)/40));b.style.setProperty('opacity',k,'important');b.style.pointerEvents=k<.2?'none':''}
addEventListener('scroll',function(){if(!tk){tk=true;requestAnimationFrame(badge)}},{passive:true});addEventListener('resize',badge);addEventListener('load',badge);
})();
