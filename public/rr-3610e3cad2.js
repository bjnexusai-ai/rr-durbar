/* rr-catering-1c: one gold sweep when the home band enters view */
(function(){var c=document.querySelector('#home-catering .rrc-card');if(!c)return;
function go(){c.classList.add('rrc-in')}
if(!('IntersectionObserver' in window)){go();return}
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){go();io.disconnect()}})},{threshold:.4});io.observe(c);
})();
