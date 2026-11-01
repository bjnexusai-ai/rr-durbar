/* phones: move the music button onto the photo (same element, so the music still works); back on wider screens */
(function(){var mq=matchMedia('(max-width:700px)'),box=document.getElementById('musicBox'),home=document.getElementById('home');if(!box||!home)return;
var par=box.parentNode,next=box.nextSibling;
function place(){if(mq.matches){if(box.parentNode!==home){home.appendChild(box)}box.classList.add('rr-mb-chip')}else{box.classList.remove('rr-mb-chip');if(box.parentNode!==par){par.insertBefore(box,next&&next.parentNode===par?next:null)}}}
place();if(mq.addEventListener)mq.addEventListener('change',place);else if(mq.addListener)mq.addListener(place)})();