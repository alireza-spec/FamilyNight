
/* ===== v40.10.10 safe sidebar + settings refinements ===== */
(function(){
  var FN_APP_VERSION_40104 = 'v40.10.10';
  var IR_FLAG_URL = 'https://flagofiran.com/files/Flag_of_Iran.svg';
  function faMode(){ try { return (typeof LANG !== 'undefined' ? LANG : localStorage.getItem('lang')) === 'fa'; } catch(e){ return false; } }
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]); }); }
  function escJs(s){ return String(s == null ? '' : s).replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\n/g,' '); }
  function flagUrl(code, size){
    size = size || 'w40';
    if (String(code).toUpperCase() === 'IR') return IR_FLAG_URL;
    return 'https://flagcdn.com/' + size + '/' + String(code).toLowerCase() + '.png';
  }
  var countriesData = [
    {code:'US', fa:'آمریکا', en:'United States'},
    {code:'GB', fa:'انگلیس', en:'United Kingdom'},
    {code:'IR', fa:'ایران', en:'Iran'},
    {code:'AF', fa:'افغانستان', en:'Afghanistan'}, {code:'DE', fa:'آلمان', en:'Germany'}, {code:'AR', fa:'آرژانتین', en:'Argentina'},
    {code:'ZA', fa:'آفریقای جنوبی', en:'South Africa'}, {code:'AL', fa:'آلبانی', en:'Albania'}, {code:'DZ', fa:'الجزایر', en:'Algeria'},
    {code:'AE', fa:'امارات', en:'UAE'}, {code:'ID', fa:'اندونزی', en:'Indonesia'}, {code:'UA', fa:'اوکراین', en:'Ukraine'},
    {code:'IT', fa:'ایتالیا', en:'Italy'}, {code:'IE', fa:'ایرلند', en:'Ireland'}, {code:'AZ', fa:'آذربایجان', en:'Azerbaijan'},
    {code:'ES', fa:'اسپانیا', en:'Spain'}, {code:'AU', fa:'استرالیا', en:'Australia'}, {code:'AT', fa:'اتریش', en:'Austria'},
    {code:'IL', fa:'اسرائیل', en:'Israel'}, {code:'EE', fa:'استونی', en:'Estonia'}, {code:'AM', fa:'ارمنستان', en:'Armenia'},
    {code:'JO', fa:'اردن', en:'Jordan'}, {code:'UY', fa:'اروگوئه', en:'Uruguay'}, {code:'UZ', fa:'ازبکستان', en:'Uzbekistan'},
    {code:'SK', fa:'اسلواکی', en:'Slovakia'}, {code:'SI', fa:'اسلوونی', en:'Slovenia'}, {code:'EC', fa:'اکوادور', en:'Ecuador'},
    {code:'BG', fa:'بلغارستان', en:'Bulgaria'}, {code:'BE', fa:'بلژیک', en:'Belgium'}, {code:'BD', fa:'بنگلادش', en:'Bangladesh'},
    {code:'BR', fa:'برزیل', en:'Brazil'}, {code:'PK', fa:'پاکستان', en:'Pakistan'}, {code:'PY', fa:'پاراگوئه', en:'Paraguay'},
    {code:'PT', fa:'پرتغال', en:'Portugal'}, {code:'PE', fa:'پرو', en:'Peru'}, {code:'PL', fa:'لهستان', en:'Poland'},
    {code:'TH', fa:'تایلند', en:'Thailand'}, {code:'TW', fa:'تایوان', en:'Taiwan'}, {code:'TR', fa:'ترکیه', en:'Turkey'},
    {code:'TN', fa:'تونس', en:'Tunisia'}, {code:'JP', fa:'ژاپن', en:'Japan'}, {code:'JM', fa:'جامائیکا', en:'Jamaica'},
    {code:'CZ', fa:'جمهوری چک', en:'Czech Republic'}, {code:'CN', fa:'چین', en:'China'}, {code:'DK', fa:'دانمارک', en:'Denmark'},
    {code:'RU', fa:'روسیه', en:'Russia'}, {code:'RO', fa:'رومانی', en:'Romania'}, {code:'NZ', fa:'نیوزلند', en:'New Zealand'},
    {code:'SA', fa:'عربستان', en:'Saudi Arabia'}, {code:'IQ', fa:'عراق', en:'Iraq'}, {code:'OM', fa:'عمان', en:'Oman'},
    {code:'FR', fa:'فرانسه', en:'France'}, {code:'FI', fa:'فنلاند', en:'Finland'}, {code:'PH', fa:'فیلیپین', en:'Philippines'},
    {code:'QA', fa:'قطر', en:'Qatar'}, {code:'KZ', fa:'قزاقستان', en:'Kazakhstan'}, {code:'KG', fa:'قرقیزستان', en:'Kyrgyzstan'},
    {code:'CA', fa:'کانادا', en:'Canada'}, {code:'KR', fa:'کره جنوبی', en:'South Korea'}, {code:'CO', fa:'کلمبیا', en:'Colombia'},
    {code:'KW', fa:'کویت', en:'Kuwait'}, {code:'KE', fa:'کنیا', en:'Kenya'}, {code:'GE', fa:'گرجستان', en:'Georgia'},
    {code:'GH', fa:'غنا', en:'Ghana'}, {code:'LB', fa:'لبنان', en:'Lebanon'}, {code:'LV', fa:'لتونی', en:'Latvia'},
    {code:'LT', fa:'لیتوانی', en:'Lithuania'}, {code:'HU', fa:'مجارستان', en:'Hungary'}, {code:'MA', fa:'مراکش', en:'Morocco'},
    {code:'EG', fa:'مصر', en:'Egypt'}, {code:'MX', fa:'مکزیک', en:'Mexico'}, {code:'MY', fa:'مالزی', en:'Malaysia'},
    {code:'NG', fa:'نیجریه', en:'Nigeria'}, {code:'NO', fa:'نروژ', en:'Norway'}, {code:'NP', fa:'نپال', en:'Nepal'},
    {code:'NL', fa:'هلند', en:'Netherlands'}, {code:'IN', fa:'هند', en:'India'}, {code:'HK', fa:'هنگ کنگ', en:'Hong Kong'},
    {code:'VN', fa:'ویتنام', en:'Vietnam'}, {code:'GR', fa:'یونان', en:'Greece'}, {code:'CL', fa:'شیلی', en:'Chile'},
    {code:'SE', fa:'سوئد', en:'Sweden'}, {code:'CH', fa:'سوئیس', en:'Switzerland'}, {code:'SG', fa:'سنگاپور', en:'Singapore'},
    {code:'LK', fa:'سریلانکا', en:'Sri Lanka'}, {code:'HR', fa:'کرواسی', en:'Croatia'}, {code:'RS', fa:'صربستان', en:'Serbia'},
    {code:'TZ', fa:'تانزانیا', en:'Tanzania'}, {code:'ET', fa:'اتیوپی', en:'Ethiopia'}
  ];
  function orderedCountries(){
    var fa = faMode();
    var first = fa ? ['US','GB','IR'] : ['US','GB','IR'];
    var firstSet = {};
    first.forEach(function(c){ firstSet[c] = true; });
    var head = first.map(function(code){ return countriesData.find(function(c){ return c.code === code; }); }).filter(Boolean);
    var rest = countriesData.filter(function(c){ return !firstSet[c.code]; });
    rest.sort(function(a,b){ return (fa ? a.fa.localeCompare(b.fa, 'fa') : a.en.localeCompare(b.en, 'en')); });
    return head.concat(rest);
  }
  function renderCountriesSidebar(){
    var list = document.getElementById('sb-countries-list');
    if (!list) return;
    list.innerHTML = orderedCountries().map(function(c){
      var name = faMode() ? c.fa : c.en;
      var fu = flagUrl(c.code, 'w80');
      return '<div class="sb-sub-item fn-country-item" style="--flag-bg:url('+esc(fu)+')" onclick="openRandomCountryGrid(\''+escJs(c.code)+'\', \''+escJs(name)+'\'); toggleMenu()">'
        + '<img src="'+esc(fu)+'" loading="lazy" onerror="this.style.display=\'none\'">'
        + '<span>'+esc(name)+'</span>'
        + '</div>';
    }).join('');
  }
  var themes = [
    {id:'netflix', en:'Netflix Classic', fa:'کلاسیک نتفلیکس', subEn:'Red · Dark · Bold', subFa:'قرمز · تیره · جسور', bg:'linear-gradient(135deg,#210000,#520006)', c:['#E50914','#ff4d57','#ffb3b8']},
    {id:'ocean', en:'Midnight Ocean', fa:'اقیانوس نیمه‌شب', subEn:'Blue · Deep · Elegant', subFa:'آبی · عمیق · شیک', bg:'linear-gradient(135deg,#00111f,#004b83)', c:['#0099ff','#38bdf8','#8eeaff']},
    {id:'forest', en:'Forest Night', fa:'جنگل شب', subEn:'Green · Natural · Calm', subFa:'سبز · طبیعی · آرام', bg:'linear-gradient(135deg,#001a0d,#006b33)', c:['#00cc55','#4ade80','#a7f3d0']},
    {id:'violet', en:'Royal Violet', fa:'بنفش سلطنتی', subEn:'Purple · Luxe · Magic', subFa:'بنفش · لوکس · جادویی', bg:'linear-gradient(135deg,#140022,#5b16a3)', c:['#aa44ff','#c084fc','#e9d5ff']},
    {id:'gold', en:'Golden Hour', fa:'ساعت طلایی', subEn:'Gold · Warm · Premium', subFa:'طلایی · گرم · پریمیوم', bg:'linear-gradient(135deg,#2b1a00,#8a5a00)', c:['#ffcc00','#f59e0b','#fff1a8']},
    {id:'rose', en:'Sunset Rose', fa:'غروب رز', subEn:'Pink · Vibrant · Trendy', subFa:'صورتی · زنده · مدرن', bg:'linear-gradient(135deg,#230012,#99104e)', c:['#ff4499','#fb7185','#ffc1dd']},
    {id:'cyber', en:'Cyberpunk', fa:'سایبرپانک', subEn:'Neon · Futuristic', subFa:'نئون · آینده‌نگر', bg:'linear-gradient(135deg,#002222,#008579)', c:['#00ffcc','#22d3ee','#99f6e4']},
    {id:'ember', en:'Ember Fire', fa:'آتش امبر', subEn:'Orange · Warm', subFa:'نارنجی · گرم', bg:'linear-gradient(135deg,#2a0b00,#9a3100)', c:['#ff6600','#fb923c','#fde047']},
    {id:'dayMood', en:'Day Mood', fa:'حال و هوای روز', subEn:'White · Gray · Black', subFa:'سفید · خاکستری · مشکی', bg:'linear-gradient(135deg,#f8fafc,#cbd5e1)', c:['#ffffff','#e5e7eb','#111827']},
    {id:'telegramDay', en:'Telegram Day', fa:'روز تلگرامی', subEn:'White · Sky Blue', subFa:'سفید · آبی آسمانی', bg:'linear-gradient(135deg,#f5fbff,#bfe8ff)', c:['#ffffff','#d9efff','#229ED9']},
    {id:'softDarkGray', en:'Soft Dark Gray', fa:'خاکستری دارک ملایم', subEn:'Dark · Gray · Soft', subFa:'تیره · خاکستری · نرم', bg:'linear-gradient(135deg,#15171a,#4b5563)', c:['#2a2e34','#6b7280','#d1d5db']},
    {id:'grayBlue', en:'Gray Blue', fa:'خاکستری آبی', subEn:'Gray · Blue · Balanced', subFa:'خاکستری · آبی · متعادل', bg:'linear-gradient(135deg,#1c2430,#3b82f6)', c:['#304052','#64748b','#60a5fa']}
  ];
  function renderThemesSidebar(){
    var list = document.getElementById('sb-themes-list');
    if (!list) return;
    var fa = faMode();
    list.innerHTML = themes.map(function(t){
      return '<div class="sb-sub-item fn-sidebar-theme-item" id="sb-theme-card-'+esc(t.id)+'" style="--theme-bg:'+esc(t.bg)+';--theme-c1:'+esc(t.c[0])+'" onclick="applyCreativeTheme(\''+escJs(t.id)+'\')">'
        + '<div><div class="fn-sidebar-theme-name">'+esc(fa ? t.fa : t.en)+'</div><div class="fn-sidebar-theme-sub">'+esc(fa ? t.subFa : t.subEn)+'</div></div>'
        + '<div class="fn-sidebar-swatches">'+t.c.map(function(x){ return '<span class="fn-sidebar-swatch" style="--c:'+esc(x)+'"></span>'; }).join('')+'</div>'
        + '</div>';
    }).join('');
    if (typeof updateActiveThemeMarkers === 'function') updateActiveThemeMarkers();
  }
  function renderAboutSidebar(){
    var list = document.getElementById('sb-about-list');
    if (!list) return;
    var fa = faMode();
    list.innerHTML = '<div class="fn-sidebar-about-box" '+(fa?'dir="rtl"':'dir="ltr"')+'>'
      + '<div class="fn-sidebar-about-title">'+(fa?'درباره Family Night':'About Family Night')+'</div>'
      + '<div class="fn-sidebar-about-text">'+(fa?'اپ Family Night برای کشف فیلم و سریال، جستجو، لیست علاقه‌مندی، تاریخچه تماشا، آزمون‌ها، تم‌های متنوع و تجربه سینمایی شخصی‌سازی‌شده ساخته شده است. توسعه و طراحی توسط علیرضا احمدی.':'Family Night is built for discovering movies and series, search, watchlist, watch history, quizzes, themes and a personalized cinema experience. Designed and developed by Alireza Ahmadi.')+'</div>'
      + '<div class="fn-sidebar-social-grid">'
      + '<a class="fn-sidebar-social-btn fn-social-tg" href="https://t.me/HashtagAlireza" target="_blank"><i class="fa-brands fa-telegram"></i>Telegram</a>'
      + '<a class="fn-sidebar-social-btn fn-social-in" href="https://instagram.com/HashtagAlireza" target="_blank"><i class="fa-brands fa-instagram"></i>Instagram</a>'
      + '<a class="fn-sidebar-social-btn fn-social-yt" href="https://youtube.com/@HashtagAlireza" target="_blank"><i class="fa-brands fa-youtube"></i>YouTube</a>'
      + '<a class="fn-sidebar-social-btn fn-social-x" href="https://twitter.com/HashtagAlireza" target="_blank"><i class="fa-brands fa-x-twitter"></i>Twitter</a>'
      + '</div></div>';
  }
  window.toggleSidebarPanel40104 = function(id){
    var l = document.getElementById(id);
    if (!l) return;
    l.style.display = (l.style.display === 'block') ? 'none' : 'block';
  };
  function ensureSidebarExtras(){
    var sb = document.getElementById('sidebar');
    var countriesList = document.getElementById('sb-countries-list');
    if (!sb || !countriesList) return;
    var topMovie = document.getElementById('sb-top250movies');
    var topSeries = document.getElementById('sb-top250series');
    [topMovie, topSeries].forEach(function(el){
      if (!el) return;
      var parent = el.parentElement;
      if (parent && !parent.querySelector('.fn-imdb-mini')) parent.insertAdjacentHTML('beforeend', '<span class="fn-imdb-mini">IMDb</span>');
    });
    if (!document.getElementById('sb-themes-list')) {
      countriesList.insertAdjacentHTML('afterend',
        '<div class="sb-item" id="sb-themes-toggle" onclick="toggleSidebarPanel40104(\'sb-themes-list\')">'
        + '<span><i class="fa-solid fa-palette" style="width:20px;"></i> <span class="fn-sb-themes-title"></span></span><i class="fa-solid fa-chevron-down"></i></div>'
        + '<div id="sb-themes-list" class="sb-sub-list" style="display:none"></div>'
        + '<div class="sb-item" id="sb-about-toggle" onclick="toggleSidebarPanel40104(\'sb-about-list\')">'
        + '<span><i class="fa-solid fa-circle-info" style="width:20px;"></i> <span class="fn-sb-about-title"></span></span><i class="fa-solid fa-chevron-down"></i></div>'
        + '<div id="sb-about-list" class="sb-sub-list" style="display:none"></div>');
    }
    document.querySelectorAll('.fn-sb-themes-title').forEach(function(x){ x.textContent = faMode() ? 'پوسته‌ها و تم‌ها' : 'Themes'; });
    document.querySelectorAll('.fn-sb-about-title').forEach(function(x){ x.textContent = faMode() ? 'درباره ما' : 'About us'; });
    var sbTitle = sb.querySelector('.sb-title');
    if (sbTitle) sbTitle.textContent = faMode() ? 'منو' : 'Menu';
    renderCountriesSidebar();
    renderThemesSidebar();
    renderAboutSidebar();
  }
  function ensureSettingsLanguageFirst(){
    var settings = document.getElementById('settings-tab');
    if (!settings) return;
    var picker = document.getElementById('fn-settings-language-picker');
    if (!picker) return;
    var themeSection = document.getElementById('txt-theme-head');
    themeSection = themeSection ? themeSection.closest('.setting-section') : null;
    var firstToggle = settings.querySelector('.fn-settings-toggle');
    var langToggle = document.getElementById('fn-settings-language-main-toggle');
    var langPanel = document.getElementById('fn-settings-language-panel');
    if (!langToggle) {
      langToggle = document.createElement('button');
      langToggle.type = 'button';
      langToggle.id = 'fn-settings-language-main-toggle';
      langToggle.className = 'fn-settings-toggle';
      langToggle.innerHTML = '<span class="fn-toggle-left"><span class="fn-toggle-icon"><i class="fa-solid fa-language"></i></span><span class="fn-toggle-title"></span></span><i class="fa-solid fa-chevron-down fn-toggle-chev"></i>';
      langToggle.addEventListener('click', function(){
        var p = document.getElementById('fn-settings-language-panel');
        if (!p) return;
        var open = p.classList.toggle('open');
        langToggle.classList.toggle('open', open);
        langToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }
    if (!langPanel) {
      langPanel = document.createElement('div');
      langPanel.id = 'fn-settings-language-panel';
      langPanel.className = 'setting-section fn-acc-panel';
    }
    langPanel.appendChild(picker);
    var container = (firstToggle && firstToggle.parentNode) ? firstToggle.parentNode : (themeSection ? themeSection.parentNode : settings);
    var ref = container.querySelector('#fn-settings-language-main-toggle') || firstToggle || themeSection || container.firstChild;
    if (!document.getElementById('fn-settings-language-main-toggle')) container.insertBefore(langToggle, ref);
    if (langToggle.nextSibling !== langPanel) container.insertBefore(langPanel, langToggle.nextSibling);
    var title = langToggle.querySelector('.fn-toggle-title');
    if (title) title.textContent = faMode() ? 'زبان' : 'Language';
    if (!langToggle.classList.contains('open')) langToggle.setAttribute('aria-expanded','false');
    // Default all settings sections closed. User can open each one manually.
    settings.querySelectorAll('.fn-settings-toggle.open').forEach(function(btn){ if (btn.id !== 'fn-settings-language-main-toggle') btn.classList.remove('open'); btn.setAttribute('aria-expanded','false'); });
    settings.querySelectorAll('.fn-acc-panel.open').forEach(function(panel){ if (panel.id !== 'fn-settings-language-panel') panel.classList.remove('open'); });
    // Keep language panel closed by default too unless user opened it this session.
    if (!langToggle.__userOpened) { langPanel.classList.remove('open'); langToggle.classList.remove('open'); langToggle.setAttribute('aria-expanded','false'); }
    var oldClick = langToggle.onclick;
    if (!langToggle.__trackOpenBound) {
      langToggle.__trackOpenBound = true;
      langToggle.addEventListener('click', function(){ langToggle.__userOpened = true; }, true);
    }
  }
  function updateVersion(){
    try { window.FAMILY_NIGHT_VERSION = FN_APP_VERSION_40104; } catch(e){}
    document.querySelectorAll('.fn-about-version').forEach(function(el){ el.textContent = '🚀 Family Night ' + FN_APP_VERSION_40104; });
  }
  function runAll(){
    try { ensureSidebarExtras(); ensureSettingsLanguageFirst(); updateVersion(); } catch(e){ console.warn('v40.10.10 patch failed', e); }
  }
  var oldPopulate = (typeof populateSidebar === 'function') ? populateSidebar : null;
  if (oldPopulate && !oldPopulate.__v40104Wrapped) {
    populateSidebar = function(){ var r = oldPopulate.apply(this, arguments); setTimeout(runAll, 0); return r; };
    populateSidebar.__v40104Wrapped = true;
  }
  var oldApply = (typeof applyLang === 'function') ? applyLang : null;
  if (oldApply && !oldApply.__v40104Wrapped) {
    applyLang = function(){ var r = oldApply.apply(this, arguments); setTimeout(runAll, 0); setTimeout(runAll, 250); return r; };
    applyLang.__v40104Wrapped = true;
  }
  var oldTheme = (typeof applyCreativeTheme === 'function') ? applyCreativeTheme : null;
  if (oldTheme && !oldTheme.__v40104Wrapped) {
    applyCreativeTheme = function(){ var r = oldTheme.apply(this, arguments); setTimeout(runAll, 0); return r; };
    applyCreativeTheme.__v40104Wrapped = true;
  }
  document.addEventListener('DOMContentLoaded', function(){ runAll(); [80,250,700,1400,2600].forEach(function(t){ setTimeout(runAll, t); }); });
  window.addEventListener('load', function(){ runAll(); setTimeout(runAll, 1000); });
})();
