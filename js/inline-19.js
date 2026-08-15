
/* ===== targeted v41 Search category polish: fullscreen guard + strict director paging ===== */
(function(){
  'use strict';
  var targetIds=['generic-grid-page','companies-all-page','all-collections-page','collection-detail-page','company-works-page'];
  function guardAppFullscreen(){
    var app=document.getElementById('app-fs-btn');
    if(!app) return;
    var active=targetIds.some(function(id){ var el=document.getElementById(id); return el && getComputedStyle(el).display!=='none'; });
    app.style.visibility=active?'hidden':'';
    document.querySelectorAll('.fn-modal-fs-btn').forEach(function(x){ x.style.visibility=active?'hidden':''; });
  }
  var mo=new MutationObserver(guardAppFullscreen);
  targetIds.forEach(function(id){ var el=document.getElementById(id); if(el) mo.observe(el,{attributes:true,attributeFilter:['style','class']}); });
  guardAppFullscreen();

  var directorState={active:false,page:0,seen:new Set(),loading:false};
  function strictDirector(p){
    if(!p) return false;
    if(p.known_for_department==='Directing') return true;
    var crew=(p.combined_credits&&p.combined_credits.crew)||[];
    return crew.some(function(x){ return x && (x.job==='Director' || x.job==='Creator' || x.department==='Directing'); });
  }
  var DIRECTOR_SEED_IDS=[525,138,1032,488,240,7467,578,2710,137427,2636,21684,10930,5602,4762,5655,12453,1243,1152,9341,11401,223,16767,2045,11218,1776,1204,11614,608,10099,2303,3325,4483,1223,1769,1466,6773,8643,6548,8556,5363,9168,15217,108,3110,533,5953,8502,1532,4500,2700,2673,17710,10601,2226,664,14392,131291,8413,17825,5162,17831,21183,5658,17697,10828,4965,11482,9304,8836,183774,4765,12835,4774,45400,5606,3556,6088,2172,18055,7623,17832,1779];
  async function directorPopular(start,count){
    var fn=(typeof window.getDataEN==='function'?window.getDataEN:window.getData);
    if(typeof fn!=='function') return [];
    var jobs=[]; for(var i=0;i<count;i++) jobs.push(fn('person/popular?page='+(start+i)).catch(function(){return null;}));
    var detailJobs=DIRECTOR_SEED_IDS.slice((start-1)%DIRECTOR_SEED_IDS.length,((start-1)%DIRECTOR_SEED_IDS.length)+30).map(function(id){return fn('person/'+id).catch(function(){return null;});});
    var ds=await Promise.all(jobs), details=await Promise.all(detailJobs), out=[], ids=new Set();
    details.forEach(function(x){if(x&&x.id&&!ids.has(Number(x.id))&&strictDirector(x)){ids.add(Number(x.id));out.push(x);}});
    ds.forEach(function(d){ (d&&d.results||[]).forEach(function(x){ if(x&&x.id&&!ids.has(Number(x.id))&&strictDirector(x)){ids.add(Number(x.id));out.push(x);} }); });
    return out.sort(function(a,b){return Number(b.popularity||0)-Number(a.popularity||0)});
  }
  function directorSetup(title){
    var page=document.getElementById('generic-grid-page'); if(page) page.style.display='flex';
    var ttl=document.getElementById('gg-title'); if(ttl) ttl.innerText=title||((window.LANG==='fa')?'کارگردان‌های مطرح':'Major Directors');
    var c=document.getElementById('gg-content'); if(c){c.className='person-grid-container';c.innerHTML='';}
    var sort=document.getElementById('gg-sort-bar'); if(sort) sort.style.display='none';
    var bar=document.getElementById('gg-person-search-bar'); if(bar) bar.style.display='block';
    var inp=document.getElementById('gg-person-search-input'); if(inp){inp.value='';inp.placeholder=window.LANG==='fa'?'جستجوی کارگردان... نام فارسی یا انگلیسی':'Search directors...';}
    var more=document.getElementById('btn-more-g'); if(more){more.style.display='block';more.innerText=window.LANG==='fa'?'نمایش بیشتر':'Load More';}
  }
  async function directorLoad(append){
    if(!directorState.active||directorState.loading)return;
    directorState.loading=true;
    var c=document.getElementById('gg-content'), more=document.getElementById('btn-more-g');
    try{
      var list=await directorPopular(directorState.page*20+1,20);
      var html=[];
      list.forEach(function(p){var id=Number(p.id);if(directorState.seen.has(id))return;directorState.seen.add(id);if(typeof window.makePersonCard==='function')html.push(window.makePersonCard(p));});
      if(c&&html.length)c.insertAdjacentHTML('beforeend',html.join(''));
      if(more)more.style.display='block';
      directorState.page++;
    }finally{directorState.loading=false;}
  }
  var oldOpen=window.openGenericGrid;
  var oldMore=window.loadMoreGeneric;
  var directorSeen=new Set();
  function syncDirectorSeen(){
    directorSeen=new Set();
    var c=document.getElementById('gg-content');
    if(!c) return;
    c.querySelectorAll('[onclick]').forEach(function(el){
      var m=(el.getAttribute('onclick')||'').match(/(?:openPerson(?:Bio|Works)|openPersonDetail)\s*\(\s*(\d+)/);
      if(m) directorSeen.add(Number(m[1]));
    });
  }
  function cardFor(p){
    if(typeof window.makePersonCard==='function') return window.makePersonCard(p);
    if(typeof makePersonCard==='function') return makePersonCard(p);
    return '';
  }
  async function directorMore(){
    var c=document.getElementById('gg-content'), btn=document.getElementById('btn-more-g');
    if(!c || window.__directorLoading) return;
    window.__directorLoading=true;
    if(btn){ btn.style.opacity='.65'; btn.setAttribute('aria-busy','true'); }
    syncDirectorSeen();
    var page=Number(window.genericPage||1)+1;
    var start=(page-2)*12+1;
    try{
      var jobs=[];
      for(var i=0;i<20;i++) jobs.push((typeof getDataEN==='function'?getDataEN:getData)('person/popular?page='+(start+i)).catch(function(){return null;}));
      var pages=await Promise.all(jobs), raw=[];
      pages.forEach(function(d){ if(d&&d.results) raw=raw.concat(d.results); });
      var candidates=raw.filter(function(p){ return p && p.profile_path && p.known_for_department==='Directing' && !directorSeen.has(Number(p.id)); });
      var unique=[], ids=new Set();
      candidates.forEach(function(p){ if(!ids.has(Number(p.id))){ids.add(Number(p.id));unique.push(p);} });
      unique.sort(function(a,b){ return Number(b.popularity||0)-Number(a.popularity||0); });
      var added=0;
      unique.slice(0,24).forEach(function(p){
        var html=cardFor(p);
        if(html){ c.insertAdjacentHTML('beforeend',html); directorSeen.add(Number(p.id)); added++; }
      });
      window.genericPage=page;
      if(!added && btn) btn.style.display='none';
    }finally{
      window.__directorLoading=false;
      if(btn){ btn.style.opacity=''; btn.removeAttribute('aria-busy'); }
    }
  }
  window.openGenericGrid=function(type,q,title){
    if(type==='director_list'){
      directorState={active:true,page:0,seen:new Set(),loading:false};
      window.genericType='director_list'; window.genericPage=1; directorSetup(title); directorLoad(false); return;
    }
    directorState.active=false;
    return oldOpen?oldOpen.apply(this,arguments):undefined;
  };
  window.loadMoreGeneric=function(){
    if(window.genericType==='director_list'&&directorState.active) return directorLoad(true);
    return oldMore?oldMore.apply(this,arguments):undefined;
  };
})();
