/* ==========================================================================
   ドーガづくり "ONE TAKE" — core.js (owner: F)
   Lenis + GSAP wiring, ctx, safe module runner, timeline HUD, cursor, grain,
   film-leader preloader, lite YouTube modal, nav, anchors, small helpers.
   Other agents: import from here; extend by adding exports only.
   ========================================================================== */

const W = window;
const doc = document;
const root = doc.documentElement;
const { gsap, ScrollTrigger, Flip, SplitText, CustomEase } = W;

/* ---------- environment ---------- */
const mqReduced = W.matchMedia('(prefers-reduced-motion: reduce)');
const mqFine = W.matchMedia('(hover: hover) and (pointer: fine)');
const mqMobile = W.matchMedia('(max-width: 767px)');
const mqDesktop = W.matchMedia('(min-width: 1024px)');
export const reduced = mqReduced.matches;
export const isTouch = !mqFine.matches;
export const isMobile = () => mqMobile.matches;
export const isDesktop = () => mqDesktop.matches;
export const BP = { mobileMax: 767, tabletMin: 768, desktopMin: 1024 };
root.classList.add('js');
if (reduced) root.classList.add('reduced');

if (gsap) {
  const plugins = [ScrollTrigger, Flip, SplitText, CustomEase].filter(Boolean);
  gsap.registerPlugin(...plugins);
  if (CustomEase) {
    CustomEase.create('cut', 'M0,0 C0.7,0 0.2,1 1,1');
    CustomEase.create('whip', 'M0,0 C0.9,0 0.1,1 1,1');
  }
  gsap.defaults({ ease: 'power3.out', duration: 0.6 });
}

/* ---------- small helpers ---------- */
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const qs = (s, el = doc) => el.querySelector(s);
export const qsa = (s, el = doc) => Array.from(el.querySelectorAll(s));
export const FPS = 24;

/** "HH:MM:SS:FF" from a frame count (24fps by default). */
export function timecode(frames, fps = FPS) {
  frames = Math.max(0, Math.floor(frames));
  const ff = frames % fps;
  const s = Math.floor(frames / fps);
  const p = (n) => String(n).padStart(2, '0');
  return `${p(Math.floor(s / 3600))}:${p(Math.floor(s / 60) % 60)}:${p(s % 60)}:${p(ff)}`;
}

const resizeFns = new Set();
let resizeTimer = 0;
W.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => resizeFns.forEach((fn) => { try { fn(); } catch (e) { console.warn(e); } }), 120);
});
/** Debounced resize subscription. Returns an unsubscribe fn. */
export function onResize(fn) { resizeFns.add(fn); return () => resizeFns.delete(fn); }

/**
 * rAF loop that only runs while `el` intersects the viewport and the tab is visible.
 * fn(timeMs, dtMs). Returns { stop(), start(), get running() }.
 */
export function loop(el, fn, { rootMargin = '0px' } = {}) {
  let raf = 0, last = 0, inView = false, killed = false;
  const tick = (t) => {
    raf = 0;
    if (killed || !inView || doc.hidden) return;
    const dt = last ? Math.min(64, t - last) : 16;
    last = t;
    fn(t, dt);
    raf = requestAnimationFrame(tick);
  };
  const start = () => { if (!raf && !killed && inView && !doc.hidden) { last = 0; raf = requestAnimationFrame(tick); } };
  const stop = () => { if (raf) cancelAnimationFrame(raf); raf = 0; };
  const io = new IntersectionObserver((es) => { inView = es[es.length - 1].isIntersecting; inView ? start() : stop(); }, { rootMargin });
  io.observe(el);
  const vis = () => (doc.hidden ? stop() : start());
  doc.addEventListener('visibilitychange', vis);
  return {
    start, stop,
    kill() { killed = true; stop(); io.disconnect(); doc.removeEventListener('visibilitychange', vis); },
    get running() { return !!raf; }
  };
}

/**
 * Telop cut-in: each target must be a line wrapper (overflow:hidden) whose first child
 * gets stepped in from below over `frames` frames @24fps. Returns the tween/timeline.
 */
export function cutIn(lines, { frames = 3, stagger = 0.09, delay = 0, from = 105, paused = false } = {}) {
  const inner = gsap.utils.toArray(lines).map((l) => l.firstElementChild || l);
  return gsap.fromTo(inner, { y: 0, yPercent: from }, { y: 0, yPercent: 0, duration: frames / FPS, ease: `steps(${frames})`, stagger, delay, paused, overwrite: true });
}
export function cutOut(lines, { frames = 2, stagger = 0.03, to = -105 } = {}) {
  const inner = gsap.utils.toArray(lines).map((l) => l.firstElementChild || l);
  return gsap.to(inner, { y: 0, yPercent: to, duration: frames / FPS, ease: `steps(${frames})`, stagger, overwrite: true });
}

