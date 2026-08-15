
(function(){
  'use strict';
  function esc(v){var d=document.createElement('div');d.textContent=String(v==null?'':v);return d.innerHTML;}
  function detailData(){try{return (typeof curDataForFav!=='undefined'&&curDataForFav)||null;}catch(e){return null;}}
  function titleYear(d){
    if(!d)return '';
    var start=String(d.release_date||d.first_air_date||'').slice(0,4);
    if(!start)return '';
    if((typeof curType!=='undefined'&&curType==='tv')){
      var status=String(d.status||'').toLowerCase(), end=String(d.last_air_date||'').slice(0,4);
      return (end && (status==='ended'||status==='canceled'||status==='cancelled')) ? start+'-'+end : start+'-';
    }
    return start;
  }
  function putTitleYear(){
    var h=document.getElementById('d-title'),d=detailData();if(!h||!d)return;
    var title=(typeof curTitle!=='undefined'&&curTitle)||d.title||d.name||'';
    var y=titleYear(d);
    h.innerHTML=esc(title)+(y?' <span class="fn-detail-title-year">('+esc(y)+')</span>':'');
    var old=document.getElementById('d-year');if(old)old.style.display='none';
  }
  function scoreMarkup(){
    var meta=document.querySelector('#modal .m-meta');if(!meta)return null;
    var old=meta.querySelector('.fn-detail-score-row');if(old)return old;
    Array.prototype.forEach.call(meta.children,function(x){x.style.display='none';});
    var row=document.createElement('div');row.className='fn-detail-score-row';
    row.innerHTML='<span class="fn-detail-score rt">ROTTEN TOMATOES: <b class="score-value" data-score="rt">-</b></span>'+
      '<span class="fn-detail-score mc">METACRITIC: <b class="score-value" data-score="mc">-</b></span>'+
      '<span class="fn-detail-score imdb">IMDb: <b class="score-value" data-score="imdb">-</b> <span data-score="votes"></span></span>';
    meta.appendChild(row);return row;
  }
  function setScore(row,key,val){var e=row&&row.querySelector('[data-score="'+key+'"]');if(e)e.textContent=(val==null||val==='')?'-':String(val);}
  async function loadScores(row){
    var id='';try{id=(typeof curImdb!=='undefined'&&curImdb)||'';}catch(e){}
    if(!id){setScore(row,'rt',null);setScore(row,'mc',null);setScore(row,'imdb',null);setScore(row,'votes','');return;}
    var data=null,keys=['f6dd47c8','564727fa','trilogy'];
    for(var i=0;i<keys.length&&!data;i++){
      try{var r=await fetch('https://www.omdbapi.com/?i='+encodeURIComponent(id)+'&apikey='+keys[i],{cache:'no-store'});if(r.ok){var x=await r.json();if(x&&x.Response==='True')data=x;}}catch(e){}
    }
    if(!data){setScore(row,'rt',null);setScore(row,'mc',null);setScore(row,'imdb',null);setScore(row,'votes','');return;}
    var rt=null;if(Array.isArray(data.Ratings)){var rr=data.Ratings.find(function(x){return x.Source==='Rotten Tomatoes';});if(rr&&rr.Value&&rr.Value!=='N/A')rt=rr.Value.replace(/\s/g,'');}
    var mc=(data.Metascore&&data.Metascore!=='N/A')?data.Metascore:null;
    var imdb=(data.imdbRating&&data.imdbRating!=='N/A')?data.imdbRating:null;
    setScore(row,'rt',rt);setScore(row,'mc',mc);setScore(row,'imdb',imdb);setScore(row,'votes',(data.imdbVotes&&data.imdbVotes!=='N/A')?' ('+data.imdbVotes+')':'');
  }
  function compactPlayDownload(){
    var label=document.getElementById('txt-hero-play'),play=label&&label.parentElement,group=play&&play.parentElement;
    if(group&&group.classList.contains('fn-play-download-group')){group.style.setProperty('display','flex','important');group.style.setProperty('flex-direction','row','important');}
  }
  function normalizeTitles(){
    var h=document.getElementById('d-title'),fa=document.getElementById('d-title-fa'),sec=document.getElementById('d-title-secondary'),d=detailData();
    if(!h)return;
    var faMode=(typeof LANG!=='undefined'&&LANG==='fa');
    var rawMain=String((typeof curTitle!=='undefined'&&curTitle)||'').replace(/\s*\([^)]*\)\s*$/,'').trim();
    var english=(window.__fnDetailEnglishTitle||'')||((d&&((d.title||d.name)))||rawMain);
    var native=(d&&((d.original_title||d.original_name)))||'';
    var translated=fa&&fa.textContent.trim()?fa.textContent.trim():'';
    var main=faMode?(english||rawMain):(rawMain||english);
    var second='';
    if(faMode){
      if(translated && translated!==main) second=translated;
      else if(native && native!==main && /[^A-Za-z0-9 .,!?&'’():\-]/.test(native)) second=native;
      else if(rawMain && rawMain!==main && /[^A-Za-z0-9 .,!?&'’():\-]/.test(rawMain)) second=rawMain;
    }else if(native && native!==main && /[^A-Za-z0-9 .,!?&'’():\-]/.test(native)) second=native;
    var y=titleYear(d||{});
    var e=document.createElement('span');e.textContent=main+(y?' ('+y+')':'');h.textContent='';h.appendChild(e);
    [fa,sec].forEach(function(x){if(x){x.style.fontSize=getComputedStyle(h).fontSize;x.style.color=getComputedStyle(h).color;x.style.fontWeight=getComputedStyle(h).fontWeight;x.style.lineHeight='1.2';x.style.margin='0';x.style.display='none';}});
    if(second&&sec){sec.textContent=second;sec.style.display='block';}
    if(fa)fa.style.display='none';
  }
  function moveWhereToWatch(){var w=document.getElementById('wtw-btn'),c=document.querySelector('#modal .cast-section');if(w&&c&&c.nextElementSibling!==w)c.insertAdjacentElement('afterend',w);}
  function apply(){
    putTitleYear(); normalizeTitles(); moveWhereToWatch();
    Array.prototype.forEach.call(document.querySelectorAll("#modal .additional-scores"),function(x){x.remove();});
    var row=scoreMarkup();
    if(row)loadScores(row);
    compactPlayDownload();
    /* Keep the pre-existing data-driven visibility; only change its placement. */
  }
  function resetDetailScroll(){
    try{
      /* Only reset the Open Details card; never move Home/category/tab scroll. */
      var modal=document.getElementById('modal');
      if(modal) modal.scrollTop=0;
    }catch(e){}
  }
  var oldOpen=window.openDetail;
  if(typeof oldOpen==='function'){
    window.openDetail=async function(){
      resetDetailScroll();
      var result=await oldOpen.apply(this,arguments);
      resetDetailScroll();
      setTimeout(resetDetailScroll,0);
      setTimeout(resetDetailScroll,120);
      setTimeout(apply,0);setTimeout(apply,450);return result;
    };
  }
  document.addEventListener('DOMContentLoaded',function(){setTimeout(apply,300);setInterval(function(){if(document.getElementById('modal')&&document.getElementById('modal').style.display!=='none'){normalizeTitles();moveWhereToWatch();compactPlayDownload();}},700);});
})();
