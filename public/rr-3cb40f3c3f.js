/* v78 phase1: clean URLs (/about-us/ etc.) open the matching ?page= route; canonicals and sitemap use the clean URLs */(function(){try{if(window.RR_PAGE)return;var m=location.pathname.replace(/^\/+|\/+$/g,"");var ok=["about-us","menu","order-now","branches","catering","contact","track-order","pickup","policies","privacy-policy","terms-of-service","refund-cancellation"];if(ok.indexOf(m)>-1&&!/[?&]page=/.test(location.search)){history.replaceState(null,"","/?page="+m+location.hash)}}catch(e){}})();
;
/* Google Analytics 4. Loads after the page has loaded, only on the live domain (or with ?ga=on for testing). */
(function(){var H=location.hostname;if(H!=='rrdurbar.com'&&H!=='www.rrdurbar.com'&&!/[?&]ga=on/.test(location.search))return;
window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('js',new Date());gtag('config','G-1E6TC2HSXV');
function load(){var s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id=G-1E6TC2HSXV';document.head.appendChild(s)}
if(document.readyState==='complete')load();else addEventListener('load',load,{once:true})})();

;
/* Client decision: no prices on the site for now. Set to true to bring every price back (cards, menu rows, dish popup, cart). */
window.RR_SHOW_PRICES=false;if(window.RR_SHOW_PRICES===false)document.documentElement.classList.add('rr-no-prices');