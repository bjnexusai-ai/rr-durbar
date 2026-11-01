/* about-us exterior reveal: places the gold light on the signboard (board = 115..1174 x 754..841 in the 1314x1197 photo), opens once in view */
(function(){var f=document.getElementById('rraExt');if(!f)return;var img=f.querySelector('img'),sw=f.querySelector('.ext-sweep'),fr=f.querySelector('.rra-frame');if(!img||!sw||!fr)return;
var B=[115/1314,754/1197,1059/1314,87/1197];
function pc(v){if(!v)return .5;if(v.indexOf('%')>0)return parseFloat(v)/100;return v==='left'||v==='top'?0:v==='right'||v==='bottom'?1:.5}
function place(){var r=fr.getBoundingClientRect(),ir=img.getBoundingClientRect();if(!ir.width||!ir.height)return;var nw=img.naturalWidth||1314,nh=img.naturalHeight||1197,s=Math.max(ir.width/nw,ir.height/nh),w=nw*s,h=nh*s,op=getComputedStyle(img).objectPosition.split(' '),ox=ir.left-r.left+(ir.width-w)*pc(op[0]),oy=ir.top-r.top+(ir.height-h)*pc(op[1]);
 sw.style.setProperty('--bx',(ox+B[0]*w).toFixed(1)+'px');sw.style.setProperty('--by',(oy+B[1]*h).toFixed(1)+'px');sw.style.setProperty('--bw',(B[2]*w).toFixed(1)+'px');sw.style.setProperty('--bh',(B[3]*h).toFixed(1)+'px')}
f.classList.add('ext-armed');place();img.addEventListener('load',place);addEventListener('resize',place);if(window.ResizeObserver)new ResizeObserver(place).observe(fr);
function go(){place();f.classList.add('ext-in');setTimeout(place,1000)}
if(!('IntersectionObserver' in window)){go();return}
var io=new IntersectionObserver(function(es){if(es[0].isIntersecting){io.disconnect();(img.decode?img.decode():Promise.resolve()).then(go,go)}},{threshold:.3});io.observe(f);
})();
/* rr-branches-b: warm string lights along the bridge cables in the skyline photo (coordinates are in the photo's own pixels) */
(function(){var sky=document.getElementById('skyline'),img=sky&&sky.querySelector('img');if(!img)return;
var NS='http://www.w3.org/2000/svg',W=1600,H=533;
var C=[[830,262,1020,330,1210,247],[1230,247,1350,326,1469,233],[1491,233,1545,268,1600,272]];
var sv=document.createElementNS(NS,'svg');sv.setAttribute('class','rr-bulbs');sv.setAttribute('viewBox','0 0 '+W+' '+H);sv.setAttribute('aria-hidden','true');sv.setAttribute('preserveAspectRatio','none');
sv.innerHTML='<defs><radialGradient id="rrbG"><stop offset="0" stop-color="#ffd27a" stop-opacity=".95"/><stop offset=".4" stop-color="#ffb347" stop-opacity=".35"/><stop offset="1" stop-color="#ff9a2e" stop-opacity="0"/></radialGradient><radialGradient id="rrbC"><stop offset="0" stop-color="#fffbe8"/><stop offset=".55" stop-color="#ffd27a"/><stop offset="1" stop-color="#e09a2a"/></radialGradient></defs>';
var k=0,g=document.createElementNS(NS,'g');
C.forEach(function(c){var n=Math.round(Math.abs(c[4]-c[0])/16);for(var i=1;i<n;i++){var t=i/n,u=1-t,x=u*u*c[0]+2*u*t*c[2]+t*t*c[4],y=u*u*c[1]+2*u*t*c[3]+t*t*c[5]+2.5,d=(k++*0.035).toFixed(3)+'s';
 var h=document.createElementNS(NS,'circle');h.setAttribute('cx',x);h.setAttribute('cy',y);h.setAttribute('r',11);h.setAttribute('fill','url(#rrbG)');h.setAttribute('class','h');h.style.setProperty('--d',d);g.appendChild(h);
 var b=document.createElementNS(NS,'circle');b.setAttribute('cx',x);b.setAttribute('cy',y);b.setAttribute('r',2.6);b.setAttribute('fill','url(#rrbC)');b.setAttribute('class','b');b.style.setProperty('--d',d);g.appendChild(b)}});
sv.appendChild(g);sky.appendChild(sv);
function fit(){sv.style.left=img.offsetLeft+'px';sv.style.top=img.offsetTop+'px';sv.style.width=img.offsetWidth+'px';sv.style.height=img.offsetHeight+'px';
 var tf=getComputedStyle(img).transform;sv.style.transform=tf==='none'?'':tf;sv.style.transformOrigin=getComputedStyle(img).transformOrigin}
fit();if(window.ResizeObserver)new ResizeObserver(fit).observe(img);img.addEventListener('load',fit);addEventListener('resize',fit);
if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){if(es[0].isIntersecting){sv.classList.add('on');io.disconnect()}},{threshold:.25});io.observe(sv)}else sv.classList.add('on');
})();