/** Lazy-load <img data-src> / <video data-src> inside root when near viewport. */
export function lazyMedia(scope = doc, rootMargin = '600px 0px') {
  const els = qsa('img[data-src], video[data-src], source[data-srcset]', scope);
  const io = new IntersectionObserver((es) => {
    es.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      if (el.dataset.src) { el.src = el.dataset.src; el.removeAttribute('data-src'); }
      io.unobserve(el);
    });
  }, { rootMargin });
  els.forEach((el) => io.observe(el));
  return io;
}

/** Play muted videos only while visible (respects reduced motion: never autoplays). */
export function autoplayWhenVisible(video, { threshold = 0.25 } = {}) {
  video.muted = true; video.playsInline = true;
  if (reduced) return null;
  const io = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { if (!video.src && video.dataset.src) video.src = video.dataset.src; video.play().catch(() => {}); }
    else video.pause();
  }, { threshold });
  io.observe(video);
  return io;
}

/* ---------- Lenis ---------- */
let lenis = null;
function setupLenis() {
  if (reduced || !W.Lenis || !gsap) return null;
  const l = new W.Lenis({ lerp: 0.11, wheelMultiplier: 1, smoothWheel: true, syncTouch: false, autoRaf: false });
  l.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => l.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  return l;
}

export function scrollToY(y, { immediate = false, duration = 1.2 } = {}) {
  if (lenis && !immediate) lenis.scrollTo(y, { duration, easing: (t) => 1 - Math.pow(1 - t, 4) });
  else W.scrollTo(0, y);
}
/** Document top of an element, accounting for GSAP pin-spacers. */
export function docTop(el) {
  const box = el.parentElement && el.parentElement.classList.contains('pin-spacer') ? el.parentElement : el;
  return box.getBoundingClientRect().top + W.scrollY;
}
export function docHeight(el) {
  const box = el.parentElement && el.parentElement.classList.contains('pin-spacer') ? el.parentElement : el;
  return box.offsetHeight;
}

/* ---------- Grain ---------- */
function setupGrain() {
  const g = doc.createElement('div');
  g.className = 'grain';
  g.setAttribute('aria-hidden', 'true');
  const c = doc.createElement('canvas');
  c.width = c.height = 180;
  const x = c.getContext('2d');
  const img = x.createImageData(180, 180);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = (Math.random() * 255) | 0;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  x.putImageData(img, 0, 0);
  g.style.setProperty('--grain-url', `url(${c.toDataURL('image/png')})`);
  doc.body.appendChild(g);
}

/* ---------- Cursor (focus-frame brackets) ---------- */
export const cursor = { el: null, set() {}, label() {} };
function setupCursor() {
  if (!mqFine.matches) return;
  const el = doc.createElement('div');
  el.className = 'cursor';
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = '<div class="cursor__frame"><i></i><i></i><i></i><i></i></div><div class="cursor__dot"></div><div class="cursor__disc">PLAY</div>';
  el.dataset.state = 'hidden';
  doc.body.appendChild(el);
  root.classList.add('has-cursor');
  const frame = el.querySelector('.cursor__frame');
  const disc = el.querySelector('.cursor__disc');
  const dot = el.querySelector('.cursor__dot');
  let tx = -100, ty = -100, x = -100, y = -100, raf = 0, forced = null, lastTarget = null;
  const k = reduced ? 1 : 0.24;
  const tick = () => {
    x = lerp(x, tx, k); y = lerp(y, ty, k);
    frame.style.transform = disc.style.transform = '';
    frame.style.left = disc.style.left = `${x}px`;
    frame.style.top = disc.style.top = `${y}px`;
    dot.style.left = `${tx}px`; dot.style.top = `${ty}px`;
    raf = Math.abs(x - tx) + Math.abs(y - ty) > 0.2 ? requestAnimationFrame(tick) : 0;
  };
  const stateFor = (t) => {
    if (forced) return forced;
    const d = t && t.closest && t.closest('[data-cursor]');
    if (d) return d.getAttribute('data-cursor');
    if (t && t.closest && t.closest('a, button, summary, label, select, [role="button"], [tabindex]:not([tabindex="-1"])')) return 'link';
    return 'default';
  };
  const apply = (t) => {
    const s = stateFor(t);
    el.dataset.state = s;
    const d = t && t.closest && t.closest('[data-cursor-label]');
    disc.textContent = d ? d.getAttribute('data-cursor-label') : (s === 'drag' ? 'DRAG' : 'PLAY');
  };
  W.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    tx = e.clientX; ty = e.clientY;
    if (el.dataset.state === 'hidden') { x = tx; y = ty; }
    if (e.target !== lastTarget) { lastTarget = e.target; apply(e.target); }
    if (!raf) raf = requestAnimationFrame(tick);
  }, { passive: true });
  doc.addEventListener('pointerover', (e) => apply(e.target), { passive: true });
  doc.addEventListener('pointerdown', () => el.classList.add('is-down'));
  doc.addEventListener('pointerup', () => el.classList.remove('is-down'));
  doc.addEventListener('mouseleave', () => { el.dataset.state = 'hidden'; });
  doc.addEventListener('mouseenter', (e) => apply(e.target));
  cursor.el = el;
  /** force a state ('play' | 'drag' | 'link' | 'hidden' | 'default'); pass null to release */
  cursor.set = (s) => { forced = s; el.dataset.state = s || 'default'; };
  cursor.label = (txt) => { disc.textContent = txt; };
}

