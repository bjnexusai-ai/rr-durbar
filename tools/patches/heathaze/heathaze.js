<script id="rr-heathaze-js">/* 30. Home hero heat-haze (WebGL). Hooks the hero engine by watching the .active class, so goSlide, autoplay, arrows,
   thumbs and keys all trigger it. Falls back to the CSS iris when: no WebGL, low-end device, reduced motion, shader or
   context failure, or ?haze=off. ?haze=force skips the low-end test (for desktop testing). Debug status: window.rrHaze. */
(function(){
var hero=document.getElementById('home');if(!hero)return;
var Q=location.search,st=window.rrHaze={on:false,ready:false,runs:0,reason:''};
function no(r){st.reason=r}
if(/[?&]haze=off/.test(Q))return no('query');
if(matchMedia('(prefers-reduced-motion:reduce)').matches)return no('reduced-motion');
if(!/[?&]haze=force/.test(Q)&&((navigator.deviceMemory&&navigator.deviceMemory<4)||(navigator.hardwareConcurrency&&navigator.hardwareConcurrency<4)))return no('low-end');
var slides=[].slice.call(hero.querySelectorAll('.slide'));if(slides.length<2)return no('slides');
var DUR=1300,MAXPX=2000000,gl,prog,cv,U={},tex=new Map(),dead=false,run=false,raf=0,t0=0,S=null,cur=0,vis=true,rel=[],slow=0,scale=1;
var VS='attribute vec2 a;varying vec2 v;void main(){v=a*.5+.5;gl_Position=vec4(a,0.,1.);}';
var FS='#ifdef GL_FRAGMENT_PRECISION_HIGH\nprecision highp float;\n#else\nprecision mediump float;\n#endif\n'+
'varying vec2 v;uniform sampler2D tA,tB;uniform vec4 bA,bB;uniform vec2 R;uniform float T,K;\n'+
'float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}\n'+
'float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y);}\n'+
'float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<4;i++){s+=a*vn(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return s;}\n'+
'void main(){\n'+
' vec2 px=vec2(v.x*R.x,(1.-v.y)*R.y);float asp=R.x/R.y;vec2 q=vec2(v.x*asp,v.y)*2.6;float rise=K*.9;\n'+
' float n1=fbm(q*vec2(1.,1.7)+vec2(0.,-rise));float n2=fbm(q*vec2(1.3,2.2)+vec2(5.2,-rise*1.4));\n'+
' float pk=pow(sin(3.14159*T),.8);\n'+
' vec2 d=(vec2(n1,n2)-.5)*2.;float amp=.05*pk*(.55+.45*(1.-v.y));\n'+
' vec2 pd=px+vec2(d.x,-d.y*.7)*amp*R;\n'+
' vec2 uA=clamp((pd-bA.xy)/bA.zw,0.,1.),uB=clamp((pd-bB.xy)/bB.zw,0.,1.);\n'+
' vec3 a=texture2D(tA,uA).rgb,b=texture2D(tB,uB).rgb;\n'+
' float f=fbm(q*1.1+vec2(3.,-rise*.5))*.55+v.y*.45;float m=smoothstep(f-.18,f+.18,T*1.5-.25);\n'+
' vec3 c=mix(a,b,m);\n'+
' float seam=1.-abs(2.*m-1.);\n'+
' vec3 g=vec3(1.,.58,.22)*(seam*.15+pk*.05)*(.6+.4*n1);\n'+
' c=c+g*(1.-c*.5);c*=1.+(n2-.5)*.07*pk;\n'+
' gl_FragColor=vec4(c,1.);}';
function sh(t,s){var o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(o));return o}
function kill(r){if(dead)return;dead=true;run=false;st.on=false;st.reason=r;cancelAnimationFrame(raf);hero.classList.remove('hz-on');if(cv&&cv.parentNode)cv.parentNode.removeChild(cv)}
function init(){
 if(dead||st.ready)return;
 try{
  cv=document.createElement('canvas');cv.className='rr-haze';cv.setAttribute('aria-hidden','true');
  gl=cv.getContext('webgl',{alpha:false,antialias:false,depth:false,stencil:false,powerPreference:'high-performance'});
  if(!gl)return no('no-webgl');
  prog=gl.createProgram();gl.attachShader(prog,sh(gl.VERTEX_SHADER,VS));gl.attachShader(prog,sh(gl.FRAGMENT_SHADER,FS));gl.linkProgram(prog);
  if(!gl.getProgramParameter(prog,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(prog));
  gl.useProgram(prog);['tA','tB','bA','bB','R','T','K'].forEach(function(n){U[n]=gl.getUniformLocation(prog,n)});
  var b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
  var a=gl.getAttribLocation(prog,'a');gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);
  cv.addEventListener('webglcontextlost',function(e){e.preventDefault();kill('context-lost')});
  st.ready=true;warm(0);
 }catch(e){kill('init: '+(e&&e.message||e))}
}
function imgOf(i){return slides[i].querySelector('.hero-image')}
function texFor(im){
 var src=im&&(im.currentSrc||im.src);if(!src)return null;var t=tex.get(src);if(t)return t;
 if(!im.complete||!im.naturalWidth)return null;
 try{var o=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,o);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,im);
  if(gl.getError()!==0){gl.deleteTexture(o);return null}
  t={t:o,w:im.naturalWidth,h:im.naturalHeight};tex.set(src,t);
  if(tex.size>12){var k=tex.keys().next().value;gl.deleteTexture(tex.get(k).t);tex.delete(k)}
  return t}catch(e){return null}
}
function warm(i){if(dead||i>=slides.length)return;var go=function(){if(dead)return;if(!run)texFor(imgOf(i));warm(i+1)};(window.requestIdleCallback?requestIdleCallback(go,{timeout:900}):setTimeout(go,150))}
function pc(s){s=s||'50%';return s.indexOf('%')>0?parseFloat(s)/100:s==='left'||s==='top'?0:s==='right'||s==='bottom'?1:.5}
function opos(im){var v=getComputedStyle(im).objectPosition.split(' ');return[pc(v[0]),pc(v[1])]}
function measure(i){var s=slides[i],im=imgOf(i),ph=s.querySelector('.slide-photo');if(!im||!ph)return null;var r=im.getBoundingClientRect(),p=ph.getBoundingClientRect();return{x:r.left-p.left,y:r.top-p.top,w:r.width,h:r.height,pw:p.width,ph:p.height}}
function fit(b,t,o){var s=Math.max(b.w/t.w,b.h/t.h),dw=t.w*s,dh=t.h*s;return[b.x+(b.w-dw)*o[0],b.y+(b.h-dh)*o[1],dw,dh]}
function size(w,h){var dpr=Math.min(window.devicePixelRatio||1,matchMedia('(max-width:700px)').matches?1.5:2)*scale;dpr=Math.min(dpr,Math.sqrt(MAXPX/(w*h)));
 var W=Math.max(2,Math.round(w*dpr)),H=Math.max(2,Math.round(h*dpr));if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H}}
