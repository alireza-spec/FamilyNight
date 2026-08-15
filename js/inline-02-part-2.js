        function populateSidebar() {
            const t = TEXTS[LANG];
            const genres = [
                {id:'28', n:t.R_act || (LANG==='fa'?'اکشن':'Action')},
                {id:'35', n:t.R_com || (LANG==='fa'?'کمدی':'Comedy')},
                {id:'27', n:t.R_hor || (LANG==='fa'?'ترسناک':'Horror')},
                {id:'18', n:t.R_dra || (LANG==='fa'?'درام':'Drama')},
                {id:'878', n:t.R_sci || (LANG==='fa'?'علمی تخیلی':'Sci-Fi')},
                {id:'16', n:t.R_ani || (LANG==='fa'?'انیمیشن':'Animation')},
                {id:'10749', n:t.R_rom || (LANG==='fa'?'عاشقانه':'Romance')},
                {id:'53', n: LANG==='fa' ? 'هیجان‌انگیز':'Thriller'},
                {id:'80', n: LANG==='fa' ? 'جنایی':'Crime'},
                {id:'99', n:t.R_doc || (LANG==='fa'?'مستند':'Documentary')},
                {id:'10751', n:t.R_fam || (LANG==='fa'?'خانوادگی':'Family')},
                {id:'14', n:t.R_fan || (LANG==='fa'?'فانتزی':'Fantasy')},
                {id:'36', n:t.R_bio || (LANG==='fa'?'تاریخی':'History')},
                {id:'10752', n:t.R_war || (LANG==='fa'?'جنگی':'War')},
                {id:'9648', n: LANG==='fa' ? 'رمز و راز':'Mystery'},
                {id:'12', n: LANG==='fa' ? 'ماجراجویی':'Adventure'},
                {id:'10402', n: LANG==='fa' ? 'موزیکال':'Music'},
                {id:'37', n: LANG==='fa' ? 'وسترن':'Western'},
                {id:'10770', n: LANG==='fa' ? 'فیلم تلویزیونی':'TV Movie'},
                {id:'anime_movie', n: LANG==='fa' ? 'انیمه (سینمایی)':'Anime Movies'},
                {id:'anime_series', n: LANG==='fa' ? 'انیمه (سریال)':'Anime Series'},

            ];
            const list = document.getElementById('sb-cats');
            list.innerHTML = '';
            genres.forEach(g => {
                let fn = '';
                const gn = g.n.replace(/'/g, "\'");
                if (g.id === 'anime_movie') {
                    fn = "openGenericGrid('movie','discover/movie?with_genres=16&with_original_language=ja&sort_by=popularity.desc','" + gn + "');toggleMenu()";
                } else if (g.id === 'anime_series') {
                    fn = "openGenericGrid('tv','discover/tv?with_genres=16&with_original_language=ja&sort_by=popularity.desc','" + gn + "');toggleMenu()";
                } else if (g.id === 'live_action_movie') {
                    fn = "openGenericGrid('movie','discover/movie?without_genres=16&sort_by=popularity.desc','" + gn + "');toggleMenu()";
                } else if (g.id === 'live_action_series') {
                    fn = "openGenericGrid('tv','discover/tv?without_genres=16&sort_by=popularity.desc','" + gn + "');toggleMenu()";
                } else {
                    fn = "openGenericGrid('movie','discover/movie?with_genres=" + g.id + "&sort_by=popularity.desc','" + gn + "');toggleMenu()";
                }
                list.innerHTML += '<div class="sb-sub-item" onclick="' + fn + '">' + g.n + '</div>';
            });

            // ── Append every category that exists on the Home page so the
            // sidebar Categories list mirrors Home exactly. Uses the same
            // query strings as renderHome()'s sections array. ──
            const homeCats = [
                { q: `trending/all/day`, t: LANG === 'fa' ? '🔥 الان داغه (Trending)' : '🔥 Trending Right Now', type: 'movie' },
                { q: `discover/movie?sort_by=primary_release_date.desc&vote_count.gte=10&include_adult=false`, t: LANG === 'fa' ? '🎬 جدیدترین فیلم‌ها' : '🎬 Latest Movies', type: 'movie' },
                { q: `custom:updated_series`, t: t.updates, type: 'tv' },
                { q: `custom:top_movies`, t: t.R_topM, type: 'movie' },
                { q: `custom:top_tv`, t: t.R_topS, type: 'tv' },
                { q: `custom:miniseries`, t: t.miniSeries, type: 'tv' },
                { q: `custom:oscar`, t: t.R_oscar, type: 'movie' },
                { q: _homeCatQ('movie', '28|53|12', null, null) + `&with_keywords=445|10183|9676|549|3310|2483`, t: t.R_surv, type: 'movie' },
                { q: _homeCatQ('movie', null, 1920, 1929), t: t.R_20s, type: 'movie' },
                { q: _homeCatQ('movie', null, 1930, 1939), t: t.R_30s, type: 'movie' },
                { q: _homeCatQ('movie', null, 1940, 1949), t: t.R_40s, type: 'movie' },
                { q: _homeCatQ('movie', null, 1950, 1959), t: t.R_50s, type: 'movie' },
                { q: `custom:decade:1960:1969`, t: t.R_60s, type: 'movie' },
                { q: `custom:decade:1970:1979`, t: t.R_70s, type: 'movie' },
                { q: `custom:decade:1980:1989`, t: t.R_80s, type: 'movie' },
                { q: `custom:decade:1990:1999`, t: t.R_90s, type: 'movie' },
                { q: _homeCatQ('movie', '28'), t: t.R_act, type: 'movie' },
                { q: _homeCatQ('movie', '35'), t: t.R_com, type: 'movie' },
                { q: _homeCatQ('movie', '27'), t: t.R_hor, type: 'movie' },
                { q: _homeCatQ('movie', '18'), t: t.R_dra, type: 'movie' },
                { q: _homeCatQ('movie', '878'), t: t.R_sci, type: 'movie' },
                { q: _homeCatQ('movie', '16'), t: t.R_ani, type: 'movie' },
                { q: _homeCatQ('tv', '16', null, null, 'ja'), t: t.R_anime, type: 'tv' },
                { q: _homeCatQ('movie', '10749'), t: t.R_rom, type: 'movie' },
                { q: _homeCatQ('movie', '10751'), t: t.R_fam, type: 'movie' },
                { q: `custom:sports`, t: t.R_sports, type: 'movie' },
                { q: `custom:mental_health`, t: t.R_mental, type: 'movie' },
                { q: _homeCatQ('movie', '14'), t: t.R_fan, type: 'movie' },
                { q: _homeCatQ('movie', '10752'), t: t.R_war, type: 'movie' },
                { q: _homeCatQ('movie', '36'), t: t.R_bio, type: 'movie' },
                { q: `custom:documentaries`, t: t.R_docs, type: 'movie' },
                { q: `custom:romcom`, t: t.R_romcom, type: 'movie' },
                { q: `custom:parody`, t: t.R_parody, type: 'movie' },
                { q: _homeCatQ('movie', null, null, null, 'fa'), t: t.R_iran, type: 'movie' },
                { q: _homeCatQ('movie', null, null, null, 'hi'), t: t.R_india, type: 'movie' },
                { q: _homeCatQ('movie', null, null, null, 'zh|ko|ja|th'), t: t.R_asia, type: 'movie' },
                { q: _homeCatQ('movie', null, null, null).replace('sort_by=popularity.desc','sort_by=primary_release_date.desc').replace('&fn_home_mix=1','') + `&with_companies=420|7505`, t: t.R_marvel, type: 'movie' },
                { q: _homeCatQ('tv', null, null, null).replace('sort_by=popularity.desc','sort_by=first_air_date.desc').replace('&fn_home_mix=1','') + `&with_companies=420|19551`, t: t.R_marvelTV, type: 'tv' },
                { q: _homeCatQ('movie', null, null, null).replace('sort_by=popularity.desc','sort_by=primary_release_date.desc').replace('&fn_home_mix=1','') + `&with_companies=429|9993|128064|2806`, t: t.R_dc, type: 'movie' },
                { q: 'custom:adult', t: t.R_adult, type: 'movie', adult: true },
                { q: 'curator_picks', t: t.R_curator, type: 'movie' },
            ];
            list.innerHTML += '<div style="padding:10px 14px 6px;font-size:10px;color:#666;text-transform:uppercase;letter-spacing:0.5px;border-top:1px solid #222;margin-top:6px;">' + (LANG === 'fa' ? 'دسته‌بندی‌های صفحه اصلی' : 'Home Categories') + '</div>';
            homeCats.forEach(c => {
                if (!c.t) return;
                const titleEsc = String(c.t).replace(/'/g, "\\'");
                const qEsc = c.q.replace(/'/g, "\\'");
                const fn2 = c.adult
                    ? "openAdultCategory();toggleMenu()"
                    : "openGenericGrid('" + c.type + "','" + qEsc + "','" + titleEsc + "');toggleMenu()";
                list.innerHTML += '<div class="sb-sub-item" onclick="' + fn2 + '">' + c.t + '</div>';
            });
            
            // Populate Countries Sidebar
            const countriesList = document.getElementById('sb-countries-list');
            countriesList.innerHTML = '';
            const countries = [
                {code:'US', name_fa:'ایالات متحده', name_en:'United States'},
                {code:'GB', name_fa:'بریتانیا', name_en:'United Kingdom'},
                {code:'IR', name_fa:'ایران', name_en:'Iran'},
                {code:'AF', name_fa:'افغانستان', name_en:'Afghanistan'},
                {code:'AL', name_fa:'آلبانی', name_en:'Albania'},
                {code:'DZ', name_fa:'الجزایر', name_en:'Algeria'},
                {code:'AR', name_fa:'آرژانتین', name_en:'Argentina'},
                {code:'AM', name_fa:'ارمنستان', name_en:'Armenia'},
                {code:'AU', name_fa:'استرالیا', name_en:'Australia'},
                {code:'AT', name_fa:'اتریش', name_en:'Austria'},
                {code:'AZ', name_fa:'آذربایجان', name_en:'Azerbaijan'},
                {code:'BH', name_fa:'بحرین', name_en:'Bahrain'},
                {code:'BD', name_fa:'بنگلادش', name_en:'Bangladesh'},
                {code:'BY', name_fa:'بلاروس', name_en:'Belarus'},
                {code:'BE', name_fa:'بلژیک', name_en:'Belgium'},
                {code:'BZ', name_fa:'بلیز', name_en:'Belize'},
                {code:'BO', name_fa:'بولیوی', name_en:'Bolivia'},
                {code:'BA', name_fa:'بوسنی و هرزگوین', name_en:'Bosnia and Herzegovina'},
                {code:'BW', name_fa:'بوتسوانا', name_en:'Botswana'},
                {code:'BR', name_fa:'برزیل', name_en:'Brazil'},
                {code:'BN', name_fa:'برونئی', name_en:'Brunei'},
                {code:'BG', name_fa:'بلغارستان', name_en:'Bulgaria'},
                {code:'BF', name_fa:'بورکینافاسو', name_en:'Burkina Faso'},
                {code:'KH', name_fa:'کامبوج', name_en:'Cambodia'},
                {code:'CM', name_fa:'کامرون', name_en:'Cameroon'},
                {code:'CA', name_fa:'کانادا', name_en:'Canada'},
                {code:'CL', name_fa:'شیلی', name_en:'Chile'},
                {code:'CN', name_fa:'چین', name_en:'China'},
                {code:'CO', name_fa:'کلمبیا', name_en:'Colombia'},
                {code:'CR', name_fa:'کاستاریکا', name_en:'Costa Rica'},
                {code:'HR', name_fa:'کرواسی', name_en:'Croatia'},
                {code:'CU', name_fa:'کوبا', name_en:'Cuba'},
                {code:'CY', name_fa:'قبرس', name_en:'Cyprus'},
                {code:'CZ', name_fa:'جمهوری چک', name_en:'Czechia'},
                {code:'DK', name_fa:'دانمارک', name_en:'Denmark'},
                {code:'DO', name_fa:'جمهوری دومینیکن', name_en:'Dominican Republic'},
                {code:'EC', name_fa:'اکوادور', name_en:'Ecuador'},
                {code:'EG', name_fa:'مصر', name_en:'Egypt'},
                {code:'SV', name_fa:'السالوادور', name_en:'El Salvador'},
                {code:'EE', name_fa:'استونی', name_en:'Estonia'},
                {code:'ET', name_fa:'اتیوپی', name_en:'Ethiopia'},
                {code:'FJ', name_fa:'فیجی', name_en:'Fiji'},
                {code:'FI', name_fa:'فنلاند', name_en:'Finland'},
                {code:'FR', name_fa:'فرانسه', name_en:'France'},
                {code:'GA', name_fa:'گابن', name_en:'Gabon'},
                {code:'GE', name_fa:'گرجستان', name_en:'Georgia'},
                {code:'DE', name_fa:'آلمان', name_en:'Germany'},
                {code:'GH', name_fa:'غنا', name_en:'Ghana'},
                {code:'GR', name_fa:'یونان', name_en:'Greece'},
                {code:'GT', name_fa:'گواتمالا', name_en:'Guatemala'},
                {code:'HT', name_fa:'هائیتی', name_en:'Haiti'},
                {code:'HN', name_fa:'هندوراس', name_en:'Honduras'},
                {code:'HK', name_fa:'هنگ کنگ', name_en:'Hong Kong'},
                {code:'HU', name_fa:'مجارستان', name_en:'Hungary'},
                {code:'IS', name_fa:'ایسلند', name_en:'Iceland'},
                {code:'IN', name_fa:'هند', name_en:'India'},
                {code:'ID', name_fa:'اندونزی', name_en:'Indonesia'},
                {code:'IQ', name_fa:'عراق', name_en:'Iraq'},
                {code:'IE', name_fa:'ایرلند', name_en:'Ireland'},
                {code:'IL', name_fa:'اسرائیل', name_en:'Israel'},
                {code:'IT', name_fa:'ایتالیا', name_en:'Italy'},
                {code:'JM', name_fa:'جامائیکا', name_en:'Jamaica'},
                {code:'JP', name_fa:'ژاپن', name_en:'Japan'},
                {code:'JO', name_fa:'اردن', name_en:'Jordan'},
                {code:'KZ', name_fa:'قزاقستان', name_en:'Kazakhstan'},
                {code:'KE', name_fa:'کنیا', name_en:'Kenya'},
                {code:'KW', name_fa:'کویت', name_en:'Kuwait'},
                {code:'KG', name_fa:'قرقیزستان', name_en:'Kyrgyzstan'},
                {code:'LA', name_fa:'لائوس', name_en:'Laos'},
                {code:'LV', name_fa:'لتونی', name_en:'Latvia'},
                {code:'LB', name_fa:'لبنان', name_en:'Lebanon'},
                {code:'LY', name_fa:'لیبی', name_en:'Libya'},
                {code:'LT', name_fa:'لیتوانی', name_en:'Lithuania'},
                {code:'LU', name_fa:'لوکزامبورگ', name_en:'Luxembourg'},
                {code:'MO', name_fa:'ماکائو', name_en:'Macau'},
                {code:'MG', name_fa:'ماداگاسکار', name_en:'Madagascar'},
                {code:'MY', name_fa:'مالزی', name_en:'Malaysia'},
                {code:'MV', name_fa:'مالدیو', name_en:'Maldives'},
                {code:'ML', name_fa:'مالی', name_en:'Mali'},
                {code:'MT', name_fa:'مالت', name_en:'Malta'},
                {code:'MX', name_fa:'مکزیک', name_en:'Mexico'},
                {code:'MD', name_fa:'مولداوی', name_en:'Moldova'},
                {code:'MN', name_fa:'مغولستان', name_en:'Mongolia'},
                {code:'ME', name_fa:'مونته‌نگرو', name_en:'Montenegro'},
                {code:'MA', name_fa:'مراکش', name_en:'Morocco'},
                {code:'MZ', name_fa:'موزامبیک', name_en:'Mozambique'},
                {code:'MM', name_fa:'میانمار', name_en:'Myanmar'},
                {code:'NA', name_fa:'نامیبیا', name_en:'Namibia'},
                {code:'NP', name_fa:'نپال', name_en:'Nepal'},
                {code:'NL', name_fa:'هلند', name_en:'Netherlands'},
                {code:'NZ', name_fa:'نیوزیلند', name_en:'New Zealand'},
                {code:'NI', name_fa:'نیکاراگوئه', name_en:'Nicaragua'},
                {code:'NE', name_fa:'نیجر', name_en:'Niger'},
                {code:'NG', name_fa:'نیجریه', name_en:'Nigeria'},
                {code:'MK', name_fa:'مقدونیه شمالی', name_en:'North Macedonia'},
                {code:'NO', name_fa:'نروژ', name_en:'Norway'},
                {code:'OM', name_fa:'عمان', name_en:'Oman'},
                {code:'PK', name_fa:'پاکستان', name_en:'Pakistan'},
                {code:'PA', name_fa:'پاناما', name_en:'Panama'},
                {code:'PG', name_fa:'پاپوآ گینه نو', name_en:'Papua New Guinea'},
                {code:'PY', name_fa:'پاراگوئه', name_en:'Paraguay'},
                {code:'PE', name_fa:'پرو', name_en:'Peru'},
                {code:'PH', name_fa:'فیلیپین', name_en:'Philippines'},
                {code:'PL', name_fa:'لهستان', name_en:'Poland'},
                {code:'PT', name_fa:'پرتغال', name_en:'Portugal'},
                {code:'PR', name_fa:'پورتوریکو', name_en:'Puerto Rico'},
                {code:'QA', name_fa:'قطر', name_en:'Qatar'},
                {code:'RO', name_fa:'رومانی', name_en:'Romania'},
                {code:'RU', name_fa:'روسیه', name_en:'Russia'},
                {code:'RW', name_fa:'رواندا', name_en:'Rwanda'},
                {code:'SA', name_fa:'عربستان سعودی', name_en:'Saudi Arabia'},
                {code:'SN', name_fa:'سنگال', name_en:'Senegal'},
                {code:'RS', name_fa:'صربستان', name_en:'Serbia'},
                {code:'SG', name_fa:'سنگاپور', name_en:'Singapore'},
                {code:'SK', name_fa:'اسلواکی', name_en:'Slovakia'},
                {code:'SI', name_fa:'اسلوونی', name_en:'Slovenia'},
                {code:'SO', name_fa:'سومالی', name_en:'Somalia'},
                {code:'ZA', name_fa:'آفریقای جنوبی', name_en:'South Africa'},
                {code:'KR', name_fa:'کره جنوبی', name_en:'South Korea'},
                {code:'ES', name_fa:'اسپانیا', name_en:'Spain'},
                {code:'LK', name_fa:'سریلانکا', name_en:'Sri Lanka'},
                {code:'SD', name_fa:'سودان', name_en:'Sudan'},
                {code:'SE', name_fa:'سوئد', name_en:'Sweden'},
                {code:'CH', name_fa:'سوئیس', name_en:'Switzerland'},
                {code:'SY', name_fa:'سوریه', name_en:'Syria'},
                {code:'TW', name_fa:'تایوان', name_en:'Taiwan'},
                {code:'TJ', name_fa:'تاجیکستان', name_en:'Tajikistan'},
                {code:'TZ', name_fa:'تانزانیا', name_en:'Tanzania'},
                {code:'TH', name_fa:'تایلند', name_en:'Thailand'},
                {code:'TG', name_fa:'توگو', name_en:'Togo'},
                {code:'TT', name_fa:'ترینیداد و توباگو', name_en:'Trinidad and Tobago'},
                {code:'TN', name_fa:'تونس', name_en:'Tunisia'},
                {code:'TR', name_fa:'ترکیه', name_en:'Turkey'},
                {code:'TM', name_fa:'ترکمنستان', name_en:'Turkmenistan'},
                {code:'AE', name_fa:'امارات', name_en:'UAE'},
                {code:'UG', name_fa:'اوگاندا', name_en:'Uganda'},
                {code:'UA', name_fa:'اوکراین', name_en:'Ukraine'},
                {code:'UY', name_fa:'اروگوئه', name_en:'Uruguay'},
                {code:'UZ', name_fa:'ازبکستان', name_en:'Uzbekistan'},
                {code:'VE', name_fa:'ونزوئلا', name_en:'Venezuela'},
                {code:'VN', name_fa:'ویتنام', name_en:'Vietnam'},
                {code:'YE', name_fa:'یمن', name_en:'Yemen'},
                {code:'ZM', name_fa:'زامبیا', name_en:'Zambia'},
                {code:'ZW', name_fa:'زیمباوه', name_en:'Zimbabwe'},
            ];
            countries.forEach(c => {
                const name = LANG === 'fa' ? c.name_fa : c.name_en;
                const flagUrl = c.code === 'IR' 
                    ? 'https://flagofiran.com/files/Flag_of_Iran.svg'
                    : `https://flagcdn.com/w20/${c.code.toLowerCase()}.png`;
                countriesList.innerHTML += `
                    <div class="sb-sub-item" onclick="openRandomCountryGrid('${c.code}', '${name}'); toggleMenu()" style="display:flex; align-items:center; gap:8px;">
                        <img src="${flagUrl}" style="width:20px; height:15px; border-radius:2px;" loading="lazy" onerror="this.style.display='none'">
                        ${name}
                    </div>
                `;
            });
            
            // Reset keywords list so it regenerates with new language
            const kwList = document.getElementById('sb-keywords-list');
            if (kwList) kwList.innerHTML = '';
        }

        // --- HOME ---
        // renderHome is defined later in the v13 new features section
        
        // --- HERO CAROUSEL (20 Titles, Auto-Play 3s) ---
        async function loadCarouselData() {
            const url = `trending/all/day`;
            const d = await getData(url);
            if (d.results && d.results.length > 0) {
                carouselData = d.results.filter(m => m.backdrop_path && (m.media_type === 'movie' || m.media_type === 'tv')).slice(0, 20);
                renderCarousel();
                startCarouselTimer();
            }
        }
        
        function renderCarousel() {
            const con = document.getElementById('hero-carousel');
            
            let slidesHtml = carouselData.map((m, i) => {
                let title = m.title || m.name;
                // In FA mode, if title still has non-Persian/non-Latin foreign chars, use English title
                if (LANG === 'fa' && title && /[\u0E00-\u0E7F\u0900-\u097F\u4E00-\u9FFF\u3040-\u30FF\uAC00-\uD7AF\u0400-\u04FF]/.test(title)) {
                    if (m._en_title && !/[\u0E00-\u0E7F\u0900-\u097F\u4E00-\u9FFF\u3040-\u30FF\uAC00-\uD7AF\u0400-\u04FF]/.test(m._en_title)) {
                        title = m._en_title;
                    } else {
                        const engTitle = m.original_title || m.original_name || title;
                        const engHasForeign = /[\u0E00-\u0E7F\u0900-\u097F\u4E00-\u9FFF\u3040-\u30FF\uAC00-\uD7AF\u0400-\u04FF]/.test(engTitle);
                        title = engHasForeign ? title : engTitle;
                    }
                }
                const date = (m.release_date || m.first_air_date || '').split('-')[0];
                const type = m.media_type || (m.title ? 'movie' : 'tv');
                // Genre lookup
                const genreMap = {28:'Action',12:'Adventure',16:'Animation',35:'Comedy',80:'Crime',99:'Documentary',18:'Drama',10751:'Family',14:'Fantasy',36:'History',27:'Horror',10402:'Music',9648:'Mystery',10749:'Romance',878:'Sci-Fi',10770:'TV Movie',53:'Thriller',10752:'War',37:'Western'};
                const genres = (m.genre_ids || []).slice(0,2).map(g => genreMap[g] || '').filter(Boolean).join(' · ');
                const overview = (m.overview || '').substring(0, 90) + ((m.overview||'').length > 90 ? '...' : '');
                return `
                    <div class="slide ${i === 0 ? 'active' : ''}" id="slide-${i}"
                         onclick="openCarouselItem(${i})"
                         style="background-image: url(${IMG_BG + m.backdrop_path});">
                        <div class="hero-card-hint">${LANG === 'fa' ? 'برای جزئیات لمس کن' : 'Tap for details'}</div>
                        <div class="slide-overlay">
                            <div class="slide-title">${title}</div>
                            <div class="slide-meta">
                                <span><i class="fa-solid fa-star" style="color:gold"></i> ${m.vote_average.toFixed(1)}</span>
                                <span>${date}</span>
                                <span style="border:1px solid #eee; padding:0 4px; border-radius:3px; font-size:10px;">${type.toUpperCase()}</span>
                                ${genres ? `<span style="color:#ccc;font-size:10px;">${genres}</span>` : ''}
                            </div>
                            ${overview ? `<div style="font-size:11px;color:#ccc;margin-top:5px;line-height:1.4;max-width:90%;">${overview}</div>` : ''}
                            <div class="slide-extra-info" id="slide-info-${i}" style="margin-top:6px;font-size:10px;color:#bbb;"></div>
                        </div>
                    </div>
                `;
            }).join('');
            const dotsHtml = `<div class="hero-carousel-dots" id="hero-carousel-dots">${carouselData.map((_, i) => `<button class="hero-dot ${i === 0 ? 'active' : ''}" onclick="event.stopPropagation(); goToSlide(${i}); startCarouselTimer();" aria-label="Slide ${i + 1}"></button>`).join('')}</div>`;
            con.innerHTML = slidesHtml + dotsHtml;
            applyCarouselDeckClasses();
            
            // Credits are optional decoration and are fetched only after the visitor changes slide.
            
            // Add swipe support
            initCarouselSwipe(con);
        }
        
        async function loadSlideCredits(id, type, slideIdx) {
            try {
                const credits = await getData(`${type}/${id}/credits`);
                const el = document.getElementById(`slide-info-${slideIdx}`);
                if (!el || !credits) return;
                
                let html = '';
                // Director
                const directors = (credits.crew || []).filter(c => c.job === 'Director').slice(0,1);
                if (directors.length > 0) {
                    html += `<span style="color:#f5c518;">🎬 ${directors[0].name}</span>`;
                }
                // Top 3 cast
                const cast = (credits.cast || []).slice(0, 3);
                if (cast.length > 0) {
                    if (html) html += ' &nbsp;|&nbsp; ';
                    html += `👤 ${cast.map(c => c.name).join(', ')}`;
                }
                if (html) el.innerHTML = html;
            } catch(e) {}
        }
        
        function applyCarouselDeckClasses() {
            if (!carouselData || !carouselData.length) return;
            const total = carouselData.length;
            const prevIdx = (curSlideIdx - 1 + total) % total;
            const nextIdx = (curSlideIdx + 1) % total;
            document.querySelectorAll('.slide').forEach((s, i) => {
                s.classList.remove('active', 'prev', 'next', 'hidden-card');
                if (i === curSlideIdx) s.classList.add('active');
                else if (i === prevIdx) s.classList.add('prev');
                else if (i === nextIdx) s.classList.add('next');
                else s.classList.add('hidden-card');
            });
            document.querySelectorAll('.hero-dot').forEach((d, i) => d.classList.toggle('active', i === curSlideIdx));
        }

        const _fnCarouselCreditsLoaded = new Set();
        function loadCarouselCreditsForSlide(idx) {
            const item = carouselData && carouselData[idx];
            if (!item || _fnCarouselCreditsLoaded.has(idx)) return;
            _fnCarouselCreditsLoaded.add(idx);
            const type = item.media_type || (item.title ? 'movie' : 'tv');
            loadSlideCredits(item.id, type, idx);
        }
        function goToSlide(idx) {
            if (!carouselData || !carouselData.length) return;
            curSlideIdx = ((idx % carouselData.length) + carouselData.length) % carouselData.length;
            applyCarouselDeckClasses();
            loadCarouselCreditsForSlide(curSlideIdx);
        }

        function openCarouselItem(idx) {
            if (carouselSwipeBlocked) return;
            const item = carouselData && carouselData[idx];
            if (!item) return;
            const type = item.media_type || (item.title ? 'movie' : 'tv');
            if (type !== 'movie' && type !== 'tv') return;
            startCarouselTimer();
            openDetail(item.id, type);
        }
        
        function nextSlide() {
            goToSlide(curSlideIdx + 1);
        }
        
        function prevSlide() {
            goToSlide(curSlideIdx - 1);
        }
        
        function startCarouselTimer() {
            if (slideInterval) clearInterval(slideInterval);
            slideInterval = setInterval(nextSlide, 4000); 
        }
        
        let carouselSwipeBlocked = false;
        
        function initCarouselSwipe(el) {
            let touchStartX = 0;
            let touchStartY = 0;
            let isSwiping = false;
            
            el.addEventListener('touchstart', function(e) {
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
                isSwiping = false;
                carouselSwipeBlocked = false;
            }, { passive: true });
            
            el.addEventListener('touchmove', function(e) {
                const dx = e.touches[0].clientX - touchStartX;
                const dy = e.touches[0].clientY - touchStartY;
                if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 15) {
                    isSwiping = true;
                    carouselSwipeBlocked = true;
                }
            }, { passive: true });
            
            el.addEventListener('touchend', function(e) {
                if (!isSwiping) { carouselSwipeBlocked = false; return; }
                const dx = e.changedTouches[0].clientX - touchStartX;
                if (Math.abs(dx) > 40) {
                    if (dx > 0) {
                        prevSlide();
                    } else {
                        nextSlide();
                    }
                    startCarouselTimer();
                }
                isSwiping = false;
                setTimeout(() => { carouselSwipeBlocked = false; }, 300);
            }, { passive: true });
        }
        
        // Genres to exclude from TV listings (talk shows, reality, news, soap opera)
        const TV_EXCLUDED_GENRE_IDS = new Set([10767, 10764, 10763, 10766]);
        
        function isTVShowExcluded(item) {
            if (!item.genre_ids) return false;
            return item.genre_ids.some(gid => TV_EXCLUDED_GENRE_IDS.has(gid));
        }
        

        // =================== SMART HOME CATEGORY ENGINE (v17) ===================
        const SMART_ROW_CACHE = {};
        const CUSTOM_PAGE_SIZE = 20;
        const OMDB_RATING_KEYS = ['f6dd47c8','564727fa','trilogy'];
        const OSCAR_WINNER_TITLES = [
            {title:'One Battle After Another',year:2025},{title:'Sentimental Value',year:2025},
            {title:'Anora',year:2024},{title:"I'm Still Here",year:2024},{title:'Oppenheimer',year:2023},{title:'The Zone of Interest',year:2023},
            {title:'Everything Everywhere All at Once',year:2022},{title:'All Quiet on the Western Front',year:2022},{title:'CODA',year:2021},{title:'Drive My Car',year:2021},
            {title:'Nomadland',year:2020},{title:'Another Round',year:2020},{title:'Parasite',year:2019},{title:'Green Book',year:2018},{title:'Roma',year:2018},
            {title:'The Shape of Water',year:2017},{title:'A Fantastic Woman',year:2017},{title:'Moonlight',year:2016},{title:'The Salesman',year:2016},
            {title:'Spotlight',year:2015},{title:'Son of Saul',year:2015},{title:'Birdman',year:2014},{title:'Ida',year:2013},
            {title:'12 Years a Slave',year:2013},{title:'The Great Beauty',year:2013},{title:'Argo',year:2012},{title:'Amour',year:2012},
            {title:'The Artist',year:2011},{title:'A Separation',year:2011},{title:"The King's Speech",year:2010},{title:'In a Better World',year:2010},
            {title:'The Hurt Locker',year:2009},{title:'The Secret in Their Eyes',year:2009},{title:'Slumdog Millionaire',year:2008},{title:'Departures',year:2008},
            {title:'No Country for Old Men',year:2007},{title:'The Counterfeiters',year:2007},{title:'The Departed',year:2006},{title:'The Lives of Others',year:2006},
            {title:'Crash',year:2005},{title:'Tsotsi',year:2005},{title:'Million Dollar Baby',year:2004},{title:'The Sea Inside',year:2004},
            {title:'The Lord of the Rings: The Return of the King',year:2003},{title:'The Barbarian Invasions',year:2003},
            {title:'Chicago',year:2002},{title:'Nowhere in Africa',year:2001},{title:'A Beautiful Mind',year:2001},{title:'Crouching Tiger, Hidden Dragon',year:2000},
            {title:'Gladiator',year:2000},{title:'All About My Mother',year:1999},{title:'American Beauty',year:1999},{title:'Life Is Beautiful',year:1997},
            {title:'Shakespeare in Love',year:1998},{title:'Titanic',year:1997},{title:'The English Patient',year:1996},{title:'Braveheart',year:1995},
            {title:'Forrest Gump',year:1994},{title:'Schindler\'s List',year:1993},{title:'Unforgiven',year:1992},{title:'The Silence of the Lambs',year:1991},
            {title:'Dances with Wolves',year:1990},{title:'Driving Miss Daisy',year:1989},{title:'Rain Man',year:1988},{title:'The Last Emperor',year:1987},
            {title:'Platoon',year:1986},{title:'Out of Africa',year:1985},{title:'Amadeus',year:1984},{title:'Terms of Endearment',year:1983},
            {title:'Gandhi',year:1982},{title:'Chariots of Fire',year:1981},{title:'Ordinary People',year:1980},{title:'Kramer vs. Kramer',year:1979},
            {title:'The Deer Hunter',year:1978},{title:'Annie Hall',year:1977},{title:'Rocky',year:1976},{title:"One Flew Over the Cuckoo's Nest",year:1975},
            {title:'The Godfather Part II',year:1974},{title:'The Sting',year:1973},{title:'The Godfather',year:1972},{title:'The French Connection',year:1971},
            {title:'Patton',year:1970},{title:'Midnight Cowboy',year:1969},{title:'Oliver!',year:1968},{title:'In the Heat of the Night',year:1967},
            {title:'A Man for All Seasons',year:1966},{title:'The Sound of Music',year:1965},{title:'My Fair Lady',year:1964},{title:'Tom Jones',year:1963},
            {title:'Lawrence of Arabia',year:1962},{title:'West Side Story',year:1961},{title:'The Apartment',year:1960},{title:'Ben-Hur',year:1959},
            {title:'Gigi',year:1958},{title:'The Bridge on the River Kwai',year:1957},{title:'Around the World in 80 Days',year:1956},
            {title:'Marty',year:1955},{title:'On the Waterfront',year:1954},{title:'From Here to Eternity',year:1953},{title:'The Greatest Show on Earth',year:1952},
            {title:'An American in Paris',year:1951},{title:'All About Eve',year:1950},{title:"All the King's Men",year:1949},{title:'Hamlet',year:1948},
            {title:"Gentleman's Agreement",year:1947},{title:'The Best Years of Our Lives',year:1946},{title:'The Lost Weekend',year:1945},{title:'Going My Way',year:1944},
            {title:'Casablanca',year:1942},{title:'Mrs. Miniver',year:1942},{title:'How Green Was My Valley',year:1941},{title:'Rebecca',year:1940},
            {title:'Gone with the Wind',year:1939},{title:'You Can\'t Take It with You',year:1938},{title:'The Life of Emile Zola',year:1937},{title:'The Great Ziegfeld',year:1936},
            {title:'Mutiny on the Bounty',year:1935},{title:'It Happened One Night',year:1934},{title:'Cavalcade',year:1933},{title:'Grand Hotel',year:1932},
            {title:'Cimarron',year:1931},{title:'All Quiet on the Western Front',year:1930},{title:'The Broadway Melody',year:1929},{title:'Wings',year:1927}
        ];

        function _uniqById(arr) {
            const seen = new Set();
            return (arr || []).filter(x => x && x.id && !seen.has(x.id) && seen.add(x.id));
        }
        function _releaseYearOf(item, type) {
            const d = type === 'tv' ? (item.first_air_date || item.release_date || '') : (item.release_date || item.first_air_date || '');
            return parseInt((d || '').slice(0,4)) || 0;
        }
        function _applySmartSort(items, type, mode, defaultMode) {
            const m = mode && mode !== 'default' ? mode : defaultMode;
            const arr = [...(items || [])];
            if (m === 'newest') arr.sort((a,b)=>_releaseYearOf(b,type)-_releaseYearOf(a,type) || (b.vote_count||0)-(a.vote_count||0));
            else if (m === 'oldest') arr.sort((a,b)=>_releaseYearOf(a,type)-_releaseYearOf(b,type) || (b.vote_count||0)-(a.vote_count||0));
            else if (m === 'popular') arr.sort((a,b)=>(b.vote_count||0)-(a.vote_count||0) || (b.popularity||0)-(a.popularity||0));
            else if (m === 'random') arr.sort(()=>Math.random()-0.5);
            else if (m === 'recent_popular') arr.sort((a,b)=>{
                const ad = Date.parse(a.next_episode_to_air?.air_date || a.last_air_date || a.first_air_date || '') || 0;
                const bd = Date.parse(b.next_episode_to_air?.air_date || b.last_air_date || b.first_air_date || '') || 0;
                return bd-ad || (b.popularity||0)-(a.popularity||0) || (b.vote_count||0)-(a.vote_count||0);
            });
            else arr.sort((a,b)=>(b._imdbRating||b.vote_average||0)-(a._imdbRating||a.vote_average||0) || (b.vote_count||0)-(a.vote_count||0));
            return arr;
        }
        async function _fetchDiscoverPages(query, pages=3) {
            let out=[];
            for(let i=1;i<=pages;i++) {
                try { const d = await getData(query + (query.includes('?') ? '&' : '?') + 'page=' + i); if(d && d.results) out = out.concat(d.results); } catch(e) {}
            }
            return _uniqById(out);
        }
        async function _fetchTitleList(list, type, page, perPage) {
            const start=(page-1)*perPage, end=Math.min(start+perPage, list.length), out=[];
            for(let i=start;i<end;i++) {
                try {
                    const x=list[i];
                    const d=await getData(`search/${type}?query=${encodeURIComponent(x.title)}&year=${x.year}`);
                    let best=(d.results||[]).find(r=>_releaseYearOf(r,type)===x.year) || (d.results||[])[0];
                    if(best) out.push(best);
                } catch(e) {}
            }
            return out;
        }
        async function _enrichIMDbRatings(items, type, max=60) {
            const slice = items.slice(0, max);
            await Promise.all(slice.map(async it => {
                try {
                    const ext = await getData(`${type}/${it.id}/external_ids`);
                    const imdbId = ext && ext.imdb_id;
                    if(!imdbId) return;
                    it.imdb_id = imdbId;
                    const cached = localStorage.getItem('fn_imdb_rating_'+imdbId);
                    if(cached) { it._imdbRating = parseFloat(cached) || 0; return; }
                    for(const key of OMDB_RATING_KEYS) {
                        try {
                            const r = await fetch(`https://www.omdbapi.com/?i=${encodeURIComponent(imdbId)}&apikey=${key}`);
                            const j = await r.json();
                            if(j && j.imdbRating && j.imdbRating !== 'N/A') {
                                it._imdbRating = parseFloat(j.imdbRating) || 0;
                                localStorage.setItem('fn_imdb_rating_'+imdbId, String(it._imdbRating));
                                break;
                            }
                        } catch(e) {}
                    }
                } catch(e) {}
            }));
            return items;
        }
        // ── Universal NR filter for Home page: hide items with no rating,
        // EXCEPT genuine real 2026 titles that simply haven't been rated yet ──
        function _passesHomeNRFilter(item, type) {
            if (item && item.vote_average && item.vote_average > 0) return true;
            const y = _releaseYearOf(item, type);
            return y === 2026;
        }

        // ── Global discover-query builder mirroring the local Q() used
        // inside renderHome(); duplicated (not shared by reference) so the
        // sidebar category list can build identical queries without any
        // risk of altering renderHome's own behavior. ──
        function _homeCatQ(type, genre, yearMin, yearMax, origin) {
            let q = `discover/${type}?include_adult=false&vote_count.gte=${MIN_VOTES}&sort_by=popularity.desc&without_genres=99&fn_home_mix=1`;
            if (genre) q += `&with_genres=${genre}`;
            if (origin) q += `&with_original_language=${origin}`;
            if (yearMin && yearMax) {
                q += `&primary_release_date.gte=${yearMin}-01-01&primary_release_date.lte=${yearMax}-12-31`;
                if (type === 'tv') q += `&first_air_date.gte=${yearMin}-01-01&first_air_date.lte=${yearMax}-12-31`;
            }
            return q;
        }

        // ── Dynamic TMDB keyword resolver (cached) — STRICT exact-match only.
        // No loose fallback to results[0]: an inexact keyword match (e.g.
        // "sport" matching an unrelated keyword) would silently pollute a
        // category with unrelated titles. ──
        const _kwIdCache = {};
        async function _resolveKeywordIds(terms) {
            const ids = [];
            for (const term of terms) {
                try {
                    if (_kwIdCache[term]) { ids.push(_kwIdCache[term]); continue; }
                    const d = await getData(`search/keyword?query=${encodeURIComponent(term)}`);
                    const results = (d && d.results) || [];
                    const exact = results.find(k => (k.name || '').toLowerCase() === term.toLowerCase());
                    _kwIdCache[term] = exact ? exact.id : null;
                    if (exact) ids.push(exact.id);
                } catch(e) { _kwIdCache[term] = null; }
            }
            return [...new Set(ids)];
        }

        // ── SPORTS category: only films/series where sport is the CENTRAL
        // subject — any sport, any country. Documentaries excluded entirely
        // except well-known, highly-rated SOCCER documentaries. Reality/talk
        // shows excluded via isTVShowExcluded(). Tight keyword list + strict
        // matching + a meaningful vote threshold keeps out unrelated titles
        // (action films that merely feature a sports scene, animated films
        // with a sports subplot, etc). ──
        let _sportsItemsCache = null;
        async function _getSportsItems() {
            if (_sportsItemsCache) return _sportsItemsCache;
            const kwIds = await _resolveKeywordIds([
                'sport','football','soccer','basketball','baseball','boxing','wrestling',
                'rugby','tennis','formula one','motorsport','mixed martial arts',
                'cricket','golf','cycling','ice hockey','volleyball','dodgeball',
                'american football','marathon','skiing','surfing','sports drama'
            ]);
            let pool = [];
            if (kwIds.length) {
                const kw = kwIds.join('|');
                const movQ = `discover/movie?with_keywords=${kw}&without_genres=99&vote_count.gte=30&sort_by=popularity.desc&include_adult=false`;
                const tvQ  = `discover/tv?with_keywords=${kw}&without_genres=99&vote_count.gte=30&sort_by=popularity.desc&include_adult=false`;
                const [movItems, tvItems] = await Promise.all([
                    _fetchDiscoverPages(movQ, 6),
                    _fetchDiscoverPages(tvQ, 4)
                ]);
                movItems.forEach(m => { m.media_type = 'movie'; });
                tvItems.forEach(t => { t.media_type = 'tv'; });
                pool = pool.concat(movItems, tvItems.filter(x => !isTVShowExcluded(x)));
            }
            // Well-known, highly-rated SOCCER documentaries — the one allowed exception
            const soccerKwIds = await _resolveKeywordIds(['soccer', 'football']);
            if (soccerKwIds.length) {
                const docQ = `discover/movie?with_genres=99&with_keywords=${soccerKwIds.join('|')}&vote_count.gte=150&sort_by=vote_average.desc&include_adult=false`;
                const docs = await _fetchDiscoverPages(docQ, 2);
                docs.forEach(d => { d.media_type = 'movie'; });
                pool = pool.concat(docs);
            }
            pool = _uniqById(pool).filter(it => _passesHomeNRFilter(it, it.media_type));
            _sportsItemsCache = pool;
            return pool;
        }

        // ── MENTAL HEALTH category: films/series centered on psychological
        // illness — psychosis, dissociative/multiple personality, addiction,
        // obsession, hallucination, phobia, anxiety, depression, etc.
        // No documentaries, no reality shows, no NR (except real 2026 titles). ──
        let _mentalItemsCache = null;
        async function _getMentalHealthItems() {
            if (_mentalItemsCache) return _mentalItemsCache;
            const kwIds = await _resolveKeywordIds([
                'mental illness','psychiatric hospital','psychosis','schizophrenia',
                'multiple personality','dissociative identity disorder','drug addiction',
                'depression','obsession','hallucination','phobia','anxiety disorder',
                'bipolar disorder','eating disorder','mental breakdown','psychotherapy',
                'trauma','ptsd','sociopath','psychopath','panic attack'
            ]);
            let pool = [];
            if (kwIds.length) {
                const kw = kwIds.join('|');
                const movQ = `discover/movie?with_keywords=${kw}&without_genres=99&vote_count.gte=15&sort_by=popularity.desc&include_adult=false`;
                const tvQ  = `discover/tv?with_keywords=${kw}&without_genres=99&vote_count.gte=15&sort_by=popularity.desc&include_adult=false`;
                const [movItems, tvItems] = await Promise.all([
                    _fetchDiscoverPages(movQ, 6),
                    _fetchDiscoverPages(tvQ, 4)
                ]);
                movItems.forEach(m => { m.media_type = 'movie'; });
                tvItems.forEach(t => { t.media_type = 'tv'; });
                pool = pool.concat(movItems, tvItems.filter(x => !isTVShowExcluded(x)));
            }
            pool = _uniqById(pool).filter(it => _passesHomeNRFilter(it, it.media_type));
            _mentalItemsCache = pool;
            return pool;
        }

        // ── DOCUMENTARIES category: genre=99, excludes reality/talk shows,
        // NR excluded (unless real 2026), default sort = most popular/voted. ──
        let _docsItemsCache = null;
        async function _getDocumentaryItems() {
            if (_docsItemsCache) return _docsItemsCache;
            const movQ = `discover/movie?with_genres=99&vote_count.gte=30&sort_by=popularity.desc&include_adult=false`;
            const tvQ  = `discover/tv?with_genres=99&vote_count.gte=30&sort_by=popularity.desc&include_adult=false`;
            const [movItems, tvItems] = await Promise.all([
                _fetchDiscoverPages(movQ, 8),
                _fetchDiscoverPages(tvQ, 6)
            ]);
            movItems.forEach(m => { m.media_type = 'movie'; });
            tvItems.forEach(t => { t.media_type = 'tv'; });
            let pool = movItems.concat(tvItems.filter(x => !isTVShowExcluded(x)));
            pool = _uniqById(pool).filter(it => _passesHomeNRFilter(it, it.media_type));
            _docsItemsCache = pool;
            return pool;
        }

        // ── ADULT (18+) category ──
        // Titles load like every other row, but remain visually obscured until age confirmation.
        const ADULT_CATEGORY_CONSENT_KEY = 'fn_adult_category_18_confirmed';
        function hasAdultCategoryConsent() {
            try { return localStorage.getItem(ADULT_CATEGORY_CONSENT_KEY) === 'yes'; } catch(e) { return false; }
        }
        function _adultGateCopy() {
            return LANG === 'fa'
                ? { button: 'من ۱۸ سال یا بیشتر دارم', note: 'برای نمایش آثار بزرگسال، سن خود را تأیید کنید' }
                : { button: "I'm 18 or older", note: 'Confirm your age to reveal adult titles' };
        }
        function enableAdultCategoryAccess() {
            try { localStorage.setItem(ADULT_CATEGORY_CONSENT_KEY, 'yes'); } catch(e) {}
            document.querySelectorAll('.adult-category-section').forEach(x => x.classList.remove('adult-locked'));
            document.querySelectorAll('#generic-grid-page').forEach(x => x.classList.remove('adult-grid-locked'));
            document.querySelectorAll('.adult-age-gate').forEach(x => x.remove());
            return true;
        }
        function applyAdultRowGate(row) {
            const section = row && row.closest('.adult-category-section');
            if (!section || hasAdultCategoryConsent()) return;
            section.classList.add('adult-locked');
            if (section.querySelector('.adult-age-gate')) return;
            const copy = _adultGateCopy();
            const gate = document.createElement('button');
            gate.type = 'button'; gate.className = 'adult-age-gate adult-row-age-gate';
            gate.innerHTML = `<i class="fa-solid fa-lock"></i><span>${copy.button}</span><small>${copy.note}</small>`;
            gate.setAttribute('onclick', 'enableAdultCategoryAccess()');
            section.appendChild(gate);
        }
        function applyAdultGridGate() {
            const page = document.getElementById('generic-grid-page');
            const content = document.getElementById('gg-content');
            if (!page || !content || hasAdultCategoryConsent()) return;
            page.classList.add('adult-grid-locked');
            if (content.querySelector('.adult-age-gate')) return;
            const copy = _adultGateCopy();
            const gate = document.createElement('button');
            gate.type = 'button'; gate.className = 'adult-age-gate adult-grid-age-gate';
            gate.innerHTML = `<i class="fa-solid fa-lock"></i><span>${copy.button}</span><small>${copy.note}</small>`;
            gate.setAttribute('onclick', 'enableAdultCategoryAccess()');
            content.appendChild(gate);
        }
        function openAdultCategory() {
            const title = (TEXTS[LANG] && TEXTS[LANG].R_adult) || '🔞 Adults Only (18+)';
            openGenericGrid('movie', 'custom:adult', title);
        }
        // This category deliberately uses only the following exact TMDB keywords.
        // It does not alter the keyword/tags of any title or any other category.
        const ADULT_CATEGORY_KEYWORD_TERMS = [
            'adult', 'sex', 'sexual desire', 'sexual relationship', 'erotic',
            'erotic romance', 'nudity', 'female nudity', 'male frontal nudity', 'seduction'
        ];
        let _adultKeywordItemsCache = null;
        async function _getAdultKeywordItems() {
            if (_adultKeywordItemsCache) return _adultKeywordItemsCache;
            const ids = await _resolveKeywordIds(ADULT_CATEGORY_KEYWORD_TERMS);
            if (!ids.length) return [];
            const keywords = ids.join('|');
            const [movies, shows] = await Promise.all([
                _fetchDiscoverPages(`discover/movie?with_keywords=${keywords}&sort_by=popularity.desc&include_adult=false`, 8),
                _fetchDiscoverPages(`discover/tv?with_keywords=${keywords}&sort_by=popularity.desc&include_adult=false`, 4)
            ]);
            const seen = new Set();
            const addUnique = (item, media_type) => {
                if (!item || !item.id || !item.poster_path) return null;
                const key = `${media_type}:${item.id}`;
                if (seen.has(key)) return null;
                seen.add(key);
                return { ...item, media_type };
            };
            _adultKeywordItemsCache = movies.map(x => addUnique(x, 'movie')).filter(Boolean)
                .concat(shows.map(x => addUnique(x, 'tv')).filter(x => x && !isTVShowExcluded(x)));
            return _adultKeywordItemsCache;
        }

        // Cinematic per-category loader. It is only a temporary presentation layer;
        // category data, queries, ordering and interactions remain unchanged.
        function fnBeginCategoryLoader(elId) {
            const row = document.getElementById(elId);
            if (!row) return null;
            const isFa = LANG === 'fa';
            row.classList.add('fn-row-is-loading');
            row.setAttribute('aria-busy', 'true');
            row.innerHTML = `<div class="fn-row-loader" role="status" aria-live="polite">
                <div class="fn-row-loader-core"><div class="fn-row-reel"></div><div class="fn-row-loader-copy">${isFa ? 'در حال آماده‌سازی پرده' : 'Preparing the screen'}<small>${isFa ? 'لحظه‌ای دیگر…' : 'Just a moment…'}</small></div></div>
                <div class="fn-row-loader-cards"><div class="fn-row-loader-card"><div class="fn-row-loader-lines"></div></div><div class="fn-row-loader-card"><div class="fn-row-loader-lines"></div></div><div class="fn-row-loader-card"><div class="fn-row-loader-lines"></div></div><div class="fn-row-loader-card"><div class="fn-row-loader-lines"></div></div></div>
            </div>`;
            return row;
        }
        function fnFinishCategoryLoader(row) {
            if (!row) return;
            row.classList.remove('fn-row-is-loading');
            row.removeAttribute('aria-busy');
            row.innerHTML = '';
        }

        async function loadAdultRow(elId) {
            const row = fnBeginCategoryLoader(elId);
            if (!row) return;
            // Show the age gate immediately; titles continue loading underneath it.
            applyAdultRowGate(row);
            const d = await getCustomCategoryResults('custom:adult', 1, 'default');
            fnFinishCategoryLoader(row);
            if (d && d.results) d.results.slice(0, 20).forEach(m => { row.insertAdjacentHTML('beforeend', makeCard(m, m.media_type || 'movie')); });
            applyAdultRowGate(row);
        }

        async function getCustomCategoryResults(q, page=1, mode='default') {
            const perPage = CUSTOM_PAGE_SIZE;
            const [_, kind, a, b] = q.split(':');
            const key = [q, page, mode, LANG].join('|');
            if(SMART_ROW_CACHE[key]) return SMART_ROW_CACHE[key];
            let items=[], total=999, type='movie', defaultMode='imdb';
            if(kind === 'updated_series') {
                type='tv'; defaultMode='recent_popular';
                const base = [
                    `tv/on_the_air?sort_by=popularity.desc`,
                    `tv/airing_today?sort_by=popularity.desc`,
                    `discover/tv?first_air_date.gte=2025-01-01&first_air_date.lte=2026-12-31&sort_by=popularity.desc&vote_count.gte=40&include_adult=false`
                ];
                for(const qq of base) items = items.concat(await _fetchDiscoverPages(qq, 2));
                items = _uniqById(items).filter(x=>!isTVShowExcluded(x) && !((x.genre_ids||[]).includes(99)));
            } else if(kind === 'top_movies') {
                type='movie'; defaultMode='imdb';
                items = await _fetchDiscoverPages(`movie/top_rated?vote_count.gte=25000&include_adult=false`, 8);
                items = await _enrichIMDbRatings(items, type, 100); total=250;
            } else if(kind === 'top_tv') {
                type='tv'; defaultMode='imdb';
                items = await _fetchDiscoverPages(`tv/top_rated?vote_count.gte=2500&include_adult=false&without_genres=99,10763,10764,10767,10766`, 8);
                items = items.filter(x=>!isTVShowExcluded(x) && !((x.genre_ids||[]).includes(99)));
                items = await _enrichIMDbRatings(items, type, 100); total=250;
            } else if(kind === 'miniseries') {
                type='tv'; defaultMode='imdb';
                items = await _fetchDiscoverPages(`discover/tv?with_type=2&without_genres=99,10763,10764,10767,10766&vote_count.gte=100&sort_by=vote_average.desc&include_adult=false`, 8);
                items = items.filter(x=>!isTVShowExcluded(x) && !((x.genre_ids||[]).includes(99)));
                items = await _enrichIMDbRatings(items, type, 120);
            } else if(kind === 'oscar') {
                type='movie'; defaultMode='newest';
                const sorted = [...OSCAR_WINNER_TITLES].sort((x,y)=>y.year-x.year);
                items = await _fetchTitleList(sorted, 'movie', page, perPage);
                const payload={results:items,total_pages:Math.ceil(sorted.length/perPage),type}; SMART_ROW_CACHE[key]=payload; return payload;
            } else if(kind === 'decade') {
                type='movie'; defaultMode='imdb';
                const start=a, end=b;
                items = await _fetchDiscoverPages(`discover/movie?primary_release_date.gte=${start}-01-01&primary_release_date.lte=${end}-12-31&vote_count.gte=1000&sort_by=vote_average.desc&include_adult=false`, 8);
                items = await _enrichIMDbRatings(items, type, 100);
            } else if(kind === 'romcom') {
                type='movie'; defaultMode='random';
                items = await _fetchDiscoverPages(`discover/movie?with_genres=35,10749&vote_count.gte=300&sort_by=popularity.desc&include_adult=false`, 6);
            } else if(kind === 'parody') {
                type='movie'; defaultMode='random';
                // Build one stable, unique pool so Home's 20 cards and every
                // See All page never reshuffle into duplicates between pages.
                if (!window._parodyStablePool || window._parodyStablePoolLang !== LANG) {
                    const kwIds = await _resolveKeywordIds(['parody', 'spoof']);
                    const kw = kwIds.join('|');
                    let parodyPool = kw ? await _fetchDiscoverPages(`discover/movie?with_keywords=${kw}&vote_count.gte=300&sort_by=popularity.desc&include_adult=false`, 6) : [];
                    parodyPool = _uniqById(parodyPool).filter(it => _passesHomeNRFilter(it, 'movie'));
                    const seed = 73129;
                    parodyPool.sort((x,y) => {
                        const sx = _homeMixScore(x, 'movie', seed), sy = _homeMixScore(y, 'movie', seed);
                        return sy - sx;
                    });
                    window._parodyStablePool = parodyPool;
                    window._parodyStablePoolLang = LANG;
                }
                const start = (page - 1) * perPage;
                const pageItems = window._parodyStablePool.slice(start, start + perPage);
                const payload = {results: pageItems, total_pages: Math.max(1, Math.ceil(window._parodyStablePool.length / perPage)), type};
                SMART_ROW_CACHE[key] = payload;
                return payload;
            } else if(kind === 'adult') {
                type='mixed'; defaultMode='random';
                // Dedicated keyword-based source: includes films and series with
                // explicit adult-theme keywords, even when TMDB's adult flag is absent.
                items = await _getAdultKeywordItems();
            } else if(kind === 'sports') {
                type='movie'; defaultMode='random';
                items = await _getSportsItems();
            } else if(kind === 'mental_health') {
                type='movie'; defaultMode='random';
                items = await _getMentalHealthItems();
            } else if(kind === 'documentaries') {
                type='movie'; defaultMode='popular';
                items = await _getDocumentaryItems();
            }
            // The adult category has already been narrowed solely by its exact
            // keyword list; all other categories retain their existing home filter.
            items = (kind === 'adult')
                ? items.filter(it => it && it.poster_path)
                : items.filter(it => _passesHomeNRFilter(it, it.media_type || type));
            items = _applySmartSort(_uniqById(items), type, mode, defaultMode);
            if(total===250) items = items.slice(0,250);
            const start=(page-1)*perPage;
            const payload={results:items.slice(start,start+perPage), total_pages:Math.max(1, Math.ceil(Math.min(total, items.length || total)/perPage)), type};
            SMART_ROW_CACHE[key]=payload;
            return payload;
        }
        const HOME_MIX_CACHE = {};
        function _homeMixScore(item, type, seed) {
            const year = _releaseYearOf(item, type);
            const vote = Math.log10((item.vote_count || 0) + 10);
            const pop = Math.log10((item.popularity || 0) + 1);
            const recent = Math.max(0, Math.min(1, (year - 1950) / 76));
            let h = ((item.id || 0) * 9301 + seed * 49297) % 233280;
            const random = h / 233280;
            return vote * 0.38 + recent * 0.30 + pop * 0.20 + random * 0.12;
        }
        async function getHomeMixedResults(q, page=1, mode='default', type='movie') {
            const clean = q.replace(/&fn_home_mix=1/g, '');
            const key = clean + '|' + LANG;
            if (!HOME_MIX_CACHE[key]) {
                const items = await _fetchDiscoverPages(clean, 3);
                const seed = Math.floor(Math.random() * 100000);
                const unique = _uniqById(items).filter(x => _passesHomeNRFilter(x, x.media_type || type) && !(type === 'tv' && isTVShowExcluded(x)));
                HOME_MIX_CACHE[key] = { seed, items: unique.sort((a,b) => _homeMixScore(b,type,seed) - _homeMixScore(a,type,seed)) };
            }
            const pool = HOME_MIX_CACHE[key].items;
            let sorted = [...pool];
            if (mode === 'newest') sorted.sort((a,b)=>_releaseYearOf(b,type)-_releaseYearOf(a,type)||(b.vote_count||0)-(a.vote_count||0));
            else if (mode === 'popular') sorted.sort((a,b)=>(b.vote_count||0)-(a.vote_count||0)||(b.popularity||0)-(a.popularity||0));
            else if (mode === 'oldest') sorted.sort((a,b)=>_releaseYearOf(a,type)-_releaseYearOf(b,type)||(b.vote_count||0)-(a.vote_count||0));
            const start=(page-1)*CUSTOM_PAGE_SIZE;
            return {results: sorted.slice(start,start+CUSTOM_PAGE_SIZE), total_pages:Math.max(1,Math.ceil(sorted.length/CUSTOM_PAGE_SIZE)), type};
        }

        async function loadRow(q, elId, type) {
            const loadingRow = fnBeginCategoryLoader(elId);
            // Mixed Home categories use one unique pool for Home and See All.
            if (q && q.includes('&fn_home_mix=1')) {
                const d = await getHomeMixedResults(q, 1, 'default', type);
                const c = document.getElementById(elId);
                fnFinishCategoryLoader(c);
                if (d && d.results) d.results.forEach(m => c.innerHTML += makeCard(m, type));
                return;
            }
            // Special handling for Curator's Pick
            if (q && q.startsWith('custom:')) {
                const d = await getCustomCategoryResults(q, 1, 'default');
                const c = document.getElementById(elId);
                fnFinishCategoryLoader(c);
                if(d && d.results) d.results.slice(0, 20).forEach(m => { if (d.type === 'tv' && isTVShowExcluded(m)) return; c.innerHTML += makeCard(m, d.type || type); });
                return;
            }
            if (q === 'curator_picks') {
                fnFinishCategoryLoader(loadingRow);
                await loadCuratorPicks(elId);
                return;
            }
            const d = await getData(q);
            const c = document.getElementById(elId);
            fnFinishCategoryLoader(c);
            if(!d.results) return;
            d.results.forEach(m => {
                // Filter out talk shows, reality shows, news for TV sections
                if (type === 'tv' && isTVShowExcluded(m)) return;
                // Universal Home NR filter: hide unrated items unless a genuine 2026 release
                if (!_passesHomeNRFilter(m, m.media_type || type)) return;
                c.innerHTML += makeCard(m, type);
            });
        }
        // makeCard is defined later in the v13 new features section with enhanced badges
        
        function makePersonCard(p) {
            if (!p.profile_path) return '';
            const isDirector = p.known_for_department === 'Directing';
            return `
                <div class="actor-card" onclick="openDetail(${p.id}, 'person_works')">
                    <img src="${IMG + p.profile_path}" class="actor-img ${isDirector ? 'director-img' : ''}" loading="lazy">
                    ${isDirector ? `<span class="director-label">Dir</span>` : ''}
                    <div class="actor-name">${p.name}</div>
                </div>
            `;
        }
        
        // Helper function to check if title matches letter filter
        function matchesLetterFilter(title, letterFilter) {
            if (!letterFilter || letterFilter === '') return true;
            
            const trimmedTitle = title.trim();
            if (!trimmedTitle) return false;
            
            const firstChar = trimmedTitle.charAt(0).toUpperCase();
            
            if (letterFilter === '0-9') {
                // Only match if title STARTS with a number (not words inside)
                return /^[0-9]/.test(firstChar);
            } else {
                // For letters, check first character of the title OR any word in the title
                // This allows finding "The Walking Dead" with W
                const words = trimmedTitle.split(/\s+/);
                for (const word of words) {
                    const wordFirstChar = word.charAt(0).toUpperCase();
                    if (wordFirstChar === letterFilter.toUpperCase()) return true;
                }
                return false;
            }
        }
        
        // --- DISCOVERY STATE ---
        let discDefaultMode = false;
        let discDefaultSeenIds = new Set();
        let discDefaultPriorityIds = [];
        let discDefaultPriorityIndex = 0;
        let discDefaultPriorityDone = false;
        let discShownIds = new Set(); // Track ALL shown items to prevent duplicates

        // --- DISCOVERY LOGIC ---
        function updateDiscovery(type) {
            discType = type; discPage = 1;
            const prefix = type === 'movie' ? 'm' : 's';

            const sort    = document.getElementById(prefix+'-sort').value;
            const genre   = document.getElementById(prefix+'-genre').value;
            const country = document.getElementById(prefix+'-country').value;
            const yearEl  = document.getElementById(prefix+'-year');
            const yearVal = yearEl ? yearEl.value : '';
            const letterEl = document.getElementById(prefix+'-letter');
            const letterVal = letterEl ? letterEl.value : '';

            // Check if any extra filters are active
            const hasGenre = genre && genre !== '' && genre !== '__all_genres__';
            const hasYear  = yearVal && yearVal !== '' && yearVal !== '__all_years__';
            const hasLetter = letterVal && letterVal !== '';
            // __none__ = no country filter (show all countries)
            const hasCountry = country && country !== '__none__' && country !== '__default__';

            // discDefaultMode is NEVER used now - always use normal runDiscovery
            discDefaultMode = false;

            // Build base TMDB discover query
            let q = `discover/${type}?include_adult=false&vote_count.gte=1`;

            // Handle sort
            if (sort === 'random') {
                q += `&sort_by=popularity.desc`;
                window.useRandomSort = true;
            } else {
                window.useRandomSort = false;
                let sortVal = sort;
                if (type === 'tv' && sort === 'revenue.desc') sortVal = 'popularity.desc';
                q += `&sort_by=${sortVal}`;
            }

            // Add country filter only if a specific country is selected
            if (hasCountry) {
                q += `&with_origin_country=${country}`;
            }

            if (hasGenre) {
                q += `&with_genres=${genre}`;
            }

            if (hasYear) {
                if (yearVal.includes('s')) {
                    const start = parseInt(yearVal.replace('s',''));
                    const end = start + 9;
                    if (type === 'movie') {
                        q += `&primary_release_date.gte=${start}-01-01&primary_release_date.lte=${end}-12-31`;
                    } else {
                        q += `&first_air_date.gte=${start}-01-01&first_air_date.lte=${end}-12-31`;
                    }
                } else {
                    if (type === 'movie') q += `&primary_release_year=${yearVal}`;
                    else q += `&first_air_date_year=${yearVal}`;
                }
            }

            discQuery = q;
            
            // Store letter filter separately for client-side filtering
            window.currentLetterFilter = letterVal;

            // Reset paging state AND shown IDs
            discDefaultSeenIds = new Set();
            discDefaultPriorityIds = [];
            discDefaultPriorityIndex = 0;
            discDefaultPriorityDone = false;
            discShownIds = new Set();

            const c = document.getElementById(type === 'movie' ? 'movies-grid' : 'series-grid');
            
            if (discPage === 1) {
                c.innerHTML = '';
            }
            
            // Add loading indicator
            const loadingDiv = document.createElement('div');
            loadingDiv.id = 'discovery-loading';
            loadingDiv.style.cssText = 'grid-column:1/-1;text-align:center;padding:30px;';
            loadingDiv.innerHTML = '<i class="fa-solid fa-spinner fa-spin" style="font-size:24px;color:var(--primary);"></i><br><p style="margin-top:10px;color:#888;font-size:13px;">' + (LANG === 'fa' ? 'در حال جستجو...' : 'Searching...') + '</p>';
            c.appendChild(loadingDiv);
            
            // Run discovery
            runDiscovery(c);
        }

        async function loadMoreDiscovery(type) {
            const container = document.getElementById(type === 'movie' ? 'movies-grid' : 'series-grid');
            
            // Add loading indicator
            const loadingDiv = document.createElement('div');
            loadingDiv.id = 'discovery-loading';
            loadingDiv.style.cssText = 'grid-column:1/-1;text-align:center;padding:30px;';
            loadingDiv.innerHTML = '<i class="fa-solid fa-spinner fa-spin" style="font-size:24px;color:var(--primary);"></i><br><p style="margin-top:10px;color:#888;font-size:13px;">' + (LANG === 'fa' ? 'در حال بارگذاری...' : 'Loading...') + '</p>';
            container.appendChild(loadingDiv);
            
            discPage++;
            runDiscovery(container);
        }

        async function runDiscovery(container) {
            {
                const letterFilter = window.currentLetterFilter;
                const hasLetterFilter = letterFilter && letterFilter !== '';
                
                // If letter filter is active, we need to fetch MORE pages to get enough results
                const pagesToFetch = hasLetterFilter ? 20 : 1;
                let allResults = [];
                
                for (let p = 0; p < pagesToFetch; p++) {
                    const currentPage = discPage + p;
                    let d = await getData(`${discQuery}&page=${currentPage}`);
                    
                    // If no results on page 1, retry with relaxed vote_count for sparse countries/genres
                    if ((!d || !d.results || d.results.length === 0) && currentPage === 1) {
                        const relaxedQ = discQuery.replace('vote_count.gte=10', 'vote_count.gte=1');
                        d = await getData(`${relaxedQ}&page=${currentPage}`);
                    }
                    
                    if (d && d.results && d.results.length > 0) {
                        allResults = allResults.concat(d.results);
                    } else if (currentPage === 1) {
                        // No results at all
                        break;
                    }
                    
                    // Small delay to avoid rate limiting
                    if (p > 0 && p % 5 === 0) {
                        await new Promise(r => setTimeout(r, 100));
                    }
                }
                
                // Remove loading indicator
                const loadingEl = document.getElementById('discovery-loading');
                if (loadingEl) loadingEl.remove();
                
                if (allResults.length > 0) {
                    // Apply letter filter if active
                    let filteredResults = allResults;
                    if (hasLetterFilter) {
                        filteredResults = allResults.filter(m => {
                            const title = (m.title || m.name || '').trim();
                            return matchesLetterFilter(title, letterFilter);
                        });
                    }
                    
                    // Remove duplicates using BOTH the results set AND the global shown IDs
                    const seen = new Set();
                    filteredResults = filteredResults.filter(m => {
                        if (seen.has(m.id) || discShownIds.has(m.id)) return false;
                        seen.add(m.id);
                        discShownIds.add(m.id); // Add to global set
                        return true;
                    });
                    
                    // Apply random sort if enabled, otherwise sort by rating
                    let sorted;
                    if (window.useRandomSort) {
                        // Fisher-Yates shuffle for truly random order
                        sorted = filteredResults.slice();
                        for (let i = sorted.length - 1; i > 0; i--) {
                            const j = Math.floor(Math.random() * (i + 1));
                            [sorted[i], sorted[j]] = [sorted[j], sorted[i]];
                        }
                    } else {
                        // Sort: items with no rating (NR) go to the very bottom
                        sorted = filteredResults.slice().sort((a, b) => {
                            const aHasRating = a.vote_average && a.vote_average > 0 && a.vote_count && a.vote_count >= 10;
                            const bHasRating = b.vote_average && b.vote_average > 0 && b.vote_count && b.vote_count >= 10;
                            if (aHasRating && !bHasRating) return -1;
                            if (!aHasRating && bHasRating) return 1;
                            return 0;
                        });
                    }
                    
                    const prevCount = container.children.length;
                    
                    // Show 18 items
                    const itemsToShow = sorted.slice(0, 18);
                    
                    itemsToShow.forEach(m => {
                        if (discType === 'tv' && isTVShowExcluded(m)) return;
                        container.innerHTML += makeCard(m, discType);
                    });
                    
                    if (container.children.length === prevCount && discPage === 1) {
                        container.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px 20px;color:#666;"><i class="fa-solid fa-film" style="font-size:40px;margin-bottom:15px;display:block;"></i><p>${LANG === 'fa' ? 'نتیجه‌ای یافت نشد. فیلترها را تغییر دهید.' : 'No results found. Try different filters.'}</p></div>`;
                    }
                } else if (discPage === 1) {
                    container.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px 20px;color:#666;"><i class="fa-solid fa-film" style="font-size:40px;margin-bottom:15px;display:block;"></i><p>${LANG === 'fa' ? 'نتیجه‌ای یافت نشد. فیلترها را تغییر دهید.' : 'No results found. Try different filters.'}</p></div>`;
                }
            }
        }

        async function runDefaultDiscovery(container) {
            const TARGET = 18; // items per load
            const letterFilter = window.currentLetterFilter;
            const hasLetterFilter = letterFilter && letterFilter !== '';
            let allCollected = []; // Collect all items first for random sort

            // --- Collect items from both phases ---
            
            // Phase 1: Priority items
            if (!discDefaultPriorityDone && discDefaultPriorityIds.length > 0) {
                while (discDefaultPriorityIndex < discDefaultPriorityIds.length && allCollected.length < TARGET * 3) {
                    const tmdbId = discDefaultPriorityIds[discDefaultPriorityIndex];
                    discDefaultPriorityIndex++;
                    
                    if (discDefaultSeenIds.has(tmdbId) || discShownIds.has(parseInt(tmdbId))) continue;
                    
                    discDefaultSeenIds.add(tmdbId);
                    try {
                        const d = await getData(`${discType}/${tmdbId}`);
                        if (d && d.id && d.poster_path) {
                            if (discType === 'tv' && isTVShowExcluded(d)) continue;
                            
                            const title = (d.title || d.name || '').trim();
                            if (hasLetterFilter && !matchesLetterFilter(title, letterFilter)) {
                                continue;
                            }
                            
                            allCollected.push(d);
                        }
                    } catch(e) {}
                    if (allCollected.length % 5 === 0) await new Promise(r => setTimeout(r, 50));
                }
                if (discDefaultPriorityIndex >= discDefaultPriorityIds.length) {
                    discDefaultPriorityDone = true;
                }
            } else if (!discDefaultPriorityDone) {
                discDefaultPriorityDone = true;
            }

            // Phase 2: Normal discover pages
            const maxPages = hasLetterFilter ? 30 : 10;
            let pageAttempts = 0;
            
            while (allCollected.length < TARGET * 3 && pageAttempts < maxPages) {
                pageAttempts++;
                const d = await getData(`${discQuery}&page=${discPage}`);
                if (!d || !d.results || d.results.length === 0) {
                    discPage++;
                    continue;
                }
                
                for (const m of d.results) {
                    const idStr = String(m.id);
                    
                    if (discDefaultSeenIds.has(idStr) || discShownIds.has(m.id)) continue;
                    if (discType === 'tv' && isTVShowExcluded(m)) continue;
                    
                    const title = (m.title || m.name || '').trim();
                    if (hasLetterFilter && !matchesLetterFilter(title, letterFilter)) {
                        continue;
                    }
                    
                    discDefaultSeenIds.add(idStr);
                    allCollected.push(m);
                    if (allCollected.length >= TARGET * 3) break;
                }
                
                discPage++;
                
                if (pageAttempts % 5 === 0) {
                    await new Promise(r => setTimeout(r, 100));
                }
            }
            
            // Remove loading indicator
            const loadingEl = document.getElementById('discovery-loading');
            if (loadingEl) loadingEl.remove();
            
            // Apply random sort if enabled
            if (window.useRandomSort && allCollected.length > 0) {
                // Fisher-Yates shuffle
                for (let i = allCollected.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [allCollected[i], allCollected[j]] = [allCollected[j], allCollected[i]];
                }
            }
            
            // Take TARGET items and render
            const itemsToShow = allCollected.slice(0, TARGET);
            itemsToShow.forEach(m => {
                discShownIds.add(m.id);
                container.innerHTML += makeCard(m, discType);
            });
            
            // If no results
            if (itemsToShow.length === 0 && container.children.length === 0) {
                container.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px 20px;color:#666;"><i class="fa-solid fa-film" style="font-size:40px;margin-bottom:15px;display:block;"></i><p>${LANG === 'fa' ? 'نتیجه‌ای یافت نشد. فیلترها را تغییر دهید.' : 'No results found. Try different filters.'}</p></div>`;
            }
        }
        
        // --- SEARCH / TRENDING ACTORS (LEGENDS) ---
        async function loadTrendingActors() {
            const d = await getData('person/popular');
            const maleEl = document.getElementById('trend-male');
            const femaleEl = document.getElementById('trend-female');
            const directorEl = document.getElementById('trend-director');
            
            maleEl.innerHTML = ''; femaleEl.innerHTML = ''; directorEl.innerHTML = '';
            
            if (d.results) {
                const males = d.results.filter(p => p.gender === 2 && p.profile_path);
                const females = d.results.filter(p => p.gender === 1 && p.profile_path);
                
                males.slice(0, 10).forEach(p => maleEl.innerHTML += makePersonCard(p));
                females.slice(0, 10).forEach(p => femaleEl.innerHTML += makePersonCard(p));
                
                const famousDirectors = [
                    525, 138, 1032, 488, 7467, 2710, 608, 2636, 28974, 1702
                ];
                const promises = famousDirectors.map(id => getData(`person/${id}`));
                const directors = await Promise.all(promises);
                directors.forEach(p => {
                    if(p && p.profile_path) {
                        p.known_for_department = 'Directing'; 
                        directorEl.innerHTML += makePersonCard(p);
                    }
                });
            }
            // Load companies section
            loadCompaniesSection();
            loadFeaturedCollections();
        }
        // Search History Management
        const SEARCH_HISTORY_KEY = 'search_history';
        let searchHistory = JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY)) || [];
        let searchTimeout = null;
        
        function saveSearchHistory(query) {
            if (!query || query.trim().length < 2) return;
            
            // Remove if already exists
            searchHistory = searchHistory.filter(h => h.toLowerCase() !== query.toLowerCase());
            
            // Add to beginning
            searchHistory.unshift(query.trim());
            
            // Keep only last 10
            searchHistory = searchHistory.slice(0, 10);
            
            // Save to localStorage
            localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(searchHistory));
        }
        
        function renderSearchHistory() {
            const dropdown = document.getElementById('search-history-dropdown');
            const input = document.getElementById('search-input');
            
            if (searchHistory.length === 0 || input.value.trim().length > 0) {
                dropdown.style.display = 'none';
                return;
            }
            
            let html = '';
            searchHistory.forEach(term => {
                html += `
                    <div class="search-history-item" onclick="selectFromHistory('${term.replace(/'/g, "\\'")}')">
                        <i class="fa-solid fa-clock-rotate-left search-history-icon"></i>
                        <span class="search-history-text">${term}</span>
                    </div>
                `;
            });
            
            html += `
                <div class="search-history-clear" onclick="clearSearchHistory()">
                    <i class="fa-solid fa-trash"></i> ${LANG === 'fa' ? 'پاک کردن تاریخچه' : 'Clear History'}
                </div>
            `;
            
            dropdown.innerHTML = html;
            dropdown.style.display = 'block';
        }
        
        function selectFromHistory(term) {
            const input = document.getElementById('search-input');
            input.value = term;
            document.getElementById('search-history-dropdown').style.display = 'none';
            doLiveSearch(term);
        }
        
        function clearSearchHistory() {
            searchHistory = [];
            localStorage.removeItem(SEARCH_HISTORY_KEY);
            document.getElementById('search-history-dropdown').style.display = 'none';
        }
        
        // Show history when input is focused and empty
        document.addEventListener('DOMContentLoaded', function() {
            const searchInput = document.getElementById('search-input');
            if (searchInput) {
                searchInput.addEventListener('focus', function() {
                    if (this.value.trim().length === 0) {
                        renderSearchHistory();
                    }
                });
                
                searchInput.addEventListener('blur', function() {
                    // Delay to allow clicking on history items
                    setTimeout(() => {
                        document.getElementById('search-history-dropdown').style.display = 'none';
                    }, 200);
                });
            }
        });
        
        async function doLiveSearch(q) {
            // Clear previous timeout
            if (searchTimeout) clearTimeout(searchTimeout);
            
            const msgEl = document.getElementById('search-message');
            const c = document.getElementById('search-results');
            const resultsSection = document.getElementById('search-results-section');
            const defaultSections = document.getElementById('default-sections');
            const historyDropdown = document.getElementById('search-history-dropdown');
            
            // Hide history dropdown when typing
            historyDropdown.style.display = 'none';
            
            // If empty, show default sections
            if(q.trim().length === 0) {
                resultsSection.style.display = 'none';
                defaultSections.style.display = 'block';
                c.innerHTML = '';
                msgEl.style.display = 'none';
                return;
            }
            
            // Show loading
            c.innerHTML = '';
            msgEl.style.display = 'block';
            msgEl.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> ' + TEXTS[LANG].searchPh;
            resultsSection.style.display = 'block';
            defaultSections.style.display = 'none';
            
            // Debounce search
            searchTimeout = setTimeout(async () => {
                // Save to history only for searches with 2+ characters
                if (q.trim().length >= 2) {
                    saveSearchHistory(q.trim());
                }
                
                // Search with appropriate language - also search original language query
                const d = await getData(`search/multi?query=${encodeURIComponent(q)}`);
                // Also search in original language for non-Latin queries
                let dOrig = null;
                const hasNonLatin = /[^\x00-\x7F\u0600-\u06FF\u0660-\u0669 ]/.test(q);
                if (hasNonLatin) {
                    dOrig = await getData(`search/multi?query=${encodeURIComponent(q)}&language=en-US`);
                }
                
                c.innerHTML = '';
                
                // Merge dOrig results if available
                let allResults = (d.results || []);
                if (dOrig && dOrig.results) {
                    const existingIds = new Set(allResults.map(r => r.id));
                    dOrig.results.forEach(r => { if (!existingIds.has(r.id)) allResults.push(r); });
                }
                
                if (allResults.length > 0) {
                    // Sort results by smart relevance + popularity
                    const sorted = allResults.slice().sort((a, b) => {
                        const aTitle = (a.title || a.name || '').toLowerCase();
                        const bTitle = (b.title || b.name || '').toLowerCase();
                        const query = q.toLowerCase();
                        
                        // Smart score
                        const aSmartScore = smartSearchScore(aTitle, q);
                        const bSmartScore = smartSearchScore(bTitle, q);
                        if (aSmartScore !== bSmartScore) return bSmartScore - aSmartScore;
                        
                        // By popularity + vote_count weight
                        const aWeight = (a.popularity || 0) + (a.vote_count || 0) * 0.3;
                        const bWeight = (b.popularity || 0) + (b.vote_count || 0) * 0.3;
                        return bWeight - aWeight;
                    });
                    
                    // Render sorted results
                    sorted.forEach(m => {
                        // Fix media_type detection for person search
                        var mt = m.media_type;
                        if (!mt) {
                            if (modernSearchType === 'person') mt = 'person';
                            else if (m.first_air_date) mt = 'tv';
                            else if (m.profile_path && !m.poster_path) mt = 'person';
                            else mt = 'movie';
                        }
                        // Filter based on active search tab
                        if (modernSearchType === 'person' && mt !== 'person') return;
                        if (modernSearchType === 'movie' && mt !== 'movie') return;
                        if (modernSearchType === 'tv' && mt !== 'tv') return;
                        
                        if(mt === 'person') {
                            if(m.profile_path) {
                                c.innerHTML += makePersonCard(m);
                            }
                        } else if (mt === 'movie' || mt === 'tv') {
                            c.innerHTML += makeCard(m, mt);
                        }
                    });
                    msgEl.style.display = 'none';
                } else {
                    msgEl.innerText = TEXTS[LANG].noRes;
                    msgEl.style.display = 'block';
                }
            }, 300); // 300ms debounce
        }
        
        // =================== MODERN SEARCH ===================
        var modernSearchType = 'all';
        var modernSearchTimeout = null;
        var modernDropdownVisible = false;

        function setSearchType(type, btn) {
            modernSearchType = type;
            document.querySelectorAll('#search-type-tabs button').forEach(function(b) {
                b.style.background = '#1a1a1a';
                b.style.color = '#aaa';
                b.style.borderColor = '#333';
            });
            btn.style.background = 'var(--primary)';
            btn.style.color = 'white';
            btn.style.borderColor = 'rgba(229,9,20,0.6)';
            var v = document.getElementById('search-input').value.trim();
            if (v.length >= 1) doModernSearch(v);
        }

        function showSearchDropdown() {
            modernDropdownVisible = true;
            var v = document.getElementById('search-input').value.trim();
            if (v.length === 0) {
                // Show search history
                showSearchHistoryInDropdown();
            }
        }

        function hideSearchDropdownDelayed() {
            setTimeout(function() {
                var dropdown = document.getElementById('search-live-dropdown');
                if (dropdown) dropdown.style.display = 'none';
                modernDropdownVisible = false;
            }, 200);
        }

        function showSearchHistoryInDropdown() {
            var history = getSearchHistory();
            var dropdown = document.getElementById('search-live-dropdown');
            if (!dropdown) return;
            if (history.length === 0) { dropdown.style.display = 'none'; return; }
            var isFA = LANG === 'fa';
            var html = '<div style="padding:10px 14px;font-size:11px;color:#666;border-bottom:1px solid #2a2a2a;">' + (isFA ? '🕐 جستجوهای اخیر' : '🕐 Recent Searches') + '</div>';
            history.slice(0, 5).forEach(function(h) {
                html += '<div onclick="selectSearchHistory(\'' + h.replace(/'/g,'\\\'') + '\')" style="padding:12px 14px;display:flex;align-items:center;gap:10px;border-bottom:1px solid #222;cursor:pointer;transition:background 0.1s;" onmouseenter="this.style.background=\'#222\'" onmouseleave="this.style.background=\'transparent\'">'
                    + '<i class="fa-solid fa-clock" style="color:#555;font-size:13px;flex-shrink:0;"></i>'
                    + '<span style="flex:1;color:#ccc;font-size:13px;">' + h + '</span>'
                    + '</div>';
            });
            html += '<div onclick="clearSearchHistory()" style="padding:10px 14px;text-align:center;color:#555;font-size:11px;cursor:pointer;" onmouseenter="this.style.color=\'#E50914\'" onmouseleave="this.style.color=\'#555\'">' + (isFA ? 'پاک کردن تاریخچه' : 'Clear History') + '</div>';
            dropdown.innerHTML = html;
            dropdown.style.display = 'block';
        }

        function selectSearchHistory(q) {
            var input = document.getElementById('search-input');
            input.value = q;
            doModernSearch(q);
        }

        function clearModernSearch() {
            var input = document.getElementById('search-input');
            input.value = '';
            document.getElementById('search-clear-btn').style.display = 'none';
            document.getElementById('search-live-dropdown').style.display = 'none';
            document.getElementById('search-results-section').style.display = 'none';
            document.getElementById('default-sections').style.display = 'block';
        }

        // ---- SMART SEARCH BOOST TABLE ----
        // Maps short/partial queries to well-known titles for intelligent ordering
        var SMART_SEARCH_BOOSTS = [
            {q:'brea', title:'Breaking Bad', score:100},
            {q:'break', title:'Breaking Bad', score:100},
            {q:'game', title:'Game of Thrones', score:95},
            {q:'got', title:'Game of Thrones', score:95},
            {q:'walk', title:'The Walking Dead', score:90},
            {q:'stran', title:'Stranger Things', score:90},
            {q:'friend', title:'Friends', score:90},
            {q:'narco', title:'Narcos', score:90},
            {q:'ozark', title:'Ozark', score:90},
            {q:'sherlock', title:'Sherlock', score:90},
            {q:'witcher', title:'The Witcher', score:90},
            {q:'mandal', title:'The Mandalorian', score:90},
            {q:'dark', title:'Dark', score:85},
            {q:'money', title:'Money Heist', score:85},
            {q:'squid', title:'Squid Game', score:95},
            {q:'avatar', title:'Avatar', score:90},
            {q:'oppenheimer', title:'Oppenheimer', score:95},
            {q:'barbie', title:'Barbie', score:90},
            {q:'inter', title:'Interstellar', score:90},
            {q:'inception', title:'Inception', score:95},
            {q:'matrix', title:'The Matrix', score:95},
            {q:'godfather', title:'The Godfather', score:95},
            {q:'shawshank', title:'The Shawshank Redemption', score:95},
            {q:'schindler', title:"Schindler's List", score:95},
            {q:'pulp', title:'Pulp Fiction', score:95},
            {q:'fight', title:'Fight Club', score:90},
            {q:'forrest', title:'Forrest Gump', score:95},
            {q:'goodfellas', title:'Goodfellas', score:95},
            {q:'silence', title:'The Silence of the Lambs', score:90},
            {q:'lord', title:'The Lord of the Rings', score:90},
            {q:'back to', title:'Back to the Future', score:90},
            {q:'joker', title:'Joker', score:90},
            {q:'parasite', title:'Parasite', score:95},
            {q:'wanda', title:'WandaVision', score:80},
            {q:'loki', title:'Loki', score:80},
            {q:'better', title:'Better Call Saul', score:85},
            {q:'sopranos', title:'The Sopranos', score:90},
            {q:'wire', title:'The Wire', score:85},
            {q:'peaky', title:'Peaky Blinders', score:90},
        ];
        
        function smartSearchScore(title, query) {
            var qLow = query.toLowerCase();
            var tLow = (title||'').toLowerCase();
            // Exact match
            if (tLow === qLow) return 1000;
            // Starts with
            if (tLow.startsWith(qLow)) return 500;
            // Check boost table
            for (var i=0; i<SMART_SEARCH_BOOSTS.length; i++) {
                var b = SMART_SEARCH_BOOSTS[i];
                if (qLow.startsWith(b.q) && tLow.includes(b.title.toLowerCase())) return b.score;
                if (b.q.startsWith(qLow) && qLow.length >= 3 && tLow.includes(b.title.toLowerCase())) return b.score - 10;
            }
            return 0;
        }

        async function doModernSearch(q) {
            if (modernSearchTimeout) clearTimeout(modernSearchTimeout);
            
            var clearBtn = document.getElementById('search-clear-btn');
            if (clearBtn) clearBtn.style.display = q.length > 0 ? 'block' : 'none';
            
            var dropdown = document.getElementById('search-live-dropdown');
            var resultsSection = document.getElementById('search-results-section');
            var defaultSections = document.getElementById('default-sections');
            
            if (q.trim().length === 0) {
                if (dropdown) dropdown.style.display = 'none';
                resultsSection.style.display = 'none';
                defaultSections.style.display = 'block';
                showSearchHistoryInDropdown();
                return;
            }
            
            defaultSections.style.display = 'none';
            
            // Show loading in dropdown
            if (dropdown) {
                dropdown.style.display = 'block';
                dropdown.innerHTML = '<div style="padding:20px;text-align:center;color:#555;"><i class="fa-solid fa-spinner fa-spin" style="color:var(--primary);font-size:16px;"></i></div>';
            }
            
            modernSearchTimeout = setTimeout(async function() {
                if (q.trim().length >= 2) saveSearchHistory(q.trim());
                
                try {
                    var typeParam = modernSearchType !== 'all' ? ('search/' + modernSearchType) : 'search/multi';
                    var d = await getData(typeParam + '?query=' + encodeURIComponent(q));
                    var allResults = (d && d.results) ? d.results : [];
                    
                    // Also search in English if non-Latin
                    if (modernSearchType === 'all' && /[^\x00-\x7F\u0600-\u06FF]/.test(q)) {
                        try {
                            var dEn = await getData('search/multi?query=' + encodeURIComponent(q) + '&language=en-US');
                            if (dEn && dEn.results) {
                                var existingIds = new Set(allResults.map(function(r) { return r.id; }));
                                dEn.results.forEach(function(r) { if (!existingIds.has(r.id)) allResults.push(r); });
                            }
                        } catch(e2) {}
                    }
                    
                    // Sort by smart relevance + popularity
                    var qLow = q.toLowerCase();
                    allResults.sort(function(a, b) {
                        var aT = (a.title || a.name || '').toLowerCase();
                        var bT = (b.title || b.name || '').toLowerCase();
                        var aSmartScore = smartSearchScore(aT, q);
                        var bSmartScore = smartSearchScore(bT, q);
                        if (aSmartScore !== bSmartScore) return bSmartScore - aSmartScore;
                        // Known important titles get big boost
                        var aPop = (a.popularity || 0);
                        var bPop = (b.popularity || 0);
                        var aVotes = (a.vote_count || 0);
                        var bVotes = (b.vote_count || 0);
                        // Combined relevance: popularity + vote_count weight
                        var aWeight = aPop + aVotes * 0.5;
                        var bWeight = bPop + bVotes * 0.5;
                        // For very short queries (1-2 chars), strongly penalize obscure results
                        if (q.trim().length <= 2) {
                            if (aVotes < 500 && bVotes >= 500) return 1;
                            if (bVotes < 500 && aVotes >= 500) return -1;
                        }
                        return bWeight - aWeight;
                    });
                    
                    // Filter: for short queries, drop very obscure items from inline dropdown
                    var filteredResults = allResults;
                    if (q.trim().length <= 2) {
                        var popular = allResults.filter(function(r){ return (r.vote_count||0) >= 500 || (r.popularity||0) >= 10; });
                        filteredResults = popular.length > 0 ? popular : allResults.slice(0,5);
                    }
                    
                    renderModernDropdown(filteredResults.slice(0, 10), q, allResults);
                } catch(e) {
                    if (dropdown) dropdown.innerHTML = '<div style="padding:20px;text-align:center;color:#555;font-size:13px;">خطا در جستجو</div>';
                }
            }, 250);
        }

        function renderModernDropdown(results, query, allResults) {
            var dropdown = document.getElementById('search-live-dropdown');
            if (!dropdown) return;
            var isFA = LANG === 'fa';
            
            // Filter results based on active search type tab
            // When searching with search/person, results don't have media_type — force 'person'
            results = results.map(function(item) {
                var mt = item.media_type;
                if (!mt) {
                    if (modernSearchType === 'person') mt = 'person';
                    else if (item.first_air_date) mt = 'tv';
                    else if (item.profile_path && !item.poster_path) mt = 'person';
                    else mt = 'movie';
                    item = Object.assign({}, item, {media_type: mt});
                }
                return item;
            });
            
            if (modernSearchType !== 'all') {
                results = results.filter(function(item) {
                    var mt = item.media_type;
                    if (modernSearchType === 'person') return mt === 'person';
                    if (modernSearchType === 'movie') return mt === 'movie';
                    if (modernSearchType === 'tv') return mt === 'tv';
                    return true;
                });
            }
            
            if (!results || results.length === 0) {
                dropdown.innerHTML = '<div style="padding:24px;text-align:center;color:#555;font-size:13px;">'
                    + '<i class="fa-solid fa-search" style="font-size:24px;display:block;margin-bottom:10px;color:#333;"></i>'
                    + (isFA ? 'نتیجه‌ای یافت نشد' : 'No results found')
                    + '</div>';
                return;
            }
            
            var html = '';
            
            results.forEach(function(item) {
                var mediaType = item.media_type || (item.first_air_date ? 'tv' : (item.profile_path && !item.poster_path ? 'person' : 'movie'));
                var title = item.title || item.name || '';
                var originalTitle = item.original_title || item.original_name || '';
                var year = ((item.release_date || item.first_air_date || '')).split('-')[0];
                var poster = item.poster_path ? ('https://family-night-api.alirezadoe8.workers.dev/img/w92' + item.poster_path) : (item.profile_path ? ('https://family-night-api.alirezadoe8.workers.dev/img/w92' + item.profile_path) : '');
                var rating = item.vote_average ? item.vote_average.toFixed(1) : '';
                var runtime = '';
                
                // Type label - for persons, show actual role
                var typeLabel = '';
                var typeColor = '';
                var typeIcon = '';
                if (mediaType === 'movie') {
                    typeLabel = isFA ? 'فیلم' : 'Movie';
                    typeColor = '#E50914';
                    typeIcon = '🎬';
                } else if (mediaType === 'tv') {
                    typeLabel = isFA ? 'سریال' : 'Series';
                    typeColor = '#0099ff';
                    typeIcon = '📺';
                } else if (mediaType === 'person') {
                    // Determine if actor, director, or both
                    var dept = item.known_for_department || '';
                    var isActor = dept === 'Acting' || (item.known_for && item.known_for.length > 0 && !dept);
                    var isDirector = dept === 'Directing';
                    if (isDirector) {
                        typeLabel = isFA ? 'کارگردان' : 'Director';
                    } else if (isActor && isDirector) {
                        typeLabel = isFA ? 'بازیگر/کارگردان' : 'Actor/Director';
                    } else {
                        // Check if they appear in known_for as director
                        var knownDepts = (item.known_for || []).map(function(k){ return k.media_type; });
                        typeLabel = isFA ? 'بازیگر/کارگردان' : 'Actor/Director';
                        if (dept === 'Acting') typeLabel = isFA ? 'بازیگر' : 'Actor';
                        else if (dept === 'Directing') typeLabel = isFA ? 'کارگردان' : 'Director';
                        else if (dept === 'Production') typeLabel = isFA ? 'تهیه‌کننده' : 'Producer';
                        else typeLabel = isFA ? 'بازیگر/کارگردان' : 'Actor/Director';
                    }
                    typeColor = '#f5c518';
                    typeIcon = '👤';
                }
                
                // Genre (use first genre id mapping)
                var genreNames = {'28':'Action','12':'Adventure','16':'Animation','35':'Comedy','80':'Crime','99':'Documentary','18':'Drama','14':'Fantasy','27':'Horror','10749':'Romance','878':'Sci-Fi','53':'Thriller','10752':'War','37':'Western'};
                var genreNamesFA = {'28':'اکشن','12':'ماجراجویی','16':'انیمیشن','35':'کمدی','80':'جنایی','99':'مستند','18':'درام','14':'فانتزی','27':'ترسناک','10749':'عاشقانه','878':'علمی‌تخیلی','53':'هیجانی','10752':'جنگی','37':'وسترن'};
                var genreLabels = isFA ? genreNamesFA : genreNames;
                var genres = '';
                if (item.genre_ids && item.genre_ids.length > 0) {
                    genres = item.genre_ids.slice(0, 2).map(function(g) { return genreLabels[g] || ''; }).filter(Boolean).join(' · ');
                }
                
                var onclick = mediaType === 'person' 
                    ? 'document.getElementById(\'search-live-dropdown\').style.display=\'none\';openDetail(' + item.id + ',\'person_works\')'
                    : 'document.getElementById(\'search-live-dropdown\').style.display=\'none\';openDetail(' + item.id + ',\'' + mediaType + '\')';
                
                // Person shows differently (circular avatar)
                var posterHtml;
                if (mediaType === 'person') {
                    posterHtml = '<div style="flex-shrink:0;width:46px;height:46px;border-radius:50%;overflow:hidden;background:#1e1e1e;border:2px solid ' + typeColor + '44;">'
                        + (poster ? '<img src="' + poster + '" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.display=\'none\'">' : '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:20px;">' + typeIcon + '</div>')
                        + '</div>';
                } else {
                    posterHtml = '<div style="flex-shrink:0;width:46px;height:66px;border-radius:7px;overflow:hidden;background:#1e1e1e;position:relative;">'
                        + (poster ? '<img src="' + poster + '" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.display=\'none\'">' : '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:20px;">' + typeIcon + '</div>')
                        + '</div>';
                }
                
                html += '<div onclick="' + onclick + '" style="display:flex;align-items:center;gap:12px;padding:11px 14px;border-bottom:1px solid #222;cursor:pointer;transition:background 0.1s;" onmouseenter="this.style.background=\'#222\'" onmouseleave="this.style.background=\'transparent\'">'
                    // Poster/Avatar
                    + posterHtml
                    // Info
                    + '<div style="flex:1;min-width:0;">'
                    + '<div style="display:flex;align-items:flex-start;gap:6px;margin-bottom:3px;">'
                    + '<div style="font-size:14px;color:#eee;font-weight:600;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + title + '</div>'
                    + '</div>'
                    // Secondary title (if different from primary)
                    + (originalTitle && originalTitle !== title ? '<div style="font-size:11px;color:#666;margin-bottom:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + originalTitle + '</div>' : '')
                    // Meta row
                    + '<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">'
                    + '<span style="font-size:10px;font-weight:700;color:' + typeColor + ';background:' + typeColor + '22;padding:2px 7px;border-radius:4px;">' + typeLabel + '</span>'
                    + (year && mediaType !== 'person' ? '<span style="font-size:10px;color:#888;">' + year + '</span>' : '')
                    + (rating && mediaType !== 'person' ? '<span style="display:flex;align-items:center;gap:3px;font-size:10px;color:#f5c518;font-weight:700;"><span style="font-size:8px;font-weight:800;background:#f5c518;color:#000;padding:1px 3px;border-radius:2px;">IMDb</span>' + rating + '</span>' : '')
                    + (genres ? '<span style="font-size:10px;color:#666;">' + genres + '</span>' : '')
                    + '</div>'
                    + '</div>'
                    // Arrow
                    + '<i class="fa-solid fa-chevron-left" style="color:#444;font-size:11px;flex-shrink:0;"></i>'
                    + '</div>';
            });
            
            // "See all results" button
            html += '<div onclick="showAllSearchResults(\'' + query.replace(/'/g,'\\\'') + '\')" style="padding:12px;text-align:center;color:var(--primary);font-size:13px;font-weight:700;cursor:pointer;border-top:1px solid #2a2a2a;" onmouseenter="this.style.background=\'rgba(229,9,20,0.05)\'" onmouseleave="this.style.background=\'transparent\'">'
                + (isFA ? '🔍 نمایش همه نتایج' : '🔍 View All Results')
                + '</div>';
            
            dropdown.innerHTML = html;
            dropdown.style.display = 'block';
        }

        function showAllSearchResults(q) {
            var dropdown = document.getElementById('search-live-dropdown');
            if (dropdown) dropdown.style.display = 'none';
            doLiveSearch(q);
        }

        // Also hook doLiveSearch to work from search input for backwards compat
        // =================== END MODERN SEARCH ===================

        // --- GENERIC GRID ---
        function openGenericGrid(type, q, title) {
            document.getElementById('modal').style.display='none'; 
            document.getElementById('person-works-modal').style.display='none';
            document.getElementById('generic-grid-page').style.display = 'flex';
            document.getElementById('gg-title').innerText = title;
            document.getElementById('gg-content').innerHTML = '';
            genericPage = 1; genericQuery = q; genericType = type; genericSortMode = 'default';
            const sortBar = document.getElementById('gg-sort-bar');
            const sortSelect = document.getElementById('gg-sort-select');
            const sortLabel = document.getElementById('gg-sort-label');
            if (sortSelect) {
                sortSelect.value = 'default';
                sortSelect.options[0].text = LANG === 'fa' ? 'ترتیب پیش‌فرض همین دسته‌بندی' : 'Default category order';
                sortSelect.options[1].text = LANG === 'fa' ? 'جدیدترین' : 'Newest';
                sortSelect.options[2].text = LANG === 'fa' ? 'قدیمی‌ترین' : 'Oldest';
                sortSelect.options[3].text = LANG === 'fa' ? 'بیشترین رأی' : 'Most voted';
            }
            if (sortLabel) sortLabel.innerText = LANG === 'fa' ? 'مرتب‌سازی' : 'Sort';
            if (sortBar) sortBar.style.display = (type === 'director_list' || type === 'actor_male_list' || type === 'actor_female_list') ? 'none' : 'flex';
            const personSearchBar = document.getElementById('gg-person-search-bar');
            const personSearchInput = document.getElementById('gg-person-search-input');
            const isPersonList = (type === 'director_list' || type === 'actor_male_list' || type === 'actor_female_list');
            if (personSearchBar) personSearchBar.style.display = isPersonList ? 'block' : 'none';
            if (personSearchInput) {
                personSearchInput.value = '';
                personSearchInput.placeholder = getPersonSearchPlaceholder(type);
            }
            const clearBtn = document.getElementById('gg-person-search-clear');
            if (clearBtn) clearBtn.style.display = 'none';
            genericPersonSearchQuery = '';
            
            if (isPersonList) {
                window.genericPersonSeenIds = new Set();
                window.seenDirectorIds = new Set();
                genericContentType = 'person_list';
                document.getElementById('gg-content').className = 'person-grid-container';
            } else if (q === 'curator_picks') {
                genericContentType = 'curator';
                document.getElementById('gg-content').className = 'grid-container';
            } else {
                genericContentType = 'media_list';
                document.getElementById('gg-content').className = 'grid-container';
            }
            if (q === 'custom:adult') applyAdultGridGate();
            loadGenericData();
            document.getElementById('btn-more-g').style.display = 'block';
        }
        const DIRECTOR_PRIORITY_IDS = [525, 138, 1032, 488, 240, 7467, 578, 2710, 137427, 2636, 21684, 10930, 5602, 4762, 5655, 12453, 1243, 1152, 9341, 11401, 223, 16767, 2045, 11218, 1776, 1204, 11614, 608, 10099, 2303, 3325, 4483, 1223, 1769, 1466, 6773, 8643, 6548, 8556, 5363, 9168, 15217, 108, 3110, 533, 5953, 8502, 1532, 4500, 22970];
        const PERSON_FA_TO_EN = {
            'جیمز':'James','کریستوفر':'Christopher','نولان':'Nolan','لئوناردو':'Leonardo','دی کاپریو':'DiCaprio','تام':'Tom','برد':'Brad','پیت':'Pitt','جانی':'Johnny','دپ':'Depp','کریستین':'Christian','بیل':'Bale','رابرت':'Robert','آل':'Al','پاچینو':'Pacino','دنزل':'Denzel','واشنگتن':'Washington','مورگان':'Morgan','فریمن':'Freeman','جکی':'Jackie','چان':'Chan','اسکورسیزی':'Scorsese','اسپیلبرگ':'Spielberg','تارانتینو':'Tarantino','فینچر':'Fincher','کوبریک':'Kubrick','هیچکاک':'Hitchcock','ریدلی':'Ridley','اسکات':'Scott','کامرون':'Cameron','دنی':'Denis','ویلنوو':'Villeneuve','بونگ':'Bong','پارک':'Park','استنلی':'Stanley','مارتین':'Martin','استیون':'Steven','کوئنتین':'Quentin','دیوید':'David','آنجلینا':'Angelina','جولی':'Jolie','اسکارلت':'Scarlett','مارگو':'Margot','رابی':'Robbie','کیت':'Kate','وینسلت':'Winslet','مریل':'Meryl','استریپ':'Streep','اما':'Emma','استون':'Stone','سیدنی':'Sydney','سوئینی':'Sweeney','ناتالی':'Natalie','پورتمن':'Portman'
        };
        function getPersonSearchPlaceholder(type) {
            if (type === 'director_list') return LANG === 'fa' ? 'جستجوی کارگردان... نام فارسی یا انگلیسی' : 'Search directors...';
            if (type === 'actor_female_list') return LANG === 'fa' ? 'جستجوی بازیگر زن... نام فارسی یا انگلیسی' : 'Search actresses...';
            return LANG === 'fa' ? 'جستجوی بازیگر مرد... نام فارسی یا انگلیسی' : 'Search actors...';
        }
        function normalizePersonSearchTerm(q) {
            let out = (q || '').trim();
            Object.keys(PERSON_FA_TO_EN).forEach(k => {
                if (out.includes(k)) out = out.replace(new RegExp(k, 'g'), PERSON_FA_TO_EN[k]);
            });
            return out.trim();
        }
        function personMatchesCurrentList(p, type) {
            if (!p || !p.profile_path) return false;
            if (type === 'actor_male_list') return p.gender === 2;
            if (type === 'actor_female_list') return p.gender === 1;
            if (type === 'director_list') return (p.known_for_department === 'Directing') || ((p.known_for || []).some(x => (x.media_type === 'movie' || x.media_type === 'tv')));
            return true;
        }
        function scorePersonForList(p, type) {
            const pop = Number(p.popularity || 0);
            if (type === 'director_list') {
                const deptBonus = p.known_for_department === 'Directing' ? 1000 : 0;
                const knownScore = (p.known_for || []).reduce((sum, x) => sum + (x.vote_count || 0) * 0.02 + (x.vote_average || 0) * 3, 0);
                return deptBonus + pop + knownScore;
            }
            const trendScore = (p.known_for || []).reduce((sum, x) => sum + (x.popularity || 0) + (x.vote_count || 0) * 0.01, 0);
            return pop + trendScore;
        }
        async function fetchPeoplePages(baseQuery, startPage, pages) {
            let all = [];
            for (let i = 0; i < pages; i++) {
                try {
                    const sep = baseQuery.includes('?') ? '&' : '?';
                    const d = await getData(`${baseQuery}${sep}page=${startPage + i}`);
                    if (d && d.results) all = all.concat(d.results);
                    if (d && d.total_pages && startPage + i >= d.total_pages) break;
                } catch(e) {}
            }
            return all;
        }
        async function loadGenericPeoplePage(isSearch) {
            const container = document.getElementById('gg-content');
            if (!container) return;
            const btn = document.getElementById('btn-more-g');
            if (!window.genericPersonSeenIds) window.genericPersonSeenIds = new Set();
            if (isSearch || genericPersonSearchQuery) {
                await loadGenericPersonSearch(genericPersonSearchQuery || '');
                return;
            }
            const loadingId = 'person-loading-inline';
            if (!document.getElementById(loadingId)) {
                container.insertAdjacentHTML('beforeend', `<div id="${loadingId}" class="person-empty-state"><i class="fa-solid fa-spinner fa-spin" style="font-size:24px;color:var(--primary);display:block;margin-bottom:10px;"></i>${LANG === 'fa' ? 'در حال بارگذاری...' : 'Loading...'}</div>`);
            }
            let collected = [];
            if (genericType === 'director_list') {
                if (genericPage === 1) {
                    const directorDetails = await Promise.all(DIRECTOR_PRIORITY_IDS.map(id => getData(`person/${id}`).catch(()=>null)));
                    collected = collected.concat(directorDetails.filter(Boolean).map(p => ({...p, known_for_department:'Directing'})));
                }
                const startPage = Math.max(1, (genericPage - 1) * 5 + 1);
                let popular = await fetchPeoplePages('person/popular', startPage, 5);
                popular = popular.filter(p => p.known_for_department === 'Directing' || (p.known_for || []).some(k => k.media_type === 'movie' && (k.vote_count || 0) > 1000));
                collected = collected.concat(popular);
            } else {
                const startPage = Math.max(1, (genericPage - 1) * 4 + 1);
                collected = await fetchPeoplePages('person/popular', startPage, 4);
            }
            collected = collected
                .filter(p => personMatchesCurrentList(p, genericType))
                .sort((a,b) => scorePersonForList(b, genericType) - scorePersonForList(a, genericType));
            const unique = [];
            for (const p of collected) {
                if (!window.genericPersonSeenIds.has(p.id)) {
                    window.genericPersonSeenIds.add(p.id);
                    unique.push(p);
                }
            }
            const loading = document.getElementById(loadingId);
            if (loading) loading.remove();
            if (unique.length === 0 && container.children.length === 0) {
                container.innerHTML = `<div class="person-empty-state">${LANG === 'fa' ? 'فعلاً نتیجه‌ای پیدا نشد. دوباره بارگذاری کن.' : 'No people found yet. Try loading more.'}</div>`;
            } else {
                unique.slice(0, 40).forEach(p => container.innerHTML += makePersonCard(p));
            }
            if (btn) btn.style.display = 'block';
        }
        function searchGenericPeople(q) {
            const clearBtn = document.getElementById('gg-person-search-clear');
            if (clearBtn) clearBtn.style.display = q.trim() ? 'block' : 'none';
            if (genericPersonSearchTimer) clearTimeout(genericPersonSearchTimer);
            genericPersonSearchTimer = setTimeout(async () => {
                genericPersonSearchQuery = q.trim();
                genericPage = 1;
                window.genericPersonSeenIds = new Set();
                const container = document.getElementById('gg-content');
                if (container) container.innerHTML = '';
                if (!genericPersonSearchQuery) {
                    loadGenericData();
                    return;
                }
                await loadGenericPersonSearch(genericPersonSearchQuery);
            }, 220);
        }
        function clearGenericPersonSearch() {
            const input = document.getElementById('gg-person-search-input');
            if (input) input.value = '';
            const clearBtn = document.getElementById('gg-person-search-clear');
            if (clearBtn) clearBtn.style.display = 'none';
            genericPersonSearchQuery = '';
            genericPage = 1;
            window.genericPersonSeenIds = new Set();
            const container = document.getElementById('gg-content');
            if (container) container.innerHTML = '';
            loadGenericData();
        }
        async function loadGenericPersonSearch(q) {
            const container = document.getElementById('gg-content');
            const btn = document.getElementById('btn-more-g');
            if (btn) btn.style.display = 'none';
            if (!container) return;
            const normalized = normalizePersonSearchTerm(q);
            container.innerHTML = `<div class="person-empty-state"><i class="fa-solid fa-spinner fa-spin" style="font-size:24px;color:var(--primary);display:block;margin-bottom:10px;"></i>${LANG === 'fa' ? 'در حال جستجو...' : 'Searching...'}</div>`;
            let queries = [q];
            if (normalized && normalized.toLowerCase() !== q.toLowerCase()) queries.push(normalized);
            let all = [];
            for (const term of queries) {
                try {
                    const d1 = await getData(`search/person?query=${encodeURIComponent(term)}&include_adult=false&language=en-US`);
                    if (d1 && d1.results) all = all.concat(d1.results);
                } catch(e) {}
                try {
                    const d2 = await getData(`search/person?query=${encodeURIComponent(term)}&include_adult=false&language=fa-IR`);
                    if (d2 && d2.results) all = all.concat(d2.results);
                } catch(e) {}
            }
            const seen = new Set();
            all = all.filter(p => {
                if (!personMatchesCurrentList(p, genericType)) return false;
                if (seen.has(p.id)) return false;
                seen.add(p.id);
                const n = (p.name || '').toLowerCase();
                const ql = (normalized || q).toLowerCase();
                return !ql || n.includes(ql) || n.includes((q || '').toLowerCase()) || smartSearchScore(n, q) > 0;
            }).sort((a,b) => scorePersonForList(b, genericType) - scorePersonForList(a, genericType));
            container.innerHTML = '';
            if (!all.length) {
                container.innerHTML = `<div class="person-empty-state">${LANG === 'fa' ? 'شخصی با این نام در همین دسته‌بندی پیدا نشد.' : 'No matching person found in this category.'}</div>`;
                return;
            }
            all.slice(0, 60).forEach(p => container.innerHTML += makePersonCard(p));
        }

        function applyGenericSortFilter() {
            const sel = document.getElementById('gg-sort-select');
            genericSortMode = sel ? sel.value : 'default';
            genericPage = 1;
            const container = document.getElementById('gg-content');
            if (container) container.innerHTML = '';
            loadGenericData();
        }
        async function loadMoreGeneric() { 
            genericPage++;
            loadGenericData(); 
        }
        async function loadGenericData() {
            const container = document.getElementById('gg-content');
            if (genericQuery === 'custom:adult') applyAdultGridGate();
            
            if (genericQuery && genericQuery.startsWith('custom:')) {
                const d = await getCustomCategoryResults(genericQuery, genericPage, genericSortMode || 'default');
                if (d && d.results) d.results.forEach(m => {
                    const cardType = genericQuery === 'custom:adult' ? (m.media_type || d.type || genericType) : (d.type || genericType);
                    if (cardType === 'tv' && isTVShowExcluded(m)) return;
                    container.insertAdjacentHTML('beforeend', makeCard(m, cardType));
                });
                document.getElementById('btn-more-g').style.display = (genericPage >= (d.total_pages || 1)) ? 'none' : 'block';
                if (genericQuery === 'custom:adult') applyAdultGridGate();
                return;
            }
            
            // Special handling for Curator's Pick
            if (genericContentType === 'curator') {
                const perPage = 20;

                // ── 'newest' / 'oldest': sort the static title+year list directly.
                // No TMDB resolution is needed to know the year — it's already
                // stored in CURATOR_PICKS — so this is instant, exactly like
                // the default order, and only resolves the current page. ──
                if (genericSortMode === 'newest' || genericSortMode === 'oldest') {
                    const sortedList = [...CURATOR_PICKS].sort((a, b) => {
                        const ay = normalizeCuratorPick(a).year || 0;
                        const by = normalizeCuratorPick(b).year || 0;
                        return genericSortMode === 'newest' ? (by - ay) : (ay - by);
                    });
                    let index = ((genericPage || 1) - 1) * perPage;
                    let added = 0;
                    while (index < sortedList.length && added < perPage) {
                        try {
                            const entry = sortedList[index];
                            const movie = await findCuratorMovie(entry);
                            if (movie && isValidCuratorResolvedMovie(movie, normalizeCuratorPick(entry))) {
                                container.innerHTML += makeCard(movie, 'movie');
                                added++;
                            }
                        } catch(e) {}
                        index++;
                    }
                    document.getElementById('btn-more-g').style.display = (index >= sortedList.length) ? 'none' : 'block';
                    return;
                }

                // ── 'popular' (most voted): genuinely needs vote_count from TMDB,
                // so the full list must be resolved once (cached), then sorted+paginated. ──
                if (genericSortMode === 'popular') {
                    if (!window._curatorFullResolved || window._curatorFullResolvedLang !== LANG) {
                        const loadingId = 'curator-full-loading';
                        if (genericPage === 1 && !document.getElementById(loadingId)) {
                            container.insertAdjacentHTML('beforeend',
                                `<div id="${loadingId}" style="grid-column:1/-1;text-align:center;padding:34px 10px;color:#888;">
                                    <i class="fa-solid fa-spinner fa-spin" style="font-size:22px;margin-bottom:10px;display:block;"></i>
                                    ${LANG === 'fa' ? 'در حال بارگذاری کامل لیست برای مرتب‌سازی...' : 'Loading the full list to sort...'}
                                </div>`);
                        }
                        const resolved = [];
                        const batchSize = 25;
                        for (let i = 0; i < CURATOR_PICKS.length; i += batchSize) {
                            const batch = CURATOR_PICKS.slice(i, i + batchSize);
                            const batchResults = await Promise.all(batch.map(async entry => {
                                try {
                                    const movie = await findCuratorMovie(entry);
                                    if (movie && isValidCuratorResolvedMovie(movie, normalizeCuratorPick(entry))) return movie;
                                } catch(e) {}
                                return null;
                            }));
                            batchResults.forEach(m => { if (m) resolved.push(m); });
                        }
                        window._curatorFullResolved = _uniqById(resolved);
                        window._curatorFullResolvedLang = LANG;
                        const ld = document.getElementById(loadingId);
                        if (ld) ld.remove();
                    }
                    let sorted = [...window._curatorFullResolved];
                    sorted.sort((a,b) => (b.vote_count||0) - (a.vote_count||0));
                    const start = (genericPage - 1) * perPage;
                    const pageItems = sorted.slice(start, start + perPage);
                    pageItems.forEach(m => container.innerHTML += makeCard(m, 'movie'));
                    document.getElementById('btn-more-g').style.display = (start + perPage >= sorted.length) ? 'none' : 'block';
                    return;
                }

                // Default order: existing lazy sequential behavior (unchanged)
                let index = ((genericPage || 1) - 1) * perPage;
                let added = 0;
                while (index < CURATOR_PICKS.length && added < perPage) {
                    try {
                        const entry = CURATOR_PICKS[index];
                        const movie = await findCuratorMovie(entry);
                        if (movie && isValidCuratorResolvedMovie(movie, normalizeCuratorPick(entry))) {
                            container.innerHTML += makeCard(movie, 'movie');
                            added++;
                        }
                    } catch(e) {
                        console.error('Error loading curator pick:', e);
                    }
                    index++;
                }
                if(index >= CURATOR_PICKS.length) {
                    document.getElementById('btn-more-g').style.display = 'none';
                } else {
                    document.getElementById('btn-more-g').style.display = 'block';
                }
                return;
            }
            
            if (genericContentType === 'person_list') {
                await loadGenericPeoplePage(false);
                return;
            }
            
            // Home mixed categories share a unique cached pool across Home and See All.
            if (genericQuery.includes('&fn_home_mix=1')) {
                const d = await getHomeMixedResults(genericQuery, genericPage, genericSortMode || 'default', genericType);
                if (d && d.results) d.results.forEach(m => container.insertAdjacentHTML('beforeend', makeCard(m, genericType)));
                document.getElementById('btn-more-g').style.display = (genericPage >= (d.total_pages || 1)) ? 'none' : 'block';
                return;
            }
            // Handle trending endpoint which uses different pagination format
            const isTrendingQuery = genericQuery.startsWith('trending/');
            let effectiveQuery = genericQuery;
            if (genericSortMode && genericSortMode !== 'default' && !isTrendingQuery && genericContentType === 'media_list') {
                effectiveQuery = effectiveQuery.replace(/([?&])sort_by=[^&]*/g, '');
                const itemTypeForSort = genericType === 'tv' ? 'tv' : 'movie';
                if (genericSortMode === 'newest') effectiveQuery += itemTypeForSort === 'tv' ? '&sort_by=first_air_date.desc' : '&sort_by=primary_release_date.desc';
                else if (genericSortMode === 'oldest') effectiveQuery += itemTypeForSort === 'tv' ? '&sort_by=first_air_date.asc' : '&sort_by=primary_release_date.asc';
                else if (genericSortMode === 'popular') effectiveQuery += '&sort_by=popularity.desc';
            }
            const queryWithPage = isTrendingQuery 
                ? `${effectiveQuery}?page=${genericPage}` 
                : `${effectiveQuery}&page=${genericPage}`;
            const d = await getData(queryWithPage);
            if(!d.results) return;

            if (genericContentType === 'media_list') {
                const mediaType = genericType === 'movie' || genericType === 'tv' ? genericType : 'movie'; 
                let results = d.results || [];
                if (genericSortMode === 'popular') results = [...results].sort((a,b)=>(b.vote_count||0)-(a.vote_count||0));
                results.forEach(m => {
                    const itemType = m.media_type || mediaType;
                    if (itemType !== 'person') container.innerHTML += makeCard(m, itemType);
                });
            }
            let totalPages = 1;
            if(d.total_pages) totalPages = d.total_pages;
            if (genericPage >= totalPages) {
                document.getElementById('btn-more-g').style.display = 'none';
            } else {
                document.getElementById('btn-more-g').style.display = 'block';
            }
        }
        // --- FAVORITES LOGIC ---
        function checkFavState() {
            const btn = document.getElementById('fav-btn');
            const exists = favorites.some(f => f.id == curId);
            if(exists) {
                btn.classList.remove('fa-regular');
                btn.classList.add('fa-solid', 'active');
            } else {
                btn.classList.remove('fa-solid', 'active');
                btn.classList.add('fa-regular');
            }
        }
        var watchlist = JSON.parse(localStorage.getItem('fn_watchlist') || '[]');
        var WATCHLIST_KEY = 'fn_watchlist';
        var RECENTLY_KEY = 'fn_recently_viewed';
        var recentlyViewed = JSON.parse(localStorage.getItem(RECENTLY_KEY) || '[]');

        function recordRecentlyViewed(data, id, type) {
            if (!id || type === 'person_works') return;
            data = data || {};
            var item = {
                id: id,
                type: type || 'movie',
                title: data.title || data.name || '',
                name: data.name || data.title || '',
                poster_path: data.poster_path,
                vote_average: data.vote_average,
                release_date: data.release_date,
                first_air_date: data.first_air_date,
                recentAt: Date.now()
            };
            var idx = recentlyViewed.findIndex(function(r) { return String(r.id) === String(item.id) && (r.type || 'movie') === item.type; });
            if (idx > -1) recentlyViewed.splice(idx, 1);
            recentlyViewed.unshift(item);
            localStorage.setItem(RECENTLY_KEY, JSON.stringify(recentlyViewed));
            if (document.getElementById('fav-tab').classList.contains('active') && _myListCurrentTab === 'recent') loadFavorites();
        }

        function toggleFav() {
            const idx = favorites.findIndex(f => f.id == curId);
            if(idx > -1) {
                favorites.splice(idx, 1);
            } else {
                favorites.unshift({
                    id: curId, type: curType,
                    title: curDataForFav.title || curDataForFav.name,
                    name: curDataForFav.name || curDataForFav.title,
                    poster_path: curDataForFav.poster_path,
                    vote_average: curDataForFav.vote_average,
                    release_date: curDataForFav.release_date,
                    first_air_date: curDataForFav.first_air_date
                });
            }
            localStorage.setItem(FAV_KEY, JSON.stringify(favorites));
            checkFavState();
            if(document.getElementById('fav-tab').classList.contains('active')) { loadFavorites(); }
        }

        function _fnInfoEsc(v) {
            return String(v == null ? '-' : v).replace(/[&<>\"']/g, function(ch) { return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[ch]; });
        }
        function _fnInfoDownloadAvailable() {
            var entry = (typeof DOWNLOADS_DB !== 'undefined' && curImdb) ? DOWNLOADS_DB[curImdb] : null;
            var cached = (typeof DL_CACHE !== 'undefined' && curId != null) ? DL_CACHE[String(curId)] : false;
            return !!(cached || (entry && ((entry.softsub && Object.keys(entry.softsub).length) || (entry.dubbed && Object.keys(entry.dubbed).length))));
        }
        async function openTitleInfo() {
            var d = curDataForFav;
            if (!d) return;
            var fa = LANG === 'fa', isTv = curType === 'tv';
            var title = d.title || d.name || curTitle || '-';
            var labels = fa ? {
                status:'وضعیت پخش', air:isTv?'تاریخ پخش قسمت بعدی':'تاریخ انتشار', seasons:'تعداد فصل', episodes:'تعداد قسمت', country:'کشور سازنده', language:'زبان اصلی', year:'سال ساخت', rating:'امتیاز و رأی', genre:'ژانر', runtime:'مدت زمان', download:'دانلود', age:'رده سنی', network:'شبکه پخش', pattern:'الگوی انتشار'
            } : {
                status:'Status', air:isTv?'Next Episode Air Date':'Release Date', seasons:'Seasons', episodes:'Episodes', country:'Production Country', language:'Original Language', year:'Year', rating:'Rating & Votes', genre:'Genres', runtime:'Runtime', download:'Download', age:'Age Rating', network:'Broadcast Network', pattern:'Release Pattern'
            };
            var statusMap = fa ? {'Returning Series':'در حال پخش','Ended':'پایان‌یافته','Canceled':'لغوشده','In Production':'در حال تولید','Planned':'برنامه‌ریزی‌شده','Released':'منتشرشده'} : {};
            var status = d.status ? (statusMap[d.status] || d.status) : '-';
            var releaseDate = d.release_date || d.first_air_date || '-';
            var nextAir = d.next_episode_to_air && d.next_episode_to_air.air_date;
            var date = isTv ? (nextAir || (d.last_air_date || d.first_air_date || '-')) : releaseDate;
            var airDay = nextAir ? new Date(nextAir+'T12:00:00').toLocaleDateString(fa?'fa-IR':'en-US',{weekday:'long'}) : '-';
            var countries = (d.production_countries || []).map(function(c){return c.name;}).filter(Boolean).join(fa?'، ':', ') || '-';
            var genres = (d.genres || []).map(function(g){return g.name;}).filter(Boolean).join(fa?'، ':', ') || '-';
            var networks = (d.networks || []).map(function(n){return n.name;}).filter(Boolean).join(fa?'، ':', ') || '-';
            var langNames = fa ? {'en':'انگلیسی','ko':'کره‌ای','ja':'ژاپنی','fr':'فرانسوی','de':'آلمانی','es':'اسپانیایی','it':'ایتالیایی','ru':'روسی','zh':'چینی','hi':'هندی','tr':'ترکی','fa':'فارسی'} : {'en':'English','ko':'Korean','ja':'Japanese','fr':'French','de':'German','es':'Spanish','it':'Italian','ru':'Russian','zh':'Chinese','hi':'Hindi','tr':'Turkish','fa':'Persian'};
            var originalLang = langNames[d.original_language] || d.original_language || '-';
            var rating = d.vote_average ? Number(d.vote_average).toFixed(1) + '/10' : '-';
            if (d.vote_count != null) rating += ' (' + Number(d.vote_count).toLocaleString('en-US') + (fa?' رأی':' votes') + ')';
            var runtime = '-';
            if (isTv && d.episode_run_time && d.episode_run_time.length) runtime = Math.round(d.episode_run_time.reduce(function(a,b){return a+b;},0)/d.episode_run_time.length) + (fa?' دقیقه':' min');
            else if (!isTv && d.runtime) runtime = d.runtime + (fa?' دقیقه':' min');
            var pattern = '-';
            if (isTv) {
                if (d.status === 'Returning Series' && nextAir) pattern = (fa?'پخش هفتگی؛ معمولاً ':'Weekly release; next on ') + airDay;
                else if (d.status === 'Ended' && d.last_air_date) pattern = fa?'پخش کامل شده':'Fully released';
                else if (d.status === 'In Production' || d.status === 'Planned') pattern = fa?'زمان‌بندی اعلام نشده':'Schedule not announced';
            }
            var download = false;
            var db = (typeof DOWNLOADS_DB !== 'undefined' && curImdb) ? DOWNLOADS_DB[curImdb] : null;
            download = !!(db && (db.type === 'tvSeries' || (db.softsub && Object.keys(db.softsub).length) || (db.dubbed && Object.keys(db.dubbed).length)));
            if (curImdb && typeof getIndex === 'function') {
                try { var liveIndex = await getIndex(); if (liveIndex && liveIndex[curImdb]) download = true; } catch(e) {}
            }
            var age = d.age_rating_display || d.age_rating || '-';
            if (typeof getData === 'function') {
                try {
                    var ratingData = isTv ? await getData('tv/'+d.id+'/content_ratings') : await getData('movie/'+d.id+'/release_dates');
                    if (isTv && ratingData && ratingData.results) { var rr=ratingData.results.find(function(x){return x.iso_3166_1==='US' && x.rating;}) || ratingData.results.find(function(x){return x.rating;}); if(rr) age=rr.rating; }
                    if (!isTv && ratingData && ratingData.results) { var us=ratingData.results.find(function(x){return x.iso_3166_1==='US';}) || ratingData.results[0]; var rd=us && (us.release_dates||[]).find(function(x){return x.certification;}); if(rd) age=rd.certification; }
                } catch(e) {}
            }
            var ageDisplay = age;
            var ageMap = {'G':'3+','PG':'7+','PG-13':'13+','R':'17+','NC-17':'18+','TV-Y':'3+','TV-Y7':'7+','TV-G':'6+','TV-PG':'10+','TV-14':'14+','TV-MA':'18+'};
            if (ageMap[age]) ageDisplay = ageMap[age] + ' (' + age + ')';
            var rows = [[labels.status,status],[labels.air,date],[labels.year,(releaseDate !== '-' ? releaseDate.slice(0,4) : '-')],[labels.country,countries],[labels.language,originalLang],[labels.rating,rating],[labels.genre,genres],[labels.runtime,runtime],[labels.age,ageDisplay]];
            if (isTv) rows.splice(2,0,[labels.seasons,d.number_of_seasons || '-'],[labels.episodes,d.number_of_episodes || '-'],[labels.network,networks],[labels.pattern,pattern]);
            rows.push([labels.download, download ? (fa?'دارد':'Available') : (fa?'ندارد':'Unavailable')]);
            var grid = document.getElementById('fn-title-info-grid'), heading = document.getElementById('fn-title-info-heading');
            if (heading) heading.textContent = title;
            if (grid) grid.innerHTML = rows.map(function(row){ var isDownload=row[0]===labels.download; return '<div class="fn-title-info-row"><div class="fn-title-info-label">'+_fnInfoEsc(row[0])+'</div><div class="fn-title-info-value '+(isDownload?(download?'ok':'no'):'')+'">'+_fnInfoEsc(row[1])+'</div></div>'; }).join('');
            var modal = document.getElementById('fn-title-info-modal');
            if (modal) { modal.classList.add('open'); modal.setAttribute('aria-hidden','false'); }
        }
        function closeTitleInfo() {
            var modal = document.getElementById('fn-title-info-modal');
            if (modal) { modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); }
        }
        function toggleWatchlist() {
            haptic(12);
            if (!curId || !curDataForFav) return;
            var idx = watchlist.findIndex(function(w) { return w.id == curId; });
            if (idx > -1) {
                watchlist.splice(idx, 1);
                showToast(LANG === 'fa' ? 'از ذخیره‌شده‌ها حذف شد' : 'Removed from Watch Later');
            } else {
                watchlist.unshift({
                    id: curId, type: curType,
                    title: curDataForFav.title || curDataForFav.name,
                    name: curDataForFav.name || curDataForFav.title,
                    poster_path: curDataForFav.poster_path,
                    vote_average: curDataForFav.vote_average,
                    release_date: curDataForFav.release_date,
                    first_air_date: curDataForFav.first_air_date,
                    savedAt: Date.now()
                });
                showToast(LANG === 'fa' ? 'برای بعداً ذخیره شد' : 'Saved to Watch Later');
            }
            localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
            checkWatchlistState();
            if(document.getElementById('fav-tab').classList.contains('active')) { loadFavorites(); }
        }

        function checkWatchlistState() {
            var btn = document.getElementById('watchlist-btn');
            if (!btn || !curId) return;
            var inList = watchlist.findIndex(function(w) { return w.id == curId; }) > -1;
            btn.className = (inList ? 'fa-solid fa-bookmark' : 'fa-regular fa-bookmark');
            btn.style.color = inList ? '#00b894' : '#777';
        }
        var _myListCurrentTab = 'fav';

        function switchMyListTab(tab) {
            _myListCurrentTab = tab;
            var tabs = ['fav', 'rated', 'watchlater', 'recent'];
            tabs.forEach(function(t) {
                var btn = document.getElementById('mylist-tab-' + t);
                var sec = document.getElementById('mylist-section-' + t);
                if (btn) {
                    if (t === tab) {
                        btn.style.background = t === 'fav' ? '#e50914' : (t === 'rated' ? '#1f1600' : (t === 'watchlater' ? '#001a12' : '#18132b'));
                        btn.style.color = 'white';
                    } else {
                        btn.style.background = '#1a1a1a';
                        btn.style.color = '#888';
                    }
                }
                if (sec) sec.style.display = t === tab ? 'block' : 'none';
            });
            loadFavorites();
        }

        function loadFavorites() {
            var isFA = LANG === 'fa';
            var tab = _myListCurrentTab || 'fav';

            if (tab === 'fav') {
                var c = document.getElementById('fav-grid');
                var emptyEl = document.getElementById('fav-empty');
                if (!c) return;
                c.innerHTML = '';
                if (favorites.length === 0) {
                    if (emptyEl) { emptyEl.style.display = 'block'; emptyEl.textContent = isFA ? '\u0644\u06CC\u0633\u062A \u062E\u0627\u0644\u06CC\u0647' : 'No favorites yet'; }
                } else {
                    if (emptyEl) emptyEl.style.display = 'none';
                    favorites.forEach(function(f) { c.innerHTML += makeCard(f, f.type || 'movie'); });
                }
            } else if (tab === 'rated') {
                var ratedEl = document.getElementById('rated-list-content');
                var ratedEmpty = document.getElementById('rated-empty');
                if (!ratedEl) return;
                var ratings = personalRatings || {};
                var ratedItems = Object.entries(ratings).sort(function(a, b) { return b[1].stars - a[1].stars; });
                if (ratedItems.length === 0) {
                    if (ratedEmpty) { ratedEmpty.style.display = 'block'; ratedEmpty.textContent = isFA ? '\u0647\u0646\u0648\u0632 \u0627\u0645\u062A\u06CC\u0627\u0632\u06CC \u062B\u0628\u062A \u0646\u0634\u062F\u0647' : 'No ratings yet'; }
                    ratedEl.innerHTML = '';
                } else {
                    if (ratedEmpty) ratedEmpty.style.display = 'none';
                    var opLabelsFA = { loved: '\u0633\u0644\u06CC\u0642\u0645 \u0628\u0648\u062F', ok: '\u0628\u062F \u0646\u0628\u0648\u062F', disliked: '\u0627\u062A\u0644\u0627\u0641 \u0648\u0642\u062A', notmytaste: '\u0633\u0644\u06CC\u0642\u0645 \u0646\u0628\u0648\u062F' };
                    var opLabelsEN = { loved: 'Loved it', ok: 'Was OK', disliked: 'Waste of time', notmytaste: 'Not my taste' };
                    var html = '';
                    ratedItems.forEach(function(entry) {
                        var id = entry[0]; var r = entry[1];
                        var stars = '';
                        for (var i = 1; i <= 5; i++) stars += (i <= r.stars ? '<span style="color:#f5c518;">&#9733;</span>' : '<span style="color:#333;">&#9733;</span>');
                        var opinionText = '';
                        if (r.opinion) {
                            var lbl = isFA ? opLabelsFA[r.opinion] : opLabelsEN[r.opinion];
                            if (lbl) opinionText = '<div style="font-size:11px;color:#00b894;margin-top:4px;font-weight:600;">' + lbl + '</div>';
                        }
                        var poster = r.poster ? ('https://family-night-api.alirezadoe8.workers.dev/img/w185' + r.poster) : '';
                        html += '<div style="display:flex;align-items:center;gap:12px;padding:11px 0;border-bottom:1px solid #1a1a1a;cursor:pointer;" onclick="openDetail(' + id + ',\'' + (r.type||'movie') + '\')">'
                            + '<div style="width:52px;height:74px;border-radius:6px;overflow:hidden;flex-shrink:0;background:#111;">'
                            + (poster ? '<img src="' + poster + '" style="width:100%;height:100%;object-fit:cover;" loading="lazy">' : '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:22px;">&#127916;</div>')
                            + '</div>'
                            + '<div style="flex:1;min-width:0;">'
                            + '<div style="font-size:14px;font-weight:600;color:#e0e0e0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + (r.title||'') + '</div>'
                            + '<div style="margin-top:5px;font-size:16px;letter-spacing:2px;">' + stars + '</div>'
                            + opinionText
                            + '</div></div>';
                    });
                    ratedEl.innerHTML = html;
                }
            } else if (tab === 'watchlater') {
                var wg = document.getElementById('watchlater-grid');
                var wEmpty = document.getElementById('watchlater-empty');
                if (!wg) return;
                wg.innerHTML = '';
                if (watchlist.length === 0) {
                    if (wEmpty) { wEmpty.style.display = 'block'; wEmpty.textContent = isFA ? '\u0647\u06CC\u0686 \u0627\u062B\u0631\u06CC \u0630\u062E\u06CC\u0631\u0647 \u0646\u0634\u062F\u0647' : 'Nothing saved for later'; }
                } else {
                    if (wEmpty) wEmpty.style.display = 'none';
                    watchlist.forEach(function(f) { wg.innerHTML += makeCard(f, f.type || 'movie'); });
                }
            } else if (tab === 'recent') {
                var recentGrid = document.getElementById('recent-grid');
                var recentEmpty = document.getElementById('recent-empty');
