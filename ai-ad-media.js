(() => {
    const variant = window.DOGAZUKURI_VARIANT;
    const selected = (value) => {
        if (!Array.isArray(value)) return null;
        return new Set(value.map(item => typeof item === 'string' ? item : item && (item.id || item.key)).filter(Boolean));
    };
    const apply = (selector, config) => {
        const ids = selected(config);
        if (!ids) return;
        document.querySelectorAll(selector).forEach(card => {
            const visible = ids.has(card.dataset.aiMediaId || card.dataset.publishedWorkId);
            card.hidden = !visible;
            card.querySelectorAll('video, iframe').forEach(media => {
                if (!visible) {
                    media.removeAttribute('src');
                    media.removeAttribute('data-src');
                } else if (media.tagName === 'IFRAME' && media.dataset.src) {
                    if (media.hasAttribute('data-click-to-load')) return;
                    media.src = media.dataset.src;
                }
            });
        });
    };
    apply('[data-ai-media-id]', variant && variant.aiMediaIds);
    apply('[data-published-work-id]', variant && variant.publishedWorkIds);
})();

document.querySelectorAll('[data-load-embed]').forEach(button => {
    button.addEventListener('click', () => {
        const frame = button.closest('.embed-frame');
        const iframe = frame && frame.querySelector('iframe[data-click-to-load][data-src]');
        if (!iframe) return;
        iframe.src = iframe.dataset.src;
        iframe.hidden = false;
        const poster = frame.querySelector('.embed-preview-poster');
        if (poster) poster.hidden = true;
        button.hidden = true;
        iframe.focus({ preventScroll: true });
    });
});

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const videos = [...document.querySelectorAll('video[data-src]')];
function load(v) { if (!v.src) { v.src = v.dataset.src; v.load(); } }
videos.forEach(v => {
    v.tabIndex = 0;
    v.addEventListener('click', () => { load(v); v.paused ? v.play() : v.pause(); });
    v.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); v.click(); } });
});
if (!reduceMotion && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
        const v = e.target;
        if (e.isIntersecting && e.intersectionRatio >= .6) { load(v); videos.forEach(x => { if (x !== v) x.pause(); }); v.play().catch(() => {}); }
        else v.pause();
    }), { threshold: [0, .6, 1], rootMargin: '200px 0px' });
    videos.forEach(v => io.observe(v));
}
document.addEventListener('visibilitychange', () => { if (document.hidden) videos.forEach(v => v.pause()); });
