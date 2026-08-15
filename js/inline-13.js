
(function() {
    'use strict';

    // User's own Cloudflare Worker (deployed by the user)
    var OWN_WORKER = 'https://fragrant-hall-6fc1.jamesfranco1.workers.dev/?url=';

    // Domains that are commonly filtered and need a proxy fallback
    var FILTERED_DOMAINS = [
        'api.themoviedb.org',
        'image.tmdb.org',
        'api.mymemory.translated.net',
        'text.pollinations.ai'
    ];

    // Streaming-server embed domains (used by the online player)
    var PLAYER_DOMAINS = [
        'autoembed.co', 'vidsrcme.ru', '2embed.cc', 'embed.smashystream.com',
        'nontongo.win', '111movies.com', 'vidlink.pro',
        'player.videasy.net'
    ];

    // Ordered fallback proxies for generic fetch() (API/text) calls.
    // The user's own Worker is tried first since it's the most reliable.
    var FETCH_PROXIES = [
        function(u) { return OWN_WORKER + encodeURIComponent(u); },
        function(u) { return 'https://corsproxy.io/?url=' + encodeURIComponent(u); },
        function(u) { return 'https://api.allorigins.win/raw?url=' + encodeURIComponent(u); },
        function(u) { return 'https://thingproxy.freeboard.io/fetch/' + u; }
    ];

    // Dedicated image proxy: try the user's own Worker first, then weserv.nl
    // (a generic public image CDN) as a second-line fallback.
    function imgProxyUrl(u) {
        return OWN_WORKER + encodeURIComponent(u);
    }
    function imgProxyUrl2(u) {
        var stripped = u.replace(/^https?:\/\//, '');
        return 'https://images.weserv.nl/?url=' + encodeURIComponent(stripped) + '&output=jpg';
    }

    function isFilteredUrl(u) {
        if (typeof u !== 'string') return false;
        for (var i = 0; i < FILTERED_DOMAINS.length; i++) {
            if (u.indexOf(FILTERED_DOMAINS[i]) !== -1) return true;
        }
        return false;
    }
    function isImageDomain(u) {
        return typeof u === 'string' && u.indexOf('image.tmdb.org') !== -1;
    }

    // ── fetch() interception ───────────────────────────────────────────
    // Race direct request vs a short timer; if direct hasn't resolved in
    // time (typical symptom of DNS/SNI filtering), fall back through the
    // proxy chain in order. Works whether the user is filtered or not.
    var _origFetch = window.fetch.bind(window);

    function _timeoutPromise(ms) {
        return new Promise(function(resolve) { setTimeout(function() { resolve(null); }, ms); });
    }

    function _tryProxiesSequential(url, init, idx) {
        idx = idx || 0;
        if (idx >= FETCH_PROXIES.length) return Promise.reject(new Error('all proxies failed'));
        var proxied = FETCH_PROXIES[idx](url);
        return _origFetch(proxied, init).then(function(r) {
            if (r && r.ok) return r;
            return _tryProxiesSequential(url, init, idx + 1);
        }).catch(function() {
            return _tryProxiesSequential(url, init, idx + 1);
        });
    }

    window.fetch = function(input, init) {
        var url = (typeof input === 'string') ? input : (input && input.url);
        if (!isFilteredUrl(url)) return _origFetch(input, init);

        var direct = _origFetch(input, init).catch(function() { return null; });
        return Promise.race([direct, _timeoutPromise(3000)]).then(function(res) {
            if (res && res.ok) return res;
            return _tryProxiesSequential(url, init).catch(function() {
                return direct.then(function(r) { if (r) return r; throw new Error('network unreachable'); });
            });
        });
    };

    // ── <img src> + background-image interception ───────────────────────
    function _swapToProxy(el) {
        if (!el || el.__fnProxied) return;
        if (el.tagName === 'IMG') {
            var src = el.getAttribute('src');
            if (src && isImageDomain(src) && src.indexOf('images.weserv.nl') === -1 && src.indexOf('workers.dev') === -1) {
                el.__fnProxied = true;
                var testImg = new Image();
                var fallbackTimer = setTimeout(function() {
                    el.src = imgProxyUrl(src);
                    el.onerror = function() { el.onerror = null; el.src = imgProxyUrl2(src); };
                }, 1800);
                testImg.onload = function() { clearTimeout(fallbackTimer); };
                testImg.onerror = function() {
                    clearTimeout(fallbackTimer);
                    el.src = imgProxyUrl(src);
                    el.onerror = function() { el.onerror = null; el.src = imgProxyUrl2(src); };
                };
                testImg.src = src;
            }
        }
        var styleAttr = el.getAttribute && el.getAttribute('style');
        if (styleAttr && styleAttr.indexOf('image.tmdb.org') !== -1 && styleAttr.indexOf('images.weserv.nl') === -1 && styleAttr.indexOf('workers.dev') === -1) {
            var m = styleAttr.match(/url\((['"]?)(https?:\/\/image\.tmdb\.org[^'")]+)\1\)/);
            if (m && m[2]) {
                var orig = m[2];
                (function(targetEl, origUrl) {
                    var t = new Image();
                    var ft = setTimeout(function() {
                        targetEl.style.backgroundImage = 'url(' + imgProxyUrl(origUrl) + ')';
                    }, 1800);
                    t.onload = function() { clearTimeout(ft); };
                    t.onerror = function() { clearTimeout(ft); targetEl.style.backgroundImage = 'url(' + imgProxyUrl(origUrl) + ')'; };
                    t.src = origUrl;
                })(el, orig);
            }
        }
    }

    function _scanNode(node) {
        if (!node || node.nodeType !== 1) return;
        _swapToProxy(node);
        if (node.querySelectorAll) {
            var imgs = node.querySelectorAll('img[src*="image.tmdb.org"]');
            for (var i = 0; i < imgs.length; i++) _swapToProxy(imgs[i]);
            var styled = node.querySelectorAll('[style*="image.tmdb.org"]');
            for (var j = 0; j < styled.length; j++) _swapToProxy(styled[j]);
        }
    }

    document.addEventListener('DOMContentLoaded', function() { _scanNode(document.body); });
    if (document.body) _scanNode(document.body);

    var _mo = new MutationObserver(function(mutations) {
        for (var i = 0; i < mutations.length; i++) {
            var mu = mutations[i];
            if (mu.type === 'childList') {
                mu.addedNodes.forEach(function(n) { _scanNode(n); });
            } else if (mu.type === 'attributes') {
                _swapToProxy(mu.target);
            }
        }
    });
    function _startObserver() {
        _mo.observe(document.body, {
            childList: true, subtree: true,
            attributes: true, attributeFilter: ['src', 'style']
        });
    }
    if (document.body) _startObserver();
    else document.addEventListener('DOMContentLoaded', _startObserver);

    setInterval(function() { _scanNode(document.body); }, 4000);

    // ── Smart iframe loader for the online player ───────────────────────
    // Tries the direct server URL first; if it hasn't fired a 'load' event
    // within 4s (typical symptom of a blocked/filtered streaming domain),
    // automatically reloads the same iframe through the user's own
    // Cloudflare Worker proxy instead.
    var _iframeLoadTimer = null;
    var _iframeLoadToken  = 0;

    function _isPlayerDomainUrl(u) {
        if (typeof u !== 'string') return false;
        for (var i = 0; i < PLAYER_DOMAINS.length; i++) {
            if (u.indexOf(PLAYER_DOMAINS[i]) !== -1) return true;
        }
        return false;
    }

    window._setIframeSmart = function(url) {
        var iframe = document.getElementById('iframe');
        if (!iframe) return;

        clearTimeout(_iframeLoadTimer);
        var myToken = ++_iframeLoadToken;

        iframe.src = url;

        if (!_isPlayerDomainUrl(url) || url.indexOf('workers.dev') !== -1) return;

        var loaded = false;
        function onLoad() { loaded = true; iframe.removeEventListener('load', onLoad); }
        iframe.addEventListener('load', onLoad);

        _iframeLoadTimer = setTimeout(function() {
            if (myToken !== _iframeLoadToken) return;
            iframe.removeEventListener('load', onLoad);
            if (!loaded) {
                iframe.src = OWN_WORKER + encodeURIComponent(url);
            }
        }, 4000);
    };

})();
