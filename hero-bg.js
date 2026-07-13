const heroFrame = document.querySelector('.ai-hero-media iframe[data-src]');
const reduceHeroMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (heroFrame && !reduceHeroMotion) {
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
