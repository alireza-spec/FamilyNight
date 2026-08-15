
/* Preserve a completed answer from late legacy initializers; clear it immediately for a different TMDB item. */
(function(){
 var base=window.processAI;
 window.processAI=processAI=async function(q){var id=typeof curId==='undefined'?'':String(curId);window.__fnAIAnswerLock=null;var r=await base(q),box=document.getElementById('ai-chat-area');if(box)window.__fnAIAnswerLock={id:id,html:box.innerHTML};return r};
 var busy=false;new MutationObserver(function(){if(busy)return;var lock=window.__fnAIAnswerLock,box=document.getElementById('ai-chat-area');if(!lock||!box||String(typeof curId==='undefined'?'':curId)!==lock.id){if(lock&&String(typeof curId==='undefined'?'':curId)!==lock.id)window.__fnAIAnswerLock=null;return}if(box.innerHTML!==lock.html){busy=true;box.innerHTML=lock.html;var fs=document.getElementById('ai-fs-chat');if(fs)fs.innerHTML=lock.html;busy=false}}).observe(document.getElementById('ai-chat-area'),{childList:true,subtree:true,characterData:true});
})();
