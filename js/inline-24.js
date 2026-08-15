
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
