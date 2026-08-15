
/* ===== v40.10.10 Settings accordion/readability patch ===== */
(function(){
  var FN_APP_VERSION = 'v40.10.10';
  function faMode(){ try { return (typeof LANG !== 'undefined' ? LANG : localStorage.getItem('lang')) === 'fa'; } catch(e){ return false; } }
  function esc(s){ return String(s || '').replace(/[&<>"]/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]); }); }
  function aboutHTML(){
    var fa = faMode();
    if (fa) {
      return ''+
        '<div class="fn-about-card" dir="rtl">'+
          '<div class="fn-about-version">🚀 Family Night '+FN_APP_VERSION+'</div>'+
          '<div class="fn-about-title" id="txt-desc-t">درباره ما و اپ</div>'+
          '<p class="fn-about-text" id="txt-desc-b">Family Night یک اپ سینمایی کامل برای جستجو، کشف و مدیریت فیلم‌ها، سریال‌ها، انیمیشن‌ها و آثار محبوب است؛ با تمرکز روی تجربه سریع، زیبا، خانوادگی و قابل شخصی‌سازی.</p>'+
          '<div class="fn-about-list">'+
            '<div><strong>قابلیت‌ها:</strong> صفحه خانه هوشمند، پیشنهاد فیلم، دسته‌بندی‌ها، جستجوی پیشرفته، فیلتر کشور/ژانر/سال، لیست علاقه‌مندی، تاریخچه تماشا، امتیازدهی شخصی، آمار سینمایی، آزمون‌ها، پروفایل، تم‌های متنوع و دستیار AI برای تحلیل هر اثر.</div>'+
            '<div><strong>اطلاعات آثار:</strong> جزئیات اثر، بازیگران و عوامل، آثار مشابه، کشور تولید، ژانرها، پوسترها، تصاویر، تریلر، موسیقی متن، نظرات کاربران، کالکشن‌ها و داده‌های تکمیلی در یک صفحه منظم نمایش داده می‌شود.</div>'+
            '<div><strong>ظاهر و پوسته‌ها:</strong> تم‌ها برای حالت روشن و تیره طراحی شده‌اند و رنگ نوشته‌ها، کادرها، آیکن‌ها و پس‌زمینه‌ها با پوسته انتخاب‌شده هماهنگ می‌شوند.</div>'+
            '<div><strong>سازنده:</strong> توسعه و طراحی توسط علیرضا احمدی انجام شده است.</div>'+
            '<div><strong>حقوق و استفاده:</strong> تمام حقوق طراحی، ساختار، ایده‌ها و تغییرات اختصاصی این اپ متعلق به سازنده است. کپی‌برداری، انتشار، فروش، تغییر نام یا استفاده تجاری بدون اجازه سازنده مجاز نیست.</div>'+
            '<div><strong>نکته:</strong> برخی داده‌ها، تصاویر و اطلاعات آثار از سرویس‌های عمومی سینمایی دریافت می‌شوند و حقوق محتوای هر اثر متعلق به صاحبان اصلی آن است.</div>'+
          '</div>'+
          '<p class="fn-about-text" id="txt-copy" style="margin-top:12px;">© 2025 Game of Family / Family Night. All rights reserved.</p>'+
          '<p class="fn-about-text" id="txt-dev">Developer: <strong>Alireza Ahmadi</strong></p>'+
        '</div>';
    }
    return ''+
      '<div class="fn-about-card" dir="ltr">'+
        '<div class="fn-about-version">🚀 Family Night '+FN_APP_VERSION+'</div>'+
        '<div class="fn-about-title" id="txt-desc-t">About us & app</div>'+
        '<p class="fn-about-text" id="txt-desc-b">Family Night is a complete cinema companion for discovering, searching and organizing movies, series, animation and favorite titles, focused on a fast, beautiful, family-friendly and customizable experience.</p>'+
        '<div class="fn-about-list">'+
          '<div><strong>Features:</strong> smart home page, random movie picker, categories, advanced search, country/genre/year filters, watchlist, watch history, personal ratings, cinema stats, quizzes, user profile, multiple themes and an AI assistant for each title.</div>'+
          '<div><strong>Title pages:</strong> details, cast and crew, similar titles, production countries, genres, posters, backdrops, trailers, soundtracks, user reviews, collections and extra metadata are shown in one clean page.</div>'+
          '<div><strong>Appearance:</strong> every theme is designed for light or dark usage, with readable text, matching cards, icons, buttons and backgrounds.</div>'+
          '<div><strong>Creator:</strong> designed and developed by Alireza Ahmadi.</div>'+
          '<div><strong>Copyright and usage:</strong> the app design, structure, custom ideas and implementation belong to the creator. Copying, republishing, selling, renaming or commercial use without permission is not allowed.</div>'+
          '<div><strong>Note:</strong> some movie data, images and title information are loaded from public cinema services; each title and media asset belongs to its original rights holder.</div>'+
        '</div>'+
        '<p class="fn-about-text" id="txt-copy" style="margin-top:12px;">© 2025 Game of Family / Family Night. All rights reserved.</p>'+
        '<p class="fn-about-text" id="txt-dev">Developer: <strong>Alireza Ahmadi</strong></p>'+
      '</div>';
  }
  function panelTitle(kind){
    var fa = faMode();
    var map = { theme: fa ? 'ظاهر، زبان و پوسته‌ها' : 'Appearance, language & themes', personal: fa ? 'آمار سینمایی من' : 'My cinema stats', archive: fa ? 'آمار آرشیو' : 'Archive stats', about: fa ? 'درباره ما و اپ' : 'About us & app' };
    return map[kind] || kind;
  }
  function icon(kind){ return ({theme:'fa-palette', personal:'fa-chart-simple', archive:'fa-database', about:'fa-circle-info'}[kind] || 'fa-sliders'); }
  function makeToggle(section, kind){
    var id = section.id || ('fn-settings-panel-' + kind); section.id = id;
    if (document.querySelector('.fn-settings-toggle[data-target="'+id+'"]')) return;
    var btn = document.createElement('button'); btn.type = 'button'; btn.className = 'fn-settings-toggle'; btn.setAttribute('data-target', id); btn.setAttribute('data-kind', kind);
    btn.innerHTML = '<span class="fn-toggle-left"><span class="fn-toggle-icon"><i class="fa-solid '+icon(kind)+'"></i></span><span class="fn-toggle-title">'+esc(panelTitle(kind))+'</span></span><i class="fa-solid fa-chevron-down fn-toggle-chev"></i>';
    section.parentNode.insertBefore(btn, section); section.classList.add('fn-acc-panel'); section.classList.remove('open');
    btn.addEventListener('click', function(){ var open = section.classList.toggle('open'); btn.classList.toggle('open', open); btn.setAttribute('aria-expanded', open ? 'true' : 'false'); try { localStorage.setItem('fn_settings_'+kind+'_open', open ? '1' : '0'); } catch(e){} });
    var saved = null; try { saved = localStorage.getItem('fn_settings_'+kind+'_open'); } catch(e){}
    var shouldOpen = saved === '1'; if (saved === null && kind === 'theme') shouldOpen = true;
    if (shouldOpen) { section.classList.add('open'); btn.classList.add('open'); btn.setAttribute('aria-expanded','true'); } else { btn.setAttribute('aria-expanded','false'); }
  }
  function enhanceSettings(){
    try {
      var theme = document.getElementById('txt-theme-head')?.closest('.setting-section');
      var personal = document.getElementById('personal-stats-settings-section');
      var archive = document.getElementById('stats-section');
      var about = document.getElementById('txt-about-head')?.closest('.setting-section');
      if (theme) makeToggle(theme, 'theme'); if (personal) makeToggle(personal, 'personal'); if (archive) makeToggle(archive, 'archive'); if (about) makeToggle(about, 'about');
      var dev = about ? about.querySelector('.dev-info') : null; if (dev) { dev.setAttribute('data-v40101-about','1'); dev.innerHTML = aboutHTML(); }
      var langWide = theme ? theme.querySelector('button[onclick="toggleLang()"]') : null; if (langWide) langWide.classList.add('fn-lang-wide');
      document.querySelectorAll('#settings-tab .fn-settings-toggle').forEach(function(btn){ var kind = btn.getAttribute('data-kind'); var title = btn.querySelector('.fn-toggle-title'); if (title) title.textContent = panelTitle(kind); });
      var titleEl = document.getElementById('txt-set-head-header'); if (titleEl) titleEl.textContent = faMode() ? 'تنظیمات' : 'Settings';
      var titleMain = document.getElementById('txt-set-head'); if (titleMain) titleMain.textContent = faMode() ? 'تنظیمات' : 'Settings';
      var archiveHeader = archive ? archive.querySelector('.setting-header') : null; if (archiveHeader) archiveHeader.textContent = faMode() ? '📊 آمار آرشیو' : '📊 Archive Stats';
      try { window.FAMILY_NIGHT_VERSION = FN_APP_VERSION; } catch(e){}
    } catch(e) { console.warn('settings enhance failed', e); }
  }
  var oldApplyLang = (typeof applyLang === 'function') ? applyLang : null;
  if (oldApplyLang && !oldApplyLang.__settings40101Wrapped) { applyLang = function(){ var r = oldApplyLang.apply(this, arguments); setTimeout(enhanceSettings, 0); setTimeout(enhanceSettings, 250); return r; }; applyLang.__settings40101Wrapped = true; }
  var oldLoadArchiveStats = (typeof loadArchiveStats === 'function') ? loadArchiveStats : null;
  if (oldLoadArchiveStats && !oldLoadArchiveStats.__settings40101Wrapped) { loadArchiveStats = async function(){ var r = await oldLoadArchiveStats.apply(this, arguments); setTimeout(enhanceSettings, 0); return r; }; loadArchiveStats.__settings40101Wrapped = true; }
  document.addEventListener('DOMContentLoaded', function(){ enhanceSettings(); setTimeout(enhanceSettings, 400); setTimeout(enhanceSettings, 1400); });
  window.addEventListener('load', function(){ enhanceSettings(); setTimeout(enhanceSettings, 800); });
})();
