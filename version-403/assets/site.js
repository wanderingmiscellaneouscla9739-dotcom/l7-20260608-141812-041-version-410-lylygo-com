(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function initializeMobileMenu() {
        var button = document.querySelector('[data-mobile-menu-button]');
        var header = document.querySelector('.site-header');
        if (!button || !header) {
            return;
        }
        button.addEventListener('click', function () {
            header.classList.toggle('is-open');
            document.body.classList.toggle('menu-open', header.classList.contains('is-open'));
        });
    }

    function initializeHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var previous = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (previous) {
            previous.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                start();
            });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function getQueryText() {
        try {
            var params = new URLSearchParams(window.location.search);
            return params.get('q') || '';
        } catch (error) {
            return '';
        }
    }

    function initializeFilters() {
        var container = document.querySelector('[data-card-container]');
        if (!container) {
            return;
        }
        var searchInput = document.querySelector('.js-card-search');
        var typeSelect = document.querySelector('.js-card-type');
        var categorySelect = document.querySelector('.js-card-category');
        var sortSelect = document.querySelector('.js-card-sort');
        var countNode = document.querySelector('.js-result-count');
        var initialCards = Array.prototype.slice.call(container.querySelectorAll('[data-movie-card]'));
        var queryText = getQueryText();

        if (searchInput && queryText) {
            searchInput.value = queryText;
        }

        function includesType(card, typeValue) {
            if (!typeValue) {
                return true;
            }
            var cardType = (card.getAttribute('data-type') || '').toLowerCase();
            return cardType.indexOf(typeValue.toLowerCase()) !== -1;
        }

        function applySort(visibleCards) {
            var sortValue = sortSelect ? sortSelect.value : 'default';
            var sorted = visibleCards.slice();
            if (sortValue === 'score-desc') {
                sorted.sort(function (a, b) {
                    return Number(b.getAttribute('data-score') || 0) - Number(a.getAttribute('data-score') || 0);
                });
            } else if (sortValue === 'year-desc') {
                sorted.sort(function (a, b) {
                    return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
                });
            } else if (sortValue === 'title-asc') {
                sorted.sort(function (a, b) {
                    return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-Hans-CN');
                });
            } else {
                sorted = initialCards.slice();
            }
            sorted.forEach(function (card) {
                container.appendChild(card);
            });
        }

        function applyFilters() {
            var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
            var typeValue = typeSelect ? typeSelect.value : '';
            var categoryValue = categorySelect ? categorySelect.value : '';
            var visibleCards = [];

            initialCards.forEach(function (card) {
                var search = (card.getAttribute('data-search') || '').toLowerCase();
                var category = card.getAttribute('data-category') || '';
                var matchesQuery = !query || search.indexOf(query) !== -1;
                var matchesType = includesType(card, typeValue);
                var matchesCategory = !categoryValue || categoryValue === category;
                var visible = matchesQuery && matchesType && matchesCategory;
                card.classList.toggle('is-filtered-out', !visible);
                if (visible) {
                    visibleCards.push(card);
                }
            });

            applySort(visibleCards);
            if (countNode) {
                countNode.textContent = String(visibleCards.length);
            }
        }

        [searchInput, typeSelect, categorySelect, sortSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilters);
                control.addEventListener('change', applyFilters);
            }
        });

        applyFilters();
    }

    function loadHls(callback) {
        if (window.Hls) {
            callback();
            return;
        }
        var existing = document.querySelector('script[data-hls-loader]');
        if (existing) {
            existing.addEventListener('load', callback);
            existing.addEventListener('error', callback);
            return;
        }
        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.6.15/dist/hls.min.js';
        script.async = true;
        script.setAttribute('data-hls-loader', 'true');
        script.addEventListener('load', callback);
        script.addEventListener('error', callback);
        document.head.appendChild(script);
    }

    function initializePlayer() {
        var player = document.querySelector('[data-player]');
        if (!player) {
            return;
        }
        var video = player.querySelector('video');
        var playButton = player.querySelector('[data-play-button]');
        var source = video ? video.getAttribute('data-hls') : '';
        var hlsInstance = null;
        var initialized = false;

        function attachSource() {
            if (!video || !source || initialized) {
                return;
            }
            initialized = true;
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else {
                video.src = source;
            }
        }

        function play() {
            loadHls(function () {
                attachSource();
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        if (playButton) {
                            playButton.classList.remove('is-hidden');
                        }
                    });
                }
            });
        }

        if (playButton) {
            playButton.addEventListener('click', function () {
                playButton.classList.add('is-hidden');
                play();
            });
        }
        if (video) {
            video.addEventListener('play', function () {
                if (playButton) {
                    playButton.classList.add('is-hidden');
                }
            });
            video.addEventListener('pause', function () {
                if (playButton && video.currentTime === 0) {
                    playButton.classList.remove('is-hidden');
                }
            });
        }
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    ready(function () {
        initializeMobileMenu();
        initializeHero();
        initializeFilters();
        initializePlayer();
    });
})();