/* ---------- Preloader: film leader ---------- */
const loads = [];
/** Register a promise the film leader should wait for (max 1.5s total). Call during init. */
export function registerLoad(p) { loads.push(Promise.resolve(p).catch(() => {})); }
let resolveReady;
export const ready = new Promise((r) => { resolveReady = r; });

function runLeader() {
  const el = qs('.leader');
  const SEEN = 'dz-leader-seen';
  let seen = false;
  try { seen = sessionStorage.getItem(SEEN) === '1'; } catch (_) { /* private mode */ }
  if (!el || reduced || seen || !gsap || /[?&]noleader\b/.test(location.search)) {
    if (el) el.classList.add('is-done');
    resolveReady();
    return;
  }
  try { sessionStorage.setItem(SEEN, '1'); } catch (_) { /* ignore */ }
  if (lenis) lenis.stop();
  const num = qs('.leader__num', el);
  const sweep = qs('.leader__sweep', el);
  const pct = qs('[data-leader-pct]', el);
  const t0 = performance.now();
  const MAX = 1500, MIN = 1050;
  let done = 0, finished = false, raf = 0;
  const waitFor = () => {
    const total = loads.length + 1;
    loads.forEach((p) => p.then(() => { done++; }));
    doc.fonts && doc.fonts.ready.then(() => { done++; });
    return total;
  };
  let total = 1;
  // collect loads registered by modules during the first tick
  setTimeout(() => { total = waitFor(); }, 60);
  const finish = () => {
    if (finished) return;
    finished = true;
    cancelAnimationFrame(raf);
    num.textContent = '1';
    sweep.style.setProperty('--sweep', '360deg');
    const tl = gsap.timeline({
      onComplete: () => {
        el.classList.add('is-done');
        if (lenis) lenis.start();
        ScrollTrigger && ScrollTrigger.refresh();
      }
    });
    // clapper: sticks appear open, snap shut, 2-frame white flash, hard cut.
    tl.set('.leader__stick', { opacity: 1 })
      .fromTo('.leader__stick--top', { rotate: -24 }, { rotate: 0, duration: 0.16, ease: 'power4.in' })
      .call(() => resolveReady())
      .to('.leader__flash', { opacity: 1, duration: 1 / FPS, ease: 'none' })
      .to('.leader__flash', { opacity: 0, duration: 1 / FPS, ease: 'none' })
      .set(el, { autoAlpha: 0 });
  };
  const tick = (t) => {
    const elapsed = t - t0;
    const loadP = total ? Math.min(1, done / total) : 0;
    const p = Math.min(Math.max(loadP, elapsed / MAX), elapsed / MIN, 1);
    const n = 3 - Math.min(2, Math.floor(p * 3));
    if (num.textContent !== String(n)) num.textContent = String(n);
    sweep.style.setProperty('--sweep', `${((p * 3) % 1 || (p >= 1 ? 1 : 0)) * 360}deg`);
    if (pct) pct.textContent = timecode(elapsed / 1000 * FPS);
    if (p >= 1) return finish();
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  const skip = () => finish();
  el.addEventListener('click', skip, { once: true });
  W.addEventListener('keydown', skip, { once: true });
}

/* ---------- Timeline HUD ---------- */
export const hud = {
  clips: [],
  refresh() {},
  /** DOMRect of the HUD clip that represents `section` (or null on mobile). */
  clipRect(section) {
    const c = this.clips.find((c) => c.section === section);
    if (!c || !c.el.offsetParent) return null;
    return c.el.getBoundingClientRect();
  },
  clipEl(section) { const c = this.clips.find((c) => c.section === section); return c ? c.el : null; }
};
function setupHud() {
  const bar = qs('.hud');
  const sections = qsa('[data-clip]').filter((s) => !s.closest('.hud'));
  const navTc = qs('.nav__tc');
  const progressEl = qs('.nav');
  if (!sections.length) return;
  let clipsWrap, head, tcEl, nameEl;
  if (bar) {
    bar.innerHTML = '<div class="hud__tc" aria-hidden="true"><span>00:00:00:00</span></div>' +
      '<div class="hud__track"><div class="hud__clips" role="list" aria-label="ページ内シーケンス"></div><div class="hud__head" aria-hidden="true"></div></div>' +
      '<div class="hud__name" aria-hidden="true"><i>V1</i><b></b></div>';
    clipsWrap = qs('.hud__clips', bar); head = qs('.hud__head', bar); tcEl = qs('.hud__tc span', bar); nameEl = qs('.hud__name b', bar);
  }
  hud.clips = sections.map((section, i) => {
    let el = null;
    if (clipsWrap) {
      el = doc.createElement('button');
      el.type = 'button';
      el.className = 'hud__clip';
      el.setAttribute('role', 'listitem');
      el.dataset.accent = section.dataset.accent || 'red';
      el.innerHTML = `<span>${section.dataset.clip}</span>`;
      el.setAttribute('aria-label', `${section.dataset.clip}へ移動`);
      el.addEventListener('click', () => {
        const navH = section.id === 'top' ? 0 : (qs('.nav') ? qs('.nav').getBoundingClientRect().height - 1 : 0);
        scrollToY(Math.max(0, docTop(section) - navH));
      });
      clipsWrap.appendChild(el);
    }
    return { section, el, start: 0, end: 0, name: section.dataset.clip, index: i };
  });
  let max = 1, active = -1;
  const layout = () => {
    const vh = W.innerHeight;
    max = Math.max(1, root.scrollHeight - vh);
    hud.clips.forEach((c, i) => { c.start = i === 0 ? 0 : clamp(docTop(c.section) - vh * 0.5, 0, max); });
    hud.clips.forEach((c, i) => { c.end = i < hud.clips.length - 1 ? hud.clips[i + 1].start : max; });
    if (clipsWrap) hud.clips.forEach((c) => {
      c.el.style.left = `${(c.start / max) * 100}%`;
      c.el.style.width = `${Math.max(0, (c.end - c.start) / max) * 100}%`;
    });
    update();
  };
  const update = () => {
    const y = W.scrollY;
    const vh = W.innerHeight;
    const frames = y / (vh / FPS);
    const tc = timecode(frames);
    if (tcEl) tcEl.textContent = tc;
    if (navTc) navTc.textContent = tc;
    if (head) head.style.setProperty('--x', `${(clamp(y / max, 0, 1)) * head.parentElement.clientWidth}px`);
    if (progressEl) progressEl.style.setProperty('--progress', clamp(y / max, 0, 1).toFixed(4));
    let a = 0;
    hud.clips.forEach((c, i) => { if (y >= c.start - 1) a = i; });
    if (a !== active) {
      active = a;
      hud.clips.forEach((c, i) => c.el && c.el.classList.toggle('is-active', i === a));
      if (nameEl) nameEl.textContent = hud.clips[a].name;
      const id = hud.clips[a].section.id;
      qsa('.nav__links a[href^="#"]').forEach((l) => l.toggleAttribute('aria-current', l.getAttribute('href') === `#${id}`));
      qsa('.nav__links a[aria-current]').forEach((l) => l.setAttribute('aria-current', 'true'));
      doc.dispatchEvent(new CustomEvent('dz:clip', { detail: { index: a, section: hud.clips[a].section } }));
    }
  };
  hud.refresh = layout;
  W.addEventListener('scroll', update, { passive: true });
  if (ScrollTrigger) ScrollTrigger.addEventListener('refresh', layout);
  onResize(layout);
  if ('ResizeObserver' in W) new ResizeObserver(() => layout()).observe(doc.body);
  layout();
}

/* ---------- Nav ---------- */
function setupNav() {
  const nav = qs('.nav');
  if (!nav) return;
  const toggle = qs('.nav__toggle');
  const menu = qs('.menu');
  const onScroll = () => nav.classList.toggle('is-compact', W.scrollY > 24);
  W.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  const setOpen = (open) => {
    doc.body.classList.toggle('menu-open', open);
    if (toggle) {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
    }
    if (menu) menu.toggleAttribute('inert', !open);
    if (lenis) open ? lenis.stop() : lenis.start();
    if (open && menu) { const f = menu.querySelector('a'); f && f.focus(); }
  };
  if (menu) menu.setAttribute('inert', '');
  toggle && toggle.addEventListener('click', () => setOpen(!doc.body.classList.contains('menu-open')));
  menu && menu.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
  doc.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && doc.body.classList.contains('menu-open')) { setOpen(false); toggle && toggle.focus(); }
  });
  W.addEventListener('resize', () => { if (W.innerWidth >= BP.desktopMin && doc.body.classList.contains('menu-open')) setOpen(false); });

  // sticky CTA on mobile: hidden while hero or #works are on screen
  const sticky = qs('.sticky-cta');
  const hideFor = qsa('#top, #works, #contact');
  if (sticky && hideFor.length) {
    const vis = new Set();
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => (e.isIntersecting ? vis.add(e.target) : vis.delete(e.target)));
      sticky.classList.toggle('is-hidden', vis.size > 0);
    });
    hideFor.forEach((s) => io.observe(s));
  }
}

