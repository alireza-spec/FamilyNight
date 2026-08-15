
(function(){'use strict';
 var tr=window.tx4||function(a,b){return (typeof LANG==='undefined'||LANG==='fa')?a:b};
 function install(){
  var bar=document.querySelector('#fn-live-player .fn-live-player-bar');
  if(bar){var fs=bar.querySelector('[onclick*="fnLiveFullscreen"]');if(fs)fs.remove();}
  var q=document.getElementById('fn-live-search');if(q)q.placeholder='Search channels…';
  var c=document.getElementById('fn-live-count');if(c&&(!c.textContent||/بارگذاری|loading/i.test(c.textContent)))c.textContent=tr('در حال بارگذاری…','Loading…');
  var st=document.getElementById('fn-live-status-text');if(st&&/دریافت شبکه|getting channels|loading/i.test(st.textContent))st.textContent=tr('در حال دریافت شبکه‌ها…','Loading channels…');
 }
 window.fnLiveFullscreen=function(){var w=document.getElementById('fn-live-player');if(!w)return;var go=function(){try{if(screen.orientation&&screen.orientation.lock)screen.orientation.lock('landscape').catch(function(){});}catch(e){}};if(document.fullscreenElement){if(document.exitFullscreen)document.exitFullscreen().catch(function(){});return}if(w.requestFullscreen){w.requestFullscreen().then(go).catch(function(){})}else if(w.webkitRequestFullscreen){w.webkitRequestFullscreen();go()}};
 document.addEventListener('fullscreenchange',function(){if(document.fullscreenElement){try{if(screen.orientation&&screen.orientation.lock)screen.orientation.lock('landscape').catch(function(){});}catch(e){}}});
 var old=window.fnLiveClosePlayer;window.fnLiveClosePlayer=function(){try{if(document.fullscreenElement&&document.exitFullscreen)document.exitFullscreen().catch(function(){})}catch(e){};return old?old.apply(this,arguments):undefined};
 install();setInterval(install,500);
})();