function draw(e,now){
 var b=measure(S.n);if(!b)return;var ph=S.ph.getBoundingClientRect();
 size(ph.width,ph.height);gl.viewport(0,0,cv.width,cv.height);
 var fa=fit(S.ba,S.ta,S.oa),fb=fit(b,S.tb,S.ob);
 gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,S.ta.t);gl.uniform1i(U.tA,0);
 gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,S.tb.t);gl.uniform1i(U.tB,1);
 gl.uniform4f(U.bA,fa[0],fa[1],fa[2],fa[3]);gl.uniform4f(U.bB,fb[0],fb[1],fb[2],fb[3]);
 gl.uniform2f(U.R,ph.width,ph.height);gl.uniform1f(U.T,e);gl.uniform1f(U.K,now);
 gl.drawArrays(gl.TRIANGLES,0,3);
}
function frame(now){
 raf=0;if(!run||dead)return;
 var k=Math.min(1,(now-t0)/DUR),e=k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2;
 /* slow device: drop render resolution once, mid-flight */
 if(S.last){var dt=now-S.last;if(dt>45&&++slow>=4&&scale>.6){scale=.6;slow=0}}S.last=now;
 try{draw(e,(now-t0)/1000+S.seed)}catch(x){return kill('draw: '+x.message)}
 if(k<1)raf=requestAnimationFrame(frame);else{run=false;cv.classList.remove('on')}
}
function begin(p,n){
 var ta=texFor(imgOf(p)),tb=texFor(imgOf(n));if(!ta||!tb)return false;
 var ph=slides[n].querySelector('.slide-photo');if(!ph)return false;
 var pp=slides[p].querySelector('.slide-photo').getBoundingClientRect(),q=rel[p];
 var ba=(q&&Math.abs(q.pw-pp.width)<2&&Math.abs(q.ph-pp.height)<2)?q:measure(p);if(!ba)return false;
 ph.appendChild(cv);cancelAnimationFrame(raf);
 S={p:p,n:n,ph:ph,ta:ta,tb:tb,ba:ba,oa:opos(imgOf(p)),ob:opos(imgOf(n)),seed:Math.random()*40,last:0};
 t0=performance.now();run=true;
 try{draw(0,S.seed)}catch(x){kill('draw: '+x.message);return false}
 cv.classList.add('on');st.runs++;raf=requestAnimationFrame(frame);return true;
}
st.seek=function(p,n,e){if(!st.ready||dead)return false;if(!begin(p,n))return false;cancelAnimationFrame(raf);run=false;draw(e,3);return true};
function onChange(p,n){
 if(!st.ready||dead)return;
 hero.classList.add('hz-on');st.on=true;
 if(document.hidden||!vis)return;
 begin(p,n);
}
var mo=new MutationObserver(function(){var n=-1;for(var i=0;i<slides.length;i++)if(slides[i].classList.contains('active')){n=i;break}
 if(n<0||n===cur)return;var p=cur;cur=n;onChange(p,n)});
slides.forEach(function(s,i){if(s.classList.contains('active'))cur=i;mo.observe(s,{attributes:true,attributeFilter:['class']})});
if('IntersectionObserver' in window)new IntersectionObserver(function(es){vis=es[0].isIntersecting},{threshold:0}).observe(hero);
setInterval(function(){if(document.hidden||!vis||run||!st.ready)return;rel[cur]=measure(cur)},150);
addEventListener('resize',function(){rel=[]});
function boot(){(window.requestIdleCallback?requestIdleCallback(init,{timeout:2500}):setTimeout(init,600))}
if(document.readyState==='complete')boot();else addEventListener('load',boot,{once:true});
})();
</script>
