
/* ===== v40.10.10 Search tab Hollywood-first people priority ===== */
(function(){
  'use strict';
  var FN_APP_VERSION_40106 = 'v40.10.10';
  var PERSON_TYPES = { actor_male_list: true, actor_female_list: true };
  var EN_COUNTRIES = { US:true, GB:true, CA:true, AU:true, NZ:true, IE:true };
  var cache = new Map();
  var detailCache = new Map();
  var hwState = { active:false, type:null, page:1, seen:new Set(), query:'' };

  var MALE_HOLLYWOOD_SEEDS = [
    500, 6193, 287, 6384, 3223, 1892, 31, 192, 3894, 1158, 380, 976, 85, 60, 131,
    73968, 74568, 73457, 1136406, 1253360, 1009377, 2037, 30614, 2524, 504, 10980,
    1190668, 130640, 2035102, 119894, 37625, 1023139, 819, 3, 2888, 17276, 819,
    11856, 18918, 18999, 5293, 62, 23659, 118, 2963, 1333, 1100, 65731
  ];
  var FEMALE_HOLLYWOOD_SEEDS = [
    505710, 974169, 1373737, 115440, 234352, 1245, 1397778, 224513, 54693, 72129,
    550843, 524, 90633, 10990, 36594, 136532, 112, 5064, 11701, 156, 1813,
    9273, 204, 1920, 2231, 140, 1267329, 83002, 6161, 17605, 82242, 1275259,
    203, 126, 129, 4775, 125025, 19079, 227454, 1437491, 2049994, 21657, 3136,
    19537, 114, 11148, 3293, 453, 56734
  ];

  function isFa(){ return window.LANG === 'fa'; }
  function dataFn(){ return (typeof window.getDataEN === 'function') ? window.getDataEN : window.getData; }
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  async function safeGet(path, ms){
    ms = ms || 6500;
    if (cache.has(path)) return cache.get(path);
    try {
      var fn = dataFn();
      if (typeof fn !== 'function') return null;
      var res = await Promise.race([fn(path), new Promise(function(resolve){ setTimeout(function(){ resolve(null); }, ms); })]);
      if (res) cache.set(path, res);
      return res;
    } catch(e) { return null; }
  }
  async function personDetail(p, seedRank){
    if (!p || !p.id) return null;
    var id = Number(p.id);
    if (detailCache.has(id)) return Object.assign({}, p, detailCache.get(id), seedRank != null ? {_seedRank:seedRank,_curatedHollywood:true} : {});
    var d = await safeGet('person/' + id, 3500);
    var merged = Object.assign({}, p, d || {}, seedRank != null ? {_seedRank:seedRank,_curatedHollywood:true} : {});
    if (d && d.id) detailCache.set(id, d);
    return merged;
  }
  function isActorType(type){ return !!PERSON_TYPES[type]; }
  function matchesGender(p,type){
    if (!p || !p.profile_path) return false;
    return type === 'actor_male_list' ? Number(p.gender) === 2 : Number(p.gender) === 1;
  }
  function mediaIsHollywood(m){
    if (!m) return false;
    var langs = [m.original_language, m.language].filter(Boolean).map(function(x){ return String(x).toLowerCase(); });
    var countries = Array.isArray(m.origin_country) ? m.origin_country : (m.production_countries || []).map(function(c){ return c && (c.iso_3166_1 || c); });
    var englishLang = langs.indexOf('en') !== -1;
    var englishCountry = countries.some(function(c){ return EN_COUNTRIES[String(c || '').toUpperCase()]; });
    return englishLang || englishCountry;
  }
  function itemYear(m){
    var date = (m && (m.release_date || m.first_air_date)) || '';
    var y = parseInt(String(date).slice(0,4), 10);
    return isNaN(y) ? 0 : y;
  }
  function trendMediaScore(m){
    if (!m) return 0;
    var y = itemYear(m);
    var now = new Date().getFullYear();
    var recency = 0;
    if (y >= now - 1) recency = 480;
    else if (y >= now - 3) recency = 300;
    else if (y >= now - 6) recency = 140;
    return Number(m.popularity || 0) + Number(m.vote_count || 0) * 0.025 + Number(m.vote_average || 0) * 8 + recency;
  }
  function hollywoodScore(p){
    var known = Array.isArray(p.known_for) ? p.known_for : [];
    var h = known.filter(mediaIsHollywood);
    var hScore = h.reduce(function(sum,m){ return sum + trendMediaScore(m); }, 0);
    var globalKnown = known.reduce(function(sum,m){ return sum + trendMediaScore(m) * 0.15; }, 0);
    var latinName = /^[\x00-\x7F\u00C0-\u024F\s'.-]+$/.test(String(p.name || '')) ? 180 : 0;
    var curated = p._curatedHollywood ? Math.max(0, 6000 - Number(p._seedRank || 0) * 18) : 0;
    var hollywoodBonus = h.length ? 3600 + h.length * 450 : 0;
    var firstHollywood = (known[0] && mediaIsHollywood(known[0])) ? 1200 : 0;
    return curated + hollywoodBonus + firstHollywood + latinName + Number(p.popularity || 0) * 4 + hScore + globalKnown;
  }
  function sortPeople(list){ return list.sort(function(a,b){ return hollywoodScore(b) - hollywoodScore(a); }); }
  function personCard(p){
    if (typeof window.makePersonCard === 'function') return window.makePersonCard(p);
    if (typeof makePersonCard === 'function') return makePersonCard(p);
    var IMG = window.IMG || 'https://family-night-api.alirezadoe8.workers.dev/img/w185';
    return '<div class="actor-card" onclick="openDetail('+Number(p.id)+', \'person_works\')"><img src="'+IMG+esc(p.profile_path)+'" class="actor-img" loading="lazy"><div class="actor-name">'+esc(p.name)+'</div></div>';
  }
  async function seedPeople(type){
    var ids = type === 'actor_female_list' ? FEMALE_HOLLYWOOD_SEEDS : MALE_HOLLYWOOD_SEEDS;
    var jobs = ids.map(function(id, idx){ return personDetail({id:id}, idx).catch(function(){ return null; }); });
    var out = await Promise.all(jobs);
    return out.filter(function(p){ return matchesGender(p, type); });
  }
  async function trendingPeople(type, page){
    page = page || 1;
    var all = [];
    var seedList = page === 1 ? await seedPeople(type) : [];
    all = all.concat(seedList);
    var jobs = [];
    for (var t=1; t<=2; t++) jobs.push(safeGet('trending/person/week?page=' + t, 6500));
    var start = Math.max(1, (page - 1) * 5 + 1);
    for (var p=0; p<6; p++) jobs.push(safeGet('person/popular?page=' + (start+p), 6500));
    var pages = await Promise.all(jobs);
    pages.forEach(function(d){ if (d && d.results) all = all.concat(d.results); });
    var seen = new Set(), final = [];
    for (var i=0; i<all.length; i++) {
      var person = all[i];
      if (!person || !person.id || seen.has(person.id)) continue;
      seen.add(person.id);
      if (matchesGender(person, type)) final.push(person);
    }
    return sortPeople(final);
  }
  function placeholder(type){
    if (type === 'actor_female_list') return isFa() ? 'جستجوی بازیگر زن... نام فارسی یا انگلیسی' : 'Search actresses...';
    return isFa() ? 'جستجوی بازیگر مرد... نام فارسی یا انگلیسی' : 'Search actors...';
  }
  function titleFor(type, title){
    if (title) return title;
    return type === 'actor_female_list' ? (isFa() ? 'ستارگان سینما (زن)' : 'Cinema Legends (Female)') : (isFa() ? 'ستارگان سینما (مرد)' : 'Cinema Legends (Male)');
  }
  function setupPeoplePage(type,title){
    var modal = document.getElementById('modal'); if (modal) modal.style.display = 'none';
    var pw = document.getElementById('person-works-modal'); if (pw) pw.style.display = 'none';
    var page = document.getElementById('generic-grid-page'); if (page) page.style.display = 'flex';
    var ttl = document.getElementById('gg-title'); if (ttl) ttl.innerText = titleFor(type,title);
    var content = document.getElementById('gg-content'); if (content) { content.className = 'person-grid-container'; content.innerHTML = ''; }
    var sort = document.getElementById('gg-sort-bar'); if (sort) sort.style.display = 'none';
    var bar = document.getElementById('gg-person-search-bar'); if (bar) bar.style.display = 'block';
    var inp = document.getElementById('gg-person-search-input'); if (inp) { inp.value = ''; inp.placeholder = placeholder(type); inp.setAttribute('dir','auto'); }
    var clear = document.getElementById('gg-person-search-clear'); if (clear) clear.style.display = 'none';
    var more = document.getElementById('btn-more-g'); if (more) { more.style.display = 'block'; more.innerText = isFa() ? 'نمایش بیشتر' : 'Load More'; }
    try { genericType = type; genericPage = 1; genericQuery = 'person/popular'; genericContentType = 'person_list'; genericPersonSearchQuery = ''; } catch(e) {}
  }
  function renderTo(container, list, append, limit){
    if (!container) return;
    if (!append) container.innerHTML = '';
    var html = [];
    var added = 0;
    for (var i=0; i<list.length && added<limit; i++) {
      var p = list[i];
      if (!p || !p.id || hwState.seen.has(p.id)) continue;
      hwState.seen.add(p.id);
      html.push(personCard(p));
      added++;
    }
    if (html.length) container.insertAdjacentHTML('beforeend', html.join(''));
    if (!append && !html.length) container.innerHTML = '<div class="person-empty-state">' + (isFa() ? 'نتیجه‌ای پیدا نشد.' : 'No people found.') + '</div>';
  }
  async function loadHollywoodGrid(append){
    var container = document.getElementById('gg-content');
    if (!container || !hwState.type) return;
    if (!append) { hwState.seen = new Set(); container.innerHTML = '<div class="person-empty-state"><i class="fa-solid fa-spinner fa-spin" style="font-size:24px;color:var(--primary);display:block;margin-bottom:10px;"></i>' + (isFa() ? 'در حال بارگذاری ستارگان هالیوودی...' : 'Loading Hollywood trending stars...') + '</div>'; }
    var list = await trendingPeople(hwState.type, hwState.page);
    renderTo(container, list, !!append, 54);
    var more = document.getElementById('btn-more-g'); if (more) more.style.display = 'block';
  }
  async function searchHollywoodPeople(q){
    var raw = String(q || '').trim();
    hwState.query = raw;
    var clear = document.getElementById('gg-person-search-clear'); if (clear) clear.style.display = raw ? 'block' : 'none';
    if (!raw) { hwState.page = 1; return loadHollywoodGrid(false); }
    var container = document.getElementById('gg-content');
    if (container) container.innerHTML = '<div class="person-empty-state"><i class="fa-solid fa-spinner fa-spin" style="font-size:22px;color:var(--primary);display:block;margin-bottom:10px;"></i>' + (isFa() ? 'در حال جستجو...' : 'Searching...') + '</div>';
    var terms = [raw];
    try { if (typeof normalizePersonSearchTerm === 'function') { var en = normalizePersonSearchTerm(raw); if (en && en.toLowerCase() !== raw.toLowerCase()) terms.push(en); } } catch(e) {}
    var all = await seedPeople(hwState.type);
    for (var i=0; i<terms.length; i++) {
      var d = await safeGet('search/person?query=' + encodeURIComponent(terms[i]) + '&include_adult=false&page=1', 6500);
      if (d && d.results) all = all.concat(d.results);
      var d2 = await safeGet('search/person?query=' + encodeURIComponent(terms[i]) + '&include_adult=false&page=2', 6500);
      if (d2 && d2.results) all = all.concat(d2.results);
    }
    var qn = raw.toLowerCase();
    var seen = new Set(), final=[];
    all.forEach(function(p){
      if (!p || !p.id || seen.has(p.id) || !matchesGender(p, hwState.type)) return;
      seen.add(p.id);
      var name = String(p.name || '').toLowerCase();
      if (name.indexOf(qn) !== -1 || qn.length < 2) final.push(p);
    });
    hwState.seen = new Set();
    renderTo(container, sortPeople(final), false, 100);
  }
  async function renderSearchRows(){
    var maleEl = document.getElementById('trend-male');
    var femaleEl = document.getElementById('trend-female');
    if (!maleEl || !femaleEl) return;
    maleEl.innerHTML = '<div class="person-empty-state" style="min-width:160px;padding:20px 10px;">' + (isFa() ? 'در حال بارگذاری...' : 'Loading...') + '</div>';
    femaleEl.innerHTML = maleEl.innerHTML;
    var lists = await Promise.all([trendingPeople('actor_male_list',1), trendingPeople('actor_female_list',1)]);
    hwState.seen = new Set();
    maleEl.innerHTML = lists[0].slice(0, 12).map(personCard).join('');
    femaleEl.innerHTML = lists[1].slice(0, 12).map(personCard).join('');
    try { if (typeof enhanceSearchReadability === 'function') enhanceSearchReadability(); } catch(e) {}
  }

  var oldTrending = window.loadTrendingActors;
  window.loadTrendingActors = async function(){
    try { if (typeof oldTrending === 'function') await oldTrending.apply(this, arguments); } catch(e) {}
    try { await renderSearchRows(); } catch(e) { console.warn('v40.10.10 search row patch failed', e); }
  };

  var oldOpen = window.openGenericGrid;
  window.openGenericGrid = function(type,q,title){
    if (!isActorType(type)) {
      hwState.active = false;
      return oldOpen ? oldOpen.apply(this, arguments) : undefined;
    }
    hwState.active = true; hwState.type = type; hwState.page = 1; hwState.query = ''; hwState.seen = new Set();
    setupPeoplePage(type,title);
    loadHollywoodGrid(false);
  };
  var oldMore = window.loadMoreGeneric;
  window.loadMoreGeneric = function(){
    if (hwState.active && isActorType(hwState.type)) { hwState.page++; try { genericPage = hwState.page; } catch(e) {} return loadHollywoodGrid(true); }
    return oldMore ? oldMore.apply(this, arguments) : undefined;
  };
  var oldSearch = window.searchGenericPeople;
  window.searchGenericPeople = function(q){
    if (hwState.active && isActorType(hwState.type)) {
      if (window.__fnHwSearchTimer) clearTimeout(window.__fnHwSearchTimer);
      window.__fnHwSearchTimer = setTimeout(function(){ searchHollywoodPeople(q); }, 150);
      return;
    }
    return oldSearch ? oldSearch.apply(this, arguments) : undefined;
  };
  var oldClear = window.clearGenericPersonSearch;
  window.clearGenericPersonSearch = function(){
    if (hwState.active && isActorType(hwState.type)) {
      var inp = document.getElementById('gg-person-search-input'); if (inp) inp.value = '';
      var clear = document.getElementById('gg-person-search-clear'); if (clear) clear.style.display = 'none';
      hwState.query = ''; hwState.page = 1; hwState.seen = new Set();
      return loadHollywoodGrid(false);
    }
    return oldClear ? oldClear.apply(this, arguments) : undefined;
  };
  function setVersion(){
    document.querySelectorAll('.dev-info').forEach(function(el){ if (/v\d+\.\d+\.\d+/.test(el.innerHTML)) el.innerHTML = el.innerHTML.replace(/v\d+\.\d+\.\d+/g, FN_APP_VERSION_40106); });
    document.querySelectorAll('[data-fn-version], .fn-app-version, #fn-app-version').forEach(function(el){ el.textContent = FN_APP_VERSION_40106; });
  }
  var oldLang = (typeof applyLang === 'function') ? applyLang : null;
  if (oldLang && !oldLang.__v40106Wrapped) {
    applyLang = function(){ var r = oldLang.apply(this, arguments); setTimeout(function(){ setVersion(); if (document.getElementById('search-tab') && document.getElementById('trend-male')) renderSearchRows(); }, 250); return r; };
    applyLang.__v40106Wrapped = true;
  }
  document.addEventListener('DOMContentLoaded', function(){ setVersion(); setTimeout(setVersion, 600); });
  window.addEventListener('load', function(){ setVersion(); setTimeout(function(){ if (document.getElementById('search-tab') && document.getElementById('trend-male')) renderSearchRows(); }, 900); });
})();
