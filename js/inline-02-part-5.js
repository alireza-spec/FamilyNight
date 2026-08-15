                    }
                } catch(e) {}
            }
            return company.logo || '';
        }
        async function hydrateCompanyLogo(idx) {
            const company = COMPANIES_CLEAN[idx];
            if (!company) return;
            const logo = await resolveCompanyLogo(company);
            if (!logo) return;
            document.querySelectorAll(`[data-company-logo-idx=\"${idx}\"]`).forEach(img => {
                if (img) {
                    if (img.src !== logo) img.src = logo;
                    img.style.filter = 'drop-shadow(0 1px 1px rgba(255,255,255,.95)) drop-shadow(0 -1px 1px rgba(0,0,0,.85)) drop-shadow(1px 0 1px rgba(255,255,255,.65)) drop-shadow(-1px 0 1px rgba(0,0,0,.65))';
                    img.style.display = 'block';
                }
            });
        }
        function hydrateVisibleCompanyLogos(start, end) {
            for (let i = start; i < end; i++) hydrateCompanyLogo(i);
        }

        // Render company card (small for horizontal scroll)
        function makeCompanyCard(company, idx) {
            const bgColor = company.bg || '#000000';
            const isWhiteBg = bgColor === '#ffffff' || bgColor === '#f0f0f0';
            const emojiColor = isWhiteBg ? '#000' : '#fff';
            const imgFilter = companyLogoFilter(company);
            const logoSrc = getCompanyLogoSrc(company);
            const logoHtml = logoSrc 
                ? `<img src="${logoSrc}" data-company-logo-idx="${idx}" class="company-logo-img" loading="lazy" style="${imgFilter}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'"><span class="company-emoji" style="display:none;align-items:center;justify-content:center;font-size:20px;font-weight:900;color:${emojiColor};">${company.emoji}</span>`
                : `<span class="company-emoji" style="font-size:20px;font-weight:900;color:${emojiColor};">${company.emoji}</span>`;
            const displayName = LANG === 'fa' && company.nameFA ? company.nameFA : company.name;
            const typeName = getCompanyTypeName(company.type);
            return `
                <div class="company-card" onclick="openCompanyWorks(${idx})">
                    <div class="company-logo-wrap" style="background:${bgColor};">
                        ${logoHtml}
                    </div>
                    <div class="company-name">${displayName}</div>
                    <div class="company-type">${typeName}</div>
                </div>
            `;
        }

        // Render company card for grid (all view)
        function makeCompanyAllCard(company, idx) {
            const bgColor = company.bg || '#000000';
            const logoBg = `background:${bgColor};`;
            const imgFilter = companyLogoFilter(company);
            const logoSrc = getCompanyLogoSrc(company);
            const logoHtml = logoSrc 
                ? `<img src="${logoSrc}" data-company-logo-idx="${idx}" style="width:78%;height:78%;object-fit:contain;${imgFilter}" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'"><span class="co-emoji" style="display:none">${company.emoji}</span>`
                : `<span class="co-emoji">${company.emoji}</span>`;
            const displayName = LANG === 'fa' && company.nameFA ? company.nameFA : company.name;
            const typeName = getCompanyTypeName(company.type);
            return `
                <div class="company-all-card" onclick="openCompanyWorks(${idx})">
                    <div class="company-all-logo" style="${logoBg}">
                        ${logoHtml}
                    </div>
                    <div class="company-all-name">${displayName}</div>
                    <div class="company-all-type">${typeName}</div>
                </div>
            `;
        }
        
        // Load first 10 companies in horizontal scroll
        function loadCompaniesSection() {
            const el = document.getElementById('trend-companies');
            if (!el) return;
            el.innerHTML = '';
            // Update section title bilingual
            const titleEl = document.getElementById('txt-companies-trend');
            if (titleEl) titleEl.innerText = (LANG === 'fa' ? '🎬 استودیوها و شبکه‌ها' : '🎬 Studios & Networks');
            COMPANIES_CLEAN.slice(0, 10).forEach((c, i) => {
                // Find real index in COMPANIES_CLEAN
                el.innerHTML += makeCompanyCard(c, i);
            });
            hydrateVisibleCompanyLogos(0, Math.min(10, COMPANIES_CLEAN.length));
        }

        // =================== COLLECTIONS (real TMDB collection data, resolved live) ===================
        // Reusable cinematic loading indicator (same visual language as Free Downloads' loader).
        function cineLoaderHTML(text) {
            return `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:40px 20px 26px;width:100%;">
                <div class="pd-cine-loader">
                    <div class="pd-cine-reel"></div>
                    <div class="pd-cine-dot"></div><div class="pd-cine-dot"></div><div class="pd-cine-dot"></div><div class="pd-cine-dot"></div>
                    <div class="pd-cine-clap"><i class="fa-solid fa-clapperboard"></i></div>
                </div>
                <div style="color:var(--text,#fff);font-size:13px;font-weight:700;">${text}</div>
            </div>`;
        }
        function cleanCollectionName(name) {
            if (!name) return '';
            return name.replace(/\s*(Collection|Saga|Trilogy|Duology|Tetralogy|Series)\s*$/i, '').trim();
        }
        function makeCollectionStackCard(coll) {
            const parts = (coll.parts || []).filter(p => p.poster_path);
            const withBackdrop = (coll.parts || []).filter(p => p.backdrop_path);
            const pick = withBackdrop.length ? withBackdrop[Math.floor(Math.random() * withBackdrop.length)] : null;
            const bgUrl = pick ? (IMG_BG + pick.backdrop_path) : (coll.backdrop_path ? (IMG_BG + coll.backdrop_path) : (coll.poster_path ? (IMG_LG + coll.poster_path) : ''));
            const name = cleanCollectionName(coll.name);
            return `
                <div class="collection-card" onclick="openCollectionDetail(${coll.id})">
                    <div class="collection-stack">
                        <div class="stack-layer layer-3"></div>
                        <div class="stack-layer layer-2"></div>
                        <img class="stack-layer layer-1" src="${bgUrl}" loading="lazy">
                        <div class="stack-count"><i class="fa-solid fa-layer-group"></i> ${parts.length}</div>
                    </div>
                    <div class="collection-name">${name}</div>
                </div>
            `;
        }
        const FEATURED_COLLECTION_QUERIES = [
            'The Godfather Collection', 'Harry Potter Collection', 'The Lord of the Rings Collection',
            'X-Men Collection', 'The Hobbit Collection', 'The Hunger Games Collection',
            'John Wick Collection', 'Star Wars Collection', 'The Maze Runner Collection', 'Mission: Impossible Collection'
        ];
        async function resolveBestCollection(query) {
            try {
                const s = await getData(`search/collection?query=${encodeURIComponent(query)}`);
                const candidates = (s && s.results ? s.results : []).filter(r => r.poster_path).slice(0, 4);
                if (!candidates.length) return null;
                const fulls = await Promise.all(candidates.map(c => getData(`collection/${c.id}`).catch(() => null)));
                const valid = fulls.filter(f => f && f.parts && f.parts.filter(p => p.poster_path).length >= 2);
                if (!valid.length) return null;
                // Score by total vote_count across parts: a real blockbuster franchise vastly
                // outweighs an unofficial "making of"/documentary/side collection with the same name.
                valid.forEach(f => { f._score = (f.parts || []).reduce((sum, p) => sum + (p.vote_count || 0), 0); });
                valid.sort((a, b) => b._score - a._score);
                return valid[0];
            } catch (e) { return null; }
        }
        async function loadFeaturedCollections() {
            const el = document.getElementById('trend-collections');
            if (!el) return;
            const titleEl = document.getElementById('txt-collections-trend');
            if (titleEl) titleEl.innerText = (LANG === 'fa' ? '🎬 مجموعه‌ها' : '🎬 Collections');
            const allEl = document.getElementById('txt-collections-all');
            if (allEl) allEl.innerText = LANG === 'fa' ? 'مشاهده همه' : 'See All';
            if (el.dataset.loaded === '1') return;
            el.innerHTML = cineLoaderHTML(LANG === 'fa' ? 'در حال بارگذاری مجموعه‌ها...' : 'Loading collections...');
            try {
                const found = await Promise.all(FEATURED_COLLECTION_QUERIES.map(q => resolveBestCollection(q)));
                el.innerHTML = '';
                found.filter(Boolean).forEach(coll => { el.innerHTML += makeCollectionStackCard(coll); });
                el.dataset.loaded = '1';
            } catch (e) { el.innerHTML = ''; }
        }

        function closeCollectionDetail() {
            document.getElementById('collection-detail-page').style.display = 'none';
        }
        async function openCollectionDetail(id) {
            const page = document.getElementById('collection-detail-page');
            const grid = document.getElementById('collection-detail-grid');
            const titleEl = document.getElementById('collection-detail-title');
            page.style.display = 'flex';
            grid.innerHTML = cineLoaderHTML(LANG === 'fa' ? 'در حال بارگذاری مجموعه...' : 'Loading collection...');
            titleEl.innerText = '...';
            try {
                const full = await getData(`collection/${id}`);
                if (!full) { grid.innerHTML = ''; return; }
                titleEl.innerText = cleanCollectionName(full.name);
                const parts = (full.parts || [])
                    .filter(p => p.poster_path && p.release_date)
                    .sort((a, b) => (a.release_date || '').localeCompare(b.release_date || ''));
                grid.innerHTML = parts.map(p => makeCard(p, 'movie')).join('');
            } catch (e) { grid.innerHTML = ''; }
        }

        // ---- All Collections (See All): curated list of ~180 well-known franchises, ----
        // ---- resolved live via the same proven resolveBestCollection() used for the featured 10. ----
        const ALL_COLLECTIONS_NAMES = [
            'The Godfather Collection','Star Wars Collection','Harry Potter Collection','The Lord of the Rings Collection',
            'The Hobbit Collection','The Dark Knight Collection','Avengers Collection','Iron Man Collection',
            'Captain America Collection','Thor Collection','Spider-Man Collection','The Amazing Spider-Man Collection',
            'Guardians of the Galaxy Collection','Black Panther Collection','Doctor Strange Collection','Deadpool Collection',
            'Ant-Man Collection','Captain Marvel Collection','X-Men Collection','Wolverine Collection',
            'Fantastic Four Collection','Batman Collection','Superman Collection','Justice League Collection',
            'Wonder Woman Collection','Aquaman Collection','The Suicide Squad Collection','Joker Collection',
            'Jurassic Park Collection','Jurassic World Collection','Fast & Furious Collection','Mission: Impossible Collection',
            'John Wick Collection','Indiana Jones Collection','Back to the Future Collection','The Matrix Collection',
            'Terminator Collection','Alien Collection','Predator Collection','Alien vs. Predator Collection',
            'Rocky Collection','Creed Collection','Rambo Collection','Die Hard Collection',
            'Men in Black Collection','Pirates of the Caribbean Collection','Transformers Collection','Ocean\'s Collection',
            'The Bourne Collection','Kingsman Collection','Sherlock Holmes Collection','Mad Max Collection',
            'Planet of the Apes Collection','Godzilla Collection','King Kong Collection','MonsterVerse Collection',
            'Cloverfield Collection','A Quiet Place Collection','The Purge Collection','Now You See Me Collection',
            'Taken Collection','The Expendables Collection','300 Collection','Kick-Ass Collection',
            'The Karate Kid Collection','Rush Hour Collection','Bad Boys Collection','Lethal Weapon Collection',
            'National Treasure Collection','Night at the Museum Collection','The Mummy Collection','The Chronicles of Narnia Collection',
            'Percy Jackson Collection','Divergent Collection','The Maze Runner Collection','The Hunger Games Collection',
            'Twilight Collection','Fifty Shades Collection','Pitch Perfect Collection','The Hangover Collection',
            '22 Jump Street Collection','Ghostbusters Collection','Zoolander Collection','Anchorman Collection',
            'Austin Powers Collection','Scary Movie Collection','American Pie Collection','Legally Blonde Collection',
            'Bring It On Collection','Meet the Parents Collection','Jumanji Collection','Despicable Me Collection',
            'Minions Collection','Shrek Collection','Trolls Collection','Sing Collection',
            'The Boss Baby Collection','The Croods Collection','Puss in Boots Collection','Madagascar Collection',
            'Ice Age Collection','Kung Fu Panda Collection','How to Train Your Dragon Collection','Cars Collection',
            'Toy Story Collection','Finding Nemo Collection','The Incredibles Collection','Frozen Collection',
            'Monsters, Inc. Collection','Up Collection','Inside Out Collection','Coco Collection',
            'Zootopia Collection','Wreck-It Ralph Collection','Moana Collection','Encanto Collection',
            'Alvin and the Chipmunks Collection','Smurfs Collection','Scooby-Doo Collection','Garfield Collection',
            'Paddington Collection','Sonic the Hedgehog Collection','The Conjuring Collection','Insidious Collection',
            'Paranormal Activity Collection','Saw Collection','Halloween Collection','Friday the 13th Collection',
            'A Nightmare on Elm Street Collection','Scream Collection','Final Destination Collection','Resident Evil Collection',
            'Underworld Collection','Blade Collection','The Purge Collection','Annabelle Collection',
            'It Collection','The Grudge Collection','The Ring Collection','Child\'s Play Collection',
            'Evil Dead Collection','Hellraiser Collection','American Horror Story Collection','Cabin in the Woods Collection',
            'The Equalizer Collection','John Rambo Collection','Sicario Collection','Kill Bill Collection',
            'Sin City Collection','Escape Room Collection','Now You See Me Collection','Baby Driver Collection',
            'Knives Out Collection','The Purge Collection','Dune Collection','Blade Runner Collection',
            'Tron Collection','Independence Day Collection','Men in Black Collection','Star Trek Collection',
            'Interstellar Collection','Gravity Collection','The Martian Collection','Edge of Tomorrow Collection',
            'World War Z Collection','I Am Legend Collection','District 9 Collection','Arrival Collection',
            'Kingsman Collection','The Equalizer Collection','Sherlock Gnomes Collection','Paddington Collection',
            'Downton Abbey Collection','Bridget Jones Collection','Mamma Mia Collection','La La Land Collection',
            'A Star Is Born Collection','Rocketman Collection','Bohemian Rhapsody Collection','Grease Collection',
            'High School Musical Collection','Step Up Collection','Magic Mike Collection','Dirty Dancing Collection',
            'The Fast and the Furious Collection','Need for Speed Collection','Gran Turismo Collection','Ford v Ferrari Collection',
            'Cars Collection','Talladega Nights Collection','Days of Thunder Collection','Rush Collection',
            'Miss Congeniality Collection','The Proposal Collection','Bride Wars Collection','27 Dresses Collection',
            'Crazy Rich Asians Collection','To All the Boys Collection','The Kissing Booth Collection','Set It Up Collection',
            'Enchanted Collection','Maleficent Collection','Cinderella Collection','Beauty and the Beast Collection',
            'Aladdin Collection','The Lion King Collection','Mulan Collection','Snow White Collection',
            'Alice in Wonderland Collection','The Jungle Book Collection','Peter Pan Collection','Dumbo Collection',
            'Lilo & Stitch Collection','Brave Collection','Cars Collection','A Bug\'s Life Collection',
            'Ratatouille Collection','WALL-E Collection','The Good Dinosaur Collection','Onward Collection',
            'Soul Collection','Luca Collection','Turning Red Collection','Elemental Collection'
        ];
        let allCollectionsIndex = 0;
        let allCollectionsSeenIds = new Set();
        let allCollectionsLoading = false;
        let allCollectionsExhausted = false;
        function openAllCollectionsPage() {
            allCollectionsIndex = 0;
            allCollectionsSeenIds = new Set();
            allCollectionsExhausted = false;
            document.getElementById('all-collections-grid').innerHTML = '';
            document.getElementById('all-collections-status').innerHTML = '';
            document.getElementById('txt-all-collections-title').innerText = LANG === 'fa' ? '🎬 مجموعه‌ها' : '🎬 Collections';
            document.getElementById('btn-more-collections').style.display = 'block';
            document.getElementById('all-collections-page').style.display = 'flex';
            loadMoreAllCollections();
        }
        function closeAllCollectionsPage() {
            document.getElementById('all-collections-page').style.display = 'none';
        }
        async function loadMoreAllCollections() {
            if (allCollectionsLoading || allCollectionsExhausted) return;
            allCollectionsLoading = true;
            const grid = document.getElementById('all-collections-grid');
            const status = document.getElementById('all-collections-status');
            const moreBtn = document.getElementById('btn-more-collections');
            status.innerHTML = cineLoaderHTML(LANG === 'fa' ? 'در حال یافتن مجموعه‌ها...' : 'Finding collections...');
            let added = 0;
            try {
                // Walk the curated name list in batches until at least 12 new, real collections are rendered.
                while (added < 12 && allCollectionsIndex < ALL_COLLECTIONS_NAMES.length) {
                    const batch = ALL_COLLECTIONS_NAMES.slice(allCollectionsIndex, allCollectionsIndex + 12);
                    allCollectionsIndex += batch.length;
                    const resolved = await Promise.all(batch.map(name => resolveBestCollection(name)));
                    resolved.filter(Boolean).forEach(coll => {
                        if (allCollectionsSeenIds.has(coll.id)) return;
                        allCollectionsSeenIds.add(coll.id);
                        grid.insertAdjacentHTML('beforeend', makeCollectionStackCard(coll));
                        added++;
                    });
                }
                if (allCollectionsIndex >= ALL_COLLECTIONS_NAMES.length) allCollectionsExhausted = true;
            } catch (e) {
                // fall through — whatever was already appended to the grid stays; status below reflects outcome.
            } finally {
                status.innerHTML = '';
                if (added === 0 && grid.children.length === 0) {
                    status.innerText = allCollectionsExhausted
                        ? (LANG === 'fa' ? 'موردی پیدا نشد.' : 'No collections found.')
                        : (LANG === 'fa' ? 'خطا در بارگذاری. دوباره تلاش کن.' : 'Failed to load. Try again.');
                }
                if (allCollectionsExhausted) moreBtn.style.display = 'none';
                allCollectionsLoading = false;
            }
        }
        // =================== END COLLECTIONS ===================

        // =================== WHERE TO WATCH (LEGAL) — Watchmode ===================
        (function(){
            'use strict';
            function byId(id){ return document.getElementById(id); }
            function isFa(){ return (typeof LANG !== 'undefined' ? LANG : 'fa') === 'fa'; }
            function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }

            var WATCHMODE_API_KEY = '4vJoB2Ou4EViTDkrLoqzEqFjz9cngFFjjihCP6Rr';
            var sourcesLogoCache = null; // fetched once, maps source_id -> {name, logo}

            async function getSourcesLogoMap(){
                if (sourcesLogoCache) return sourcesLogoCache;
                try {
                    var res = await fetch('https://api.watchmode.com/v1/sources/?apiKey=' + WATCHMODE_API_KEY);
                    var data = await res.json();
                    var map = {};
                    (Array.isArray(data) ? data : []).forEach(function(s){
                        map[s.id] = { name: s.name, logo: s.logo_100px || s.logo || '' };
                    });
                    sourcesLogoCache = map;
                } catch(e) { sourcesLogoCache = {}; }
                return sourcesLogoCache;
            }

            var TYPE_LABELS = {
                free: { fa: 'رایگان (با تبلیغ)', en: 'Free (Ad-supported)' },
                sub: { fa: 'اشتراکی', en: 'Subscription' },
                rent: { fa: 'کرایه‌ای', en: 'Rent' },
                buy: { fa: 'خرید', en: 'Buy' },
                tve: { fa: 'شبکه تلویزیونی', en: 'TV Provider' }
            };

            window.openWhereToWatch = async function(){
                if (!curId || !curType) return;
                var page = byId('wtw-page');
                var content = byId('wtw-content');
                var title = byId('wtw-page-title');
                title.textContent = isFa() ? 'کجا تماشا کنم' : 'Where to Watch';
                page.style.display = 'flex';
                content.innerHTML = cineLoaderHTML(isFa() ? 'در حال بررسی پلتفرم‌ها...' : 'Checking platforms...');
                try {
                    var field = curType === 'tv' ? 'tmdb_tv_id' : 'tmdb_movie_id';
                    var searchRes = await fetch('https://api.watchmode.com/v1/search/?apiKey=' + WATCHMODE_API_KEY + '&search_field=' + field + '&search_value=' + curId);
                    var searchData = await searchRes.json();
                    var match = searchData && searchData.title_results && searchData.title_results.length ? searchData.title_results[0] : null;
                    if (!match) {
                        content.innerHTML = '<div style="text-align:center;color:#888;font-size:13px;padding:40px 20px;">' +
                            (isFa() ? 'اطلاعات پخش قانونی برای این اثر پیدا نشد.' : 'No legal streaming info found for this title.') + '</div>';
                        return;
                    }
                    var sourcesRes = await fetch('https://api.watchmode.com/v1/title/' + match.id + '/sources/?apiKey=' + WATCHMODE_API_KEY);
                    var sources = await sourcesRes.json();
                    if (!Array.isArray(sources) || !sources.length) {
                        content.innerHTML = '<div style="text-align:center;color:#888;font-size:13px;padding:40px 20px;">' +
                            (isFa() ? 'در حال حاضر هیچ پلتفرم قانونی‌ای برای این اثر ثبت نشده.' : 'No legal platforms are currently listed for this title.') + '</div>';
                        return;
                    }
                    var logoMap = await getSourcesLogoMap();
                    // De-duplicate by source+type (Watchmode often lists per-region/per-format variants)
                    var seen = {};
                    var groups = { free: [], sub: [], rent: [], buy: [], tve: [] };
                    sources.forEach(function(s){
                        var key = s.source_id + '_' + s.type;
                        if (seen[key]) return;
                        seen[key] = true;
                        if (groups[s.type]) groups[s.type].push(s);
                    });
                    var order = ['free','sub','rent','buy','tve'];
                    var html = '';
                    order.forEach(function(type){
                        if (!groups[type].length) return;
                        html += '<div style="font-size:12px;font-weight:800;color:var(--sub,#999);margin:16px 0 8px;">' + esc(TYPE_LABELS[type][isFa()?'fa':'en']) + '</div>';
                        html += '<div style="display:flex;flex-direction:column;gap:8px;">';
                        groups[type].forEach(function(s){
                            var logo = logoMap[s.source_id] ? logoMap[s.source_id].logo : '';
                            var url = s.web_url || s.ios_url || s.android_url || '#';
                            var priceTxt = s.price ? (' · $' + s.price) : '';
                            html += '<a href="' + esc(url) + '" target="_blank" rel="noopener" style="display:flex;align-items:center;gap:12px;background:var(--card,#1c1c1c);border-radius:12px;padding:10px 14px;text-decoration:none;">' +
                                (logo ? '<img src="' + esc(logo) + '" style="width:36px;height:36px;border-radius:8px;object-fit:contain;background:#fff;">' : '<div style="width:36px;height:36px;border-radius:8px;background:#333;display:flex;align-items:center;justify-content:center;"><i class="fa-solid fa-tv" style="color:#999;"></i></div>') +
                                '<span style="flex:1;color:var(--text,#fff);font-size:13px;font-weight:700;">' + esc(s.name) + priceTxt + '</span>' +
                                '<i class="fa-solid fa-arrow-up-right-from-square" style="color:var(--sub,#999);font-size:12px;"></i>' +
                                '</a>';
                        });
                        html += '</div>';
                    });
                    content.innerHTML = html || ('<div style="text-align:center;color:#888;font-size:13px;padding:40px 20px;">' + (isFa() ? 'موردی پیدا نشد.' : 'Nothing found.') + '</div>');
                } catch(e) {
                    content.innerHTML = '<div style="text-align:center;color:#888;font-size:13px;padding:40px 20px;">' +
                        (isFa() ? 'خطا در بارگذاری اطلاعات پخش.' : 'Failed to load streaming info.') + '</div>';
                }
            };
            window.closeWhereToWatch = function(){
                byId('wtw-page').style.display = 'none';
            };
        })();
        // =================== END WHERE TO WATCH ===================

        // =================== BACKUP & RESTORE ===================
        var FN_BACKUP_KEYS = [
            'family_favs_v2', 'fn_watchlist', 'watch_history', 'explore_likes', 'explore_saved_items',
            'active_theme', 'lang', 'color_scheme_pref', 'primary_color',
            'theme_bg', 'theme_border', 'theme_button', 'theme_button2', 'theme_card', 'theme_input',
            'theme_light', 'theme_on_primary', 'theme_soft', 'theme_soft2', 'theme_sub', 'theme_surface', 'theme_text',
            'user_age', 'user_gender', 'user_avatar_url', 'user_profile_name'
        ];
        function exportFNBackup() {
            try {
                var data = {};
                FN_BACKUP_KEYS.forEach(function(k) {
                    var v = localStorage.getItem(k);
                    if (v !== null) data[k] = v;
                });
                var payload = { app: 'Family Night', version: 1, exportedAt: new Date().toISOString(), data: data };
                var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
                var url = URL.createObjectURL(blob);
                var a = document.createElement('a');
                a.href = url;
                a.download = 'family-night-backup-' + new Date().toISOString().slice(0, 10) + '.json';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                setTimeout(function() { URL.revokeObjectURL(url); }, 1000);
            } catch (e) {
                alert(LANG === 'fa' ? 'خطا در ساخت فایل پشتیبان.' : 'Failed to create backup file.');
            }
        }
        function handleFNImportFile(input) {
            var file = input.files && input.files[0];
            if (!file) return;
            var reader = new FileReader();
            reader.onload = function(e) {
                try {
                    var payload = JSON.parse(e.target.result);
                    var data = (payload && payload.data) ? payload.data : payload;
                    if (!data || typeof data !== 'object') throw new Error('invalid');
                    var restored = 0;
                    Object.keys(data).forEach(function(k) {
                        if (FN_BACKUP_KEYS.indexOf(k) > -1) {
                            localStorage.setItem(k, data[k]);
                            restored++;
                        }
                    });
                    if (!restored) throw new Error('empty');
                    alert(LANG === 'fa' ? 'اطلاعات با موفقیت بازیابی شد. اپ رفرش می‌شود...' : 'Data restored successfully. Reloading the app...');
                    location.reload();
                } catch (err) {
                    alert(LANG === 'fa' ? 'این فایل پشتیبان معتبر نیست.' : 'This backup file is not valid.');
                } finally {
                    input.value = '';
                }
            };
            reader.onerror = function() {
                alert(LANG === 'fa' ? 'خطا در خواندن فایل.' : 'Failed to read the file.');
                input.value = '';
            };
            reader.readAsText(file);
        }
        // =================== END BACKUP & RESTORE ===================

        // =================== FAMILY NIGHT EXPLORE ===================
        (function(){
            'use strict';
            function byId(id){ return document.getElementById(id); }
            function isFa(){ return (typeof LANG !== 'undefined' ? LANG : 'fa') === 'fa'; }
            function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }

            // Only Dailymotion works with no setup. Add your own free keys below to enable the rest —
            // getting a key takes a few minutes and each source is skipped silently if left empty.
            // YouTube:  https://console.cloud.google.com/apis/library/youtube.googleapis.com
            // Vimeo:    https://developer.vimeo.com/apps
            // Tumblr:   https://www.tumblr.com/oauth/apps
            // Klipy:    https://klipy.com/developers
            var EXPLORE_KEYS = {
                vimeo: '',
                tumblr: '1wAxRSxiskw3fSWzMeLQ4AUgfId3ME1kkTwL2CEQtZ1AJ8OgT5',
                klipy: ''
            };

            function fmtViews(n){
                n = parseInt(n,10) || 0;
                if (n >= 1000000) return (n/1000000).toFixed(1).replace(/\.0$/,'') + 'M';
                if (n >= 1000) return (n/1000).toFixed(1).replace(/\.0$/,'') + 'K';
                return String(n);
            }

            // ---------------- Banner: crossfading cinematic backdrops ----------------
            var febTimer = null, febToggle = false;
            async function initExploreBannerBg(){
                var sub = byId('feb-sub-text');
                if (sub) sub.textContent = isFa()
                    ? 'کلیپ‌ها و ادیت‌های سینمایی از سراسر وب'
                    : 'Cinematic edits, scenes & fan clips from across the web';
                try {
                    var d = await getData('trending/movie/week');
                    var backdrops = (d.results||[]).filter(function(m){ return m.backdrop_path; }).map(function(m){ return IMG_BG + m.backdrop_path; });
                    if (!backdrops.length) return;
                    var l1 = byId('feb-bg-1'), l2 = byId('feb-bg-2');
                    if (!l1 || !l2) return;
                    var i = 0;
                    l1.style.backgroundImage = 'url(' + backdrops[0] + ')';
                    if (febTimer) clearInterval(febTimer);
                    febTimer = setInterval(function(){
                        i = (i + 1) % backdrops.length;
                        var next = febToggle ? l1 : l2;
                        var cur = febToggle ? l2 : l1;
                        next.style.backgroundImage = 'url(' + backdrops[i] + ')';
                        next.classList.add('feb-active');
                        cur.classList.remove('feb-active');
                        febToggle = !febToggle;
                    }, 3000);
                } catch(e) {}
            }
            window.initExploreBannerBg = initExploreBannerBg;

            // ---------------- Source fetchers (each isolated — a failure never breaks the others) ----------------
            async function fetchDailymotion(q){
                try {
                    var res = await fetch('https://api.dailymotion.com/videos?search=' + encodeURIComponent(q + ' edit') +
                        '&fields=id,title,thumbnail_720_url,owner.username,owner.avatar_240_url,views_total,description&limit=8&family_filter=true');
                    var data = await res.json();
                    return (data.list||[]).map(function(v){
                        return { source:'dailymotion', id:v.id, thumb:v.thumbnail_720_url, title:v.title,
                            caption:v.description||v.title, channelName:v['owner.username']||'Dailymotion',
                            channelAvatar:v['owner.avatar_240_url']||'', viewCount:v.views_total||0, embedType:'dailymotion' };
                    }).filter(function(x){ return x.thumb; });
                } catch(e){ return []; }
            }
            async function fetchYouTube(q){
                if (typeof YT_API_KEY === 'undefined' || !YT_API_KEY) return [];
                try {
                    var res = await fetch('https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=8&safeSearch=strict&q=' + encodeURIComponent(q + ' edit') + '&key=' + YT_API_KEY);
                    var data = await res.json();
                    var items = data.items || [];
                    if (!items.length) return [];
                    var ids = items.map(function(i){ return i.id.videoId; }).join(',');
                    var statsMap = {};
                    try {
                        var statsRes = await fetch('https://www.googleapis.com/youtube/v3/videos?part=statistics&id=' + ids + '&key=' + YT_API_KEY);
                        var statsData = await statsRes.json();
                        (statsData.items||[]).forEach(function(v){ statsMap[v.id] = v.statistics.viewCount; });
                    } catch(e2){}
                    return items.map(function(i){
                        return { source:'youtube', id:i.id.videoId, thumb:i.snippet.thumbnails.high ? i.snippet.thumbnails.high.url : i.snippet.thumbnails.default.url,
                            title:i.snippet.title, caption:i.snippet.description || i.snippet.title, channelName:i.snippet.channelTitle,
                            channelAvatar:'', viewCount:statsMap[i.id.videoId]||0, embedType:'youtube' };
                    });
                } catch(e){ return []; }
            }
            async function fetchVimeo(q){
                if (!EXPLORE_KEYS.vimeo) return [];
                try {
                    var res = await fetch('https://api.vimeo.com/videos?query=' + encodeURIComponent(q) + '&per_page=8', {
                        headers: { Authorization: 'Bearer ' + EXPLORE_KEYS.vimeo }
                    });
                    var data = await res.json();
                    return (data.data||[]).map(function(v){
                        var pic = v.pictures && v.pictures.sizes && v.pictures.sizes.length ? v.pictures.sizes[v.pictures.sizes.length-1].link : '';
                        var avatar = v.user && v.user.pictures && v.user.pictures.sizes && v.user.pictures.sizes.length ? v.user.pictures.sizes[0].link : '';
                        return { source:'vimeo', id:(v.uri||'').split('/').pop(), thumb:pic, title:v.name,
                            caption:v.description||v.name, channelName:v.user?v.user.name:'Vimeo',
                            channelAvatar:avatar, viewCount:v.stats?v.stats.plays:0, embedType:'vimeo' };
                    }).filter(function(x){ return x.thumb; });
                } catch(e){ return []; }
            }
            async function fetchTumblr(q){
                if (!EXPLORE_KEYS.tumblr) return [];
                try {
                    var res = await fetch('https://api.tumblr.com/v2/tagged?tag=' + encodeURIComponent(q) + '&api_key=' + EXPLORE_KEYS.tumblr + '&filter=text');
                    var data = await res.json();
                    return (data.response||[]).filter(function(p){ return p.type==='video' || p.type==='photo'; }).map(function(p){
                        var thumb = p.type==='photo' ? (p.photos && p.photos[0] ? p.photos[0].original_size.url : '') : (p.thumbnail_url||'');
                        return { source:'tumblr', id:p.id, thumb:thumb, title:p.summary||'', caption:p.summary||'',
                            channelName:p.blog_name, channelAvatar:'https://api.tumblr.com/v2/blog/'+p.blog_name+'.tumblr.com/avatar/128',
                            viewCount:p.note_count||0,
                            embedType: p.type==='video' ? 'video_file' : 'image',
                            videoUrl: p.type==='video' ? (p.video_url||'') : '' };
                    }).filter(function(x){ return x.thumb; });
                } catch(e){ return []; }
            }
            async function fetchKlipy(q){
                if (!EXPLORE_KEYS.klipy) return [];
                try {
                    var res = await fetch('https://api.klipy.com/v1/search?q=' + encodeURIComponent(q) + '&api_key=' + EXPLORE_KEYS.klipy + '&limit=8');
                    var data = await res.json();
                    var list = data.data || data.results || [];
                    return list.map(function(c){
                        return { source:'klipy', id:c.id, thumb:(c.images&&c.images.preview?c.images.preview.url:c.thumbnail||''),
                            title:c.title||'', caption:c.title||'', channelName:'Klipy', channelAvatar:'',
                            viewCount:0, embedType:'video_file', videoUrl:(c.images&&c.images.original_mp4?c.images.original_mp4.url:c.mp4||'') };
                    }).filter(function(x){ return x.thumb; });
                } catch(e){ return []; }
            }

            async function fetchTrendingSeeds(){
                try {
                    var d = await getData('trending/all/day');
                    var names = (d.results||[]).map(function(x){ return x.title || x.name; }).filter(Boolean);
                    return names.length ? names : ['cinematic edit','movie scene'];
                } catch(e){ return ['cinematic edit','movie scene']; }
            }
            function shuffle(arr){
                for (var i = arr.length - 1; i > 0; i--) {
                    var j = Math.floor(Math.random() * (i + 1));
                    var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
                }
                return arr;
            }

            var exploreFeed = [];
            var exploreLoading = false;

            async function buildExploreFeed(customQuery){
                var seeds = customQuery ? [customQuery] : shuffle(await fetchTrendingSeeds()).slice(0, 6);
                var fetchers = [fetchDailymotion, fetchYouTube, fetchVimeo, fetchTumblr, fetchKlipy];
                var jobs = [];
                seeds.forEach(function(seed){
                    fetchers.forEach(function(fn){ jobs.push(fn(seed)); });
                });
                var results = await Promise.all(jobs);
                var pool = [];
                results.forEach(function(arr){ pool = pool.concat(arr); });
                return shuffle(pool);
            }

            function renderExploreGrid(items, append){
                var grid = byId('explore-grid');
                if (!append) grid.innerHTML = '';
                var html = items.map(function(item, idx){
                    var globalIdx = exploreFeed.indexOf(item);
                    return '<div class="explore-item" onclick="openExplorePlayer(' + globalIdx + ')">' +
                        '<div class="ei-source">' + esc(item.source) + '</div>' +
                        (item.embedType==='image' ? '' : '<div class="ei-badge"><i class="fa-solid fa-play"></i></div>') +
                        '<img src="' + item.thumb + '" loading="lazy" onerror="this.parentElement.style.display=\'none\'">' +
                        '<div class="ei-views"><i class="fa-regular fa-eye"></i> ' + fmtViews(item.viewCount) + '</div>' +
                        '</div>';
                }).join('');
                grid.innerHTML += html;
            }

            window.openExplorePage = async function(){
                byId('explore-page').style.display = 'flex';
                byId('explore-tab-feed-txt').textContent = isFa() ? 'اکسپلور' : 'Explore';
                byId('explore-tab-saved-txt').textContent = isFa() ? 'ذخیره‌شده‌ها' : 'Saved';
                byId('explore-tab-liked-txt').textContent = isFa() ? 'لایک‌شده‌ها' : 'Liked';
                byId('explore-search-input').placeholder = isFa() ? 'اسم فیلم یا سریال...' : 'Search a movie or show...';
                switchExploreTab('feed');
                if (!exploreFeed.length) await loadExploreFeed();
            };
            window.closeExplorePage = function(){
                byId('explore-page').style.display = 'none';
            };
            window.switchExploreTab = function(tab){
                byId('explore-tab-feed').classList.toggle('active', tab==='feed');
                byId('explore-tab-saved').classList.toggle('active', tab==='saved');
                byId('explore-tab-liked').classList.toggle('active', tab==='liked');
                byId('explore-grid').style.display = tab==='feed' ? 'grid' : 'none';
                byId('explore-saved-grid').style.display = tab==='saved' ? 'grid' : 'none';
                byId('explore-liked-grid').style.display = tab==='liked' ? 'grid' : 'none';
                if (tab==='saved') renderSavedGrid();
                if (tab==='liked') renderLikedGrid();
            };

            async function loadExploreFeed(customQuery){
                if (exploreLoading) return;
                exploreLoading = true;
                var status = byId('explore-status');
                status.innerHTML = cineLoaderHTML(isFa() ? 'در حال یافتن محتوا...' : 'Finding content...');
                byId('explore-grid').innerHTML = '';
                try {
                    exploreFeed = await buildExploreFeed(customQuery);
                    status.innerHTML = '';
                    if (!exploreFeed.length) {
                        status.innerText = isFa() ? 'چیزی پیدا نشد. بعداً دوباره امتحان کن.' : 'Nothing found. Try again later.';
                    } else {
                        renderExploreGrid(exploreFeed, false);
                    }
                } catch(e) {
                    status.innerHTML = '';
                    status.innerText = isFa() ? 'خطا در بارگذاری.' : 'Failed to load.';
                } finally {
                    exploreLoading = false;
                }
            }
            window.loadExploreFeed = loadExploreFeed;

            // ---------------- Search ----------------
            window.toggleExploreSearch = function(){
                var bar = byId('explore-search-bar');
                var showing = bar.style.display === 'flex';
                bar.style.display = showing ? 'none' : 'flex';
                if (!showing) byId('explore-search-input').focus();
            };
            window.runExploreSearch = function(){
                var q = byId('explore-search-input').value.trim();
                if (!q) return;
                switchExploreTab('feed');
                loadExploreFeed(q);
            };
            window.clearExploreSearch = function(){
                byId('explore-search-input').value = '';
                byId('explore-search-bar').style.display = 'none';
                loadExploreFeed();
            };

            // ---------------- Pull to refresh ----------------
            (function(){
                var startY = 0, pulling = false;
                var area = null, indicator = null;
                document.addEventListener('DOMContentLoaded', bind);
                bind();
                function bind(){
                    area = byId('explore-scroll-area');
                    indicator = byId('explore-pull-indicator');
                    if (!area || area.dataset.ptrBound) return;
                    area.dataset.ptrBound = '1';
                    area.addEventListener('touchstart', function(e){
                        if (area.scrollTop <= 0) { startY = e.touches[0].clientY; pulling = true; }
                    }, { passive:true });
                    area.addEventListener('touchmove', function(e){
                        if (!pulling) return;
                        var dy = e.touches[0].clientY - startY;
                        if (dy > 0 && area.scrollTop <= 0) {
                            indicator.style.height = Math.min(60, dy/1.5) + 'px';
                        }
                    }, { passive:true });
                    area.addEventListener('touchend', function(){
                        if (!pulling) return;
                        pulling = false;
                        var h = parseInt(indicator.style.height,10) || 0;
                        indicator.style.height = '0px';
                        if (h >= 50) loadExploreFeed();
                    });
                }
            })();

            // ---------------- Player ----------------
            var curExploreIndex = -1;
            var curExploreItem = null;
            var explorePlaying = true;
            var exploreMuted = false;
            var lastTapTime = 0;
            var exploreDuration = 0;

            function getLikes(){ try { return JSON.parse(localStorage.getItem('explore_likes')||'{}'); } catch(e){ return {}; } }
            function setLikes(o){ localStorage.setItem('explore_likes', JSON.stringify(o)); }
            function getSavedMap(){ try { return JSON.parse(localStorage.getItem('explore_saved_items')||'{}'); } catch(e){ return {}; } }
            function setSavedMap(o){ localStorage.setItem('explore_saved_items', JSON.stringify(o)); }
            function itemKey(item){ return item.source + '_' + item.id; }

            window.openExplorePlayer = function(idx){
                var item = exploreFeed[idx];
                if (!item) return;
                curExploreIndex = idx;
                curExploreItem = item;
                byId('explore-player').style.display = 'flex';
                loadExploreMedia(item);
            };
            window.closeExplorePlayer = function(){
                byId('explore-player').style.display = 'none';
                byId('explore-player-media').innerHTML = '';
            };
            function loadExploreMedia(item){
                var media = byId('explore-player-media');
                var origin = encodeURIComponent(location.origin || '');
                exploreDuration = 0;
                if (item.embedType === 'youtube') {
                    media.innerHTML = '<iframe id="exp-yt-frame" src="https://www.youtube.com/embed/' + item.id + '?autoplay=1&playsinline=1&controls=0&rel=0&modestbranding=1&enablejsapi=1&origin=' + origin + '" allow="autoplay; encrypted-media" allowfullscreen></iframe>';
                    // Establishing the "listening" handshake makes the embedded player start
                    // autonomously broadcasting state/progress — no extra external script needed.
                    setTimeout(function(){
                        var f = byId('exp-yt-frame');
                        if (f && f.contentWindow) f.contentWindow.postMessage(JSON.stringify({event:'listening', id: 'exp-yt-frame'}), '*');
                    }, 400);
                } else if (item.embedType === 'vimeo') {
                    media.innerHTML = '<iframe id="exp-vimeo-frame" src="https://player.vimeo.com/video/' + item.id + '?autoplay=1&muted=0&controls=0&background=0" allow="autoplay; fullscreen"></iframe>';
                    setTimeout(function(){
                        var f = byId('exp-vimeo-frame');
                        if (!f || !f.contentWindow) return;
                        ['play','pause','ended','timeupdate'].forEach(function(ev){
                            f.contentWindow.postMessage(JSON.stringify({method:'addEventListener', value:ev}), '*');
                        });
                    }, 400);
                } else if (item.embedType === 'dailymotion') {
                    media.innerHTML = '<iframe id="exp-dm-frame" src="https://www.dailymotion.com/embed/video/' + item.id + '?autoplay=1&mute=0&controls=0&ui-start-screen-info=0&queue-enable=false" allow="autoplay; fullscreen"></iframe>';
                    setTimeout(function(){
                        var f = byId('exp-dm-frame');
                        if (f && f.contentWindow) f.contentWindow.postMessage(JSON.stringify({command:'muted', parameters:[false]}), '*');
                    }, 600);
                } else if (item.embedType === 'video_file' && item.videoUrl) {
                    media.innerHTML = '<video id="exp-video-file" src="' + item.videoUrl + '" autoplay playsinline></video>';
                    setTimeout(function(){
                        var v = byId('exp-video-file');
                        if (!v) return;
                        v.addEventListener('ended', function(){ v.currentTime = 0; v.play(); });
                    }, 50);
                } else {
                    media.innerHTML = '<img src="' + item.thumb + '" style="width:100%;height:100%;object-fit:contain;">';
                }
                explorePlaying = true;
                exploreMuted = false;
                var centerIcon = byId('explore-center-icon');
                centerIcon.style.transition = 'none';
                centerIcon.style.opacity = '0';
                byId('explore-mute-icon').className = 'fa-solid fa-volume-high';
                byId('explore-player-avatar').src = item.channelAvatar || ('https://ui-avatars.com/api/?background=333&color=fff&name=' + encodeURIComponent(item.channelName||'?'));
                byId('explore-player-channel').textContent = item.channelName || '';
                byId('explore-player-caption').textContent = item.caption || item.title || '';
                byId('explore-player-views').textContent = fmtViews(item.viewCount) + (isFa() ? ' بازدید' : ' views');
                var likes = getLikes();
                var liked = !!likes[itemKey(item)];
                var likeIcon = byId('explore-like-icon');
                likeIcon.className = liked ? 'fa-solid fa-heart liked' : 'fa-regular fa-heart';
                byId('explore-like-count').textContent = fmtViews((liked?1:0) + Math.floor((item.viewCount||0)/137));
                var saves = getSavedMap();
                var saved = !!saves[itemKey(item)];
                byId('explore-save-icon').className = saved ? 'fa-solid fa-bookmark saved' : 'fa-regular fa-bookmark';
            }

            // ---- Real end-of-video detection (drives Instagram-style auto-replay-from-start) ----
            window.addEventListener('message', function(e){
                var data = e.data;
                if (typeof data !== 'string') return;
                var msg;
                try { msg = JSON.parse(data); } catch(err){ return; }
                var yt = byId('exp-yt-frame'), vm = byId('exp-vimeo-frame');
                // YouTube: raw infoDelivery carries playerState (0 = ended).
                if (msg.event === 'infoDelivery' && msg.info) {
                    if (typeof msg.info.duration === 'number') exploreDuration = msg.info.duration;
                    if (msg.info.playerState === 0 && yt && yt.contentWindow) {
                        yt.contentWindow.postMessage(JSON.stringify({event:'command', func:'seekTo', args:[0,true]}), '*');
                        yt.contentWindow.postMessage(JSON.stringify({event:'command', func:'playVideo', args:[]}), '*');
                    }
                }
                // Vimeo: explicit subscribed events.
                if (msg.event === 'ended' && vm && vm.contentWindow) {
                    vm.contentWindow.postMessage(JSON.stringify({method:'setCurrentTime', value:0}), '*');
                    vm.contentWindow.postMessage(JSON.stringify({method:'play'}), '*');
                }
                // Dailymotion: best-effort — its embed posts a plain "video_end"/"end" event on completion.
                if (msg.event === 'video_end' || msg.event === 'end') {
                    var dm = byId('exp-dm-frame');
                    if (dm && dm.contentWindow) {
                        dm.contentWindow.postMessage(JSON.stringify({command:'seek', parameters:[0]}), '*');
                        dm.contentWindow.postMessage(JSON.stringify({command:'play'}), '*');
                    }
                }
            });

            function showCenterIcon(iconClass, persist){
                var el = byId('explore-center-icon');
                var i = el.querySelector('i');
                i.className = iconClass;
                el.style.transition = 'none';
                el.style.opacity = '1';
                if (!persist) {
                    void el.offsetWidth;
                    el.style.transition = 'opacity 0.35s ease';
                    el.style.opacity = '0';
                }
            }

            window.handleExploreTap = function(e){
                var now = Date.now();
                if (now - lastTapTime < 320) {
                    // double tap = like
                    var likes = getLikes();
                    likes[itemKey(curExploreItem)] = curExploreItem;
                    setLikes(likes);
                    byId('explore-like-icon').className = 'fa-solid fa-heart liked';
                    var burst = byId('explore-heart-burst');
                    var rect = byId('explore-tap-layer').getBoundingClientRect();
                    burst.style.left = (e.clientX - rect.left - 45) + 'px';
                    burst.style.top = (e.clientY - rect.top - 45) + 'px';
                    burst.classList.remove('burst'); void burst.offsetWidth; burst.classList.add('burst');
                } else {
                    lastTapTime = now;
                    setTimeout(function(){
                        if (Date.now() - lastTapTime >= 300) toggleExplorePlayPause();
                    }, 320);
                }
            };
            function toggleExplorePlayPause(){
                explorePlaying = !explorePlaying;
                var yt = byId('exp-yt-frame'), vm = byId('exp-vimeo-frame'), dm = byId('exp-dm-frame'), vf = byId('exp-video-file');
                try {
                    if (yt && yt.contentWindow) yt.contentWindow.postMessage(JSON.stringify({event:'command', func: explorePlaying?'playVideo':'pauseVideo', args:[]}), '*');
                    if (vm && vm.contentWindow) vm.contentWindow.postMessage(JSON.stringify({method: explorePlaying?'play':'pause'}), '*');
                    if (dm && dm.contentWindow) dm.contentWindow.postMessage(JSON.stringify({command: explorePlaying?'play':'pause'}), '*');
                    if (vf) { explorePlaying ? vf.play() : vf.pause(); }
                } catch(e) {}
                // Instagram-style feedback: paused → icon appears and stays; resumed → icon flashes then fades fast.
                if (!explorePlaying) showCenterIcon('fa-solid fa-play', true);
                else showCenterIcon('fa-solid fa-play', false);
            }
            window.toggleExploreMute = function(){
                exploreMuted = !exploreMuted;
                byId('explore-mute-icon').className = exploreMuted ? 'fa-solid fa-volume-xmark' : 'fa-solid fa-volume-high';
                var yt = byId('exp-yt-frame'), vm = byId('exp-vimeo-frame'), dm = byId('exp-dm-frame'), vf = byId('exp-video-file');
                try {
                    if (yt && yt.contentWindow) yt.contentWindow.postMessage(JSON.stringify({event:'command', func: exploreMuted?'mute':'unMute', args:[]}), '*');
                    if (vm && vm.contentWindow) vm.contentWindow.postMessage(JSON.stringify({method:'setVolume', value: exploreMuted?0:1}), '*');
                    if (dm && dm.contentWindow) dm.contentWindow.postMessage(JSON.stringify({command:'muted', parameters:[exploreMuted]}), '*');
                    if (vf) vf.muted = exploreMuted;
                } catch(e) {}
            };

            // ---- Vertical swipe navigation between feed items (Reels-style), with live drag-follow ----
            (function(){
                var sy = 0, sx = 0, tracking = false, dragEls = [];
                document.addEventListener('DOMContentLoaded', bindSwipe);
                bindSwipe();
                function getDragEls(){
                    return [byId('explore-player-media'), document.querySelector('.explore-player-sidebar'), document.querySelector('.explore-player-caption')].filter(Boolean);
                }
                function setDrag(px, animated){
                    dragEls.forEach(function(el){
                        el.style.transition = animated ? 'transform 0.25s ease' : 'none';
                        el.style.transform = 'translateY(' + px + 'px)';
                    });
                }
                function bindSwipe(){
                    var layer = byId('explore-tap-layer');
                    if (!layer || layer.dataset.swipeBound) return;
                    layer.dataset.swipeBound = '1';
                    layer.addEventListener('touchstart', function(e){
                        sy = e.touches[0].clientY; sx = e.touches[0].clientX; tracking = true;
                        dragEls = getDragEls();
                    }, { passive:true });
                    layer.addEventListener('touchmove', function(e){
                        if (!tracking) return;
                        var dy = e.touches[0].clientY - sy;
                        var dx = e.touches[0].clientX - sx;
                        if (Math.abs(dy) > Math.abs(dx)) {
                            var atStart = dy > 0 && curExploreIndex === 0;
                            var atEnd = dy < 0 && curExploreIndex >= exploreFeed.length - 1;
                            setDrag(atStart || atEnd ? dy * 0.25 : dy * 0.65, false);
                        }
                    }, { passive:true });
                    layer.addEventListener('touchend', function(e){
                        if (!tracking) return;
                        tracking = false;
                        var dy = e.changedTouches[0].clientY - sy;
                        var dx = e.changedTouches[0].clientX - sx;
                        var winH = window.innerHeight || 800;
                        if (Math.abs(dy) > 70 && Math.abs(dy) > Math.abs(dx) * 1.5 &&
                            ((dy < 0 && curExploreIndex < exploreFeed.length - 1) || (dy > 0 && curExploreIndex > 0))) {
                            var dir = dy < 0 ? -1 : 1;
                            var els = dragEls;
                            els.forEach(function(el){ el.style.transition = 'transform 0.22s ease'; el.style.transform = 'translateY(' + (dir * winH) + 'px)'; });
                            setTimeout(function(){
                                openExplorePlayer(curExploreIndex - dir);
                                var newEls = getDragEls();
                                newEls.forEach(function(el){ el.style.transition = 'none'; el.style.transform = 'translateY(' + (dir * -winH) + 'px)'; });
                                void byId('explore-tap-layer').offsetWidth;
                                requestAnimationFrame(function(){
                                    newEls.forEach(function(el){ el.style.transition = 'transform 0.28s ease'; el.style.transform = 'translateY(0)'; });
                                });
                            }, 220);
                        } else {
                            setDrag(0, true);
                        }
                    });
                }
            })();

            window.toggleExploreLike = function(){
                if (!curExploreItem) return;
                var likes = getLikes();
                var key = itemKey(curExploreItem);
                var liked = !likes[key];
                if (liked) likes[key] = curExploreItem; else delete likes[key];
                setLikes(likes);
                byId('explore-like-icon').className = liked ? 'fa-solid fa-heart liked' : 'fa-regular fa-heart';
            };
            window.toggleExploreSave = function(){
                if (!curExploreItem) return;
                var saves = getSavedMap();
                var key = itemKey(curExploreItem);
                var nowSaved;
                if (saves[key]) { delete saves[key]; nowSaved = false; }
                else { saves[key] = curExploreItem; nowSaved = true; }
                setSavedMap(saves);
                byId('explore-save-icon').className = nowSaved ? 'fa-solid fa-bookmark saved' : 'fa-regular fa-bookmark';
            };
            window.shareExploreItem = function(){
                if (!curExploreItem) return;
                var url = curExploreItem.source === 'youtube' ? ('https://www.youtube.com/watch?v=' + curExploreItem.id)
                    : curExploreItem.source === 'vimeo' ? ('https://vimeo.com/' + curExploreItem.id)
                    : curExploreItem.source === 'dailymotion' ? ('https://www.dailymotion.com/video/' + curExploreItem.id)
                    : (curExploreItem.videoUrl || curExploreItem.thumb);
                if (navigator.share) { navigator.share({ title: curExploreItem.title, url: url }).catch(function(){}); }
                else { navigator.clipboard && navigator.clipboard.writeText(url); alert(isFa() ? 'لینک کپی شد' : 'Link copied'); }
            };
            function renderSavedGrid(){
                var grid = byId('explore-saved-grid');
                var saves = getSavedMap();
                var items = Object.keys(saves).map(function(k){ return saves[k]; });
                if (!items.length) {
                    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:#888;font-size:12px;padding:30px;">' +
                        (isFa() ? 'هنوز چیزی ذخیره نکردی.' : 'Nothing saved yet.') + '</div>';
                    return;
                }
                grid.innerHTML = items.map(function(item, i){
                    var tempIdx = exploreFeed.length + i;
                    exploreFeed[tempIdx] = item; // ensure playable even if not in the current live feed
                    return '<div class="explore-item" onclick="openExplorePlayer(' + tempIdx + ')">' +
                        '<div class="ei-source">' + esc(item.source) + '</div>' +
                        '<img src="' + item.thumb + '" loading="lazy">' +
                        '<div class="ei-views"><i class="fa-regular fa-eye"></i> ' + fmtViews(item.viewCount) + '</div>' +
                        '</div>';
                }).join('');
            }
            function renderLikedGrid(){
                var grid = byId('explore-liked-grid');
                var likes = getLikes();
                var items = Object.keys(likes).map(function(k){ return likes[k]; }).filter(function(x){ return x && x.thumb; });
                if (!items.length) {
                    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:#888;font-size:12px;padding:30px;">' +
                        (isFa() ? 'هنوز چیزی لایک نکردی.' : 'Nothing liked yet.') + '</div>';
                    return;
                }
                grid.innerHTML = items.map(function(item, i){
                    var tempIdx = exploreFeed.length + 1000 + i;
                    exploreFeed[tempIdx] = item;
                    return '<div class="explore-item" onclick="openExplorePlayer(' + tempIdx + ')">' +
                        '<div class="ei-source">' + esc(item.source) + '</div>' +
                        '<img src="' + item.thumb + '" loading="lazy">' +
                        '<div class="ei-views"><i class="fa-regular fa-eye"></i> ' + fmtViews(item.viewCount) + '</div>' +
                        '</div>';
                }).join('');
            }
        })();
        // =================== END FAMILY NIGHT EXPLORE ===================
        
        
        // Companies all page
        let companiesAllPage = 1;
        const COMPANIES_PER_LOAD = 10;
        
        function openCompaniesAll() {
            const page = document.getElementById('companies-all-page');
            page.style.display = 'flex';
            // Update title bilingual
            const titleSpan = page.querySelector('.gg-header span');
            if (titleSpan) titleSpan.innerText = LANG === 'fa' ? '🎬 استودیوها و شبکه‌ها' : '🎬 Studios & Networks';
            const grid = document.getElementById('companies-all-grid');
            grid.innerHTML = '';
            companiesAllPage = 1;
            renderCompaniesPage();
        }
        
        function closeCompaniesAll() {
            document.getElementById('companies-all-page').style.display = 'none';
        }
        
        function renderCompaniesPage() {
            const grid = document.getElementById('companies-all-grid');
            const start = (companiesAllPage - 1) * COMPANIES_PER_LOAD;
            const end = Math.min(start + COMPANIES_PER_LOAD, COMPANIES_CLEAN.length);
            for (let i = start; i < end; i++) {
                grid.innerHTML += makeCompanyAllCard(COMPANIES_CLEAN[i], i);
            }
            hydrateVisibleCompanyLogos(start, end);
            const moreBtn = document.getElementById('btn-more-companies');
            moreBtn.style.display = end >= COMPANIES_CLEAN.length ? 'none' : 'block';
        }
        
        function loadMoreCompanies() {
            companiesAllPage++;
            renderCompaniesPage();
        }
        
        // Company works page
        let cwCompanyId = null;
        let cwCompanyData = null;
        let cwPage = 1;
        let cwTotalPages = 1;
        let cwCurrentType = 'movie';
        
        async function openCompanyWorks(idx) {
            const company = COMPANIES_CLEAN[idx];
            if (!company) return;
            cwCompanyData = company;
            cwCompanyId = company.networkId || company.id;
            cwPage = 1;
            cwTotalPages = 1;
            cwCurrentType = 'all';
            window._cwAllTotalPages = 1;
            
            const page = document.getElementById('company-works-page');
            page.style.display = 'flex';
            
            const displayName = LANG === 'fa' && company.nameFA ? company.nameFA : company.name;
            const typeName = getCompanyTypeName(company.type);
            const t = TEXTS[LANG];
            
            // Hero header
            const logoSrc = getCompanyLogoSrc(company);
            const logoHtml = logoSrc
                ? `<img src="${logoSrc}" data-company-logo-idx="${idx}" style="width:78%;height:78%;object-fit:contain;" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'"><span style="font-size:32px;display:none;align-items:center;justify-content:center;">${company.emoji}</span>`
                : `<span style="font-size:32px">${company.emoji}</span>`;
            hydrateCompanyLogo(idx);
            
            document.getElementById('cw-title').innerText = displayName;
            document.getElementById('cw-content').innerHTML = `
                <div class="company-works-hero">
                    <div class="company-works-logo">${logoHtml}</div>
                    <div class="company-works-title">${displayName}</div>
                    <div class="company-works-type">${typeName}</div>${company.description ? `<div style="font-size:12px;color:#aaa;line-height:1.6;margin:6px 15px 0;text-align:center;">${company.description}</div>` : ''}
                </div>
                <div style="display:flex;gap:8px;padding:12px 15px;border-bottom:1px solid #222;background:#0a0a0a;position:sticky;top:0;z-index:5;">
                    <button onclick="cwFilterType('all')" style="flex:1;padding:10px;background:var(--primary);color:white;border:none;border-radius:8px;font-size:12px;font-weight:bold;cursor:pointer;" id="cw-btn-all">${LANG === 'fa' ? 'همه' : 'All'}</button>
                    <button onclick="cwFilterType('movie')" style="flex:1;padding:10px;background:#222;color:#aaa;border:none;border-radius:8px;font-size:12px;font-weight:bold;cursor:pointer;" id="cw-btn-movie">${t.companyMovies || '🎬 Movies'}</button>
                    <button onclick="cwFilterType('tv')" style="flex:1;padding:10px;background:#222;color:#aaa;border:none;border-radius:8px;font-size:12px;font-weight:bold;cursor:pointer;" id="cw-btn-tv">${t.companySeries || '📺 Series'}</button>
                </div>
                <div class="grid-container" id="cw-grid" style="padding-top:10px;"></div>
            `;
            
            await loadCompanyWorksData('all');
        }
        
        async function cwFilterType(type) {
            cwCurrentType = type;
            cwPage = 1;
            window._cwAllTotalPages = 1;
            const grid = document.getElementById('cw-grid');
            if (grid) grid.innerHTML = '';
            // Update buttons
            const btnA = document.getElementById('cw-btn-all');
            const btnM = document.getElementById('cw-btn-movie');
            const btnT = document.getElementById('cw-btn-tv');
            [[btnA,'all'],[btnM,'movie'],[btnT,'tv']].forEach(([b,k]) => { if (b) { b.style.background = type === k ? 'var(--primary)' : '#222'; b.style.color = type === k ? 'white' : '#aaa'; } });
            await loadCompanyWorksData(type);
        }
        
        async function loadCompanyWorksData(type, append = false) {
            if (!cwCompanyId || !cwCompanyData) return;
            if (type === 'all') {
                const firstPage = cwPage === 1;
                window._cwAllMode = true;
                await loadCompanyWorksData('movie', !firstPage);
                await loadCompanyWorksData('tv', true);
                window._cwAllMode = false;
                const gridAll = document.getElementById('cw-grid');
                if (gridAll) Array.from(gridAll.children).sort((a,b)=>(+b.dataset.cwRank||0)-(+a.dataset.cwRank||0)).forEach(el => gridAll.appendChild(el));
                document.getElementById('btn-more-cw').style.display = cwPage >= (window._cwAllTotalPages || 1) ? 'none' : 'block';
                return;
            }
            const mediaType = type || cwCurrentType;
            const company = cwCompanyData;
            const grid = document.getElementById('cw-grid');
            if (!grid) return;
            
            if (cwPage === 1 && !append) {
                grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:#555;"><i class="fa-solid fa-spinner fa-spin" style="font-size:28px;color:var(--primary);"></i><p style="margin-top:12px;font-size:12px;">Loading...</p></div>';
            }
            
            let results = [], totalPages = 1;
            const existingIds = new Set();
            
            const mergeResults = (data) => {
                if (!data || !data.results) return;
                data.results.forEach(r => {
                    if (!existingIds.has(r.id)) {
                        existingIds.add(r.id);
                        results.push(r);
                    }
                });
                if ((data.total_pages || 1) > totalPages) totalPages = data.total_pages;
            };
            
            if (mediaType === 'movie') {
                // If company has a curated title/year list, search exact titles page-by-page for accurate studio collections.
                if (company.verifiedMovieTitles && company.verifiedMovieTitles.length > 0) {
                    const pageSize = 18;
                    const start = (cwPage - 1) * pageSize;
                    const end = Math.min(start + pageSize, company.verifiedMovieTitles.length);
                    const batch = company.verifiedMovieTitles.slice(start, end);
                    for (const item of batch) {
                        await new Promise(r => setTimeout(r, 25));
                        const qTitle = encodeURIComponent(item.title);
                        const yearPart = item.year ? `&year=${item.year}` : '';
                        const sd = await getDataEN(`search/movie?query=${qTitle}${yearPart}&include_adult=false`);
                        if (sd && sd.results && sd.results.length > 0) {
                            const best = sd.results.find(r => ((r.release_date || '').slice(0,4) == String(item.year))) || sd.results[0];
                            if (best && !existingIds.has(best.id)) { existingIds.add(best.id); results.push(best); }
                        }
                    }
                    totalPages = Math.ceil(company.verifiedMovieTitles.length / pageSize);
                } else if (company.imdbIds && company.imdbIds.length > 0) {
                    const pageSize = 18;
                    const start = (cwPage - 1) * pageSize;
                    const end = Math.min(start + pageSize, company.imdbIds.length);
                    const batch = company.imdbIds.slice(start, end);
                    for (const imdbId of batch) {
                        await new Promise(r => setTimeout(r, 30)); // rate limit
                        const fd = await getData(`find/${imdbId}?external_source=imdb_id`);
                        if (fd && fd.movie_results && fd.movie_results.length > 0) {
                            fd.movie_results.forEach(r => {
                                if (!existingIds.has(r.id)) { existingIds.add(r.id); results.push(r); }
                            });
                        }
                    }
                    totalPages = Math.ceil(company.imdbIds.length / pageSize);
                } else {
                // Primary query with main companyId
                const d1 = await getData(`discover/movie?sort_by=popularity.desc&with_companies=${company.companyId}&page=${cwPage}`);
                mergeResults(d1);
                // Also try networkId if different
                if (company.companyId !== company.networkId) {
                    const d2 = await getData(`discover/movie?sort_by=popularity.desc&with_companies=${company.networkId}&page=${cwPage}`);
                    mergeResults(d2);
                }
                // Try extraIds for richer results (only page 1 to avoid too many requests)
                if (cwPage === 1 && company.extraIds && company.extraIds.length > 0) {
                    for (const eid of company.extraIds) {
                        if (eid !== company.companyId && eid !== company.networkId) {
                            const dx = await getData(`discover/movie?sort_by=popularity.desc&with_companies=${eid}&page=1`);
                            mergeResults(dx);
                        }
                    }
                }
                } // end else
            } else {
                // TV Series - exact title/year list or imdbIds for TV
                if (company.verifiedTvTitles && company.verifiedTvTitles.length > 0) {
                    const pageSize = 18;
                    const start = (cwPage - 1) * pageSize;
                    const end = Math.min(start + pageSize, company.verifiedTvTitles.length);
                    const batch = company.verifiedTvTitles.slice(start, end);
                    for (const item of batch) {
                        await new Promise(r => setTimeout(r, 25));
                        const qTitle = encodeURIComponent(item.title);
                        const yearPart = item.year ? `&first_air_date_year=${item.year}` : '';
                        const sd = await getDataEN(`search/tv?query=${qTitle}${yearPart}&include_adult=false`);
                        if (sd && sd.results && sd.results.length > 0) {
                            const best = sd.results.find(r => ((r.first_air_date || '').slice(0,4) == String(item.year))) || sd.results[0];
                            if (best && !existingIds.has(best.id)) { existingIds.add(best.id); results.push(best); }
                        }
                    }
                    totalPages = Math.ceil(company.verifiedTvTitles.length / pageSize);
                } else if (company.imdbTvIds && company.imdbTvIds.length > 0) {
                    const pageSize = 18;
                    const start = (cwPage - 1) * pageSize;
                    const end = Math.min(start + pageSize, company.imdbTvIds.length);
                    const batch = company.imdbTvIds.slice(start, end);
                    for (const imdbId of batch) {
                        await new Promise(r => setTimeout(r, 30));
                        const fd = await getData(`find/${imdbId}?external_source=imdb_id`);
                        if (fd && fd.tv_results && fd.tv_results.length > 0) {
                            fd.tv_results.forEach(r => {
                                if (!existingIds.has(r.id)) { existingIds.add(r.id); results.push(r); }
                            });
                        }
                    }
                    totalPages = Math.ceil(company.imdbTvIds.length / pageSize);
                } else {
                // TV Series
                if (company.isNetwork) {
                    // Primary: with_networks
                    const d1 = await getData(`discover/tv?sort_by=popularity.desc&with_networks=${company.networkId}&page=${cwPage}`);
                    mergeResults(d1);
                    // Also with_companies
                    if (cwPage === 1 && results.length < 15) {
                        const d2 = await getData(`discover/tv?sort_by=popularity.desc&with_companies=${company.companyId}&page=1`);
                        mergeResults(d2);
                    }
                } else {
                    // Primary: with_companies
                    const d1 = await getData(`discover/tv?sort_by=popularity.desc&with_companies=${company.companyId}&page=${cwPage}`);
                    mergeResults(d1);
                    // Fallback: with_networks
                    if (results.length < 5) {
                        const d2 = await getData(`discover/tv?sort_by=popularity.desc&with_networks=${company.networkId}&page=${cwPage}`);
                        mergeResults(d2);
                    }
                    // Try extraIds
                    if (cwPage === 1 && company.extraIds && company.extraIds.length > 0) {
                        for (const eid of company.extraIds) {
                            if (eid !== company.companyId && eid !== company.networkId) {
                                const dx = await getData(`discover/tv?sort_by=popularity.desc&with_companies=${eid}&page=1`);
                                mergeResults(dx);
                            }
                        }
