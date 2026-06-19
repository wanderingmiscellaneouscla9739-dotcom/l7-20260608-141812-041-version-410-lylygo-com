export async function initPlayer(sourceUrl) {
    var frame = document.querySelector("[data-player]");

    if (!frame) {
        return;
    }

    var video = frame.querySelector("video");
    var overlay = frame.querySelector(".player-overlay");
    var loaded = false;
    var hlsInstance = null;

    if (!video || !overlay) {
        return;
    }

    async function loadSource() {
        if (loaded) {
            return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = sourceUrl;
        } else {
            try {
                var module = await import("./hls-vendor.js");
                var Hls = module.H;

                if (Hls && Hls.isSupported()) {
                    hlsInstance = new Hls({
                        enableWorker: true,
                        lowLatencyMode: false
                    });
                    hlsInstance.loadSource(sourceUrl);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = sourceUrl;
                }
            } catch (error) {
                video.src = sourceUrl;
            }
        }

        loaded = true;
    }

    async function playVideo() {
        await loadSource();
        frame.classList.add("is-playing");
        video.controls = true;

        try {
            await video.play();
        } catch (error) {
            video.controls = true;
        }
    }

    overlay.addEventListener("click", playVideo);

    video.addEventListener("click", function () {
        if (video.paused) {
            playVideo();
        }
    });

    video.addEventListener("play", function () {
        frame.classList.add("is-playing");
    });

    video.addEventListener("ended", function () {
        frame.classList.remove("is-playing");
        video.controls = false;
    });

    window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
