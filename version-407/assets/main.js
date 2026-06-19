(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    ready(function () {
        var toggle = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");

        if (toggle && menu) {
            toggle.addEventListener("click", function () {
                menu.classList.toggle("is-open");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dots button"));
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function startCarousel() {
            if (timer || slides.length < 2) {
                return;
            }

            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                showSlide(dotIndex);
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                    startCarousel();
                }
            });
        });

        showSlide(0);
        startCarousel();

        var filterInput = document.querySelector("[data-filter-input]");
        var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-button]"));
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card[data-search]"));
        var activeCategory = "all";

        function applyFilter() {
            var query = filterInput ? filterInput.value.trim().toLowerCase() : "";

            cards.forEach(function (card) {
                var haystack = (card.getAttribute("data-search") || "").toLowerCase();
                var category = card.getAttribute("data-category") || "";
                var byCategory = activeCategory === "all" || category === activeCategory;
                var byQuery = !query || haystack.indexOf(query) !== -1;
                card.style.display = byCategory && byQuery ? "" : "none";
            });
        }

        if (filterInput) {
            filterInput.addEventListener("input", applyFilter);
        }

        filterButtons.forEach(function (button) {
            button.addEventListener("click", function () {
                activeCategory = button.getAttribute("data-filter-button") || "all";

                filterButtons.forEach(function (item) {
                    item.classList.toggle("is-active", item === button);
                });

                applyFilter();
            });
        });

        var searchRoot = document.querySelector("[data-search-results]");
        var searchInput = document.querySelector("[data-search-page-input]");
        var searchForm = document.querySelector("[data-search-page-form]");

        function getSearchQuery() {
            var params = new URLSearchParams(window.location.search);
            return (params.get("q") || "").trim();
        }

        function renderSearch(query) {
            if (!searchRoot || !window.SITE_MOVIES) {
                return;
            }

            var normalized = query.toLowerCase();
            var results = window.SITE_MOVIES.filter(function (movie) {
                return !normalized || movie.search.toLowerCase().indexOf(normalized) !== -1;
            }).slice(0, 120);

            if (!results.length) {
                searchRoot.innerHTML = '<div class="empty-state">没有找到匹配内容，可以换一个片名、地区或类型再试。</div>';
                return;
            }

            searchRoot.innerHTML = results.map(function (movie) {
                return [
                    '<article class="movie-card">',
                    '<a class="poster-link" href="' + movie.url + '">',
                    '<img src="' + movie.image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
                    '<span class="poster-badge">' + movie.rating + '</span>',
                    '</a>',
                    '<div class="movie-card-body">',
                    '<div class="card-meta-line"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
                    '<h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
                    '<p>' + escapeHtml(movie.oneLine) + '</p>',
                    '<div class="card-footer-line"><a href="' + movie.categoryUrl + '">' + escapeHtml(movie.category) + '</a><span>' + movie.rating + ' 分</span></div>',
                    '</div>',
                    '</article>'
                ].join("");
            }).join("");
        }

        function escapeHtml(value) {
            return String(value)
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }

        if (searchRoot) {
            var query = getSearchQuery();

            if (searchInput) {
                searchInput.value = query;
            }

            renderSearch(query);
        }

        if (searchForm && searchInput) {
            searchForm.addEventListener("submit", function (event) {
                event.preventDefault();
                var value = searchInput.value.trim();
                var target = value ? "./search.html?q=" + encodeURIComponent(value) : "./search.html";
                window.history.replaceState(null, "", target);
                renderSearch(value);
            });
        }
    });
})();
