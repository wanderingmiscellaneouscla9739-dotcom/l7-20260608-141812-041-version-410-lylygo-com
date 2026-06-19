(function () {
    var mobileButton = document.querySelector('[data-mobile-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');
    if (mobileButton && mobilePanel) {
        mobileButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

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

    function startHero() {
        if (timer) {
            window.clearInterval(timer);
        }
        timer = window.setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    if (slides.length) {
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                startHero();
            });
        });
        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                startHero();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                startHero();
            });
        }
        showSlide(0);
        startHero();
    }

    var filterForm = document.querySelector('[data-filter-form]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-card]'));
    var searchStatus = document.querySelector('[data-search-status]');

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function applyFilters() {
        if (!filterForm || !cards.length) {
            return;
        }
        var keyword = normalize(filterForm.querySelector('[name="q"]') && filterForm.querySelector('[name="q"]').value);
        var year = normalize(filterForm.querySelector('[name="year"]') && filterForm.querySelector('[name="year"]').value);
        var region = normalize(filterForm.querySelector('[name="region"]') && filterForm.querySelector('[name="region"]').value);
        var type = normalize(filterForm.querySelector('[name="type"]') && filterForm.querySelector('[name="type"]').value);
        var category = normalize(filterForm.querySelector('[name="category"]') && filterForm.querySelector('[name="category"]').value);
        var matched = false;

        cards.forEach(function (card) {
            var text = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-category'),
                card.textContent
            ].join(' '));
            var ok = true;
            if (keyword && text.indexOf(keyword) === -1) {
                ok = false;
            }
            if (year && normalize(card.getAttribute('data-year')) !== year) {
                ok = false;
            }
            if (region && normalize(card.getAttribute('data-region')).indexOf(region) === -1) {
                ok = false;
            }
            if (type && normalize(card.getAttribute('data-type')).indexOf(type) === -1) {
                ok = false;
            }
            if (category && normalize(card.getAttribute('data-category')) !== category) {
                ok = false;
            }
            card.classList.toggle('hidden-by-filter', !ok);
            if (ok) {
                matched = true;
            }
        });

        if (searchStatus) {
            searchStatus.style.display = keyword || year || region || type || category ? 'block' : 'none';
            searchStatus.textContent = matched ? '已为你筛选出相关影片' : '暂未找到匹配内容';
        }
    }

    if (filterForm) {
        var params = new URLSearchParams(window.location.search);
        Array.prototype.slice.call(filterForm.elements).forEach(function (element) {
            if (element.name && params.has(element.name)) {
                element.value = params.get(element.name);
            }
            element.addEventListener('input', applyFilters);
            element.addEventListener('change', applyFilters);
        });
        filterForm.addEventListener('submit', function (event) {
            event.preventDefault();
            applyFilters();
        });
        applyFilters();
    }
})();

function initMoviePlayer(videoId, sourceUrl, buttonId) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var started = false;
    var hlsInstance = null;

    if (!video || !sourceUrl) {
        return;
    }

    function attachVideo() {
        if (started) {
            if (video.paused) {
                video.play();
            }
            return;
        }
        started = true;
        if (button) {
            button.style.display = 'none';
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = sourceUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(sourceUrl);
            hlsInstance.attachMedia(video);
        } else {
            video.src = sourceUrl;
        }
        var playResult = video.play();
        if (playResult && typeof playResult.catch === 'function') {
            playResult.catch(function () {
                started = false;
                if (button) {
                    button.style.display = 'flex';
                }
            });
        }
    }

    if (button) {
        button.addEventListener('click', attachVideo);
    }
    video.addEventListener('click', function () {
        if (video.paused) {
            attachVideo();
        }
    });
    video.addEventListener('ended', function () {
        if (hlsInstance && typeof hlsInstance.destroy === 'function') {
            hlsInstance.destroy();
            hlsInstance = null;
        }
        started = false;
        if (button) {
            button.style.display = 'flex';
        }
    });
}
