/* rr-doors-js: plays the Durbar doors once per visit; a tap skips them. Off with reduced motion. */
(function(){var d=document.getElementById('rr-doors');if(!d)return;var de=document.documentElement,skip=false;
try{skip=!!sessionStorage.getItem('rrDoorsSeen')}catch(e){}
try{if(matchMedia('(prefers-reduced-motion:reduce)').matches)skip=true}catch(e){}
if(skip){d.remove();return}
try{sessionStorage.setItem('rrDoorsSeen','1')}catch(e){}
de.classList.add('rr-doors-wait');
var done=false;function open(){if(done)return;done=true;de.classList.remove('rr-doors-wait');document.dispatchEvent(new Event('rr-doors-open'))}
function go(){d.classList.add('rr-go');setTimeout(open,1500);setTimeout(function(){if(d.parentNode)d.remove()},2600)}
/* the timeline starts when the page is ready, so slow loads never open the doors before the hero script is listening */
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go);else go();
d.addEventListener('click',function(){d.classList.add('rr-skip');open();setTimeout(function(){if(d.parentNode)d.remove()},650)});
})();
