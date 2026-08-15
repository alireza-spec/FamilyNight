
/* ===== v22 People see-all search + strict director category patch ===== */
(function(){
  const DIRECTOR_EXTRA_IDS_V22 = [525,138,1032,488,240,7467,578,2710,137427,2636,21684,10930,5602,4762,5655,12453,1243,1152,9341,11401,223,16767,2045,11218,1776,1204,11614,608,10099,2303,3325,4483,1223,1769,1466,6773,8643,6548,8556,5363,9168,15217,108,3110,533,5953,8502,1532,4500,22970,1032,9341,525,240,2710,488,7467];
  const _personDetailCacheV22 = new Map();
  const _personCreditsCacheV22 = new Map();
  function _normV22(s){
    return String(s||'').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[آأإ]/g,'ا').replace(/ي/g,'ی').replace(/ك/g,'ک').replace(/[^\p{L}\p{N}\s]/gu,' ').replace(/\s+/g,' ').trim();
  }
  function _queryToEnglishV22(q){
    let out = String(q||'').trim();
    if (typeof PERSON_FA_TO_EN !== 'undefined') {
      Object.keys(PERSON_FA_TO_EN).sort((a,b)=>b.length-a.length).forEach(k=>{
        out = out.replace(new RegExp(k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'g'), PERSON_FA_TO_EN[k]);
      });
    }
    return out.trim();
  }
  function _nameScoreV22(name, query){
    const n = _normV22(name), q = _normV22(query);
    if (!q) return 1;
    if (!n) return 0;
    const noSpaceN = n.replace(/\s+/g,''), noSpaceQ = q.replace(/\s+/g,'');
    const tokens = n.split(' ').filter(Boolean), qTokens = q.split(' ').filter(Boolean);
    if (n === q) return 1000;
    if (n.startsWith(q)) return 900;
    if (tokens.some(t=>t === q)) return 850;
    if (tokens.some(t=>t.startsWith(q))) return 800;
    if (n.includes(q)) return 700;
    if (noSpaceN.includes(noSpaceQ)) return 650;
    if (qTokens.length > 1) {
      let ok = true, prefix = 0;
      for (const qt of qTokens) {
        const match = tokens.some(t => t.startsWith(qt) || t.includes(qt));
        if (!match) ok = false;
        if (tokens.some(t => t.startsWith(qt))) prefix++;
      }
      if (ok) return 600 + prefix * 40;
    }
    return 0;
  }
  async function _detailV22(p){
    if (!p || !p.id) return p;
    if (_personDetailCacheV22.has(p.id)) return {...p, ..._personDetailCacheV22.get(p.id)};
    try {
      const d = await getDataEN(`person/${p.id}`);
      if (d && d.id) {
        _personDetailCacheV22.set(p.id, d);
        return {...p, ...d};
      }
    } catch(e){}
    return p;
  }
  async function _creditsV22(id){
    if (!id) return null;
    if (_personCreditsCacheV22.has(id)) return _personCreditsCacheV22.get(id);
    try {
      const c = await getDataEN(`person/${id}/combined_credits`);
      _personCreditsCacheV22.set(id, c || {});
      return c || {};
    } catch(e){ return {}; }
  }
  async function _isDirectorV22(p){
    if (!p || !p.id || !p.profile_path) return false;
    if (p.known_for_department === 'Directing') return true;
    if (DIRECTOR_EXTRA_IDS_V22.includes(Number(p.id))) return true;
    const c = await _creditsV22(p.id);
    const crew = (c && c.crew) || [];
    return crew.some(x => x && (x.department === 'Directing' || String(x.job||'').toLowerCase().includes('director')));
  }
  async function _validForTypeV22(p, type){
    if (!p || !p.id || !p.profile_path) return false;
    if (type === 'actor_male_list' || type === 'actor_female_list') {
      let pp = p;
      if (!pp.gender) pp = await _detailV22(p);
      return type === 'actor_male_list' ? pp.gender === 2 : pp.gender === 1;
    }
    if (type === 'director_list') return await _isDirectorV22(p);
    return true;
  }
  window.personMatchesCurrentList = function(p, type){
    if (!p || !p.profile_path) return false;
    if (type === 'actor_male_list') return p.gender === 2;
    if (type === 'actor_female_list') return p.gender === 1;
    if (type === 'director_list') return p.known_for_department === 'Directing' || DIRECTOR_EXTRA_IDS_V22.includes(Number(p.id));
    return true;
  };
  window.scorePersonForList = function(p, type){
    const pop = Number(p && p.popularity || 0);
    const knownScore = ((p && p.known_for) || []).reduce((sum,x)=> sum + Number(x.popularity||0) + Number(x.vote_count||0)*0.015 + Number(x.vote_average||0)*2,0);
    if (type === 'director_list') return (p.known_for_department === 'Directing' ? 10000 : 0) + (DIRECTOR_EXTRA_IDS_V22.includes(Number(p.id)) ? 5000 : 0) + pop + knownScore;
    return pop + knownScore;
  };
  window.loadGenericPeoplePage = async function(isSearch){
    const container = document.getElementById('gg-content');
    const btn = document.getElementById('btn-more-g');
    if (!container) return;
    if (isSearch || genericPersonSearchQuery) return loadGenericPersonSearch(genericPersonSearchQuery || '');
    if (!window.genericPersonSeenIds) window.genericPersonSeenIds = new Set();
    const loadingId='person-loading-inline-v22';
    if (!document.getElementById(loadingId)) container.insertAdjacentHTML('beforeend', `<div id="${loadingId}" class="person-empty-state"><i class="fa-solid fa-spinner fa-spin" style="font-size:24px;color:var(--primary);display:block;margin-bottom:10px;"></i>${LANG==='fa'?'در حال بارگذاری...':'Loading...'}</div>`);
    let candidates=[];
    if (genericType === 'director_list') {
      if (genericPage === 1) {
        const details = await Promise.all(DIRECTOR_EXTRA_IDS_V22.map(id=>getDataEN(`person/${id}`).catch(()=>null)));
        candidates = candidates.concat(details.filter(Boolean).map(p=>({...p,known_for_department:'Directing'})));
      }
      const start = Math.max(1, (genericPage-1)*8 + 1);
      const pages = await fetchPeoplePages('person/popular', start, 8);
      candidates = candidates.concat(pages);
    } else {
      const start = Math.max(1, (genericPage-1)*6 + 1);
      candidates = await fetchPeoplePages('person/popular', start, 6);
    }
    const out=[];
    const tempSeen=new Set();
    for (const raw of candidates) {
      if (!raw || tempSeen.has(raw.id) || window.genericPersonSeenIds.has(raw.id)) continue;
      tempSeen.add(raw.id);
      const p = await _detailV22(raw);
      if (await _validForTypeV22(p, genericType)) {
        if (genericType === 'director_list') p.known_for_department='Directing';
        out.push(p);
      }
    }
    out.sort((a,b)=>scorePersonForList(b,genericType)-scorePersonForList(a,genericType));
    const loading=document.getElementById(loadingId); if (loading) loading.remove();
    out.slice(0,48).forEach(p=>{ if(!window.genericPersonSeenIds.has(p.id)){ window.genericPersonSeenIds.add(p.id); container.innerHTML += makePersonCard(p); }});
    if (!container.children.length) container.innerHTML = `<div class="person-empty-state">${LANG==='fa'?'فعلاً نتیجه‌ای پیدا نشد. دوباره بارگذاری کن.':'No people found yet. Try loading more.'}</div>`;
    if (btn) btn.style.display='block';
  };
  window.searchGenericPeople = function(q){
    const clearBtn=document.getElementById('gg-person-search-clear');
    if(clearBtn) clearBtn.style.display = q.trim() ? 'block' : 'none';
    if (genericPersonSearchTimer) clearTimeout(genericPersonSearchTimer);
    genericPersonSearchTimer=setTimeout(async()=>{
      genericPersonSearchQuery = q.trim();
      genericPage = 1;
      window.genericPersonSeenIds = new Set();
      const container=document.getElementById('gg-content');
      if(container) container.innerHTML='';
      if(!genericPersonSearchQuery){ loadGenericData(); return; }
      await loadGenericPersonSearch(genericPersonSearchQuery);
    },140);
  };
  window.loadGenericPersonSearch = async function(q){
    const container=document.getElementById('gg-content');
    const btn=document.getElementById('btn-more-g');
    if(btn) btn.style.display='none';
    if(!container) return;
    const rawQ=String(q||'').trim();
    const enQ=_queryToEnglishV22(rawQ);
    container.innerHTML = `<div class="person-empty-state"><i class="fa-solid fa-spinner fa-spin" style="font-size:24px;color:var(--primary);display:block;margin-bottom:10px;"></i>${LANG==='fa'?'در حال جستجو...':'Searching...'}</div>`;
    const terms=[rawQ,enQ].filter(Boolean).filter((v,i,a)=>a.findIndex(x=>_normV22(x)===_normV22(v))===i);
    let all=[];
    for(const term of terms){
      for(let page=1; page<=4; page++){
        try{ const d=await getDataEN(`search/person?query=${encodeURIComponent(term)}&include_adult=false&page=${page}`); if(d&&d.results) all=all.concat(d.results); if(!d || page >= (d.total_pages||1)) break; }catch(e){break;}
      }
      if (LANG === 'fa') {
        try{ const d=await getData(`search/person?query=${encodeURIComponent(term)}&include_adult=false&page=1`); if(d&&d.results) all=all.concat(d.results); }catch(e){}
      }
    }
    const seen=new Set();
    const final=[];
    for(const raw of all){
      if(!raw || seen.has(raw.id)) continue;
      seen.add(raw.id);
      let p=await _detailV22(raw);
      if (!(await _validForTypeV22(p, genericType))) continue;
      if (genericType === 'director_list') p.known_for_department='Directing';
      const s1=_nameScoreV22(p.name, rawQ);
      const s2=enQ!==rawQ ? _nameScoreV22(p.name, enQ) : 0;
      const score=Math.max(s1,s2);
      if(score>0) final.push({...p,_matchScoreV22:score});
    }
    final.sort((a,b)=>(b._matchScoreV22-a._matchScoreV22) || (scorePersonForList(b,genericType)-scorePersonForList(a,genericType)));
    container.innerHTML='';
    if(!final.length){
      container.innerHTML=`<div class="person-empty-state">${LANG==='fa'?'شخصی با این نام در همین دسته‌بندی پیدا نشد.':'No matching person found in this category.'}</div>`;
      return;
    }
    final.slice(0,80).forEach(p=> container.innerHTML += makePersonCard(p));
  };
})();
