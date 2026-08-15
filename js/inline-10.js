
/* ===== v40.10.10 readability + sidebar accordion behavior ===== */
(function(){
  var FN_APP_VERSION_40105 = 'v40.10.10';
  function isFa(){ try { return (typeof LANG !== 'undefined' ? LANG : localStorage.getItem('lang')) === 'fa'; } catch(e){ return false; } }
  function setVersion(){
    try { window.FAMILY_NIGHT_VERSION = FN_APP_VERSION_40105; } catch(e){}
    document.querySelectorAll('.fn-about-version').forEach(function(el){ el.textContent = '🚀 Family Night ' + FN_APP_VERSION_40105; });
  }
  function fixSettingsLanguageTitle(){
    var btn = document.getElementById('fn-settings-language-main-toggle');
    if (!btn) return;
    var title = btn.querySelector('.fn-toggle-title');
    if (title) {
      title.textContent = isFa() ? 'زبان' : 'Language';
      title.style.color = 'var(--text)';
      title.style.opacity = '1';
      title.style.visibility = 'visible';
      title.style.display = 'inline-block';
    }
  }
  function enhanceSearchReadability(){
    var search = document.getElementById('search-tab');
    if (!search) return;
    var light = document.body.classList.contains('theme-light') || /^(day|telegramDay)$/.test(document.body.getAttribute('data-theme') || '');
    if (!light) return;
    search.querySelectorAll('.actor-name,.company-name,.company-type,.m-title,.sec-title,.search-history-text,.search-history-clear').forEach(function(el){
      el.style.color = '#111827';
      el.style.opacity = '1';
    });
    search.querySelectorAll('.sec-more,.search-history-icon').forEach(function(el){
      el.style.color = '#4b5563';
      el.style.opacity = '1';
    });
  }
  window.toggleSidebarPanel40105 = function(id){
    var target = document.getElementById(id);
    if (!target) return;
    var sidebar = document.getElementById('sidebar') || document;
    var wasOpen = target.style.display === 'block' || target.classList.contains('fn-sb-open');
    sidebar.querySelectorAll('.sb-sub-list').forEach(function(panel){
      panel.style.display = 'none';
      panel.classList.remove('fn-sb-open');
    });
    sidebar.querySelectorAll('.sb-item.fn-sb-toggle-open').forEach(function(item){ item.classList.remove('fn-sb-toggle-open'); });
    if (!wasOpen) {
      target.style.display = 'block';
      target.classList.add('fn-sb-open');
      var trigger = sidebar.querySelector('[onclick*="'+id+'"]');
      if (trigger) trigger.classList.add('fn-sb-toggle-open');
    }
  };
  function upgradeSidebarToggles(){
    var sidebar = document.getElementById('sidebar');
    if (!sidebar) return;
    sidebar.querySelectorAll('[onclick*="toggleSidebarPanel40104"]').forEach(function(el){
      var onclick = el.getAttribute('onclick') || '';
      onclick = onclick.replace(/toggleSidebarPanel40104/g, 'toggleSidebarPanel40105');
      el.setAttribute('onclick', onclick);
    });
    sidebar.querySelectorAll('.sb-item').forEach(function(item){
      var onclick = item.getAttribute('onclick') || '';
      var m = onclick.match(/toggleSub\(['"]([^'"]+)['"]\)/);
      if (m && !item.__fnSingleOpenBound) {
        item.__fnSingleOpenBound = true;
        item.addEventListener('click', function(){
          var keepId = m[1];
          setTimeout(function(){
            sidebar.querySelectorAll('.sb-sub-list').forEach(function(panel){
              if (panel.id !== keepId && panel.style.display === 'block') panel.style.display = 'none';
            });
          }, 0);
        }, true);
      }
    });
  }
  function run(){
    try { setVersion(); fixSettingsLanguageTitle(); enhanceSearchReadability(); upgradeSidebarToggles(); } catch(e){ console.warn('v40.10.10 patch failed', e); }
  }
  var oldApplyLang = (typeof applyLang === 'function') ? applyLang : null;
  if (oldApplyLang && !oldApplyLang.__v40105Wrapped) {
    applyLang = function(){ var r = oldApplyLang.apply(this, arguments); setTimeout(run, 0); setTimeout(run, 300); return r; };
    applyLang.__v40105Wrapped = true;
  }
  var oldTheme = (typeof applyCreativeTheme === 'function') ? applyCreativeTheme : null;
  if (oldTheme && !oldTheme.__v40105Wrapped) {
    applyCreativeTheme = function(){ var r = oldTheme.apply(this, arguments); setTimeout(run, 0); setTimeout(run, 300); return r; };
    applyCreativeTheme.__v40105Wrapped = true;
  }
  document.addEventListener('DOMContentLoaded', function(){ run(); [100,350,800,1600,2800].forEach(function(t){ setTimeout(run, t); }); });
  window.addEventListener('load', function(){ run(); setTimeout(run, 900); });
})();