/* ---------- Anchor links (Lenis-aware, focus-managed) ---------- */
function setupAnchors() {
  doc.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey) return;
    const id = a.getAttribute('href').slice(1);
    if (!id) return;
    const target = doc.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const navH = qs('.nav') ? qs('.nav').getBoundingClientRect().height : 0;
    const y = Math.max(0, docTop(target) - (id === 'top' ? 0 : navH - 1));
    scrollToY(y, { immediate: reduced });
    if (!target.hasAttribute('tabindex')) {
      target.setAttribute('tabindex', '-1');
      target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
    }
    target.focus({ preventScroll: true });
    history.replaceState(null, '', `#${id}`);
  });
}

/* ---------- Lite YouTube modal ---------- */
/** Returns { id, short } for YouTube URLs, otherwise null. */
export function parseYouTube(url) {
  try {
    const u = new URL(url, location.href);
    const host = u.hostname.replace(/^www\.|^m\./, '');
    if (host === 'youtu.be') { const m = u.pathname.match(/^\/([\w-]{11})\/?$/); return m ? { id: m[1], short: false } : null; }
    if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
      if (u.pathname === '/watch' && /^[\w-]{11}$/.test(u.searchParams.get('v') || '')) return { id: u.searchParams.get('v'), short: false };
      const s = u.pathname.match(/^\/shorts\/([\w-]{11})\/?$/); if (s) return { id: s[1], short: true };
      const em = u.pathname.match(/^\/embed\/([\w-]{11})/); if (em) return { id: em[1], short: false };
    }
  } catch (_) { /* not a URL */ }
  return null;
}

