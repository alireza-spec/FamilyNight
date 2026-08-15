
(function(){
  'use strict';
  var FN_VER = 'v40.10.10';
  function isFa(){ try { return (typeof LANG !== 'undefined' ? LANG : localStorage.getItem('lang')) === 'fa'; } catch(e){ return false; } }
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]); }); }
  function ratingsObj(){ try { return JSON.parse(localStorage.getItem('family_personal_ratings_v1') || '{}') || {}; } catch(e){ return {}; } }
  function ratingBadgeHtml(stars){
    stars = Math.max(1, Math.min(5, Number(stars)||0));
    if (!stars) return '';
    return '<div class="fn-my-rating-badge-card" title="My rating"><div class="fn-rating-star">★<span class="fn-rating-num">'+stars+'</span></div></div>';
  }
  function extractCardId(card){
    var oc = card && card.getAttribute ? (card.getAttribute('onclick') || '') : '';
    var m = oc.match(/openDetail\((\d+)/);
    return m ? String(m[1]) : '';
  }
  function cleanCardStars(card){
    if (!card || !card.querySelectorAll) return;
    try {
      card.querySelectorAll('div[style*="bottom:5px"],div[style*="bottom: 5px"]').forEach(function(el){
        if ((el.textContent || '').indexOf('★') > -1) el.remove();
      });
      card.querySelectorAll('.meta-sub span').forEach(function(el){
        if ((el.textContent || '').indexOf('★') > -1) el.remove();
      });
      card.querySelectorAll('.meta-sub').forEach(function(el){
        if ((el.textContent || '').match(/[★☆]{1,5}/)) {
          Array.from(el.childNodes).forEach(function(n){ if ((n.textContent || '').match(/[★☆]/)) n.remove(); });
        }
      });
    } catch(e) {}
  }
  function refreshVisibleRatingBadges(root){
    var scope = root && root.querySelectorAll ? root : document;
    var rs = ratingsObj();
    try {
      scope.querySelectorAll('.card').forEach(function(card){
        cleanCardStars(card);
        var id = extractCardId(card);
        var r = id && rs[id] ? rs[id] : null;
        var stars = r && Number(r.stars) > 0 ? Number(r.stars) : 0;
        var old = card.querySelector('.fn-my-rating-badge-card');
        if (!stars) { if (old) old.remove(); return; }
        if (!old) {
          card.insertAdjacentHTML('afterbegin', ratingBadgeHtml(stars));
        } else {
          var num = old.querySelector('.fn-rating-num');
          if (num) num.textContent = String(stars);
        }
      });
    } catch(e) {}
  }
  function patchMakeCard(){
    if (typeof makeCard !== 'function' || makeCard.__fn401010) return;
    var oldMake = makeCard;
    makeCard = function(m, type){
      var html = oldMake.apply(this, arguments);
      try {
        var id = m && m.id != null ? String(m.id) : '';
        var r = id ? ratingsObj()[id] : null;
        var stars = r && Number(r.stars) > 0 ? Number(r.stars) : 0;
        html = String(html || '');
        html = html.replace(/<div style="position:absolute;bottom:5px;right:5px;background:rgba\(0,0,0,0\.8\);color:#f5c518;font-size:10px;padding:2px 5px;border-radius:4px;">[\s\S]*?<\/div>/g, '');
        html = html.replace(/<span style="color:#f5c518;font-size:11px;">[\s\S]*?<\/span>/g, '');
        html = html.replace(/<div class="meta-sub" style="flex-direction:column;gap:1px;">\s*<span>([\s\S]*?)<\/span>\s*<\/div>/g, '<div class="meta-sub"><span>$1</span></div>');
        if (stars) html = html.replace(/(<div class="card"[^>]*>)/, '$1' + ratingBadgeHtml(stars));
      } catch(e) {}
      return html;
    };
    makeCard.__fn401010 = true;
  }
  function showOpinion(open, scrollIt){
    var chips = document.getElementById('opinion-chips');
    if (!chips) return;
    if (open) {
      chips.classList.remove('fn-opinion-collapsed');
      chips.classList.add('fn-opinion-open');
      chips.style.display = 'block';
      if (scrollIt) setTimeout(function(){ try { chips.scrollIntoView({behavior:'smooth', block:'center'}); } catch(e){} }, 80);
    } else {
      chips.classList.add('fn-opinion-collapsed');
      chips.classList.remove('fn-opinion-open');
      chips.style.display = 'none';
    }
  }
  function patchRatingFunctions(){
    try {
      if (typeof renderPersonalRating === 'function' && !renderPersonalRating.__fn401010) {
        var oldRender = renderPersonalRating;
        renderPersonalRating = function(){
          var out = oldRender.apply(this, arguments);
          if (!window.__fn401010KeepOpinionOpen) showOpinion(false, false);
          return out;
        };
        renderPersonalRating.__fn401010 = true;
      }
      if (typeof setPersonalRating === 'function' && !setPersonalRating.__fn401010) {
        var oldSet = setPersonalRating;
        setPersonalRating = function(stars){
          window.__fn401010KeepOpinionOpen = true;
          var out = oldSet.apply(this, arguments);
          window.__fn401010KeepOpinionOpen = false;
          try { if (typeof renderOpinionChips === 'function') renderOpinionChips(); } catch(e) {}
          showOpinion(true, true);
          setTimeout(function(){ refreshVisibleRatingBadges(document); try { if (typeof loadFavorites === 'function') loadFavorites(); } catch(e){} }, 100);
          return out;
        };
        setPersonalRating.__fn401010 = true;
      }
      if (typeof setRatingOpinion === 'function' && !setRatingOpinion.__fn401010) {
        var oldOp = setRatingOpinion;
        setRatingOpinion = function(opinion){
          var out = oldOp.apply(this, arguments);
          showOpinion(false, false);
          setTimeout(function(){ refreshVisibleRatingBadges(document); }, 80);
          return out;
        };
        setRatingOpinion.__fn401010 = true;
      }
      if (typeof clearPersonalRating === 'function' && !clearPersonalRating.__fn401010) {
        var oldClear = clearPersonalRating;
        clearPersonalRating = function(){
          var out = oldClear.apply(this, arguments);
          showOpinion(false, false);
          setTimeout(function(){ refreshVisibleRatingBadges(document); try { if (typeof loadFavorites === 'function') loadFavorites(); } catch(e){} }, 100);
          return out;
        };
        clearPersonalRating.__fn401010 = true;
      }
      if (typeof loadFavorites === 'function' && !loadFavorites.__fn401010) {
        var oldLoadFav = loadFavorites;
        loadFavorites = function(){
          var out = oldLoadFav.apply(this, arguments);
          setTimeout(function(){ refreshVisibleRatingBadges(document); }, 60);
          return out;
        };
        loadFavorites.__fn401010 = true;
      }
    } catch(e) { console.warn('v40.10.10 rating patch failed', e); }
  }
  document.addEventListener('click', function(e){
    var target = e.target;
    if (!target || !target.closest) return;
    var sec = target.closest('#personal-rating-section');
    if (!sec || target.closest('.star-btn,.personal-rating-clear,#opinion-chips')) return;
    var chips = document.getElementById('opinion-chips');
    var open = chips && chips.style.display !== 'none' && !chips.classList.contains('fn-opinion-collapsed');
    if (!open) { try { if (typeof renderOpinionChips === 'function') renderOpinionChips(); } catch(e){} }
    showOpinion(!open, false);
  });

  var knownAwards = {
    tt0068646:{wins:31,noms:31}, tt0071562:{wins:17,noms:20}, tt0111161:{wins:21,noms:43}, tt0468569:{wins:163,noms:164},
    tt0108052:{wins:91,noms:49}, tt0110912:{wins:69,noms:72}, tt0137523:{wins:12,noms:38}, tt0109830:{wins:51,noms:75},
    tt0167260:{wins:215,noms:124}, tt0120737:{wins:125,noms:127}, tt0167261:{wins:130,noms:138}, tt1375666:{wins:159,noms:220},
    tt0133093:{wins:42,noms:52}, tt0816692:{wins:44,noms:148}, tt0120815:{wins:79,noms:75}, tt0080684:{wins:27,noms:20},
    tt0944947:{wins:397,noms:650}, tt0903747:{wins:154,noms:247}, tt7366338:{wins:84,noms:61}, tt1475582:{wins:93,noms:184}
  };
  function parseAwards(text){
    text = String(text || '');
    var wins = 0, noms = 0;
    var m = text.match(/(\d+)\s+wins?/i); if (m) wins = parseInt(m[1],10) || 0;
    m = text.match(/(\d+)\s+nominations?/i); if (m) noms = parseInt(m[1],10) || 0;
    var won = text.match(/Won\s+(\d+)\s+(?:Oscars?|Primetime Emmys?|Emmys?|Golden Globes?|BAFTAs?)/ig) || [];
    if (!wins) won.forEach(function(x){ var n = x.match(/\d+/); if(n) wins += parseInt(n[0],10)||0; });
    var nom = text.match(/Nominated\s+for\s+(\d+)\s+(?:Oscars?|Primetime Emmys?|Emmys?|Golden Globes?|BAFTAs?)/ig) || [];
    if (!noms) nom.forEach(function(x){ var n = x.match(/\d+/); if(n) noms += parseInt(n[0],10)||0; });
    return {wins:wins,noms:noms,raw:text};
  }
  async function fetchOmdb(imdbId){
    if (!imdbId) return null;
    try { var c = localStorage.getItem('fn_omdb_awards_' + imdbId); if (c) return JSON.parse(c); } catch(e) {}
    try {
      var r = await fetch('https://www.omdbapi.com/?i=' + encodeURIComponent(imdbId) + '&apikey=f6dd47c8');
      if (r && r.ok) { var d = await r.json(); try { localStorage.setItem('fn_omdb_awards_' + imdbId, JSON.stringify(d)); } catch(e2){} return d; }
    } catch(e) {}
    return null;
  }
  async function ensureFullData(item){
    var d = item && item.data ? item.data : {};
    try {
      if ((!d.external_ids || !d.external_ids.imdb_id) && typeof getData === 'function' && item && item.type && item.id) {
        var fd = await getData(item.type + '/' + item.id + '?append_to_response=external_ids');
        if (fd) d = Object.assign({}, d, fd);
      }
    } catch(e) {}
    return d || {};
  }
  function imdbId(d){ return d && d.external_ids && d.external_ids.imdb_id ? d.external_ids.imdb_id : ''; }
  function runtime(d){ return d && (Number(d.runtime)|| (d.episode_run_time && Number(d.episode_run_time[0])) || 0); }
  function awards(imdb, omdb){ var a = parseAwards(omdb && omdb.Awards); if ((!a.wins && !a.noms) && imdb && knownAwards[imdb]) a = knownAwards[imdb]; return {wins:Number(a.wins)||0,noms:Number(a.noms)||0}; }
  function rt(omdb){ var r = omdb && omdb.Ratings && omdb.Ratings.find(function(x){ return x.Source === 'Rotten Tomatoes'; }); return r ? parseInt(r.Value,10) : null; }
  function meta(omdb){ return omdb && omdb.Metascore && omdb.Metascore !== 'N/A' ? parseInt(omdb.Metascore,10) : null; }
  function posterUrl(d){ var base = (typeof IMG_LG !== 'undefined' ? IMG_LG : 'https://family-night-api.alirezadoe8.workers.dev/img/w500'); return d && d.poster_path ? base + d.poster_path : ''; }
  function patchCompare(){
    if (typeof showCompareModal !== 'function' || showCompareModal.__fn401010) return;
    showCompareModal = async function(){
      var modal = document.getElementById('compare-modal');
      var content = document.getElementById('compare-content');
      if (!modal || !content || typeof compareItems === 'undefined' || !compareItems || compareItems.length < 2) return;
      modal.classList.add('open');
      var a = compareItems[0], b = compareItems[1];
      var fa = isFa();
      content.innerHTML = '<div class="compare-col" style="grid-column:1/-1;text-align:center;padding:18px;color:#999;"><i class="fa-solid fa-spinner fa-spin"></i> '+(fa?'در حال تکمیل اطلاعات مقایسه...':'Completing comparison data...')+'</div>';
      var ad = await ensureFullData(a), bd = await ensureFullData(b);
      a.data = ad; b.data = bd;
      var ay = (ad.release_date || ad.first_air_date || '').split('-')[0];
      var by = (bd.release_date || bd.first_air_date || '').split('-')[0];
      var ar = parseFloat(ad.vote_average || 0), br = parseFloat(bd.vote_average || 0);
      var av = parseInt(ad.vote_count || 0, 10), bv = parseInt(bd.vote_count || 0, 10);
      var aru = runtime(ad), bru = runtime(bd);
      var ai = imdbId(ad), bi = imdbId(bd);
      var om = await Promise.all([fetchOmdb(ai), fetchOmdb(bi)]);
      var aa = awards(ai, om[0]), ba = awards(bi, om[1]);
      var art = rt(om[0]), brt = rt(om[1]), amet = meta(om[0]), bmet = meta(om[1]);
      var winStyle='color:#4ade80;font-weight:900;', loseStyle='color:#888;';
      function cell(label, val, win){ return '<div class="compare-col" style="background:#0d0d0d;"><div class="compare-row"><div class="compare-key">'+label+'</div><div class="compare-val" style="'+(win?winStyle:loseStyle)+'">'+val+(win?' ✓':'')+'</div></div></div>'; }
      function row(label, left, right, aWin){ return cell(label,left,aWin===true)+cell(label,right,aWin===false); }
      function colorRT(s){ if(s===null || isNaN(s)) return '—'; var c=s>=75?'#4ade80':s>=60?'#facc15':'#f87171'; return '<span style="color:'+c+';font-weight:bold;">'+s+'%</span>'; }
      function colorMeta(s){ if(s===null || isNaN(s)) return '—'; var c=s>=61?'#4ade80':s>=40?'#facc15':'#f87171'; return '<span style="background:'+c+';color:#000;padding:2px 6px;border-radius:4px;font-weight:bold;">'+s+'</span>'; }
      content.innerHTML = ''+
        '<div class="compare-col"><img src="'+esc(posterUrl(ad))+'" class="compare-poster" loading="lazy"><div class="compare-name">'+esc(a.title)+'</div></div>'+
        '<div class="compare-col"><img src="'+esc(posterUrl(bd))+'" class="compare-poster" loading="lazy"><div class="compare-name">'+esc(b.title)+'</div></div>'+
        row('📅 '+(fa?'سال':'Year'), esc(ay||'—'), esc(by||'—'), parseInt(ay||0,10) > parseInt(by||0,10))+
        row('⭐ IMDb', ar.toFixed(1), br.toFixed(1), ar >= br)+
        row('🗳️ '+(fa?'آرا':'Votes'), av.toLocaleString(), bv.toLocaleString(), av >= bv)+
        ((aru||bru) ? row('⏱️ '+(fa?'مدت':'Runtime'), aru?aru+'min':'—', bru?bru+'min':'—', aru >= bru) : '')+
        ((art!==null||brt!==null) ? cell('🍅 Rotten Tomatoes', colorRT(art), false).replace(/style="color:#888;"/,'') + cell('🍅 Rotten Tomatoes', colorRT(brt), false).replace(/style="color:#888;"/,'') : '')+
        ((amet!==null||bmet!==null) ? cell('🎯 Metacritic', colorMeta(amet), false).replace(/style="color:#888;"/,'') + cell('🎯 Metacritic', colorMeta(bmet), false).replace(/style="color:#888;"/,'') : '')+
        row('🏆 '+(fa?'جوایز کسب‌شده':'Awards Won'), String(aa.wins), String(ba.wins), aa.wins >= ba.wins)+
        row('🎖️ '+(fa?'نامزدی‌ها':'Nominations'), String(aa.noms), String(ba.noms), aa.noms >= ba.noms)+
        '<div class="compare-awards-source">'+(fa?'منبع جوایز: OMDb/IMDb summary؛ اگر در دسترس نباشد برای آثار شناخته‌شده از داده پشتیبان داخلی استفاده می‌شود.':'Awards source: OMDb/IMDb summary; if unavailable, known titles use an internal fallback.')+'</div>'+
        '<div style="grid-column:1/-1;padding:16px;"><button id="compare-ai-btn" onclick="runCompareAI()" style="width:100%;padding:14px;background:linear-gradient(135deg,#1a0a33,#3a1070);border:1px solid rgba(168,85,247,0.4);border-radius:14px;color:white;font-size:14px;font-weight:bold;cursor:pointer;font-family:\'Vazirmatn\',sans-serif;display:flex;align-items:center;justify-content:center;gap:10px;transition:0.2s;"><div style="width:22px;height:22px;background:linear-gradient(135deg,#7c3aed,#4285f4,#06b6d4);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;color:white;font-weight:bold;">✦</div>'+(fa?'از هوش مصنوعی بپرس کدام بهتره؟':'Ask AI: Which one is better?')+'</button><div id="compare-ai-result" style="display:none;margin-top:14px;padding:14px;background:rgba(100,50,200,0.08);border:1px solid rgba(168,85,247,0.2);border-radius:12px;"><div style="font-size:11px;color:#a855f7;margin-bottom:8px;display:flex;align-items:center;gap:6px;"><div style="width:16px;height:16px;background:linear-gradient(135deg,#7c3aed,#4285f4);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:9px;color:white;">✦</div>'+(fa?'نظر هوش مصنوعی':'AI Analysis')+'</div><div id="compare-ai-text" style="font-size:13px;color:#e0e0e0;line-height:1.8;white-space:pre-wrap;"></div></div></div>';
      compareItems = [];
      window._compareDataForAI = { a:a, b:b, aData:ad, bData:bd, aRate:ar, bRate:br, aVotes:av, bVotes:bv, aRuntime:aru, bRuntime:bru, aAwards:aa, bAwards:ba, aRT:art, bRT:brt, aMeta:amet, bMeta:bmet, aYear:ay, bYear:by };
    };
    showCompareModal.__fn401010 = true;
  }
  function updateVersion(){
    try { document.querySelectorAll('.fn-about-version').forEach(function(el){ el.textContent = '🚀 Family Night ' + FN_VER; }); } catch(e) {}
  }
  function init(){
    patchMakeCard(); patchRatingFunctions(); patchCompare(); updateVersion(); refreshVisibleRatingBadges(document); showOpinion(false,false);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  window.addEventListener('load', function(){ setTimeout(init, 200); setTimeout(function(){ refreshVisibleRatingBadges(document); updateVersion(); }, 1200); });
})();
