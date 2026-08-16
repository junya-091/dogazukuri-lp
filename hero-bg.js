const heroConfig = window.DOGAZUKURI_VARIANT && window.DOGAZUKURI_VARIANT.hero;
const heroVideo = window.DOGAZUKURI_VARIANT && window.DOGAZUKURI_VARIANT.heroVideo;
const heroFrame = document.querySelector('.ai-hero-media iframe[data-src]');
const heroPoster = document.querySelector('.ai-hero-media img');
const reduceHeroMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const heroEnabled = !heroConfig || heroConfig.enabled !== false && heroConfig.visible !== false;

if (heroFrame && heroVideo) {
    const params = new URLSearchParams({
        autoplay: '1',
        mute: '1',
        controls: '0',
        loop: '1',
        playlist: heroVideo.youtubeId,
        playsinline: '1',
        rel: '0',
        modestbranding: '1',
        enablejsapi: '1'
    });
    heroFrame.dataset.heroId = heroVideo.id;
    heroFrame.dataset.src = `https://www.youtube-nocookie.com/embed/${heroVideo.youtubeId}?${params}`;
    if (heroPoster) heroPoster.src = heroVideo.poster;
}

if (heroFrame && heroEnabled && !reduceHeroMotion) {
    heroFrame.src = heroFrame.dataset.src;

    window.onYouTubeIframeAPIReady = () => {
        new window.YT.Player(heroFrame, {
            events: {
                onReady(event) {
                    event.target.mute();
                    event.target.playVideo();
                },
                onStateChange(event) {
                    if (event.data === window.YT.PlayerState.PLAYING) {
                        heroFrame.parentElement.classList.add('is-loaded');
                    }
                }
            }
        });
    };

    const api = document.createElement('script');
    api.src = 'https://www.youtube.com/iframe_api';
    api.async = true;
    document.head.appendChild(api);
}
