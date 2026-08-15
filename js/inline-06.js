
/* ===== v39 safe Persian-mode direction and language button fix ===== */
(function(){
  function isFaMode(){
    try { return (typeof LANG !== 'undefined' && LANG === 'fa') || localStorage.getItem('lang') === 'fa'; }
    catch(e){ return false; }
  }
  function setAutoDir(id){
    try { var el = document.getElementById(id); if(el) el.setAttribute('dir','auto'); } catch(e){}
  }
  function applyFaSafeLayout(){
    try {
      var fa = isFaMode();
      document.documentElement.lang = fa ? 'fa' : 'en';
      document.documentElement.dir = 'ltr';
      if (document.body) {
        document.body.setAttribute('dir','ltr');
        document.body.classList.toggle('lang-fa', fa);
        document.body.classList.toggle('lang-en', !fa);
      }
      ['d-title','d-title-fa','d-title-secondary','d-desc','ai-input','ai-fs-input','ai-box-label','ai-context-badge','qotd-text','qotd-fa-text','search-input'].forEach(setAutoDir);
      var mainLangIcon = document.getElementById('lang-toggle-icon');
      if (mainLangIcon) mainLangIcon.textContent = fa ? 'EN' : 'FA';
      document.querySelectorAll('.fn-lang-mini-text').forEach(function(el){ el.textContent = fa ? 'EN' : 'FA'; });
    } catch(e) {}
  }
  var oldApplyLang = (typeof applyLang === 'function') ? applyLang : null;
  if (oldApplyLang && !oldApplyLang.__faSafeWrapped) {
    applyLang = function(){
      var r = oldApplyLang.apply(this, arguments);
      applyFaSafeLayout();
      setTimeout(applyFaSafeLayout, 80);
      return r;
    };
    applyLang.__faSafeWrapped = true;
  }
  var oldOpenDetail = (typeof openDetail === 'function') ? openDetail : null;
  if (oldOpenDetail && !oldOpenDetail.__faSafeWrapped) {
    openDetail = async function(){
      var r = await oldOpenDetail.apply(this, arguments);
      applyFaSafeLayout();
      setTimeout(applyFaSafeLayout, 120);
      setTimeout(applyFaSafeLayout, 600);
      return r;
    };
    openDetail.__faSafeWrapped = true;
  }
  document.addEventListener('DOMContentLoaded', function(){ applyFaSafeLayout(); setTimeout(applyFaSafeLayout, 300); setTimeout(applyFaSafeLayout, 1400); });
  window.addEventListener('load', function(){ applyFaSafeLayout(); setTimeout(applyFaSafeLayout, 500); });
})();
