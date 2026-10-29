document.getElementById("rr-skip-btn").addEventListener("click",function(){var m=document.getElementById("main-content");if(!m)return;m.setAttribute("tabindex","-1");m.focus();m.scrollIntoView({block:"start"})})
;
/* v66: mark the Home route before first paint (the router script only did this ~0.4s later, so the nav, hero line and music button jumped from the centred position to the left) */
(function(){var m=/[?&]page=([^&#]*)/.exec(location.search);if((!m||m[1]===""||m[1]==="home")&&!location.hash)document.body.classList.add("rr-home-route")})();
