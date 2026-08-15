
(function(){
  if(window.__FN_EXACT_AI_FINAL__) return; window.__FN_EXACT_AI_FINAL__=true;
  var S={id:null,type:null,token:0,rich:null,ready:null,answerCache:new Map()};
  function el(id){return document.getElementById(id)}
  function clean(v){return String(v==null?'':v).replace(/\s+/g,' ').trim()}
  function fa(){return typeof LANG!=='undefined'&&LANG==='fa'}
  function esc(v){return String(v==null?'':v).replace(/[&<>\"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]})}
  function titleFromModal(){return clean((el('d-title')||{}).textContent||'')||clean((el('d-title-secondary')||{}).textContent||'')||'این اثر'}
  function yearFromModal(){return clean((el('d-year')||{}).textContent||'')}
  function clearUI(){if(typeof aiConversation!=='undefined')aiConversation=[];if(typeof aiIsThinking!=='undefined')aiIsThinking=false;['ai-chat-area','ai-fs-chat'].forEach(function(id){var x=el(id);if(x)x.innerHTML='<div class="ai-msg-bot">'+(fa()?'در حال آماده‌سازی دستیار همین اثر…':'Preparing this title assistant…')+'</div>'});['ai-quick-btns','ai-fs-quick-btns'].forEach(function(id){var x=el(id);if(x){x.innerHTML='';x.setAttribute('data-exact-ai','')}})}
  function initExact(r){if(!r||String(r.tmdbId)!==String(S.id))return;S.rich=r;S.answerCache=new Map();aiCurrentTitle=r.originalTitle||r.title;aiCurrentType=r.mediaType;aiRichData=r;aiConversation=[];aiIsThinking=false;var ctx=aiCurrentTitle+(r.year?' ('+r.year+')':'');var lab=el('ai-box-label');if(lab)lab.textContent=fa()?'دستیار AI · «'+ctx+'»':'AI · "'+ctx+'"';var badge=el('ai-context-badge');if(badge){badge.innerHTML='<span style="color:#4285f4;font-weight:700">🎬 '+esc(ctx)+'</span>';badge.style.display='block'}var welcome=fa()?'سلام! این دستیار فقط درباره «'+esc(ctx)+'» پاسخ می‌دهد. هر سؤالی داری بپرس.':'Hi! This assistant is locked to "'+esc(ctx)+'". Ask anything about this exact title.';['ai-chat-area','ai-fs-chat'].forEach(function(id){var x=el(id);if(x)x.innerHTML='<div class="ai-msg-bot">'+welcome+'</div>'});var qs=fa()?['خلاصه داستان بدون اسپویل','نقاط قوت و ضعف چیست؟','بازیگران و شخصیت‌های مهم را تحلیل کن','پایان را با اسپویل توضیح بده','فکت‌های مطمئن درباره اثر','آثار مشابه معرفی کن']:['Summarize it without spoilers','What are its strengths and weaknesses?','Analyze the main cast and characters','Explain the ending with spoilers','Give confirmed facts about it','Recommend similar titles'];var html=qs.map(function(q){return '<div class="ai-quick-btn" data-question="'+esc(q).replace(/'/g,'&#39;')+'" onclick="askQuick(this.dataset.question)">'+esc(q)+'</div>'}).join('');['ai-quick-btns','ai-fs-quick-btns'].forEach(function(id){var x=el(id);if(x){x.innerHTML=html;x.style.display='flex';x.setAttribute('data-exact-ai',String(r.tmdbId)+'|'+r.year)}});['ai-input','ai-fs-input'].forEach(function(id){var x=el(id);if(x)x.placeholder=fa()?'سؤالت را درباره همین اثر بپرس…':'Ask about this exact title…'})}
  async function loadExact(id,type,token){try{var d=await getData(type+'/'+id+'?append_to_response=external_ids'),en=await getDataEN(type+'/'+id+'?append_to_response=external_ids'),cr=await getData(type+'/'+id+'/credits'),kw=await getData(type+'/'+id+'/keywords');if(token!==S.token||String(id)!==String(S.id))return;var base=en&&en.id?en:d||{},local=d||{},people=(cr&&cr.cast||[]).slice(0,12).map(function(x){return x.name}).filter(Boolean).join(', '),dirs=(cr&&cr.crew||[]).filter(function(x){return x.job==='Director'||x.department==='Directing'}).slice(0,5).map(function(x){return x.name}).filter(Boolean).join(', '),keywords=(kw&&(kw.keywords||kw.results)||[]).slice(0,20).map(function(x){return x.name}).filter(Boolean).join(', ');var r={tmdbId:id,mediaType:type,originalTitle:clean(base.title||base.name||local.original_title||local.original_name||titleFromModal()),year:clean(((base.release_date||base.first_air_date||local.release_date||local.first_air_date||'').split('-')[0]))||yearFromModal(),overview:clean(base.overview||local.overview||''),overviewFa:clean(local.overview||''),genres:(local.genres||base.genres||[]).map(function(x){return x.name}).join(', '),cast:people,directors:dirs,rating:base.vote_average||local.vote_average||'',runtime:base.runtime?base.runtime+' min':(base.number_of_seasons?base.number_of_seasons+' seasons':''),countries:(base.production_countries||[]).map(function(x){return x.name}).join(', '),keywords:keywords,imdbId:(base.external_ids&&base.external_ids.imdb_id)||(local.external_ids&&local.external_ids.imdb_id)||''};if(token===S.token)initExact(r)}catch(e){if(token===S.token)initExact({tmdbId:id,mediaType:type,originalTitle:titleFromModal(),year:yearFromModal(),overview:clean((el('d-desc')||{}).textContent||''),overviewFa:clean((el('d-desc')||{}).textContent||''),genres:'',cast:'',directors:'',rating:'',runtime:'',keywords:''})}}
  function installOpen(){var oldOpen=window.openDetail;if(typeof oldOpen!=='function'||oldOpen.__fnExactWrap)return;if(oldOpen===window.__fnExactOriginal)return;var wrapped=async function(id,type){type=type||'movie';if(type==='person_works')return oldOpen.apply(this,arguments);S.id=id;S.type=type;S.token++;S.answerCache=new Map();var t=S.token;clearUI();var out=await oldOpen.apply(this,arguments);if(t===S.token){S.ready=loadExact(id,type,t);S.ready.catch(function(){});}return out};wrapped.__fnExactWrap=true;window.__fnExactOriginal=oldOpen;try{openDetail=wrapped}catch(e){}window.openDetail=wrapped} installOpen();setTimeout(installOpen,0);setTimeout(installOpen,500);setTimeout(installOpen,1500);
  var oldInit=window.initAIBox;window.initAIBox=function(title,type,year,rich){if(S.id!=null&&rich&&rich.tmdbId!=null&&String(rich.tmdbId)!==String(S.id))return;if(S.id!=null&&(!rich||rich.tmdbId==null))return;return oldInit&&oldInit.apply(this,arguments)};
  function facts(){var r=S.rich||{};return ['Exact title: '+r.originalTitle,'Year: '+r.year,'Type: '+(r.mediaType==='tv'?'TV series':'movie'),'TMDB ID: '+r.tmdbId,r.imdbId?'IMDb ID: '+r.imdbId:'','Genres: '+r.genres,'Director(s): '+r.directors,'Main cast: '+r.cast,'Runtime/seasons: '+r.runtime,'Rating: '+r.rating+'/10','Keywords: '+r.keywords,'Official synopsis: '+(r.overview||'not available')].filter(Boolean).join('\n')}
  function local(q){var r=S.rich||{},x=String(q||'').toLowerCase(),t=r.originalTitle||titleFromModal(),ov=fa()?(r.overviewFa||r.overview):r.overview,head=fa()?'درباره «'+esc(t)+'»':'About "'+esc(t)+'"';
    if(/خلاصه|داستان|summary|story|plot/.test(x)){var fallback=fa()?'خلاصهٔ کامل در منبع فعلی نمایش داده نشده، اما می‌توانم این اثر را از روی داده‌های واقعی آن تحلیل کنم. سال: '+(r.year||'نامشخص')+'؛ ژانر: '+(r.genres||'ثبت‌نشده')+'؛ امتیاز: '+(r.rating||'ثبت‌نشده')+'.':'The source does not expose a complete synopsis here, but I can still analyze this title from its verified metadata. Year: '+(r.year||'unknown')+'; genre: '+(r.genres||'not listed')+'; rating: '+(r.rating||'not listed')+'.';return '<strong>'+head+'</strong><br><br>'+esc(ov||fallback)+(r.cast?'<br><br><strong>'+(fa()?'بازیگران:':'Cast:')+'</strong> '+esc(r.cast):'')}
    if(/بازیگر|شخصیت|cast|character/.test(x))return '<strong>'+(fa()?'بازیگران و شخصیت‌ها:':'Cast and characters:')+'</strong><br>'+esc(r.cast||(fa()?'فهرست بازیگران در دادهٔ فعلی کامل نیست؛ امتیاز و ژانر اثر: ':'The cast list is incomplete in the current data; the title metadata is: ')+(r.genres||'not listed')+' · '+(r.rating||'not listed'));
    if(/فکت|fact|trivia/.test(x))return '<strong>'+(fa()?'فکت‌های تأییدشده:':'Confirmed facts:')+'</strong><br>• '+esc(t)+'<br>• '+esc(r.year||'Unknown')+'<br>• '+esc(r.genres||'Unknown')+'<br>• TMDB: '+esc(r.tmdbId);
    return '<strong>'+head+'</strong><br><br>'+esc(ov||(fa()?'دادهٔ قابل استفادهٔ این اثر: سال '+(r.year||'نامشخص')+'، ژانر '+(r.genres||'ثبت‌نشده')+' و امتیاز '+(r.rating||'ثبت‌نشده')+'. بر اساس همین اطلاعات، می‌توانم دربارهٔ حال‌وهوا، ارزش تماشا و آثار مشابه راهنمایی بدهم.':'Useful available metadata for this title: year '+(r.year||'unknown')+', genre '+(r.genres||'not listed')+', rating '+(r.rating||'not listed')+'. I can use this to discuss its tone, viewing value, and similar titles.'))}
  async function exactAsk(q){q=clean(q);if(!q)return fa()?'لطفاً سؤالت را بنویس.':'Please type a question.';if(S.ready){try{await Promise.race([S.ready,new Promise(function(resolve){setTimeout(resolve,9000)})])}catch(e){}}if(!S.id)return local(q);var key=String(S.id)+'|'+(fa()?'fa':'en')+'|'+q.toLowerCase();if(S.answerCache.has(key))return S.answerCache.get(key);var r=S.rich||{tmdbId:S.id,mediaType:S.type,originalTitle:titleFromModal(),year:yearFromModal(),overview:clean((el('d-desc')||{}).textContent||'')};var sys=(fa()?'تو دستیار تخصصی سینما هستی. به هر سؤال کاربر پاسخ بده و هیچ‌وقت بی‌پاسخ نگذار. فقط درباره همین اثر دقیق صحبت کن. پاسخ کاملاً فارسی، مفید و روشن باشد. از اطلاعات رسمی زیر استفاده کن؛ اگر جزئیات قطعی نیست صادقانه بگو و هرگز داستان یا فکت نساز. برای سؤال نامرتبط هم کوتاه پاسخ بده و ارتباطش را با این اثر توضیح بده.':'You are a specialized cinema assistant. Always provide a useful answer; never leave the user without a reply. Discuss only this exact title. Answer in clear English using the verified data below. If a detail is unavailable, say so instead of inventing it; for unrelated questions, briefly answer and explain the connection to this title.')+'\n\n'+facts()+'\n\nUser question: '+q;try{var out=await _aiGenerateText(sys,{model:'openai-large',maxTokens:1100,temperature:.2,timeout:26000});out=clean(out);if(out&&out.length>8&&(!fa()||/[\u0600-\u06FF]/.test(out))&&(fa()||!/[\u0600-\u06FF]/.test(out))){S.answerCache.set(key,out);return out}}catch(e){}var ans=local(q);if(!ans||clean(ans).length<8)ans=fa()?'برای «'+esc(r.originalTitle||titleFromModal())+'» اطلاعات رسمی بیشتری برای این سؤال در دسترس نیست، اما سؤال بی‌پاسخ نمی‌ماند: می‌توانم خلاصه، بازیگران، ژانر، امتیاز، نقد یا آثار مشابه این اثر را بررسی کنم.':'I could not retrieve a verified detail for this question about «'+esc(r.originalTitle||titleFromModal())+'», but I can still give a useful title-specific answer from the available metadata: year '+esc(r.year||'unknown')+', genre '+esc(r.genres||'not listed')+', rating '+esc(r.rating||'not listed')+'. Ask me about its plot, cast, tone, rating, or similar titles.';S.answerCache.set(key,ans);return ans}
  window.processAI=processAI=async function(q){if(aiIsThinking)return;aiIsThinking=true;var b1=el('ai-send-btn'),b2=el('ai-fs-send-btn');if(b1)b1.disabled=true;if(b2)b2.disabled=true;addMsgToUI('user',q);showThinking();var ans=await exactAsk(q);removeThinking();if(typeof aiConversation!=='undefined'){aiConversation.push({role:'user',content:q},{role:'assistant',content:ans});if(aiConversation.length>12)aiConversation=aiConversation.slice(-12)}addMsgToUI('bot',ans);aiIsThinking=false;if(b1)b1.disabled=false;if(b2)b2.disabled=false};window.askQuick=askQuick=async function(q){if(!aiIsThinking)await processAI(q)};
})();


/* --- original inline script boundary --- */

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


/* --- original inline script boundary --- */

(function(){'use strict';
/* Live TV data v5: retain the existing category/language coverage and add the
   country/category index playlists plus explicit Iran/Persian sources. All
   records are parsed locally, validated, merged, and cached. */
var sources={
  sports:'https://iptv-org.github.io/iptv/categories/sports.m3u',movies:'https://iptv-org.github.io/iptv/categories/movies.m3u',series:'https://iptv-org.github.io/iptv/categories/series.m3u',fas:'https://iptv-org.github.io/iptv/languages/fas.m3u',eng:'https://iptv-org.github.io/iptv/languages/eng.m3u',news:'https://iptv-org.github.io/iptv/categories/news.m3u',music:'https://iptv-org.github.io/iptv/categories/music.m3u',ir:'https://iptv-org.github.io/iptv/countries/ir.m3u',ara:'https://iptv-org.github.io/iptv/languages/ara.m3u',spa:'https://iptv-org.github.io/iptv/languages/spa.m3u',fra:'https://iptv-org.github.io/iptv/languages/fra.m3u',tur:'https://iptv-org.github.io/iptv/languages/tur.m3u',hin:'https://iptv-org.github.io/iptv/languages/hin.m3u',urd:'https://iptv-org.github.io/iptv/languages/urd.m3u',rus:'https://iptv-org.github.io/iptv/languages/rus.m3u',deu:'https://iptv-org.github.io/iptv/languages/deu.m3u',ita:'https://iptv-org.github.io/iptv/languages/ita.m3u',por:'https://iptv-org.github.io/iptv/languages/por.m3u',zho:'https://iptv-org.github.io/iptv/languages/zho.m3u',jpn:'https://iptv-org.github.io/iptv/languages/jpn.m3u',kor:'https://iptv-org.github.io/iptv/languages/kor.m3u',nld:'https://iptv-org.github.io/iptv/languages/nld.m3u',swe:'https://iptv-org.github.io/iptv/languages/swe.m3u',heb:'https://iptv-org.github.io/iptv/languages/heb.m3u',pol:'https://iptv-org.github.io/iptv/languages/pol.m3u',ukr:'https://iptv-org.github.io/iptv/languages/ukr.m3u',ind:'https://iptv-org.github.io/iptv/languages/ind.m3u',vie:'https://iptv-org.github.io/iptv/languages/vie.m3u',tha:'https://iptv-org.github.io/iptv/languages/tha.m3u',country:'https://iptv-org.github.io/iptv/index.country.m3u',category:'https://iptv-org.github.io/iptv/index.category.m3u',freeTv:'https://raw.githubusercontent.com/Free-TV/IPTV/master/playlist.m3u8'
};
var sourceLangs={fas:'fas',eng:'eng',ara:'ara',spa:'spa',fra:'fra',tur:'tur',hin:'hin',urd:'urd',rus:'rus',deu:'deu',ita:'ita',por:'por',zho:'zho',jpn:'jpn',kor:'kor',nld:'nld',swe:'swe',heb:'heb',pol:'pol',ukr:'ukr',ind:'ind',vie:'vie',tha:'tha'};
var topicLabels={
  animation:['انیمیشن','Animation'],auto:['خودرو','Auto'],business:['کسب‌وکار','Business'],classic:['کلاسیک','Classic'],comedy:['کمدی','Comedy'],cooking:['آشپزی','Cooking'],culture:['فرهنگ','Culture'],documentary:['مستند','Documentary'],education:['آموزشی','Education'],entertainment:['سرگرمی','Entertainment'],family:['خانوادگی','Family'],football:['فوتبال','Football'],general:['عمومی','General'],kids:['کودک','Kids'],legislative:['قانون‌گذاری','Legislative'],lifestyle:['سبک زندگی','Lifestyle'],movies:['فیلم','Movies'],music:['موسیقی','Music'],news:['اخبار','News'],outdoor:['فضای باز','Outdoor'],public:['عمومی','Public'],religious:['مذهبی','Religious'],science:['علم','Science'],series:['سریال','Series'],shop:['خرید','Shop'],sports:['ورزش','Sports'],travel:['سفر','Travel'],weather:['هواشناسی','Weather'],interactive:['تعاملی','Interactive'],relax:['آرامش','Relax']
};
var countryAliases={"Afghanistan":"AF","Albania":"AL","Algeria":"DZ","Andorra":"AD","Angola":"AO","Antigua and Barbuda":"AG","Argentina":"AR","Armenia":"AM","Aruba":"AW","Australia":"AU","Austria":"AT","Azerbaijan":"AZ","Bahamas":"BS","Bahrain":"BH","Bangladesh":"BD","Barbados":"BB","Belarus":"BY","Belgium":"BE","Belize":"BZ","Benin":"BJ","Bolivia":"BO","Bonaire":"BQ","Bosnia and Herzegovina":"BA","Brazil":"BR","British Virgin Islands":"VG","Brunei":"BN","Bulgaria":"BG","Burkina Faso":"BF","Cambodia":"KH","Cameroon":"CM","Canada":"CA","Cape Verde":"CV","Chad":"TD","Chile":"CL","China":"CN","Colombia":"CO","Comoros":"KM","Costa Rica":"CR","Croatia":"HR","Cuba":"CU","Curacao":"CW","Cyprus":"CY","Czech Republic":"CZ","Democratic Republic of the Congo":"CD","Denmark":"DK","Dominican Republic":"DO","Ecuador":"EC","Egypt":"EG","El Salvador":"SV","Equatorial Guinea":"GQ","Eritrea":"ER","Estonia":"EE","Ethiopia":"ET","Finland":"FI","France":"FR","French Guiana":"GF","French Polynesia":"PF","Gambia":"GM","Georgia":"GE","Germany":"DE","Ghana":"GH","Greece":"GR","Guadeloupe":"GP","Guam":"GU","Guatemala":"GT","Guernsey":"GG","Guinea":"GN","Guyana":"GY","Haiti":"HT","Honduras":"HN","Hong Kong":"HK","Hungary":"HU","Iceland":"IS","India":"IN","Indonesia":"ID","Iran":"IR","Iraq":"IQ","Ireland":"IE","Israel":"IL","Italy":"IT","Ivory Coast":"CI","Jamaica":"JM","Japan":"JP","Jordan":"JO","Kazakhstan":"KZ","Kenya":"KE","Kosovo":"XK","Kuwait":"KW","Kyrgyzstan":"KG","Laos":"LA","Latvia":"LV","Lebanon":"LB","Libya":"LY","Liechtenstein":"LI","Lithuania":"LT","Luxembourg":"LU","Macao":"MO","Madagascar":"MG","Malaysia":"MY","Maldives":"MV","Mali":"ML","Malta":"MT","Martinique":"MQ","Mauritania":"MR","Mauritius":"MU","Mexico":"MX","Moldova":"MD","Monaco":"MC","Mongolia":"MN","Montenegro":"ME","Morocco":"MA","Mozambique":"MZ","Myanmar":"MM","Namibia":"NA","Nepal":"NP","Netherlands":"NL","New Zealand":"NZ","Nicaragua":"NI","Niger":"NE","Nigeria":"NG","North Korea":"KP","North Macedonia":"MK","Norway":"NO","Oman":"OM","Pakistan":"PK","Palestine":"PS","Panama":"PA","Papua New Guinea":"PG","Paraguay":"PY","Peru":"PE","Philippines":"PH","Poland":"PL","Portugal":"PT","Puerto Rico":"PR","Qatar":"QA","Republic of the Congo":"CG","Reunion":"RE","Romania":"RO","Russia":"RU","Rwanda":"RW","Saint Kitts and Nevis":"KN","Saint Lucia":"LC","Saint Vincent and the Grenadines":"VC","Samoa":"WS","San Marino":"SM","Saudi Arabia":"SA","Senegal":"SN","Serbia":"RS","Sierra Leone":"SL","Singapore":"SG","Sint Maarten":"SX","Slovakia":"SK","Slovenia":"SI","Somalia":"SO","South Africa":"ZA","South Korea":"KR","Spain":"ES","Sri Lanka":"LK","Sudan":"SD","Suriname":"SR","Sweden":"SE","Switzerland":"CH","Syria":"SY","Taiwan":"TW","Tajikistan":"TJ","Tanzania":"TZ","Thailand":"TH","Togo":"TG","Trinidad and Tobago":"TT","Tunisia":"TN","Turkiye":"TR","Turkey":"TR","Turkmenistan":"TM","Uganda":"UG","Ukraine":"UA","United Arab Emirates":"AE","United Kingdom":"GB","United States":"US","Uruguay":"UY","Uzbekistan":"UZ","Vatican City":"VA","Venezuela":"VE","Vietnam":"VN","Western Sahara":"EH","Yemen":"YE","Zimbabwe":"ZW"};
var languageLabels={fas:['فارسی','Persian'],eng:['انگلیسی','English'],ara:['عربی','Arabic'],rus:['روسی','Russian'],tur:['ترکی','Turkish'],spa:['اسپانیایی','Spanish'],fra:['فرانسوی','French'],deu:['آلمانی','German'],ita:['ایتالیایی','Italian'],por:['پرتغالی','Portuguese'],hin:['هندی','Hindi'],urd:['اردو','Urdu'],chi:['چینی','Chinese'],zho:['چینی','Chinese'],jpn:['ژاپنی','Japanese'],kor:['کره‌ای','Korean'],pol:['لهستانی','Polish'],nld:['هلندی','Dutch'],swe:['سوئدی','Swedish'],ukr:['اوکراینی','Ukrainian'],heb:['عبری','Hebrew'],gre:['یونانی','Greek'],ind:['اندونزیایی','Indonesian'],msa:['مالایی','Malay'],vie:['ویتنامی','Vietnamese'],tha:['تایلندی','Thai']};
var failedKey='fn_live_failed_channels_v1',failed={};try{failed=JSON.parse(localStorage.getItem(failedKey)||'{}')||{}}catch(e){};
var state={all:[],filtered:[],page:0,size:48,loaded:false,loading:false,player:null,hls:null,raw:0,dupes:0,added:0,healthReady:true,topicCounts:{},cacheOptions:null,loadPromise:null};
var LIVE_CACHE_SCHEMA=4,liveSourceSignature=Object.keys(sources).sort().map(function(k){return k+'='+sources[k]}).join('|');
var liveCacheKey='fn_live_channels_cache_v3',favorites={};try{favorites=JSON.parse(localStorage.getItem('fn_live_favorites_v2')||'{}')||{}}catch(e){};
function fa(){return typeof LANG==='undefined'||LANG==='fa'} function tx(a,b){return fa()?a:b} function esc(x){var d=document.createElement('div');d.textContent=String(x==null?'':x);return d.innerHTML}
function norm(x){return String(x||'').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^\p{L}\p{N}]+/gu,' ').trim().replace(/\s+/g,' ')}
function countryCode(x){var s=String(x||'').split(/[;,|]/)[0].trim();if(!s||/^(undefined|international)$/i.test(s))return '';if(/^[A-Za-z]{2}$/.test(s))return s.toUpperCase();return countryAliases[s]||countryAliases[Object.keys(countryAliases).find(function(k){return k.toLowerCase()===s.toLowerCase()})]||''}
function idCountry(id){var m=String(id||'').match(/\.([A-Za-z]{2})(?:@|$)/);return m?m[1].toUpperCase():''}
function countryName(code){var c=String(code||'').toUpperCase();if(!c)return tx('کشور نامشخص','Unknown country');try{return new Intl.DisplayNames([fa()?'fa':'en'],{type:'region'}).of(c)||c}catch(e){return c}}
function countryFlag(code){var c=String(code||'').toUpperCase();return c==='IR'?'https://flagofiran.com/files/Flag_of_Iran.svg':(c.length===2?'https://flagcdn.com/w40/'+c.toLowerCase()+'.png':'')}
function languageName(code){var k=String(code||'').toLowerCase();return languageLabels[k]?tx(languageLabels[k][0],languageLabels[k][1]):(code||tx('زبان نامشخص','Unknown language'))}
function flagEmoji(code){var c=String(code||'').toUpperCase();return c.length===2?String.fromCodePoint.apply(String,[...c].map(function(x){return 127397+x.charCodeAt(0)})):'🌐'}
function validUrl(u){try{var z=new URL(String(u||''));return (z.protocol==='http:'||z.protocol==='https:')&&!!z.hostname}catch(e){return false}}
function languageCode(x){var s=norm(x).replace(/\s+/g,''),map={en:'eng',eng:'eng',english:'eng',fa:'fas',fas:'fas',farsi:'fas',persian:'fas',ir:'fas',iran:'fas',ar:'ara',ara:'ara',arabic:'ara',es:'spa',spa:'spa',spanish:'spa',fr:'fra',fra:'fra',french:'fra',de:'deu',deu:'deu',german:'deu',it:'ita',ita:'ita',italian:'ita',pt:'por',por:'por',portuguese:'por',ru:'rus',rus:'rus',russian:'rus',tr:'tur',tur:'tur',turkish:'tur',hi:'hin',hin:'hin',hindi:'hin',ur:'urd',urd:'urd',zh:'zho',zho:'zho',chi:'zho',chinese:'zho',ja:'jpn',jpn:'jpn',japanese:'jpn',ko:'kor',kor:'kor',korean:'kor',nl:'nld',nld:'nld',dutch:'nld',sv:'swe',swe:'swe',he:'heb',heb:'heb',pl:'pol',pol:'pol',uk:'ukr',ukr:'ukr',ind:'ind',id:'ind',vietnamese:'vie',vie:'vie',thai:'tha',tha:'tha'};return map[s]||String(x||'').trim().toLowerCase()}
function parse(text,source){var lines=String(text||'').split(/\r?\n/),out=[],cur=null,pendingGroup='';for(var i=0;i<lines.length;i++){var l=lines[i].trim();if(l.indexOf('#EXTINF:')===0){var attrs={},m,re=/([\w-]+)=(?:"([^"]*)"|'([^']*)')/g;while((m=re.exec(l))!==null)attrs[m[1]]=m[2]!==undefined?m[2]:m[3];var comma=-1,quote='';for(var ci=0;ci<l.length;ci++){var ch=l.charAt(ci);if(ch==='"'||ch==="'"){quote=quote?(quote===ch?'':quote):ch}else if(ch===','&&!quote){comma=ci;break}}var group=String(attrs['group-title']||pendingGroup||'').trim(),topic=String(attrs['tvg-topic']||attrs.topic||attrs.category||attrs['content-type']||'').trim(),groups=group.split(/[;,|]/).map(function(v){return v.trim()}).filter(Boolean);pendingGroup='';cur={id:attrs['tvg-id']||'',logo:attrs['tvg-logo']||'',group:group,name:comma>-1?l.slice(comma+1).trim():(attrs['tvg-name']||attrs['tvg-id']||''),country:countryCode(String(attrs['tvg-country']||attrs.country||'').split(/[;,|]/)[0]),language:languageCode(String(attrs['tvg-language']||attrs.language||'').split(/[;,|]/)[0]),topic:topic,url:'',groups:groups,topics:topic?groups.concat([topic]):groups.slice(),sources:[source],source:source};if(source==='ir')cur.country='IR';if(sourceLangs[source])cur.language=sourceLangs[source];if(source==='country')cur.country=countryCode(group)||idCountry(cur.id);if(!cur.country)cur.country=idCountry(cur.id)}else if(l.indexOf('#EXTGRP:')===0){pendingGroup=l.slice(8).trim();if(cur&&!cur.url){cur.group=pendingGroup;cur.groups=pendingGroup?[pendingGroup]:[]}}else if(cur&&validUrl(l)){cur.url=l.split('#')[0];if(validUrl(cur.url)){out.push(cur);cur=null}}}return out}
function aliases(x){var a=[];if(x.id)a.push('i:'+norm(x.id));if(x.url)a.push('u:'+String(x.url).split('#')[0].trim().toLowerCase());var n=norm(x.name);if(n)a.push('n:'+n);return a}
function merge(rows){var buckets=[],parents=[],byAlias={};function root(i){while(parents[i]!==i){parents[i]=parents[parents[i]];i=parents[i]}return i}function absorb(y,x){if(!y||!x)return;['id','url','name','logo','country','language','group','topic'].forEach(function(k){if(!y[k]&&x[k])y[k]=x[k]});if(x.source==='category'&&x.group)y.group=x.group;['groups','sources','topics'].forEach(function(k){if(!Array.isArray(y[k]))y[k]=[];(x[k]||[]).forEach(function(v){if(v&&y[k].indexOf(v)<0)y[k].push(v)})});aliases(y).concat(aliases(x)).forEach(function(a){byAlias[a]=y._index})}rows.forEach(function(x){if(!x||!validUrl(x.url)||!String(x.name||'').trim())return;var matches=[];aliases(x).forEach(function(a){if(byAlias[a]!==undefined){var r=root(byAlias[a]);if(matches.indexOf(r)<0)matches.push(r)}});var ix=matches.length?matches[0]:buckets.length;if(!matches.length){buckets.push({id:x.id||'',logo:x.logo||'',group:x.group||'',name:x.name||'',country:x.country||'',language:x.language||'',topic:x.topic||'',url:x.url,groups:(x.groups||[]).slice(),sources:(x.sources||[]).slice(),topics:(x.topics||[]).slice(),source:x.source||'',_index:ix});parents.push(ix)}else{matches.slice(1).forEach(function(j){absorb(buckets[ix],buckets[j]);parents[j]=ix});absorb(buckets[ix],x)}aliases(buckets[ix]).concat(aliases(x)).forEach(function(a){byAlias[a]=ix})});var result=[];buckets.forEach(function(x,i){if(root(i)===i&&validUrl(x.url)&&x.name)result.push(x)});result.forEach(function(x){x.country=(x.country||idCountry(x.id)||'').toUpperCase();x.language=String(x.language||'').toLowerCase();x.topics=deriveTopics(x)});return result}
function topicKey(g){var k=norm(g).replace(/\s+/g,'');var map={animation:'animation',animations:'animation',auto:'auto',automotive:'auto',business:'business',classic:'classic',comedy:'comedy',cooking:'cooking',culture:'culture',documentary:'documentary',documentaries:'documentary',education:'education',educational:'education',entertainment:'entertainment',family:'family',football:'football',soccer:'football',futbol:'football',general:'general',kids:'kids',children:'kids',childrens:'kids',legislative:'legislative',lifestyle:'lifestyle',movies:'movies',movie:'movies',music:'music',news:'news',outdoor:'outdoor',public:'public',religious:'religious',science:'science',series:'series',shop:'shop',shopping:'shop',sports:'sports',travel:'travel',weather:'weather',interactive:'interactive',relax:'relax'};return map[k]||''}
function deriveTopics(x){var out=[];[].concat(x.topics||[],x.topic||[],x.groups||[],x.group||[]).forEach(function(g){String(g||'').split(/[;,|]/).forEach(function(v){var k=topicKey(v);if(k&&out.indexOf(k)<0)out.push(k)})});if(/football|soccer|futbol|\u0641\u0648\u062a\u0628\u0627\u0644/i.test(String(x.name||''))&&out.indexOf('football')<0)out.push('football');return out}
function finalizeTopics(){var c={};state.all.forEach(function(x){x.topics=deriveTopics(x);x.topics.forEach(function(k){c[k]=(c[k]||0)+1})});state.topicCounts=c}
function topicLabel(k){return topicLabels[k]||[k,k.charAt(0).toUpperCase()+k.slice(1)]}
function setSelect(id,items){var s=document.getElementById(id);if(!s)return;var old=s.value;s.innerHTML='';items.forEach(function(x){var o=document.createElement('option');o.value=x[0];o.textContent=x[1];s.appendChild(o)});if(items.some(function(x){return x[0]===old}))s.value=old;else if(items.length)s.value=items[0][0];s.dispatchEvent(new Event('change',{bubbles:false}))}
function setup(){setSelect('fn-live-topic',[['all',tx('همه موضوع‌ها','All topics')]]);setSelect('fn-live-sort',[['name',tx('مرتب‌سازی: نام','Sort: Name')],['country',tx('مرتب‌سازی: کشور','Sort: Country')]]);setSelect('fn-live-language',[['all',tx('🌐 همه زبان‌ها','🌐 All Languages')]]);setSelect('fn-live-country',[['all',tx('🌐 همه کشورها','🌐 All Countries')]])}
function liveBuildFilters(cached){var ts=[['all',tx('همه موضوع‌ها','All topics')]],ls=[['all',tx('🌐 همه زبان‌ها','🌐 All Languages')]],cs=[['all',tx('🌐 همه کشورها','🌐 All Countries')]],o=cached||{};var topicKeys=Object.keys(state.topicCounts).filter(function(k){return state.topicCounts[k]>0});(Array.isArray(o.topics)?o.topics:[]).forEach(function(k){if(topicKeys.indexOf(k)<0&&topicLabels[k])topicKeys.push(k)});topicKeys.sort(function(a,b){return topicLabel(a)[1].localeCompare(topicLabel(b)[1])}).forEach(function(k){ts.push([k,tx(topicLabel(k)[0],topicLabel(k)[1])])});var langKeys=Array.from(new Set(state.all.map(function(x){return x.language}).filter(Boolean)));(Array.isArray(o.languages)?o.languages:[]).forEach(function(k){if(langKeys.indexOf(k)<0)langKeys.push(k)});langKeys.sort().forEach(function(k){ls.push([k,languageName(k)])});var countryKeys=Array.from(new Set(state.all.map(function(x){return x.country}).filter(function(k){return /^[A-Z]{2}$/.test(k)})));(Array.isArray(o.countries)?o.countries:[]).forEach(function(k){if(countryKeys.indexOf(k)<0&&/^[A-Z]{2}$/.test(k))countryKeys.push(k)});countryKeys.sort().forEach(function(k){cs.push([k,countryName(k)])});setSelect('fn-live-topic',ts);setSelect('fn-live-language',ls);setSelect('fn-live-country',cs)}
function apply(){var q=norm((document.getElementById('fn-live-search')||{}).value||''),t=(document.getElementById('fn-live-topic')||{}).value||'all',c=(document.getElementById('fn-live-country')||{}).value||'all',l=(document.getElementById('fn-live-language')||{}).value||'all',s=(document.getElementById('fn-live-sort')||{}).value||'name';state.filtered=state.all.filter(function(x){var bad=failed[x.id||x.url||x.name];return !bad&&(!q||norm(x.name).indexOf(q)>-1)&& (t==='all'||x.topics.indexOf(t)>-1)&&(c==='all'||x.country===c)&&(l==='all'||x.language===l)}).sort(function(a,b){var af=a.language==='fas',bf=b.language==='fas';if(af!==bf)return bf-af;return norm(s==='country'?a.country+' '+a.name:a.name).localeCompare(norm(s==='country'?b.country+' '+b.name:b.name))});state.page=1;render()}
function favId(x){return x.id||x.url||x.name}function isFav(x){return !!(favorites[favId(x)]||favorites[x.name])}function saveFav(){try{localStorage.setItem('fn_live_favorites_v2',JSON.stringify(favorites))}catch(e){}}
function updateFavCards(){document.querySelectorAll('.fn-live-card').forEach(function(c){var on=!!favorites[c.getAttribute('data-fav-id')]||!!favorites[c.getAttribute('data-fav-name')];c.classList.toggle('is-hidden-fav',!!window.fnLiveFavoritesOnly&&!on);var b=c.querySelector('.fn-live-fav-star');if(b){b.classList.toggle('is-off',!on);b.innerHTML=on?'★':'☆'}})}
function decorateFavCards(){document.querySelectorAll('.fn-live-card').forEach(function(c){if(c.querySelector('.fn-live-fav-star'))return;var id=c.getAttribute('data-fav-id'),name=c.getAttribute('data-fav-name'),b=document.createElement('button');b.className='fn-live-fav-star is-off';b.type='button';b.title=tx('افزودن به علاقه‌مندی‌ها','Add to favorites');b.innerHTML=isFav({id:id,name:name})?'★':'☆';b.onclick=function(e){e.stopPropagation();if(isFav({id:id,name:name})){delete favorites[id];delete favorites[name]}else favorites[id]=1;saveFav();updateFavCards()};c.appendChild(b)});updateFavCards()}
function render(){var g=document.getElementById('fn-live-grid');if(!g)return;var list=state.filtered.slice(0,state.page*state.size);if(!list.length&&(!state.loaded||state.loading)){var pending=document.getElementById('fn-live-loading-screen');if(!pending){g.innerHTML='<div id="fn-live-loading-screen" class="fn-live-loading-screen"><div class="fn-live-loading-inner"><div class="fn-live-loading-logo"><i class="fa-solid fa-tv"></i></div><div class="fn-live-loading-live">LIVE</div><div class="fn-live-loading-text"></div><div class="fn-live-loading-sub"></div></div></div>';pending=document.getElementById('fn-live-loading-screen')}if(pending){pending.style.display='flex';var lt=pending.querySelector('.fn-live-loading-text'),ls=pending.querySelector('.fn-live-loading-sub');if(lt)lt.textContent=tx('در حال آماده‌سازی شبکه‌ها…','Preparing live channels…');if(ls)ls.textContent=tx('لطفاً تا تکمیل دریافت فهرست صبر کنید','Please wait until all sources finish loading')}return}g.innerHTML='';if(!list.length)g.innerHTML='<div class="fn-live-empty"><i class="fa-solid fa-tv" style="font-size:32px;display:block;margin-bottom:10px"></i>'+esc(tx('شبکه‌ای پیدا نشد.','No channels found.'))+'</div>';list.forEach(function(x){var d=document.createElement('article');d.className='fn-live-card';d.tabIndex=0;d.setAttribute('data-fav-id',favId(x));d.setAttribute('data-fav-name',x.name);d.onclick=function(){play(x)};d.onkeydown=function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();play(x)}};var logo=x.logo?'<img loading="lazy" src="'+esc(x.logo)+'" alt="" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\';"><span class="fn-live-logo-fallback" style="display:none"><i class="fa-solid fa-tv"></i></span>':'<span class="fn-live-logo-fallback"><i class="fa-solid fa-tv"></i></span>';d.innerHTML='<div class="fn-live-logo">'+logo+'</div><div class="fn-live-card-name" title="'+esc(x.name)+'">'+esc(x.name)+'</div><div class="fn-live-card-sub"><span class="fn-live-card-country">'+(x.country?'<img src="'+esc(countryFlag(x.country))+'" alt="" onerror="this.style.display=\'none\'">':'')+esc(countryName(x.country))+'</span><span>· '+esc(languageName(x.language))+'</span></div><div class="fn-live-tags">'+x.topics.slice(0,4).map(function(k){return '<span class="fn-live-tag">'+esc(tx(topicLabel(k)[0],topicLabel(k)[1]))+'</span>'}).join('')+'</div><div class="fn-live-play-label"><i class="fa-solid fa-play"></i>'+esc(tx('پخش','Play'))+'</div>';g.appendChild(d)});var more=document.getElementById('fn-live-more');if(more){more.classList.toggle('show',list.length<state.filtered.length);more.textContent=tx('نمایش بیشتر','Load more')}var count=document.getElementById('fn-live-count');if(count)count.textContent=tx(state.filtered.length+' شبکه',''+state.filtered.length+' channels');decorateFavCards()}
function pack(){return {schema:LIVE_CACHE_SCHEMA,version:LIVE_CACHE_SCHEMA,sourceSig:liveSourceSignature,at:Date.now(),raw:state.raw,dupes:state.dupes,options:{topics:Object.keys(state.topicCounts).filter(function(k){return state.topicCounts[k]>0}).sort(),languages:Array.from(new Set(state.all.map(function(x){return x.language}).filter(Boolean))).sort(),countries:Array.from(new Set(state.all.map(function(x){return x.country}).filter(function(k){return /^[A-Z]{2}$/.test(k)}))).sort()},all:state.all.map(function(x){return {id:x.id||'',logo:x.logo||'',group:x.group||'',name:x.name||'',country:x.country||'',language:x.language||'',topic:x.topic||'',url:x.url||'',groups:Array.isArray(x.groups)?x.groups:[],topics:Array.isArray(x.topics)?x.topics:[],sources:Array.isArray(x.sources)?x.sources:[],source:x.source||''}})}}
function unpack(c){if(!c||c.schema!==LIVE_CACHE_SCHEMA||c.version!==LIVE_CACHE_SCHEMA||c.sourceSig!==liveSourceSignature||!Array.isArray(c.all)||!c.all.length)return false;var rows=[];c.all.forEach(function(a){var x;if(a&&typeof a==='object'&&!Array.isArray(a)){x={id:a.id||'',logo:a.logo||'',group:a.group||'',name:a.name||'',country:a.country||'',language:a.language||'',url:a.url||'',groups:Array.isArray(a.groups)?a.groups:[a.group||''],topics:Array.isArray(a.topics)?a.topics:[],source:a.source||'',sources:Array.isArray(a.sources)?a.sources:[],topic:a.topic||''}}if(x&&validUrl(x.url)&&String(x.name||'').trim())rows.push(x)});if(!rows.length)return false;state.all=rows;state.raw=Math.max(Number(c.raw)||0,state.all.length);state.dupes=Math.max(0,Number(c.dupes)||state.raw-state.all.length);state.cacheOptions=c.options&&typeof c.options==='object'?{topics:Array.isArray(c.options.topics)?c.options.topics:[],languages:Array.isArray(c.options.languages)?c.options.languages:[],countries:Array.isArray(c.options.countries)?c.options.countries:[]}:null;finalizeTopics();state.loaded=true;return true}
function liveRestoreCache(){try{var c=JSON.parse(localStorage.getItem(liveCacheKey)||'null');if(!unpack(c))return false;setup();liveBuildFilters(state.cacheOptions);apply();var loader=document.getElementById('fn-live-loading-screen');if(loader)loader.style.display='none';var st=document.getElementById('fn-live-status-text');if(st)st.textContent=tx('شبکه‌ها از حافظه آماده شدند','Channels restored from cache');var dot=document.getElementById('fn-live-dot');if(dot)dot.className='fn-live-dot ready';return true}catch(e){try{localStorage.removeItem(liveCacheKey)}catch(x){}return false}}
async function fetchOne(k,u){var ctl=new AbortController(),timer=setTimeout(function(){ctl.abort()},15000);try{var r=await fetch(u,{cache:'no-store',signal:ctl.signal});if(!r.ok)throw Error(k+' HTTP '+r.status);return parse(await r.text(),k)}finally{clearTimeout(timer)}}
function liveStatus(a,b){var st=document.getElementById('fn-live-status-text');if(st)st.textContent=tx(a,b)}
async function load(force){if(state.loading)return state.loadPromise||undefined;if(state.loaded&&!force)return;var restored=liveRestoreCache();if(restored&&!force)return;var previous=state.all.slice();state.cacheOptions=null;state.loading=true;state.loadPromise=(async function(){var dot=document.getElementById('fn-live-dot'),loader=document.getElementById('fn-live-loading-screen');if(dot)dot.className='fn-live-dot loading';if(loader){loader.style.display=previous.length?'none':'flex';var lt=loader.querySelector('.fn-live-loading-text'),ls=loader.querySelector('.fn-live-loading-sub');if(lt)lt.textContent=tx('در حال دریافت همهٔ منابع پخش زنده…','Loading all live sources…');if(ls)ls.textContent=tx('تا پایان جمع‌آوری فهرست، نتیجه‌ای نمایش داده نمی‌شود','Results will appear after all sources finish')}liveStatus('در حال آماده‌سازی شبکه‌ها…','Preparing live channels…');try{setup();var keys=Object.keys(sources),settled=await Promise.allSettled(keys.map(function(k){return fetchOne(k,sources[k])})),arr=[],failedSources=[];settled.forEach(function(r,i){if(r.status==='fulfilled'&&Array.isArray(r.value)){arr.push(r.value)}else{failedSources.push({key:keys[i],url:sources[keys[i]],reason:r.reason&&String(r.reason.message||r.reason)})}});if(failedSources.length)console.warn('[Live TV] playlist source failures (other sources remain usable)',failedSources);var rows=[].concat.apply([],arr),merged=merge(rows);if(!merged.length&&previous.length){state.all=previous;state.loaded=true;state.raw=Math.max(state.raw,previous.length);state.dupes=Math.max(0,state.raw-state.all.length);finalizeTopics();liveBuildFilters();apply();liveStatus('منابع تازه در دسترس نیستند؛ شبکه‌ها از حافظه نمایش داده شدند','Fresh sources unavailable; channels restored from cache');return}state.raw=rows.length;state.all=merged;state.dupes=Math.max(0,state.raw-state.all.length);state.loaded=true;if(!merged.length)state.loading=false;finalizeTopics();liveBuildFilters();apply();if(merged.length){try{localStorage.setItem(liveCacheKey,JSON.stringify(pack()))}catch(e){console.warn('[Live TV] cache write failed',e)}if(failedSources.length)liveStatus('شبکه‌ها آماده‌اند؛ برخی منابع در دسترس نیستند','Channels ready; some sources unavailable');else liveStatus('شبکه‌ها آماده‌اند','Channels ready')}else{liveStatus('هیچ شبکه‌ای دریافت نشد','No channels could be loaded')}if(loader)loader.style.display='none';if(dot)dot.className=merged.length?'fn-live-dot ready':'fn-live-dot'}catch(e){console.error('[Live TV] load failed',e);if(previous.length){state.all=previous;state.loaded=true;finalizeTopics();liveBuildFilters();apply();liveStatus('خطا در منابع تازه؛ شبکه‌ها از حافظه نمایش داده شدند','Fresh source error; channels restored from cache')}else{state.all=[];state.filtered=[];state.loaded=true;state.loading=false;render();liveStatus('دریافت فهرست ممکن نشد','Could not load channels');if(dot)dot.className='fn-live-dot'}if(loader)loader.style.display='none'}finally{if(loader&&state.all.length)loader.style.display='none';if(dot&&state.all.length)dot.className='fn-live-dot ready'}})();try{return await state.loadPromise}finally{state.loading=false;state.loadPromise=null}}
function markFailed(x){var k=x&&(x.id||x.url||x.name);if(!k)return;failed[k]={name:x.name||'',at:Date.now()};try{localStorage.setItem(failedKey,JSON.stringify(failed))}catch(e){}document.querySelectorAll('.fn-live-card').forEach(function(card){if(String(card.getAttribute('data-fav-id')||'')===String(k)||String(card.getAttribute('data-fav-name')||'')===String(x.name||'')){card.classList.add('fn-live-stream-failed-queued');setTimeout(function(){card.classList.add('fn-live-stream-failed-hidden');card.classList.remove('fn-live-stream-failed-queued');state.filtered=state.filtered.filter(function(y){return String(y.id||y.url||y.name)!==String(k)});render()},1200)}})}
function showError(){var e=document.getElementById('fn-live-error');if(e){e.innerHTML=esc(tx('این استریم در دسترس نیست یا مرورگر اجازهٔ پخش آن را نمی‌دهد.','This stream is unavailable or blocked by the browser.'))+' <button onclick="fnLiveRetry()" style="margin-inline-start:8px;border:1px solid currentColor;border-radius:7px;background:transparent;color:inherit;padding:5px 9px;cursor:pointer">'+esc(tx('تلاش دوباره','Retry'))+'</button>';e.classList.add('show')}var st=document.getElementById('fn-live-state');if(st)st.textContent=tx('خطا در پخش','Playback error')}
function play(x){var v=document.getElementById('fn-live-video'),p=document.getElementById('fn-live-player'),err=document.getElementById('fn-live-error');if(!v||!p)return;if(state.hls){state.hls.destroy();state.hls=null}v.pause();v.removeAttribute('src');if(err)err.classList.remove('show');var now=document.getElementById('fn-live-now');if(now)now.textContent=x.name;var st=document.getElementById('fn-live-state');if(st)st.textContent=tx('در حال اتصال…','Connecting…');p.classList.add('open');state.player=x;if(window.fnLiveEPGLoad)window.fnLiveEPGLoad(x);if(v.canPlayType('application/vnd.apple.mpegurl')){v.src=x.url;v.play().catch(function(){})}else if(window.Hls&&window.Hls.isSupported()){state.hls=new Hls({enableWorker:true,maxBufferLength:20});state.hls.loadSource(x.url);state.hls.attachMedia(v);state.hls.on(Hls.Events.MANIFEST_PARSED,function(){v.play().catch(function(){})});state.hls.on(Hls.Events.ERROR,function(_,d){if(d&&d.fatal){markFailed(x);showError()}})}else{setTimeout(function(){if(window.Hls&&window.Hls.isSupported())play(x);else showError()},900)}v.onplaying=function(){if(st)st.textContent=tx('در حال پخش','Playing')};v.onerror=function(){markFailed(x);showError()};p.scrollIntoView({behavior:'smooth',block:'start'})}
window.fnLiveRetry=function(){if(state.player)play(state.player)};window.fnLiveClosePlayer=function(){var v=document.getElementById('fn-live-video');if(v){v.pause();v.removeAttribute('src');try{v.load()}catch(e){}}if(state.hls){state.hls.destroy();state.hls=null}state.player=null;var p=document.getElementById('fn-live-player');if(p)p.classList.remove('open')};window.fnLiveFullscreen=function(){var w=document.getElementById('fn-live-player');if(document.fullscreenElement)document.exitFullscreen();else if(w&&w.requestFullscreen)w.requestFullscreen().catch(function(){})};window.fnLiveApply=apply;window.fnLiveMore=function(){state.page++;render()};window.fnLiveRefresh=function(){state.loaded=false;load(true)};window.fnLiveStop=function(){var v=document.getElementById('fn-live-video');if(v){v.pause();v.removeAttribute('src');try{v.load()}catch(e){}}var s=document.getElementById('fn-live-state');if(s)s.textContent=tx('متوقف','Stopped')};window.fnLiveFavoritesOnly=false;window.fnLiveToggleFavorites=function(){window.fnLiveFavoritesOnly=!window.fnLiveFavoritesOnly;updateFavCards()};function liveMove(step){var cards=Array.from(document.querySelectorAll('.fn-live-card:not(.is-hidden-fav):not(.fn-live-stream-failed-queued):not(.fn-live-stream-failed-hidden)')),now=document.getElementById('fn-live-now')?.textContent||'',i=cards.findIndex(function(c){return (c.querySelector('.fn-live-card-name')?.textContent||'')===now});if(i<0)i=0;if(cards[i+step])cards[i+step].click()}window.fnLivePrev=function(){liveMove(-1)};window.fnLiveNext=function(){liveMove(1)};
function buildCustomFilter(id,kind){var sel=document.getElementById(id);if(!sel||sel.parentElement.classList.contains('fn-live-filter-custom'))return;var w=document.createElement('div');w.className='fn-live-filter-custom';sel.parentNode.insertBefore(w,sel);w.appendChild(sel);sel.style.display='none';var b=document.createElement('button');b.type='button';b.className='fn-live-select';var menu=document.createElement('div');menu.className='fn-live-filter-menu';w.appendChild(b);w.appendChild(menu);function flagImg(value){var languageCountries={fas:'IR',eng:'GB',ara:'SA',spa:'ES',fra:'FR',deu:'DE',ita:'IT',por:'PT',rus:'RU',tur:'TR',hin:'IN',urd:'PK',zho:'CN',chi:'CN',jpn:'JP',kor:'KR',nld:'NL',swe:'SE',heb:'IL',pol:'PL',ukr:'UA',gre:'GR',ind:'ID',msa:'MY',vie:'VN',tha:'TH'};var src=kind==='country'&&value&&value!=='all'?countryFlag(value):(kind==='language'&&value&&value!=='all'&&languageCountries[value]?countryFlag(languageCountries[value]):'');return src?'<span class="fn-lang-flag"><img src="'+esc(src)+'" alt=""></span>':''}function draw(){var o=sel.options[sel.selectedIndex]||sel.options[0];if(!o)return;b.innerHTML=flagImg(o.value)+'<span>'+esc(o.textContent)+'</span>';menu.innerHTML='';var q=document.createElement('input');q.className='fn-live-filter-search';q.type='search';q.placeholder=kind==='country'?tx('جستجوی کشور…','Search countries…'):tx('جستجوی زبان…','Search languages…');menu.appendChild(q);Array.from(sel.options).forEach(function(opt){var row=document.createElement('div');row.className='fn-live-filter-option';row.innerHTML=flagImg(opt.value)+'<span>'+esc(opt.textContent)+'</span>';row.setAttribute('data-search',opt.textContent.toLocaleLowerCase());row.onclick=function(){sel.value=opt.value;sel.dispatchEvent(new Event('change',{bubbles:true}));w.classList.remove('open')};menu.appendChild(row)});q.oninput=function(){var z=q.value.toLocaleLowerCase();menu.querySelectorAll('.fn-live-filter-option').forEach(function(row){row.style.display=!z||row.getAttribute('data-search').indexOf(z)>-1?'':'none'})}}b.onclick=function(e){e.stopPropagation();w.classList.toggle('open');if(w.classList.contains('open'))setTimeout(function(){qFocus()},10)};function qFocus(){var q=menu.querySelector('input');if(q)q.focus()}sel.addEventListener('change',draw);new MutationObserver(draw).observe(sel,{childList:true});draw()}
function initFilters(){buildCustomFilter('fn-live-country','country');buildCustomFilter('fn-live-language','language')}
var oldSwitch=window.switchTab;window.switchTab=function(tab,el){if(oldSwitch)oldSwitch.apply(this,arguments);if(tab==='live'){setup();initFilters();load(false);document.querySelectorAll('.nav-item').forEach(function(n){n.classList.remove('active')})}};
function resetFilters(){var s=document.getElementById('fn-live-search');if(s)s.value='';['fn-live-topic','fn-live-country','fn-live-language','fn-live-sort'].forEach(function(id){var e=document.getElementById(id);if(e){e.value=id==='fn-live-sort'?'name':'all';e.dispatchEvent(new Event('change',{bubbles:true}))}});if(typeof fnLiveApply==='function')fnLiveApply();}
window.fnLiveResetFilters=resetFilters;window.fnLiveClearFailed=function(){failed={};try{localStorage.removeItem(failedKey)}catch(e){}if(state.loaded){apply()}};document.addEventListener('DOMContentLoaded',function(){initFilters();var a=document.createElement('script');a.src='https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js';a.async=true;document.head.appendChild(a)});if(document.readyState!=='loading')initFilters();
var lastLang='';setInterval(function(){var l=String(typeof LANG==='undefined'?'fa':LANG);if(l!==lastLang){lastLang=l;setup();if(state.loaded){liveBuildFilters();apply()}}},700);
})();


/* --- original inline script boundary --- */

(function(){'use strict';
function fa4(){return typeof LANG==='undefined'||LANG==='fa'}
function tx4(a,b){return fa4()?a:b}
function esc4(x){var d=document.createElement('div');d.textContent=String(x==null?'':x);return d.innerHTML}
function fnLiveRequestExit(){var message=tx4('آیا مطمئنید می‌خواهید پخش متوقف و از بخش Live خارج شوید؟','Are you sure you want to stop playback and leave Live TV?');if(window.confirm(message)){if(window.fnLiveClosePlayer)window.fnLiveClosePlayer();if(typeof switchTab==='function')switchTab('home')}}
window.fnLiveRequestExit=fnLiveRequestExit;
window.addEventListener('popstate',function(e){if(document.body.classList.contains('fn-live-mode')){e.preventDefault();try{history.pushState({page:'live'},'',location.href)}catch(x){}fnLiveRequestExit()}},true);
window.fnLiveResetFilters=function(){var search=document.getElementById('fn-live-search');if(typeof fnLiveClearFailed==='function')fnLiveClearFailed();if(search)search.value='';['fn-live-topic','fn-live-country','fn-live-language','fn-live-sort'].forEach(function(id){var e=document.getElementById(id);if(e){e.value=(id==='fn-live-sort'?'name':'all');e.dispatchEvent(new Event('change',{bubbles:true}));}});document.querySelectorAll('.fn-live-filter-custom.open').forEach(function(x){x.classList.remove('open')});if(typeof fnLiveApply==='function')fnLiveApply();}
function setupHeader(){var live=document.getElementById('live-tab'),h=live&&live.querySelector('header'),a=h&&h.querySelector('.fn-live-top-actions');if(!a)return;a.innerHTML='<button class="fn-live-icon-btn" onclick="fnLiveRequestExit()" title="'+tx4('بازگشت','Back')+'" aria-label="'+tx4('بازگشت','Back')+'"><i class="fa-solid fa-arrow-right"></i></button><button class="fn-live-icon-btn" onclick="fnLiveAppFullscreen()" title="'+tx4('تمام‌صفحهٔ اپ','Fullscreen app')+'" aria-label="'+tx4('تمام‌صفحهٔ اپ','Fullscreen app')+'"><i class="fa-solid fa-expand"></i></button><button id="fn-live-fav-toggle" class="fn-live-icon-btn" onclick="fnLiveToggleFavorites()" title="'+tx4('علاقه‌مندی‌ها','Favorites')+'" aria-label="'+tx4('علاقه‌مندی‌ها','Favorites')+'"><i class="fa-solid fa-star"></i></button><button class="fn-live-icon-btn" onclick="fnLiveResetFilters()" title="'+tx4('بازنشانی فیلترها','Reset filters')+'" aria-label="'+tx4('بازنشانی فیلترها','Reset filters')+'"><i class="fa-solid fa-rotate-right"></i></button><button class="fn-live-icon-btn" onclick="fnLiveRequestExit()" title="'+tx4('بستن','Close')+'" aria-label="'+tx4('بستن','Close')+'"><i class="fa-solid fa-xmark"></i></button>';var ht=document.getElementById('fn-live-title-text'),hs=document.getElementById('fn-live-subtitle');if(ht)ht.textContent=tx4('پخش زنده','LIVE TV');if(hs)hs.textContent=tx4('پخش زنده','LIVE TV');document.querySelectorAll('#live-tab .fn-live-filter-field>label').forEach(function(x){x.textContent=tx4(x.getAttribute('data-fa')||'',x.getAttribute('data-en')||'')});h.setAttribute('data-v4','1')}
function setupPlayer(){var bar=document.querySelector('#fn-live-player .fn-live-player-bar');if(!bar||bar.getAttribute('data-v4'))return;bar.setAttribute('data-v4','1');bar.innerHTML='<button class="fn-live-nav-btn" onclick="fnLivePrev()" title="'+tx4('شبکهٔ قبلی','Previous channel')+'" aria-label="'+tx4('شبکهٔ قبلی','Previous channel')+'"><i class="fa-solid fa-backward-step"></i></button><button id="fn-live-pause" class="fn-live-nav-btn" onclick="fnLivePauseToggle()" title="'+tx4('مکث','Pause')+'" aria-label="'+tx4('مکث','Pause')+'"><i class="fa-solid fa-pause"></i></button><button class="fn-live-nav-btn" onclick="fnLiveNext()" title="'+tx4('شبکهٔ بعدی','Next channel')+'" aria-label="'+tx4('شبکهٔ بعدی','Next channel')+'"><i class="fa-solid fa-forward-step"></i></button><button class="fn-live-close" onclick="fnLiveClosePlayer()" title="'+tx4('بستن پلیر','Close player')+'" aria-label="'+tx4('بستن پلیر','Close player')+'"><i class="fa-solid fa-xmark"></i></button><div id="fn-live-now" class="fn-live-now"></div><span id="fn-live-state" class="fn-live-state"></span>'}
function setupCountrySearch(){document.querySelectorAll('.fn-live-filter-custom').forEach(function(w){if(w.querySelector('.fn-live-filter-search'))return;var menu=w.querySelector('.fn-live-filter-menu');if(!menu)return;var input=document.createElement('input');input.className='fn-live-filter-search';input.type='search';var isLang=!!w.querySelector('#fn-live-language');input.placeholder=isLang?tx4('جستجوی زبان…','Search languages…'):tx4('جستجوی کشور…','Search countries…');input.setAttribute('aria-label',input.placeholder);menu.querySelectorAll('.fn-live-filter-option').forEach(function(o){if(o.querySelector('.fn-lang-flag')&&((o.textContent||'').indexOf('🌐')>=0||/All countries|همه کشورها|All languages|همه زبان‌ها/.test(o.textContent||'')))o.setAttribute('data-all','1');var t=o.textContent||'';t=t.replace(/^[^\p{L}\p{N}]*/u,'').replace(/(^|\s)[A-Z]{2}\s*[—-]?\s*/g,' ').trim();o.setAttribute('data-search',t)});input.oninput=function(){var q=String(input.value||'').trim().toLocaleLowerCase();menu.querySelectorAll('.fn-live-filter-option').forEach(function(o){if(o.getAttribute('data-all')==='1'){o.classList.remove('is-filtered');return}var text=(o.getAttribute('data-search')||o.textContent||'').toLocaleLowerCase();o.classList.toggle('is-filtered',!!q&&!text.startsWith(q))})};menu.insertBefore(input,menu.firstChild);var oldOpen=w.querySelector('button');if(oldOpen)oldOpen.addEventListener('click',function(){setTimeout(function(){input.focus()},20)})})}
function stripCountryCode(){document.querySelectorAll('.fn-live-filter-option span:last-child').forEach(function(t){t.textContent=t.textContent.replace(/(^|\s)[A-Z]{2}\s*[—-]?\s*/g,' ').trim()})}
function rebuildFilterLabels(){setupHeader();setupPlayer();document.querySelectorAll('.fn-live-filter-custom').forEach(function(w){var b=w.querySelector('button.fn-live-select'),s=w.previousElementSibling;if(b&&s&&s.options){var o=s.options[s.selectedIndex],isCountry=s.id==='fn-live-country',flag=isCountry&&o&&o.value&&o.value!=='all'&&typeof countryFlag==='function'?countryFlag(o.value):'';b.innerHTML=(flag?'<span class="fn-lang-flag"><img src="'+esc4(flag)+'" alt=""></span>':'')+'<span>'+esc4(o?o.textContent:'')+'</span>'}});setupCountrySearch();stripCountryCode()}
window.fnLiveAppFullscreen=function(){var root=document.documentElement;if(document.fullscreenElement)document.exitFullscreen();else if(root.requestFullscreen)root.requestFullscreen().catch(function(){})}
window.fnLivePauseToggle=function(){var v=document.getElementById('fn-live-video'),b=document.getElementById('fn-live-pause');if(!v)return;if(v.paused){v.play().catch(function(){});if(b){b.innerHTML='<i class="fa-solid fa-pause"></i>';b.title=tx4('مکث','Pause')}}else{v.pause();if(b){b.innerHTML='<i class="fa-solid fa-play"></i>';b.title=tx4('پخش','Play')}}}
var oldPlay=window.fnLiveRetry;document.addEventListener('click',function(e){if(e.target.closest&&e.target.closest('.fn-live-card'))setTimeout(function(){var b=document.getElementById('fn-live-pause');if(b){b.innerHTML='<i class="fa-solid fa-pause"></i>';b.title=tx4('مکث','Pause')}},80)},true)
var last='';setInterval(function(){var now=String(typeof LANG==='undefined'?'fa':LANG);if(now!==last){last=now;rebuildFilterLabels()}},700);if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',rebuildFilterLabels);else rebuildFilterLabels();
})();


/* --- original inline script boundary --- */

(function(){'use strict';
 var KEY='fn_live_view_mode_v1', modes=['title','compact','list'], mode='title';
 try{var saved=localStorage.getItem(KEY);if(modes.indexOf(saved)>-1)mode=saved}catch(e){}
 function fa(){return typeof LANG==='undefined'||LANG==='fa'}
 function tx(a,b){return fa()?a:b}
 function esc(x){var d=document.createElement('div');d.textContent=String(x==null?'':x);return d.innerHTML}
 function labels(){return [{k:'title',fa:'نمایش عنوانی',en:'Title view',i:'fa-table-cells-large'},{k:'compact',fa:'نمایش فشرده',en:'Compact view',i:'fa-table-list'},{k:'list',fa:'گرید',en:'Grid',i:'fa-table-cells'}]}
 function applyMode(){var g=document.getElementById('fn-live-grid');if(!g)return;g.classList.remove('fn-live-view-title','fn-live-view-compact','fn-live-view-list');g.classList.add('fn-live-view-'+mode);var p=document.getElementById('fn-live-view-picker');if(p)p.querySelectorAll('button').forEach(function(b){b.classList.toggle('active',b.getAttribute('data-mode')===mode);b.setAttribute('aria-pressed',b.getAttribute('data-mode')===mode?'true':'false')});var b=document.getElementById('fn-live-view-btn');if(b){var x=labels().find(function(v){return v.k===mode})||labels()[0];b.title=tx(x.fa,x.en);b.setAttribute('aria-label',b.title);var i=b.querySelector('i');if(i)i.className='fa-solid '+x.i}}
 window.fnLiveSetViewMode=function(m){if(modes.indexOf(m)<0)return;mode=m;try{localStorage.setItem(KEY,mode)}catch(e){}applyMode();var p=document.getElementById('fn-live-view-picker');if(p)p.classList.remove('open')};
 function ensure(){var a=document.querySelector('#live-tab .fn-live-top-actions');if(!a)return;var reset=a.querySelector('button[onclick*="fnLiveResetFilters"]');if(!reset)return;if(!document.getElementById('fn-live-view-control')){var w=document.createElement('span');w.id='fn-live-view-control';w.className='fn-live-view-wrap';w.innerHTML='<button id="fn-live-view-btn" type="button" class="fn-live-icon-btn fn-live-view-btn" onclick="fnLiveToggleViewPicker(event)" title="'+tx('تغییر ظاهر شبکه‌ها','Change channel view')+'" aria-label="'+tx('تغییر ظاهر شبکه‌ها','Change channel view')+'"><i class="fa-solid fa-table-cells-large"></i></button><span id="fn-live-view-picker" class="fn-live-view-picker" role="menu">'+labels().map(function(x){return '<button type="button" role="menuitem" data-mode="'+x.k+'" onclick="fnLiveSetViewMode(\''+x.k+'\')"><i class="fa-solid '+x.i+'"></i> '+esc(tx(x.fa,x.en))+'</button>'}).join('')+'</span>';reset.parentNode.insertBefore(w,reset)}applyMode()}
 window.fnLiveToggleViewPicker=function(e){if(e)e.stopPropagation();ensure();var p=document.getElementById('fn-live-view-picker');if(p)p.classList.toggle('open')};
 document.addEventListener('click',function(e){var w=document.getElementById('fn-live-view-control');if(w&&!w.contains(e.target)){var p=document.getElementById('fn-live-view-picker');if(p)p.classList.remove('open')}});
 var mo=new MutationObserver(function(){ensure();applyMode()});document.addEventListener('DOMContentLoaded',function(){ensure();applyMode();mo.observe(document.body,{childList:true,subtree:true})});if(document.readyState!=='loading'){ensure();applyMode();mo.observe(document.body,{childList:true,subtree:true})}
 setInterval(function(){ensure();applyMode()},900);
 // The app fullscreen button must never request or retain landscape orientation.
 window.fnLiveAppFullscreen=function(){var root=document.documentElement;try{if(document.fullscreenElement||document.webkitFullscreenElement){var ex=document.exitFullscreen||document.webkitExitFullscreen;if(ex)Promise.resolve(ex.call(document)).finally(function(){try{if(screen.orientation&&screen.orientation.unlock)screen.orientation.unlock()}catch(e){}});return}var req=root.requestFullscreen||root.webkitRequestFullscreen;if(req)Promise.resolve(req.call(root,{navigationUI:'hide'})).then(function(){try{if(screen.orientation&&screen.orientation.unlock)screen.orientation.unlock()}catch(e){}}).catch(function(){})}catch(e){}}
 document.addEventListener('fullscreenchange',function(){if(document.fullscreenElement===document.documentElement){try{if(screen.orientation&&screen.orientation.unlock)screen.orientation.unlock()}catch(e){}}});
})();


/* --- original inline script boundary --- */

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


/* --- original inline script boundary --- */

(function(){
 'use strict';
 var state={sig:'',seq:0,info:null,loading:null,busy:false};
 var $=function(i){return document.getElementById(i)};
 var isFA=function(){return typeof LANG!=='undefined'&&LANG==='fa'};
 var text=function(x){return String(x==null?'':x).replace(/\s+/g,' ').trim()};
 var escapeHTML=function(s){var d=document.createElement('div');d.textContent=String(s==null?'':s);return d.innerHTML};
 function current(){
   var id=(typeof curId!=='undefined'&&curId)||'',type=(typeof curType!=='undefined'&&curType)||'movie';
   var title=text(($('d-title')||{}).textContent||'');
   return {id:String(id),type:type,title:title,sig:String(id)+'|'+type+'|'+title};
 }
 function put(role,value){
   var cls=role==='user'?'ai-msg-user':'ai-msg-bot', html='<div class="'+cls+'">'+String(value).replace(/\n/g,'<br>')+'</div>';
   ['ai-chat-area','ai-fs-chat'].forEach(function(id){var box=$(id);if(box){box.insertAdjacentHTML('beforeend',html);box.scrollTop=box.scrollHeight;}});
 }
 function clearForTitle(c){
   if(!c.id||!c.title||c.title==='...')return;
   if(c.sig===state.sig)return;
   state.sig=c.sig;state.seq++;state.info=null;state.loading=null;state.busy=false;
   if(typeof aiConversation!=='undefined')aiConversation=[];
   if(typeof aiIsThinking!=='undefined')aiIsThinking=false;
   var welcome=isFA()?'سلام! اکنون فقط درباره «'+escapeHTML(c.title)+'» پاسخ می‌دهم.':'Hi! I am now answering only about “'+escapeHTML(c.title)+'”.';
   ['ai-chat-area','ai-fs-chat'].forEach(function(id){var box=$(id);if(box)box.innerHTML='<div class="ai-msg-bot">'+welcome+'</div>';});
   var label=$('ai-box-label');if(label)label.textContent=isFA()?'دستیار AI · «'+c.title+'»':'AI · '+c.title;
   var badge=$('ai-context-badge');if(badge){badge.textContent='🎬 '+c.title;badge.style.display='block';}
   var questions=isFA()?['خلاصه بدون اسپویل','آیا ارزش تماشا دارد؟','بازیگران و سازندگان','نقد نقاط قوت و ضعف','پایان را با اسپویل توضیح بده','آثار مشابه']:['Spoiler-free summary','Is it worth watching?','Cast and creators','Strengths and weaknesses','Explain the ending with spoilers','Similar titles'];
   var h=questions.map(function(q){return '<div class="ai-quick-btn" data-question="'+escapeHTML(q)+'" onclick="askQuick(this.dataset.question)">'+escapeHTML(q)+'</div>';}).join('');
   ['ai-quick-btns','ai-fs-quick-btns'].forEach(function(id){var box=$(id);if(box)box.innerHTML=h;});
   ['ai-input','ai-fs-input'].forEach(function(id){var input=$(id);if(input)input.placeholder=isFA()?'سؤال درباره «'+c.title+'»…':'Ask about '+c.title+'…';});
   load(c,state.seq);
 }
 async function load(c,seq){
   try{
     var d=(typeof curDataForFav!=='undefined'&&curDataForFav)||null, cred=null;
     if(typeof getData==='function'&&c.id){
       var results=await Promise.all([getData(c.type+'/'+encodeURIComponent(c.id)+'?append_to_response=external_ids'),getData(c.type+'/'+encodeURIComponent(c.id)+'/credits')]);
       d=results[0]||d;cred=results[1];
     }
     if(seq!==state.seq)return;
     var crew=(cred&&cred.crew)||[], cast=(cred&&cred.cast)||[];
     state.info={title:c.title, id:c.id, type:c.type, year:text(((d&&(d.release_date||d.first_air_date))||'').slice(0,4))||text(($('d-year')||{}).textContent||''), overview:text((d&&d.overview)||(($('d-desc')||{}).textContent||'')), genres:((d&&d.genres)||[]).map(function(x){return x.name}).join(', '), rating:d&&d.vote_average?Number(d.vote_average).toFixed(1):text(($('d-rating')||{}).textContent||''), runtime:(d&&d.runtime)||'', seasons:(d&&d.number_of_seasons)||'', cast:cast.slice(0,10).map(function(x){return x.name}).filter(Boolean).join(', '), directors:crew.filter(function(x){return x.job==='Director'||x.job==='Creator';}).slice(0,5).map(function(x){return x.name}).join(', ')};
   }catch(e){if(seq===state.seq)state.info={title:c.title,id:c.id,type:c.type,year:text(($('d-year')||{}).textContent||''),overview:text(($('d-desc')||{}).textContent||''),genres:'',rating:'',cast:'',directors:''};}
 }
 function info(){var c=current();return state.info&&state.sig===c.sig?state.info:{title:c.title,id:c.id,type:c.type,year:'',overview:text(($('d-desc')||{}).textContent||''),genres:'',rating:'',cast:'',directors:''};}
 function fallback(question){
   var d=info(),q=text(question).toLowerCase(),fa=isFA(), title=escapeHTML(d.title),meta=[];
   if(d.year)meta.push((fa?'سال ':'Year ')+escapeHTML(d.year));if(d.genres)meta.push((fa?'ژانر: ':'Genre: ')+escapeHTML(d.genres));if(d.rating)meta.push((fa?'امتیاز TMDB: ':'TMDB rating: ')+escapeHTML(d.rating));
   var facts=meta.join(' · '),ov=escapeHTML(d.overview||'');
   if(/خلاصه|داستان|summary|plot|story/.test(q))return fa?'<strong>خلاصه بدون اسپویل «'+title+'»</strong><br><br>'+(ov||'خلاصهٔ رسمی این اثر در منبع فعلی موجود نیست.')+(facts?'<br><br>'+facts:''):'<strong>Spoiler-free summary — '+title+'</strong><br><br>'+(ov||'An official synopsis is not available in the current source.')+(facts?'<br><br>'+facts:'');
   if(/بازیگر|سازنده|کارگردان|cast|actor|creator|director/.test(q))return fa?'<strong>بازیگران و سازندگان «'+title+'»</strong><br><br>'+(d.cast?'بازیگران اصلی: '+escapeHTML(d.cast)+'<br>':'')+(d.directors?'کارگردان/خالق: '+escapeHTML(d.directors):'فهرست کامل عوامل در منبع فعلی نمایش داده نشده است.'):'<strong>Cast and creators — '+title+'</strong><br><br>'+(d.cast?'Main cast: '+escapeHTML(d.cast)+'<br>':'')+(d.directors?'Director/creator: '+escapeHTML(d.directors):'The full crew list is not available in the current source.');
   if(/ارزش|تماشا|worth|watch/.test(q))return fa?'<strong>آیا «'+title+'» ارزش تماشا دارد؟</strong><br><br>'+(d.genres?'اگر به '+escapeHTML(d.genres)+' علاقه داری، این اثر انتخاب مناسبی برای بررسی است. ':'')+(d.rating?'امتیاز ثبت‌شدهٔ TMDB آن '+escapeHTML(d.rating)+' است؛ این عدد راهنماست، اما سلیقه و حال‌وهوای مورد علاقه‌ات مهم‌تر است.':'پیشنهاد می‌کنم اول خلاصه و تریلر را ببینی تا با حال‌وهوای اثر مطمئن شوی.'):'<strong>Is '+title+' worth watching?</strong><br><br>'+(d.genres?'If you enjoy '+escapeHTML(d.genres)+', it is a sensible pick to explore. ':'')+(d.rating?'Its recorded TMDB rating is '+escapeHTML(d.rating)+'. Use that as a signal, not a verdict—your taste matters more.':'Check the synopsis and trailer first to see whether its tone suits you.');
   if(/نقد|قوت|ضعف|review|strength|weakness|good|bad/.test(q))return fa?'<strong>نگاه منصفانه به «'+title+'»</strong><br><br>برای نقد دقیق باید به جزئیات خود فیلم تکیه کرد. دادهٔ رسمی موجود: '+(facts||'اطلاعات پایه محدود است.')+(ov?'<br><br>محور داستانی رسمی: '+ov:'')+'<br><br>اگر بگویی چه چیزی برایت مهم است—داستان، ریتم، بازی‌ها یا پایان—تحلیل متمرکزتری می‌دهم.':'<strong>A fair take on '+title+'</strong><br><br>A precise review should be grounded in the film itself. Available verified context: '+(facts||'limited basic metadata.')+(ov?'<br><br>Official story premise: '+ov:'')+'<br><br>Tell me whether plot, pacing, performances, or ending matters most and I’ll focus the analysis.';
   if(/پایان|اسپویل|ending|spoiler/.test(q))return fa?'<strong>دربارهٔ اسپویل «'+title+'»</strong><br><br>برای جلوگیری از ساختن جزئیات نادرست، پایان را فقط وقتی با جزئیات می‌گویم که منبع معتبرش در دادهٔ اثر موجود باشد. می‌توانم فعلاً دربارهٔ تم‌ها، مسیر داستان و برداشت‌های رایج بدون جعل صحنه‌ها صحبت کنم.':'<strong>About spoilers for '+title+'</strong><br><br>To avoid inventing plot details, I only give a scene-by-scene ending explanation when it is supported by reliable title data. I can still discuss themes, story direction, and common interpretations without fabricating scenes.';
   if(/مشابه|similar|recommend/.test(q))return fa?'<strong>آثار مشابه «'+title+'»</strong><br><br>برای پیشنهاد دقیق، بهترین معیار ژانر و حال‌وهواست: '+(escapeHTML(d.genres)||'ژانر در منبع فعلی ثبت نشده')+'. بگو دنبال اثری تاریک‌تر، خانوادگی‌تر، کوتاه‌تر یا هیجان‌انگیزتر هستی تا پیشنهادها را دقیق کنم.':'<strong>Similar titles to '+title+'</strong><br><br>The best match is driven by genre and tone: '+(escapeHTML(d.genres)||'genre is not listed in the current source')+'. Tell me whether you want something darker, more family-friendly, shorter, or more intense and I’ll narrow the recommendations.';
   return fa?'<strong>درباره «'+title+'»</strong><br><br>'+((ov?ov+'<br><br>':'')+(facts||'اطلاعات پایهٔ این اثر در حال بارگذاری است.'))+'<br><br>سؤالت را دریافت کردم. می‌توانم دربارهٔ داستان، بازیگران، امتیاز، حال‌وهوا، ارزش تماشا، اسپویل یا آثار مشابه پاسخ مشخص بدهم.':'<strong>About '+title+'</strong><br><br>'+((ov?ov+'<br><br>':'')+(facts||'Basic information for this title is still loading.'))+'<br><br>I received your question. I can give a focused answer about plot, cast, rating, tone, whether it is worth watching, spoilers, or similar titles.';
 }
 async function answer(q){
   var before=current();clearForTitle(before);var seq=state.seq;
   if(state.loading)try{await Promise.race([state.loading,new Promise(function(r){setTimeout(r,3000)})]);}catch(e){}
   /* AI service is optional; verified local details always provide a useful answer. */
   var out=fallback(q);
   if(seq!==state.seq||current().sig!==before.sig)return null;
   return out;
 }
 window.processAI=processAI=async function(q){
   if(state.busy)return;var c=current();clearForTitle(c);if(!text(q))return;state.busy=true;if(typeof aiIsThinking!=='undefined')aiIsThinking=true;
   var b1=$('ai-send-btn'),b2=$('ai-fs-send-btn');if(b1)b1.disabled=true;if(b2)b2.disabled=true;put('user',escapeHTML(q));if(typeof showThinking==='function')showThinking();
   try{var out=await answer(q);if(typeof removeThinking==='function')removeThinking();if(out)put('bot',out);}catch(e){if(typeof removeThinking==='function')removeThinking();put('bot',fallback(q));}
   state.busy=false;if(typeof aiIsThinking!=='undefined')aiIsThinking=false;if(b1)b1.disabled=false;if(b2)b2.disabled=false;
 };
 window.askQuick=async function(q){return window.processAI(q)};
 var observer=new MutationObserver(function(){clearForTitle(current());});
 var title=$('d-title');if(title)observer.observe(title,{childList:true,subtree:true,characterData:true});
 setInterval(function(){clearForTitle(current());},250);
 clearForTitle(current());
})();


/* --- original inline script boundary --- */

/* Keep the displayed assistant shell aligned with the currently visible title even if an older initializer finishes late. */
(function(){
 function check(){
  var title=document.getElementById('d-title'),chat=document.getElementById('ai-chat-area'),label=document.getElementById('ai-box-label');
  if(!title||!chat||!label)return;var t=(title.textContent||'').trim();if(!t||t==='...')return;
  if(chat.querySelector('.ai-msg-user'))return;
  if((label.textContent||'').indexOf(t)<0){
   var welcome=(typeof LANG!=='undefined'&&LANG==='fa')?'سلام! اکنون فقط درباره «'+t.replace(/[&<>]/g,'')+'» پاسخ می‌دهم.':'Hi! I am now answering only about “'+t.replace(/[&<>]/g,'')+'”.';
   chat.innerHTML='<div class="ai-msg-bot">'+welcome+'</div>';
   var fs=document.getElementById('ai-fs-chat');if(fs)fs.innerHTML='<div class="ai-msg-bot">'+welcome+'</div>';
   label.textContent=(typeof LANG!=='undefined'&&LANG==='fa')?'دستیار AI · «'+t+'»':'AI · '+t;
  }
 }
 setInterval(check,500);setTimeout(check,1000);setTimeout(check,2500);
})();


/* --- original inline script boundary --- */

/* Direct send handler: deliberately independent from all legacy AI state. */
(function(){
 function esc(x){var d=document.createElement('div');d.textContent=String(x||'');return d.innerHTML}
 function fa(){return typeof LANG!=='undefined'&&LANG==='fa'}
 function add(role,html){['ai-chat-area','ai-fs-chat'].forEach(function(id){var b=document.getElementById(id);if(b){b.insertAdjacentHTML('beforeend','<div class="'+(role==='user'?'ai-msg-user':'ai-msg-bot')+'">'+html+'</div>');b.scrollTop=b.scrollHeight;}})}
 window.processAI=processAI=async function(question){
  question=String(question||'').trim();if(!question)return;
  var title=((document.getElementById('d-title')||{}).textContent||'').trim()|| (fa()?'این اثر':'this title');
  var d=(typeof curDataForFav!=='undefined'&&curDataForFav)||{},q=question.toLowerCase(),overview=d.overview||((document.getElementById('d-desc')||{}).textContent||'').trim(),year=((d.release_date||d.first_air_date||'').slice(0,4)),genres=(d.genres||[]).map(function(x){return x.name}).join(', '),rating=d.vote_average?Number(d.vote_average).toFixed(1):'';
  add('user',esc(question));
  var meta=[year&&(fa()?'سال '+year:'Year '+year),genres&&(fa()?'ژانر: '+genres:'Genre: '+genres),rating&&(fa()?'امتیاز TMDB: '+rating:'TMDB rating: '+rating)].filter(Boolean).map(esc).join(' · '),out;
  if(/خلاصه|داستان|summary|plot|story/.test(q))out=fa()?'<strong>خلاصه بدون اسپویل «'+esc(title)+'»</strong><br><br>'+esc(overview||'خلاصه رسمی این اثر در دادهٔ فعلی موجود نیست.')+(meta?'<br><br>'+meta:''):'<strong>Spoiler-free summary — '+esc(title)+'</strong><br><br>'+esc(overview||'An official synopsis is not available in the current data.')+(meta?'<br><br>'+meta:'');
  else if(/ارزش|تماشا|worth|watch/.test(q))out=fa()?'<strong>آیا «'+esc(title)+'» ارزش تماشا دارد؟</strong><br><br>'+(genres?'اگر به '+esc(genres)+' علاقه داری، ارزش امتحان‌کردن دارد. ':'')+(rating?'امتیاز ثبت‌شدهٔ TMDB آن '+esc(rating)+' است؛ این عدد را کنار سلیقهٔ خودت در نظر بگیر.':'تریلر و خلاصه را ببین تا با حال‌وهوای اثر مطمئن شوی.'):'<strong>Is '+esc(title)+' worth watching?</strong><br><br>'+(genres?'If you enjoy '+esc(genres)+', it is worth considering. ':'')+(rating?'Its recorded TMDB rating is '+esc(rating)+'. Treat it as a signal alongside your own taste.':'Check its trailer and synopsis to see whether its tone fits you.');
  else if(/بازیگر|کارگردان|سازنده|cast|actor|director|creator/.test(q))out=fa()?'<strong>بازیگران و سازندگان «'+esc(title)+'»</strong><br><br>فهرست عوامل کامل در حال دریافت است. '+(meta||'')+'<br><br>برای پاسخ دقیق‌تر، می‌توانی نام یک بازیگر یا شخصیت را بپرسی.':'<strong>Cast and creators — '+esc(title)+'</strong><br><br>The full credits list is loading. '+(meta||'')+'<br><br>For a more focused answer, ask about a specific actor or character.';
  else if(/پایان|اسپویل|ending|spoiler/.test(q))out=fa()?'<strong>اسپویل «'+esc(title)+'»</strong><br><br>برای جلوگیری از جعل جزئیات، پایان را بدون منبع معتبر صحنه‌به‌صحنه نمی‌سازم. اما می‌توانم دربارهٔ مسیر داستان، تم‌ها و برداشت‌های اثر صحبت کنم.':'<strong>Spoilers for '+esc(title)+'</strong><br><br>To avoid fabricating plot details, I will not invent a scene-by-scene ending without reliable source data. I can still discuss its story direction, themes, and interpretations.';
  else out=fa()?'<strong>درباره «'+esc(title)+'»</strong><br><br>'+esc(overview||'اطلاعات رسمی این اثر در حال آماده‌سازی است.')+(meta?'<br><br>'+meta:'')+'<br><br>سؤال تو ثبت شد؛ می‌توانم درباره داستان، ارزش تماشا، بازیگران، امتیاز، اسپویل یا آثار مشابه پاسخ بدهم.':'<strong>About '+esc(title)+'</strong><br><br>'+esc(overview||'Official information is still being prepared.')+(meta?'<br><br>'+meta:'')+'<br><br>Your question is received. I can answer about the plot, viewing value, cast, rating, spoilers, or similar titles.';
  add('bot',out);
  if(typeof aiConversation!=='undefined')aiConversation=[];
 };
 window.askQuick=function(q){return window.processAI(q)};
})();


/* --- original inline script boundary --- */

/* Preserve a completed answer from late legacy initializers; clear it immediately for a different TMDB item. */
(function(){
 var base=window.processAI;
 window.processAI=processAI=async function(q){var id=typeof curId==='undefined'?'':String(curId);window.__fnAIAnswerLock=null;var r=await base(q),box=document.getElementById('ai-chat-area');if(box)window.__fnAIAnswerLock={id:id,html:box.innerHTML};return r};
 var busy=false;new MutationObserver(function(){if(busy)return;var lock=window.__fnAIAnswerLock,box=document.getElementById('ai-chat-area');if(!lock||!box||String(typeof curId==='undefined'?'':curId)!==lock.id){if(lock&&String(typeof curId==='undefined'?'':curId)!==lock.id)window.__fnAIAnswerLock=null;return}if(box.innerHTML!==lock.html){busy=true;box.innerHTML=lock.html;var fs=document.getElementById('ai-fs-chat');if(fs)fs.innerHTML=lock.html;busy=false}}).observe(document.getElementById('ai-chat-area'),{childList:true,subtree:true,characterData:true});
})();


/* --- original inline script boundary --- */

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


/* --- original inline script boundary --- */

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


/* --- original inline script boundary --- */

(function(){'use strict';
  var TTL=6*60*60*1000,sourceKey='fn_live_epg_data_cache_v2',channelKey='fn_live_epg_channel_cache_v2',active=null,requestNo=0;
  var defaultEndpoints=['https://iptv-org.github.io/epg/guides/us.xml.gz','https://iptv-org.github.io/epg/guides/ir.xml.gz'];
  function fa(){return typeof LANG==='undefined'||LANG==='fa'}
  function tr(a,b){return fa()?a:b}
  function esc(x){var d=document.createElement('div');d.textContent=String(x==null?'':x);return d.innerHTML}
  function norm(x){return String(x==null?'':x).toLocaleLowerCase().normalize('NFKD').replace(/[\\u0300-\\u036f]/g,'').replace(/[^\\p{L}\\p{N}]+/gu,' ').trim().replace(/\\s+/g,' ')}
  function exactId(x){return String(x==null?'':x).trim().toLocaleLowerCase()}
  function read(key,fallback){try{var x=JSON.parse(localStorage.getItem(key)||'null');return x&&typeof x==='object'?x:fallback}catch(e){return fallback}}
  function write(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true}catch(e){return false}}
  function endpoints(channel){var x=window.FN_LIVE_EPG_ENDPOINTS;if(!Array.isArray(x)){var saved=read('fn_live_epg_endpoints_v1',null);x=Array.isArray(saved)?saved:defaultEndpoints.slice()}else{x=x.slice()}var country=String(channel&&channel.country||'').trim().toLowerCase();if(country&&/^[a-z]{2}$/.test(country)){x.push('https://iptv-org.github.io/epg/guides/'+country+'.xml.gz');x.push('https://iptv-epg.org/files/epg-'+country+'.xml.gz')}x.push('https://iptv-org.github.io/epg/guides/ir.xml.gz');var seen={};return x.map(function(v){return String(v||'').trim()}).filter(function(v){if(!v||seen[v])return false;seen[v]=1;return true}).slice(0,6)}
  function status(text){var e=document.getElementById('fn-live-epg-status');if(e){e.textContent=text;e.style.display=text?'':'none'}}
  function setSummary(x){var e=document.getElementById('fn-live-epg-channel');if(e)e.textContent=x&&x.name?' · '+x.name:''}
  function cacheChannelId(x){return x&&x.id?'id:'+exactId(x.id):'name:'+norm(x&&x.name)}
  function xmlText(el,tag){var n=el&&el.getElementsByTagName(tag)[0];return n?String(n.textContent||'').trim():''}
  function parseDate(raw){var s=String(raw||'').trim(),m=s.match(/^(\\d{4})(\\d{2})(\\d{2})(\\d{2})(\\d{2})(\\d{2})(?:\\s*([+-])(\\d{2})(?::?(\\d{2}))?)?/);if(m){var base=Date.UTC(+m[1],+m[2]-1,+m[3],+m[4],+m[5],+m[6]),off=m[7]?((+m[8]*60+(+m[9]||0))*60000)*(m[7]==='+'?1:-1):0;return new Date(base-off)}var d=new Date(s);return isNaN(d.getTime())?null:d}
  function parseFeed(text,x){var doc=new DOMParser().parseFromString(text,'application/xml');if(doc.getElementsByTagName('parsererror').length)throw Error('Invalid XMLTV');var wantedId=exactId(x&&x.id),wantedName=norm(x&&x.name),ids=[],channels=doc.getElementsByTagName('channel');for(var i=0;i<channels.length;i++){var c=channels[i],cid=exactId(c.getAttribute('id')||'');if(wantedId&&cid===wantedId)ids.push(cid)}var matchedBy=wantedId&&ids.length?'tvg-id':'';if(!ids.length&&wantedName){for(var j=0;j<channels.length;j++){var cc=channels[j],names=cc.getElementsByTagName('display-name'),ok=false;for(var k=0;k<names.length;k++){if(norm(names[k].textContent)===wantedName){ok=true;break}}if(ok)ids.push(exactId(cc.getAttribute('id')||''))}if(ids.length)matchedBy='name'}if(!ids.length&&wantedId){for(var q=0;q<channels.length;q++){var qc=channels[q],qid=exactId(qc.getAttribute('id')||'');if(qid===wantedId)ids.push(qid)}if(ids.length)matchedBy='tvg-id'}var idSet={};ids.forEach(function(id){if(id)idSet[id]=1});var programmes=doc.getElementsByTagName('programme'),out=[];for(var z=0;z<programmes.length;z++){var p=programmes[z],pid=exactId(p.getAttribute('channel')||'');if(!idSet[pid])continue;var start=parseDate(p.getAttribute('start')),end=parseDate(p.getAttribute('stop'));if(!start||!end||end<=start)continue;var title=xmlText(p,'title');if(!title)continue;out.push({start:start.getTime(),end:end.getTime(),title:title,desc:xmlText(p,'desc')})}out.sort(function(a,b){return a.start-b.start});var now=Date.now(),windowed=out.filter(function(p){return p.end>=now-36*60*60*1000&&p.start<=now+7*24*60*60*1000});return {matched:!!matchedBy&&windowed.length>0,matchedBy:matchedBy,programmes:windowed.slice(0,240)} }
  async function fetchText(url){var r=await fetch(url,{cache:'no-store',mode:'cors'});if(!r.ok)throw Error('EPG HTTP '+r.status);var isGz=/\\.gz(?:$|[?#])/i.test(url)||(r.headers.get('content-type')||'').toLowerCase().indexOf('gzip')>-1;if(isGz&&window.DecompressionStream){var stream=new Blob([await r.arrayBuffer()]).stream().pipeThrough(new DecompressionStream('gzip'));return await new Response(stream).text()}return await r.text()}
  function fresh(x){return x&&Number(x.at)>0&&Date.now()-Number(x.at)<TTL}
  function choose(programmes,now){var p=(programmes||[]).filter(function(x){return x&&isFinite(x.start)&&isFinite(x.end)&&x.end>x.start}).sort(function(a,b){return a.start-b.start}),current=null,previous=null,next=null;for(var i=0;i<p.length;i++){if(p[i].start<=now&&p[i].end>now)current=p[i];else if(p[i].end<=now)previous=p[i];else if(!next&&p[i].start>now)next=p[i]}return {previous:previous,current:current,next:next}}
  function fmt(t){try{return new Intl.DateTimeFormat(fa()?'fa-IR':'en-US',{hour:'2-digit',minute:'2-digit'}).format(new Date(t))}catch(e){return new Date(t).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}}
  function render(programmes,matched){var d=document.getElementById('fn-live-epg');if(d){d.hidden=!matched;if(!matched)d.open=false;}var list=document.getElementById('fn-live-epg-list');if(!list)return;list.innerHTML='';if(!matched||!programmes||!programmes.length){list.innerHTML='<div class="fn-live-epg-empty">'+esc(tr('اطلاعات برنامه موجود نیست','EPG not available'))+'</div>';return}var s=choose(programmes,Date.now()),rows=[['previous',tr('قبلی','Previous'),s.previous],['current',tr('اکنون','Now'),s.current],['next',tr('بعدی','Next'),s.next]];rows.forEach(function(row){var el=document.createElement('div');el.className='fn-live-epg-item'+(row[0]==='current'&&row[2]?' current':'');if(row[2]){var p=row[2];el.innerHTML='<div><div class="fn-live-epg-kind">'+esc(row[1])+'</div><div class="fn-live-epg-time">'+esc(fmt(p.start))+' – '+esc(fmt(p.end))+'</div></div><div><div class="fn-live-epg-name">'+esc(p.title)+'</div>'+(p.desc?'<div class="fn-live-epg-desc">'+esc(p.desc)+'</div>':'')+'</div>'}else{el.innerHTML='<div class="fn-live-epg-kind">'+esc(row[1])+'</div><div class="fn-live-epg-empty">—</div>'}list.appendChild(el)})}
  function drawLanguage(){var title=document.querySelector('[data-live-epg-label="title"]');if(title)title.textContent=tr('راهنمای برنامه','Programme guide');var d=document.getElementById('fn-live-epg');if(d&&d.open&&active)render(active.programmes,active.matched)}
  async function load(x){if(!x)return;active={channel:x,programmes:[],matched:false};var d=document.getElementById('fn-live-epg');if(d){d.hidden=true;d.open=false}setSummary(x);var serial=++requestNo;status(tr('در حال دریافت راهنمای برنامه…','Loading programme guide…'));var ck=cacheChannelId(x),cc=read(channelKey,{}),cached=cc[ck];if(fresh(cached)){active.programmes=cached.programmes||[];active.matched=!!cached.matched;render(active.programmes,active.matched);status(active.matched?tr('راهنما از حافظه بارگذاری شد','Guide loaded from cache'):tr('اطلاعات برنامه موجود نیست','EPG not available'));return}var sc=read(sourceKey,{}),eps=endpoints(x);for(var i=0;i<eps.length;i++){if(serial!==requestNo)return;var ep=eps[i],bucket=sc[ep];if(fresh(bucket)&&bucket.channels&&Object.prototype.hasOwnProperty.call(bucket.channels,ck)){var saved=bucket.channels[ck];active.programmes=saved.programmes||[];active.matched=!!saved.matched;if(active.matched)break;continue}try{var parsed=parseFeed(await fetchText(ep),x);bucket=fresh(bucket)&&bucket.channels?bucket:{at:Date.now(),channels:{}};bucket.at=Date.now();bucket.channels[ck]=parsed;sc[ep]=bucket;write(sourceKey,sc);active.programmes=parsed.programmes||[];active.matched=!!parsed.matched;if(active.matched)break}catch(e){if(i===eps.length-1)active.matched=false}}if(serial!==requestNo)return;cc[ck]={at:Date.now(),matched:active.matched,programmes:active.programmes||[]};write(channelKey,cc);render(active.programmes,active.matched);status(active.matched?tr('راهنما به‌روز شد','Guide updated'):tr('اطلاعات برنامه موجود نیست','EPG not available'))}
  window.fnLiveEPGLoad=function(x){load(x)};
  function init(){var d=document.getElementById('fn-live-epg');if(!d)return;d.addEventListener('toggle',function(){if(d.open){if(active)load(active.channel);else status(tr('یک شبکه را برای دریافت راهنمای برنامه پخش کنید','Play a channel to load its programme guide'))}});drawLanguage();var last='';setInterval(function(){var lang=String(typeof LANG==='undefined'?'fa':LANG);if(lang!==last){last=lang;drawLanguage()}if(d.open&&active&&active.matched)render(active.programmes,active.matched)},60000)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
