
(function(){
  'use strict';
  var tabs=['fav','rated','watchlater','recent'];
  function fa(){return typeof LANG!=='undefined'&&LANG==='fa';}
  function tr(en,faText){return fa()?faText:en;}
  function esc(s){var d=document.createElement('div');d.textContent=String(s==null?'':s);return d.innerHTML;}
  function data(){return {fav:(typeof favorites!=='undefined'&&Array.isArray(favorites))?favorites:[],rated:(typeof personalRatings!=='undefined'&&personalRatings)?personalRatings:{},watchlater:(typeof watchlist!=='undefined'&&Array.isArray(watchlist))?watchlist:[],recent:(typeof recentlyViewed!=='undefined'&&Array.isArray(recentlyViewed))?recentlyViewed:[]};}
  function count(tab){var x=data()[tab];return Array.isArray(x)?x.length:Object.keys(x).length;}
  function ensureControls(){
    tabs.forEach(function(tab){
      var section=document.getElementById('mylist-section-'+tab);
      if(!section||section.querySelector('.fn-mylist-controls'))return;
      var bar=document.createElement('div');bar.className='fn-mylist-controls';bar.dataset.fnMylistTab=tab;
      bar.innerHTML='<button type="button" class="fn-mylist-clear" data-fn-mylist-clear="'+tab+'">'+tr('Clear All','پاک‌کردن همه')+'</button>';
      section.insertBefore(bar,section.firstChild);
    });
  }
  function updateControls(){
    ensureControls();
    document.querySelectorAll('.fn-mylist-clear').forEach(function(b){
      var n=count(b.getAttribute('data-fn-mylist-clear'));
      b.disabled=!n;
      b.setAttribute('aria-disabled',n?'false':'true');
      b.title=n?tr('Clear this list only','فقط همین فهرست را پاک کن'):tr('This list is already empty','این فهرست خالی است');
    });
  }
  function button(tab,id,type){return '<button type="button" class="fn-mylist-remove" aria-label="'+esc(tr('Remove from list','حذف از فهرست'))+'" title="'+esc(tr('Remove','حذف'))+'" onclick="event.preventDefault();event.stopPropagation();window.FNMyListRemove(\''+tab+'\',\''+encodeURIComponent(String(id))+'\',\''+encodeURIComponent(String(type||'movie'))+'\');">&times;</button>';}
  function card(item,tab){
    var type=item.type||(item.media_type)||(item.title?'movie':'tv');
    var html=makeCard(item,type);
    return html?html.replace('<div class="card"','<div class="card mylist-card"').replace('>', '>'+button(tab,item.id,type)):'';
  }
  function render(){
    var tab=(typeof _myListCurrentTab!=='undefined'&&_myListCurrentTab)||'fav',isFA=fa(),x=data();
    updateControls();
    if(tab==='fav'){
      var g=document.getElementById('fav-grid'),e=document.getElementById('fav-empty');if(!g)return;g.innerHTML='';
      if(!x.fav.length){if(e){e.style.display='block';e.textContent=tr('No favorites yet','لیست خالیه');}}else{if(e)e.style.display='none';x.fav.forEach(function(v){g.innerHTML+=card(v,'fav');});}
    }else if(tab==='watchlater'){
      var wg=document.getElementById('watchlater-grid'),we=document.getElementById('watchlater-empty');if(!wg)return;wg.innerHTML='';
      if(!x.watchlater.length){if(we){we.style.display='block';we.textContent=tr('Nothing saved for later','هیچ اثری ذخیره نشده');}}else{if(we)we.style.display='none';x.watchlater.forEach(function(v){wg.innerHTML+=card(v,'watchlater');});}
    }else if(tab==='recent'){
      var rg=document.getElementById('recent-grid'),re=document.getElementById('recent-empty');if(!rg)return;rg.innerHTML='';
      if(!x.recent.length){if(re){re.style.display='block';re.textContent=tr('No recently opened titles','هیچ اثری اخیراً باز نشده');}}else{if(re)re.style.display='none';x.recent.forEach(function(v){rg.innerHTML+=card(v,'recent');});}
    }else if(tab==='rated'){
      var rl=document.getElementById('rated-list-content'),rEmpty=document.getElementById('rated-empty');if(!rl)return;
      var items=Object.keys(x.rated).map(function(id){return [id,x.rated[id]];}).sort(function(a,b){return (b[1].stars||0)-(a[1].stars||0);});
      if(!items.length){rl.innerHTML='';if(rEmpty){rEmpty.style.display='block';rEmpty.textContent=tr('No ratings yet','هنوز امتیازی ثبت نشده');}return;}
      if(rEmpty)rEmpty.style.display='none';
      var labels={loved:tr('Loved it','سلیقم بود'),ok:tr('Was OK','بد نبود'),disliked:tr('Waste of time','اتلاف وقت'),notmytaste:tr('Not my taste','سلیقم نبود')};
      rl.innerHTML=items.map(function(ent){var id=ent[0],r=ent[1]||{},stars='';for(var i=1;i<=5;i++)stars+='<span style="color:'+(i<=r.stars?'#f5c518':'var(--border,#555)')+'">&#9733;</span>';var poster=r.poster?('https://family-night-api.alirezadoe8.workers.dev/img/w185'+r.poster):'';return '<div class="fn-mylist-rated-row" style="display:flex;align-items:center;gap:12px;padding:11px 0;border-bottom:1px solid var(--border,#1a1a1a);cursor:pointer;" onclick="openDetail('+id+',\''+String(r.type||'movie').replace(/'/g,'')+'\')">'+button('rated',id,r.type||'movie')+'<div style="width:52px;height:74px;border-radius:6px;overflow:hidden;flex-shrink:0;background:var(--button-bg,#111);">'+(poster?'<img src="'+esc(poster)+'" style="width:100%;height:100%;object-fit:cover;" loading="lazy">':'<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:22px;">&#127916;</div>')+'</div><div style="flex:1;min-width:0;"><div style="font-size:14px;font-weight:600;color:var(--text,#e0e0e0);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+esc(r.title||'')+'</div><div style="margin-top:5px;font-size:16px;letter-spacing:2px;">'+stars+'</div>'+(r.opinion&&labels[r.opinion]?'<div style="font-size:11px;color:var(--primary);margin-top:4px;font-weight:600;">'+esc(labels[r.opinion])+'</div>':'')+'</div></div>';}).join('');
    }
  }
  window.FNMyListRemove=function(tab,encodedId,encodedType){
    var id=decodeURIComponent(encodedId),type=decodeURIComponent(encodedType||'movie');
    if(tab==='fav'){favorites=favorites.filter(function(v){return !(String(v.id)===id&&String(v.type||v.media_type||(v.title?'movie':'tv'))===type);});localStorage.setItem(FAV_KEY,JSON.stringify(favorites));}
    else if(tab==='watchlater'){watchlist=watchlist.filter(function(v){return !(String(v.id)===id&&String(v.type||v.media_type||(v.title?'movie':'tv'))===type);});localStorage.setItem(WATCHLIST_KEY,JSON.stringify(watchlist));}
    else if(tab==='recent'){recentlyViewed=recentlyViewed.filter(function(v){return !(String(v.id)===id&&String(v.type||v.media_type||(v.title?'movie':'tv'))===type);});localStorage.setItem(RECENTLY_KEY,JSON.stringify(recentlyViewed));}
    else if(tab==='rated'){delete personalRatings[id];localStorage.setItem(RATINGS_KEY,JSON.stringify(personalRatings));if(String(typeof curId==='undefined'?'':curId)===id&&typeof renderPersonalRating==='function')renderPersonalRating();}
    if(typeof checkFavState==='function')checkFavState();if(typeof checkWatchlistState==='function')checkWatchlistState();if(typeof updateMiniStats==='function')updateMiniStats();render();if(typeof showToast==='function')showToast(tr('Removed from this list','از همین فهرست حذف شد'));
  };
  window.FNMyListClear=function(tab){
    if(!count(tab))return;
    if(!window.confirm(tr('Clear all items from this list?','همهٔ موارد این فهرست پاک شوند؟')))return;
    if(tab==='fav'){favorites=[];localStorage.setItem(FAV_KEY,'[]');}
    else if(tab==='watchlater'){watchlist=[];localStorage.setItem(WATCHLIST_KEY,'[]');}
    else if(tab==='recent'){recentlyViewed=[];localStorage.setItem(RECENTLY_KEY,'[]');}
    else if(tab==='rated'){personalRatings={};localStorage.setItem(RATINGS_KEY,'{}');if(typeof renderPersonalRating==='function')renderPersonalRating();}
    if(typeof checkFavState==='function')checkFavState();if(typeof checkWatchlistState==='function')checkWatchlistState();if(typeof updateMiniStats==='function')updateMiniStats();render();if(typeof showToast==='function')showToast(tr('This list was cleared','این فهرست پاک شد'));
  };
  document.addEventListener('click',function(e){var b=e.target.closest('[data-fn-mylist-clear]');if(b){e.preventDefault();window.FNMyListClear(b.getAttribute('data-fn-mylist-clear'));}});
  window.switchMyListTab=switchMyListTab=function(tab){
    _myListCurrentTab=tab;tabs.forEach(function(t){var btn=document.getElementById('mylist-tab-'+t),sec=document.getElementById('mylist-section-'+t),active=t===tab;if(btn){btn.style.background=active?'var(--primary-soft)':'var(--button-bg)';btn.style.color=active?'var(--text)':'var(--sub)';btn.style.borderColor=active?'var(--primary)':'var(--border)';btn.setAttribute('aria-selected',active?'true':'false');}if(sec)sec.style.display=active?'block':'none';});render();};
  window.loadFavorites=loadFavorites=render;
  /* The former handler only opened a Telegram share URL, which is commonly popup-blocked. */
  window.shareWatchlist=shareWatchlist=async function(){
    var active=(typeof getActiveMyListData==='function')?getActiveMyListData():{title:tr('Liked','لایک‌شده'),items:data().fav};var list=active.items||[];if(!list.length){if(typeof showToast==='function')showToast(tr('This list is empty','این فهرست خالی است'));return;}
    var names=list.slice(0,12).map(function(v){return v.title||v.name||'';}).filter(Boolean);var text=(fa()?'فهرست «'+active.title+'» من در Family Night:\n':'My '+active.title+' list in Family Night:\n')+names.map(function(n){return '• '+n;}).join('\n')+(list.length>12?'\n…':'');
    try{if(navigator.share){await navigator.share({title:'Family Night',text:text});if(typeof showToast==='function')showToast(tr('List shared','فهرست به اشتراک گذاشته شد'));return;}}catch(err){if(err&&err.name==='AbortError')return;}
    try{var copied=false;if(navigator.clipboard&&window.isSecureContext){try{await Promise.race([navigator.clipboard.writeText(text),new Promise(function(_,reject){setTimeout(function(){reject(Error('clipboard timeout'));},1500);})]);copied=true;}catch(clipboardError){}}if(!copied){var ta=document.createElement('textarea');ta.value=text;ta.setAttribute('readonly','');ta.style.cssText='position:fixed;opacity:0;pointer-events:none;';document.body.appendChild(ta);ta.select();var ok=document.execCommand('copy');ta.remove();if(!ok)throw Error('copy');}if(typeof showToast==='function')showToast(tr('List copied to clipboard','فهرست در کلیپ‌بورد کپی شد'));}catch(e){if(typeof showToast==='function')showToast(tr('Unable to share here. Copy the list manually.','اشتراک‌گذاری در اینجا ممکن نیست؛ فهرست را دستی کپی کنید.'));}
  };
  ensureControls();
  var originalSwitch=window.switchTab;
  if(typeof originalSwitch==='function')window.switchTab=switchTab=function(tab,el){var out=originalSwitch(tab,el);if(tab==='fav')render();return out;};
  setTimeout(function(){ensureControls();render();},0);
})();
