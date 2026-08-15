
/* Keep the displayed assistant shell aligned with the currently visible title even if an older initializer finishes late. */
(function(){
 function check(){
  var title=document.getElementById('d-title'),chat=document.getElementById('ai-chat-area'),label=document.getElementById('ai-box-label');
  if(!title||!chat||!label)return;var t=(title.textContent||'').trim();if(!t||t==='...')return;
  if(chat.querySelector('.ai-msg-user'))return;
  if((label.textContent||'').indexOf(t)<0){
   var welcome=(typeof LANG!=='undefined'&&LANG==='fa')?'سلام! اکنون فقط درباره «'+t.replace(/[&<>]/g,'')+'» پاسخ می‌دهم.':'Hi! I am now answering only about “'+t.replace(/[&<>]/g,'')+'”.';
   chat.innerHTML='<div class="ai-msg-bot">'+welcome+'</div>';
   var fs=document.getElementById('ai-fs-chat');if(fs)fs.innerHTML='<div class="ai-msg-bot">'+welcome+'</div>';
   label.textContent=(typeof LANG!=='undefined'&&LANG==='fa')?'دستیار AI · «'+t+'»':'AI · '+t;
  }
 }
 setInterval(check,500);setTimeout(check,1000);setTimeout(check,2500);
})();
