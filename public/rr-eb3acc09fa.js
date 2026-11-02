/* rr-catering-stages: lights on when 30% in view, detail card, Enquire preselects the event in #catering-form */
(function(){var root=document.getElementById('rrs');if(!root)return;
var rmq=matchMedia('(prefers-reduced-motion:reduce)'),wide=matchMedia('(min-width:900px)');
root.classList.add('js');
var sec=document.getElementById('catering-occasions'),card=sec.querySelector('.rrs-card'),scrim=sec.querySelector('.rrs-scrim');
document.body.appendChild(scrim);document.body.appendChild(card);
var D={
 weddings:{t:'Weddings',l:'Wedding-day feasts and receptions, planned around your menu and your date.',o:'Wedding'},
 corporate:{t:'Corporate Events',l:'Office lunches, team meets and company functions, served on time.',o:'Corporate event'},
 royal:{t:'Royal Catering',l:'Our signature dum biryani and royal Andhra menus, for your guests.',o:'Other'},
 celebrations:{t:'Celebrations',l:'Birthdays, anniversaries and family celebrations, the Durbar way.',o:'Private party'},
 outdoor:{t:'Outdoor Events',l:'Garden parties, community events and big get-togethers.',o:'Large gathering'},
 baby:{t:'Baby Showers',l:'Warm, festive menus for baby showers and family get-togethers.',o:'Baby shower'}};
var cur=null,last=null,isOpen=false,timer=0;
function on(){root.classList.add('on')}
if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){if(es[0].isIntersecting){on();io.disconnect()}},{threshold:.3});io.observe(root)}else on();
function place(btn){
 if(!wide.matches){card.style.left=card.style.top='';return}
 var r=btn.getBoundingClientRect(),W=card.offsetWidth||320,H=card.offsetHeight||190;
 var left=(r.left+r.width/2<innerWidth/2)?r.right+16:r.left-W-16;
 left=Math.max(8,Math.min(innerWidth-W-8,left));
 var top=Math.max(8,Math.min(innerHeight-H-8,r.top+r.height/2-H/2));
 card.style.left=(left+scrollX)+'px';card.style.top=(top+scrollY)+'px'}
function show(k,btn){var d=D[k];if(!d)return;cur=k;last=btn;clearTimeout(timer);
 card.querySelector('h3').textContent=d.t;card.querySelector('.rrs-cp').textContent=d.l;
 card.hidden=false;scrim.hidden=false;place(btn);void card.offsetWidth;
 card.classList.add('open');scrim.classList.add('open');isOpen=true;
 card.querySelector('.rrs-x').focus({preventScroll:true})}
function hide(back){if(!isOpen)return;isOpen=false;card.classList.remove('open');scrim.classList.remove('open');
 var done=function(){card.hidden=true;scrim.hidden=true};
 if(rmq.matches)done();else timer=setTimeout(done,330);
 if(back&&last)last.focus({preventScroll:true})}
root.addEventListener('click',function(e){var b=e.target.closest('.rrs-b');if(b)show(b.getAttribute('data-k'),b)});
scrim.addEventListener('click',function(){hide(true)});
card.querySelector('.rrs-x').addEventListener('click',function(){hide(true)});
document.addEventListener('keydown',function(e){if(!isOpen)return;
 if(e.key==='Escape'){e.preventDefault();hide(true)}
 else if(e.key==='Tab'){var f=[card.querySelector('.rrs-x'),card.querySelector('.rrs-enq')],i=f.indexOf(document.activeElement);
  e.preventDefault();f[(i+(e.shiftKey?-1:1)+f.length)%f.length].focus()}});
card.querySelector('.rrs-enq').addEventListener('click',function(e){e.preventDefault();var d=D[cur];hide(false);
 var f=document.getElementById('catering-form'),s=document.getElementById('c-type');
 if(s&&d){for(var i=0;i<s.options.length;i++){if(s.options[i].text===d.o){s.selectedIndex=i;s.dispatchEvent(new Event('input',{bubbles:true}));s.dispatchEvent(new Event('change',{bubbles:true}));break}}}
 if(f)f.scrollIntoView({behavior:rmq.matches?'auto':'smooth',block:'center'});
 setTimeout(function(){if(s)s.focus({preventScroll:true})},rmq.matches?0:600)});
addEventListener('resize',function(){if(isOpen)hide(false)});
})();
