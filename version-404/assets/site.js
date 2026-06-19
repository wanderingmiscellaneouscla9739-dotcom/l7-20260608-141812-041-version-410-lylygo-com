(function () {
    var navToggle = document.querySelector('[data-nav-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (navToggle && mobileNav) {
        navToggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var slider = document.querySelector('[data-slider]');

    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-slide-dot]'));
        var current = 0;

        function showSlide(index) {
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

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                showSlide(dotIndex);
            });
        });

        showSlide(0);

        if (slides.length > 1) {
            setInterval(function () {
                showSlide(current + 1);
            }, 5800);
        }
    }

    var catalog = document.querySelector('[data-catalog]');

    if (catalog) {
        var cards = Array.prototype.slice.call(catalog.querySelectorAll('[data-movie-card]'));
        var searchInput = document.querySelector('[data-catalog-search]');
        var yearSelect = document.querySelector('[data-catalog-year]');
        var sortSelect = document.querySelector('[data-catalog-sort]');
        var emptyState = document.querySelector('[data-empty-state]');

        function normalize(value) {
            return String(value || '').toLowerCase().trim();
        }

        function sortCards() {
            if (!sortSelect) {
                return;
            }

            var mode = sortSelect.value;
            var sorted = cards.slice().sort(function (a, b) {
                var ay = Number(a.getAttribute('data-year')) || 0;
                var by = Number(b.getAttribute('data-year')) || 0;
                var at = a.getAttribute('data-title') || '';
                var bt = b.getAttribute('data-title') || '';

                if (mode === 'year-asc') {
                    return ay - by;
                }

                if (mode === 'title') {
                    return at.localeCompare(bt, 'zh-Hans-CN');
                }

                return by - ay;
            });

            sorted.forEach(function (card) {
                catalog.appendChild(card);
            });
        }

        function filterCards() {
            var query = normalize(searchInput ? searchInput.value : '');
            var year = yearSelect ? yearSelect.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var text = normalize((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-keywords') || '') + ' ' + (card.getAttribute('data-region') || '') + ' ' + (card.getAttribute('data-category') || ''));
                var cardYear = card.getAttribute('data-year') || '';
                var matchQuery = !query || text.indexOf(query) !== -1;
                var matchYear = !year || cardYear === year;
                var shouldShow = matchQuery && matchYear;

                card.style.display = shouldShow ? '' : 'none';

                if (shouldShow) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle('is-visible', visible === 0);
            }
        }

        if (searchInput) {
            searchInput.addEventListener('input', filterCards);
        }

        if (yearSelect) {
            yearSelect.addEventListener('change', filterCards);
        }

        if (sortSelect) {
            sortSelect.addEventListener('change', function () {
                sortCards();
                filterCards();
            });
        }

        var queryParams = new URLSearchParams(window.location.search);
        var queryValue = queryParams.get('q');

        if (queryValue && searchInput) {
            searchInput.value = queryValue;
        }

        sortCards();
        filterCards();
    }
})();

function setupMoviePlayer(videoId, overlayId, source) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    var hls;

    if (!video || !overlay || !source) {
        return;
    }

    function attachSource() {
        if (video.getAttribute('data-ready') === '1') {
            return;
        }

        video.setAttribute('data-ready', '1');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            return;
        }

        video.src = source;
    }

    function playVideo() {
        attachSource();
        overlay.classList.add('is-hidden');
        video.setAttribute('controls', 'controls');

        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {});
        }
    }

    overlay.addEventListener('click', playVideo);
    video.addEventListener('click', function () {
        if (video.paused) {
            playVideo();
        }
    });
}