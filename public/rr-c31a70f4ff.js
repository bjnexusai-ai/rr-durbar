
/* RR hero engine — one clock, one animation. Each photo opens with a reveal and pushes toward the viewer. */
(function(){
const SLIDE_MS=5500, LEAVE_MS=800;
const slides=[...document.querySelectorAll('.hero .slide')],bars=[...document.querySelectorAll('#progressBars button')],thumbs=[...document.querySelectorAll('.hero-thumb')];
const musicBox=document.getElementById('musicBox'),musicButton=document.getElementById('musicButton'),musicText=document.getElementById('musicText'),royalAudio=document.getElementById('royalAudio');
if(!slides.length)return;
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
let current=0,start=performance.now(),timer=0,leaveT=0,raf=0,ambience=false;
document.documentElement.style.setProperty('--rr-slide-ms',SLIDE_MS+'ms');
slides.forEach((s,i)=>{const im=s.querySelector('.hero-image');const src=im&&(im.dataset.thumb||im.dataset.card||im.src);if(thumbs[i]&&src)thumbs[i].querySelector('img').src=src});
slides.forEach(s=>{const im=s.querySelector('.hero-image');if(im){im.loading='eager';im.decoding='async';if(im.decode)im.decode().catch(()=>{})}});
function paint(i){
  const prev=current; current=((i%slides.length)+slides.length)%slides.length;
  if(prev!==current){slides[prev].classList.add('leaving');clearTimeout(leaveT);leaveT=setTimeout(()=>slides.forEach((s,k)=>{if(k!==current)s.classList.remove('leaving')}),LEAVE_MS)}
  slides[current].classList.remove('leaving');
  slides.forEach((s,k)=>s.classList.toggle('active',k===current));
  bars.forEach((b,k)=>{b.classList.toggle('active',k===current);b.style.setProperty('--fill','0%')});
  thumbs.forEach((b,k)=>b.classList.toggle('active',k===current));
  start=performance.now();
}
function schedule(){clearTimeout(timer);timer=setTimeout(()=>{paint(current+1);schedule()},SLIDE_MS)}
window.goSlide=function(i){paint(i);schedule()};window.rrHeroPause=function(){clearTimeout(timer);paused=performance.now()};window.rrHeroResume=function(){if(paused){start+=performance.now()-paused;paused=0}clearTimeout(timer);timer=setTimeout(function(){paint(current+1);schedule()},Math.max(300,SLIDE_MS-(performance.now()-start)))};let paused=0;
let lastFill=0;function frame(t){
  if(!document.hidden&&!paused&&t-lastFill>80){lastFill=t;const p=Math.min(1,(t-start)/SLIDE_MS);{const cb=bars[current];if(cb)cb.style.setProperty('--fill',(p*100).toFixed(2)+'%')}}
  raf=requestAnimationFrame(frame);
}
document.getElementById('nextSlide')?.addEventListener('click',()=>goSlide(current+1));
document.getElementById('prevSlide')?.addEventListener('click',()=>goSlide(current-1));
document.addEventListener('keydown',e=>{if(e.target.closest&&e.target.closest('input,textarea,select'))return;const h=document.querySelector('.hero');if(!h)return;const r=h.getBoundingClientRect();if(r.bottom<80||r.top>innerHeight*.6)return;if(e.key==='ArrowRight')goSlide(current+1);if(e.key==='ArrowLeft')goSlide(current-1)});
document.addEventListener('visibilitychange',()=>{if(document.hidden){clearTimeout(timer)}else{start=performance.now();schedule()}});
/* ambience (unchanged behaviour) */
if(royalAudio){royalAudio.volume=.72;royalAudio.loop=true}
function updateMusicUI(on){if(!musicBox)return;musicBox.classList.toggle('playing',on);musicButton.textContent=on?'Ⅱ':'♫';musicButton.setAttribute('aria-label',on?'Turn ambience off':'Turn ambience on');musicText.textContent=on?'On · ambience only':'Off · tap to play'}
async function startMusic(){ambience=true;try{await royalAudio.play();updateMusicUI(true)}catch(e){ambience=false;updateMusicUI(false)}}
function stopMusic(){ambience=false;royalAudio.pause();updateMusicUI(false)}
musicButton?.addEventListener('click',()=>ambience?stopMusic():startMusic());
paint(0);schedule();updateMusicUI(false);raf=requestAnimationFrame(frame);
})();

;

