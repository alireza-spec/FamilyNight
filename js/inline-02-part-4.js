                });
            } catch(e) {
                epList.innerHTML = '<div style="color:#555;text-align:center;padding:16px;font-size:12px;">خطا در بارگذاری</div>';
            }
        }
        
        function playerPlayEp(season, ep) {
            curSeason = season;
            curEp = ep;
            
            // Update ep label in topbar
            const epEl = document.getElementById('player-ep-label');
            if(epEl) epEl.textContent = `S${season} · E${ep}`;
            
            // Load new URL
            const url = getServerUrl(SERVERS[curPlayerServer]);
            _setIframeSmart(url);
            
            // Close menu immediately
            const menu = document.getElementById('player-ep-menu');
            const backdrop = document.getElementById('player-ep-backdrop');
            if(menu) menu.classList.remove('open');
            if(backdrop) backdrop.classList.remove('open');
            
            // Re-highlight active item
            document.querySelectorAll('.pep-item').forEach(el => {
                const n = parseInt(el.dataset.ep);
                el.classList.toggle('active', n === ep);
            });
        }

        // ── Next/Previous episode navigation (same server, same as clicking
        // an episode in the list) — rolls over into the adjacent season at
        // the season boundary. ──
        async function _getSeasonEpisodeCount(season) {
            try {
                const data = await getData(`tv/${curId}/season/${season}`);
                return (data && data.episodes) ? data.episodes.length : null;
            } catch(e) { return null; }
        }

        async function playerNextEpisode() {
            if (curType !== 'tv' || !curId) return;
            haptic(20);
            let season = curSeason || 1, ep = curEp || 1;
            const count = await _getSeasonEpisodeCount(season);
            if (count && ep < count) {
                ep = ep + 1;
            } else {
                const totalSeasons = (curDataForFav && curDataForFav.number_of_seasons) || season;
                if (season < totalSeasons) { season = season + 1; ep = 1; }
                else { return; } // already at the last episode of the last season
            }
            playerPlayEp(season, ep);
        }

        async function playerPrevEpisode() {
            if (curType !== 'tv' || !curId) return;
            haptic(20);
            let season = curSeason || 1, ep = curEp || 1;
            if (ep > 1) {
                ep = ep - 1;
            } else if (season > 1) {
                season = season - 1;
                const count = await _getSeasonEpisodeCount(season);
                ep = count || 1;
            } else {
                return; // already at S1E1
            }
            playerPlayEp(season, ep);
        }
        
        function playVid(s) {
            const idx = SERVERS.findIndex(srv => srv.key === s);
            openPlayerModal(idx >= 0 ? idx : 0);
        }
        
        // NEW: WATCH HISTORY FUNCTIONS
        function addToHistory(item) {
            // Remove if already exists
            WATCH_HISTORY = WATCH_HISTORY.filter(h => !(h.id === item.id && h.type === item.type));
            
            // Add to beginning
            WATCH_HISTORY.unshift({
                id: item.id,
                type: item.type,
                title: item.title,
                poster: item.poster,
                genreIds: item.genres ? item.genres.map(g => g.id) : [],
                rate: item.rate || null,
                date: new Date().toISOString()
            });
            
            // Keep only last 50 items
            if (WATCH_HISTORY.length > 50) {
                WATCH_HISTORY = WATCH_HISTORY.slice(0, 50);
            }
            
            localStorage.setItem('watch_history', JSON.stringify(WATCH_HISTORY));
        }
        
        function historyClassify(item) {
            var genreIds = item.genreIds || [];
            // TMDB genre ids: 99 = Documentary (movie+tv), 10764 = Reality (tv)
            if (genreIds.indexOf(99) > -1 || genreIds.indexOf(10764) > -1) return 'other';
            return item.type === 'movie' ? 'movie' : 'series';
        }
        let historyFilterType = 'all'; // 'all' | 'movie' | 'tv'
        function setHistoryFilter(f) {
            historyFilterType = f;
            loadHistory();
        }
        // Older saved entries (before poster/year/genre were tracked) get upgraded in the background
        // with real TMDB poster, release year, rating and genres — then persisted, so this only runs once per item.
        async function hydrateHistoryItem(item) {
            try {
                const d = await getData(`${item.type}/${item.id}`);
                if (!d) return false;
                if (d.poster_path) item.poster = IMG_LG + d.poster_path;
                item.year = (d.release_date || d.first_air_date || '').split('-')[0] || '';
                item.rate = d.vote_average || null;
                item.genreIds = (d.genres || []).map(g => g.id);
                return true;
            } catch (e) { return false; }
        }
        function loadHistory() {
            const c = document.getElementById('history-content');
            const t = TEXTS[LANG];
            const isFa = LANG === 'fa';
            
            if (WATCH_HISTORY.length === 0) {
                c.innerHTML = `
                    <div style="text-align:center; color:#555; margin-top:50px;">
                        <i class="fa-solid fa-history" style="font-size:60px; margin-bottom:20px;"></i>
                        <p>${t.emptyHistory}</p>
                    </div>
                `;
                return;
            }
            
            // ---- Scorecard: movies / series / other (documentary, reality, etc.) ----
            let movieCount = 0, seriesCount = 0, otherCount = 0;
            WATCH_HISTORY.forEach(item => {
                const cls = historyClassify(item);
                if (cls === 'movie') movieCount++;
                else if (cls === 'series') seriesCount++;
                else otherCount++;
            });
            
            const statLabels = isFa
                ? { movie: 'فیلم', series: 'سریال', other: 'مستند/سایر', total: 'کل تماشا', all: 'همه', tvTab: 'سریال‌ها', movieTab: 'فیلم‌ها' }
                : { movie: 'Movies', series: 'Series', other: 'Docs/Other', total: 'Total Watched', all: 'All', tvTab: 'TV Shows', movieTab: 'Movies' };
            
            let html = `
                <div style="background:linear-gradient(135deg,#1a1a1a,#141414);border:1px solid #2a2a2a;border-radius:16px;padding:16px;margin-bottom:14px;">
                    <div style="font-size:11px;color:#888;font-weight:700;margin-bottom:12px;display:flex;align-items:center;gap:6px;">
                        <i class="fa-solid fa-chart-simple" style="color:var(--primary,#E50914);"></i>${statLabels.total}: ${WATCH_HISTORY.length}
                    </div>
                    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;">
                        <div style="background:#1c1c1c;border-radius:12px;padding:12px 8px;text-align:center;">
                            <i class="fa-solid fa-film" style="color:var(--primary,#E50914);font-size:16px;"></i>
                            <div style="font-size:20px;font-weight:900;color:#fff;margin-top:6px;">${movieCount}</div>
                            <div style="font-size:10px;color:#999;margin-top:2px;font-weight:700;">${statLabels.movie}</div>
                        </div>
                        <div style="background:#1c1c1c;border-radius:12px;padding:12px 8px;text-align:center;">
                            <i class="fa-solid fa-tv" style="color:#4ade80;font-size:16px;"></i>
                            <div style="font-size:20px;font-weight:900;color:#fff;margin-top:6px;">${seriesCount}</div>
                            <div style="font-size:10px;color:#999;margin-top:2px;font-weight:700;">${statLabels.series}</div>
                        </div>
                        <div style="background:#1c1c1c;border-radius:12px;padding:12px 8px;text-align:center;">
                            <i class="fa-solid fa-clapperboard" style="color:#f5c518;font-size:16px;"></i>
                            <div style="font-size:20px;font-weight:900;color:#fff;margin-top:6px;">${otherCount}</div>
                            <div style="font-size:10px;color:#999;margin-top:2px;font-weight:700;">${statLabels.other}</div>
                        </div>
                    </div>
                </div>
                <div style="display:flex;gap:8px;margin-bottom:14px;">
                    <div onclick="setHistoryFilter('all')" style="flex:1;text-align:center;padding:9px 0;border-radius:10px;font-size:12px;font-weight:800;cursor:pointer;${historyFilterType==='all' ? 'background:var(--primary,#E50914);color:#fff;' : 'background:#1c1c1c;color:#999;'}">${statLabels.all}</div>
                    <div onclick="setHistoryFilter('movie')" style="flex:1;text-align:center;padding:9px 0;border-radius:10px;font-size:12px;font-weight:800;cursor:pointer;${historyFilterType==='movie' ? 'background:var(--primary,#E50914);color:#fff;' : 'background:#1c1c1c;color:#999;'}">${statLabels.movieTab}</div>
                    <div onclick="setHistoryFilter('tv')" style="flex:1;text-align:center;padding:9px 0;border-radius:10px;font-size:12px;font-weight:800;cursor:pointer;${historyFilterType==='tv' ? 'background:var(--primary,#E50914);color:#fff;' : 'background:#1c1c1c;color:#999;'}">${statLabels.tvTab}</div>
                </div>
                <div class="grid-container" style="padding:0;">
            `;
            
            // WATCH_HISTORY is already ordered most-recent-first (unshift on add)
            const visible = WATCH_HISTORY.filter(item => historyFilterType === 'all' || item.type === historyFilterType);
            const needsHydration = [];
            visible.forEach(item => {
                if (item.year === undefined) needsHydration.push(item);
                const rateHtml = item.rate ? `<div class="rate-badge"><i class="fa-solid fa-star"></i> ${Number(item.rate).toFixed(1)}</div>` : '';
                const yearHtml = item.year ? ` <span style="color:#888;font-weight:400;">(${item.year})</span>` : '';
                html += `
                    <div class="card" onclick="openDetail(${item.id}, '${item.type}')" style="position:relative;">
                        ${rateHtml}
                        <i class="fa-solid fa-xmark" onclick="event.stopPropagation(); removeHistoryItem(${item.id}, '${item.type}')" style="position:absolute;top:6px;left:6px;z-index:3;width:22px;height:22px;background:rgba(0,0,0,0.65);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;cursor:pointer;"></i>
                        <img src="${item.poster}" class="poster" loading="lazy" alt="${item.title}">
                        <div class="meta-title">${item.title}${yearHtml}</div>
                    </div>
                `;
            });
            
            html += `</div>`;
            if (!visible.length) {
                html += `<div style="text-align:center;color:#555;padding:40px 0;font-size:13px;">${isFa ? 'موردی در این دسته نیست' : 'Nothing in this category'}</div>`;
            }
            c.innerHTML = html;
            
            // Background-hydrate old entries (real poster/year/genres), then persist + refresh silently.
            if (needsHydration.length) {
                Promise.all(needsHydration.map(hydrateHistoryItem)).then(results => {
                    if (results.some(ok => ok)) {
                        localStorage.setItem('watch_history', JSON.stringify(WATCH_HISTORY));
                        loadHistory();
                    }
                });
            }
        }
        function removeHistoryItem(id, type) {
            WATCH_HISTORY = WATCH_HISTORY.filter(h => !(h.id === id && h.type === type));
            localStorage.setItem('watch_history', JSON.stringify(WATCH_HISTORY));
            loadHistory();
        }
        function requestClearHistory() {
            const isFa = LANG === 'fa';
            document.getElementById('clear-history-confirm-text').textContent = isFa
                ? 'آیا مطمئن هستید که می‌خواهید کل حافظه تماشا را حذف کنید؟'
                : 'Are you sure you want to delete your entire watch history?';
            document.getElementById('clear-history-confirm-no').textContent = isFa ? 'خیر' : 'No';
            document.getElementById('clear-history-confirm-yes').textContent = isFa ? 'بله' : 'Yes';
            document.getElementById('clear-history-confirm').style.display = 'flex';
        }
        function closeClearHistoryConfirm() {
            document.getElementById('clear-history-confirm').style.display = 'none';
        }
        function confirmClearHistory() {
            WATCH_HISTORY = [];
            localStorage.setItem('watch_history', JSON.stringify(WATCH_HISTORY));
            closeClearHistoryConfirm();
            loadHistory();
        }
        
        // NEW: Open country-specific content grid
        function openCountryGrid(countryCode, countryName) {
            const query = `discover/movie?with_origin_country=${countryCode}&sort_by=vote_average.desc&vote_count.gte=50`;
            openGenericGrid('movie', query, countryName);
        }
        
        // NEW: Open genre-specific content grid (random)
        function openGenreGrid(genreId, genreName) {
            const query = `discover/movie?with_genres=${genreId}&sort_by=popularity.desc`;
            openGenericGrid('movie', query, genreName);
        }
        
        // NEW: Open subject-specific content grid (random)
        function openSubjectGrid(keywords, subjectName) {
            const query = `discover/movie?with_keywords=${keywords}&sort_by=popularity.desc`;
            openGenericGrid('movie', query, subjectName);
        }
        
        // NEW: Open random country content (from sidebar)
        function openRandomCountryGrid(countryCode, countryName) {
            const query = `discover/movie?with_origin_country=${countryCode}&sort_by=popularity.desc`;
            openGenericGrid('movie', query, countryName);
        }
        
        // --- AWARDS FETCH & RENDER (OMDb API) ---
        async function fetchAndRenderAwards(imdbId, type, container) {
            if (!imdbId) return;
            try {
                // استفاده از OMDb API برای اطلاعات جوایز
                const omdbUrl = `https://www.omdbapi.com/?i=${imdbId}&apikey=trilogy`;
                const res = await fetch(PROXY + encodeURIComponent(omdbUrl));
                const data = await res.json();
                
                if (data && data.Awards && data.Awards !== 'N/A' && data.Awards !== '') {
                    const awardsText = data.Awards;
                    // Parse awards string like "Won 4 Oscars. 140 wins & 185 nominations total."
                    let badge = '';
                    
                    const oscarMatch = awardsText.match(/Won\s+(\d+)\s+Oscar/i);
                    const winsMatch = awardsText.match(/(\d+)\s+win/i);
                    const nomMatch = awardsText.match(/(\d+)\s+nomination/i);
                    const emmyMatch = awardsText.match(/(\d+)\s+Emmy/i) || awardsText.match(/Emmy/i);
                    
                    if (oscarMatch) {
                        badge += `<span class="awards-badge" title="${awardsText}">🏆 ${oscarMatch[1]} Oscar${oscarMatch[1]>1?'s':''}</span>`;
                    }
                    if (type === 'tv' && emmyMatch) {
                        const emmyCount = emmyMatch[1] || '';
                        badge += `<span class="awards-badge" title="${awardsText}">🏆 ${emmyCount ? emmyCount+' Emmy' : 'Emmy Winner'}${emmyCount>1?'s':''}</span>`;
                    }
                    if (winsMatch) {
                        const wins = parseInt(winsMatch[1]);
                        const noms = nomMatch ? parseInt(nomMatch[1]) : 0;
                        if (!oscarMatch || wins > 4) {
                            const wLabel = LANG === 'fa' ? 'جایزه' : 'wins';
                            const nLabel = LANG === 'fa' ? 'نامزدی' : 'noms.';
                            badge += `<span class="awards-badge" title="${awardsText}">🎖️ ${wins} ${wLabel}${noms ? ' · '+noms+' '+nLabel : ''}</span>`;
                        }
                    }
                    
                    if (badge) container.innerHTML += badge;
                }
            } catch(e) {
                // جوایز در دسترس نیست - سکوت
            }
        }
        
        function epDlClick(el) {
            const imdb = el.getAttribute('data-imdb');
            const season = el.getAttribute('data-season');
            const ep = el.getAttribute('data-ep');
            openVqModal(imdb, 'tv', season, ep);
        }
        
        // ===== VQ DOWNLOAD QUALITY MODAL =====
        let vqCurrentImdb = null, vqCurrentType = null, vqCurrentSeason = null, vqCurrentEp = null;
        let vqLinks = [];
        
        function openVqModal(imdbId, mediaType, season, ep) {
            vqCurrentImdb = imdbId;
            vqCurrentType = mediaType;
            vqCurrentSeason = season || null;
            vqCurrentEp = ep || null;
            
            const isFa = LANG === 'fa';
            document.getElementById('vq-title').textContent = isFa ? 'انتخاب کیفیت دانلود' : 'Choose Download Quality';
            document.getElementById('vq-subtitle').textContent = isFa ? 'در حال واکشی لینک‌های مستقیم...' : 'Fetching direct links...';
            
            const body = document.getElementById('vq-body');
            body.innerHTML = `<div style="text-align:center;padding:30px;color:#888;">
                <div style="font-size:32px;margin-bottom:12px;">⏳</div>
                <div style="font-size:14px;">${isFa ? 'در حال دریافت لینک‌ها...' : 'Fetching links...'}</div>
            </div>`;
            
            document.getElementById('vq-backdrop').style.display = 'block';
            document.getElementById('vq-modal').style.display = 'block';
            
            fetchVqLinks(imdbId, mediaType, season, ep);
        }
        
        function closeVqModal() {
            document.getElementById('vq-backdrop').style.display = 'none';
            document.getElementById('vq-modal').style.display = 'none';
        }
        
        async function fetchVqLinks(imdbId, mediaType, season, ep) {
            const isFa = LANG === 'fa';
            const body = document.getElementById('vq-body');
            
            // Construct base page URL
            let pageUrl;
            if (mediaType === 'tv' && season && ep) {
                pageUrl = `https://dl.vidsrc.vip/tv/${imdbId}/${season}/${ep}`;
            } else {
                pageUrl = `https://dl.vidsrc.vip/movie/${imdbId}`;
            }
            
            // Multiple CORS proxies to try
            const proxies = [
                url => `https://corsproxy.io/?${encodeURIComponent(url)}`,
                url => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
                url => `https://thingproxy.freeboard.io/fetch/${url}`,
                url => `https://cors-anywhere.herokuapp.com/${url}`,
                url => `https://api.codetabs.com/v1/proxy?quest=${url}`,
            ];
            
            let html = null;
            
            for (const makeProxy of proxies) {
                try {
                    const proxyUrl = makeProxy(pageUrl);
                    const resp = await fetch(proxyUrl, { signal: AbortSignal.timeout(8000) });
                    if (!resp.ok) continue;
                    const data = await resp.text();
                    // allorigins returns JSON
                    if (data.includes('"contents"')) {
                        try { html = JSON.parse(data).contents; } catch(e) { html = data; }
                    } else {
                        html = data;
                    }
                    if (html && html.length > 100) break;
                } catch(e) { continue; }
            }
            
            if (!html) {
                // Show open-in-browser fallback
                renderVqError(pageUrl);
                return;
            }
            
            // Extract .mp4 links
            const mp4Regex = /href=["'](https?:\/\/[^"']+\.mp4[^"']{0,100})["']/gi;
            const srcRegex = /src=["'](https?:\/\/[^"']+\.mp4[^"']{0,100})["']/gi;
            const plainRegex = /(https?:\/\/[^\s"'<>]+\.mp4[^\s"'<>]{0,100})/gi;
            
            const found = new Set();
            let m;
            for (const rx of [mp4Regex, srcRegex, plainRegex]) {
                while ((m = rx.exec(html)) !== null) found.add(m[1]);
            }
            
            // Also look for download links with quality labels
            const dlLinks = [];
            const linkBlockRegex = /<a[^>]*href=["']([^"']+)["'][^>]*>([^<]*(?:<[^<]*>)?[^<]*)<\/a>/gi;
            while ((m = linkBlockRegex.exec(html)) !== null) {
                const href = m[1];
                const text = m[2].replace(/<[^>]+>/g,'').trim();
                if (href.includes('.mp4') || (href.includes('dl.vidsrc') && href.length > 30)) {
                    if (!found.has(href)) { found.add(href); }
                }
            }
            
            const links = Array.from(found);
            
            if (links.length === 0) {
                renderVqError(pageUrl);
                return;
            }
            
            renderVqLinks(links, pageUrl);
        }
        
        function extractQualityLabel(url) {
            const m360 = url.match(/360/);
            const m480 = url.match(/480/);
            const m720 = url.match(/720/);
            const m1080 = url.match(/1080/);
            const m4k = url.match(/2160|4k|4K/);
            if (m4k) return '4K';
            if (m1080) return '1080p';
            if (m720) return '720p';
            if (m480) return '480p';
            if (m360) return '360p';
            return 'HD';
        }
        
        function renderVqLinks(links, pageUrl) {
            const isFa = LANG === 'fa';
            const body = document.getElementById('vq-body');
            vqLinks = [];
            document.getElementById('vq-subtitle').textContent = isFa ? `${links.length} لینک یافت شد` : `${links.length} links found`;
            
            let html = '';
            
            // Open in browser button
            html += `<a href="${pageUrl}" target="_blank" style="display:flex;align-items:center;justify-content:center;gap:8px;padding:12px;background:rgba(99,102,241,0.15);border:1px solid rgba(99,102,241,0.3);border-radius:12px;color:#818cf8;text-decoration:none;font-size:13px;font-weight:600;margin-bottom:16px;">
                <i class="fa-solid fa-arrow-up-right-from-square"></i>
                <span>${isFa ? 'باز کردن صفحه دانلود در مرورگر' : 'Open download page in browser'}</span>
            </a>`;
            
            links.forEach((url, i) => {
                const quality = extractQualityLabel(url);
                const filename = url.split('/').pop().split('?')[0] || 'video.mp4';
                const qColor = quality === '4K' ? '#f59e0b' : quality === '1080p' ? '#10b981' : quality === '720p' ? '#3b82f6' : quality === '480p' ? '#8b5cf6' : '#6b7280';
                vqLinks[i] = url;
                
                html += '<div style="background:#1a1a1a;border-radius:14px;padding:14px;margin-bottom:10px;border:1px solid #2a2a2a;">'
                      + '<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">'
                      + '<div style="background:' + qColor + ';color:#fff;padding:4px 10px;border-radius:8px;font-size:13px;font-weight:800;flex-shrink:0;">' + quality + '</div>'
                      + '<div style="font-size:11px;color:#555;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;">' + filename + '</div>'
                      + '</div>'
                      + '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;">'
                      + '<button data-qi="' + i + '" onclick="vqCopyLink(vqLinks[+this.dataset.qi], this)" style="padding:8px 4px;background:rgba(59,130,246,0.15);border:1px solid rgba(59,130,246,0.3);border-radius:10px;color:#60a5fa;font-size:11px;font-weight:600;cursor:pointer;font-family:inherit;display:flex;flex-direction:column;align-items:center;gap:4px;">'
                      + '<i class="fa-solid fa-copy" style="font-size:14px;"></i>'
                      + '<span>' + (isFa ? '\u06A9\u067E\u06CC \u0644\u06CC\u0646\u06A9' : 'Copy Link') + '</span>'
                      + '</button>'
                      + '<button data-qi="' + i + '" onclick="vqDownloadAdm(vqLinks[+this.dataset.qi], this)" style="padding:8px 4px;background:rgba(236,72,153,0.15);border:1px solid rgba(236,72,153,0.3);border-radius:10px;color:#f472b6;font-size:11px;font-weight:600;cursor:pointer;font-family:inherit;display:flex;flex-direction:column;align-items:center;gap:4px;">'
                      + '<i class="fa-solid fa-bolt" style="font-size:14px;"></i>'
                      + '<span>ADM</span>'
                      + '</button>'
                      + '<a href="' + url.replace(/"/g,'&quot;') + '" download target="_blank" style="padding:8px 4px;background:rgba(16,185,129,0.15);border:1px solid rgba(16,185,129,0.3);border-radius:10px;color:#34d399;font-size:11px;font-weight:600;cursor:pointer;font-family:inherit;display:flex;flex-direction:column;align-items:center;gap:4px;text-decoration:none;">'
                      + '<i class="fa-solid fa-download" style="font-size:14px;"></i>'
                      + '<span>' + (isFa ? '\u062F\u0627\u0646\u0644\u0648\u062F' : 'Direct') + '</span>'
                      + '</a>'
                      + '</div>'
                      + '</div>';
            });
            
            body.innerHTML = html;
  
        }
        
        function renderVqError(pageUrl) {
            const isFa = LANG === 'fa';
            const body = document.getElementById('vq-body');
            document.getElementById('vq-subtitle').textContent = isFa ? 'خطا در دریافت لینک‌ها' : 'Could not fetch links';
            body.innerHTML = `
                <a href="${pageUrl}" target="_blank" style="display:flex;align-items:center;justify-content:center;gap:8px;padding:13px;background:rgba(99,102,241,0.15);border:1px solid rgba(99,102,241,0.3);border-radius:12px;color:#818cf8;text-decoration:none;font-size:14px;font-weight:600;margin-bottom:20px;">
                    <i class="fa-solid fa-arrow-up-right-from-square"></i>
                    <span>${isFa ? 'باز کردن صفحه دانلود در مرورگر' : 'Open download page in browser'}</span>
                </a>
                <div style="text-align:center;padding:20px;">
                    <div style="font-size:40px;margin-bottom:12px;">⚠️</div>
                    <div style="color:#ef4444;font-size:14px;font-weight:700;margin-bottom:8px;">${isFa ? 'نمی‌توان لینک‌های مستقیم را استخراج کرد' : 'Cannot extract direct links'}</div>
                    <div style="color:#555;font-size:12px;">${isFa ? 'لطفاً صفحه را در مرورگر باز کنید' : 'Please open the page in browser'}</div>
                    <div style="color:#444;font-size:10px;margin-top:8px;">${isFa ? 'برخی مرورگرها به دلیل سیاست CORS اجازه دسترسی مستقیم به لینک‌ها را نمی‌دهند' : 'CORS policy may block direct link access'}</div>
                </div>`;
        }
        
        async function vqCopyLink(url, btn) {
            try {
                await navigator.clipboard.writeText(url);
            } catch(e) {
                const ta = document.createElement('textarea');
                ta.value = url;
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
            }
            const isFa = LANG === 'fa';
            const orig = btn.innerHTML;
            btn.innerHTML = `<i class="fa-solid fa-check" style="font-size:14px;color:#4ade80;"></i><span style="color:#4ade80;">${isFa ? 'کپی شد!' : 'Copied!'}</span>`;
            btn.style.background = 'rgba(74,222,128,0.15)';
            btn.style.borderColor = 'rgba(74,222,128,0.3)';
            setTimeout(() => { btn.innerHTML = orig; btn.style.background = ''; btn.style.borderColor = ''; }, 2000);
        }
        
        function vqDownloadAdm(url, btn) {
            const intentUrl = `intent:${url}#Intent;scheme=https;package=com.dv.adm;end`;
            try {
                window.location.href = intentUrl;
            } catch(e) {
                window.open('https://play.google.com/store/apps/details?id=com.dv.adm', '_blank');
            }
        }
        // ===== END VQ MODAL =====
        
        // ===== POPUP / AD BLOCKER FOR PLAYER IFRAME =====
        (function() {
            // Override window.open to block ad popups
            const _winOpen = window.open.bind(window);
            window.open = function(url, target, features) {
                // Block if player is open (likely an ad from iframe)
                const pfs = document.getElementById('player-fs');
                if(pfs && pfs.style.display !== 'none') {
                    console.log('[AdBlock] Blocked popup:', url);
                    return { focus: ()=>{}, close: ()=>{}, closed: false };
                }
                return _winOpen(url, target, features);
            };
            
            // Refocus window if it loses focus while player is open (ad popup stole focus)
            document.addEventListener('visibilitychange', function() {
                const pfs = document.getElementById('player-fs');
                if(!document.hidden) return;
                if(pfs && pfs.style.display !== 'none') {
                    setTimeout(() => { window.focus(); }, 200);
                }
            });
        })();
        
        function closePlayer() {
            const pfs = document.getElementById('player-fs');
            pfs.style.display = 'none';
            pfs.classList.remove('landscape-mode');
            pfs._fnLandscapeRequested = false;
            const _pipIcon = document.getElementById('player-pip-icon');
            if (_pipIcon) _pipIcon.className = 'fa-solid fa-window-restore';
            document.getElementById('iframe').src = '';
            const menu = document.getElementById('player-ep-menu');
            const backdrop = document.getElementById('player-ep-backdrop');
            if(menu) menu.classList.remove('open');
            if(backdrop) backdrop.classList.remove('open');
            // Cancel auto-hide timer and restore topbar + ctrl-bar
            clearTimeout(_topbarTimer);
            var _tb = document.getElementById('player-topbar');
            if (_tb) _tb.classList.remove('topbar-hidden');
            var _cb = document.getElementById('player-ctrl-bar');
            if (_cb) _cb.classList.remove('topbar-hidden');
            var _tc = document.getElementById('player-tap-catcher');
            if (_tc) _tc.classList.remove('active');
            // Close PiP if open
            if (window._pipWindow && !window._pipWindow.closed) {
                try { window._pipWindow.close(); } catch(e) {}
                window._pipWindow = null;
            }
            // Clean up mini-mode if active
            const _pfs = document.getElementById('player-fs');
            if (_pfs && _pfs.classList.contains('mini-mode')) {
                _pfs.classList.remove('mini-mode');
                _pfs.style.removeProperty('--fn-pip-left'); _pfs.style.removeProperty('--fn-pip-top');
                _pfs.style.removeProperty('--fn-pip-right'); _pfs.style.removeProperty('--fn-pip-bottom');
                _clearPiPInteraction(_pfs);
                _pfs.style.removeProperty('--fn-pip-w'); _pfs.style.removeProperty('--fn-pip-h');
            }
            try {
                if (screen.orientation && screen.orientation.unlock) screen.orientation.unlock();
                else if (window.screen.unlockOrientation) window.screen.unlockOrientation();
            } catch(e) {}
            // Exit fullscreen if active
            try {
                if (document.fullscreenElement || document.webkitFullscreenElement) {
                    if (document.exitFullscreen) document.exitFullscreen();
                    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
                }
            } catch(e) {}
        }

        // ─── PLAYER: AUTO-HIDE TOPBAR + FULLSCREEN RECOVERY ─────────────────────

        function _isPlayerOpen() {
            var pfs = document.getElementById('player-fs');
            return !!(pfs && pfs.style.display === 'flex');
        }

        var _topbarTimer = null;

        function _showTopbar() {
            var tb = document.getElementById('player-topbar');
            if (tb) tb.classList.remove('topbar-hidden');
            var cb = document.getElementById('player-ctrl-bar');
            if (cb) cb.classList.remove('topbar-hidden');
            var catcher = document.getElementById('player-tap-catcher');
            if (catcher) catcher.classList.remove('active');
        }

        function _startTopbarTimer() {
            clearTimeout(_topbarTimer);
            _topbarTimer = setTimeout(function() {
                if (_isPlayerOpen()) {
                    var tb = document.getElementById('player-topbar');
                    if (tb) tb.classList.add('topbar-hidden');
                    var cb = document.getElementById('player-ctrl-bar');
                    if (cb) cb.classList.add('topbar-hidden');
                    var catcher = document.getElementById('player-tap-catcher');
                    if (catcher) catcher.classList.add('active');
                }
            }, 5000);
        }

        function togglePlayerFullscreen() {
            if (!_isPlayerOpen()) return;
            var pfs = document.getElementById('player-fs');
            if (!document.fullscreenElement && !document.webkitFullscreenElement) {
                var req = pfs.requestFullscreen || pfs.webkitRequestFullscreen || pfs.mozRequestFullScreen;
                if (req) req.call(pfs).then(function() { _playerLandscape(); }).catch(function() {});
            } else {
                var ex = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen;
                if (ex) ex.call(document);
            }
        }

        function _clearPiPInteraction(pfs) { if (pfs && pfs._fnPiPAbort) { pfs._fnPiPAbort.abort(); pfs._fnPiPAbort=null; } }
        function _installPiPInteraction(pfs) {
            _clearPiPInteraction(pfs); const drag=pfs.querySelector('[data-fn-pip-drag]'), resize=pfs.querySelector('[data-fn-pip-resize]');
            if(!drag||!resize||!window.PointerEvent) return; const abort=new AbortController(), signal=abort.signal; pfs._fnPiPAbort=abort;
            const clamp=(v,min,max)=>Math.max(min,Math.min(v,Math.max(min,max))); let state=null;
            function begin(e,kind) { if(!pfs.classList.contains('mini-mode')||(kind==='drag'&&e.target.closest('.mpip-btn'))) return; e.preventDefault(); const r=pfs.getBoundingClientRect(); state={kind,x:e.clientX,y:e.clientY,left:r.left,top:r.top,w:r.width}; pfs.classList.toggle('fn-pip-moving',kind==='drag'); pfs.classList.toggle('fn-pip-resizing',kind==='resize'); try{e.currentTarget.setPointerCapture(e.pointerId)}catch(_){} }
            function move(e) { if(!state) return; e.preventDefault(); if(state.kind==='drag'){ const r=pfs.getBoundingClientRect(), left=clamp(state.left+e.clientX-state.x,8,window.innerWidth-r.width-8), top=clamp(state.top+e.clientY-state.y,8,window.innerHeight-r.height-8); pfs.style.setProperty('--fn-pip-left',left+'px');pfs.style.setProperty('--fn-pip-top',top+'px');pfs.style.setProperty('--fn-pip-right','auto');pfs.style.setProperty('--fn-pip-bottom','auto'); } else { const w=clamp(state.w+e.clientX-state.x,180,Math.min(520,window.innerWidth-16)), h=clamp(w*9/16,101,Math.min(Math.round(520*9/16),window.innerHeight-16)); pfs.style.setProperty('--fn-pip-w',Math.round(w)+'px');pfs.style.setProperty('--fn-pip-h',Math.round(h)+'px'); } }
            function end(){state=null;pfs.classList.remove('fn-pip-moving','fn-pip-resizing')}
            drag.addEventListener('pointerdown',e=>begin(e,'drag'),{signal}); resize.addEventListener('pointerdown',e=>begin(e,'resize'),{signal}); window.addEventListener('pointermove',move,{signal,passive:false}); window.addEventListener('pointerup',end,{signal}); window.addEventListener('pointercancel',end,{signal});
        }
        function togglePlayerPiP() {
            if(!_isPlayerOpen()) return; const iframe=document.getElementById('iframe'),pfs=document.getElementById('player-fs'); if(!iframe||!iframe.src) return; if(pfs.classList.contains('mini-mode')){restoreFromPiP();return;}
            try{if(document.fullscreenElement||document.webkitFullscreenElement)(document.exitFullscreen||document.webkitExitFullscreen).call(document)}catch(_){} try{if(screen.orientation&&screen.orientation.unlock)screen.orientation.unlock()}catch(_){} pfs.classList.remove('landscape-mode'); clearTimeout(_topbarTimer); pfs.classList.add('mini-mode'); const icon=document.getElementById('player-pip-icon');if(icon)icon.className='fa-solid fa-up-right-and-down-left-from-center'; _installPiPInteraction(pfs);
        }
        function restoreFromPiP() {
            const pfs=document.getElementById('player-fs');if(!pfs)return; _clearPiPInteraction(pfs); pfs.style.removeProperty('--fn-pip-left');pfs.style.removeProperty('--fn-pip-top');pfs.style.removeProperty('--fn-pip-right');pfs.style.removeProperty('--fn-pip-bottom');pfs.classList.remove('mini-mode','fn-pip-moving','fn-pip-resizing'); const icon=document.getElementById('player-pip-icon');if(icon)icon.className='fa-solid fa-window-restore';const req=pfs.requestFullscreen||pfs.webkitRequestFullscreen;if(req)req.call(pfs).then(()=>_playerLandscape()).catch(()=>_playerLandscape());else _playerLandscape();_showTopbar();_startTopbarTimer();
        }

        function _playerLandscape() {
            if(!_isPlayerOpen()) return; const pfs=document.getElementById('player-fs'); if(!pfs||pfs.classList.contains('mini-mode')||pfs.classList.contains('srv-vidsrcme-tv')) return;
            // Apply the visual fallback first; request device orientation once only, to prevent rotation loops.
            pfs.classList.add('landscape-mode'); if(pfs._fnLandscapeRequested) return; pfs._fnLandscapeRequested=true;
            try { if(screen.orientation&&screen.orientation.lock) screen.orientation.lock('landscape').catch(()=>{}); else if(window.screen.lockOrientation) window.screen.lockOrientation('landscape-primary'); } catch(_) {}
        }

        // Fullscreen icon + landscape lock on state change
        (function() {
            function _onFSChange() {
                if (!_isPlayerOpen()) return;
                var icon = document.getElementById('player-fs-icon');
                var isFS = !!(document.fullscreenElement || document.webkitFullscreenElement);
                if (icon) icon.className = isFS ? 'fa-solid fa-compress' : 'fa-solid fa-expand';
                if (isFS) setTimeout(_playerLandscape, 100);
            }
            document.addEventListener('fullscreenchange', _onFSChange);
            document.addEventListener('webkitfullscreenchange', _onFSChange);
            window.addEventListener('orientationchange', function() {
                if (_isPlayerOpen()) setTimeout(_playerLandscape, 250);
            });
            window.addEventListener('focus', function() {
                if (_isPlayerOpen()) _playerLandscape();
            });
            document.addEventListener('visibilitychange', function() {
                if (document.visibilityState === 'visible' && _isPlayerOpen()) _playerLandscape();
            });

            // Pointer listeners: pause timer while touching, restart on release
            var pfs = document.getElementById('player-fs');
            if (pfs) {
                pfs.addEventListener('pointerdown', function() {
                    if (!_isPlayerOpen()) return;
                    _showTopbar();
                    clearTimeout(_topbarTimer);
                }, { passive: true });
                pfs.addEventListener('pointerup', function() {
                    if (_isPlayerOpen()) _startTopbarTimer();
                }, { passive: true });
                pfs.addEventListener('pointercancel', function() {
                    if (_isPlayerOpen()) _startTopbarTimer();
                }, { passive: true });
            }

            // Tap-catcher: one tap restores topbar when hidden
            var catcher = document.getElementById('player-tap-catcher');
            if (catcher) {
                catcher.addEventListener('touchstart', function(e) {
                    e.preventDefault();
                    _showTopbar();
                    _startTopbarTimer();
                }, { passive: false });
                catcher.addEventListener('click', function() {
                    _showTopbar();
                    _startTopbarTimer();
                });
            }
        })();
        // ─────────────────────────────────────────────────────────────────────────
        
        // --- SCREENSHOTS GALLERY ---
        // =================== BACKDROPS ===================
        async function openBackdrops() {
            const modal = document.getElementById('backdrops-modal');
            const grid = document.getElementById('backdrops-grid');
            const titleEl = document.getElementById('backdrops-modal-title');
            titleEl.innerText = '🖼️ ' + curTitle + (LANG === 'fa' ? ' — تصاویر' : ' — Backdrops');
            grid.innerHTML = '<div class="ss-loading"><i class="fa-solid fa-spinner fa-spin"></i><p style="color:#888;margin-top:10px;">' + (LANG === 'fa' ? 'در حال بارگذاری...' : 'Loading...') + '</p></div>';
            modal.style.display = 'flex';
            try {
                const data = await getData(`${curType}/${curId}/images?include_image_language=en,fa,fr,de,es,it,null`);
                const backdrops = (data.backdrops || []).slice(0, 30);
                if (backdrops.length === 0) {
                    grid.innerHTML = '<div class="ss-empty"><i class="fa-solid fa-image-slash"></i><p style="color:#666;">' + (LANG === 'fa' ? 'تصویری یافت نشد' : 'No backdrops available') + '</p></div>';
                    return;
                }
                let html = '';
                backdrops.forEach(img => {
                    const url = IMG_LG + img.file_path;
                    const fullUrl = IMG_BG + img.file_path;
                    html += `<img src="${url}" class="ss-img" loading="lazy" style="aspect-ratio:16/9;" onclick="openLightbox('${fullUrl}')" onerror="if(!this.dataset.fallback){this.dataset.fallback='1';this.src='${IMG_BG + img.file_path}';}else{this.style.display='none';}">`;
                });
                grid.innerHTML = html;
            } catch(e) {
                grid.innerHTML = '<div class="ss-empty"><i class="fa-solid fa-exclamation-triangle"></i><p style="color:#666;">Error loading backdrops</p></div>';
            }
        }
        function closeBackdrops() { document.getElementById('backdrops-modal').style.display = 'none'; }

        // =================== POSTERS ===================
        async function openPosters() {
            const modal = document.getElementById('posters-modal');
            const grid = document.getElementById('posters-grid');
            const titleEl = document.getElementById('posters-modal-title');
            titleEl.innerText = '🎬 ' + curTitle + (LANG === 'fa' ? ' — پوسترها' : ' — Posters');
            grid.innerHTML = '<div class="ss-loading" style="grid-column:1/-1;"><i class="fa-solid fa-spinner fa-spin"></i><p style="color:#888;margin-top:10px;">' + (LANG === 'fa' ? 'در حال بارگذاری...' : 'Loading...') + '</p></div>';
            modal.style.display = 'flex';
            try {
                const data = await getData(`${curType}/${curId}/images?include_image_language=en,fa,null`);
                const posters = (data.posters || []).slice(0, 30);
                if (posters.length === 0) {
                    grid.innerHTML = '<div class="ss-empty" style="grid-column:1/-1;"><i class="fa-solid fa-image-slash"></i><p style="color:#666;">' + (LANG === 'fa' ? 'پوستری یافت نشد' : 'No posters available') + '</p></div>';
                    return;
                }
                let html = '';
                posters.forEach(img => {
                    const url = IMG + img.file_path;
                    const fullUrl = IMG_LG + img.file_path;
                    html += `<div onclick="openLightbox('${fullUrl}')" style="cursor:pointer;border-radius:8px;overflow:hidden;aspect-ratio:2/3;background:#111;"><img src="${url}" style="width:100%;height:100%;object-fit:cover;" loading="lazy" onerror="this.parentElement.style.display='none'"></div>`;
                });
                grid.innerHTML = html;
            } catch(e) {
                grid.innerHTML = '<div class="ss-empty" style="grid-column:1/-1;"><i class="fa-solid fa-exclamation-triangle"></i><p style="color:#666;">Error loading posters</p></div>';
            }
        }
        function closePosters() { document.getElementById('posters-modal').style.display = 'none'; }

        // =================== REVIEWS ===================
        let _reviewsCache = {};
        // =================== MULTI-SOURCE REVIEWS ===================
        var _rCache = {};
        var _curRTab = 'tmdb';

        async function openReviews() {
            var modal = document.getElementById('reviews-modal');
            var titleEl = document.getElementById('reviews-modal-title');
            if (titleEl) titleEl.innerText = curTitle || '';
            modal.style.display = 'flex';
            _reviewsCache = {};
            _rCache = {};
            _curRTab = 'tmdb';
            _rTabUI('tmdb');
            _rScoreRing();
            _rScoreIMDb();
            _rScoreLB();
            await _rLoad('tmdb');
        }

        function _rTabUI(tab) {
            var tabs = { tmdb: { bg:'#01b4e4', color:'#000' }, imdb: { bg:'#111', color:'#555' }, lb: { bg:'#111', color:'#555' } };
            tabs[tab] = tab==='tmdb' ? { bg:'#01b4e4', color:'#000' } : tab==='imdb' ? { bg:'#f5c518', color:'#000' } : { bg:'#00e054', color:'#000' };
            ['tmdb','imdb','lb'].forEach(function(t) {
                var b = document.getElementById('rtab-' + t);
                if (!b) return;
                if (t === tab) { b.style.background = tabs[t].bg; b.style.color = tabs[t].color; b.style.fontWeight='800'; }
                else { b.style.background='#111'; b.style.color='#444'; b.style.fontWeight='600'; }
            });
        }

        function _rTab(tab) {
            _curRTab = tab;
            _rTabUI(tab);
            _rLoad(tab);
        }

        function _rScoreRing() {
            var scoreEl = document.getElementById('d-rate');
            var score = parseFloat(scoreEl ? scoreEl.textContent : 0) || 0;
            var pct = Math.round(score * 10);
            var ring = document.getElementById('score-ring');
            var txt = document.getElementById('score-percent-text');
            var vEl = document.getElementById('score-vote-count');
            var vC = document.getElementById('d-count') ? document.getElementById('d-count').innerText : '';
            if (vEl) vEl.textContent = vC;
            if (txt) txt.textContent = pct + '%';
            var color = pct >= 70 ? '#21d07a' : pct >= 40 ? '#d2d531' : '#db2360';
            var circ = 131.9;
            if (ring) { ring.style.strokeDashoffset = circ - (circ * pct / 100); ring.style.stroke = color; }
        }

        async function _rScoreIMDb() {
            if (!curImdb) return;
            try {
                var proxy = 'https://corsproxy.io/?' + encodeURIComponent('https://www.imdb.com/title/' + curImdb + '/');
                var res = await fetch(proxy, { signal: AbortSignal.timeout(8000) });
                if (!res.ok) return;
                var html = await res.text();
                var m = html.match(/"aggregateRating"[^}]*"ratingValue"\s*:\s*"?([0-9.]+)"?/);
                var vm = html.match(/"ratingCount"\s*:\s*([0-9]+)/);
                if (m) {
                    var s = parseFloat(m[1]);
                    var pct = Math.round(s * 10);
                    var circ = 131.9;
                    var ring = document.getElementById('imdb-ring');
                    var txt = document.getElementById('imdb-score-txt');
                    var vEl = document.getElementById('imdb-vote-txt');
                    if (ring) ring.style.strokeDashoffset = circ - (circ * pct / 100);
                    if (txt) txt.textContent = s.toFixed(1);
                    if (vEl && vm) vEl.textContent = parseInt(vm[1]).toLocaleString();
                }
            } catch(e) {}
        }

        async function _rScoreLB() {
            if (!curTitle) return;
            try {
                var proxy = 'https://corsproxy.io/?' + encodeURIComponent('https://letterboxd.com/search/films/' + encodeURIComponent(curTitle));
                var res = await fetch(proxy, { signal: AbortSignal.timeout(8000) });
                if (!res.ok) return;
                var html = await res.text();
                var m = html.match(/data-average-rating="([0-9.]+)"/);
                var mc = html.match(/data-num-reviews="([0-9]+)"/);
                if (m) {
                    var s = parseFloat(m[1]);
                    var pct = Math.round(s * 20);
                    var circ = 131.9;
                    var ring = document.getElementById('lb-ring');
                    var txt = document.getElementById('lb-score-txt');
                    var vEl = document.getElementById('lb-vote-txt');
                    if (ring) ring.style.strokeDashoffset = circ - (circ * pct / 100);
                    if (txt) txt.textContent = s.toFixed(1);
                    if (vEl && mc) vEl.textContent = mc[1];
                }
            } catch(e) {}
        }

        async function _rLoad(tab) {
            var list = document.getElementById('reviews-list');
            if (_rCache[tab]) { _rRender(tab, _rCache[tab]); return; }
            list.innerHTML = '<div style="text-align:center;padding:40px;color:#555;"><i class="fa-solid fa-spinner fa-spin" style="font-size:22px;"></i></div>';
            try {
                if (tab === 'tmdb') {
                    var data = await getData(curType + '/' + curId + '/reviews?page=1');
                    var revs = (data && data.results) ? data.results : [];
                    _rCache['tmdb'] = revs;
                    var badge = document.getElementById('reviews-count-badge');
                    if (badge && revs.length) { badge.textContent = revs.length; badge.style.display='inline'; }
                    _rRender('tmdb', revs);
                } else if (tab === 'imdb') {
                    var imdbRevs = await _rFetchIMDb();
                    _rCache['imdb'] = imdbRevs;
                    _rRender('imdb', imdbRevs);
                } else {
                    var lbRevs = await _rFetchLB();
                    _rCache['lb'] = lbRevs;
                    _rRender('lb', lbRevs);
                }
            } catch(e) {
                list.innerHTML = '<div style="text-align:center;padding:40px;color:#555;">خطا در بارگذاری</div>';
            }
        }

        async function _rFetchIMDb() {
            var imdbUrl = curImdb ? 'https://www.imdb.com/title/' + curImdb + '/reviews/' : null;
            // Try direct scraping first
            if (curImdb) {
                try {
                    var proxy = 'https://corsproxy.io/?' + encodeURIComponent('https://www.imdb.com/title/' + curImdb + '/reviews/');
                    var res = await fetch(proxy, { signal: AbortSignal.timeout(8000) });
                    if (res.ok) {
                        var html = await res.text();
                        var doc = new DOMParser().parseFromString(html, 'text/html');
                        var items = doc.querySelectorAll('[data-testid="review-card"], .review-container');
                        var revs = [];
                        items.forEach(function(item, i) {
                            if (i >= 8) return;
                            var author = (item.querySelector('[class*="author"], .display-name-link, [data-testid="author-link"]') || {}).textContent || 'IMDb User';
                            var ratingEl = item.querySelector('[class*="rating"], .rating-other-user-rating span, [data-testid="review-rating"]');
                            var rating = ratingEl ? ratingEl.textContent.trim() : '';
                            var titleEl = item.querySelector('[class*="title"], .title, [data-testid="review-summary"]');
                            var reviewTitle = titleEl ? titleEl.textContent.trim() : '';
                            var bodyEl = item.querySelector('[class*="content"], .text, [data-testid="review-text"]');
                            var content = bodyEl ? bodyEl.textContent.trim() : '';
                            var dateEl = item.querySelector('time, .review-date, [class*="date"]');
                            var date = dateEl ? (dateEl.getAttribute('datetime') || dateEl.textContent || '').trim() : '';
                            if (content && content.length > 20) {
                                revs.push({ author: author.trim(), rating: rating ? rating+'/10':'', title: reviewTitle, content: content, date: date, _src:'imdb' });
                            }
                        });
                        if (revs.length) return revs;
                    }
                } catch(e) {}
            }
            // Fallback: AI-generated sample reviews based on title
            try {
                var prompt = 'Generate 4 realistic IMDb-style user reviews for "' + curTitle + '" (brief, varied opinions, include username, rating/10, short review text). Reply ONLY JSON array: [{"author":"username","rating":"8/10","content":"review text","date":"2024-01-15"}]';
                var aiRevs = await _callOpenAI([{role:'user',content:prompt}], 600);
                if (aiRevs) {
                    var clean = aiRevs.replace(/```json|```/g,'').trim();
                    var arr = JSON.parse(clean.substring(clean.indexOf('['), clean.lastIndexOf(']')+1));
                    if (arr && arr.length) return arr.map(function(r) { return Object.assign({_src:'imdb'}, r); });
                }
            } catch(e) {}
            return [{ _link: imdbUrl }];
        }

        async function _rFetchLB() {
            var q = encodeURIComponent(curTitle || '');
            var lbUrl = 'https://letterboxd.com/search/films/' + q;
            // Try direct scraping
            try {
                var proxy1 = 'https://corsproxy.io/?' + encodeURIComponent('https://letterboxd.com/search/films/' + q);
                var r1 = await fetch(proxy1, { signal: AbortSignal.timeout(8000) });
                if (r1.ok) {
                    var h1 = await r1.text();
                    var doc1 = new DOMParser().parseFromString(h1, 'text/html');
                    var filmLink = doc1.querySelector('a.target-best, .film-poster');
                    if (filmLink) {
                        var slug = filmLink.getAttribute('href') || filmLink.closest('a') && filmLink.closest('a').getAttribute('href');
                        if (slug) {
                            var proxy2 = 'https://corsproxy.io/?' + encodeURIComponent('https://letterboxd.com' + slug + 'reviews/by/activity/');
                            var r2 = await fetch(proxy2, { signal: AbortSignal.timeout(8000) });
                            if (r2.ok) {
                                var h2 = await r2.text();
                                var doc2 = new DOMParser().parseFromString(h2, 'text/html');
                                var items = doc2.querySelectorAll('.film-detail, .review');
                                var revs = [];
                                items.forEach(function(item, i) {
                                    if (i >= 8) return;
                                    var author = (item.querySelector('.name,.reviewer') || {}).textContent || 'LB User';
                                    var content = (item.querySelector('.body-text p,.body-text') || {}).textContent || '';
                                    var dateEl = item.querySelector('time');
                                    var date = dateEl ? (dateEl.getAttribute('datetime')||dateEl.textContent||'').trim() : '';
                                    if (date.length > 10) try { date = new Date(date).toLocaleDateString(); } catch(e) {}
                                    if (content && content.trim().length > 20) revs.push({ author: author.trim(), content: content.trim(), date: date, _src:'lb' });
                                });
                                if (revs.length) return revs;
                            }
                        }
                    }
                }
            } catch(e) {}
            // Fallback: AI-generated Letterboxd-style reviews
            try {
                var prompt2 = 'Generate 4 realistic Letterboxd-style short reviews for the film/show "' + curTitle + '" (cinephile style, some with star ratings ★). Reply ONLY JSON array: [{"author":"username","rating":"★★★★","content":"short review","date":"15 Jan 2024"}]';
                var aiRevs2 = await _callOpenAI([{role:'user',content:prompt2}], 600);
                if (aiRevs2) {
                    var clean2 = aiRevs2.replace(/```json|```/g,'').trim();
                    var arr2 = JSON.parse(clean2.substring(clean2.indexOf('['), clean2.lastIndexOf(']')+1));
                    if (arr2 && arr2.length) return arr2.map(function(r) { return Object.assign({_src:'lb'}, r); });
                }
            } catch(e) {}
            return [{ _link: lbUrl }];
        }

        function _rRender(tab, reviews) {
            var list = document.getElementById('reviews-list');
            var isIMDb = tab === 'imdb';
            var isLB = tab === 'lb';
            var accentColor = isIMDb ? '#f5c518' : isLB ? '#00e054' : '#01b4e4';
            var siteIcon = isIMDb ? '⭐' : isLB ? '🟢' : '🔵';
            var siteName = isIMDb ? 'IMDb' : isLB ? 'Letterboxd' : 'TMDB';
            var fa = LANG === 'fa';

            if (tab === 'tmdb' && (!reviews || !reviews.length)) {
                list.innerHTML = '<div style="text-align:center;padding:40px;color:#555;font-size:14px;">'
                    + (fa ? 'نظری در TMDB ثبت نشده' : 'No reviews on TMDB yet') + '</div>';
                return;
            }
            if ((isIMDb || isLB) && (!reviews || !reviews.length || (reviews[0] && reviews[0]._link !== undefined && !reviews[0].content))) {
                var link = reviews && reviews[0] ? reviews[0]._link : null;
                list.innerHTML = '<div style="text-align:center;padding:30px 16px;">'
                    + '<div style="font-size:36px;margin-bottom:10px;">' + siteIcon + '</div>'
                    + '<div style="color:#aaa;font-size:13px;margin-bottom:6px;font-weight:600;">' + siteName + '</div>'
                    + '<div style="color:#555;font-size:12px;margin-bottom:20px;line-height:1.5;">'
                    + (fa ? 'به خاطر محدودیت مرورگر، نظرات مستقیم بارگذاری نمیشن.' : 'Due to browser restrictions, reviews cannot load directly.') + '</div>'
                    + (link ? '<a href="' + link + '" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:8px;background:' + accentColor + ';color:#000;padding:11px 22px;border-radius:12px;font-size:13px;font-weight:800;text-decoration:none;">🔗 ' + (fa ? 'مشاهده در ' : 'View on ') + siteName + '</a>' : '')
                    + '</div>';
                return;
            }
            list.innerHTML = (reviews || []).filter(function(r){return r && r.content;}).map(function(rev, idx) {
                var id = tab + '_' + idx;
                var avatar = (tab === 'tmdb' && rev.author_details && rev.author_details.avatar_path)
                    ? (rev.author_details.avatar_path.startsWith('/https') ? rev.author_details.avatar_path.slice(1) : 'https://family-night-api.alirezadoe8.workers.dev/img/w45' + rev.author_details.avatar_path) : '';
                var rating = '';
                if (tab === 'tmdb' && rev.author_details && rev.author_details.rating)
                    rating = '<span style="background:' + accentColor + ';color:#000;font-size:10px;font-weight:900;padding:2px 7px;border-radius:20px;">⭐ ' + rev.author_details.rating + '/10</span>';
                else if (rev.rating)
                    rating = '<span style="background:' + accentColor + ';color:#000;font-size:10px;font-weight:900;padding:2px 7px;border-radius:20px;">' + rev.rating + '</span>';
                var rawDate = (tab === 'tmdb') ? (rev.created_at || '') : (rev.date || '');
                var dateStr = rawDate;
                try { if (rawDate && rawDate.length > 6) dateStr = new Date(rawDate).toLocaleDateString(fa?'fa-IR':'en-US',{year:'numeric',month:'short',day:'numeric'}); } catch(e) {}
                var content = rev.content || '';
                var short = content.length > 320 ? content.slice(0,320)+'...' : content;
                var hasMore = content.length > 320;
                var rTitle = rev.title ? '<div style="font-size:12px;font-weight:700;color:' + accentColor + ';margin-bottom:6px;">' + rev.title + '</div>' : '';
                var escContent = content.replace(/\\/g,'\\\\').replace(/`/g,'\\`');
                var escShort = short.replace(/\\/g,'\\\\').replace(/`/g,'\\`');
                return '<div style="background:#0d0d16;border:1px solid #1a1a24;border-radius:12px;padding:13px;margin-bottom:2px;">'
                    + '<div style="display:flex;align-items:center;gap:9px;margin-bottom:9px;">'
                    + (avatar ? '<img src="' + avatar + '" style="width:34px;height:34px;border-radius:50%;object-fit:cover;flex-shrink:0;" onerror="this.style.display=\'none\'">'
                        : '<div style="width:34px;height:34px;border-radius:50%;background:#1a1a24;display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0;">' + siteIcon + '</div>')
                    + '<div style="flex:1;min-width:0;">'
                    + '<div style="font-size:13px;font-weight:700;color:#ddd;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">' + (rev.author || 'User') + '</div>'
                    + '<div style="font-size:10px;color:#444;">' + dateStr + '</div></div>'
                    + rating + '</div>'
                    + rTitle
                    + '<div id="' + id + '_t" style="font-size:13px;color:#bbb;line-height:1.7;direction:auto;">' + short + '</div>'
                    + (hasMore ? '<button data-full=\'\' data-short=\'\' id="' + id + '_mb" onclick="_rToggle(\'' + id + '\',document.getElementById(\'' + id + '_mb\').dataset.full,document.getElementById(\'' + id + '_mb\').dataset.short)" style="background:none;border:none;color:#555;font-size:12px;cursor:pointer;padding:2px 0;font-family:inherit;text-decoration:underline;">' + (fa?'بیشتر':'Read more') + '</button>' : '')
                    + '<div style="border-top:1px solid #111;margin-top:9px;padding-top:8px;"><button onclick="_rTranslate(\'' + id + '\')" id="' + id + '_tr" style="background:rgba(1,180,228,0.08);border:1px solid rgba(1,180,228,0.2);color:#38bdf8;border-radius:16px;padding:4px 11px;font-size:11px;cursor:pointer;font-family:inherit;display:inline-flex;align-items:center;gap:4px;"><i class=\"fa-solid fa-language\"></i> ' + (fa?'ترجمه':'Translate') + '</button></div></div>';
            }).join('');
            // Set data attributes after rendering (safe way to pass full content)
            (reviews || []).filter(function(r){return r&&r.content;}).forEach(function(rev,idx) {
                var mb = document.getElementById(tab+'_'+idx+'_mb');
                if (mb) { mb.dataset.full = rev.content; mb.dataset.short = rev.content.length>320?rev.content.slice(0,320)+'...':rev.content; }
            });
        }

        function _rToggle(id, full, short) {
            var el = document.getElementById(id+'_t');
            var btn = document.getElementById(id+'_mb');
            if (!el || !btn) return;
            if (btn.dataset.x === '1') { el.innerText = short; btn.textContent = LANG==='fa'?'بیشتر':'Read more'; btn.dataset.x='0'; }
            else { el.innerText = full; btn.textContent = LANG==='fa'?'کمتر':'Show less'; btn.dataset.x='1'; }
        }

        async function _rTranslate(id) {
            var el = document.getElementById(id+'_t');
            var btn = document.getElementById(id+'_tr');
            if (!el || !btn) return;
            if (btn.dataset.s === 'fa') { el.innerText = btn.dataset.orig; btn.innerHTML = '<i class="fa-solid fa-language"></i> '+(LANG==='fa'?'ترجمه':'Translate'); btn.dataset.s=''; return; }
            if (btn.dataset.fa) { el.innerText = btn.dataset.fa; btn.innerHTML = '<i class="fa-solid fa-rotate-left"></i> '+(LANG==='fa'?'اصلی':'Original'); btn.dataset.s='fa'; return; }
            btn.dataset.orig = el.innerText;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
            btn.disabled = true;
            try {
                var resp = await fetch('https://api.mymemory.translated.net/get?q=' + encodeURIComponent(el.innerText.slice(0,500)) + '&langpair=en|fa');
                var data = await resp.json();
                if (data && data.responseData && data.responseData.translatedText) {
                    btn.dataset.fa = data.responseData.translatedText;
                    el.innerText = data.responseData.translatedText;
                    btn.innerHTML = '<i class="fa-solid fa-rotate-left"></i> '+(LANG==='fa'?'اصلی':'Original');
                    btn.dataset.s = 'fa';
                } else throw new Error();
            } catch(e) {
                btn.innerHTML = '<i class="fa-solid fa-language"></i> '+(LANG==='fa'?'ترجمه':'Translate');
            }
            btn.disabled = false;
        }

        function closeReviews() {
            document.getElementById('reviews-modal').style.display = 'none';
            _rCache = {};
        }



        // =================== SOUNDTRACKS FEATURE v7 (Static + Smart Lookup) ===================
        // Large hardcoded database + smart fallback prompt with known data
        var _ST_DB = {
            // Key: lowercase title
            "the dark knight": [{num:1,name:"Why So Serious?",artist:"Hans Zimmer & James Newton Howard"},{num:2,name:"I'm Not a Hero",artist:"Hans Zimmer & James Newton Howard"},{num:3,name:"Harvey Two-Face",artist:"Hans Zimmer & James Newton Howard"},{num:4,name:"Attack on the Convoy",artist:"Hans Zimmer & James Newton Howard"},{num:5,name:"Like a Dog Chasing Cars",artist:"Hans Zimmer & James Newton Howard"},{num:6,name:"A Watchful Guardian",artist:"Hans Zimmer & James Newton Howard"},{num:7,name:"Agent of Chaos",artist:"Hans Zimmer & James Newton Howard"},{num:8,name:"Introduce a Little Anarchy",artist:"Hans Zimmer & James Newton Howard"},{num:9,name:"Watch the World Burn",artist:"Hans Zimmer & James Newton Howard"},{num:10,name:"A Dark Knight",artist:"Hans Zimmer & James Newton Howard"}],
            "inception": [{num:1,name:"Half Remembered Dream",artist:"Hans Zimmer"},{num:2,name:"We Built Our Own World",artist:"Hans Zimmer"},{num:3,name:"Dream is Collapsing",artist:"Hans Zimmer"},{num:4,name:"Radical Notion",artist:"Hans Zimmer"},{num:5,name:"Old Souls",artist:"Hans Zimmer"},{num:6,name:"Dream Within a Dream",artist:"Hans Zimmer"},{num:7,name:"Waiting for a Train",artist:"Hans Zimmer"},{num:8,name:"Mombasa",artist:"Hans Zimmer"},{num:9,name:"One Simple Idea",artist:"Hans Zimmer"},{num:10,name:"Time",artist:"Hans Zimmer"},{num:11,name:"Non, je ne regrette rien",artist:"Edith Piaf"}],
            "interstellar": [{num:1,name:"Cornfield Chase",artist:"Hans Zimmer"},{num:2,name:"Dust",artist:"Hans Zimmer"},{num:3,name:"Day One",artist:"Hans Zimmer"},{num:4,name:"Stay",artist:"Hans Zimmer"},{num:5,name:"Message from Home",artist:"Hans Zimmer"},{num:6,name:"Detach",artist:"Hans Zimmer"},{num:7,name:"No Time for Caution",artist:"Hans Zimmer"},{num:8,name:"What Happens Now?",artist:"Hans Zimmer"},{num:9,name:"Do Not Go Gentle into That Good Night",artist:"Hans Zimmer"},{num:10,name:"Coward",artist:"Hans Zimmer"},{num:11,name:"Murph",artist:"Hans Zimmer"},{num:12,name:"Imperfect Lock",artist:"Hans Zimmer"},{num:13,name:"Where We're Going",artist:"Hans Zimmer"}],
            "the pianist": [{num:1,name:"Nocturne in C# minor, Op. posth",artist:"Frederic Chopin (performed by Janusz Olejniczak)"},{num:2,name:"Nocturne in E minor, Op. 72",artist:"Frederic Chopin"},{num:3,name:"Ballade No. 1 in G minor, Op. 23",artist:"Frederic Chopin"},{num:4,name:"Mazurka in A minor, Op. 17/4",artist:"Frederic Chopin"},{num:5,name:"Prelude in A major, Op. 28/7",artist:"Frederic Chopin"},{num:6,name:"Waltz in B minor, Op. 69/2",artist:"Frederic Chopin"},{num:7,name:"Scherzo No. 2 in B-flat minor, Op. 31",artist:"Frederic Chopin"},{num:8,name:"Andante spianato & Grande Polonaise",artist:"Frederic Chopin"},{num:9,name:"Piano Concerto in E minor",artist:"Frederic Chopin (performed by Janusz Olejniczak)"},{num:10,name:"Grand Fantasia in E major",artist:"Frederic Chopin"}],
            "breaking bad": [{num:1,name:"Breaking Bad Main Title Theme",artist:"Dave Porter"},{num:2,name:"Fly",artist:"Dave Porter"},{num:3,name:"Baby Blue",artist:"Badfinger"},{num:4,name:"Crystal Blue Persuasion",artist:"Tommy James & the Shondells"},{num:5,name:"Good",artist:"Better Than Ezra"},{num:6,name:"DLZ",artist:"TV on the Radio"},{num:7,name:"Black",artist:"Danger Mouse & Daniele Luppi ft. Norah Jones"},{num:8,name:"A Good Man",artist:"Dave Porter"},{num:9,name:"Goodbye",artist:"Dave Porter"},{num:10,name:"Felina End",artist:"Dave Porter"}],
            "game of thrones": [{num:1,name:"Main Title",artist:"Ramin Djawadi"},{num:2,name:"The Rains of Castamere",artist:"Sigur Ros"},{num:3,name:"Light of the Seven",artist:"Ramin Djawadi"},{num:4,name:"Goodbye Brother",artist:"Ramin Djawadi"},{num:5,name:"The Children",artist:"Ramin Djawadi"},{num:6,name:"Fire & Blood",artist:"Ramin Djawadi"},{num:7,name:"Chaos Is a Ladder",artist:"Ramin Djawadi"},{num:8,name:"Winds of Winter",artist:"Ramin Djawadi"},{num:9,name:"Jenny of Oldstones",artist:"Florence + The Machine"},{num:10,name:"The Night King",artist:"Ramin Djawadi"}],
            "oppenheimer": [{num:1,name:"Can You Hear the Music",artist:"Ludwig Goransson"},{num:2,name:"Fission",artist:"Ludwig Goransson"},{num:3,name:"Quantum Mechanics",artist:"Ludwig Goransson"},{num:4,name:"Destroyer of Worlds",artist:"Ludwig Goransson"},{num:5,name:"Fusion",artist:"Ludwig Goransson"},{num:6,name:"Am I a Good Man",artist:"Ludwig Goransson"},{num:7,name:"Manhattan Project",artist:"Ludwig Goransson"},{num:8,name:"Theorist",artist:"Ludwig Goransson"},{num:9,name:"Trinity",artist:"Ludwig Goransson"},{num:10,name:"Florence",artist:"Ludwig Goransson"},{num:11,name:"Gravity of Proof",artist:"Ludwig Goransson"},{num:12,name:"See You at the Party",artist:"Ludwig Goransson"}],
            "harry potter and the sorcerer's stone": [{num:1,name:"Hedwig's Theme",artist:"John Williams"},{num:2,name:"Harry's Wondrous World",artist:"John Williams"},{num:3,name:"The Arrival of Baby Harry",artist:"John Williams"},{num:4,name:"Visit to the Zoo",artist:"John Williams"},{num:5,name:"Diagon Alley",artist:"John Williams"},{num:6,name:"Platform Nine and Three Quarters",artist:"John Williams"},{num:7,name:"Hogwarts Forever",artist:"John Williams"},{num:8,name:"The Chess Game",artist:"John Williams"},{num:9,name:"Voldemort",artist:"John Williams"},{num:10,name:"Nimbus 2000",artist:"John Williams"}],
            "harry potter and the half-blood prince": [{num:1,name:"Opening",artist:"Nicholas Hooper"},{num:2,name:"In Noctem",artist:"Nicholas Hooper"},{num:3,name:"Snape & The Unbreakable Vow",artist:"Nicholas Hooper"},{num:4,name:"Wizard Wheezes",artist:"Nicholas Hooper"},{num:5,name:"Dumbledore's Speech",artist:"Nicholas Hooper"},{num:6,name:"Into the Pensieve",artist:"Nicholas Hooper"},{num:7,name:"The Slug Club",artist:"Nicholas Hooper"},{num:8,name:"Of Quidditch & Hormones",artist:"Nicholas Hooper"},{num:9,name:"Farewell Dumbledore",artist:"Nicholas Hooper"},{num:10,name:"When Ginny Kissed Harry",artist:"Nicholas Hooper"}],
            "the godfather": [{num:1,name:"The Godfather Waltz",artist:"Nino Rota"},{num:2,name:"I Have But One Heart",artist:"Al Martino"},{num:3,name:"The Pickup",artist:"Nino Rota"},{num:4,name:"Connie's Wedding",artist:"Nino Rota"},{num:5,name:"The Halls of Fear",artist:"Nino Rota"},{num:6,name:"Sicilian Pastorale",artist:"Nino Rota"},{num:7,name:"Love Theme from The Godfather",artist:"Nino Rota"},{num:8,name:"Michael Corleone",artist:"Nino Rota"},{num:9,name:"The New Godfather",artist:"Nino Rota"}],
            "pulp fiction": [{num:1,name:"Misirlou",artist:"Dick Dale & the Del-Tones"},{num:2,name:"Royale with Cheese",artist:"Kool & the Gang"},{num:3,name:"Girl, You'll Be a Woman Soon",artist:"Urge Overkill"},{num:4,name:"Son of a Preacher Man",artist:"Dusty Springfield"},{num:5,name:"Jungle Boogie",artist:"Kool & the Gang"},{num:6,name:"Let's Stay Together",artist:"Al Green"},{num:7,name:"Bullwinkle Pt. II",artist:"The Centurions"},{num:8,name:"If I Love You",artist:"Chuck Berry"},{num:9,name:"Flowers on the Wall",artist:"Statler Brothers"},{num:10,name:"Comanche",artist:"The Revels"}],
            "schindler's list": [{num:1,name:"Theme from Schindler's List",artist:"Itzhak Perlman (violin) — John Williams"},{num:2,name:"Jewish Town",artist:"John Williams"},{num:3,name:"Auschwitz-Birkenau",artist:"John Williams"},{num:4,name:"Remembrances",artist:"John Williams"},{num:5,name:"Making the List",artist:"John Williams"},{num:6,name:"Schindler's Workforce",artist:"John Williams"},{num:7,name:"Rainy Day",artist:"John Williams"},{num:8,name:"I Could Have Done More",artist:"John Williams"},{num:9,name:"Jerusalem",artist:"John Williams"}],
            "forrest gump": [{num:1,name:"Hound Dog",artist:"Elvis Presley"},{num:2,name:"Rebel Rouser",artist:"Duane Eddy"},{num:3,name:"California Dreamin",artist:"The Mamas & the Papas"},{num:4,name:"Everybody's Talkin'",artist:"Harry Nilsson"},{num:5,name:"Go All the Way",artist:"The Raspberries"},{num:6,name:"Sweet Home Alabama",artist:"Lynyrd Skynyrd"},{num:7,name:"Against the Wind",artist:"Bob Seger"},{num:8,name:"Fortunate Son",artist:"Creedence Clearwater Revival"},{num:9,name:"For What It's Worth",artist:"Buffalo Springfield"},{num:10,name:"Running on Empty",artist:"Jackson Browne"},{num:11,name:"Go Your Own Way",artist:"Fleetwood Mac"},{num:12,name:"Let's Get It On",artist:"Marvin Gaye"},{num:13,name:"Feelin' Alright",artist:"Joe Cocker"},{num:14,name:"Blowin' in the Wind",artist:"Bob Dylan"}],
            "the shawshank redemption": [{num:1,name:"End Titles",artist:"Thomas Newman"},{num:2,name:"Brooks Was Here",artist:"Thomas Newman"},{num:3,name:"So Was Red",artist:"Thomas Newman"},{num:4,name:"The Marriage of Figaro – Canzonetta Sull'aria",artist:"Mozart"},{num:5,name:"Shawshank Prison",artist:"Thomas Newman"},{num:6,name:"New Fish",artist:"Thomas Newman"},{num:7,name:"The Sisters",artist:"Thomas Newman"},{num:8,name:"Andy Dufresne",artist:"Thomas Newman"},{num:9,name:"Befriended",artist:"Thomas Newman"},{num:10,name:"Rocky Escape",artist:"Thomas Newman"},{num:11,name:"Zihuatanejo",artist:"Thomas Newman"}],
            "fight club": [{num:1,name:"Who Is Tyler Durden?",artist:"The Dust Brothers"},{num:2,name:"Medula Oblongata",artist:"The Dust Brothers"},{num:3,name:"Flashback",artist:"The Dust Brothers"},{num:4,name:"This Is Your Life",artist:"The Dust Brothers"},{num:5,name:"Space Monkeys",artist:"The Dust Brothers"},{num:6,name:"Psycho Boy Jack",artist:"The Dust Brothers"},{num:7,name:"Homework",artist:"The Dust Brothers"},{num:8,name:"What's Up Flowers?",artist:"The Dust Brothers"},{num:9,name:"The Narrator Runs",artist:"The Dust Brothers"},{num:10,name:"Finding the Right Therapist",artist:"The Dust Brothers"},{num:11,name:"Where Is My Mind?",artist:"Pixies"}],
            "gladiator": [{num:1,name:"Progeny",artist:"Hans Zimmer & Lisa Gerrard"},{num:2,name:"The Wheat",artist:"Hans Zimmer & Lisa Gerrard"},{num:3,name:"The Battle",artist:"Hans Zimmer & Lisa Gerrard"},{num:4,name:"Earth",artist:"Hans Zimmer & Lisa Gerrard"},{num:5,name:"Sorrow",artist:"Hans Zimmer & Lisa Gerrard"},{num:6,name:"Now We Are Free",artist:"Lisa Gerrard & Hans Zimmer"},{num:7,name:"Slaves to Rome",artist:"Hans Zimmer"},{num:8,name:"Barbarian Horde",artist:"Hans Zimmer & Lisa Gerrard"},{num:9,name:"Am I Not Merciful?",artist:"Hans Zimmer & Lisa Gerrard"},{num:10,name:"Elysium",artist:"Hans Zimmer & Lisa Gerrard"}],
            "la la land": [{num:1,name:"Another Day of Sun",artist:"La La Land Cast"},{num:2,name:"Someone in the Crowd",artist:"Emma Stone"},{num:3,name:"Mia & Sebastian's Theme",artist:"Justin Hurwitz"},{num:4,name:"A Lovely Night",artist:"Ryan Gosling & Emma Stone"},{num:5,name:"Herman's Habit",artist:"Justin Hurwitz"},{num:6,name:"Start a Fire",artist:"John Legend"},{num:7,name:"Engagement Party",artist:"Justin Hurwitz"},{num:8,name:"City of Stars",artist:"Ryan Gosling & Emma Stone"},{num:9,name:"Planetarium",artist:"Justin Hurwitz"},{num:10,name:"Epilogue",artist:"Justin Hurwitz"}],
            "parasite": [{num:1,name:"The Belt of Faith",artist:"Jung Jae-il"},{num:2,name:"Concurrence",artist:"Jung Jae-il"},{num:3,name:"Serenade in G major K.525",artist:"Wolfgang Amadeus Mozart"},{num:4,name:"Plan",artist:"Jung Jae-il"},{num:5,name:"Moving In",artist:"Jung Jae-il"},{num:6,name:"Montage",artist:"Jung Jae-il"},{num:7,name:"Act of Goodwill",artist:"Jung Jae-il"},{num:8,name:"Kitchen Scene",artist:"Jung Jae-il"},{num:9,name:"Memories of the Icy Planet",artist:"Jung Jae-il"},{num:10,name:"Jessica, Only Child",artist:"Jung Jae-il"}],
            "joker": [{num:1,name:"Clown",artist:"Hildur Guonadottir"},{num:2,name:"Defeated Clown",artist:"Hildur Guonadottir"},{num:3,name:"Bathrooms",artist:"Hildur Guonadottir"},{num:4,name:"Failed Stand Up",artist:"Hildur Guonadottir"},{num:5,name:"Subway",artist:"Hildur Guonadottir"},{num:6,name:"Broken and Beaten",artist:"Hildur Guonadottir"},{num:7,name:"Carnival Barker",artist:"Hildur Guonadottir"},{num:8,name:"That's Life",artist:"Frank Sinatra"},{num:9,name:"Send In the Clowns",artist:"Hildur Guonadottir"},{num:10,name:"Laughing on the Outside",artist:"Jimmy Durante"}],
            "avatar": [{num:1,name:"You Don't Dream in Cryo",artist:"James Horner"},{num:2,name:"Pure Spirits of the Forest",artist:"James Horner"},{num:3,name:"The Bioluminescence of the Night",artist:"James Horner"},{num:4,name:"Becoming One of 'The People'",artist:"James Horner"},{num:5,name:"Climbing Up 'Iknimaya'",artist:"James Horner"},{num:6,name:"Scorched Earth",artist:"James Horner"},{num:7,name:"Gathering of All the Clans",artist:"James Horner"},{num:8,name:"War",artist:"James Horner"},{num:9,name:"I See You (Theme from Avatar)",artist:"Leona Lewis"},{num:10,name:"Jake's First Flight",artist:"James Horner"}],
            "stranger things": [{num:1,name:"Stranger Things Main Theme",artist:"Kyle Dixon & Michael Stein"},{num:2,name:"Kids",artist:"Kyle Dixon & Michael Stein"},{num:3,name:"Running Up That Hill",artist:"Kate Bush"},{num:4,name:"Master of Puppets",artist:"Metallica"},{num:5,name:"Should I Stay or Should I Go",artist:"The Clash"},{num:6,name:"Every Breath You Take",artist:"The Police"},{num:7,name:"Separate Ways (Worlds Apart)",artist:"Journey"},{num:8,name:"Heroes",artist:"Peter Gabriel"},{num:9,name:"Whip It",artist:"Devo"},{num:10,name:"Thriller",artist:"Michael Jackson"}],
            "the lord of the rings: the fellowship of the ring": [{num:1,name:"The Prophecy",artist:"Howard Shore"},{num:2,name:"Concerning Hobbits",artist:"Howard Shore"},{num:3,name:"The Shadow of the Past",artist:"Howard Shore"},{num:4,name:"Saruman the White",artist:"Howard Shore"},{num:5,name:"Flight to the Ford",artist:"Howard Shore"},{num:6,name:"Many Meetings",artist:"Howard Shore"},{num:7,name:"The Council of Elrond",artist:"Howard Shore"},{num:8,name:"Lothlórien",artist:"Howard Shore"},{num:9,name:"In Dreams",artist:"Edward Ross"},{num:10,name:"The Breaking of the Fellowship",artist:"Howard Shore"}],
            "titanic": [{num:1,name:"My Heart Will Go On",artist:"Celine Dion"},{num:2,name:"Never An Absolution",artist:"James Horner"},{num:3,name:"Southampton",artist:"James Horner"},{num:4,name:"Rose",artist:"James Horner"},{num:5,name:"An Ocean of Memories",artist:"James Horner"},{num:6,name:"Leaving Port",artist:"James Horner"},{num:7,name:"Take Her to Sea",artist:"James Horner"},{num:8,name:"Hard to Starboard",artist:"James Horner"},{num:9,name:"Death of Titanic",artist:"James Horner"},{num:10,name:"A Promise Kept",artist:"James Horner"}],
            "batman v superman: dawn of justice": [{num:1,name:"Beautiful Lie",artist:"Hans Zimmer & Junkie XL"},{num:2,name:"Their War Here",artist:"Hans Zimmer & Junkie XL"},{num:3,name:"Is She With You?",artist:"Hans Zimmer & Junkie XL"},{num:4,name:"Do You Bleed?",artist:"Hans Zimmer & Junkie XL"},{num:5,name:"Batman v Superman",artist:"Hans Zimmer & Junkie XL"},{num:6,name:"The Red Capes are Coming",artist:"Hans Zimmer & Junkie XL"},{num:7,name:"Day of the Dead",artist:"Hans Zimmer & Junkie XL"},{num:8,name:"Gods Are Mortal",artist:"Hans Zimmer & Junkie XL"},{num:9,name:"This is My World",artist:"Hans Zimmer & Junkie XL"},{num:10,name:"Men Are Still Good",artist:"Hans Zimmer & Junkie XL"}],
            "blade runner 2049": [{num:1,name:"2049",artist:"Hans Zimmer & Benjamin Wallfisch"},{num:2,name:"Memory",artist:"Hans Zimmer & Benjamin Wallfisch"},{num:3,name:"Joi",artist:"Hans Zimmer & Benjamin Wallfisch"},{num:4,name:"Flight to Los Angeles",artist:"Hans Zimmer & Benjamin Wallfisch"},{num:5,name:"Tears in Rain",artist:"Vangelis"},{num:6,name:"Wallace",artist:"Hans Zimmer & Benjamin Wallfisch"},{num:7,name:"Someone Lived This",artist:"Hans Zimmer & Benjamin Wallfisch"},{num:8,name:"Orphan",artist:"Hans Zimmer & Benjamin Wallfisch"},{num:9,name:"All the Best Memories Are Hers",artist:"Hans Zimmer & Benjamin Wallfisch"},{num:10,name:"Pilot",artist:"Hans Zimmer & Benjamin Wallfisch"}],
            "dune": [{num:1,name:"Herald of the Change",artist:"Hans Zimmer"},{num:2,name:"Dream of Arrakeen",artist:"Hans Zimmer"},{num:3,name:"Leaving Caladan",artist:"Hans Zimmer"},{num:4,name:"Arrakeen",artist:"Hans Zimmer"},{num:5,name:"Ripples in the Sand",artist:"Hans Zimmer"},{num:6,name:"Bene Gesserit",artist:"Hans Zimmer"},{num:7,name:"The Shortening of the Way",artist:"Hans Zimmer"},{num:8,name:"Night on Arrakis",artist:"Hans Zimmer"},{num:9,name:"Paul's Dream",artist:"Hans Zimmer"},{num:10,name:"Visions",artist:"Hans Zimmer"},{num:11,name:"Stillsuits",artist:"Hans Zimmer"},{num:12,name:"My Road Leads Into the Desert",artist:"Hans Zimmer"},{num:13,name:"Burning Sands",artist:"Hans Zimmer"},{num:14,name:"The Sietch",artist:"Hans Zimmer"}],
            "home": [{num:1,name:"همنت",artist:"محسن چاوشی"},{num:2,name:"باد",artist:"محسن چاوشی"},{num:3,name:"جادوگر",artist:"محسن چاوشی"},{num:4,name:"موسیقی متن فیلم",artist:"محمد رضا علیقلی"}],
            "a separation": [{num:1,name:"موسیقی متن جدایی",artist:"Sattar Oraki"}],
            "the bear": [{num:1,name:"Experience",artist:"Ludovico Einaudi"},{num:2,name:"Sycamore",artist:"Alvo Pärt"},{num:3,name:"Running with the Wolves",artist:"Aurora"},{num:4,name:"Falling",artist:"Harry Styles"},{num:5,name:"Papaoutai",artist:"Stromae"},{num:6,name:"Never Tear Us Apart",artist:"INXS"},{num:7,name:"In My Life",artist:"The Beatles"},{num:8,name:"Love You to Death",artist:"Type O Negative"},{num:9,name:"Five Years",artist:"David Bowie"},{num:10,name:"Bravado",artist:"Lorde"}],
            "succession": [{num:1,name:"Main Title Theme",artist:"Nicholas Britell"},{num:2,name:"Tern Haven",artist:"Nicholas Britell"},{num:3,name:"Retiring",artist:"Nicholas Britell"},{num:4,name:"Sad Sack Wasp Trap",artist:"Nicholas Britell"},{num:5,name:"Mass in B minor",artist:"Johann Sebastian Bach"},{num:6,name:"Con te partirò",artist:"Andrea Bocelli"},{num:7,name:"Gilded Cage",artist:"Nicholas Britell"}],
            "goodfellas": [{num:1,name:"Rags to Riches",artist:"Tony Bennett"},{num:2,name:"Mouths to Feed",artist:"Muddy Waters"},{num:3,name:"Sunshine of Your Love",artist:"Cream"},{num:4,name:"Atlantis",artist:"Donovan"},{num:5,name:"Gimme Shelter",artist:"The Rolling Stones"},{num:6,name:"Layla",artist:"Derek and the Dominos"},{num:7,name:"Jump into the Fire",artist:"Harry Nilsson"},{num:8,name:"Memo from Turner",artist:"Mick Jagger"},{num:9,name:"Mannish Boy",artist:"Muddy Waters"},{num:10,name:"My Way",artist:"Sid Vicious"}]
        };

        function stLookup(title) {
            var key = (title || '').toLowerCase().trim();
            // Direct match
            if (_ST_DB[key]) return _ST_DB[key];
            // Partial match
            for (var k in _ST_DB) {
                if (key.includes(k) || k.includes(key)) return _ST_DB[k];
            }
            return null;
        }

        // YouTube player state for soundtracks
        var stYTPlayer = null;
        var stYTCurrentIdx = 0;
        var stYTVideos = [];
        var stYTPlaylistId = null;

        async function openSoundtracks() {
            var modal = document.getElementById('soundtracks-modal');
            var contentEl = document.getElementById('st-content');
            var bgEl = document.getElementById('st-bg');
            var titleEl = document.getElementById('st-modal-title');
            var isFA = LANG === 'fa';
            var miniPlayer = document.getElementById('st-mini-player');
            var ytEmbed = document.getElementById('st-yt-embed');

            var posterSrc = document.getElementById('d-img') ? document.getElementById('d-img').src : '';
            if (posterSrc) bgEl.style.backgroundImage = 'url(' + posterSrc + ')';
            titleEl.textContent = (isFA ? '🎵 موسیقی متن: ' : '🎵 Soundtracks: ') + (curTitle || '');
            modal.classList.add('open');
            history.pushState({ page: 'soundtracks' }, '', '');

            // Reset player
            if (ytEmbed) ytEmbed.style.display = 'none';
            if (miniPlayer) miniPlayer.style.display = 'none';
            stYTVideos = [];
            stYTCurrentIdx = 0;

            contentEl.innerHTML = '<div class="st-loading"><i class="fa-solid fa-compact-disc fa-spin" style="font-size:32px;color:#a855f7;"></i>'
                + '<p style="color:#a855f7;margin-top:14px;">' + (isFA ? 'در حال جستجوی موسیقی متن...' : 'Searching soundtracks...') + '</p></div>';

            var year = curDataForFav ? ((curDataForFav.release_date || curDataForFav.first_air_date || '').split('-')[0]) : '';
            var originalTitle = curDataForFav ? (curDataForFav.original_title || curDataForFav.original_name || curTitle || '') : (curTitle || '');
            
            // Search YouTube for official soundtrack playlist
            var ytVideos = await fetchYTSoundtrackVideos(curTitle || '', originalTitle, year);

            if (!ytVideos || ytVideos.length === 0) {
                var searchQ = encodeURIComponent((curTitle || '') + ' official soundtrack');
                contentEl.innerHTML = '<div style="text-align:center;padding:60px 20px;position:relative;z-index:2;">'
                    + '<div style="font-size:52px;margin-bottom:14px;">🎵</div>'
                    + '<div style="color:#777;font-size:14px;margin-bottom:16px;">' + (isFA ? 'موسیقی متن یافت نشد.' : 'No soundtrack found.') + '</div>'
                    + '<a href="https://www.youtube.com/results?search_query=' + searchQ + '" target="_blank" style="display:inline-flex;align-items:center;gap:8px;padding:10px 18px;background:rgba(255,0,0,0.15);border:1px solid rgba(255,0,0,0.3);border-radius:20px;color:#ff6666;font-size:13px;text-decoration:none;">'
                    + '<svg viewBox="0 0 20 14" width="16" height="11" fill="currentColor"><path d="M19.6 2.2C19.4 1.4 18.8.8 18 .6 16.4.2 10 .2 10 .2S3.6.2 2 .6C1.2.8.6 1.4.4 2.2.1 3.8 0 7 0 7s.1 3.2.4 4.8c.2.8.8 1.4 1.6 1.6C3.6 13.8 10 13.8 10 13.8s6.4 0 8-.4c.8-.2 1.4-.8 1.6-1.6.3-1.6.4-4.8.4-4.8s-.1-3.2-.4-4.8zM8 10V4l5.3 3L8 10z"/></svg>'
                    + (isFA ? 'جستجو در یوتیوب' : 'Search on YouTube') + '</a>'
                    + '</div>';
                return;
            }
            
            stYTVideos = ytVideos;
            renderYTSoundtrackList(ytVideos, isFA);
        }

        async function fetchYTSoundtrackVideos(title, originalTitle, year) {
            // Try multiple search queries to find best results
            var queries = [
                title + ' ' + year + ' official soundtrack',
                title + ' original motion picture soundtrack',
                originalTitle + ' ' + year + ' soundtrack',
                title + ' full soundtrack album',
            ];
            
            for (var qi = 0; qi < queries.length; qi++) {
                try {
                    var url = 'https://www.googleapis.com/youtube/v3/search?part=snippet&q=' + encodeURIComponent(queries[qi]) + '&type=video&maxResults=15&videoCategoryId=10&key=' + YT_API_KEY;
                    var r = await fetch(url);
                    if (!r.ok) continue;
                    var data = await r.json();
                    if (data && data.items && data.items.length > 0) {
                        // Filter to get most relevant - prioritize official soundtrack videos
                        var vids = data.items.map(function(item) {
                            return {
                                videoId: item.id.videoId,
                                title: item.snippet.title,
                                channel: item.snippet.channelTitle,
                                thumbnail: (item.snippet.thumbnails.medium || item.snippet.thumbnails.default || {}).url || '',
                                publishedAt: item.snippet.publishedAt
                            };
                        });
                        // Filter out unrelated
                        var titleLower = title.toLowerCase();
                        var filtered = vids.filter(function(v) {
                            var vtl = v.title.toLowerCase();
                            return vtl.includes('soundtrack') || vtl.includes('ost') || vtl.includes('score') || vtl.includes('theme') || vtl.includes('music');
                        });
                        if (filtered.length >= 3) return filtered;
                        if (vids.length >= 3) return vids.slice(0, 10);
                    }
                } catch(e) {}
            }
            return null;
        }

        function renderYTSoundtrackList(videos, isFA) {
            var contentEl = document.getElementById('st-content');
            var miniPlayer = document.getElementById('st-mini-player');
            
            var html = '<div style="position:relative;z-index:2;padding-bottom:10px;">';
            html += '<div style="font-size:11px;color:rgba(255,255,255,0.35);text-align:center;padding:8px 0 14px;">'
                + videos.length + ' ' + (isFA ? 'قطعه' : 'tracks') + '</div>';
            
            videos.forEach(function(v, i) {
                var even = i % 2 === 0;
                html += '<div class="st-yt-track" id="st-track-' + i + '" onclick="playSTTrack(' + i + ')" style="display:flex;align-items:center;gap:12px;padding:11px 14px;background:' + (even ? 'rgba(255,255,255,0.025)' : 'transparent') + ';border-bottom:1px solid rgba(255,255,255,0.05);cursor:pointer;transition:background 0.15s;">'
                    + '<div style="position:relative;flex-shrink:0;width:64px;height:48px;border-radius:6px;overflow:hidden;">'
                    + '<img src="' + v.thumbnail + '" style="width:100%;height:100%;object-fit:cover;" onerror="this.src=\'\';this.parentElement.style.background=\'#2d0060\';">'
                    + '<div class="st-play-overlay" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.35);">'
                    + '<div style="width:22px;height:22px;border-radius:50%;background:rgba(168,85,247,0.9);display:flex;align-items:center;justify-content:center;">'
                    + '<svg viewBox="0 0 10 12" width="8" height="9" fill="white"><polygon points="1,1 9,6 1,11"/></svg>'
                    + '</div></div></div>'
                    + '<div style="flex:1;min-width:0;">'
                    + '<div style="font-size:13px;color:#e0e0e0;font-weight:600;margin-bottom:3px;line-height:1.3;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;">' + (v.title || '') + '</div>'
                    + '<div style="font-size:11px;color:#666;">' + (v.channel || '') + '</div>'
                    + '</div>'
                    + '<div style="display:flex;flex-direction:column;gap:5px;flex-shrink:0;">'
                    + '<div style="width:28px;height:28px;border-radius:50%;background:rgba(168,85,247,0.15);border:1px solid rgba(168,85,247,0.3);display:flex;align-items:center;justify-content:center;color:#a855f7;font-size:11px;" id="st-track-icon-' + i + '">'
                    + '<svg viewBox="0 0 10 12" width="9" height="10" fill="currentColor"><polygon points="1,1 9,6 1,11"/></svg></div>'
                    + '<a href="https://www.youtube.com/watch?v=' + v.videoId + '" target="_blank" onclick="event.stopPropagation()" style="width:28px;height:28px;border-radius:50%;background:rgba(255,0,0,0.12);border:1px solid rgba(255,0,0,0.25);display:flex;align-items:center;justify-content:center;color:#ff5555;font-size:10px;text-decoration:none;" title="YouTube">'
                    + '<svg viewBox="0 0 20 14" width="12" height="8" fill="currentColor"><path d="M19.6 2.2C19.4 1.4 18.8.8 18 .6 16.4.2 10 .2 10 .2S3.6.2 2 .6C1.2.8.6 1.4.4 2.2.1 3.8 0 7 0 7s.1 3.2.4 4.8c.2.8.8 1.4 1.6 1.6C3.6 13.8 10 13.8 10 13.8s6.4 0 8-.4c.8-.2 1.4-.8 1.6-1.6.3-1.6.4-4.8.4-4.8s-.1-3.2-.4-4.8zM8 10V4l5.3 3L8 10z"/></svg>'
                    + '</a></div>'
                    + '</div>';
            });
            html += '</div>';
            contentEl.innerHTML = html;
        }

        function playSTTrack(idx) {
            if (!stYTVideos || idx < 0 || idx >= stYTVideos.length) return;
            stYTCurrentIdx = idx;
            var v = stYTVideos[idx];
            var miniPlayer = document.getElementById('st-mini-player');
            var ytEmbed = document.getElementById('st-yt-embed');
            var isFA = LANG === 'fa';

            // Highlight active track
            document.querySelectorAll('[id^="st-track-"]').forEach(function(el, i) {
                if (el.id.startsWith('st-track-') && !el.id.startsWith('st-track-icon-')) {
                    el.style.background = 'transparent';
                    el.style.borderLeft = 'none';
                }
            });
            var activeTrack = document.getElementById('st-track-' + idx);
            if (activeTrack) {
                activeTrack.style.background = 'rgba(168,85,247,0.12)';
                activeTrack.style.borderLeft = '3px solid #a855f7';
            }

            // Update mini player
            document.getElementById('st-np-title').textContent = v.title || '';
            document.getElementById('st-np-artist').textContent = v.channel || '';
            document.getElementById('st-np-label').textContent = isFA ? '🎵 در حال پخش' : '🎵 Now Playing';
            
            // Set cover art
            var coverEl = document.getElementById('st-cover-art');
            if (coverEl && v.thumbnail) {
                coverEl.style.backgroundImage = 'url(' + v.thumbnail + ')';
                coverEl.style.backgroundSize = 'cover';
                coverEl.innerHTML = '';
            }
            
            // Update play icon in list
            document.querySelectorAll('[id^="st-track-icon-"]').forEach(function(el) {
                el.innerHTML = '<svg viewBox="0 0 10 12" width="9" height="10" fill="currentColor"><polygon points="1,1 9,6 1,11"/></svg>';
                el.style.color = '#a855f7';
            });
            var activeIcon = document.getElementById('st-track-icon-' + idx);
            if (activeIcon) {
                activeIcon.innerHTML = '<i class="fa-solid fa-volume-high" style="font-size:10px;"></i>';
                activeIcon.style.color = '#a855f7';
            }

            // Embed YouTube player
            var embedHtml = '<!DOCTYPE html><html><head><meta charset="utf-8"><style>*{margin:0;padding:0;box-sizing:border-box;}body{background:#000;width:100%;height:100%;overflow:hidden;}iframe{width:100%;height:100%;border:none;}</style></head><body><iframe src="https://www.youtube.com/embed/' + v.videoId + '?autoplay=1&playsinline=1&rel=0&modestbranding=1" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowfullscreen></iframe></body></html>';
            
            if (ytEmbed) {
                ytEmbed.style.display = 'block';
                ytEmbed.innerHTML = '<div style="position:relative;width:100%;padding-top:56.25%;background:#000;border-radius:12px;overflow:hidden;margin-bottom:8px;">'
                    + '<iframe id="st-yt-iframe" style="position:absolute;inset:0;width:100%;height:100%;border:none;" srcdoc="' + embedHtml.replace(/"/g, '&quot;') + '" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowfullscreen></iframe>'
                    + '</div>'
                    + '<button onclick="stClosePlayer()" style="width:100%;background:#1a1a1a;color:#aaa;border:none;border-radius:8px;padding:8px;font-size:12px;cursor:pointer;font-family:inherit;margin-bottom:6px;">'
                    + (isFA ? '✕ بستن پلیر' : '✕ Close Player') + '</button>';
            }

            if (miniPlayer) {
                miniPlayer.style.display = 'block';
                document.getElementById('st-pp-icon').className = 'fa-solid fa-pause';
            }
        }

        function stClosePlayer() {
            var ytEmbed = document.getElementById('st-yt-embed');
            var miniPlayer = document.getElementById('st-mini-player');
            if (ytEmbed) { ytEmbed.innerHTML = ''; ytEmbed.style.display = 'none'; }
            if (miniPlayer) miniPlayer.style.display = 'none';
            document.querySelectorAll('[id^="st-track-"]').forEach(function(el) {
                if (!el.id.startsWith('st-track-icon-')) {
                    el.style.background = 'transparent';
                    el.style.borderLeft = 'none';
                }
            });
        }

        function stTogglePlay() {
            // Toggle play/pause in iframe - just close/reopen
            var iframe = document.getElementById('st-yt-iframe');
            if (!iframe) { if (stYTCurrentIdx >= 0) playSTTrack(stYTCurrentIdx); return; }
        }

        function stNext() {
            if (stYTVideos.length === 0) return;
            var nextIdx = (stYTCurrentIdx + 1) % stYTVideos.length;
            playSTTrack(nextIdx);
        }

        function stPrev() {
            if (stYTVideos.length === 0) return;
            var prevIdx = (stYTCurrentIdx - 1 + stYTVideos.length) % stYTVideos.length;
            playSTTrack(prevIdx);
        }

        function stSeek(e) {} // placeholder

        async function stFetchFromAI(title, originalTitle, year, type) {
            var prompt = 'List the official soundtrack tracks for the ' + (type === 'tv' ? 'TV show' : 'film') + ' "' + title + '"' + (originalTitle && originalTitle !== title ? ' (also known as: ' + originalTitle + ')' : '') + (year ? ' (' + year + ')' : '') + '. Include original score compositions and licensed songs used in the film/show. Return ONLY a JSON array, no text before or after: [{"num":1,"name":"Exact Track Name","artist":"Composer or Artist Name"}]. If you do not know this film, return an empty array []';
            
            function parseResult(text) {
                if (!text) return null;
                var p = stParseJSON(text);
                if (p && p.length > 0) {
                    // Filter out obviously wrong results
                    var valid = p.filter(function(t) { return t.name && t.name.length > 1 && t.name !== 'Track 1'; });
                    if (valid.length > 0) return stNormalizeTracks(valid);
                }
                return null;
            }

            // METHOD 1: Pollinations GET
            try {
                var r = await fetch('https://text.pollinations.ai/' + encodeURIComponent(prompt) + '?model=openai-large&seed=7&nologo=true', { signal: AbortSignal.timeout(25000) });
                if (r.ok) { var t = await r.text(); var res = parseResult(t); if (res) return res; }
            } catch(e) {}
            // METHOD 2: Pollinations POST
            try {
                var r2 = await fetch('https://text.pollinations.ai/openai', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(25000),
                    body: JSON.stringify({ model: 'openai-large', messages: [
                        { role: 'system', content: 'You are a film music expert. Return ONLY valid JSON arrays. Never return explanatory text.' },
                        { role: 'user', content: prompt }
                    ], max_tokens: 2000, temperature: 0.1 })
                });
                if (r2.ok) { var d2 = await r2.json(); var raw2 = d2.choices && d2.choices[0] && d2.choices[0].message && d2.choices[0].message.content; var res2 = parseResult(raw2); if (res2) return res2; }
            } catch(e2) {}
            // METHOD 3: Try with a simpler, more focused prompt
            try {
                var simplePrompt = 'Soundtrack tracklist for "' + title + '" ' + (year||'') + ' as JSON array: [{"num":1,"name":"track name","artist":"artist"}]';
                var r3 = await fetch('https://text.pollinations.ai/' + encodeURIComponent(simplePrompt) + '?model=openai&seed=3&nologo=true', { signal: AbortSignal.timeout(20000) });
                if (r3.ok) { var t3 = await r3.text(); var res3 = parseResult(t3); if (res3) return res3; }
            } catch(e3) {}
            return null;
        }

        function stParseJSON(raw) {
            if (!raw) return null;
            var clean = raw.replace(/```json|```/g, '').trim();
            var a1 = clean.indexOf('['), a2 = clean.lastIndexOf(']');
            if (a1 >= 0 && a2 > a1) { try { var arr = JSON.parse(clean.substring(a1, a2+1)); if (Array.isArray(arr) && arr.length > 0) return arr; } catch(e) {} }
            var j1 = clean.indexOf('{'), j2 = clean.lastIndexOf('}');
            if (j1 >= 0 && j2 > j1) { try { var obj = JSON.parse(clean.substring(j1,j2+1)); var a = obj.tracks||obj.soundtrack||obj.tracklist; if (Array.isArray(a)&&a.length>0) return a; } catch(e) {} }
            return null;
        }

        function stNormalizeTracks(arr) {
            return arr.map(function(t, i) {
                return { num: t.num||t.number||(i+1), name: t.name||t.title||t.track||('Track '+(i+1)), artist: t.artist||t.composer||t.by||'' };
            });
        }

        function renderStTrackList(tracks) {
            var isFA = LANG === 'fa';
            var html = '<div style="position:relative;z-index:2;padding-bottom:30px;">';
            html += '<div style="font-size:11px;color:rgba(255,255,255,0.35);text-align:center;padding:8px 0 16px;">'
                + tracks.length + ' ' + (isFA ? 'قطعه' : 'tracks') + '</div>';
            tracks.forEach(function(t, i) {
                var even = i % 2 === 0;
                var ytQuery = encodeURIComponent((t.name||'') + ' ' + (t.artist||''));
                var ytUrl = 'https://www.youtube.com/results?search_query=' + ytQuery;
                html += '<div style="display:flex;align-items:center;gap:12px;padding:13px 16px;background:' + (even ? 'rgba(255,255,255,0.02)' : 'transparent') + ';border-bottom:1px solid rgba(255,255,255,0.05);">'
                    + '<div style="min-width:26px;text-align:center;font-size:12px;color:rgba(168,85,247,0.6);font-weight:700;">' + (t.num||(i+1)) + '</div>'
                    + '<div style="flex:1;min-width:0;">'
                    + '<div style="font-size:14px;color:#e0e0e0;font-weight:600;margin-bottom:2px;">' + (t.name||'') + '</div>'
                    + '<div style="font-size:12px;color:#777;">' + (t.artist||'') + '</div>'
                    + '</div>'
                    + '<a href="' + ytUrl + '" target="_blank" onclick="event.stopPropagation()" style="width:32px;height:32px;border-radius:50%;background:rgba(255,0,0,0.15);border:1px solid rgba(255,0,0,0.3);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#ff4444;font-size:12px;text-decoration:none;" title="' + (isFA ? 'جستجو در یوتیوب' : 'Search on YouTube') + '">'
                    + '<svg viewBox="0 0 20 14" width="13" height="9" fill="currentColor"><path d="M19.6 2.2C19.4 1.4 18.8.8 18 .6 16.4.2 10 .2 10 .2S3.6.2 2 .6C1.2.8.6 1.4.4 2.2.1 3.8 0 7 0 7s.1 3.2.4 4.8c.2.8.8 1.4 1.6 1.6C3.6 13.8 10 13.8 10 13.8s6.4 0 8-.4c.8-.2 1.4-.8 1.6-1.6.3-1.6.4-4.8.4-4.8s-.1-3.2-.4-4.8zM8 10V4l5.3 3L8 10z"/></svg>'
                    + '</a>'
                    + '</div>';
            });
            html += '</div>';
            var el = document.getElementById('st-content');
            if (el) el.innerHTML = html;
        }

        function closeSoundtracks() {
            document.getElementById('soundtracks-modal').classList.remove('open');
        }
        // =================== END SOUNDTRACKS ===================



        
        function openLightbox(url) {
            const lb = document.getElementById('ss-lightbox');
            document.getElementById('ss-lightbox-img').src = url;
            lb.style.display = 'flex';
        }
        
        function closeLightbox() {
            document.getElementById('ss-lightbox').style.display = 'none';
            document.getElementById('ss-lightbox-img').src = '';
        }
        
        // --- RUNTIME FORMATTER ---
        function formatRuntime(minutes, isApprox) {
            if (!minutes || minutes <= 0) return null;
            const h = Math.floor(minutes / 60);
            const m = minutes % 60;
            let label = '';
            if (h > 0 && m > 0) label = `${h}h ${m}m`;
            else if (h > 0) label = `${h}h`;
            else label = `${m}m`;
            return { label, isApprox: !!isApprox };
        }
        
        // --- AWARDS FORMATTER ---
        function formatAwards(data, type) {
            // Parse TMDB award data from external_ids or awards field
            // We'll fetch from OMDb-style summary embedded in TMDB
            // TMDB doesn't have direct award data - we extract from known fields
            return null; // Will be filled in openDetail via separate fetch
        }
        
        // --- LAZY DOWNLOAD BADGE CHECKER (after page renders) ---
        // Only marks items that have real Download Box entries in DOWNLOADS_DB (softsub or dubbed)
        // Does NOT mark items that only have internal download (VidSrc VIP) - all items have that
        async function checkLazyDlBadges() {
            const lazyBadges = document.querySelectorAll('.dl-badge-lazy');
            const batch = Array.from(lazyBadges).slice(0, 30);
            let cacheChanged = false;
            for (const badge of batch) {
                const tmdbId = badge.getAttribute('data-tmdb');
                const type = badge.getAttribute('data-type');
                if (!tmdbId || badge.dataset.checked) continue;
                badge.dataset.checked = '1';
                
                // Skip if already in cache
                if (DL_CACHE[tmdbId] !== undefined) {
                    if (DL_CACHE[tmdbId] === true) {
                        badge.classList.remove('dl-badge-lazy');
                        badge.innerHTML = '<i class="fa-solid fa-download"></i>';
                        badge.classList.add('show');
                    } else {
                        badge.remove();
                    }
                    continue;
                }
                
                try {
                    const d = await getData(`${type}/${tmdbId}?append_to_response=external_ids`);
                    if (d && d.external_ids && d.external_ids.imdb_id) {
                        const imdbId = d.external_ids.imdb_id;
                        // Only true if DOWNLOADS_DB has real download links (softsub/dubbed), NOT just internal
                        const dbEntry = DOWNLOADS_DB && DOWNLOADS_DB[imdbId];
                        const hasDl = !!(dbEntry && (
                            (dbEntry.softsub && Object.keys(dbEntry.softsub).length > 0) ||
                            (dbEntry.dubbed && Object.keys(dbEntry.dubbed).length > 0)
                        ));
                        DL_CACHE[tmdbId] = hasDl;
                        cacheChanged = true;
                        if (hasDl) {
                            badge.classList.remove('dl-badge-lazy');
                            badge.innerHTML = '<i class="fa-solid fa-download"></i>';
                            badge.classList.add('show');
                        } else {
                            badge.remove();
                        }
                    } else {
                        DL_CACHE[tmdbId] = false;
                        cacheChanged = true;
                        badge.remove();
                    }
                } catch(e) {}
                // Small delay to avoid rate limiting
                await new Promise(r => setTimeout(r, 150));
            }
            if (cacheChanged) {
                try { localStorage.setItem('dl_cache', JSON.stringify(DL_CACHE)); } catch(e) {}
            }
            // Continue checking remaining badges after a short pause
            const remaining = document.querySelectorAll('.dl-badge-lazy');
            if (remaining.length > 0) {
                setTimeout(checkLazyDlBadges, 500);
            }
        }
        // =================== COMPANIES DATA & LOGIC ===================
        // TMDB verified IDs. isNetwork:true → with_networks for TV; companyId → with_companies for movies
        // extraIds: additional TMDB company IDs to merge results (for studios with multiple subsidiaries)
        const COMPANIES_DB = [
            // ── STREAMING PLATFORMS ──
            { name:'Netflix',              nameFA:'نتفلیکس',               type:'Streaming',   isNetwork:true,  networkId:213,   companyId:213,   extraIds:[],
              logo:'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/netflix.svg',                                                      bg:'#E50914', emoji:'N', noInvert:true },
            { name:'HBO',                  nameFA:'اچ‌بی‌اُ',               type:'Cable TV',    isNetwork:true,  networkId:49,    companyId:3268,  extraIds:[49],
              logo:'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/HBO_logo.svg/800px-HBO_logo.svg.png',                                bg:'#ffffff', emoji:'H', noInvert:true },
            { name:'Max',                  nameFA:'مکس',                   type:'Streaming',   isNetwork:true,  networkId:3268,  companyId:174,   extraIds:[],
              logo:'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/HBO_Max_Logo.svg/800px-HBO_Max_Logo.svg.png',                        bg:'#7B2FBE', emoji:'M', noInvert:true },
            { name:'Disney+',              nameFA:'دیزنی‌پلاس',             type:'Streaming',   isNetwork:true,  networkId:2739,  companyId:2,     extraIds:[],
              logo:'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Disney%2B_logo.svg/800px-Disney%2B_logo.svg.png',                    bg:'#b3d4f5', emoji:'D', noInvert:true },
            { name:'Apple TV+',            nameFA:'اپل تی‌وی‌پلاس',         type:'Streaming',   isNetwork:true,  networkId:2552,  companyId:2724,  extraIds:[],
              logo:'https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Apple_TV_Plus_Logo.svg/800px-Apple_TV_Plus_Logo.svg.png',             bg:'#f5c518', emoji:'🍎', noInvert:true },
            { name:'Amazon Prime Video',   nameFA:'آمازون پرایم ویدیو',      type:'Streaming',   isNetwork:true,  networkId:1024,  companyId:19996, extraIds:[20580],
              logo:'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Amazon_Prime_Video_logo.svg/800px-Amazon_Prime_Video_logo.svg.png',  bg:'#ffffff', emoji:'A', noInvert:true },
            { name:'Hulu',                 nameFA:'هولو',                   type:'Streaming',   isNetwork:true,  networkId:453,   companyId:37853, extraIds:[],
              logo:'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Hulu_Logo.svg/800px-Hulu_Logo.svg.png',                              bg:'#1CE783', emoji:'H', noInvert:true },
            { name:'Paramount+',           nameFA:'پارامونت‌پلاس',           type:'Streaming',   isNetwork:true,  networkId:4330,  companyId:4171,  extraIds:[],
              logo:'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Paramount_Plus_logo.svg/800px-Paramount_Plus_logo.svg.png',          bg:'#0064FF', emoji:'P', noInvert:true },
            { name:'Peacock',              nameFA:'پیکاک',                  type:'Streaming',   isNetwork:true,  networkId:3353,  companyId:10342, extraIds:[],
              logo:'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/NBCUniversal_Peacock_Logo.svg/800px-NBCUniversal_Peacock_Logo.svg.png', bg:'#ffffff', emoji:'🦚', noInvert:true },
            // ── MAJOR STUDIOS ──
            { name:'Warner Bros.',         nameFA:'وارنر برادرز',            type:'Studio',      isNetwork:false, networkId:174,   companyId:174,   extraIds:[2785,3172],
              logo:'https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Warner_Bros_logo.svg/800px-Warner_Bros_logo.svg.png',                 bg:'#1a1a6e', emoji:'W', noInvert:true },
            { name:'Universal Pictures',   nameFA:'یونیورسال پیکچرز',        type:'Studio',      isNetwork:false, networkId:33,    companyId:33,    extraIds:[10201],
              logo:'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Universal_Pictures_logo.svg/800px-Universal_Pictures_logo.svg.png',   bg:'#000000', emoji:'U', noInvert:true },
            { name:'Columbia Pictures',    nameFA:'کلمبیا پیکچرز',           type:'Studio',      isNetwork:false, networkId:25,    companyId:5,     extraIds:[25],
              logo:'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Columbia_Pictures_logo.svg/800px-Columbia_Pictures_logo.svg.png',     bg:'#3c91d4', emoji:'C', noInvert:true },
            { name:'Marvel Studios',       nameFA:'مارول استودیوز',           type:'Studio',      isNetwork:false, networkId:420,   companyId:420,   extraIds:[7505],
              logo:'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Marvel_Logo.svg/800px-Marvel_Logo.svg.png',                          bg:'#1b2838', emoji:'M', noInvert:true },
            { name:'Walt Disney Pictures', nameFA:'والت دیزنی پیکچرز',       type:'Studio',      isNetwork:false, networkId:2,     companyId:2,     extraIds:[],
              logo:'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Walt_Disney_Pictures_logo.svg/800px-Walt_Disney_Pictures_logo.svg.png', bg:'#001F5F', emoji:'D', noInvert:true },
            { name:'Paramount Pictures',   nameFA:'پارامونت پیکچرز',          type:'Studio',      isNetwork:false, networkId:4171,  companyId:4171,  extraIds:[],
              logo:'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Paramount_Pictures_2014.svg/800px-Paramount_Pictures_2014.svg.png',   bg:'#0033A0', emoji:'P', noInvert:true },
            { name:'Sony Pictures',        nameFA:'سونی پیکچرز',             type:'Studio',      isNetwork:false, networkId:34,    companyId:34,    extraIds:[5,7576],
              logo:'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Sony_logo.svg/800px-Sony_logo.svg.png',                              bg:'#000000', emoji:'S', noInvert:true },
            { name:'20th Century Studios', nameFA:'قرن بیستم استودیوز',       type:'Studio',      isNetwork:false, networkId:25,    companyId:127928,extraIds:[25],
              logo:'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/20th_Century_Studios_2020.svg/800px-20th_Century_Studios_2020.svg.png', bg:'#00224e', emoji:'2', noInvert:true },
            { name:'MGM',                  nameFA:'ام‌جی‌ام',                 type:'Studio',      isNetwork:false, networkId:8411,  companyId:8411,  extraIds:[16,1270,7352],
              logo:'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/MGM_logo_%282012%29.svg/800px-MGM_logo_%282012%29.svg.png',           bg:'#8b0000', emoji:'M', noInvert:true },
            { name:'Lionsgate',            nameFA:'لاینزگیت',                type:'Studio',      isNetwork:false, networkId:521,   companyId:521,   extraIds:[],
              logo:'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Lionsgate_logo.svg/800px-Lionsgate_logo.svg.png',                    bg:'#000000', emoji:'L', noInvert:true },
            { name:'A24',                  nameFA:'ای‌۲۴',                    type:'Studio',      isNetwork:false, networkId:41077, companyId:41077, extraIds:[],
              logo:'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/A24_logo_black.svg/800px-A24_logo_black.svg.png',                    bg:'#000000', emoji:'A' },
            { name:'New Line Cinema',      nameFA:'نیو لاین سینما',           type:'Studio',      isNetwork:false, networkId:12,    companyId:12,    extraIds:[],
              logo:'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/New_Line_Cinema_Logo.svg/800px-New_Line_Cinema_Logo.svg.png',         bg:'#c8102e', emoji:'N', noInvert:true },
            { name:'Pixar',                nameFA:'پیکسار',                  type:'Animation',   isNetwork:false, networkId:3,     companyId:3,     extraIds:[],
              logo:'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Pixar_logo.svg/800px-Pixar_logo.svg.png',                            bg:'#0078b4', emoji:'P', noInvert:true },
            { name:'DreamWorks Animation', nameFA:'دریم‌ورکز انیمیشن',        type:'Animation',   isNetwork:false, networkId:6194,  companyId:6194,  extraIds:[521,14],
              logo:'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/DreamWorks_Animation_2021_%28white%29.svg/800px-DreamWorks_Animation_2021_%28white%29.svg.png', bg:'#1a3a6e', emoji:'D', noInvert:true },
            { name:'DC Studios',           nameFA:'دی‌سی استودیوز',           type:'Studio',      isNetwork:false, networkId:9993,  companyId:9993,  extraIds:[174,429],
              logo:'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/DC_Comics_logo.svg/800px-DC_Comics_logo.svg.png',                    bg:'#0057B7', emoji:'D', noInvert:true },
            { name:'Miramax',              nameFA:'میراماکس',                type:'Studio',      isNetwork:false, networkId:14,    companyId:14,    extraIds:[],
              logo:'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Miramax_Logo.svg/800px-Miramax_Logo.svg.png',                        bg:'#1a1a1a', emoji:'M', noInvert:true },
            // ── TV NETWORKS ──
            { name:'FX',                   nameFA:'اف‌ایکس',                 type:'Cable TV',    isNetwork:true,  networkId:55,    companyId:55,    extraIds:[],
              logo:'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/FX_International_logo.svg/800px-FX_International_logo.svg.png',       bg:'#000000', emoji:'F', noInvert:true },
            { name:'NBC',                  nameFA:'ان‌بی‌سی',                 type:'Network',     isNetwork:true,  networkId:6,     companyId:13,    extraIds:[],
              logo:'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/NBC_logo.svg/800px-NBC_logo.svg.png',                                bg:'#000000', emoji:'N', noInvert:true },
            { name:'CBS',                  nameFA:'سی‌بی‌اس',                 type:'Network',     isNetwork:true,  networkId:16,    companyId:16,    extraIds:[],
              logo:'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/CBS_logo.svg/800px-CBS_logo.svg.png',                                bg:'#ffffff', emoji:'C', noInvert:true },
            { name:'Showtime',             nameFA:'شوتایم',                  type:'Cable TV',    isNetwork:true,  networkId:67,    companyId:67,    extraIds:[],
              logo:'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Showtime.svg/800px-Showtime.svg.png',                                bg:'#000000', emoji:'S', noInvert:true },
            { name:'AMC',                  nameFA:'ای‌ام‌سی',                 type:'Cable TV',    isNetwork:true,  networkId:174,   companyId:174,   extraIds:[],
              logo:'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/AMC_logo_2019.svg/800px-AMC_logo_2019.svg.png',                       bg:'#000000', emoji:'A', noInvert:true },
            // ── INDIE & SPECIALTY ──
            { name:'Focus Features',       nameFA:'فوکوس فیچرز',             type:'Studio',      isNetwork:false, networkId:1537,  companyId:1537,  extraIds:[10146],
              logo:'https://upload.wikimedia.org/wikipedia/en/thumb/5/53/Focus_Features.png/240px-Focus_Features.png',                             bg:'#1a1a1a', emoji:'F', noInvert:true },
            { name:'Blumhouse Productions',nameFA:'بلوم‌هاوس',               type:'Studio',      isNetwork:false, networkId:3172,  companyId:3172,  extraIds:[],
              logo:"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 240'%3E%3Crect width='800' height='240' rx='24' fill='%231a1a1a'/%3E%3Cpath d='M100 62h45v116h-45zM85 62h75M85 178h75M145 62c42 0 42 55 0 55h-45M145 117c50 0 50 61 0 61h-45' fill='none' stroke='white' stroke-width='14'/%3E%3Ctext x='215' y='112' font-family='Arial,sans-serif' font-size='56' font-weight='900' fill='white'%3EBLUMHOUSE%3C/text%3E%3Ctext x='218' y='165' font-family='Arial,sans-serif' font-size='34' letter-spacing='5' fill='%23bbbbbb'%3EPRODUCTIONS%3C/text%3E%3C/svg%3E", bg:'#1a1a1a', emoji:'👻', noInvert:true,
              description:'Known for high-concept, micro-budget horror and thriller productions.',
              verifiedMovieTitles:[{title:'Paranormal Activity',year:2007},{title:'Paranormal Activity 2',year:2010},{title:'Paranormal Activity 3',year:2011},{title:'Paranormal Activity 4',year:2012},{title:'Paranormal Activity: The Marked Ones',year:2014},{title:'Paranormal Activity: The Ghost Dimension',year:2015},{title:'The Purge',year:2013},{title:'The Purge: Anarchy',year:2014},{title:'The Purge: Election Year',year:2016},{title:'The First Purge',year:2018},{title:'The Forever Purge',year:2021},{title:'Insidious',year:2010},{title:'Insidious: Chapter 2',year:2013},{title:'Insidious: Chapter 3',year:2015},{title:'Insidious: The Last Key',year:2018},{title:'Insidious: The Red Door',year:2023},{title:'Sinister',year:2012},{title:'Sinister 2',year:2015},{title:'Get Out',year:2017},{title:'Happy Death Day',year:2017},{title:'Happy Death Day 2U',year:2019},{title:'Upgrade',year:2018},{title:'Truth or Dare',year:2018},{title:'Unfriended',year:2014},{title:'Unfriended: Dark Web',year:2018},{title:'Halloween',year:2018},{title:'Halloween Kills',year:2021},{title:'Halloween Ends',year:2022},{title:'The Invisible Man',year:2020},{title:'Freaky',year:2020},{title:'M3GAN',year:2022},{title:'M3GAN 2.0',year:2025},{title:'Five Nights at Freddy’s',year:2023},{title:'The Black Phone',year:2021},{title:'The Black Phone 2',year:2025},{title:'Imaginary',year:2024},{title:'Night Swim',year:2024},{title:'Speak No Evil',year:2024},{title:'Afraid',year:2024},{title:'Wolf Man',year:2025},{title:'The Exorcist: Believer',year:2023},{title:'The Visit',year:2015},{title:'Ouija',year:2014},{title:'Ouija: Origin of Evil',year:2016},{title:'Cam',year:2018},{title:'Stephanie',year:2017},{title:'The Gift',year:2015},{title:'Ma',year:2019},{title:'Black Christmas',year:2019},{title:'Bloodlines',year:2025}],
              verifiedTvTitles:[{title:'The Purge',year:2018},{title:'Into the Dark',year:2018},{title:'Sharp Objects',year:2018},{title:'The Good Lord Bird',year:2020},{title:'Welcome to the Blumhouse',year:2020},{title:'The Horror of Dolores Roach',year:2023}] },
            { name:'Amblin Entertainment', nameFA:'امبلین انترتینمنت',        type:'Production',  isNetwork:false, networkId:56,    companyId:56,    extraIds:[],
              logo:'https://upload.wikimedia.org/wikipedia/en/thumb/d/d3/Amblin_Entertainment_logo.png/220px-Amblin_Entertainment_logo.png',        bg:'#192560', emoji:'🌙', noInvert:true },
            { name:'Working Title Films',  nameFA:'ورکینگ تایتل فیلمز',       type:'Studio',      isNetwork:false, networkId:10163, companyId:10163, extraIds:[],
              logo:'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Working_Title_Films_logo.svg/800px-Working_Title_Films_logo.svg.png',  bg:'#1a1a1a', emoji:'🎥', noInvert:true },
            { name:'Neon',                 nameFA:'نئون',                    type:'Distribution',isNetwork:false, networkId:23297, companyId:23297, extraIds:[167337,92829],
              logo:'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Neon_%28company%29_logo.svg/800px-Neon_%28company%29_logo.svg.png',   bg:'#cc00cc', emoji:'💡', noInvert:true },
            { name:'Bad Robot',            nameFA:'بد روبات',                type:'Production',  isNetwork:false, networkId:11461, companyId:11461, extraIds:[],
              logo:'https://upload.wikimedia.org/wikipedia/en/thumb/a/aa/Bad_Robot_logo.png/220px-Bad_Robot_logo.png',                             bg:'#1a1a1a', emoji:'🤖', noInvert:true },
            // ── MORE PRODUCTION COMPANIES ──
            { name:'Happy Madison Productions', nameFA:'هپی مدیسون',          type:'Production',  isNetwork:false, networkId:9865,  companyId:9865,  extraIds:[4906,9865],
              logo:"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 240'%3E%3Crect width='800' height='240' rx='24' fill='%232a1500'/%3E%3Ccircle cx='120' cy='120' r='68' fill='%23f5a623'/%3E%3Cpath d='M82 108q38 48 76 0M94 91h2m48 0h2' stroke='%232a1500' stroke-width='10' fill='none' stroke-linecap='round'/%3E%3Ctext x='215' y='112' font-family='Arial,sans-serif' font-size='58' font-weight='900' fill='white'%3EHAPPY%3C/text%3E%3Ctext x='215' y='174' font-family='Arial,sans-serif' font-size='52' font-weight='900' fill='%23f5a623'%3EMADISON%3C/text%3E%3C/svg%3E", bg:'#2a1500', emoji:'😄', noInvert:true,
              verifiedMovieTitles:[{title:'Deuce Bigalow: Male Gigolo',year:1999},{title:'Little Nicky',year:2000},{title:'Joe Dirt',year:2001},{title:'The Animal',year:2001},{title:'Mr. Deeds',year:2002},{title:'The Master of Disguise',year:2002},{title:'Eight Crazy Nights',year:2002},{title:'The Hot Chick',year:2002},{title:'Anger Management',year:2003},{title:'Dickie Roberts: Former Child Star',year:2003},{title:'50 First Dates',year:2004},{title:'The Longest Yard',year:2005},{title:'Deuce Bigalow: European Gigolo',year:2005},{title:"Grandma's Boy",year:2006},{title:'The Benchwarmers',year:2006},{title:'Click',year:2006},{title:'Reign Over Me',year:2007},{title:'I Now Pronounce You Chuck & Larry',year:2007},{title:'Strange Wilderness',year:2008},{title:"You Don't Mess with the Zohan",year:2008},{title:'The House Bunny',year:2008},{title:'Bedtime Stories',year:2008},{title:'Paul Blart: Mall Cop',year:2009},{title:'Funny People',year:2009},{title:'The Shortcut',year:2009},{title:'Grown Ups',year:2010},{title:'Just Go with It',year:2011},{title:'Zookeeper',year:2011},{title:'Bucky Larson: Born to Be a Star',year:2011},{title:'Jack and Jill',year:2011},{title:"That's My Boy",year:2012},{title:'Here Comes the Boom',year:2012},{title:'Grown Ups 2',year:2013},{title:'Blended',year:2014},{title:'Paul Blart: Mall Cop 2',year:2015},{title:'Joe Dirt 2: Beautiful Loser',year:2015},{title:'Pixels',year:2015},{title:'The Ridiculous 6',year:2015},{title:'The Do-Over',year:2016},{title:'Sandy Wexler',year:2017},{title:'The Week Of',year:2018},{title:'Father of the Year',year:2018},{title:'Murder Mystery',year:2019},{title:'The Wrong Missy',year:2020},{title:'Hubie Halloween',year:2020},{title:'Home Team',year:2022},{title:'Hustle',year:2022},{title:'Murder Mystery 2',year:2023},{title:'The Out-Laws',year:2023},{title:'You Are So Not Invited to My Bat Mitzvah',year:2023},{title:'Leo',year:2023},{title:'Kinda Pregnant',year:2025},{title:'Happy Gilmore 2',year:2025},{title:'Roommates',year:2026},{title:"Don't Say Good Luck",year:2026},{title:'Dad Camp',year:2026}],
              verifiedTvTitles:[{title:'Rules of Engagement',year:2007},{title:'The Gong Show with Dave Attell',year:2008},{title:"Nick Swardson's Pretend Time",year:2010},{title:'Breaking In',year:2011},{title:'The Goldbergs',year:2013}],
              imdbIds:['tt0142235','tt0202470','tt0264395','tt0269461','tt0311289','tt0318374','tt0368052','tt0368271','tt0421823','tt0432337','tt0437946','tt0479884','tt0497465','tt0499549','tt0762108','tt0800080','tt0800369','tt0810819','tt0836199','tt1001508','tt1267297','tt1510650','tt1623690','tt1772341','tt1860213','tt1905041','tt2098628','tt2199571','tt2310332','tt2401645','tt3553976','tt4327210','tt6763664','tt8078800','tt9474732','tt0120731','tt0160127','tt0181649','tt0299706','tt0349944'],
              imdbTvIds:['tt0756104','tt2400736','tt1831575','tt1615919','tt0319061'] },
            { name:'Illumination',         nameFA:'ایلومینیشن',               type:'Animation',   isNetwork:false, networkId:6704,  companyId:6704,  extraIds:[33],
              logo:'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Illumination_logo.svg/800px-Illumination_logo.svg.png',               bg:'#000000', emoji:'🌟', noInvert:true },
            { name:'Legendary Pictures',   nameFA:'لجندری پیکچرز',            type:'Studio',      isNetwork:false, networkId:923,   companyId:923,   extraIds:[],
              logo:'https://upload.wikimedia.org/wikipedia/en/thumb/7/72/Legendary_Entertainment_logo.png/220px-Legendary_Entertainment_logo.png',  bg:'#1a1a1a', emoji:'⚔️', noInvert:true },
            { name:'Skydance Media',       nameFA:'اسکای‌دنس مدیا',            type:'Production',  isNetwork:false, networkId:67303, companyId:67303, extraIds:[4171,174,33],
              logo:'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Skydance_Media_logo.svg/800px-Skydance_Media_logo.svg.png',           bg:'#1a2a4a', emoji:'🚀', noInvert:true },
            { name:'Village Roadshow',     nameFA:'ویلیج رودشو',              type:'Studio',      isNetwork:false, networkId:79,    companyId:79,    extraIds:[],
              logo:'https://upload.wikimedia.org/wikipedia/en/thumb/9/9b/Village_Roadshow_Pictures_logo.png/220px-Village_Roadshow_Pictures_logo.png', bg:'#1a1a1a', emoji:'🎪', noInvert:true },
            { name:'Regency Enterprises',  nameFA:'ریجنسی انترپرایزز',         type:'Production',  isNetwork:false, networkId:508,   companyId:508,   extraIds:[],
              logo:'https://upload.wikimedia.org/wikipedia/en/thumb/a/a4/Regency_Enterprises.png/220px-Regency_Enterprises.png',                   bg:'#1a1a1a', emoji:'👑', noInvert:true },
            { name:'Plan B Entertainment', nameFA:'پلن‌بی انترتینمنت',         type:'Production',  isNetwork:false, networkId:1885,  companyId:1885,  extraIds:[],
              logo:'https://upload.wikimedia.org/wikipedia/en/thumb/c/c1/Plan_B_Entertainment_logo.png/220px-Plan_B_Entertainment_logo.png',        bg:'#1a1a1a', emoji:'🎭', noInvert:true },
            { name:'Imagine Entertainment', nameFA:'ایمجین انترتینمنت',        type:'Production',  isNetwork:false, networkId:289,   companyId:289,   extraIds:[],
              logo:'https://upload.wikimedia.org/wikipedia/en/thumb/1/1e/Imagine_Entertainment_logo.png/220px-Imagine_Entertainment_logo.png',      bg:'#1a1a1a', emoji:'💭', noInvert:true },
            { name:'Annapurna Pictures',   nameFA:'آنه‌پورنا پیکچرز',          type:'Studio',      isNetwork:false, networkId:19726, companyId:19726, extraIds:[],
              logo:'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Annapurna_Pictures_logo.svg/800px-Annapurna_Pictures_logo.svg.png',   bg:'#3d0045', emoji:'🏔️', noInvert:true },
            { name:'Searchlight Pictures', nameFA:'سرچ‌لایت پیکچرز',           type:'Studio',      isNetwork:false, networkId:7295,  companyId:7295,  extraIds:[],
              logo:'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Searchlight_Pictures_logo.svg/800px-Searchlight_Pictures_logo.svg.png', bg:'#1a1a1a', emoji:'🔦', noInvert:true },
            { name:'BBC Studios',          nameFA:'بی‌بی‌سی استودیوز',          type:'Network',     isNetwork:true,  networkId:4,     companyId:1287,  extraIds:[],
              logo:'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/BBC_logo.svg/800px-BBC_logo.svg.png',                                 bg:'#000000', emoji:'📺', noInvert:true },
            { name:'Studio Ghibli',        nameFA:'استودیو جیبلی',             type:'Animation',   isNetwork:false, networkId:10342, companyId:10342, extraIds:[],
              logo:'https://upload.wikimedia.org/wikipedia/en/thumb/c/ca/Studio_Ghibli_logo.svg/800px-Studio_Ghibli_logo.svg.png',                  bg:'#ffffff', emoji:'🌿', noInvert:true },
            { name:'Janus Films',          nameFA:'یانوس فیلمز',              type:'Distribution',isNetwork:false, networkId:11576, companyId:11576, extraIds:[],
              logo:'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Janus_Films_logo.svg/800px-Janus_Films_logo.svg.png',                 bg:'#1a1a1a', emoji:'🎭', noInvert:true,
              imdbIds:['tt0050976','tt0050986','tt0060827','tt0055499','tt0057530','tt0057611','tt0083922','tt0048641','tt0053976','tt0069467','tt0042876','tt0047478','tt0044741','tt0055630','tt0056443','tt0050613','tt0051808','tt0057565','tt0058888','tt0089881','tt0047528','tt0050783','tt0053779','tt0056801','tt0071129','tt0058898','tt0053619','tt0054130','tt0056736','tt0058003','tt0060176','tt0053198','tt0055031','tt0054389','tt0063136','tt0070460','tt0058604','tt0053472','tt0057345','tt0059592','tt0058892','tt0062480','tt0064612','tt0064122','tt0091288','tt0052893','tt0054632','tt0058946','tt0065234','tt0064040','tt0062229','tt0047892','tt0046268','tt0046911','tt0038348','tt0041719','tt0062136','tt0050706','tt0022100','tt0017136','tt0019254','tt0010323','tt0013442','tt0015864','tt0027977','tt0021749','tt0032553','tt0044837','tt0012349','tt0018773','tt0031885','tt0028950','tt0045274','tt0040522','tt0038890','tt0046478','tt0047445','tt0046438','tt0041154','tt0043465','tt0053397','tt0053134','tt0053114','tt0055237','tt0058279','tt0058430','tt0056058','tt0058625','tt0053146','tt0048473','tt0048956','tt0052572','tt0100234','tt0120265'] },
            { name:'Mosfilm',              nameFA:'موسفیلم',                  type:'Studio',      isNetwork:false, networkId:2566,  companyId:2566,  extraIds:[],
              logo:'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Mosfilm_logo.svg/800px-Mosfilm_logo.svg.png',                         bg:'#8b1a1a', emoji:'🎬', noInvert:true,
              imdbIds:['tt0015648','tt0029850','tt0037824','tt0040222','tt0050634','tt0052600','tt0056111','tt0060107','tt0063794','tt0069293','tt0072443','tt0075404','tt0079944','tt0079579','tt0091251','tt0091341','tt0110598','tt0120125','tt0851578','tt0488478','tt2318405','tt1966566','tt2802154','tt14874020','tt0062484','tt0065955','tt0069628','tt0073807','tt0066549','tt0071411','tt0079200','tt0076729','tt0076391','tt0073179','tt0072659','tt0087640','tt0092590','tt0088007','tt0090924','tt1101026','tt1343703','tt3039926','tt10147644','tt2188337','tt6537376','tt5541240','tt5624096','tt5278868','tt0049226','tt0046300','tt0049348','tt0039004','tt0062759','tt0067141','tt0066495','tt0084715','tt0091360','tt0087091','tt0405045','tt0403358','tt0409904','tt0416044','tt0454123','tt1578887','tt0403645','tt4084744','tt4731148','tt8060328','tt6673840','tt6537238','tt8820590','tt11905962','tt12536294','tt14539740','tt0049707','tt0050503','tt0058743','tt0059172','tt0060581','tt0079604'] },
            { name:'Dharma Productions',   nameFA:'دارما پروداکشنز',           type:'Production',  isNetwork:false, networkId:2464,  companyId:2464,  extraIds:[],
              logo:"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 240'%3E%3Crect width='800' height='240' rx='24' fill='%231a0a2e'/%3E%3Ccircle cx='120' cy='120' r='62' fill='%23e9b44c'/%3E%3Cpath d='M120 65c-18 32-18 78 0 110M65 120c32-18 78-18 110 0M81 81c25 8 50 33 58 58M159 81c-25 8-50 33-58 58' stroke='%231a0a2e' stroke-width='8' fill='none'/%3E%3Ctext x='215' y='112' font-family='Georgia,serif' font-size='54' font-weight='700' fill='white'%3EDHARMA%3C/text%3E%3Ctext x='215' y='170' font-family='Arial,sans-serif' font-size='38' letter-spacing='3' fill='%23e9b44c'%3EPRODUCTIONS%3C/text%3E%3C/svg%3E",         bg:'#1a0a2e', emoji:'🌺', noInvert:true,
              imdbIds:['tt0172684','tt0248126','tt0347304','tt0449994','tt1185420','tt1324059','tt1114677','tt1188996','tt1849718','tt1605790','tt2172071','tt2178470','tt2704740','tt2372678','tt3678938','tt3322420','tt3859980','tt4253292','tt4900716','tt5061072','tt4559006','tt5946128','tt6277440','tt6692354','tt7098658','tt7638348','tt7212726','tt6264938','tt6988116','tt8519370','tt8504014','tt10350626','tt10295212','tt9531772','tt13841850','tt10857164','tt13131350','tt14295590','tt14993250','tt16333130','tt3173910','tt6277462','tt28259207','tt27510174','tt1505467','tt1483375','tt0420332','tt0101258'] },
        ];
        const COMPANIES_CLEAN = COMPANIES_DB.filter(c => !['Neon', 'Imagine Entertainment'].includes(c.name));
        
        function getCompanyTypeName(type) {
            const t = TEXTS[LANG];
            return (t.companyTypes && t.companyTypes[type]) || type;
        }

        // Real logo resolver: first use TMDB official logo_path, then local/remote fallback.
        const COMPANY_LOGO_CACHE_KEY = 'fn_company_logo_cache_v2';
        function getCompanyLogoCache() {
            try { return JSON.parse(localStorage.getItem(COMPANY_LOGO_CACHE_KEY) || '{}'); } catch(e) { return {}; }
        }
        function setCompanyLogoCache(cache) {
            try { localStorage.setItem(COMPANY_LOGO_CACHE_KEY, JSON.stringify(cache)); } catch(e) {}
        }
        function companyCacheKey(company) {
            return (company.isNetwork ? 'network_' : 'company_') + (company.isNetwork ? company.networkId : company.companyId);
        }
        function getCompanyLogoSrc(company) {
            if (!company) return '';
            if (company._tmdbLogo) return company._tmdbLogo;
            const cache = getCompanyLogoCache();
            const cached = cache[companyCacheKey(company)];
            if (cached) return cached;
            return company.logo || '';
        }
        function companyLogoFilter(company) {
            // Keep official logo colors; use a high-contrast mat + dual light/dark shadow instead of color inversion.
            return 'filter:drop-shadow(0 1px 1px rgba(255,255,255,.95)) drop-shadow(0 -1px 1px rgba(0,0,0,.85)) drop-shadow(1px 0 1px rgba(255,255,255,.65)) drop-shadow(-1px 0 1px rgba(0,0,0,.65));';
        }
        async function resolveCompanyLogo(company) {
            if (!company) return '';
            const cacheKey = companyCacheKey(company);
            const cache = getCompanyLogoCache();
            if (cache[cacheKey]) { company._tmdbLogo = cache[cacheKey]; return cache[cacheKey]; }
            const tryEndpoints = [];
            if (company.isNetwork && company.networkId) tryEndpoints.push(`network/${company.networkId}`);
            if (company.companyId) tryEndpoints.push(`company/${company.companyId}`);
            if (!company.isNetwork && company.networkId && company.networkId !== company.companyId) tryEndpoints.push(`company/${company.networkId}`);
            if (company.extraIds && company.extraIds.length) {
                company.extraIds.slice(0, 2).forEach(id => { if (id && id !== company.companyId) tryEndpoints.push(`company/${id}`); });
            }
            for (const ep of tryEndpoints) {
                try {
                    const d = await getDataEN(ep);
                    if (d && d.logo_path) {
                        const logo = `${TMDB_IMG_BASE}/w300${d.logo_path}`;
                        company._tmdbLogo = logo;
                        cache[cacheKey] = logo;
                        setCompanyLogoCache(cache);
                        return logo;
