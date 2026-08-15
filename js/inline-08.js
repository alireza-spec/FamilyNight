
/* ===== v40.10.10 Settings theme labels + flag language picker ===== */
(function(){
  var FN_APP_VERSION_40102 = 'v40.10.10';
  var UK_FLAG_URL = 'https://flagcdn.com/gb.svg';
  var IRAN_FLAG_URL_40102 = 'https://flagofiran.com/files/Flag_of_Iran.svg';
  function faMode(){
    try { return (typeof LANG !== 'undefined' ? LANG : localStorage.getItem('lang')) === 'fa'; }
    catch(e){ return false; }
  }
  function esc(s){ return String(s || '').replace(/[&<>"']/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]); }); }
  var THEME_LABELS_40102 = {
    netflix:{en:['Netflix Classic','Red · Dark · Bold'],fa:['کلاسیک نتفلیکس','قرمز · تیره · جسور']},
    ocean:{en:['Midnight Ocean','Blue · Deep · Elegant'],fa:['اقیانوس نیمه‌شب','آبی · عمیق · شیک']},
    forest:{en:['Forest Night','Green · Natural · Calm'],fa:['جنگل شب','سبز · طبیعی · آرام']},
    violet:{en:['Royal Violet','Purple · Luxe · Magic'],fa:['بنفش سلطنتی','بنفش · لوکس · جادویی']},
    gold:{en:['Golden Hour','Gold · Warm · Premium'],fa:['ساعت طلایی','طلایی · گرم · پریمیوم']},
    rose:{en:['Sunset Rose','Pink · Vibrant · Trendy'],fa:['غروب رز','صورتی · زنده · مدرن']},
    cyber:{en:['Cyberpunk','Neon · Futuristic · Edge'],fa:['سایبرپانک','نئون · آینده‌نگر · تیز']},
    ember:{en:['Ember Fire','Orange · Intense · Warm'],fa:['آتش امبر','نارنجی · گرم · پرانرژی']},
    dayMood:{en:['Day Mood','White · Gray · Black'],fa:['حال و هوای روز','سفید · خاکستری · مشکی']},
    telegramDay:{en:['Telegram Day','White · Sky Blue · Clean'],fa:['روز تلگرامی','سفید · آبی آسمانی · تمیز']},
    softDarkGray:{en:['Soft Dark Gray','Dark · Gray · Soft'],fa:['خاکستری دارک ملایم','تیره · خاکستری · نرم']},
    grayBlue:{en:['Gray Blue','Gray · Blue · Balanced'],fa:['خاکستری آبی','خاکستری · آبی · متعادل']}
  };
  function setCardLabel(id, title, sub){
    var card = document.getElementById('theme-card-' + id);
    if (!card) return;
    var children = card.children;
    if (children[2]) { children[2].textContent = title; children[2].setAttribute('dir','auto'); }
    if (children[3]) { children[3].textContent = sub; children[3].setAttribute('dir','auto'); }
  }
  function localizeThemeCards(){
    var lang = faMode() ? 'fa' : 'en';
    Object.keys(THEME_LABELS_40102).forEach(function(id){
      var arr = THEME_LABELS_40102[id][lang];
      setCardLabel(id, arr[0], arr[1]);
    });
  }
  function renderHeaderLanguageFlags(){
    var fa = faMode();
    var nextSrc = fa ? UK_FLAG_URL : IRAN_FLAG_URL_40102;
    var nextLabel = fa ? 'Switch to English' : 'تغییر زبان به فارسی';
    var fallback = fa ? 'EN' : 'FA';
    var htmlFlag = '<img class="fn-lang-flag" src="'+esc(nextSrc)+'" alt="'+esc(nextLabel)+'" onerror="this.parentElement.textContent=\''+fallback+'\'">';
    var main = document.getElementById('lang-toggle-icon');
    if (main && main.innerHTML !== htmlFlag) { main.innerHTML = htmlFlag; main.setAttribute('title', nextLabel); }
    document.querySelectorAll('.fn-lang-mini-text').forEach(function(el){
      if (el.innerHTML !== htmlFlag) { el.innerHTML = htmlFlag; el.setAttribute('title', nextLabel); }
    });
    var mainBtn = document.getElementById('lang-toggle-btn');
    if (mainBtn) mainBtn.setAttribute('title', nextLabel);
    document.querySelectorAll('.fn-lang-mini').forEach(function(btn){ btn.setAttribute('title', nextLabel); });
  }
  function setAppLang40102(lang){
    try {
      if (typeof LANG !== 'undefined') LANG = lang;
      localStorage.setItem('lang', lang);
    } catch(e) {}
    location.reload();
  }
  window.setAppLang40102 = setAppLang40102;
  function languagePickerHTML(){
    var fa = faMode();
    var enActive = !fa, faActive = fa;
    return ''+
      '<div id="fn-settings-language-picker" class="fn-language-picker">'+
        '<button type="button" class="fn-language-toggle" aria-expanded="false">'+
          '<span class="left"><span class="badge"><i class="fa-solid fa-language"></i></span><span class="title">'+(fa?'زبان':'Language')+'</span></span>'+
          '<i class="fa-solid fa-chevron-down chev"></i>'+
        '</button>'+
        '<div class="fn-language-options">'+
          '<button type="button" class="fn-language-option '+(enActive?'active':'')+'" style="--flag-bg:url('+UK_FLAG_URL+')" onclick="setAppLang40102(\'en\')" dir="ltr">'+
            '<img src="'+UK_FLAG_URL+'" alt="United Kingdom flag"><span>English</span><small>United Kingdom</small>'+ 
          '</button>'+ 
          '<button type="button" class="fn-language-option '+(faActive?'active':'')+'" style="--flag-bg:url('+IRAN_FLAG_URL_40102+')" onclick="setAppLang40102(\'fa\')" dir="rtl">'+
            '<img src="'+IRAN_FLAG_URL_40102+'" alt="پرچم ایران"><span>فارسی</span><small>ایران</small>'+ 
          '</button>'+ 
        '</div>'+ 
      '</div>';
  }
  function installSettingsLanguagePicker(){
    var themeSection = document.getElementById('txt-theme-head');
    themeSection = themeSection ? themeSection.closest('.setting-section') : null;
    if (!themeSection) return;
    var oldBtn = themeSection.querySelector('button[onclick="toggleLang()"]');
    if (oldBtn) {
      oldBtn.classList.add('fn-lang-wide-legacy');
      if (oldBtn.parentElement) oldBtn.parentElement.classList.add('fn-lang-wide-legacy');
    }
    var holder = document.getElementById('fn-settings-language-picker');
    if (!holder) {
      var div = document.createElement('div');
      div.innerHTML = languagePickerHTML();
      var node = div.firstElementChild;
      var grid = themeSection.querySelector('[style*="grid-template-columns"]');
      var legacyWrap = oldBtn ? oldBtn.parentElement : null;
      if (legacyWrap && legacyWrap.parentNode) legacyWrap.parentNode.insertBefore(node, legacyWrap.nextSibling);
      else if (grid && grid.parentNode) grid.parentNode.insertBefore(node, grid.nextSibling);
      else themeSection.appendChild(node);
      holder = node;
    } else {
      var optionsOld = holder.querySelector('.fn-language-options');
      var isOpen = optionsOld && optionsOld.classList.contains('open');
      holder.outerHTML = languagePickerHTML();
      holder = document.getElementById('fn-settings-language-picker');
      if (isOpen && holder) {
        var t = holder.querySelector('.fn-language-toggle');
        var o = holder.querySelector('.fn-language-options');
        if (t) { t.classList.add('open'); t.setAttribute('aria-expanded','true'); }
        if (o) o.classList.add('open');
      }
    }
    if (holder && !holder.__fnLangPickerBound) {
      holder.__fnLangPickerBound = true;
      holder.addEventListener('click', function(e){
        var toggle = e.target.closest('.fn-language-toggle');
        if (!toggle) return;
        var options = holder.querySelector('.fn-language-options');
        var open = !options.classList.contains('open');
        options.classList.toggle('open', open);
        toggle.classList.toggle('open', open);
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }
  }
  function updateVersion40102(){
    try {
      window.FAMILY_NIGHT_VERSION = FN_APP_VERSION_40102;
      document.querySelectorAll('.fn-about-version').forEach(function(el){
        el.textContent = '🚀 Family Night ' + FN_APP_VERSION_40102;
      });
    } catch(e) {}
  }
  function applyAll40102(){
    localizeThemeCards();
    renderHeaderLanguageFlags();
    installSettingsLanguagePicker();
    updateVersion40102();
  }
  var oldSync = (typeof syncGlobalHeaderControls === 'function') ? syncGlobalHeaderControls : null;
  if (oldSync && !oldSync.__flags40102Wrapped) {
    syncGlobalHeaderControls = function(){
      var r = oldSync.apply(this, arguments);
      renderHeaderLanguageFlags();
      return r;
    };
    syncGlobalHeaderControls.__flags40102Wrapped = true;
  }
  var oldApplyLang40102 = (typeof applyLang === 'function') ? applyLang : null;
  if (oldApplyLang40102 && !oldApplyLang40102.__settings40102Wrapped) {
    applyLang = function(){
      var r = oldApplyLang40102.apply(this, arguments);
      setTimeout(applyAll40102, 0);
      setTimeout(applyAll40102, 250);
      return r;
    };
    applyLang.__settings40102Wrapped = true;
  }
  document.addEventListener('DOMContentLoaded', function(){
    applyAll40102();
    [80,300,700,1500,2600].forEach(function(t){ setTimeout(applyAll40102, t); });
    try {
      var settings = document.getElementById('settings-tab');
      if (settings && window.MutationObserver) {
        var pending = false;
        new MutationObserver(function(){
          if (pending) return;
          pending = true;
          setTimeout(function(){ pending = false; applyAll40102(); }, 80);
        }).observe(settings, {childList:true, subtree:true, characterData:true});
      }
    } catch(e) {}
  });
  window.addEventListener('load', function(){ applyAll40102(); setTimeout(applyAll40102, 1200); });
})();
