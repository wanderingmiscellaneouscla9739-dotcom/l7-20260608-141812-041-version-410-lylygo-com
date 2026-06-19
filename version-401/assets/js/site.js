document.addEventListener("DOMContentLoaded", function () {
    const navToggle = document.querySelector(".nav-toggle");
    const nav = document.querySelector(".site-nav");

    if (navToggle && nav) {
        navToggle.addEventListener("click", function () {
            const open = nav.classList.toggle("is-open");
            navToggle.setAttribute("aria-expanded", String(open));
        });
    }

    const sliders = document.querySelectorAll("[data-hero-slider]");

    sliders.forEach(function (slider) {
        const slides = Array.from(slider.querySelectorAll(".hero-slide"));
        const dots = Array.from(slider.querySelectorAll(".hero-dot"));
        const prev = slider.querySelector(".hero-prev");
        const next = slider.querySelector(".hero-next");
        let index = 0;
        let timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function restart() {
            if (timer) {
                clearInterval(timer);
            }

            timer = setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(index + 1);
                restart();
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                showSlide(dotIndex);
                restart();
            });
        });

        showSlide(0);
        restart();
    });

    document.querySelectorAll(".movie-rail").forEach(function (rail) {
        const section = rail.closest("section");
        const prev = section ? section.querySelector(".rail-prev") : null;
        const next = section ? section.querySelector(".rail-next") : null;

        if (prev) {
            prev.addEventListener("click", function () {
                rail.scrollBy({ left: -420, behavior: "smooth" });
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                rail.scrollBy({ left: 420, behavior: "smooth" });
            });
        }
    });

    const searchInputs = document.querySelectorAll(".site-search");

    searchInputs.forEach(function (input) {
        const scope = input.closest("main") || document;
        const cards = Array.from(scope.querySelectorAll(".movie-card, .rank-row"));
        const empty = scope.querySelector(".empty-state");

        input.addEventListener("input", function () {
            const query = input.value.trim().toLowerCase();
            let visible = 0;

            cards.forEach(function (card) {
                const text = [
                    card.dataset.title,
                    card.dataset.year,
                    card.dataset.type,
                    card.dataset.region
                ].join(" ").toLowerCase();
                const matched = !query || text.includes(query);
                card.hidden = !matched;

                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.hidden = visible !== 0;
            }
        });
    });

    const filterBar = document.querySelector(".filter-bar");

    if (filterBar) {
        const buttons = Array.from(filterBar.querySelectorAll("button"));
        const cards = Array.from(document.querySelectorAll(".movie-card"));

        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                buttons.forEach(function (item) {
                    item.classList.remove("is-active");
                });

                button.classList.add("is-active");
                const key = button.dataset.filter;

                cards.forEach(function (card) {
                    card.hidden = key !== "all" && card.dataset.category !== key;
                });
            });
        });
    }
});