let modal = null;
function buildModal() {
  const el = doc.createElement('div');
  el.className = 'vmodal';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-modal', 'true');
  el.setAttribute('aria-labelledby', 'vmodalTitle');
  el.innerHTML = '<div class="vmodal__backdrop" data-close></div>' +
    '<div class="vmodal__bar vmodal__bar--top" aria-hidden="true"></div><div class="vmodal__bar vmodal__bar--bottom" aria-hidden="true"></div>' +
    '<p class="vmodal__title" id="vmodalTitle"></p>' +
    '<button type="button" class="vmodal__close" data-close>CLOSE ✕</button>' +
    '<div class="vmodal__stage" data-close><div class="vmodal__frame"></div></div>' +
    '<a class="vmodal__external" target="_blank" rel="noopener">YouTubeで開く</a>';
  doc.body.appendChild(el);
  el.addEventListener('click', (e) => { if (e.target.hasAttribute('data-close')) closeVideo(); });
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.preventDefault(); closeVideo(); }
    if (e.key === 'Tab') { // simple focus trap
      const f = qsa('button, a[href], iframe', el);
      const i = f.indexOf(doc.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
    }
  });
  return {
    root: el,
    frame: qs('.vmodal__frame', el),
    stage: qs('.vmodal__stage', el),
    bars: qsa('.vmodal__bar', el),
    title: qs('.vmodal__title', el),
    close: qs('.vmodal__close', el),
    external: qs('.vmodal__external', el),
    state: null
  };
}

