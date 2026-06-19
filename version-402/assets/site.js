(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupNavigation() {
        var toggle = document.querySelector(".mobile-toggle");
        if (!toggle) {
            return;
        }
        toggle.addEventListener("click", function () {
            var opened = document.body.classList.toggle("nav-open");
            toggle.setAttribute("aria-expanded", opened ? "true" : "false");
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
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
            }, 6200);
        }
        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                var nextIndex = Number(dot.getAttribute("data-hero-dot"));
                show(nextIndex);
                start();
            });
        });
        var hero = document.querySelector(".hero");
        if (hero) {
            hero.addEventListener("mouseenter", stop);
            hero.addEventListener("mouseleave", start);
        }
        start();
    }

    function setupFiltering() {
        var input = document.querySelector("[data-page-search]");
        var list = document.querySelector(".searchable-list");
        if (!input || !list) {
            return;
        }
        var items = Array.prototype.slice.call(list.querySelectorAll(".search-item"));
        var empty = document.querySelector(".no-results");
        function normalize(value) {
            return String(value || "").trim().toLowerCase();
        }
        function apply(value) {
            var keyword = normalize(value);
            var visible = 0;
            items.forEach(function (item) {
                var haystack = normalize(item.getAttribute("data-search"));
                var matched = !keyword || haystack.indexOf(keyword) !== -1;
                item.classList.toggle("is-hidden", !matched);
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.hidden = visible !== 0;
            }
        }
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        if (query) {
            input.value = query;
        }
        input.addEventListener("input", function () {
            apply(input.value);
        });
        apply(input.value);
    }

    function setupBackTop() {
        var button = document.querySelector(".back-top");
        if (!button) {
            return;
        }
        function sync() {
            button.classList.toggle("is-visible", window.scrollY > 420);
        }
        button.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
        window.addEventListener("scroll", sync, { passive: true });
        sync();
    }

    window.initMoviePlayer = function (source) {
        var video = document.getElementById("movie-player");
        var cover = document.getElementById("player-cover");
        if (!video || !cover || !source) {
            return;
        }
        var loaded = false;
        var hls = null;
        function begin() {
            cover.classList.add("is-hidden");
            if (!loaded) {
                loaded = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                    video.addEventListener("loadedmetadata", function () {
                        video.play().catch(function () {});
                    }, { once: true });
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                } else {
                    video.src = source;
                    video.play().catch(function () {});
                }
            } else {
                video.play().catch(function () {});
            }
        }
        cover.addEventListener("click", begin);
        video.addEventListener("play", function () {
            cover.classList.add("is-hidden");
        });
        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };

    ready(function () {
        setupNavigation();
        setupHero();
        setupFiltering();
        setupBackTop();
    });
}());
