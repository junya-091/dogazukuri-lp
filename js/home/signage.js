/* ==========================================================================
   SEC 10 SIGNAGE — corner pin (owner: H2)
   Real footage is corner-pinned (CSS matrix3d homography) into the display of
   each signage photo; the screen light spills around it. Corners were measured
   on the source photos (1536×1152) by fitting the four screen edges.
   Desktop: a sticky stage; LARGE → MINI is a diagonal split wipe scrubbed by
   scrolling the copy. Tablet / phone: each scene sits above its own copy.
   Entrance: four tracker handles lock onto the screen and the clip snaps in.
   Reduced motion: the pinned still (poster), no playback, no wipe.
   ========================================================================== */
import { qs, qsa, clamp, lerp } from '../core.js';

const IMG_W = 1536, IMG_H = 1152;

/* ---------- homography: rect (0,0)-(w,h) → quad ---------- */
const adj = (m) => [
  m[4] * m[8] - m[5] * m[7], m[2] * m[7] - m[1] * m[8], m[1] * m[5] - m[2] * m[4],
  m[5] * m[6] - m[3] * m[8], m[0] * m[8] - m[2] * m[6], m[2] * m[3] - m[0] * m[5],
  m[3] * m[7] - m[4] * m[6], m[1] * m[6] - m[0] * m[7], m[0] * m[4] - m[1] * m[3]
];
const mul = (a, b) => {
  const c = new Array(9);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
    let s = 0;
    for (let k = 0; k < 3; k++) s += a[3 * i + k] * b[3 * k + j];
    c[3 * i + j] = s;
  }
  return c;
};
const mulv = (m, v) => [m[0] * v[0] + m[1] * v[1] + m[2] * v[2], m[3] * v[0] + m[4] * v[1] + m[5] * v[2], m[6] * v[0] + m[7] * v[1] + m[8] * v[2]];
const basis = (p) => {
  const m = [p[0][0], p[1][0], p[2][0], p[0][1], p[1][1], p[2][1], 1, 1, 1];
  const v = mulv(adj(m), [p[3][0], p[3][1], 1]);
  return mul(m, [v[0], 0, 0, 0, v[1], 0, 0, 0, v[2]]);
};
function matrix3d(w, h, q) {
  // q: [tl, tr, br, bl]; basis order: tl, tr, bl, br
  const src = basis([[0, 0], [w, 0], [0, h], [w, h]]);
  const dst = basis([q[0], q[1], q[3], q[2]]);
  const t = mul(dst, adj(src));
  for (let i = 0; i < 9; i++) t[i] /= t[8];
  return `matrix3d(${[t[0], t[3], 0, t[6], t[1], t[4], 0, t[7], 0, 0, 1, 0, t[2], t[5], 0, t[8]].map((n) => +n.toFixed(10)).join(',')})`;
}
/** grow the quad by d image-px away from its centroid (hides the 1px seam against the bezel) */
function grow(q, d) {
  const cx = q.reduce((s, p) => s + p[0], 0) / 4, cy = q.reduce((s, p) => s + p[1], 0) / 4;
  return q.map(([x, y]) => { const dx = x - cx, dy = y - cy, l = Math.hypot(dx, dy) || 1; return [x + (dx / l) * d, y + (dy / l) * d]; });
}

