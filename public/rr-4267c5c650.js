
(function(){
 var secs=document.querySelectorAll('.pol2');if(!secs.length)return;
 [].forEach.call(document.querySelectorAll('[data-pol-print]'),function(b){b.addEventListener('click',function(){window.print()})});
 var mq=window.matchMedia('(max-width:900px)');
 function fold(){[].forEach.call(document.querySelectorAll('.pol-toc details'),function(d){d.open=!mq.matches})}
 fold();(mq.addEventListener?mq.addEventListener('change',fold):mq.addListener(fold));
 [].forEach.call(secs,function(sec){
  var links=[].slice.call(sec.querySelectorAll('.pol-toc a'));if(!links.length||!('IntersectionObserver' in window))return;
  var map={};links.forEach(function(a){map[a.getAttribute('href').slice(1)]=a});
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){links.forEach(function(a){a.classList.remove('is-on')});var a=map[e.target.id];if(a)a.classList.add('is-on')}})},{rootMargin:'-150px 0px -65% 0px'});
  [].forEach.call(sec.querySelectorAll('.pol-block'),function(b){io.observe(b)});
 });
})();
