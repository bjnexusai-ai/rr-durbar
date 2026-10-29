(function(){try{var d=document.documentElement;d.classList.add('brx-js');var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.style.transitionDelay=(e.target.dataset.d||0)+'ms';e.target.classList.add('brx-in');io.unobserve(e.target)}})},{threshold:.1});function go(){document.querySelectorAll('.brx-card').forEach(function(c,i){c.dataset.d=(i%4)*90;io.observe(c)});document.querySelectorAll('.brx-map').forEach(function(m){io.observe(m)})}if(document.readyState!=='loading')go();else document.addEventListener('DOMContentLoaded',go)}catch(e){document.documentElement.classList.remove('brx-js')}})();
;
window.RR_SIG_IMG={"murgh musallam biryani": "assets/0fd06644a6-w.webp", "murgh mehfil biryani": "assets/27bc7e35ee-w.webp", "naatu naatu wings": "assets/e55672ce2d-w.webp", "durbar supreme chicken": "assets/3cdaef5d34-w.webp", "raju gari kodi vepudu": "assets/5c2cbda940-w.webp", "butta biryani": "assets/d3344b5c39-w.webp", "vankay biryani": "assets/b19fb42376-w.webp", "chicken & paneer tikka": "assets/a8491ca2a2-w.webp", "guntur chilli chicken": "images/menu/guntur-chilli-chicken.webp", "maharaja tawa fish": "images/menu/lemon-heaven-fish.webp", "nalla kaaram paneer vepudu": "images/menu/paneer-tikka.webp", "chicken 555": "images/menu/chicken-555.webp"};
;
window.RR_CAT_IMG={"Special Biryani": "assets/82c620cb57.jpg", "Non-Veg Biryani": "assets/be65d4ea6d.jpg", "Non-Veg Starters": "assets/6451da8ba0.webp", "Veg Starters": "assets/387a04282f.webp"};
;

(function(){
 function run(){
  var sec=document.getElementById('trust'); if(!sec||sec.dataset.tnInit) return; sec.dataset.tnInit='1';
  var els=[].slice.call(sec.querySelectorAll('strong[data-count]'));
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!reduce&&'IntersectionObserver' in window){els.forEach(function(el){el.textContent=+el.dataset.from||0;});}
  function play(){
   els.forEach(function(el,i){
    var to=+el.dataset.count, from=+el.dataset.from||0;
    if(reduce){el.textContent=to;el.classList.add('tn-done');return;}
    var dur=to===1991?900:1100, t0=null; el.textContent=from;
    function step(t){ if(t0===null) t0=t; var k=Math.max(0,Math.min(1,(t-t0)/dur)), e=1-Math.pow(1-k,3);
     el.textContent=Math.round(from+(to-from)*e);
     if(k<1) requestAnimationFrame(step); else {el.textContent=to;el.classList.add('tn-done');}}
    setTimeout(function(){requestAnimationFrame(step)},i*90);
   });
  }
  if(!('IntersectionObserver' in window)){play();return;}
  var io=new IntersectionObserver(function(en){ if(en.some(function(x){return x.isIntersecting})){io.disconnect();play();} },{threshold:.35});
  io.observe(sec);
 }
 if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run); else run();
})();

;

(function(){function go(){var S=window.RR_SIG_IMG||{};var m={hero:'murgh mehfil biryani',t1:'murgh musallam biryani',t2:'naatu naatu wings',t3:'chicken & paneer tikka',t4:'durbar supreme chicken'};
document.querySelectorAll('[data-cx-img]').forEach(function(im){if(im.hasAttribute('data-cx-local'))return;var k=m[im.getAttribute('data-cx-img')];if(k&&S[k])im.src=S[k];});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go);else go();window.addEventListener('load',go);
var ph,tick=false,pv=true,pio;function par(){tick=false;ph=ph||document.querySelector('#catering .cx-hero-photo');if(!ph)return;if(!pio&&window.IntersectionObserver){pio=new IntersectionObserver(function(es){pv=es[es.length-1].isIntersecting;if(pv)par()},{rootMargin:'300px 0px'});pio.observe(ph)}if(!pv)return;var y=window.scrollY||0;ph.style.setProperty('--cxpy',Math.min(y*0.18,60)+'px');}
window.addEventListener('scroll',function(){if(!tick){tick=true;requestAnimationFrame(par);}},{passive:true});})();
