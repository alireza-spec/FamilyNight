
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
