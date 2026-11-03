/* rr-catering-1b: Plan my event buttons scroll to the form; sticky pill (only on /catering/) */
(function(){var rrs=document.getElementById('rrs'),form=document.getElementById('catering-form');if(!rrs||!form)return;
var rmq=matchMedia('(prefers-reduced-motion:reduce)');
function go(e){e.preventDefault();form.scrollIntoView({behavior:rmq.matches?'auto':'smooth',block:'center'})}
var plan=document.querySelector('#catering .rrh-plan');if(plan)plan.addEventListener('click',go);
var pill=document.createElement('a');pill.className='rrp';pill.id='rrp';pill.href='#catering-form';pill.textContent='Plan my event';
pill.addEventListener('click',go);document.body.appendChild(pill);
var tick=false;
function upd(){tick=false;var vh=innerHeight,r=rrs.getBoundingClientRect(),f=form.getBoundingClientRect();
 var past=r.bottom<vh-8,vis=Math.min(f.bottom,vh)-Math.max(f.top,0),inForm=vis>=Math.min(f.height*.35,vh*.35);
 pill.classList.toggle('on',past&&!inForm)}
function req(){if(!tick){tick=true;requestAnimationFrame(upd)}}
addEventListener('scroll',req,{passive:true});addEventListener('resize',req);addEventListener('load',req);upd();
})();
