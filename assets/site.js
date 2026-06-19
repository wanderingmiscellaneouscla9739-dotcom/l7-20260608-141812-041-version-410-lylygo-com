(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function initMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-site-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("open");
        });
    }

    function initHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
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

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                start();
            });
        });
        root.addEventListener("mouseenter", stop);
        root.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function normalize(text) {
        return String(text || "").toLowerCase().replace(/\s+/g, " ").trim();
    }

    function initFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll(".filter-panel"));
        panels.forEach(function (panel) {
            var input = panel.querySelector("[data-filter-input]");
            var buttons = Array.prototype.slice.call(panel.querySelectorAll("[data-filter-value]"));
            var list = panel.parentElement ? panel.parentElement.querySelector("[data-filter-list]") : null;
            if (!list) {
                return;
            }
            var cards = Array.prototype.slice.call(list.querySelectorAll("[data-movie-card]"));
            var empty = document.createElement("div");
            empty.className = "empty-filter";
            empty.textContent = "没有匹配的影片";
            list.parentElement.insertBefore(empty, list.nextSibling);
            var selected = "all";

            function apply() {
                var query = normalize(input ? input.value : "");
                var shown = 0;
                cards.forEach(function (card) {
                    var haystack = normalize(card.getAttribute("data-search") || "");
                    var type = normalize(card.getAttribute("data-type") || "");
                    var year = normalize(card.getAttribute("data-year") || "");
                    var passQuery = !query || haystack.indexOf(query) !== -1;
                    var passButton = selected === "all" || type.indexOf(normalize(selected)) !== -1 || year.indexOf(normalize(selected)) !== -1 || haystack.indexOf(normalize(selected)) !== -1;
                    var visible = passQuery && passButton;
                    card.style.display = visible ? "" : "none";
                    if (visible) {
                        shown += 1;
                    }
                });
                empty.style.display = shown ? "none" : "block";
            }

            if (input) {
                var params = new URLSearchParams(window.location.search);
                var q = params.get("q");
                if (q) {
                    input.value = q;
                }
                input.addEventListener("input", apply);
            }
            buttons.forEach(function (button) {
                button.addEventListener("click", function () {
                    selected = button.getAttribute("data-filter-value") || "all";
                    buttons.forEach(function (item) {
                        item.classList.toggle("active", item === button);
                    });
                    apply();
                });
            });
            apply();
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
    });
})();

function initializePlayer(playlistUrl) {
    var video = document.querySelector(".video-player");
    var button = document.querySelector("[data-play-button]");
    if (!video || !playlistUrl) {
        return;
    }

    var started = false;

    function loadHlsLibrary() {
        return new Promise(function (resolve, reject) {
            if (window.Hls) {
                resolve(window.Hls);
                return;
            }
            var script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/npm/hls.js@latest";
            script.onload = function () {
                resolve(window.Hls);
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    function playVideo() {
        if (button) {
            button.classList.add("hidden");
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {});
        }
    }

    function start() {
        if (started) {
            playVideo();
            return;
        }
        started = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = playlistUrl;
            playVideo();
            return;
        }
        loadHlsLibrary().then(function (Hls) {
            if (Hls && Hls.isSupported()) {
                var hls = new Hls({ enableWorker: true });
                hls.loadSource(playlistUrl);
                hls.attachMedia(video);
                hls.on(Hls.Events.MANIFEST_PARSED, playVideo);
            } else {
                video.src = playlistUrl;
                playVideo();
            }
        }).catch(function () {
            video.src = playlistUrl;
            playVideo();
        });
    }

    if (button) {
        button.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
        if (video.paused) {
            start();
        }
    });
}
