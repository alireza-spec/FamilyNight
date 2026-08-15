
(function(){'use strict';
 var timer=null, bound=null, rangeStart=0, rangeEnd=0;
 function tx(a,b){return (typeof LANG==='undefined'||LANG==='fa')?a:b}
 function esc(x){var d=document.createElement('div');d.textContent=String(x==null?'':x);return d.innerHTML}
 function ensure(){
  var wrap=document.querySelector('#fn-live-player .fn-live-video-wrap');if(!wrap)return null;
  var old=document.getElementById('fn-live-seek');if(old)return old;
  var box=document.createElement('div');box.id='fn-live-seek';box.setAttribute('aria-label',tx('جابه‌جایی در پخش','Seek within live playback'));
  box.innerHTML='<input id="fn-live-seek-range" type="range" min="0" max="1" step="0.1" value="1" aria-label="'+esc(tx('زمان پخش','Playback time'))+'"><span id="fn-live-seek-time">LIVE</span>';
  wrap.appendChild(box);
  var input=box.querySelector('input');input.addEventListener('input',function(){
   var v=document.getElementById('fn-live-video');if(!v||!rangeEnd||rangeEnd<=rangeStart)return;
   var t=rangeStart+(Number(input.value)/1000);try{v.currentTime=Math.max(rangeStart,Math.min(rangeEnd,t))}catch(e){}
  });
  return box;
 }
 function fmt(sec){sec=Math.max(0,Math.floor(Number(sec)||0));var h=Math.floor(sec/3600),m=Math.floor((sec%3600)/60),s=sec%60;return (h?h+':':'')+String(m).padStart(2,'0')+':'+String(s).padStart(2,'0')}
 function update(){
  var v=document.getElementById('fn-live-video'),box=ensure();if(!v||!box){if(box)box.classList.remove('is-available');return}
  var q=v.seekable, start=0,end=0;
  try{if(q&&q.length){start=q.start(q.length-1);end=q.end(q.length-1)}}catch(e){}
  // Only expose the control when the stream has a real seekable DVR window.
  var available=isFinite(start)&&isFinite(end)&&end-start>5;
  if(!available){box.classList.remove('is-available');return}
  rangeStart=start;rangeEnd=end;box.classList.add('is-available');
  var input=box.querySelector('input'),time=box.querySelector('#fn-live-seek-time'),cur=isFinite(v.currentTime)?Math.max(start,Math.min(end,v.currentTime)):end;
  if(document.activeElement!==input)input.value=String(Math.round((cur-start)*1000));
  input.min='0';input.max=String(Math.round((end-start)*1000));
  if(time)time.textContent=fmt(cur-start)+' / '+fmt(end-start);
 }
 function bind(){var v=document.getElementById('fn-live-video');if(!v||bound===v)return;bound=v;['loadedmetadata','durationchange','progress','canplay','timeupdate','playing','emptied'].forEach(function(e){v.addEventListener(e,update)});if(timer)clearInterval(timer);timer=setInterval(update,1000);update()}
 function reset(){var b=document.getElementById('fn-live-seek');if(b)b.classList.remove('is-available');rangeStart=rangeEnd=0}
 var oldPlay=window.play;
 var mo=new MutationObserver(function(){bind();update()});
 function init(){bind();var p=document.getElementById('fn-live-player');if(p)mo.observe(p,{childList:true,subtree:true});}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
 // Keep the seek bar scoped to the current Live player and hide it on close/error-free source changes.
 document.addEventListener('click',function(e){if(e.target.closest&&e.target.closest('.fn-live-card'))setTimeout(function(){bind();update()},120);if(e.target.closest&&e.target.closest('.fn-live-close'))setTimeout(reset,30)},true);
 window.addEventListener('beforeunload',function(){if(timer)clearInterval(timer)});
})();
