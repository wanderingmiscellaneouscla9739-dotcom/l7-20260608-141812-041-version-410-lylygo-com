(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function setupMobileMenu() {
        var button = document.querySelector("[data-mobile-menu-button]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function setupSearchForms() {
        document.querySelectorAll("[data-site-search]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q'], input[type='search']");
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                    input && input.focus();
                    return;
                }
                form.setAttribute("action", "search.html");
                var named = form.querySelector("input[name='q']");
                if (!named && input) {
                    input.setAttribute("name", "q");
                }
            });
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var previous = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });
        previous && previous.addEventListener("click", function () {
            show(index - 1);
            start();
        });
        next && next.addEventListener("click", function () {
            show(index + 1);
            start();
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        start();
    }

    function setupCategoryFilter() {
        var wrappers = document.querySelectorAll("[data-category-filter]");
        wrappers.forEach(function (wrapper) {
            var section = wrapper.closest("section") || document;
            var cards = Array.prototype.slice.call(section.querySelectorAll("[data-movie-card]"));
            var keyword = wrapper.querySelector("[data-filter-keyword]");
            var year = wrapper.querySelector("[data-filter-year]");
            var region = wrapper.querySelector("[data-filter-region]");
            var empty = section.querySelector("[data-empty-state]");

            if (year && year.options.length <= 1) {
                var years = Array.prototype.slice.call(new Set(cards.map(function (card) {
                    return card.getAttribute("data-year") || "";
                }).filter(Boolean))).sort().reverse();
                years.slice(0, 24).forEach(function (value) {
                    var option = document.createElement("option");
                    option.value = value;
                    option.textContent = value;
                    year.appendChild(option);
                });
            }

            if (region && region.options.length <= 1) {
                var regions = Array.prototype.slice.call(new Set(cards.map(function (card) {
                    return card.getAttribute("data-region") || "";
                }).filter(Boolean))).sort();
                regions.slice(0, 24).forEach(function (value) {
                    var option = document.createElement("option");
                    option.value = value;
                    option.textContent = value;
                    region.appendChild(option);
                });
            }

            function apply() {
                var term = keyword ? keyword.value.trim().toLowerCase() : "";
                var selectedYear = year ? year.value : "";
                var selectedRegion = region ? region.value : "";
                var visible = 0;
                cards.forEach(function (card) {
                    var searchable = [
                        card.getAttribute("data-title") || "",
                        card.getAttribute("data-tags") || "",
                        card.textContent || ""
                    ].join(" ").toLowerCase();
                    var ok = true;
                    if (term && searchable.indexOf(term) === -1) {
                        ok = false;
                    }
                    if (selectedYear && card.getAttribute("data-year") !== selectedYear) {
                        ok = false;
                    }
                    if (selectedRegion && card.getAttribute("data-region") !== selectedRegion) {
                        ok = false;
                    }
                    card.hidden = !ok;
                    if (ok) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }

            [keyword, year, region].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
        });
    }

    function setupSearchPage() {
        var results = document.getElementById("searchResults");
        if (!results || !window.MOVIE_SEARCH_INDEX) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var q = (params.get("q") || "").trim();
        var input = document.querySelector("[data-search-page-input]");
        var summary = document.querySelector("[data-search-summary]");
        var empty = document.querySelector("[data-search-empty]");
        if (input) {
            input.value = q;
        }
        if (!q) {
            if (summary) {
                summary.textContent = "输入关键词后可搜索片名、地区、年份、类型与标签。";
            }
            return;
        }
        var terms = q.toLowerCase().split(/\s+/).filter(Boolean);
        var matches = window.MOVIE_SEARCH_INDEX.filter(function (movie) {
            var haystack = [
                movie.title,
                movie.category,
                movie.year,
                movie.region,
                movie.genre,
                movie.oneLine,
                (movie.tags || []).join(" ")
            ].join(" ").toLowerCase();
            return terms.every(function (term) {
                return haystack.indexOf(term) !== -1;
            });
        });
        if (summary) {
            summary.textContent = "搜索：“" + q + "”";
        }
        if (empty) {
            empty.hidden = matches.length !== 0;
        }
        results.innerHTML = matches.slice(0, 2000).map(function (movie) {
            var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
                return "<span>" + escapeHtml(tag) + "</span>";
            }).join("");
            return [
                "<article class=\"movie-card movie-card--normal\">",
                "<a class=\"movie-card__cover\" href=\"" + escapeHtml(movie.url) + "\" aria-label=\"" + escapeHtml(movie.title) + "\">",
                "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\" decoding=\"async\">",
                "<span class=\"movie-card__shade\"></span>",
                "<span class=\"movie-card__play\">▶</span>",
                "<span class=\"movie-card__category\">" + escapeHtml(movie.category) + "</span>",
                "<span class=\"movie-card__meta\">★ " + escapeHtml(movie.rating) + " · " + escapeHtml(movie.duration) + "</span>",
                "</a>",
                "<div class=\"movie-card__body\">",
                "<h3><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>",
                "<p>" + escapeHtml(movie.oneLine) + "</p>",
                "<div class=\"movie-card__tags\">" + tags + "</div>",
                "</div>",
                "</article>"
            ].join("");
        }).join("");
    }

    function setupPlayers() {
        document.querySelectorAll("[data-player]").forEach(function (player) {
            var video = player.querySelector("video");
            var overlay = player.querySelector("[data-player-overlay]");
            if (!video || !overlay) {
                return;
            }
            var source = video.getAttribute("data-video-url") || "";
            var hls = null;

            function showError(message) {
                overlay.classList.remove("is-hidden");
                overlay.querySelector(".player-overlay__meta").textContent = message;
            }

            function beginPlayback() {
                overlay.classList.add("is-hidden");
                var attempt = video.play();
                if (attempt && typeof attempt.catch === "function") {
                    attempt.catch(function () {
                        overlay.classList.remove("is-hidden");
                    });
                }
            }

            function initialize() {
                if (!source) {
                    showError("播放源暂不可用");
                    return;
                }
                if (video.getAttribute("data-ready") === "true") {
                    beginPlayback();
                    return;
                }
                video.setAttribute("data-ready", "true");
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: false,
                        backBufferLength: 60
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, beginPlayback);
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            try {
                                hls.destroy();
                            } catch (error) {}
                            video.src = source;
                            beginPlayback();
                        }
                    });
                    return;
                }
                if (video.canPlayType("application/vnd.apple.mpegurl") || video.canPlayType("application/x-mpegURL")) {
                    video.src = source;
                    video.addEventListener("loadedmetadata", beginPlayback, { once: true });
                    video.load();
                    return;
                }
                video.src = source;
                video.load();
                beginPlayback();
            }

            overlay.addEventListener("click", initialize);
            video.addEventListener("click", function () {
                if (video.paused) {
                    initialize();
                }
            });
        });
    }

    function setupPlayerScroll() {
        document.querySelectorAll("[data-scroll-player]").forEach(function (link) {
            link.addEventListener("click", function (event) {
                var player = document.querySelector("[data-player]");
                if (player) {
                    event.preventDefault();
                    player.scrollIntoView({ behavior: "smooth", block: "center" });
                }
            });
        });
    }

    ready(function () {
        setupMobileMenu();
        setupSearchForms();
        setupHero();
        setupCategoryFilter();
        setupSearchPage();
        setupPlayers();
        setupPlayerScroll();
    });
})();