export function init(ctx) {
  const { gsap, ScrollTrigger, reduced } = ctx;
  const root = qs('#signage');
  if (!root) return;
  const sg = qs('.sg', root);
  const stage = qs('.sg__stage', root);
  const scenes = qsa('.sg__scene', root).map((fig) => {
    const quad = fig.dataset.corners.trim().split(/\s+/).map((p) => p.split(',').map(Number));
    const photo = qs('.sg__photo', fig);
    const img = qs('img', photo);
    const W0 = 360, H0 = fig.dataset.scene === 'mini' ? 600 : 640;
    const glow = document.createElement('div');
    glow.className = 'sg__glow';
    glow.style.width = `${W0}px`; glow.style.height = `${H0}px`;
    const screen = document.createElement('div');
    screen.className = 'sg__screen';
    screen.style.width = `${W0}px`; screen.style.height = `${H0}px`;
    let media;
    if (reduced) {
      media = document.createElement('img');
      media.src = fig.dataset.poster; media.alt = ''; media.decoding = 'async'; media.loading = 'lazy';
    } else {
      media = document.createElement('video');
      media.muted = true; media.loop = true; media.playsInline = true; media.preload = 'none';
      media.setAttribute('muted', ''); media.setAttribute('playsinline', '');
      media.poster = fig.dataset.poster;
      media.dataset.src = fig.dataset.video;
    }
    screen.appendChild(media);
    const pins = document.createElement('div');
    pins.className = 'sg__pins';
    pins.setAttribute('aria-hidden', 'true');
    pins.innerHTML = [1, 2, 3, 4].map((n) => `<span class="sg__pin"><b>TRK ${String(n).padStart(2, '0')}</b></span>`).join('');
    photo.append(glow, screen, pins);
    return { fig, quad, photo, img, screen, glow, media, W0, H0, pinEls: qsa('.sg__pin', pins), lock: reduced ? 1 : 0, s: 1, ox: 0, oy: 0 };
  });

  /* ---------- geometry: image px → photo box px (object-fit: cover + object-position) ---------- */
  const measure = (sc) => {
    const cw = sc.photo.clientWidth, ch = sc.photo.clientHeight;
    const cs = getComputedStyle(sc.img).objectPosition.split(' ').map((v) => parseFloat(v) / 100);
    const s = Math.max(cw / IMG_W, ch / IMG_H);
    sc.s = s; sc.ox = (cw - IMG_W * s) * (isNaN(cs[0]) ? 0.5 : cs[0]); sc.oy = (ch - IMG_H * s) * (isNaN(cs[1]) ? 0.5 : cs[1]);
  };
  const toBox = (sc, [x, y]) => [sc.ox + x * sc.s, sc.oy + y * sc.s];
  const render = (sc) => {
    const target = grow(sc.quad, 0.6).map((p) => toBox(sc, p));
    let q = target;
    if (sc.lock < 1) { // tracker lock: start from an axis-aligned box around the screen
      const xs = target.map((p) => p[0]), ys = target.map((p) => p[1]);
      const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2;
      const hw = (Math.max(...xs) - Math.min(...xs)) * 0.62, hh = (Math.max(...ys) - Math.min(...ys)) * 0.56;
      const rect = [[cx - hw, cy - hh], [cx + hw, cy - hh], [cx + hw, cy + hh], [cx - hw, cy + hh]];
      const e = 1 - Math.pow(1 - sc.lock, 3);
      q = rect.map((p, i) => [lerp(p[0], target[i][0], e), lerp(p[1], target[i][1], e)]);
    }
    const m = matrix3d(sc.W0, sc.H0, q);
    sc.screen.style.transform = m;
    sc.glow.style.transform = m;
    sc.pinEls.forEach((p, i) => { p.style.transform = `translate(${q[i][0]}px, ${q[i][1]}px)`; });
  };
  const layout = () => scenes.forEach((sc) => { measure(sc); render(sc); });
  layout();
  ctx.onResize(layout);
  scenes.forEach((sc) => sc.img.addEventListener('load', layout, { once: true }));
  if ('ResizeObserver' in window) { const ro = new ResizeObserver(layout); scenes.forEach((sc) => ro.observe(sc.photo)); }

  if (reduced || !gsap) return;
  sg.classList.add('is-live');

  /* ---------- playback + light spill colour sampled from the clip ---------- */
  const cv = document.createElement('canvas');
  cv.width = cv.height = 4;
  const c2 = cv.getContext('2d', { willReadFrequently: true });
  scenes.forEach((sc) => {
    ctx.autoplayWhenVisible(sc.media, { threshold: 0.05 });
    let acc = 0;
    ctx.loop(sc.photo, (t, dt) => {
      acc += dt;
      if (acc < 220 || sc.media.readyState < 2) return;
      acc = 0;
      try {
        c2.drawImage(sc.media, 0, 0, 4, 4);
        const d = c2.getImageData(0, 0, 4, 4).data;
        let r = 0, g = 0, b = 0;
        for (let i = 0; i < d.length; i += 4) { r += d[i]; g += d[i + 1]; b += d[i + 2]; }
        const n = d.length / 4, k = 1.35;
        sc.glow.style.setProperty('--glow', `rgb(${clamp(r / n * k, 0, 255) | 0}, ${clamp(g / n * k, 0, 255) | 0}, ${clamp(b / n * k, 0, 255) | 0})`);
      } catch (_) { /* tainted / not ready */ }
    });
  });

  /* ---------- entrance: tracker lock-on ---------- */
  const lockOn = (sc, delay = 0) => {
    const tl = gsap.timeline({ delay });
    tl.set(sc.pinEls, { opacity: 1 });
    tl.fromTo(sc.screen, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: 'steps(3)' }, 0);
    tl.fromTo(sc, { lock: 0 }, { lock: 1, duration: 0.95, ease: 'power2.inOut', onUpdate: () => render(sc) }, 0);
    tl.to(sc.pinEls, { opacity: 0, duration: 0.3, ease: 'steps(3)' }, '+=0.5');
    return tl;
  };
  scenes.forEach((sc) => { gsap.set(sc.screen, { opacity: 0 }); render(sc); });
  scenes.forEach((sc) => {
    if (sc.fig.dataset.scene === 'mini' && ctx.isDesktop()) return; // driven by the wipe
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      ctx.ready.then(() => lockOn(sc, 0.15));
    }, { threshold: 0.45 });
    io.observe(sc.fig);
  });

  /* ---------- desktop: diagonal split wipe LARGE → MINI on the sticky stage ---------- */
  const mini = scenes.find((s) => s.fig.dataset.scene === 'mini');
  const large = scenes.find((s) => s.fig.dataset.scene === 'large');
  const cardMini = qs('.sg__card--mini', root);
  const mm = gsap.matchMedia();
  mm.add('(min-width: 1024px)', () => {
    const seam = document.createElement('div');
    seam.className = 'sg__seam';
    seam.setAttribute('aria-hidden', 'true');
    const tabs = document.createElement('div');
    tabs.className = 'sg__tabs';
    tabs.innerHTML = '<button type="button" data-go="large" aria-current="true">A — LARGE</button><button type="button" data-go="mini" aria-current="false">B — MINI</button>';
    stage.append(seam, tabs);
    let miniLocked = false;
    const setWipe = (p) => {
      const W = stage.clientWidth, H = stage.clientHeight;
      const a = lerp(1.3, -0.3, p);
      mini.fig.style.clipPath = `polygon(${(a + 0.25) * 100}% 0, 110% 0, 110% 100%, ${(a - 0.25) * 100}% 100%)`;
      const ang = Math.atan2(0.5 * W, H) * 180 / Math.PI;
      seam.style.left = `${a * 100}%`;
      seam.style.transform = `rotate(${ang}deg)`;
      seam.style.opacity = p > 0.001 && p < 0.999 ? 1 : 0;
      qsa('button', tabs).forEach((b) => b.setAttribute('aria-current', String((b.dataset.go === 'mini') === (p >= 0.5))));
      if (p > 0.35 && !miniLocked) { miniLocked = true; lockOn(mini); }
    };
    // the MINI tracker runs on the wipe, not on its own observer
    mini.lock = 0; render(mini);
    const st = ScrollTrigger.create({
      trigger: cardMini, start: 'top 85%', end: 'top 30%', scrub: 0.4,
      onUpdate: (self) => setWipe(self.progress),
      onRefresh: (self) => setWipe(self.progress)
    });
    setWipe(0);
    tabs.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      const card = qs(`.sg__card--${b.dataset.go}`, root);
      const navH = qs('.nav') ? qs('.nav').getBoundingClientRect().height : 0;
      const y = b.dataset.go === 'mini' ? st.end - window.innerHeight * 0.0 : ctx.docTop(root.querySelector('.sg')) - navH - 8;
      ctx.scrollToY(b.dataset.go === 'mini' ? st.end + 4 : y);
      void card;
    });
    return () => { st.kill(); seam.remove(); tabs.remove(); mini.fig.style.clipPath = ''; };
  });
  void large;
}
