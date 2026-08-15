            }
        }catch(e){ setFsVisual(!on); }
    }
    // Native browser fullscreen cannot be restored after a reload without a user gesture;
    // the persisted app-level fullscreen keeps the site visually full-screen instead.
    try{if(fsSaved())setFsVisual(true);}catch(e){}
    document.addEventListener('fullscreenchange',function(){
        if(!document.fullscreenElement && fsSaved()) setFsVisual(true);
    });
    window.toggleAnyFullscreen=toggleFull;
    function makeBtn(host, closeSel){
        if(!host || host.querySelector('.fn-modal-fs-btn')) return;
        var btn=document.createElement('div');
        btn.className='fn-modal-fs-btn';
        btn.innerHTML='<i class="fa-solid fa-expand"></i>';
        btn.title='Fullscreen';
        btn.onclick=function(ev){ ev.stopPropagation(); toggleFull(); };
        var base='position:fixed;top:20px;left:68px;width:40px;height:40px;border-radius:50%;background:rgba(0,0,0,0.72);border:1px solid rgba(255,255,255,0.2);color:white;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:9999;font-size:17px;backdrop-filter:blur(6px);box-shadow:0 4px 15px rgba(0,0,0,0.45);';
        btn.setAttribute('style',base);
        host.appendChild(btn);
    }
    function addFullscreenButtons(){
        ['modal','person-bio-modal','reviews-modal','generic-grid-page','companies-all-page','company-works-page','compare-modal','soundtracks-modal','backdrops-modal','posters-modal','detailed-stats-modal','personality-page'].forEach(function(id){
            var el=document.getElementById(id); if(el) makeBtn(el);
        });
    }
    var mo=null;
    function startFSObserver(){
        addFullscreenButtons();
        try{
            if(mo) return;
            mo=new MutationObserver(function(){ addFullscreenButtons(); });
            mo.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['style','class']});
        }catch(e){}
    }
    if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',startFSObserver); else startFSObserver();
    setTimeout(startFSObserver,800); setTimeout(startFSObserver,2500);
})();
// =================== END FINAL HOTFIX v15 ===================

    // Collapsible Mood panel: presentation only; genre buttons and existing pickMood behaviour remain untouched.
    function toggleMoodPanel(){
        var section=document.getElementById('mood-section'), btn=document.getElementById('mood-toggle');
        if(!section || !btn) return;
        var open=section.classList.toggle('open');
        btn.setAttribute('aria-expanded', String(open));
    }

