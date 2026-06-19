(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var navMenu = document.querySelector('[data-nav-menu]');

    if (menuButton && navMenu) {
        menuButton.addEventListener('click', function () {
            navMenu.classList.toggle('is-open');
        });
    }

    var backTop = document.querySelector('[data-back-top]');

    if (backTop) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 420) {
                backTop.classList.add('is-visible');
            } else {
                backTop.classList.remove('is-visible');
            }
        });

        backTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var previous = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    var activeIndex = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        activeIndex = (index + slides.length) % slides.length;

        slides.forEach(function (slide, itemIndex) {
            slide.classList.toggle('is-active', itemIndex === activeIndex);
        });

        dots.forEach(function (dot, itemIndex) {
            dot.classList.toggle('is-active', itemIndex === activeIndex);
        });
    }

    function startSlides() {
        if (slides.length < 2) {
            return;
        }

        window.clearInterval(timer);
        timer = window.setInterval(function () {
            showSlide(activeIndex + 1);
        }, 5200);
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
            startSlides();
        });
    });

    if (previous) {
        previous.addEventListener('click', function () {
            showSlide(activeIndex - 1);
            startSlides();
        });
    }

    if (next) {
        next.addEventListener('click', function () {
            showSlide(activeIndex + 1);
            startSlides();
        });
    }

    showSlide(0);
    startSlides();

    var searchInput = document.querySelector('[data-search-input]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    var emptyState = document.querySelector('[data-empty-state]');
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-value]'));
    var currentFilter = 'all';

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function applyFilter() {
        if (!cards.length) {
            return;
        }

        var keyword = normalize(searchInput ? searchInput.value : '');
        var visible = 0;

        cards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-tags'),
                card.getAttribute('data-year')
            ].join(' '));
            var filterText = normalize([
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-tags')
            ].join(' '));
            var byKeyword = !keyword || haystack.indexOf(keyword) !== -1;
            var byFilter = currentFilter === 'all' || filterText.indexOf(normalize(currentFilter)) !== -1;
            var matched = byKeyword && byFilter;

            card.style.display = matched ? '' : 'none';

            if (matched) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle('is-visible', visible === 0);
        }
    }

    if (searchInput) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get('search');

        if (query) {
            searchInput.value = query;
        }

        searchInput.addEventListener('input', applyFilter);
    }

    filterButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            currentFilter = button.getAttribute('data-filter-value') || 'all';

            filterButtons.forEach(function (item) {
                item.classList.toggle('is-active', item === button);
            });

            applyFilter();
        });
    });

    applyFilter();

    var player = document.querySelector('[data-player]');

    if (player) {
        var video = player.querySelector('video');
        var button = player.querySelector('[data-play-button]');
        var streamUrl = video ? video.getAttribute('data-stream-url') : '';
        var ready = false;

        function prepareVideo() {
            if (!video || !streamUrl || ready) {
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                video._hlsInstance = hls;
            } else {
                video.src = streamUrl;
            }

            ready = true;
        }

        function playVideo() {
            prepareVideo();
            player.classList.add('is-playing');
            video.setAttribute('controls', 'controls');

            var playAction = video.play();

            if (playAction && typeof playAction.catch === 'function') {
                playAction.catch(function () {
                    player.classList.remove('is-playing');
                });
            }
        }

        if (button) {
            button.addEventListener('click', playVideo);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (!ready) {
                    playVideo();
                }
            });
        }
    }
})();