/* V8 prototype hydration: reuse the already-embedded hero image bytes; no external image URLs. */
(function(){
 const heroImgs=[...document.querySelectorAll('.hero-image')].map(x=>x.dataset.card||x.currentSrc||x.src);
 document.querySelectorAll('img[data-scene]').forEach(img=>{const n=Number(img.dataset.scene)||0; if(heroImgs[n]) img.src=heroImgs[n];});
 const hero=document.querySelector('.hero');
 if(hero && !matchMedia('(prefers-reduced-motion: reduce)').matches){
   let tx=0,ty=0,px=0,py=0;
   hero.addEventListener('pointermove',e=>{
     const r=hero.getBoundingClientRect();
     tx=((e.clientX-r.left)/r.width-.5)*10;
     ty=((e.clientY-r.top)/r.height-.5)*8;
   },{passive:true});
   hero.addEventListener('pointerleave',()=>{tx=0;ty=0},{passive:true});
   function parallax(){px+=(tx-px)*.045;py+=(ty-py)*.045;const s=document.querySelector('.slide.active');if(s){s.style.setProperty('--px',px.toFixed(2)+'px');s.style.setProperty('--py',py.toFixed(2)+'px')}requestAnimationFrame(parallax)}
   /* old parallax loop disabled: replaced by rr-stage3-parallax (food image only) */
 }
})();

;

(function(){
 /* scene labels are set in the slide markup */
})();

;

(function(){
 const sections=[...document.querySelectorAll('.section, .rr-section')];
 if(matchMedia('(prefers-reduced-motion: reduce)').matches){sections.forEach(s=>s.classList.add('rr-visible'));return;}
 const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('rr-visible');io.unobserve(e.target)}}),{threshold:.12,rootMargin:'0px 0px -7% 0px'});
 sections.forEach(s=>io.observe(s));
})();

;

(() => {
  const nav = document.querySelector('.top-nav');
  const button = document.querySelector('.mobile-menu');
  const links = document.querySelector('.nav-links');
  if (!nav || !button || !links) return;
  const panel = document.createElement('nav');
  panel.className = 'mobile-nav-panel';
  panel.setAttribute('aria-label', 'Mobile navigation');
  links.querySelectorAll('a').forEach((link) => {
    const item = document.createElement('a');
    item.setAttribute('href', link.getAttribute('href'));
    item.textContent = link.textContent;
    item.style.setProperty('--i', panel.querySelectorAll('a').length);
    item.addEventListener('click', () => setOpen(false));
    panel.append(item);
  });
  const close = document.createElement('button');
  close.type = 'button'; close.className = 'mobile-nav-close'; close.setAttribute('aria-label', 'Close menu'); close.textContent = '×';
  close.addEventListener('click', () => setOpen(false));
  panel.prepend(close);
  nav.append(panel);
  function setOpen(open) {
    panel.classList.toggle('open', open);
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    button.textContent = open ? '×' : '☰';
  }
  button.setAttribute('aria-expanded', 'false');
  button.addEventListener('click', () => setOpen(!panel.classList.contains('open')));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setOpen(false);
  });
})();

;
/* RR Durbar display names (task 1.3): card captions only. Cart, prices, WhatsApp text and menu data keep the Rista names. Left unchanged (no new name given): Special Chicken Biryani (Family) */
(function(){var SIG={"murgh musallam biryani": "Chicken Fry Biryani", "murgh mehfil biryani": "Chicken Dum Biryani", "naatu naatu wings": "Chicken Lollipops", "naatu naatu special wings": "Chicken Lollipops", "durbar supreme chicken": "Chicken Tikka", "durbar's supreme chicken": "Chicken Tikka", "maharaja tawa fish": "Lemon Heaven Fish", "raju gari kodi vepudu": "Bhimavaram Kodi Vepudu", "raju garu kodi vepudu": "Bhimavaram Kodi Vepudu", "guntur chilli chicken": "Naatu Naatu Wings", "nalla kaaram paneer vepudu": "Paneer Tikka Pakoda", "nalla karam paneer vepudu": "Paneer Tikka Pakoda", "chicken 555": "Crispy Egg"},MENU={"peanut masala": "Crispy Corn", "egg 65": "Egg Masala Fry", "naatu naatu special wings (8 pcs)": "Chicken Lollipops", "chilli chicken": "Salt and Pepper Mushroom", "butter garlic chicken": "Murgh Afghani Kebab", "guntur chilli chicken": "Naatu Naatu Wings", "chicken gulzara": "Durbar Crispy Prawns", "kaju paneer biryani": "Ulavachari Veg Biryani", "egg biryani": "Murgh Matka Biryani", "chicken fry biryani (regular)": "Chicken Tikka Biryani", "special chicken biryani (regular)": "Chicken Wings Biryani", "mutton fry biryani (regular)": "Konaseema Kodi Pulao", "dilkush chicken biryani": "Special Chicken Biryani", "mutton keema biryani": "Kaju Mushroom Biryani", "veg noodles": "Veg Hakka Noodles"};window.RRDN=function(n,m){var k=String(n==null?"":n).replace(/&#39;|\u2019/g,"'").trim().toLowerCase(),t=m==="menu"?MENU:SIG;return Object.prototype.hasOwnProperty.call(t,k)?t[k]:n}})();