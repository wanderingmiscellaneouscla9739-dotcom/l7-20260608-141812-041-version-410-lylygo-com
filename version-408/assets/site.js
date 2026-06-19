(function () {
    var navToggle = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-site-nav]');

    if (navToggle && nav) {
        navToggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var activeIndex = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        activeIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === activeIndex);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === activeIndex);
        });
    }

    function startSlider() {
        if (slides.length < 2) {
            return;
        }

        timer = window.setInterval(function () {
            showSlide(activeIndex + 1);
        }, 5200);
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            if (timer) {
                window.clearInterval(timer);
            }
            showSlide(index);
            startSlider();
        });
    });

    showSlide(0);
    startSlider();

    var globalSearchForms = Array.prototype.slice.call(document.querySelectorAll('[data-search-form]'));
    globalSearchForms.forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = form.querySelector('input[name="q"]');
            var value = input ? input.value.trim() : '';
            var target = value ? './search.html?q=' + encodeURIComponent(value) : './search.html';
            window.location.href = target;
        });
    });

    var catalog = document.querySelector('[data-catalog]');
    if (catalog) {
        var searchInput = document.querySelector('[data-catalog-search]');
        var regionSelect = document.querySelector('[data-region-filter]');
        var typeSelect = document.querySelector('[data-type-filter]');
        var yearSelect = document.querySelector('[data-year-filter]');
        var resetButton = document.querySelector('[data-filter-reset]');
        var emptyState = document.querySelector('[data-filter-empty]');
        var cards = Array.prototype.slice.call(catalog.querySelectorAll('.movie-card'));

        function normalize(value) {
            return String(value || '').toLowerCase();
        }

        function applyFilters() {
            var keyword = normalize(searchInput && searchInput.value);
            var region = regionSelect ? regionSelect.value : '';
            var type = typeSelect ? typeSelect.value : '';
            var year = yearSelect ? yearSelect.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var text = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags')
                ].join(' '));

                var ok = true;
                if (keyword && text.indexOf(keyword) === -1) {
                    ok = false;
                }
                if (region && card.getAttribute('data-region') !== region) {
                    ok = false;
                }
                if (type && card.getAttribute('data-type') !== type) {
                    ok = false;
                }
                if (year && card.getAttribute('data-year') !== year) {
                    ok = false;
                }

                card.classList.toggle('hidden-by-filter', !ok);
                if (ok) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.style.display = visible ? 'none' : 'block';
            }
        }

        [searchInput, regionSelect, typeSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilters);
                control.addEventListener('change', applyFilters);
            }
        });

        if (resetButton) {
            resetButton.addEventListener('click', function () {
                if (searchInput) {
                    searchInput.value = '';
                }
                if (regionSelect) {
                    regionSelect.value = '';
                }
                if (typeSelect) {
                    typeSelect.value = '';
                }
                if (yearSelect) {
                    yearSelect.value = '';
                }
                applyFilters();
            });
        }
    }

    var searchPage = document.querySelector('[data-search-page]');
    if (searchPage && window.SITE_MOVIES) {
        var resultBox = document.querySelector('[data-search-results]');
        var searchTitle = document.querySelector('[data-search-title]');
        var params = new URLSearchParams(window.location.search);
        var keyword = (params.get('q') || '').trim();
        var searchInputOnPage = document.querySelector('[data-search-page-input]');

        if (searchInputOnPage) {
            searchInputOnPage.value = keyword;
        }

        function escapeHtml(value) {
            return String(value || '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }

        function renderCard(movie) {
            var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
                return '<span>' + escapeHtml(tag) + '</span>';
            }).join('');

            return [
                '<article class="movie-card">',
                '<a class="poster-link" href="' + escapeHtml(movie.url) + '" title="' + escapeHtml(movie.title) + '">',
                '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
                '<span class="score-badge">' + escapeHtml(movie.rating) + '</span>',
                '</a>',
                '<div class="movie-card-body">',
                '<div class="movie-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
                '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
                '<p>' + escapeHtml(movie.oneLine) + '</p>',
                '<div class="tag-list">' + tags + '</div>',
                '</div>',
                '</article>'
            ].join('');
        }

        if (keyword) {
            var lowerKeyword = keyword.toLowerCase();
            var results = window.SITE_MOVIES.filter(function (movie) {
                var text = [
                    movie.title,
                    movie.region,
                    movie.type,
                    movie.year,
                    movie.genre,
                    movie.oneLine,
                    (movie.tags || []).join(' ')
                ].join(' ').toLowerCase();

                return text.indexOf(lowerKeyword) !== -1;
            });

            if (searchTitle) {
                searchTitle.textContent = '搜索：' + keyword;
            }

            if (resultBox) {
                resultBox.innerHTML = results.length ? results.map(renderCard).join('') : '<div class="filter-empty" style="display:block">暂无匹配的影视内容</div>';
            }
        }
    }
}());