/**
 * Open a video. YouTube URLs play in the lite modal (youtube-nocookie iframe is created now);
 * anything else (TikTok / Instagram / playlist) opens in a new tab.
 * opts: { url, title, originEl, poster, onOpen(m, info), onClose(m, info) → may return a Promise }
 * Returns the modal handle or null when opened externally.
 */
export function openVideo({ url, title = '', originEl = null, poster = '', onOpen, onClose } = {}) {
  const yt = parseYouTube(url);
  if (!yt) { W.open(url, '_blank', 'noopener'); return null; }
  if (!modal) modal = buildModal();
  const m = modal;
  m.state = { originEl, onClose, yt };
  m.root.classList.toggle('is-short', yt.short);
  m.title.textContent = title;
  m.external.href = url;
  m.frame.innerHTML = '';
  if (poster) { const im = new Image(); im.src = poster; im.alt = ''; m.frame.appendChild(im); }
  const iframe = doc.createElement('iframe');
  iframe.src = `https://www.youtube-nocookie.com/embed/${yt.id}?autoplay=1&rel=0&playsinline=1&modestbranding=1`;
  iframe.title = title || 'YouTube動画プレーヤー';
  iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
  iframe.allowFullscreen = true;
  m.frame.appendChild(iframe);
  m.root.classList.add('is-open');
  qsa('main, .nav, .hud, footer').forEach((n) => n.setAttribute('inert', ''));
  if (lenis) lenis.stop();
  const info = { url, title, yt, originEl };
  if (typeof onOpen === 'function') onOpen(m, info);
  else if (!reduced && gsap) {
    gsap.fromTo(m.bars, { scaleY: 0 }, { scaleY: 1, duration: 0.35, ease: 'cut', transformOrigin: (i) => (i ? '50% 100%' : '50% 0%') });
    gsap.fromTo(m.frame, { clipPath: 'inset(50% 0 50% 0)' }, { clipPath: 'inset(0% 0 0% 0)', duration: 0.4, ease: 'cut', delay: 0.1 });
  }
  m.close.focus({ preventScroll: true });
  return m;
}
export async function closeVideo() {
  if (!modal || !modal.root.classList.contains('is-open')) return;
  const m = modal;
  const { originEl, onClose, yt } = m.state || {};
  try { if (typeof onClose === 'function') await onClose(m, { originEl, yt }); } catch (e) { console.warn(e); }
  m.root.classList.remove('is-open');
  m.frame.innerHTML = '';
  qsa('[inert]').forEach((n) => { if (!n.classList.contains('menu')) n.removeAttribute('inert'); });
  if (lenis) lenis.start();
  if (originEl && originEl.focus) originEl.focus({ preventScroll: true });
}

/* ---------- module runner ---------- */
/**
 * Run section modules safely, in order. `loaders` = [[name, () => import('./x.js')], ...].
 * Each module: export function init(ctx) (may be async). Failures are isolated.
 */
export async function runModules(ctx, loaders) {
  for (const [name, load] of loaders) {
    try {
      const mod = await load();
      if (mod && typeof mod.init === 'function') await mod.init(ctx);
    } catch (e) {
      console.warn(`[dz] module "${name}" skipped:`, e && e.message ? e.message : e);
    }
  }
}

/* ---------- boot ---------- */
let ctx = null;
export function boot() {
  if (ctx) return ctx;
  lenis = setupLenis();
  setupGrain();
  setupCursor();
  setupNav();
  setupAnchors();
  ctx = {
    gsap, ScrollTrigger, Flip, SplitText, CustomEase,
    lenis, reduced, isTouch, isMobile, isDesktop, BP,
    onResize, loop, cutIn, cutOut, lazyMedia, autoplayWhenVisible,
    openVideo, closeVideo, parseYouTube,
    cursor, hud, ready, registerLoad, timecode, clamp, lerp, docTop, scrollToY,
    variant: W.DOGAZUKURI_VARIANT || null
  };
  W.__dz = ctx; // debugging aid
  return ctx;
}
/** Call after all page modules have initialised. */
export function finalize() {
  setupHud();
  runLeader();
  const refresh = () => { ScrollTrigger && ScrollTrigger.refresh(); hud.refresh(); };
  if (doc.fonts) doc.fonts.ready.then(refresh);
  if (doc.readyState === 'complete') refresh(); else W.addEventListener('load', refresh, { once: true });
  root.classList.add('dz-live');
}
