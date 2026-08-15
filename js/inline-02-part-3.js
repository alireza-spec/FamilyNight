                if (!recentGrid) return;
                recentGrid.innerHTML = '';
                if (recentlyViewed.length === 0) {
                    if (recentEmpty) { recentEmpty.style.display = 'block'; recentEmpty.textContent = isFA ? '\u0647\u06CC\u0686 \u0627\u062B\u0631\u06CC \u0627\u062E\u06CC\u0631\u0627\u064B \u0628\u0627\u0632 \u0646\u0634\u062F\u0647' : 'No recently opened titles'; }
                } else {
                    if (recentEmpty) recentEmpty.style.display = 'none';
                    recentlyViewed.forEach(function(f) { recentGrid.innerHTML += makeCard(f, f.type || 'movie'); });
                }
            }
        }

        
        // --- AGE RATING FUNCTIONS ---
        function getAgeRatingInfo(certification, type) {
            // Age rating mapping with suggested ages and classifications
            const movieRatings = {
                'G': { display: '3+', class: 'g', tooltip: 'General Audiences (3+)' },
                'PG': { display: '7+', class: 'pg', tooltip: 'Parental Guidance (7+)' },
                'PG-13': { display: '13+', class: 'pg13', tooltip: 'Parents Strongly Cautioned (13+)' },
                'R': { display: '17+', class: 'r', tooltip: 'Restricted (17+)' },
                'NC-17': { display: '18+', class: 'nc17', tooltip: 'Adults Only (18+)' },
                'NR': { display: 'NR', class: '', tooltip: 'Not Rated' },
                'UR': { display: 'UR', class: '', tooltip: 'Unrated' }
            };
            
            const tvRatings = {
                'TV-Y': { display: '2+', class: 'tv-y', tooltip: 'All Children (2+)' },
                'TV-Y7': { display: '7+', class: 'tv-y7', tooltip: 'Directed to Older Children (7+)' },
                'TV-G': { display: '6+', class: 'tv-g', tooltip: 'General Audience (6+)' },
                'TV-PG': { display: '10+', class: 'tv-pg', tooltip: 'Parental Guidance (10+)' },
                'TV-14': { display: '14+', class: 'tv-14', tooltip: 'Parents Strongly Cautioned (14+)' },
                'TV-MA': { display: '17+', class: 'tv-ma', tooltip: 'Mature Audience (17+)' },
                'NR': { display: 'NR', class: '', tooltip: 'Not Rated' }
            };
            
            const ratings = type === 'movie' ? movieRatings : tvRatings;
            return ratings[certification] || { display: certification || 'NR', class: '', tooltip: certification || 'Not Rated' };
        }
        
        async function enrichItemWithAgeRating(item, type) {
            if (!item || item.age_rating_display) return item; // Already enriched
            
            try {
                const relData = await getData(`${type}/${item.id}/release_dates`);
                let certification = 'NR';
                
                if (type === 'movie' && relData && relData.results) {
                    // Find US rating first
                    const usRelease = relData.results.find(r => r.iso_3166_1 === 'US');
                    if (usRelease && usRelease.release_dates && usRelease.release_dates.length > 0) {
                        const rated = usRelease.release_dates.find(rd => rd.certification && rd.certification !== '');
                        if (rated) certification = rated.certification;
                    }
                }
                
                if (type === 'tv') {
                    const contentData = await getData(`${type}/${item.id}/content_ratings`);
                    if (contentData && contentData.results) {
                        const usRating = contentData.results.find(r => r.iso_3166_1 === 'US');
                        if (usRating && usRating.rating) certification = usRating.rating;
                    }
                }
                
                const ratingInfo = getAgeRatingInfo(certification, type);
                item.age_rating = certification;
                item.age_rating_display = ratingInfo.display;
                item.age_rating_class = ratingInfo.class;
                item.age_rating_tooltip = ratingInfo.tooltip;
                
            } catch (e) {
                const ratingInfo = getAgeRatingInfo('NR', type);
                item.age_rating = 'NR';
                item.age_rating_display = ratingInfo.display;
                item.age_rating_class = ratingInfo.class;
                item.age_rating_tooltip = ratingInfo.tooltip;
            }
            
            return item;
        }
        
        // Batch enrich items with age ratings (limit concurrent requests)
        async function batchEnrichWithAgeRating(items, type, batchSize = 5) {
            const results = [];
            for (let i = 0; i < items.length; i += batchSize) {
                const batch = items.slice(i, i + batchSize);
                const enriched = await Promise.all(
                    batch.map(item => enrichItemWithAgeRating(item, type))
                );
                results.push(...enriched);
                // Small delay to avoid rate limiting
                if (i + batchSize < items.length) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }
            return results;
        }
        
        if (!document.getElementById('fn-age-cinema-loader-style')) {
            const st = document.createElement('style'); st.id = 'fn-age-cinema-loader-style';
            st.textContent = `.fn-age-cinema-loader{min-height:290px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;color:#fff;background:radial-gradient(ellipse at 50% 40%,rgba(229,9,20,.18),transparent 58%);overflow:hidden}.fn-age-stage{position:relative;width:190px;height:82px;display:flex;align-items:center;justify-content:center}.fn-age-screen{width:130px;height:68px;border:2px solid #e50914;border-radius:7px;background:linear-gradient(135deg,#261016,#080808);box-shadow:0 0 24px rgba(229,9,20,.55),inset 0 0 20px rgba(255,255,255,.06);animation:fnScreenPulse 1.8s ease-in-out infinite}.fn-age-screen:after{content:'\f008';font-family:'Font Awesome 6 Free';font-weight:900;color:#f5c518;font-size:27px;display:grid;place-items:center;height:100%;animation:fnProjector 1.1s ease-in-out infinite}.fn-age-reel{position:absolute;width:38px;height:38px;border:3px dashed #f5c518;border-radius:50%;animation:fnReel 1.4s linear infinite;filter:drop-shadow(0 0 7px rgba(245,197,24,.65))}.fn-age-reel:first-child{left:0}.fn-age-reel:last-child{right:0}@keyframes fnReel{to{transform:rotate(360deg)}}@keyframes fnScreenPulse{50%{box-shadow:0 0 36px rgba(229,9,20,.85),inset 0 0 24px rgba(255,255,255,.12);transform:scale(1.025)}}@keyframes fnProjector{50%{opacity:.45;transform:scale(.8)}}.fn-age-empty{text-align:center;padding:60px 20px;color:#888}`;
            document.head.appendChild(st);
        }
        function showAgeCinemaLoader(text) {
            const c=document.getElementById('gg-content');
            if(!c) return;
            const fa=LANG==='fa';
            c.innerHTML=`<div class="fn-row-loader fn-age-results-loader" role="status" aria-live="polite">
                <div class="fn-row-loader-core"><div class="fn-row-reel"></div><div class="fn-row-loader-copy">${text || (fa?'در حال آماده‌سازی پرده':'Preparing the screen')}<small>${fa?'لحظه‌ای دیگر…':'Just a moment…'}</small></div></div>
                <div class="fn-row-loader-cards"><div class="fn-row-loader-card"><div class="fn-row-loader-lines"></div></div><div class="fn-row-loader-card"><div class="fn-row-loader-lines"></div></div><div class="fn-row-loader-card"><div class="fn-row-loader-lines"></div></div><div class="fn-row-loader-card"><div class="fn-row-loader-lines"></div></div></div>
            </div>`;
        }
        function ageRatingKey(v) { return String(v||'').trim().toUpperCase().replace(/[\s_]/g,''); }
        function applyAgeRatingSort() {
            const sel = document.getElementById('gg-sort-select');
            const mode = sel ? (sel.value || 'default') : 'default';
            const list = Array.isArray(ageRatingResults) ? ageRatingResults.slice() : [];
            if (mode === 'newest') list.sort((a,b) => String(b.release_date || b.first_air_date || '').localeCompare(String(a.release_date || a.first_air_date || '')));
            else if (mode === 'oldest') list.sort((a,b) => String(a.release_date || a.first_air_date || '').localeCompare(String(b.release_date || b.first_air_date || '')));
            else if (mode === 'votes') list.sort((a,b) => Number(b.vote_count || 0) - Number(a.vote_count || 0));
            const c = document.getElementById('gg-content');
            if (!c) return;
            c.className = 'grid-container';
            c.innerHTML = '';
            if (!list.length) {
                c.innerHTML = `<div class="fn-age-empty">${LANG==='fa' ? 'اثری با این ردهٔ سنی پیدا نشد.' : 'No titles found for this age rating.'}</div>`;
                return;
            }
            list.forEach(item => c.insertAdjacentHTML('beforeend', makeCard(item, item.media_type || (item.title ? 'movie' : 'tv'))));
            const more = document.getElementById('btn-more-g'); if (more) more.style.display = 'none';
        }

        async function filterByAgeRating(rating, type) {
            const modal=document.getElementById('modal'), person=document.getElementById('person-works-modal');
            if(modal) modal.style.display='none'; if(person) person.style.display='none';
            const page=document.getElementById('generic-grid-page'); if(page) page.style.display='flex';
            const title=LANG==='fa'?`همه آثار با رده سنی ${rating}`:`All ${rating}-rated Movies & Series`;
            const heading=document.getElementById('gg-title'); if(heading) heading.innerText=title;
            const bar=document.getElementById('gg-sort-bar'), ps=document.getElementById('gg-person-search-bar');
            if(bar) bar.style.display='flex'; if(ps) ps.style.display='none';
            const sel=document.getElementById('gg-sort-select');
            if(sel){ sel.options[0].value='default'; sel.options[0].textContent=LANG==='fa'?'پیش‌فرض':'Default'; sel.options[1].textContent=LANG==='fa'?'جدیدترین':'Newest'; sel.options[2].textContent=LANG==='fa'?'قدیمی‌ترین':'Oldest'; sel.options[3].value='votes'; sel.options[3].textContent=LANG==='fa'?'بیشترین رأی':'Most voted'; sel.value='default'; sel.onchange=applyAgeRatingSort; }
            const label=document.getElementById('gg-sort-label'); if(label) label.textContent=LANG==='fa'?'مرتب‌سازی آثار':'Sort works';
            showAgeCinemaLoader(LANG==='fa'?'در حال پیدا کردن آثار هم‌رده...':'Finding matching titles...');
            const targetRaw=ageRatingKey(rating), targetInfo=getAgeRatingInfo(rating,type), targetDisplay=ageRatingKey(targetInfo.display);
            const found=[], seen=new Set();
            // Ask TMDB for the certification directly. The previous version fetched popular
            // titles and then made hundreds of detail calls, which silently produced an empty grid.
            for(const mediaType of ['movie','tv']){
                const entered=String(rating||'').trim().toUpperCase();
                const candidates=mediaType==='movie'
                    ? ([entered, {'3+':'G','7+':'PG','13+':'PG-13','17+':'R','18+':'NC-17'}[entered]].filter(Boolean))
                    : ([entered, {'2+':'TV-Y','7+':'TV-Y7','6+':'TV-G','10+':'TV-PG','14+':'TV-14','17+':'TV-MA'}[entered]].filter(Boolean));
                for(const raw of [...new Set(candidates)]){
                    const certificationParam=mediaType==='movie'
                        ? `certification_country=US&certification=${encodeURIComponent(raw)}`
                        : `with_content_rating=${encodeURIComponent(raw)}&watch_region=US`;
                    for(let pageNo=1;pageNo<=8;pageNo++){
                    const data=await getData(`discover/${mediaType}?${certificationParam}&sort_by=popularity.desc&page=${pageNo}&include_adult=false`);
                    if(!data || !Array.isArray(data.results)) continue;
                    for(const item of data.results){
                        if(!item || !item.id || !item.poster_path) continue;
                        item.media_type=mediaType;
                        const key=mediaType+':'+item.id;
                        if(!seen.has(key)){seen.add(key);found.push(item);}
                    }
                    if(found.length>=60) break;
                    }
                    if(found.length>=60) break;
                }
            }
            // A few installations expose TV ratings through the alternate field; enrich only
            // the returned items so the card badge remains available without blocking results.
            if(!found.length){
                for(const mediaType of ['movie','tv']){
                    const data=await getData(`discover/${mediaType}?sort_by=popularity.desc&page=1&include_adult=false`);
                    for(const item of ((data&&data.results)||[]).slice(0,40)){
                        if(!item || !item.id || !item.poster_path) continue;
                        await enrichItemWithAgeRating(item,mediaType);
                        const info=getAgeRatingInfo(item.age_rating,mediaType);
                        if(ageRatingKey(item.age_rating)===targetRaw || ageRatingKey(info.display)===targetDisplay){item.media_type=mediaType;found.push(item);}
                    }
                }
            }
            ageRatingResults=found.slice(0,60);
            applyAgeRatingSort();
        }
        
        // --- ADDITIONAL SCORES (RT & METACRITIC) ---
        async function fetchAdditionalScores(imdbId) {
            if (!imdbId) return null;
            
            try {
                // Using OMDb API to get RT and Metacritic scores
                const omdbKey = 'f6dd47c8'; // OMDb API key (you can replace with your own)
                const response = await fetch(`https://www.omdbapi.com/?i=${imdbId}&apikey=${omdbKey}`);
                const data = await response.json();
                
                if (data.Response === 'True') {
                    const scores = {};
                    
                    // Rotten Tomatoes
                    if (data.Ratings) {
                        const rtRating = data.Ratings.find(r => r.Source === 'Rotten Tomatoes');
                        if (rtRating) {
                            scores.rt = parseInt(rtRating.Value);
                        }
                    }
                    
                    // Metacritic
                    if (data.Metascore && data.Metascore !== 'N/A') {
                        scores.metacritic = parseInt(data.Metascore);
                    }
                    
                    return scores;
                }
            } catch (e) {
                console.log('Failed to fetch additional scores:', e);
            }
            
            return null;
        }
        
        function renderAdditionalScores(scores) {
            if (!scores) return '';
            
            let html = '';
            
            // Rotten Tomatoes
            if (scores.rt !== undefined) {
                const rtIcon = scores.rt >= 60 ? '🍅' : '🍏'; // Fresh vs Rotten
                html += `
                    <div class="score-item rt">
                        <span class="rt-icon">${rtIcon}</span>
                        <span class="score-label">RT:</span>
                        <strong style="color:#FA320A;">${scores.rt}%</strong>
                    </div>
                `;
            }
            
            // Metacritic
            if (scores.metacritic !== undefined) {
                let mcClass = 'low';
                if (scores.metacritic >= 61) mcClass = 'high';
                else if (scores.metacritic >= 40) mcClass = 'mid';
                
                html += `
                    <div class="score-item mc">
                        <span class="score-label">MC:</span>
                        <span class="mc-badge ${mcClass}">${scores.metacritic}</span>
                    </div>
                `;
            }
            
            return html ? `<div class="additional-scores">${html}</div>` : '';
        }
        
        // --- PERSON BIO & GALLERY ---
        let currentPersonData = null;
        let currentPersonBioOriginal = '';
        let currentPersonBioTranslated = '';
        let bioIsTranslated = false;

        async function openPersonBio() {
            if (!currentPersonData) return;
            const p = currentPersonData;
            const t = TEXTS[LANG];
            document.getElementById('pb-img').src = p.profile_path ? IMG + p.profile_path : '';
            const displayName = p.name || '';
            document.getElementById('pb-name').innerText = displayName;
            document.getElementById('pb-bio-btn-label') && (document.getElementById('pb-bio-btn-label').innerText = (t.bioTitle || 'مشخصات و آشنایی با') + ' ' + displayName);
            document.getElementById('pb-subtitle').innerText = p.known_for_department || '';

            // Build meta info
            let metaLines = [];
            if (p.birthday) metaLines.push('🎂 ' + p.birthday + (p.deathday ? ' — ' + p.deathday : ''));
            if (p.place_of_birth) metaLines.push('📍 ' + p.place_of_birth);
            const age = p.birthday && !p.deathday ? (new Date().getFullYear() - parseInt(p.birthday.split('-')[0])) : null;
            if (age) metaLines.push('🎂 ' + age + ' ساله');
            document.getElementById('pb-meta').innerHTML = metaLines.join('<br>');

            currentPersonBioOriginal = p.biography || '';
            currentPersonBioTranslated = '';
            bioIsTranslated = false;
            document.getElementById('pb-bio-text').innerText = currentPersonBioOriginal || (t.noBio || 'No biography available.');
            document.getElementById('pb-translate-btn-text').innerText = 'ترجمه به فارسی';

            // Known for
            const knownFor = p.known_for || [];
            let kfHtml = '';
            if (knownFor.length > 0) {
                kfHtml = `<h3 style="font-size:15px;color:#fff;margin-bottom:10px;border-left:3px solid var(--primary,#e50914);padding-left:10px;">🎬 شناخته‌شده‌ترین آثار</h3><div style="display:flex;flex-wrap:wrap;gap:6px;">`;
                knownFor.forEach(k => {
                    kfHtml += `<span style="background:#1a1a1a;border:1px solid #333;color:#ccc;padding:5px 10px;border-radius:6px;font-size:12px;">${k.title || k.name || ''}</span>`;
                });
                kfHtml += '</div>';
            }
            document.getElementById('pb-known-for').innerHTML = kfHtml;

            document.getElementById('pb-awards-section').style.display = 'none';
            document.getElementById('person-bio-modal').style.display = 'block';
            
            // Load social links, nationality, awards (non-blocking)
            enhancePersonBio().catch(() => {});
        }

        async function translateBio() {
            if (bioIsTranslated) {
                // toggle back
                document.getElementById('pb-bio-text').innerText = currentPersonBioOriginal || '';
                document.getElementById('pb-translate-btn-text').innerText = 'ترجمه به فارسی';
                bioIsTranslated = false;
                return;
            }
            if (currentPersonBioTranslated) {
                document.getElementById('pb-bio-text').innerText = currentPersonBioTranslated;
                document.getElementById('pb-translate-btn-text').innerText = 'Show Original';
                bioIsTranslated = true;
                return;
            }
            const btn = document.getElementById('pb-translate-btn');
            btn.disabled = true;
            document.getElementById('pb-translate-btn-text').innerText = 'در حال ترجمه...';
            try {
                const textToTranslate = currentPersonBioOriginal;
                if (!textToTranslate) { btn.disabled = false; return; }
                // Use MyMemory free translation API
                const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(textToTranslate.slice(0,500))}&langpair=en|fa`;
                const resp = await fetch(url);
                const data = await resp.json();
                if (data && data.responseData && data.responseData.translatedText) {
                    currentPersonBioTranslated = data.responseData.translatedText;
                    document.getElementById('pb-bio-text').innerText = currentPersonBioTranslated;
                    document.getElementById('pb-translate-btn-text').innerText = 'Show Original';
                    bioIsTranslated = true;
                } else {
                    document.getElementById('pb-translate-btn-text').innerText = 'خطا در ترجمه';
                }
            } catch(e) {
                document.getElementById('pb-translate-btn-text').innerText = 'خطا در ترجمه';
            }
            btn.disabled = false;
        }

        async function openPersonGallery() {
            if (!currentPersonData) return;
            const p = currentPersonData;
            document.getElementById('pg-name').innerText = p.name || '';
            document.getElementById('pg-grid').innerHTML = '';
            document.getElementById('pg-loading').style.display = 'block';
            document.getElementById('person-gallery-modal').style.display = 'block';

            try {
                const imgs = await getData(`person/${p.id}/images`);
                document.getElementById('pg-loading').style.display = 'none';
                if (!imgs || !imgs.profiles || imgs.profiles.length === 0) {
                    document.getElementById('pg-grid').innerHTML = '<p style="color:#555;text-align:center;grid-column:1/-1;padding:30px;">No photos found.</p>';
                    return;
                }
                let html = '';
                imgs.profiles.slice(0, 60).forEach(img => {
                    const src = 'https://family-night-api.alirezadoe8.workers.dev/img/w342' + img.file_path;
                    const full = 'https://family-night-api.alirezadoe8.workers.dev/img/w780' + img.file_path;
                    html += `<div onclick="openLightbox('${full}')" style="cursor:pointer;border-radius:8px;overflow:hidden;aspect-ratio:2/3;"><img src="${src}" style="width:100%;height:100%;object-fit:cover;" loading="lazy" onerror="this.parentElement.style.display='none'"></div>`;
                });
                document.getElementById('pg-grid').innerHTML = html;
            } catch(e) {
                document.getElementById('pg-loading').style.display = 'none';
                document.getElementById('pg-grid').innerHTML = '<p style="color:#555;text-align:center;grid-column:1/-1;padding:30px;">Failed to load photos.</p>';
            }
        }

        function openLightbox(src) {
            document.getElementById('lightbox-img').src = src;
            document.getElementById('img-lightbox').style.display = 'flex';
        }


        // --- PERSON LATEST NEWS ---
        let currentPersonNews = [];
        let currentPersonNewsPerson = null;
        let currentArticleOriginal = '';
        let currentArticleTranslated = '';
        let currentArticleUrl = '';
        let currentArticleTitleOriginal = '';

        function _newsEscapeHtml(str) {
            return String(str || '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
        }
        function _newsDecodeHtml(str) {
            const div = document.createElement('div');
            div.innerHTML = str || '';
            return div.textContent || div.innerText || '';
        }
        function _newsStripHtml(str) {
            return _newsDecodeHtml(String(str || '').replace(/<script[\s\S]*?<\/script>/gi,'').replace(/<style[\s\S]*?<\/style>/gi,'').replace(/<[^>]+>/g,' ')).replace(/\s+/g,' ').trim();
        }
        function _newsDomain(url) {
            try { return new URL(url).hostname.replace(/^www\./,''); } catch(e) { return ''; }
        }
        function _newsDateLabel(d) {
            if (!d) return '';
            try {
                const dt = new Date(d);
                if (isNaN(dt.getTime())) return String(d).slice(0,10);
                return dt.toLocaleDateString(LANG === 'fa' ? 'fa-IR' : 'en-US', {year:'numeric', month:'short', day:'numeric'});
            } catch(e) { return String(d).slice(0,10); }
        }
        function _newsExtractImg(html) {
            const m = String(html || '').match(/<img[^>]+src=["']([^"']+)["']/i);
            return m ? m[1] : '';
        }
        async function _newsFetchText(url, timeoutMs=8500) {
            const tries = [url];
            if (typeof PROXIES !== 'undefined' && Array.isArray(PROXIES)) {
                PROXIES.forEach(p => tries.push(p + encodeURIComponent(url)));
            }
            tries.push('https://api.allorigins.win/raw?url=' + encodeURIComponent(url));
            let lastErr = null;
            for (const u of tries) {
                try {
                    const controller = new AbortController();
                    const tm = setTimeout(() => controller.abort(), timeoutMs);
                    const res = await fetch(u, {signal: controller.signal});
                    clearTimeout(tm);
                    if (res.ok) return await res.text();
                } catch(e) { lastErr = e; }
            }
            throw lastErr || new Error('fetch failed');
        }
        async function _newsFetchJson(url, timeoutMs=8500) {
            const tries = [url];
            if (typeof PROXIES !== 'undefined' && Array.isArray(PROXIES)) {
                PROXIES.forEach(p => tries.push(p + encodeURIComponent(url)));
            }
            tries.push('https://api.allorigins.win/raw?url=' + encodeURIComponent(url));
            let lastErr = null;
            for (const u of tries) {
                try {
                    const controller = new AbortController();
                    const tm = setTimeout(() => controller.abort(), timeoutMs);
                    const res = await fetch(u, {signal: controller.signal});
                    clearTimeout(tm);
                    if (res.ok) return await res.json();
                } catch(e) { lastErr = e; }
            }
            throw lastErr || new Error('json fetch failed');
        }
        function _newsBuildGoogleRss(personName) {
            const q = `"${personName}" (movie OR film OR series OR actor OR actress OR director OR interview OR photoshoot OR casting OR trailer OR premiere) when:180d`;
            return 'https://news.google.com/rss/search?q=' + encodeURIComponent(q) + '&hl=en-US&gl=US&ceid=US:en';
        }
        function _newsParseRssXml(xmlText) {
            const doc = new DOMParser().parseFromString(xmlText, 'text/xml');
            const items = [...doc.querySelectorAll('item')];
            return items.map(item => {
                const title = _newsDecodeHtml(item.querySelector('title')?.textContent || '');
                const link = item.querySelector('link')?.textContent || '';
                const pubDate = item.querySelector('pubDate')?.textContent || '';
                const source = item.querySelector('source')?.textContent || _newsDomain(link);
                const descRaw = item.querySelector('description')?.textContent || '';
                const img = _newsExtractImg(descRaw);
                const desc = _newsStripHtml(descRaw).replace(/Read full article.*$/i,'').trim();
                return { title, url: link, date: pubDate, source, summary: desc, image: img, provider: 'Google News' };
            });
        }
        function _newsNormalizeItems(items, personName) {
            const seen = new Set();
            const tokens = String(personName || '').toLowerCase().split(/\s+/).filter(Boolean);
            const mainTokens = tokens.filter(t => t.length > 2);
            return (items || []).map(x => {
                let title = _newsDecodeHtml(x.title || '');
                let url = x.url || x.link || x.guid || '';
                let summary = _newsStripHtml(x.summary || x.description || x.content || '');
                let source = x.source || x.author || x.publisher || _newsDomain(url) || 'News';
                let image = x.image || x.thumbnail || x.enclosure?.link || '';
                let date = x.date || x.pubDate || x.publishedAt || x.seendate || '';
                // Google News often adds " - Source" at the end of title
                const dashParts = title.split(' - ');
                if (dashParts.length > 1) {
                    const maybeSource = dashParts[dashParts.length - 1].trim();
                    if (maybeSource.length < 40) source = source || maybeSource;
                    title = dashParts.slice(0, -1).join(' - ').trim() || title;
                }
                return { title, url, summary, source, image, date, provider: x.provider || 'News' };
            }).filter(n => {
                if (!n.title || !n.url) return false;
                const key = (n.url || n.title).toLowerCase().split('?')[0];
                if (seen.has(key)) return false;
                seen.add(key);
                const hay = (n.title + ' ' + n.summary).toLowerCase();
                // keep exact search results, but avoid completely unrelated cards if possible
                if (mainTokens.length >= 2 && !mainTokens.some(t => hay.includes(t))) return false;
                return true;
            }).slice(0, 36);
        }
        async function fetchPersonNewsItems(personName) {
            const collected = [];
            const rssUrl = _newsBuildGoogleRss(personName);

            // Google News RSS through rss2json
            try {
                const r = await _newsFetchJson('https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(rssUrl));
                if (r && Array.isArray(r.items)) {
                    r.items.forEach(it => collected.push({
                        title: it.title,
                        url: it.link || it.guid,
                        summary: _newsStripHtml(it.description || it.content || ''),
                        source: it.author || _newsDomain(it.link),
                        image: it.thumbnail || _newsExtractImg(it.description || ''),
                        date: it.pubDate,
                        provider: 'Google News'
                    }));
                }
            } catch(e) {}

            // Google News raw RSS fallback
            if (collected.length < 6) {
                try {
                    const xml = await _newsFetchText(rssUrl);
                    collected.push(..._newsParseRssXml(xml));
                } catch(e) {}
            }

            // GDELT fallback with real source URLs and images
            if (collected.length < 10) {
                try {
                    const gdeltQuery = `"${personName}" (film OR movie OR series OR actor OR actress OR director OR interview OR photoshoot OR casting)`;
                    const gdeltUrl = 'https://api.gdeltproject.org/api/v2/doc/doc?mode=ArtList&format=json&maxrecords=30&sort=DateDesc&timespan=6months&query=' + encodeURIComponent(gdeltQuery);
                    const gd = await _newsFetchJson(gdeltUrl);
                    if (gd && Array.isArray(gd.articles)) {
                        gd.articles.forEach(a => collected.push({
                            title: a.title,
                            url: a.url,
                            summary: a.seendate ? ('Latest related report from ' + (a.domain || _newsDomain(a.url) || 'news source') + '.') : '',
                            source: a.domain || _newsDomain(a.url),
                            image: a.socialimage || '',
                            date: a.seendate,
                            provider: 'GDELT'
                        }));
                    }
                } catch(e) {}
            }
            return _newsNormalizeItems(collected, personName);
        }
        function renderPersonNewsList(items) {
            const list = document.getElementById('pn-list');
            if (!list) return;
            if (!items || !items.length) {
                list.innerHTML = '';
                const empty = document.getElementById('pn-empty');
                if (empty) {
                    empty.style.display = 'block';
                    empty.innerHTML = LANG === 'fa'
                        ? 'فعلاً خبر قابل‌اعتماد و قابل دریافت برای این شخص پیدا نشد.<br>با اتصال بهتر اینترنت یا چند دقیقه بعد دوباره امتحان کن.'
                        : 'No reliable live news could be loaded for this person right now.<br>Try again with a better connection or later.';
                }
                return;
            }
            const empty = document.getElementById('pn-empty');
            if (empty) empty.style.display = 'none';
            list.innerHTML = items.map((n, i) => {
                const img = n.image
                    ? `<img class="person-news-thumb" src="${_newsEscapeHtml(n.image)}" loading="lazy" onerror="this.outerHTML='<div class=&quot;person-news-thumb-fallback&quot;><i class=&quot;fa-solid fa-newspaper&quot;></i></div>'">`
                    : `<div class="person-news-thumb-fallback"><i class="fa-solid fa-newspaper"></i></div>`;
                const summary = n.summary || (LANG === 'fa' ? 'برای خواندن متن کامل خبر روی کارت بزن.' : 'Tap to read the full story inside the app.');
                return `<div class="person-news-card" data-news-idx="${i}" onclick="openPersonNewsArticle(${i})">
                    ${img}
                    <div style="min-width:0;flex:1;">
                        <div class="person-news-title" id="pn-title-${i}">${_newsEscapeHtml(n.title)}</div>
                        <div class="person-news-meta">
                            <span class="person-news-source-pill">${_newsEscapeHtml(n.source || 'News')}</span>
                            <span>${_newsEscapeHtml(_newsDateLabel(n.date))}</span>
                        </div>
                        <div class="person-news-desc" id="pn-desc-${i}">${_newsEscapeHtml(summary)}</div>
                        <div class="person-news-actions" onclick="event.stopPropagation()">
                            ${LANG === 'fa' ? `<button class="person-news-small-btn red" onclick="translateNewsCard(${i})" id="pn-tr-${i}">ترجمه به فارسی</button>` : `<button class="person-news-small-btn" onclick="translateNewsCard(${i})" id="pn-tr-${i}">Translate to Persian</button>`}
                            <button class="person-news-small-btn" onclick="openPersonNewsArticle(${i})">${LANG === 'fa' ? 'خواندن خبر' : 'Read'}</button>
                        </div>
                    </div>
                </div>`;
            }).join('');
            if (LANG === 'fa') {
                const btn = document.getElementById('pn-translate-all-btn');
                if (btn) btn.style.display = 'inline-flex';
            }
        }
        async function openPersonNews() {
            if (!currentPersonData) return;
            const p = currentPersonData;
            currentPersonNewsPerson = p;
            const title = document.getElementById('pn-title');
            const sub = document.getElementById('pn-subtitle');
            const refresh = document.getElementById('pn-refresh-label');
            const loadingText = document.getElementById('pn-loading-text');
            if (title) title.innerText = LANG === 'fa' ? 'آخرین خبرهای مرتبط با ' + (p.name || '') : 'Latest news about ' + (p.name || '');
            if (sub) sub.innerText = LANG === 'fa' ? 'خبرهای واقعی از رسانه‌های آنلاین، مرتب‌شده از جدیدترین' : 'Live online media coverage, newest first';
            if (refresh) refresh.innerText = LANG === 'fa' ? 'به‌روزرسانی' : 'Refresh';
            if (loadingText) loadingText.innerText = LANG === 'fa' ? 'در حال دریافت خبرها...' : 'Loading latest news...';
            document.getElementById('person-news-modal').style.display = 'block';
            await refreshPersonNews(false);
        }
        async function refreshPersonNews(force) {
            if (!currentPersonNewsPerson) return;
            const name = currentPersonNewsPerson.name || '';
            const key = 'person_news_' + name.toLowerCase().replace(/\s+/g,'_');
            const list = document.getElementById('pn-list');
            const loading = document.getElementById('pn-loading');
            const empty = document.getElementById('pn-empty');
            if (list) list.innerHTML = '';
            if (empty) empty.style.display = 'none';
            if (loading) loading.style.display = 'block';
            try {
                if (!force) {
                    const cached = JSON.parse(sessionStorage.getItem(key) || 'null');
                    if (cached && Date.now() - cached.ts < 15 * 60 * 1000 && Array.isArray(cached.items)) {
                        currentPersonNews = cached.items;
                        if (loading) loading.style.display = 'none';
                        renderPersonNewsList(currentPersonNews);
                        return;
                    }
                }
                const items = await fetchPersonNewsItems(name);
                currentPersonNews = items;
                sessionStorage.setItem(key, JSON.stringify({ts: Date.now(), items}));
                if (loading) loading.style.display = 'none';
                renderPersonNewsList(items);
            } catch(e) {
                if (loading) loading.style.display = 'none';
                currentPersonNews = [];
                renderPersonNewsList([]);
            }
        }
        async function _translateToFa(text) {
            text = String(text || '').trim();
            if (!text) return '';
            const chunks = [];
            let rest = text;
            while (rest.length > 0) {
                let cut = Math.min(450, rest.length);
                if (rest.length > 450) {
                    const lastDot = rest.slice(0, cut).lastIndexOf('.');
                    const lastSpace = rest.slice(0, cut).lastIndexOf(' ');
                    cut = lastDot > 200 ? lastDot + 1 : (lastSpace > 200 ? lastSpace : cut);
                }
                chunks.push(rest.slice(0, cut));
                rest = rest.slice(cut).trim();
                if (chunks.length >= 12) break;
            }
            const out = [];
            for (const ch of chunks) {
                try {
                    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(ch)}&langpair=en|fa`;
                    const res = await fetch(url);
                    const data = await res.json();
                    out.push(data?.responseData?.translatedText || ch);
                } catch(e) { out.push(ch); }
            }
            return _newsDecodeHtml(out.join(' '));
        }
        async function translateNewsCard(i) {
            const n = currentPersonNews[i];
            if (!n) return;
            const titleEl = document.getElementById('pn-title-' + i);
            const descEl = document.getElementById('pn-desc-' + i);
            const btn = document.getElementById('pn-tr-' + i);
            if (!titleEl || !descEl || !btn) return;
            if (n._translatedShown) {
                titleEl.innerText = n.title;
                descEl.innerText = n.summary || '';
                btn.innerText = LANG === 'fa' ? 'ترجمه به فارسی' : 'Translate to Persian';
                n._translatedShown = false;
                return;
            }
            btn.disabled = true;
            btn.innerText = LANG === 'fa' ? 'در حال ترجمه...' : 'Translating...';
            if (!n._titleFa) n._titleFa = await _translateToFa(n.title);
            if (!n._summaryFa) n._summaryFa = await _translateToFa(n.summary || '');
            titleEl.innerText = n._titleFa || n.title;
            descEl.innerText = n._summaryFa || n.summary || '';
            btn.innerText = LANG === 'fa' ? 'نمایش متن اصلی' : 'Show original';
            btn.disabled = false;
            n._translatedShown = true;
        }
        async function translateVisibleNewsCards() {
            const cards = [...document.querySelectorAll('.person-news-card')].slice(0, 12);
            for (const card of cards) {
                const idx = parseInt(card.dataset.newsIdx, 10);
                const n = currentPersonNews[idx];
                if (n && !n._translatedShown) await translateNewsCard(idx);
            }
        }
        function _extractReadableFromHtml(html) {
            const doc = new DOMParser().parseFromString(html, 'text/html');
            doc.querySelectorAll('script,style,noscript,svg,form,nav,footer,header,aside').forEach(el => el.remove());
            const title = doc.querySelector('meta[property="og:title"]')?.content || doc.querySelector('title')?.textContent || '';
            const img = doc.querySelector('meta[property="og:image"]')?.content || '';
            let nodes = [...doc.querySelectorAll('article p, main p, [role="main"] p')];
            if (nodes.length < 4) nodes = [...doc.querySelectorAll('p')];
            const paras = nodes.map(p => _newsStripHtml(p.textContent || '')).filter(p => p.length > 50);
            const text = paras.slice(0, 28).join('\n\n');
            return {title, image: img, text};
        }
        async function openPersonNewsArticle(i) {
            const n = currentPersonNews[i];
            if (!n) return;
            currentArticleUrl = n.url;
            currentArticleTitleOriginal = n.title;
            currentArticleOriginal = '';
            currentArticleTranslated = '';
            const modal = document.getElementById('person-article-modal');
            const title = document.getElementById('pa-title');
            const meta = document.getElementById('pa-meta');
            const img = document.getElementById('pa-image');
            const content = document.getElementById('pa-content');
            const loading = document.getElementById('pa-loading');
            const iframeWrap = document.getElementById('pa-iframe-wrap');
            const iframe = document.getElementById('pa-iframe');
            const trBtn = document.getElementById('pa-translate-btn');
            const trLabel = document.getElementById('pa-translate-label');
            const origBtn = document.getElementById('pa-original-btn');
            const openLabel = document.getElementById('pa-open-label');

            if (title) title.innerText = n.title;
            if (meta) meta.innerText = `${n.source || _newsDomain(n.url)} • ${_newsDateLabel(n.date)}`;
            if (img) {
                img.style.display = n.image ? 'block' : 'none';
                if (n.image) img.src = n.image;
            }
            if (content) content.innerHTML = '';
            if (iframeWrap) iframeWrap.style.display = 'none';
            if (iframe) iframe.removeAttribute('src');
            if (loading) loading.style.display = 'block';
            if (trBtn) trBtn.style.display = 'inline-flex';
            if (trLabel) trLabel.innerText = LANG === 'fa' ? 'ترجمه به فارسی' : 'Translate to Persian';
            if (origBtn) origBtn.style.display = 'none';
            if (openLabel) openLabel.innerText = LANG === 'fa' ? 'باز کردن منبع' : 'Open Source';
            modal.style.display = 'block';

            try {
                const raw = await _newsFetchText(n.url, 9000);
                const readable = _extractReadableFromHtml(raw);
                currentArticleOriginal = readable.text || n.summary || '';
                if (readable.image && img && !n.image) { img.src = readable.image; img.style.display = 'block'; }
                if (readable.title && title && (!n.title || n.title.length < 8)) title.innerText = readable.title;
                if (loading) loading.style.display = 'none';
                if (currentArticleOriginal && currentArticleOriginal.length > 80) {
                    content.innerHTML = currentArticleOriginal.split(/\n{2,}/).map(p => `<p>${_newsEscapeHtml(p)}</p>`).join('');
                    if (LANG === 'fa') {
                        // keep manual control visible; user can tap translate
                        if (trLabel) trLabel.innerText = 'ترجمه کامل خبر';
                    }
                } else {
                    throw new Error('not enough readable content');
                }
            } catch(e) {
                if (loading) loading.style.display = 'none';
                currentArticleOriginal = n.summary || n.title || '';
                if (content) {
                    content.innerHTML = `<p style="color:#aaa;">${LANG === 'fa' ? 'نمایش متنی کامل این سایت از داخل اپ محدود شده است. نسخه وب خبر در همین صفحه باز می‌شود؛ اگر سایت اجازه ندهد، از دکمه باز کردن منبع استفاده کن.' : 'This source limits full text extraction. The web version opens inside this page; if the site blocks embedding, use Open Source.'}</p>`;
                }
                if (iframeWrap && iframe) {
                    iframeWrap.style.display = 'block';
                    iframe.src = n.url;
                }
            }
        }
        async function translateCurrentArticleToFa() {
            const content = document.getElementById('pa-content');
            const btn = document.getElementById('pa-translate-btn');
            const lbl = document.getElementById('pa-translate-label');
            const origBtn = document.getElementById('pa-original-btn');
            if (!content || !currentArticleOriginal) return;
            if (currentArticleTranslated) {
                content.innerHTML = currentArticleTranslated.split(/\n{2,}/).map(p => `<p>${_newsEscapeHtml(p)}</p>`).join('');
                if (origBtn) origBtn.style.display = 'inline-flex';
                if (lbl) lbl.innerText = 'ترجمه شد';
                return;
            }
            if (btn) btn.disabled = true;
            if (lbl) lbl.innerText = 'در حال ترجمه...';
            currentArticleTranslated = await _translateToFa(currentArticleOriginal);
            content.innerHTML = currentArticleTranslated.split(/\n{2,}/).map(p => `<p>${_newsEscapeHtml(p)}</p>`).join('');
            if (origBtn) origBtn.style.display = 'inline-flex';
            if (lbl) lbl.innerText = 'ترجمه شد';
            if (btn) btn.disabled = false;
        }
        function showCurrentArticleOriginal() {
            const content = document.getElementById('pa-content');
            if (content && currentArticleOriginal) {
                content.innerHTML = currentArticleOriginal.split(/\n{2,}/).map(p => `<p>${_newsEscapeHtml(p)}</p>`).join('');
            }
            const lbl = document.getElementById('pa-translate-label');
            if (lbl) lbl.innerText = LANG === 'fa' ? 'ترجمه به فارسی' : 'Translate to Persian';
        }
        function openCurrentArticleOriginal() {
            if (currentArticleUrl) window.open(currentArticleUrl, '_blank');
        }


        // --- PERSON WORKS MODAL ---
        let currentPersonCastWorks = [];
        let currentPersonDirectorWorks = [];
        let personWorksSortMode = 'random';
        function _shuffleWorks(list) {
            const a = list.slice();
            for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
            return a;
        }
        function _sortPersonWorks(list) {
            if (personWorksSortMode === 'newest') return list.slice().sort((a,b) => Number((b.release_date || b.first_air_date || '').slice(0,10).replaceAll('-','')) - Number((a.release_date || a.first_air_date || '').slice(0,10).replaceAll('-','')));
            if (personWorksSortMode === 'oldest') return list.slice().sort((a,b) => Number((a.release_date || a.first_air_date || '').slice(0,10).replaceAll('-','')) - Number((b.release_date || b.first_air_date || '').slice(0,10).replaceAll('-','')));
            if (personWorksSortMode === 'votes') return list.slice().sort((a,b) => Number(b.vote_count || 0) - Number(a.vote_count || 0));
            return _shuffleWorks(list);
        }
        function _renderPersonWorksGrid(id, works) {
            const el = document.getElementById(id);
            if (el) el.innerHTML = _sortPersonWorks(works).map(m => makeCard(m, m.media_type)).join('');
        }
        function applyPersonWorksSort() {
            const sel = document.getElementById('pw-sort-select');
            personWorksSortMode = sel ? sel.value : 'random';
            _renderPersonWorksGrid('pw-cast-grid', currentPersonCastWorks);
            _renderPersonWorksGrid('pw-director-grid', currentPersonDirectorWorks);
        }
        async function openPersonWorks(personId, personName) {
            document.getElementById('generic-grid-page').style.display = 'none';
            document.getElementById('modal').style.display = 'none';
            document.getElementById('pw-name').innerText = personName;
            document.getElementById('pw-cast-grid').innerHTML = '';
            document.getElementById('pw-director-grid').innerHTML = '';
            currentPersonCastWorks = []; currentPersonDirectorWorks = []; personWorksSortMode = 'random';
            const sortSelect = document.getElementById('pw-sort-select');
            if (sortSelect) { sortSelect.value = 'random'; }
            const sortLabel = document.getElementById('pw-sort-label');
            if (sortLabel) sortLabel.innerText = LANG === 'fa' ? 'مرتب‌سازی آثار' : 'Sort works';
            const opts = document.querySelectorAll('#pw-sort-select option');
            if (opts.length >= 4) { opts[0].textContent = LANG === 'fa' ? '🎲 تصادفی' : '🎲 Random'; opts[1].textContent = LANG === 'fa' ? 'جدیدترین' : 'Newest'; opts[2].textContent = LANG === 'fa' ? 'قدیمی‌ترین' : 'Oldest'; opts[3].textContent = LANG === 'fa' ? 'بیشترین رأی' : 'Most voted'; }

            currentPersonData = null;
            const personDetails = await getData(`person/${personId}`);
            if (personDetails) {
                currentPersonData = personDetails;
                const imgEl = document.getElementById('pw-profile-img');
                if (imgEl) { imgEl.src = personDetails.profile_path ? IMG + personDetails.profile_path : ''; imgEl.onerror = () => { imgEl.style.display = 'none'; }; }
                const t = TEXTS[LANG];
                const bioLbl = document.getElementById('pw-bio-btn-label'); if (bioLbl) bioLbl.innerText = (t.bioTitle || 'مشخصات و آشنایی با') + ' ' + (personDetails.name || personName);
                const galLbl = document.getElementById('pw-gallery-btn-label'); if (galLbl) galLbl.innerText = t.galleryTitle || 'گالری عکس‌ها';
                const newsLbl = document.getElementById('pw-news-btn-label'); if (newsLbl) newsLbl.innerText = LANG === 'fa' ? 'آخرین خبرهای مرتبط' : 'Latest related news';
            }
            const cred = await getData(`person/${personId}/combined_credits`);
            if (!cred) { document.getElementById('person-works-modal').style.display = 'block'; return; }
            const EXCLUDED_GENRES = new Set([10767,10764,10763,10766]);
            const isExcludedShow = item => Array.isArray(item.genre_ids) && item.genre_ids.some(gid => EXCLUDED_GENRES.has(gid));
            const baseFilter = w => (w.media_type === 'movie' || w.media_type === 'tv') && w.poster_path && !isExcludedShow(w);
            currentPersonCastWorks = (cred.cast || []).filter(baseFilter);
            currentPersonDirectorWorks = (cred.crew || []).filter(w => w.job === 'Director' && baseFilter(w));
            const actorSection = document.getElementById('pw-actor-works');
            const directorSection = document.getElementById('pw-director-works');
            if (actorSection) actorSection.style.display = currentPersonCastWorks.length ? 'block' : 'none';
            if (directorSection) directorSection.style.display = currentPersonDirectorWorks.length ? 'block' : 'none';
            applyPersonWorksSort();
            document.getElementById('person-works-modal').style.display = 'block';
        }
        // --- DETAILS & TRAILER ---
        async function openDetail(id, type) {
            if (!id || id === 'undefined' || id === 'null') return; // Prevent empty page
            if(type === 'person_works') {
                const person = await getData(`person/${id}`);
                openPersonWorks(id, person.name || 'Person');
                return;
            }
            curId = id; curType = type; curTrailerKey = null; curTrailerKeys = [];
            _reviewsCache = {}; // clear reviews cache for new item
            _rCache = {}; // clear multi-source reviews cache
            const _rBadge = document.getElementById('reviews-count-badge');
            if (_rBadge) _rBadge.style.display = 'none';
            // Reset AI box immediately so old conversation doesn't show
            aiConversation = [];
            aiIsThinking = false;
            const _chatArea = document.getElementById('ai-chat-area');
            const _fsChat = document.getElementById('ai-fs-chat');
            if (_chatArea) _chatArea.innerHTML = '';
            if (_fsChat) _fsChat.innerHTML = '';
            const _qBtns = document.getElementById('ai-quick-btns');
            const _fsBtns = document.getElementById('ai-fs-quick-btns');
            if (_qBtns) _qBtns.innerHTML = '';
            if (_fsBtns) _fsBtns.innerHTML = '';
            const _aiLabel = document.getElementById('ai-box-label');
            if (_aiLabel) _aiLabel.textContent = 'AI Assistant';
            const _aiBadge = document.getElementById('ai-context-badge');
            if (_aiBadge) { _aiBadge.innerHTML = ''; _aiBadge.style.display = 'none'; }
            
            // Immediately reset button states to avoid showing stale state from previous item
            const _wBtn = document.getElementById('watchlist-btn');
            if(_wBtn) { _wBtn.className = 'fa-regular fa-bookmark'; _wBtn.style.color = '#777'; }
            const _fBtn = document.getElementById('fav-btn');
            if(_fBtn) { _fBtn.className = 'fa-regular fa-heart fav-btn'; }
            
            document.getElementById('new-trailer-btn').style.display = 'none';
            const _pdBox = document.getElementById('pd-dl-box');
            if (_pdBox) _pdBox.style.display = 'none';

            // *** FIX: نمایش فوری modal با loading — قبل از Promise.all ***
            const _modal = document.getElementById('modal');
            const _modalLockId = id;
            // پاک کردن تصویر قبلی و نمایش loading state
            const _dImg = document.getElementById('d-img');
            const _dTitle = document.getElementById('d-title');
            const _blankDetailImg = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675"><rect width="100%" height="100%" fill="#050505"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#333" font-family="Arial" font-size="34">Family Night</text></svg>');
            if (_dImg) {
                _dImg.onload = null;
                _dImg.onerror = null;
                _dImg.dataset.detailToken = String(_modalLockId);
                _dImg.removeAttribute('srcset');
                _dImg.src = _blankDetailImg;
                _dImg.style.background = '#050505';
                _dImg.style.filter = 'blur(12px) brightness(0.3)';
                _dImg.style.transition = 'none';
            }
            if (_dTitle) _dTitle.textContent = '...';
            ['d-title-fa','d-title-secondary','d-year'].forEach(function(_id){var _e=document.getElementById(_id);if(_e){_e.textContent='';_e.style.display='none';}});
            var _staleExtra=document.getElementById('meta-extra-row');if(_staleExtra)_staleExtra.innerHTML='';
            _modal.style.display = 'block';
            recordRecentlyViewed(null, id, type);
            _modal.style.zIndex = '220';

            const [d, cred, vids, dEN, keywordsData] = await Promise.all([
                getData(`${type}/${id}?append_to_response=external_ids`),
                getData(`${type}/${id}/credits`),
                getDataEN(`${type}/${id}/videos`),
                getDataEN(`${type}/${id}?append_to_response=external_ids`),
                getData(`${type}/${id}/keywords`)
            ]);
            if(!d) { _modal.style.display='none'; return; }
            window.__fnDetailEnglishTitle = (dEN && (dEN.title || dEN.name)) || '';
            // اگه user در این مدت روی چیز دیگه‌ای کلیک کرده، abort کن
            if (curId !== _modalLockId) return;
            curDataForFav = d;
            // Keep the credits only for the share card/caption. No other details logic uses this snapshot.
            curShareCredits = cred || null;
            let curTitleRaw = d.title || d.name; 
            const originalTitle = d.original_title || d.original_name;
            // In FA mode, if title has non-Persian/non-Latin foreign chars, use English title
            if (LANG === 'fa' && curTitleRaw) {
                const hasNonPersianForeign = /[\u0E00-\u0E7F\u0900-\u097F\u4E00-\u9FFF\u3040-\u30FF\uAC00-\uD7AF\u0400-\u04FF]/.test(curTitleRaw);
                if (hasNonPersianForeign) {
                    const engTitle = (dEN && (dEN.title || dEN.name)) || originalTitle || curTitleRaw;
                    const engHasForeign = /[\u0E00-\u0E7F\u0900-\u097F\u4E00-\u9FFF\u3040-\u30FF\uAC00-\uD7AF\u0400-\u04FF]/.test(engTitle);
                    curTitleRaw = engHasForeign ? curTitleRaw : engTitle;
                }
            }
            curTitle = curTitleRaw;
            recordRecentlyViewed(d, id, type);
            curImdb = d.external_ids ? d.external_ids.imdb_id : null;
            
            // Update DL_CACHE for this item - only true if DOWNLOADS_DB has real download links
            if (curImdb) {
                const dbEntry = DOWNLOADS_DB && DOWNLOADS_DB[curImdb];
                const hasDl = !!(dbEntry && (
                    (dbEntry.softsub && Object.keys(dbEntry.softsub).length > 0) ||
                    (dbEntry.dubbed && Object.keys(dbEntry.dubbed).length > 0)
                ));
                DL_CACHE[String(id)] = hasDl;
                try { localStorage.setItem('dl_cache', JSON.stringify(DL_CACHE)); } catch(e) {}
            }
            
            // Get trailers - collect multiple trailers for carousel
            curTrailerKeys = [];
            curTrailerKey = null;
            if (vids.results && vids.results.length > 0) {
                const youtubeVids = vids.results.filter(v => v.site === 'YouTube');
                if (youtubeVids.length > 0) {
                    const officialTrailers = youtubeVids.filter(v => v.type === 'Trailer' && v.official);
                    const otherTrailers = youtubeVids.filter(v => v.type === 'Trailer' && !v.official);
                    const teasers = youtubeVids.filter(v => v.type === 'Teaser');
                    const featurettes = youtubeVids.filter(v => v.type === 'Featurette' || v.type === 'Clip');
                    const rest = youtubeVids.filter(v => !['Trailer','Teaser','Featurette','Clip'].includes(v.type));
                    const ordered = [...officialTrailers, ...otherTrailers, ...teasers, ...featurettes, ...rest];
                    const seen = new Set();
                    curTrailerKeys = ordered.filter(v => {
                        if (seen.has(v.key)) return false;
                        seen.add(v.key);
                        return true;
                    }).slice(0, 6).map(v => ({ key: v.key, name: v.name || v.type, type: v.type, official: !!v.official }));
                    if (curTrailerKeys.length > 0) curTrailerKey = curTrailerKeys[0].key;
                }
            }
            
            // Always show trailer button (even if no trailer, will search)
            document.getElementById('new-trailer-btn').style.display = 'flex';
            
            // Set the new image only after the new item data is confirmed. Token guard prevents an older pick from painting over the current one.
            const _imgEl = document.getElementById('d-img');
            if (_imgEl) {
                const _detailToken = String(_modalLockId);
                const _imgUrl = d.backdrop_path ? (IMG_BG + d.backdrop_path) : (d.poster_path ? (IMG_BG + d.poster_path) : _blankDetailImg);
                _imgEl.dataset.detailToken = _detailToken;
                _imgEl.onload = () => {
                    if (_imgEl.dataset.detailToken !== _detailToken || curId !== _modalLockId) return;
                    _imgEl.style.filter = '';
                    _imgEl.style.transition = 'filter 0.4s ease';
                };
                _imgEl.onerror = () => {
                    if (_imgEl.dataset.detailToken !== _detailToken) return;
                    _imgEl.src = _blankDetailImg;
                    _imgEl.style.filter = '';
                };
                // Clear first, then assign on next frame so Chrome/WebView never keeps the previous backdrop visible.
                _imgEl.src = _blankDetailImg;
                requestAnimationFrame(() => {
                    if (_imgEl.dataset.detailToken === _detailToken && curId === _modalLockId) _imgEl.src = _imgUrl;
                });
            }
            document.getElementById('d-title').innerText = curTitle;
            // Auto-translate title in FA mode if title has no Persian chars
            var _titleFaEl = document.getElementById('d-title-fa');
            if (_titleFaEl) {
                _titleFaEl.style.display = 'none';
                _titleFaEl.textContent = '';
                if (LANG === 'fa' && curTitle && !/[\u0600-\u06FF]/.test(curTitle)) {
                    _autoTranslateTitle(curTitle, _titleFaEl);
                }
            }
            // Remove old translate button logic
            var _titleTransBtn = document.getElementById('title-translate-btn');
            if (_titleTransBtn) _titleTransBtn.style.display = 'none';
            // Show secondary title:
            // - In FA mode: show English title as secondary
            // - In EN mode: show native language title (original_title) if film is not English-language
            const secTitleEl = document.getElementById('d-title-secondary');
            if (secTitleEl) {
                const engTitleForDisplay = dEN ? (dEN.title || dEN.name || '') : (originalTitle || '');
                const nativeLang = d.original_language || 'en';
                const nativeTitle = d.original_title || d.original_name || '';
                const nativeHasForeignScript = /[\u0E00-\u0E7F\u0900-\u097F\u4E00-\u9FFF\u3040-\u30FF\uAC00-\uD7AF\u0400-\u04FF\u0600-\u06FF]/.test(nativeTitle);
                
                if (LANG === 'fa' && engTitleForDisplay && engTitleForDisplay !== curTitle) {
                    secTitleEl.textContent = engTitleForDisplay;
                    secTitleEl.style.display = 'block';
                } else if (LANG === 'en' && nativeLang !== 'en' && nativeTitle && nativeTitle !== curTitle) {
                    // Show native language title for non-English films in EN mode
                    secTitleEl.textContent = nativeTitle;
                    secTitleEl.style.display = 'block';
                } else {
                    secTitleEl.style.display = 'none';
                }
            }
            document.getElementById('d-year').innerText = (d.release_date||d.first_air_date||'').split('-')[0];
            if (typeof checkPublicDomainDownloads === 'function') {
                checkPublicDomainDownloads(curTitle, (d.release_date||d.first_air_date||'').split('-')[0], type, id);
            }
            document.getElementById('d-rate').innerText = d.vote_average.toFixed(1);
            document.getElementById('d-count').innerText = d.vote_count + ' Votes';
            
            // --- RUNTIME & AWARDS ---
            const extraRow = document.getElementById('meta-extra-row');
            extraRow.innerHTML = '';
            
            // Runtime
            if (type === 'movie' && d.runtime && d.runtime > 0) {
                const rt = formatRuntime(d.runtime, false);
                if (rt) {
                    extraRow.innerHTML += `<span class="runtime-badge"><i class="fa-regular fa-clock"></i> ${rt.label}</span>`;
                }
            } else if (type === 'tv' && d.episode_run_time && d.episode_run_time.length > 0) {
                // میانگین runtime اپیزودها
                const rts = d.episode_run_time.filter(r => r > 0);
                if (rts.length > 0) {
                    const avg = Math.round(rts.reduce((a,b) => a+b, 0) / rts.length);
                    const rt = formatRuntime(avg, true);
                    if (rt) {
                        const approxLabel = LANG === 'fa' ? 'میانگین هر قسمت' : 'avg. per ep.';
                        extraRow.innerHTML += `<span class="runtime-badge approx" title="${approxLabel}"><i class="fa-regular fa-clock"></i> ~${rt.label}</span>`;
                    }
                }
            }
            
            // Awards - fetch from TMDB /movie/{id}/external_ids and try OMDb API with imdb_id
            fetchAndRenderAwards(curImdb, type, extraRow);
            
            // --- AGE RATING & ADDITIONAL SCORES ---
            // Age Rating
            try {
                let certification = 'NR';
                if (type === 'movie') {
                    const relData = await getData(`movie/${id}/release_dates`);
                    if (relData && relData.results) {
                        const usRelease = relData.results.find(r => r.iso_3166_1 === 'US');
                        if (usRelease && usRelease.release_dates && usRelease.release_dates.length > 0) {
                            const rated = usRelease.release_dates.find(rd => rd.certification && rd.certification !== '');
                            if (rated) certification = rated.certification;
                        }
                    }
                } else if (type === 'tv') {
                    const contentData = await getData(`tv/${id}/content_ratings`);
                    if (contentData && contentData.results) {
                        const usRating = contentData.results.find(r => r.iso_3166_1 === 'US');
                        if (usRating && usRating.rating) certification = usRating.rating;
                    }
                }
                
                const ratingInfo = getAgeRatingInfo(certification, type);
                if (ratingInfo.display !== 'NR') {
                    extraRow.innerHTML += `
                        <span class="runtime-badge age-rating-detail ${ratingInfo.class}" 
                              style="cursor:pointer; border: 1.5px solid currentColor;" 
                              onclick="filterByAgeRating('${certification}', '${type}')"
                              title="${ratingInfo.tooltip}">
                            <i class="fa-solid fa-user-shield"></i> ${certification} (${ratingInfo.display})
                        </span>
                    `;
                }
            } catch (e) {
                console.log('Failed to fetch age rating:', e);
            }
            
            // Additional Scores (RT & Metacritic)
            if (curImdb) {
                const additionalScores = await fetchAdditionalScores(curImdb);
                const scoresHtml = renderAdditionalScores(additionalScores);
                if (scoresHtml) {
                    // Insert after description
                    const descEl = document.getElementById('d-desc');
                    descEl.insertAdjacentHTML('afterend', scoresHtml);
                }
            }
            
            // Always show description - use overview (could be Persian from TMDB or English)
            // If no overview in current language, fallback to English
            let desc = d.overview || '';
            if (!desc && dEN) desc = dEN.overview || '';
            if (!desc) desc = TEXTS[LANG].noDesc || (LANG === 'fa' ? 'خلاصه داستان موجود نیست' : 'No description available');
            document.getElementById('d-desc').innerText = desc;
            
            // Show translate button: FA mode + description exists + appears to be English
            var translateDescBtn = document.getElementById('translate-desc-btn');
            if (translateDescBtn) {
                var hasFaDesc = !!(d.overview && d.overview.trim() && /[\u0600-\u06FF]/.test(d.overview));
                var descIsEnglish = desc && /[a-zA-Z]/.test(desc) && desc !== (TEXTS[LANG] && TEXTS[LANG].noDesc || 'خلاصه داستان موجود نیست');
                var needsTranslate = LANG === 'fa' && !hasFaDesc && descIsEnglish;
                translateDescBtn.style.display = needsTranslate ? 'flex' : 'none';
                translateDescBtn.setAttribute('data-original', desc);
                translateDescBtn.setAttribute('data-translated', '');
                translateDescBtn.setAttribute('data-state', 'original');
                translateDescBtn.querySelector('span').textContent = 'ترجمه به فارسی';
            }
            
            checkFavState();
            const directorDiv = document.getElementById('d-directors'); 
            directorDiv.innerHTML = ''; 
            
            const directors = cred.crew.filter(c => c.job === 'Director' && c.profile_path);
            if(directors.length > 0) {
                directorDiv.innerHTML += `<div class="cast-head" style="width:100%; margin-bottom:10px;">${TEXTS[LANG].director}</div>`;
                directors.slice(0, 5).forEach(p => {
                    directorDiv.innerHTML += `
                        <div class="cast-card director-card" onclick="openDetail(${p.id}, 'person_works')"> 
                            <img src="${IMG+p.profile_path}" class="director-img" loading="lazy">
                            <div class="cast-name">${p.name}</div>
                        </div>
                    `;
                });
            }
            const castDiv = document.getElementById('d-cast');
            castDiv.innerHTML = '';
            if(cred.cast) {
                cred.cast.filter(p => p.profile_path).slice(0, 15).forEach(p => {
                    castDiv.innerHTML += `
                        <div class="cast-card" onclick="openDetail(${p.id}, 'person_works')"> 
                            <img src="${IMG+p.profile_path}" class="cast-img" loading="lazy">
                            <div class="cast-name">${p.name}</div>
                        </div>
                    `;
                });
            }
            
            // NEW: RENDER PRODUCTION COUNTRIES
            if (d.production_countries && d.production_countries.length > 0) {
                const countriesSection = document.getElementById('countries-section');
                const countriesRow = document.getElementById('countries-row');
                countriesSection.style.display = 'block';
                
                const COUNTRY_NAMES_FA = {
                    'US': 'ایالات متحده', 'GB': 'بریتانیا', 'FR': 'فرانسه', 'DE': 'آلمان',
                    'IT': 'ایتالیا', 'ES': 'اسپانیا', 'CA': 'کانادا', 'AU': 'استرالیا', 'JP': 'ژاپن',
                    'KR': 'کره جنوبی', 'CN': 'چین', 'IN': 'هند', 'BR': 'برزیل', 'MX': 'مکزیک',
                    'RU': 'روسیه', 'SE': 'سوئد', 'NO': 'نروژ', 'DK': 'دانمارک', 'NL': 'هلند',
                    'BE': 'بلژیک', 'CH': 'سوئیس', 'AT': 'اتریش', 'PL': 'لهستان', 'CZ': 'جمهوری چک',
                    'HU': 'مجارستان', 'GR': 'یونان', 'TR': 'ترکیه', 'IR': 'ایران', 'IL': 'اسرائیل'
                };
                const COUNTRY_NAMES_EN = {
                    'US': 'United States', 'GB': 'United Kingdom', 'FR': 'France', 'DE': 'Germany',
                    'IT': 'Italy', 'ES': 'Spain', 'CA': 'Canada', 'AU': 'Australia', 'JP': 'Japan',
                    'KR': 'South Korea', 'CN': 'China', 'IN': 'India', 'BR': 'Brazil', 'MX': 'Mexico',
                    'RU': 'Russia', 'SE': 'Sweden', 'NO': 'Norway', 'DK': 'Denmark', 'NL': 'Netherlands',
                    'BE': 'Belgium', 'CH': 'Switzerland', 'AT': 'Austria', 'PL': 'Poland', 'CZ': 'Czech Republic',
                    'HU': 'Hungary', 'GR': 'Greece', 'TR': 'Turkey', 'IR': 'Iran', 'IL': 'Israel'
                };
                
                let countriesHTML = '';
                d.production_countries.forEach(country => {
                    const countryNames = LANG === 'fa' ? COUNTRY_NAMES_FA : COUNTRY_NAMES_EN;
                    const countryName = countryNames[country.iso_3166_1] || country.name || country.iso_3166_1;
                    const flagUrl = country.iso_3166_1 === 'IR'
                        ? 'https://flagofiran.com/files/Flag_of_Iran.svg'
                        : `https://flagcdn.com/w80/${country.iso_3166_1.toLowerCase()}.png`;
                    countriesHTML += `
                        <div class="country-item" onclick="openCountryGrid('${country.iso_3166_1}', '${countryName}')" style="cursor:pointer;">
                            <img src="${flagUrl}" class="country-flag" loading="lazy" 
                                 alt="${countryName}" onerror="this.style.display='none'">
                            <span class="country-name">${countryName}</span>
                        </div>
                    `;
                });
                countriesRow.innerHTML = countriesHTML;
            } else {
                document.getElementById('countries-section').style.display = 'none';
            }
            
            // NEW: RENDER GENRES
            if (d.genres && d.genres.length > 0) {
                const genresSection = document.getElementById('genres-section');
                const genresRow = document.getElementById('genres-row');
                genresSection.style.display = 'block';
                
                const GENRE_NAMES_FA = {
                    '28': 'اکشن', '12': 'ماجراجویی', '16': 'انیمیشن', '35': 'کمدی', 
                    '80': 'جنایی', '99': 'مستند', '18': 'درام', '10751': 'خانوادگی',
                    '14': 'فانتزی', '36': 'تاریخی', '27': 'ترسناک', '10402': 'موزیک',
                    '9648': 'معمایی', '10749': 'عاشقانه', '878': 'علمی تخیلی', 
                    '10770': 'تلویزیونی', '53': 'هیجان‌انگیز', '10752': 'جنگی', '37': 'وسترن'
                };
                
                const GENRE_NAMES_EN = {
                    '28': 'Action', '12': 'Adventure', '16': 'Animation', '35': 'Comedy',
                    '80': 'Crime', '99': 'Documentary', '18': 'Drama', '10751': 'Family',
                    '14': 'Fantasy', '36': 'History', '27': 'Horror', '10402': 'Music',
                    '9648': 'Mystery', '10749': 'Romance', '878': 'Science Fiction',
                    '10770': 'TV Movie', '53': 'Thriller', '10752': 'War', '37': 'Western'
                };
                
                let genresHTML = '';
                d.genres.forEach(genre => {
                    const genreNames = LANG === 'fa' ? GENRE_NAMES_FA : GENRE_NAMES_EN;
                    const genreName = genreNames[genre.id] || genre.name;
                    genresHTML += `
                        <div class="genre-tag" onclick="openGenreGrid('${genre.id}', '${genreName}')">
                            ${genreName}
                        </div>
                    `;
                });
                genresRow.innerHTML = genresHTML;
            } else {
                document.getElementById('genres-section').style.display = 'none';
            }
            
            const tv = document.getElementById('tv-ui');
            if(type === 'tv') {
                tv.style.display='block';
                const s = document.getElementById('season-dd');
                s.innerHTML='';
                for(let i=1; i<=d.number_of_seasons; i++) s.innerHTML+=`<option value="${i}">Season ${i}</option>`;
                loadEp(1);
                // Show fixed subtitle bar placeholder
                var fixedSub = document.getElementById('ep-sub-bar-fixed');
                if (fixedSub) fixedSub.style.display = 'flex';
            } else {
                tv.style.display='none';
                // The series-only subtitle bar must never remain visible for movies.
                var fixedSubMovie = document.getElementById('ep-sub-bar-fixed');
                if (fixedSubMovie) fixedSubMovie.style.display = 'none';
            }
            renderDlButtons(originalTitle); 
            renderInternalDownloads();
            
            // Load similar titles
            loadSimilarTitles(id, type, d);
            
            document.getElementById('modal').style.display='block';
            
            // Initialize AI Assistant - pass rich data so AI can't confuse this title
            const aiYear = (d.release_date || d.first_air_date || '').split('-')[0];
            const aiOriginalTitle = d.original_title || d.original_name || curTitle;
            const aiImdbId = curImdb || '';
            
            // Build rich context for AI from TMDB data
            const aiDirectors = cred.crew ? cred.crew.filter(c=>c.job==='Director').map(c=>c.name).join(', ') : '';
            const aiCast = cred.cast ? cred.cast.slice(0,8).map(c=>c.name).join(', ') : '';
            const aiGenres = d.genres ? d.genres.map(g=>g.name).join(', ') : '';
            const aiRuntime = d.runtime ? `${d.runtime} min` : (d.number_of_seasons ? `${d.number_of_seasons} seasons` : '');
            const aiCountries = d.production_countries ? d.production_countries.map(c=>c.name).join(', ') : '';
            const aiRating = d.vote_average ? d.vote_average.toFixed(1) : '';
            // Use English overview (more complete, AI understands better)
            const aiOverview = (dEN && dEN.overview) ? dEN.overview : (d.overview || '');
            const aiTagline = (dEN && dEN.tagline) ? dEN.tagline : (d.tagline || '');
            // Keywords help AI identify the exact movie theme/plot
            const rawKw = keywordsData ? (keywordsData.keywords || keywordsData.results || []) : [];
            const aiKeywords = rawKw.slice(0,20).map(k=>k.name).join(', ');
            
            const aiRichData = {
                originalTitle: aiOriginalTitle,
                imdbId: aiImdbId,
                tmdbId: id,
                year: aiYear,
                overview: aiOverview,
                directors: aiDirectors,
                cast: aiCast,
                genres: aiGenres,
                runtime: aiRuntime,
                countries: aiCountries,
                rating: aiRating,
                tagline: aiTagline,
                keywords: aiKeywords,
                status: d.status || ''
            };
            
            initAIBox(curTitle, type, aiYear, aiRichData);
        }
        
        // Load similar titles based on genres, director, year, and cast
        async function loadSimilarTitles(id, type, currentItem) {
            const similarSection = document.getElementById('similar-section');
            const similarRow = document.getElementById('similar-row');
            similarRow.innerHTML = '';
            similarSection.style.display = 'none';

            try {
                const genreIds = (currentItem.genres || []).map(g => g.id);
                if (!genreIds.length) return;

                // ---- Gather signal data about the current title (few, cheap calls) ----
                const [creditsData, keywordsData] = await Promise.all([
                    getData(`${type}/${id}/credits`).catch(() => null),
                    getData(`${type}/${id}/keywords`).catch(() => null)
                ]);

                const castIds = creditsData && creditsData.cast ? creditsData.cast.slice(0, 5).map(c => c.id) : [];
                const keywordList = keywordsData ? (keywordsData.keywords || keywordsData.results || []) : [];
                const keywordIds = keywordList.slice(0, 6).map(k => k.id);

                // Director(s)/Creator(s): movies use crew job=Director; TV series already expose created_by directly.
                let creatorIds = [];
                if (type === 'movie' && creditsData && creditsData.crew) {
                    creatorIds = creditsData.crew.filter(c => c.job === 'Director').map(c => c.id);
                } else if (type === 'tv' && currentItem.created_by && currentItem.created_by.length) {
                    creatorIds = currentItem.created_by.map(c => c.id);
                }

                // ---- Build a candidate pool from several independent, targeted queries ----
                // Each source tag is a guaranteed real signal (not a guess), used for scoring below.
                const topGenres = genreIds.slice(0, 2).join(',');
                const queries = [];
                queries.push({ tag: 'genre', p: getData(`discover/${type}?with_genres=${topGenres}&sort_by=popularity.desc&vote_count.gte=50&include_adult=false`).catch(() => null) });
                queries.push({ tag: 'genre', p: getData(`discover/${type}?with_genres=${topGenres}&sort_by=popularity.desc&vote_count.gte=50&page=2&include_adult=false`).catch(() => null) });
                if (castIds.length) {
                    queries.push({ tag: 'cast', p: getData(`discover/${type}?with_cast=${castIds.join('|')}&sort_by=popularity.desc&include_adult=false`).catch(() => null) });
                }
                if (keywordIds.length) {
                    queries.push({ tag: 'keyword', p: getData(`discover/${type}?with_keywords=${keywordIds.join('|')}&sort_by=popularity.desc&include_adult=false`).catch(() => null) });
                }
                queries.push({ tag: 'tmdb_similar', p: getData(`${type}/${id}/similar`).catch(() => null) });

                // Director/creator's own filmography, fetched directly from the person (guaranteed accurate,
                // no dependency on discover's crew-filter support).
                if (creatorIds.length) {
                    creatorIds.slice(0, 2).forEach(personId => {
                        queries.push({
                            tag: 'creator',
                            p: getData(`person/${personId}/${type === 'movie' ? 'movie_credits' : 'tv_credits'}`)
                                .then(r => r ? { results: (type === 'movie' ? (r.crew || []).filter(c => c.job === 'Director') : (r.crew || []).concat(r.cast || [])) } : null)
                                .catch(() => null)
                        });
                    });
                }

                const settled = await Promise.all(queries.map(q => q.p));

                // ---- Merge candidates, tagging every source they appeared in ----
                const pool = new Map(); // id -> { item, tags:Set }
                settled.forEach((data, idx) => {
                    const tag = queries[idx].tag;
                    const results = data && data.results ? data.results : [];
                    results.forEach(r => {
                        if (!r || r.id === id || !r.poster_path) return;
                        if ((r.vote_count || 0) < 20 && tag !== 'creator') return;
                        if (!pool.has(r.id)) pool.set(r.id, { item: r, tags: new Set() });
                        pool.get(r.id).tags.add(tag);
                    });
                });

                // ---- Score using only real, explainable signals (no randomness) ----
                function score(entry) {
                    const it = entry.item;
                    const itGenres = it.genre_ids || (it.genres ? it.genres.map(g => g.id) : []);
                    const sharedGenres = itGenres.filter(g => genreIds.includes(g)).length;
                    let s = sharedGenres * 25;
                    if (entry.tags.has('creator')) s += 70;
                    if (entry.tags.has('cast')) s += 40;
                    if (entry.tags.has('keyword')) s += 35;
                    if (entry.tags.has('tmdb_similar')) s += 15;
                    s += Math.min(15, (it.vote_average || 0) * 1.2);
                    return { sharedGenres, s };
                }

                let scored = Array.from(pool.values()).map(entry => {
                    const { sharedGenres, s } = score(entry);
                    return { item: entry.item, sharedGenres, score: s };
                });

                // Precision floor: require at least one real shared genre so results stay genuinely relevant,
                // never just "TMDB thought this was popular too".
                let strong = scored.filter(x => x.sharedGenres >= 1);
                strong.sort((a, b) => b.score - a.score);

                let finalList = strong.slice(0, 20);
                if (finalList.length < 10) {
                    // Not enough strict matches: extend using the same genre-guaranteed pool only
                    // (never pad with genuinely unrelated titles).
                    const rest = scored.filter(x => x.sharedGenres === 0).sort((a, b) => b.score - a.score);
                    finalList = finalList.concat(rest.slice(0, 10 - finalList.length));
                }

                if (finalList.length > 0) {
                    similarRow.innerHTML = finalList.map(x => makeCard(x.item, type)).join('');
                    similarSection.style.display = 'block';
                }

            } catch (error) {
                console.error('Error loading similar titles:', error);
                similarSection.style.display = 'none';
            }
        }
        
        function epText(v) {
            return String(v == null ? '' : v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
        }
        function episodeDateLabel(date) {
            if (!date) return LANG === 'fa' ? 'تاریخ پخش نامشخص' : 'Air date unavailable';
            return date; // Keep dates and all numeric episode values in English digits.
        }
        function episodeHasPersian(text) {
            return /[\u0600-\u06FF]/.test(String(text || ''));
        }
        function formatEpisodeVotes(count) {
            var n = Number(count || 0);
            if (!isFinite(n) || n <= 0) return '';
            if (n >= 1000000) return (Math.round(n / 100000) / 10).toString().replace('.0','') + 'm';
            if (n >= 1000) return (Math.round(n / 100) / 10).toString().replace('.0','') + 'k';
            return String(Math.round(n));
        }
        async function autoTranslateEpisodeField(id, text) {
            if (LANG !== 'fa' || !text || episodeHasPersian(text)) return;
            var el = document.getElementById(id);
            if (!el) return;
            try {
                var translated = '';
                // Use the existing translator first, then a second public endpoint if it
                // returns the original English text or is temporarily unavailable.
                if (typeof _rvTranslateText === 'function') translated = await _rvTranslateText(text);
                if (!translated || !episodeHasPersian(translated)) {
                    var r = await fetch('https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=fa&dt=t&q=' + encodeURIComponent(text), {cache:'no-store', signal:AbortSignal.timeout(10000)});
                    var d = await r.json();
                    translated = Array.isArray(d) && Array.isArray(d[0]) ? d[0].map(function(x){ return x[0] || ''; }).join('') : '';
                }
                if (translated && episodeHasPersian(translated)) el.textContent = translated;
            } catch (e) {}
        }
        async function loadIMDbEpisodeStats(season, episode, metaId) {
            var meta = document.getElementById(metaId);
            if (!meta || !curImdb) return;
            if (meta.dataset.imdbLoaded === '1' || meta.dataset.imdbLoading === '1') return;
            meta.dataset.imdbLoading = '1';
            var keys = (typeof OMDB_RATING_KEYS !== 'undefined' && OMDB_RATING_KEYS.length) ? OMDB_RATING_KEYS : ['564727fa','trilogy','f6dd47c8'];
            var payload = null;
            for (var i = 0; i < keys.length && !payload; i++) {
                var urls = [
                    'https://www.omdbapi.com/?i=' + encodeURIComponent(curImdb) + '&season=' + season + '&episode=' + episode + '&apikey=' + keys[i],
                    'https://corsproxy.io/?' + encodeURIComponent('https://www.omdbapi.com/?i=' + encodeURIComponent(curImdb) + '&season=' + season + '&episode=' + episode + '&apikey=' + keys[i])
                ];
                for (var j = 0; j < urls.length && !payload; j++) {
                    try {
                        var r = await fetch(urls[j], {cache:'no-store', signal:AbortSignal.timeout(9000)});
                        if (!r.ok) continue;
                        var d = await r.json();
                        if (d && d.Response !== 'False' && d.imdbRating && d.imdbRating !== 'N/A') payload = d;
                    } catch (e) {}
                }
            }
            if (payload) {
                var rating = parseFloat(payload.imdbRating);
                var votes = payload.imdbVotes && payload.imdbVotes !== 'N/A' ? payload.imdbVotes : '';
                meta.textContent = 'IMDb: ' + (isFinite(rating) ? rating.toFixed(1) : payload.imdbRating) + (votes ? ' (' + votes + ')' : '');
                meta.dataset.imdbLoaded = '1';
            } else {
                meta.dataset.imdbLoading = '0';
            }
        }
        function toggleEpisodeDetails(id) {
            const item = document.getElementById(id);
            if (!item) return;
            const wasOpen = item.classList.contains('open');
            document.querySelectorAll('#ep-list .ep-item.open').forEach(x => x.classList.remove('open'));
            if (!wasOpen) {
                item.classList.add('open');
                if (LANG === 'fa') {
                    autoTranslateEpisodeField(item.id.replace('ep-row-', 'ep-title-'), item.dataset.autoTitle || '');
                    autoTranslateEpisodeField(item.id.replace('ep-row-', 'ep-overview-'), item.dataset.autoOverview || '');
                    loadIMDbEpisodeStats(item.dataset.season, item.dataset.episode, item.id.replace('ep-row-', 'ep-imdb-'));
                }
            }
        }

        async function loadEp(s) {
            curSeason = parseInt(s);
            const c = document.getElementById('ep-list');
            c.innerHTML = '<div style="text-align:center;padding:18px;color:var(--muted,#aaa)"><i class="fa-solid fa-spinner fa-spin"></i></div>';
            const [d, dEN] = await Promise.all([
                getData(`tv/${curId}/season/${s}`),
                getDataEN(`tv/${curId}/season/${s}`)
            ]);
            c.innerHTML = '';
            if(d && d.episodes) {
                const englishEpisodes = (dEN && dEN.episodes) || [];
                d.episodes.forEach(e => {
                    const epNum = e.episode_number;
                    const enEp = englishEpisodes.find(x => x.episode_number === epNum) || {};
                    const epName = e.name || enEp.name || '';
                    const enName = enEp.name && enEp.name !== epName ? enEp.name : '';
                    const epRating = e.vote_average ? Number(e.vote_average).toFixed(1) : null;
                    const epVotes = formatEpisodeVotes(e.vote_count || enEp.vote_count);
                    const overview = e.overview || enEp.overview || '';
                    const airDate = e.air_date || enEp.air_date || '';
                    const still = e.still_path || enEp.still_path || '';
                    const seasonLabel = LANG === 'fa' ? `فصل ${curSeason} — قسمت ${epNum}` : `S${String(curSeason).padStart(2,'0')} E${String(epNum).padStart(2,'0')}`;
                    const dlUrl = curImdb ? `https://dl.vidsrc.vip/tv/${curImdb}/${curSeason}/${epNum}` : '#';
                    const dlDisabled = !curImdb;
                    const itemId = `ep-row-${curSeason}-${epNum}`;
                    const ratingBadge = epRating && epRating > 0 ? `
                        <div style="display:flex;flex-direction:column;align-items:center;gap:1px;margin-right:4px;flex-shrink:0;">
                            <span style="font-size:8px;font-weight:800;color:#f5c518;letter-spacing:0.5px;line-height:1;">IMDb</span>
                            <span style="font-size:11px;font-weight:700;color:#f5c518;line-height:1;">${epRating}</span>
                        </div>` : '';
                    const detailTitle = LANG === 'fa' ? 'خلاصه' : 'Overview';
                    const dateTitle = LANG === 'fa' ? 'تاریخ پخش' : 'Air date';
                    const noOverview = LANG === 'fa' ? 'خلاصه رسمی این قسمت در دسترس نیست.' : 'No official overview is available for this episode.';
                    c.innerHTML += `
                        <div class="ep-item" id="${itemId}" data-auto-title="${epText(epName)}" data-auto-overview="${epText(overview)}" data-season="${curSeason}" data-episode="${epNum}" onclick="toggleEpisodeDetails('${itemId}')">
                            <span class="ep-toggle"><i class="fa-solid fa-chevron-right"></i></span>
                            <div class="ep-info">
                                <span class="ep-num">${seasonLabel}</span>
                                <span class="ep-name">${epText(epName)}</span>
                            </div>
                            <div class="ep-actions">
                                ${ratingBadge}
                                <button class="ep-sub-btn" title="${LANG === 'fa' ? 'زیرنویس قسمت' : 'Episode subtitles'}" onclick="event.stopPropagation();openEpisodeSubtitlePicker(${curSeason}, ${epNum})"><i class="fa-solid fa-closed-captioning"></i></button>
                                <button class="ep-play-btn" title="${LANG === 'fa' ? 'پخش آنلاین' : 'Watch Online'}" onclick="event.stopPropagation();playEpisode(${curSeason}, ${epNum})"><i class="fa-solid fa-play"></i></button>
                            </div>
                            <div class="ep-details">
                                <div class="ep-details-top">
                                    ${still ? `<img class="ep-still" src="${IMG_LG + still}" alt="${epText(epName)}" loading="lazy">` : '<div class="ep-still"></div>'}
                                    <div class="ep-detail-copy">
                                        <h4 class="ep-detail-title" id="ep-title-${curSeason}-${epNum}">${epText(epName || (LANG === 'fa' ? 'قسمت بدون عنوان' : 'Untitled episode'))}</h4>
                                        ${enName ? `<div class="ep-detail-original">${epText(enName)}</div>` : ''}
                                        <div class="ep-detail-meta"><span>${epText(seasonLabel)}</span><span>${dateTitle}: ${epText(episodeDateLabel(airDate))}</span>${epRating ? `<span id="ep-imdb-${curSeason}-${epNum}">IMDb: ${epRating}${epVotes ? ` (${epVotes})` : ''}</span>` : `<span id="ep-imdb-${curSeason}-${epNum}">IMDb: -</span>`}</div>
                                    </div>
                                </div>
                                <p class="ep-detail-overview"><strong>${detailTitle}:</strong> <span id="ep-overview-${curSeason}-${epNum}">${epText(overview || noOverview)}</span></p>
                            </div>
                        </div>`;
                });
                const subtitleUrls = subtitleUrlsForData(curDataForFav, 'tv', curSeason || 1);
                const subBar = document.getElementById('ep-sub-bar-fixed');
                const subsourceLink = document.getElementById('ep-subsource-link');
                const subf2mLink = document.getElementById('ep-subf2m-link');
                if (subsourceLink) subsourceLink.href = subtitleUrls.subsource;
                if (subf2mLink) subf2mLink.href = subtitleUrls.subf2m;
                if (subBar) subBar.style.display = 'flex';
            }
        }
        
        function playEpisode(season, ep) {
            if(!curImdb && !curId) return alert(LANG==='fa'?'اطلاعات پخش موجود نیست':'Source Unavailable');
            curSeason = season; curEp = ep;
            // نمایش server picker modal برای انتخاب سرور
            _showEpServerPicker(season, ep);
        }

        function _showEpServerPicker(season, ep) {
            // حذف picker قبلی اگه بود
            const existing = document.getElementById('ep-server-picker');
            if (existing) existing.remove();

            const overlay = document.createElement('div');
            overlay.id = 'ep-server-picker';
            overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:600;display:flex;align-items:flex-end;justify-content:center;';

            const isFA = LANG === 'fa';
            let btns = '';
            SERVERS.forEach((srv, i) => {
                const label = isFA ? srv.fa : srv.en;
                btns += `<button onclick="_playEpWithServer(${season},${ep},${i})" style="width:100%;padding:14px 16px;background:#1a1a2e;border:1px solid #2a2a4a;border-radius:10px;color:white;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;text-align:${isFA?'right':'left'};transition:0.15s;" onmousedown="this.style.background='#252545'" onmouseup="this.style.background='#1a1a2e'">
                    <i class="fa-solid fa-circle-play" style="color:#a78bfa;margin-${isFA?'left':'right'}:10px;"></i>${label}
                </button>`;
            });

            overlay.innerHTML = `
                <div style="background:#0d0d1a;border-radius:20px 20px 0 0;width:100%;max-width:520px;padding:20px 16px 32px;max-height:80vh;overflow-y:auto;">
                    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
                        <div style="font-size:14px;font-weight:800;color:white;">
                            ${isFA?`📺 فصل ${season} — قسمت ${ep}`:`📺 Season ${season} — Episode ${ep}`}
                        </div>
                        <button onclick="document.getElementById('ep-server-picker').remove()" style="background:#1e1e1e;border:none;color:#888;width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:16px;">✕</button>
                    </div>
                    <div style="font-size:12px;color:#555;margin-bottom:12px;text-align:${isFA?'right':'left'};">${isFA?'یک سرور انتخاب کنید:':'Choose a server:'}</div>
                    <div style="display:flex;flex-direction:column;gap:8px;">${btns}</div>
                </div>`;

            overlay.addEventListener('click', e => { if(e.target===overlay) overlay.remove(); });
            document.body.appendChild(overlay);
        }

        function _playEpWithServer(season, ep, serverIdx) {
            const picker = document.getElementById('ep-server-picker');
            if (picker) picker.remove();
            curSeason = season; curEp = ep;
            addToHistory({ id:curId, type:curType, title:curTitle, poster:(curDataForFav && curDataForFav.poster_path) ? (IMG_LG + curDataForFav.poster_path) : document.getElementById('d-img').src, genres: curDataForFav ? curDataForFav.genres : null, rate: curDataForFav ? curDataForFav.vote_average : null });
            openPlayerModal(serverIdx);
        }

        function playEpVip(season, ep) {
            playEpisode(season, ep);
        }
        function renderDlButtons(origTitle) {
            const c = document.getElementById('dl-container');
            const box = document.getElementById('download-links-box');
            c.innerHTML = '';
            
            // این باکس فقط برای آثاری که واقعاً لینک دانلود داخلی دارند نمایش داده می‌شود.
            if (!curImdb || !DOWNLOADS_DB[curImdb]) {
                if (box) box.style.display = 'none';
                return;
            }
            
            const dlData = DOWNLOADS_DB[curImdb];
            
            // برای سریال‌هایی که لینک داخلی دارند
            if (curType === 'tv' && dlData.type === 'tvSeries') {
                if (box) box.style.display = '';
                renderTVSeriesDownloads(dlData);
                return;
            }
            
            // برای فیلم‌ها: اگر هیچ لینک واقعی نیست، باکس اصلاً نشان داده نمی‌شود.
            const hasSoftsub = dlData.softsub && Object.keys(dlData.softsub).length > 0;
            const hasDubbed = dlData.dubbed && Object.keys(dlData.dubbed).length > 0;
            if (!hasSoftsub && !hasDubbed) {
                if (box) box.style.display = 'none';
                return;
            }
            if (box) box.style.display = '';
            
            if (hasSoftsub) {
                c.innerHTML += `<div style="color:var(--primary); font-size:14px; font-weight:bold; margin-bottom:15px; display:flex; align-items:center; gap:8px;">
                    <i class="fas fa-closed-captioning"></i> ${LANG === 'fa' ? 'زیرنویس فارسی چسبیده' : 'Persian Subtitle'}
                </div>`;
                renderQualityButtons(dlData.softsub, 'softsub');
            }
            
            if (hasDubbed) {
                c.innerHTML += `<div style="color:#4CAF50; font-size:14px; font-weight:bold; margin:25px 0 15px 0; display:flex; align-items:center; gap:8px;">
                    <i class="fas fa-microphone"></i> ${LANG === 'fa' ? 'دوبله فارسی' : 'Persian Dubbed'}
                </div>`;
                renderQualityButtons(dlData.dubbed, 'dubbed');
            }
        }
        
        // عنوان را دقیقاً به slug عمومی هر دو منبع تبدیل می‌کند.
        // سال جداگانه به انتهای slug اضافه می‌شود؛ از تکرار سال و 404 ناشی از آن جلوگیری می‌شود.
        function buildSubSourceSlug(title, year) {
            let t = String(title || '').normalize('NFKD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[’'`]/g, '')
                .replace(/&/g, ' and ')
                .replace(/[^a-zA-Z0-9\s-]/g, ' ')
                .toLowerCase().trim()
                .replace(/\s+/g, '-').replace(/-+/g, '-')
                .replace(/^-|-$/g, '');
            const y = String(year || '').match(/\b(19|20)\d{2}\b/);
            if (y && !new RegExp('(?:^|-)'+y[0]+'$').test(t)) t += '-' + y[0];
            return t;
        }

        function subtitleSlugForData(data, type) {
            data = data || {};
            // TV subtitle catalogs generally index the English display title, not TMDB's original title.
            const title = type === 'tv'
                ? (data.original_name || data.name || '')
                : (data.original_title || data.title || '');
            const date = type === 'tv' ? '' : (data.release_date || '');
            return buildSubSourceSlug(title, date.split('-')[0] || '');
        }

        function subtitleUrlsForData(data, type, season) {
            const slug = subtitleSlugForData(data, type);
            if (type === 'tv') {
                // Subsource uses the series landing page. Keep that URL unchanged.
                // Subf2m indexes TV entries by season, so its season slug is required;
                // a bare series slug is a 404 for most shows.
                const n = Math.max(1, parseInt(season, 10) || 1);
                const seasonWord = n === 1 ? 'first-season' :
                    n === 2 ? 'second-season' : `season-${n}`;
                const subf2mSeasonSlug = `${slug}-${seasonWord}`;
                return {
                    subsource: `https://subsource.net/series/${slug}`,
                    subf2m: `https://subf2m.co/subtitles/${subf2mSeasonSlug}`
                };
            }
            return {
                subsource: `https://subsource.net/subtitles/${slug}`,
                subf2m: `https://subf2m.co/subtitles/${slug}`
            };
        }

        function episodeSubtitleUrls(season, episode) {
            // Both sources publish episode entries inside the selected season page.
            // Do not append a fabricated #episode fragment: neither site uses that
            // fragment for navigation, and it can send the user to a wrong location.
            const base = subtitleUrlsForData(curDataForFav, 'tv', season);
            return {
                subsource: base.subsource,
                subf2m: base.subf2m
            };
        }

        function openEpisodeSubtitlePicker(season, episode) {
            const urls = episodeSubtitleUrls(season, episode);
            const old = document.getElementById('ep-sub-picker');
            if (old) old.remove();
            const label = LANG === 'fa' ? `منبع زیرنویس — فصل ${season} قسمت ${episode}` : `Subtitle source — S${String(season).padStart(2,'0')} E${String(episode).padStart(2,'0')}`;
            const el = document.createElement('div');
            el.id = 'ep-sub-picker'; el.className = 'ep-sub-picker';
            el.innerHTML = `<div class="ep-sub-picker-box"><h3>${label}</h3><div class="ep-sub-picker-actions">
                <a href="${urls.subsource}" target="_blank" rel="noopener">Subsource</a>
                <a href="${urls.subf2m}" target="_blank" rel="noopener">sub2fm</a>
                <button type="button" onclick="document.getElementById('ep-sub-picker').remove()">${LANG === 'fa' ? 'بستن' : 'Close'}</button>
            </div></div>`;
            el.addEventListener('click', e => { if (e.target === el) el.remove(); });
            document.body.appendChild(el);
        }
        
        
        function renderInternalDownloads() {
            const grid = document.getElementById('internal-dl-grid');
            const section = document.getElementById('internal-dl-section');
            if (!grid) return;
            
            // برای سریال‌ها سکشن دانلود داخلی جداگانه مخفی میشه
            if (curType === 'tv') {
                section.style.display = 'none';
                return;
            }
            
            // اگر IMDB ID موجود نیست، سکشن رو پنهان کن
            if (!curImdb) {
                section.style.display = 'none';
                return;
            }
            
            section.style.display = 'block';
            
            const subtitleUrls = subtitleUrlsForData(curDataForFav, 'movie');
            const subtitleLinks = [
                { id:'subsource', label:'Subsource', sub:'Subsource.net', icon:'fa-solid fa-closed-captioning', cls:'sub-btn', url: subtitleUrls.subsource },
                { id:'subf2m', label:'sub2fm', sub:'subf2m.co', icon:'fa-solid fa-closed-captioning', cls:'sub-btn', url: subtitleUrls.subf2m }
            ];
            
            // ===== گرید جدید با 2 ستون و 3 ردیف =====
            // CSS override برای گرید 2 ستونه
            grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
            
            let html = '';
            subtitleLinks.forEach(srv => {
                const styleAttr = srv.style ? ` style="${srv.style}"` : '';
                if (srv.openVq) {
                    // سرور با modal کیفیت
                    html += `<a href="javascript:void(0)" onclick="openVqModal('${curImdb}','movie');trackInternalDownload('${srv.id}')" class="internal-dl-btn ${srv.cls}"${styleAttr}>
                        <i class="${srv.icon}"></i>
                        <div class="internal-dl-btn-logo">${srv.label}<span>${srv.sub}</span></div>
                    </a>`;
                } else {
                    html += `<a href="${srv.url}" target="_blank" class="internal-dl-btn ${srv.cls}"${styleAttr} onclick="trackInternalDownload('${srv.id}')">
                        <i class="${srv.icon}"></i>
                        <div class="internal-dl-btn-logo">${srv.label}<span>${srv.sub}</span></div>
                    </a>`;
                }
            });
            
            grid.innerHTML = html;
            
            const titleEl = document.getElementById('txt-internal-dl');
            const noteEl = document.getElementById('txt-internal-dl-note');
            if (titleEl) titleEl.innerText = LANG === 'fa' ? 'سرورهای دانلود' : 'Download Servers';
            if (noteEl) noteEl.innerText = LANG === 'fa' 
                ? '۵ سرور دانلود مستقیم | انتخاب کیفیت'
                : '5 Direct Download Servers | Quality Selection';
        }
        
        function trackInternalDownload(source) {
            // اختیاری: ثبت آمار دانلود
            console.log(`Internal download triggered: ${source} | IMDB: ${curImdb} | Type: ${curType}`);
        }
        
        function renderQualityButtons(qualities, type) {
            const c = document.getElementById('dl-container');
            const qualityOrder = ['2160p', '1080p', '720p', '480p'];
            
            // گروه‌بندی کیفیت‌ها
            const groupedQualities = {};
            for (const [key, data] of Object.entries(qualities)) {
                const baseQuality = key.split(' ')[0]; // 1080p, 720p, etc.
                if (!groupedQualities[baseQuality]) {
                    groupedQualities[baseQuality] = [];
                }
                groupedQualities[baseQuality].push({label: key, data: data});
            }
            
            // نمایش به ترتیب کیفیت
            qualityOrder.forEach(quality => {
                if (groupedQualities[quality]) {
                    groupedQualities[quality].forEach(item => {
                        const disabled = !item.data || (!item.data.url && typeof item.data !== 'string');
                        const url = item.data.url || item.data || '';
                        const sizeText = item.data.size || '';
                        const qualityBadge = quality.replace('p', 'P');
                        
                        c.innerHTML += `
                            <div class="quality-btn ${disabled ? 'disabled' : ''}" 
                                 onclick="${disabled ? '' : `showDownloadOptions('${url.replace(/'/g, "\\'")}')`}">
                                <div class="quality-info">
                                    <span class="quality-badge">${qualityBadge}</span>
                                    <div>
                                        <div class="quality-label">${item.label}</div>
                                        ${sizeText ? `<div class="quality-size">${sizeText}</div>` : ''}
                                    </div>
                                </div>
                                <i class="quality-icon fas fa-download"></i>
                            </div>
                        `;
                    });
                }
            });
        }
        
        function renderTVSeriesDownloads(dlData) {
            const c = document.getElementById('dl-container');
            
            // بخش زیرنویس
            if (dlData.softsub && Object.keys(dlData.softsub).length > 0) {
                c.innerHTML += `<div style="color:var(--primary); font-size:14px; font-weight:bold; margin-bottom:15px; display:flex; align-items:center; gap:8px;">
                    <i class="fas fa-closed-captioning"></i> ${LANG === 'fa' ? 'زیرنویس فارسی چسبیده' : 'Persian Subtitle'}
                </div>`;
                renderSeasonDownloads(dlData.softsub, 'softsub');
            }
            
            // بخش دوبله
            if (dlData.dubbed && Object.keys(dlData.dubbed).length > 0) {
                c.innerHTML += `<div style="color:#4CAF50; font-size:14px; font-weight:bold; margin:25px 0 15px 0; display:flex; align-items:center; gap:8px;">
                    <i class="fas fa-microphone"></i> ${LANG === 'fa' ? 'دوبله فارسی' : 'Persian Dubbed'}
                </div>`;
                renderSeasonDownloads(dlData.dubbed, 'dubbed');
            }
        }
        
        function renderSeasonDownloads(seasons, type) {
            const c = document.getElementById('dl-container');
            
            // ترتیب فصل‌ها
            const seasonKeys = Object.keys(seasons).sort((a, b) => {
                const numA = parseInt(a.replace('S', ''));
                const numB = parseInt(b.replace('S', ''));
                return numA - numB;
            });
            
            seasonKeys.forEach(seasonKey => {
                const qualities = seasons[seasonKey];
                const seasonNum = seasonKey.replace('S', '');
                const seasonId = `season-${seasonKey}-${type}`;
                
                c.innerHTML += `
                    <div class="season-download-section">
                        <div class="season-download-header" onclick="toggleSeason('${seasonId}')">
                            <span class="season-download-title">${LANG === 'fa' ? 'فصل' : 'Season'} ${seasonNum}</span>
                            <i class="fas fa-chevron-down season-download-toggle" id="${seasonId}-toggle"></i>
                        </div>
                        <div class="season-download-content" id="${seasonId}"></div>
                    </div>
                `;
            });
            
            // اضافه کردن کیفیت‌ها به فصل‌ها بعد از رندر
            setTimeout(() => {
                seasonKeys.forEach(seasonKey => {
                    const qualities = seasons[seasonKey];
                    const seasonId = `season-${seasonKey}-${type}`;
                    const qualitiesContainer = document.getElementById(seasonId);
                    
                    if (qualitiesContainer) {
                        for (const [quality, url] of Object.entries(qualities)) {
                            const qualityBadge = quality.split(' ')[0].replace('p', 'P');
                            qualitiesContainer.innerHTML += `
                                <div class="quality-btn" onclick="showDownloadOptions('${url.replace(/'/g, "\\'")}')">
                                    <div class="quality-info">
                                        <span class="quality-badge">${qualityBadge}</span>
                                        <div class="quality-label">${quality}</div>
                                    </div>
                                    <i class="quality-icon fas fa-download"></i>
                                </div>
                            `;
                        }
                    }
                });
            }, 100);
        }
        
        function toggleSeason(seasonId) {
            const content = document.getElementById(seasonId);
            const toggle = document.getElementById(`${seasonId}-toggle`);
            
            if (content && toggle) {
                if (content.classList.contains('open')) {
                    content.classList.remove('open');
                    toggle.classList.remove('open');
                } else {
                    content.classList.add('open');
                    toggle.classList.add('open');
                }
            }
        }
        
        function showDownloadOptions(url) {
            currentDownloadUrl = url;
            document.getElementById('download-options-modal').style.display = 'flex';
        }
        
        function closeDownloadOptions() {
            document.getElementById('download-options-modal').style.display = 'none';
            currentDownloadUrl = '';
        }
        
        function downloadDirect() {
            if (currentDownloadUrl) {
                window.location.href = currentDownloadUrl;
                closeDownloadOptions();
            }
        }
        
        function downloadWithADM() {
            if (currentDownloadUrl) {
                // فرمت ویژه ADM
                const admIntent = `intent:${currentDownloadUrl}#Intent;scheme=http;package=com.dv.adm;end`;
                window.location.href = admIntent;
                
                // Fallback: اگر ADM نصب نبود
                setTimeout(() => {
                    const msg = LANG === 'fa' ? 
                        'لطفاً ابتدا ADM را از Google Play نصب کنید' : 
                        'Please install ADM from Google Play first';
                    alert(msg);
                }, 1500);
                
                closeDownloadOptions();
            }
        }
        
        function downloadWithOther() {
            if (currentDownloadUrl) {
                // ایجاد لینک موقت برای باز کردن share sheet
                const a = document.createElement('a');
                a.href = currentDownloadUrl;
                a.download = '';
                a.target = '_blank';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                
                closeDownloadOptions();
            }
        }
        
        let curTrailerYTKey = null;
        let curTrailerIdx = 0;

        function playTrailer(idx) {
            if (!curTrailerKeys || curTrailerKeys.length === 0) {
                if (!curTrailerKey) {
                    alert(LANG === 'fa' ? 'تریلری موجود نیست' : 'No trailer available');
                    return;
                }
                curTrailerKeys = [{ key: curTrailerKey, name: 'Trailer', type: 'Trailer', official: false }];
            }

            curTrailerIdx = (typeof idx === 'number' && idx >= 0 && idx < curTrailerKeys.length) ? idx : 0;
            curTrailerYTKey = curTrailerKeys[curTrailerIdx].key;

            const modal = document.getElementById('trailer-modal');
            modal.style.display = 'flex';

            // Set title
            document.getElementById('trailer-modal-title').innerText = curTitle || '';
            document.getElementById('trailer-close-label').innerText = LANG === 'fa' ? 'بستن' : 'Close';

            // Build trailer list
            buildTrailerList();
        }

        function buildTrailerList() {
            const container = document.getElementById('trailer-list-container');
            const emptyMsg = document.getElementById('trailer-empty-msg');
            container.innerHTML = '';

            if (!curTrailerKeys || curTrailerKeys.length === 0) {
                emptyMsg.style.display = 'flex';
                document.getElementById('trailer-empty-text').innerText = LANG === 'fa' ? 'تریلری یافت نشد' : 'No trailers found';
                // Try YouTube API as fallback
                fetchYouTubeTrailersFallback();
                return;
            }
            emptyMsg.style.display = 'none';

            const isFa = LANG === 'fa';

            curTrailerKeys.forEach((t, i) => {
                const typeLabel = t.type === 'Trailer' ? (isFa ? 'تریلر' : 'Trailer')
                    : t.type === 'Teaser' ? (isFa ? 'تیزر' : 'Teaser')
                    : t.type === 'Featurette' ? (isFa ? 'پشت صحنه' : 'Featurette')
                    : t.type === 'Clip' ? (isFa ? 'کلیپ' : 'Clip')
                    : t.type;
                const officialText = t.official ? (isFa ? ' · رسمی' : ' · Official') : '';
                const thumbUrl = `https://img.youtube.com/vi/${t.key}/mqdefault.jpg`;

                const card = document.createElement('div');
                card.id = `tcard-${i}`;
                card.style.cssText = `background:#141414; border-radius:14px; overflow:hidden; border:2px solid ${i===curTrailerIdx?'#E50914':'transparent'}; transition:border-color 0.2s;`;

                card.innerHTML = `
                    <div style="position:relative; cursor:pointer;" onclick="playInlineTrailer('${t.key}', ${i})">
                        <img src="${thumbUrl}" style="width:100%;height:auto;display:block;max-height:220px;object-fit:cover;" onerror="this.style.background='#222';this.style.minHeight='150px';this.src='';">
                        <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;">
                            <div style="width:52px;height:52px;border-radius:50%;background:rgba(229,9,20,0.88);display:flex;align-items:center;justify-content:center;box-shadow:0 2px 16px rgba(0,0,0,0.7);">
                                <svg viewBox="0 0 10 12" width="18" height="20" fill="white"><polygon points="1,1 9,6 1,11"/></svg>
                            </div>
                        </div>
                        ${t.official ? `<div style="position:absolute;top:8px;${isFa?'left':'right'}:8px;background:#E50914;color:white;font-size:8px;padding:3px 7px;border-radius:5px;font-weight:bold;">${isFa?'رسمی':'Official'}</div>` : ''}
                    </div>
                    <div style="padding:9px 12px 5px;">
                        <div style="color:#fff;font-size:12px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${t.name || typeLabel}</div>
                        <div style="color:#666;font-size:10px;margin-top:2px;">${typeLabel}${officialText}</div>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;border-top:1px solid #222;margin-top:5px;">
                        <button onclick="playInlineTrailer('${t.key}', ${i})" style="background:#1a1a1a; color:#fff; border:none; border-left:1px solid #222; padding:10px 6px; font-size:11px; cursor:pointer; font-family:inherit; display:flex; align-items:center; justify-content:center; gap:5px;">
                            <svg viewBox="0 0 10 12" width="10" height="11" fill="#E50914"><polygon points="1,1 9,6 1,11"/></svg>
                            ${isFa ? 'پخش در اپ' : 'Play In-App'}
                        </button>
                        <button onclick="openTrailerYT('${t.key}', ${i})" style="background:#1a1a1a; color:#fff; border:none; padding:10px 6px; font-size:11px; cursor:pointer; font-family:inherit; display:flex; align-items:center; justify-content:center; gap:5px;">
                            <svg viewBox="0 0 20 14" width="13" height="9" fill="#E50914"><path d="M19.6 2.2C19.4 1.4 18.8.8 18 .6 16.4.2 10 .2 10 .2S3.6.2 2 .6C1.2.8.6 1.4.4 2.2.1 3.8 0 7 0 7s.1 3.2.4 4.8c.2.8.8 1.4 1.6 1.6C3.6 13.8 10 13.8 10 13.8s6.4 0 8-.4c.8-.2 1.4-.8 1.6-1.6.3-1.6.4-4.8.4-4.8s-.1-3.2-.4-4.8zM8 10V4l5.3 3L8 10z"/></svg>
                            ${isFa ? 'یوتیوب' : 'YouTube'}
                        </button>
                    </div>
                `;
                container.appendChild(card);
            });
        }

        // Fetch trailers via YouTube API when TMDB has none
        async function fetchYouTubeTrailersFallback() {
            const container = document.getElementById('trailer-list-container');
            const emptyMsg = document.getElementById('trailer-empty-msg');
            const isFa = LANG === 'fa';
            if (!curTitle) return;

            const year = curDataForFav ? ((curDataForFav.release_date || curDataForFav.first_air_date || '').split('-')[0]) : '';
            const query = curTitle + ' ' + year + ' official trailer';
            
            emptyMsg.style.display = 'none';
            container.innerHTML = '<div style="text-align:center;padding:30px;color:#555;"><i class="fa-solid fa-spinner fa-spin" style="font-size:22px;color:#E50914;"></i></div>';

            const results = await fetchYouTubeVideos(query, 5);
            container.innerHTML = '';

            if (!results || results.length === 0) {
                emptyMsg.style.display = 'flex';
                document.getElementById('trailer-empty-text').innerText = isFa ? 'تریلری یافت نشد' : 'No trailers found';
                return;
            }

            results.forEach((vid, i) => {
                const card = document.createElement('div');
                card.style.cssText = `background:#141414; border-radius:14px; overflow:hidden; border:2px solid ${i===0?'#E50914':'transparent'}; transition:border-color 0.2s; margin-bottom:0;`;

                card.innerHTML = `
                    <div style="position:relative; cursor:pointer;" onclick="playInlineTrailerEmbed('https://www.youtube.com/embed/${vid.videoId}?autoplay=1&playsinline=1', this.closest('div[style]'))">
                        <img src="${vid.thumbnail}" style="width:100%;height:auto;display:block;max-height:220px;object-fit:cover;">
                        <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;">
                            <div style="width:52px;height:52px;border-radius:50%;background:rgba(229,9,20,0.88);display:flex;align-items:center;justify-content:center;box-shadow:0 2px 16px rgba(0,0,0,0.7);">
                                <svg viewBox="0 0 10 12" width="18" height="20" fill="white"><polygon points="1,1 9,6 1,11"/></svg>
                            </div>
                        </div>
                    </div>
                    <div style="padding:9px 12px 5px;">
                        <div style="color:#fff;font-size:12px;font-weight:600;line-height:1.4;">${vid.title.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</div>
                        <div style="color:#666;font-size:10px;margin-top:2px;">${vid.channel}</div>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;border-top:1px solid #222;margin-top:5px;">
                        <button onclick="playInlineTrailerEmbed('https://www.youtube.com/embed/${vid.videoId}?autoplay=1&playsinline=1', this.closest('[style]').parentElement)" style="background:#1a1a1a; color:#fff; border:none; border-left:1px solid #222; padding:10px 6px; font-size:11px; cursor:pointer; font-family:inherit; display:flex; align-items:center; justify-content:center; gap:5px;">
                            <svg viewBox="0 0 10 12" width="10" height="11" fill="#E50914"><polygon points="1,1 9,6 1,11"/></svg>
                            ${isFa ? 'پخش در اپ' : 'Play In-App'}
                        </button>
                        <a href="https://www.youtube.com/watch?v=${vid.videoId}" target="_blank" style="background:#1a1a1a; color:#fff; text-decoration:none; padding:10px 6px; font-size:11px; display:flex; align-items:center; justify-content:center; gap:5px;">
                            <svg viewBox="0 0 20 14" width="13" height="9" fill="#E50914"><path d="M19.6 2.2C19.4 1.4 18.8.8 18 .6 16.4.2 10 .2 10 .2S3.6.2 2 .6C1.2.8.6 1.4.4 2.2.1 3.8 0 7 0 7s.1 3.2.4 4.8c.2.8.8 1.4 1.6 1.6C3.6 13.8 10 13.8 10 13.8s6.4 0 8-.4c.8-.2 1.4-.8 1.6-1.6.3-1.6.4-4.8.4-4.8s-.1-3.2-.4-4.8zM8 10V4l5.3 3L8 10z"/></svg>
                            ${isFa ? 'یوتیوب' : 'YouTube'}
                        </a>
                    </div>
                `;
                container.appendChild(card);
            });
        }

        function playInlineTrailerEmbed(embedUrl, cardEl) {
            const player = document.getElementById('trailer-inline-player');
            const iframe = document.getElementById('trailer-iframe');
            const isFa = LANG === 'fa';
            document.getElementById('close-player-label').innerText = isFa ? 'بستن پلیر' : 'Close Player';
            const embedHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>*{margin:0;padding:0;box-sizing:border-box;}body{background:#000;width:100%;height:100vh;overflow:hidden;}iframe{width:100%;height:100%;border:none;}</style></head><body><iframe src="${embedUrl}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>



<style id="fn-live-filter-two-rows">#live-tab .fn-live-filters{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px 8px;align-items:end}#live-tab .fn-live-filter-field{min-width:0;display:flex;flex-direction:column;gap:3px}#live-tab .fn-live-filter-field>label{display:block;color:var(--sub);font-size:10px;font-weight:700;line-height:15px;padding-inline:2px;white-space:nowrap}#live-tab .fn-live-filter-field .fn-live-input,#live-tab .fn-live-filter-field .fn-live-select{height:34px;min-height:34px;padding:7px 9px;border-radius:8px;line-height:18px;font-size:11px}#live-tab .fn-live-filters>.fn-live-filter-field:nth-child(4){grid-column:1}#live-tab .fn-live-filters>.fn-live-filter-field:nth-child(5){grid-column:2}@media(max-width:620px){#live-tab .fn-live-filters{grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}#live-tab .fn-live-filter-field>label{font-size:9px}}</style></body></html>`;
            iframe.removeAttribute('src');
            iframe.srcdoc = embedHtml;
            player.style.display = 'block';
            player.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        function playInlineTrailer(key, idx) {
            // Highlight card
            curTrailerIdx = idx;
            curTrailerYTKey = key;
            const cards = document.getElementById('trailer-list-container').children;
            Array.from(cards).forEach((c, i) => { c.style.borderColor = i === idx ? '#E50914' : 'transparent'; });

            // Show inline player
            const player = document.getElementById('trailer-inline-player');
            const iframe = document.getElementById('trailer-iframe');
            const isFa = LANG === 'fa';
            document.getElementById('close-player-label').innerText = isFa ? 'بستن پلیر' : 'Close Player';

            // Use srcdoc with full HTML to avoid referrer/origin blocking from content:// 
            const embedHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>*{margin:0;padding:0;box-sizing:border-box;}body{background:#000;width:100%;height:100vh;overflow:hidden;}iframe{width:100%;height:100%;border:none;}</style></head><body><iframe src="https://www.youtube.com/embed/${key}?autoplay=1&playsinline=1&rel=0&modestbranding=1&controls=1&fs=1" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></body></html>`;

            iframe.removeAttribute('src');
            iframe.srcdoc = embedHtml;
            player.style.display = 'block';

            // Scroll to player
            player.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        function closeInlinePlayer() {
            const player = document.getElementById('trailer-inline-player');
            const iframe = document.getElementById('trailer-iframe');
            iframe.srcdoc = '';
            iframe.removeAttribute('src');
            player.style.display = 'none';
        }

        function openTrailerYT(key, idx) {
            if (typeof idx === 'number') {
                curTrailerIdx = idx;
                curTrailerYTKey = key;
                // Highlight selected
                const cards = document.getElementById('trailer-list-container').children;
                Array.from(cards).forEach((c, i) => {
                    c.style.borderColor = i === idx ? '#E50914' : 'transparent';
                });
            }
            // Try YouTube app intent first (Android), fallback to browser
            const intentUrl = `intent://www.youtube.com/watch?v=${key}#Intent;package=com.google.android.youtube;scheme=https;end`;
            const a = document.createElement('a');
            a.href = intentUrl;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            // Fallback to browser after short delay if app didn't open
            setTimeout(() => {
                try {
                    window.open(`https://www.youtube.com/watch?v=${key}`, '_blank');
                } catch(e) {}
            }, 800);
        }

        function openWithYouTubeApp(videoId) {
            openTrailerYT(videoId || curTrailerYTKey);
        }

        function openYouTubeDirect(videoId) {
            const key = videoId || curTrailerYTKey;
            if (key) window.open(`https://www.youtube.com/watch?v=${key}`, '_blank');
            closeTrailer();
        }

        function closeTrailer() {
            closeInlinePlayer();
            document.getElementById('trailer-modal').style.display = 'none';
            curTrailerYTKey = null;
        }


        // === SERVER DEFINITIONS ===
        const SERVERS = [
            { key: 'autoembed',  fa: 'سرور ۱ (AutoEmbed)',     en: 'Server 1 (AutoEmbed)',
              movie: (id,tm,im)=>`https://autoembed.co/movie/imdb/${im||tm}`,
              tv: (id,s,e,tm,im)=>`https://autoembed.co/tv/imdb/${im||tm}/${s}/${e}` },
            { key: 'vidsrcme',   fa: 'سرور ۲ (VidSrc)',        en: 'Server 2 (VidSrc)',
              movie: (id,tm,im)=>`https://vidsrcme.ru/embed/movie/${im||tm}`,
              tv: (id,s,e,tm,im)=>`https://vidsrcme.ru/embed/tv/${im||tm}/${s}/${e}` },
            { key: 'embed2',     fa: 'سرور ۳ (2Embed)',        en: 'Server 3 (2Embed)',
              movie: (id,tm,im)=>`https://www.2embed.cc/embed/${im||tm}`,
              tv: (id,s,e,tm,im)=>`https://www.2embed.cc/embedtv/${im||tm}&s=${s}&e=${e}` },
            { key: 'smashynet',  fa: 'سرور ۴ (SmashyStream)',  en: 'Server 4 (SmashyStream)',
              movie: (id,tm,im)=>`https://embed.smashystream.com/playere.php?imdb=${im||tm}`,
              tv: (id,s,e,tm,im)=>`https://embed.smashystream.com/playere.php?imdb=${im||tm}&season=${s}&episode=${e}` },
            { key: 'nontongo',   fa: 'سرور ۵ (NontonGo)',      en: 'Server 5 (NontonGo)',
              movie: (id,tm,im)=>`https://www.nontongo.win/embed/movie/${im||tm}`,
              tv: (id,s,e,tm,im)=>`https://www.nontongo.win/embed/tv/${im||tm}/${s}/${e}` },
            { key: 'movies111',  fa: 'سرور ۷ (111Movies)',     en: 'Server 7 (111Movies)',
              movie: (id,tm,im)=>`https://111movies.com/movie/${tm}`,
              tv: (id,s,e,tm,im)=>`https://111movies.com/tv/${tm}/${s}/${e}` },
            { key: 'vidlink',    fa: 'سرور ۸ (VidLink)',       en: 'Server 8 (VidLink)',
              movie: (id,tm,im)=>`https://vidlink.pro/movie/${tm}`,
              tv: (id,s,e,tm,im)=>`https://vidlink.pro/tv/${tm}/${s}/${e}` },
            { key: 'videasy',    fa: 'سرور ۹ (VidEasy)',       en: 'Server 9 (VidEasy)',
              movie: (id,tm,im)=>`https://player.videasy.net/movie/${tm}`,
              tv: (id,s,e,tm,im)=>`https://player.videasy.net/tv/${tm}/${s}/${e}` },
        ];
        
        let curPlayerServer = 0;
        
        function getServerUrl(srv) {
            if(!curId && !curImdb) return '';
            const imdb = curImdb || '';
            const tmdb = curId || '';
            const id = imdb || tmdb;
            if(curType === 'movie') return srv.movie(id, tmdb, imdb);
            return srv.tv(id, curSeason||1, curEp||1, tmdb, imdb);
        }
        
        function buildServerTabs() {
            const tabs = document.getElementById('player-server-tabs');
            if(!tabs) return;
            tabs.innerHTML = '';
            SERVERS.forEach((srv, i) => {
                const label = LANG === 'fa' ? srv.fa : srv.en;
                const btn = document.createElement('button');
                btn.className = 'psrv-tab' + (i === curPlayerServer ? ' active' : '');
                btn.textContent = label;
                btn.onclick = () => switchServer(i);
                tabs.appendChild(btn);
            });
        }
        
        function _applyServerClass(idx) {
            const pfs = document.getElementById('player-fs');
            if (!pfs) return;
            // Remove all server classes
            SERVERS.forEach(srv => {
                pfs.classList.remove('srv-' + srv.key);
                pfs.classList.remove('srv-' + srv.key + '-movie');
                pfs.classList.remove('srv-' + srv.key + '-tv');
            });
            if (SERVERS[idx]) {
                const key = SERVERS[idx].key;
                pfs.classList.add('srv-' + key);
                if (curType) pfs.classList.add('srv-' + key + '-' + curType);
            }
        }

        function switchServer(idx) {
            curPlayerServer = idx;
            _applyServerClass(idx);
            const tabs = document.querySelectorAll('.psrv-tab');
            tabs.forEach((t,i) => t.classList.toggle('active', i===idx));
            const srv = SERVERS[idx];
            const url = getServerUrl(srv);
            // Keep the app-level landscape state stable while standard server iframes reload.
            const pfs = document.getElementById('player-fs');
            if (pfs && pfs.classList.contains('srv-vidsrcme-tv')) pfs.classList.remove('landscape-mode');
            else if (document.fullscreenElement || document.webkitFullscreenElement) setTimeout(_playerLandscape, 50);
            _setIframeSmart(url);
        }

        // ShowBox داخلی — انتخاب sub-server
        function _openShowboxPicker(serverIdx) {
            const existing = document.getElementById('showbox-picker');
            if (existing) existing.remove();
            const isFA = LANG === 'fa';
            const tm = curId || '';
            const s = curSeason || 1, e = curEp || 1;
            const isTV = curType === 'tv';
            const subServers = [
                { label: 'UpCloud', key: 'upcloud' },
                { label: 'Vidking', key: 'vidking' },
                { label: 'Videasy', key: 'videasy' },
            ];
            let btns = subServers.map(sub => {
                const url = isTV
                    ? `https://showboxmovies.one/tv/${tm}/${s}/${e}?server=${sub.key}`
                    : `https://showboxmovies.one/movie/${tm}?server=${sub.key}`;
                return `<button onclick="document.getElementById('iframe').src='${url}';document.getElementById('showbox-picker').remove();"
                    style="flex:1;padding:12px 8px;background:#1a1a2e;border:1px solid #3a3a5a;border-radius:10px;color:white;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;transition:0.15s;"
                    onmousedown="this.style.background='#2a2a4e'" onmouseup="this.style.background='#1a1a2e'">
                    <i class="fa-solid fa-server" style="color:#a78bfa;display:block;font-size:18px;margin-bottom:4px;"></i>${sub.label}
                </button>`;
            }).join('');
            const overlay = document.createElement('div');
            overlay.id = 'showbox-picker';
            overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:9999;display:flex;align-items:center;justify-content:center;';
            overlay.innerHTML = `
                <div style="background:#0d0d1a;border-radius:16px;padding:20px;width:88%;max-width:340px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                        <div style="color:white;font-size:14px;font-weight:800;">📺 ShowBox — ${isFA?'انتخاب سرور':'Choose Server'}</div>
                        <button onclick="document.getElementById('showbox-picker').remove()" style="background:none;border:none;color:#888;font-size:20px;cursor:pointer;">✕</button>
                    </div>
                    <div style="display:flex;gap:10px;">${btns}</div>
                </div>`;
            overlay.addEventListener('click', ev => { if(ev.target===overlay) overlay.remove(); });
            document.body.appendChild(overlay);
        }
        
        // ── Small dismissible hint shown only when VidSrc is the active
        // server: VidSrc's own embed has an internal "SERVER ▾" dropdown
        // with alternate backend sources — if their default source fails
        // to connect, the user can switch it from inside the player itself. ──
        let _vidsrcHintTimer = null;
        function _showVidSrcHint() {
            const hint = document.getElementById('vidsrc-hint');
            const textEl = document.getElementById('vidsrc-hint-text');
            if (!hint || !textEl) return;
            const srv = SERVERS[curPlayerServer];
            clearTimeout(_vidsrcHintTimer);
            if (!srv || srv.key !== 'vidsrcme') { hint.classList.remove('show'); return; }
            textEl.textContent = LANG === 'fa'
                ? '💡 اگه پخش نشد، روی «SERVER ▾» داخل پلیر بزن و منبع دیگه‌ای رو امتحان کن'
                : '💡 If it won\'t play, tap "SERVER ▾" inside the player to try another source';
            hint.classList.add('show');
            _vidsrcHintTimer = setTimeout(() => { hint.classList.remove('show'); }, 7000);
        }

        function openPlayerModal(serverIdx) {
            if(!curImdb && !curId) return alert('اطلاعات پخش موجود نیست');
            addToHistory({ id: curId, type: curType, title: curTitle, poster: (curDataForFav && curDataForFav.poster_path) ? (IMG_LG + curDataForFav.poster_path) : document.getElementById('d-img').src, genres: curDataForFav ? curDataForFav.genres : null, rate: curDataForFav ? curDataForFav.vote_average : null });
            
            if (serverIdx !== undefined) {
                curPlayerServer = serverIdx;
            } else if (curType === 'tv') {
                const vidsrcIdx = SERVERS.findIndex(s => s.key === 'vidsrcme');
                curPlayerServer = vidsrcIdx >= 0 ? vidsrcIdx : 0;
            } else {
                curPlayerServer = 0;
            }
            
            const titleEl = document.getElementById('player-title-text');
            const epEl = document.getElementById('player-ep-label');
            if(titleEl) titleEl.textContent = curTitle || '';
            if(epEl) {
                if(curType === 'tv' && curSeason && curEp) epEl.textContent = `S${curSeason} · E${curEp}`;
                else epEl.textContent = '';
            }
            
            // Show/hide episode nav buttons (prev/list/next) for TV
            const epToggle = document.getElementById('player-ep-toggle');
            const prevEpBtn = document.getElementById('player-prev-ep-btn');
            const nextEpBtn = document.getElementById('player-next-ep-btn');
            const isTV = (curType === 'tv');
            if(epToggle) epToggle.style.display = isTV ? 'flex' : 'none';
            if(prevEpBtn) prevEpBtn.style.display = isTV ? 'flex' : 'none';
            if(nextEpBtn) nextEpBtn.style.display = isTV ? 'flex' : 'none';
            
            // Close episode menu if open
            const epMenu = document.getElementById('player-ep-menu');
            if(epMenu) epMenu.classList.remove('open');
            
            buildServerTabs();
            _applyServerClass(curPlayerServer);
            const url = getServerUrl(SERVERS[curPlayerServer]);
            _setIframeSmart(url);
            const pfs = document.getElementById('player-fs');
            pfs._fnLandscapeRequested = false;
            pfs.style.display = 'flex';
            
            // Show topbar and start 5-second auto-hide timer
            _showTopbar();
            _startTopbarTimer();
            
            // Request fullscreen on player div, then lock to landscape
            const _fsReq = pfs.requestFullscreen || pfs.webkitRequestFullscreen || pfs.mozRequestFullScreen;
            const _lockLS = function() {
                try {
                    if (screen.orientation && screen.orientation.lock) {
                        screen.orientation.lock('landscape').catch(function() { pfs.classList.add('landscape-mode'); });
                    } else if (window.screen.lockOrientation) {
                        window.screen.lockOrientation('landscape-primary');
                    } else {
                        pfs.classList.add('landscape-mode');
                    }
                } catch(e) { pfs.classList.add('landscape-mode'); }
            };
            if (_fsReq) {
                _fsReq.call(pfs).then(_lockLS).catch(_lockLS);
            } else {
                _lockLS();
            }
        }
        
        function togglePlayerEpMenu() {
            const menu = document.getElementById('player-ep-menu');
            const backdrop = document.getElementById('player-ep-backdrop');
            if(!menu) return;
            const isOpen = menu.classList.toggle('open');
            if(backdrop) backdrop.classList.toggle('open', isOpen);
            if(isOpen) buildPlayerEpMenu();
        }
        
        function buildPlayerEpMenu() {
            const seasonSel = document.getElementById('player-season-select');
            const epList = document.getElementById('player-ep-list');
            if(!seasonSel || !epList || !curDataForFav) return;
            
            const totalSeasons = curDataForFav.number_of_seasons || curSeason || 1;
            seasonSel.innerHTML = '';
            for(let s = 1; s <= totalSeasons; s++) {
                const opt = document.createElement('option');
                opt.value = s;
                opt.textContent = LANG === 'fa' ? `فصل ${s}` : `Season ${s}`;
                if(s === (curSeason || 1)) opt.selected = true;
                seasonSel.appendChild(opt);
            }
            // Update close btn text
            const closeLabel = document.getElementById('txt-pep-close');
            if(closeLabel) closeLabel.textContent = LANG === 'fa' ? 'بستن' : 'Close';
            
            loadPlayerSeasonEps(curSeason || 1);
        }
        
        async function loadPlayerSeason(s) {
            curSeason = parseInt(s);
            loadPlayerSeasonEps(curSeason);
        }
        
        async function loadPlayerSeasonEps(season) {
            const epList = document.getElementById('player-ep-list');
            if(!epList) return;
            epList.innerHTML = '<div style="text-align:center;padding:20px;color:#555;"><i class="fa-solid fa-spinner fa-spin"></i></div>';
            
            try {
                const data = await getData(`tv/${curId}/season/${season}`);
                if(!data || !data.episodes) { epList.innerHTML = ''; return; }
                
                epList.innerHTML = '';
                data.episodes.forEach(ep => {
                    const epNum = ep.episode_number;
                    const epName = ep.name || '';
                    const rating = ep.vote_average ? parseFloat(ep.vote_average).toFixed(1) : null;
                    const isActive = (parseInt(season) === curSeason && epNum === curEp);
                    
                    const numLabel = LANG === 'fa'
                        ? `ف${season} ق${epNum}`
                        : `S${season}·E${String(epNum).padStart(2,'0')}`;
                    
                    const div = document.createElement('div');
                    div.className = 'pep-item' + (isActive ? ' active' : '');
                    div.dataset.ep = epNum;
                    div.innerHTML = '<span class="pep-num">' + numLabel + '</span>'
                        + '<span class="pep-name">' + epName + '</span>'
                        + (rating && rating > 0 ? '<span class="pep-rating">⭐' + rating + '</span>' : '');
                    div.onclick = () => playerPlayEp(parseInt(season), epNum);
                    epList.appendChild(div);
