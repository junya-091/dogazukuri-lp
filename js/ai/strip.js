/* ==========================================================================
   A3 SHOWCASE — inertial film strip (#showcase, filtered by aiMediaIds).
   A horizontal band you can throw: drag / trackpad / ← → keys / buttons.
   Velocity skews the band; cards scale by distance from centre; only the
   centred card plays (muted, only while the section is on screen).
   Click a side card → it glides to centre; click the centre card → play/pause.
   ========================================================================== */
import { qs, qsa, clamp, lerp } from '../core.js';

export function init(ctx) {
  const sec = qs('.strip');
  if (!sec) return;
  const v = ctx.variant || window.DOGAZUKURI_VARIANT || {};

  // ---- variant filter (aiMediaIds) — same semantics as the old ai-ad-media.js ----
  if (Array.isArray(v.aiMediaIds)) {
    const ids = new Set(v.aiMediaIds.map((x) => (typeof x === 'string' ? x : x && (x.id || x.key))).filter(Boolean));
    qsa('[data-ai-media-id]', sec).forEach((c) => { if (!ids.has(c.dataset.aiMediaId)) c.remove(); });
  }
  const view = qs('.strip__view', sec);
  const track = qs('.strip__track', sec);
  const cards = qsa('.strip__card', sec);
  const videos = cards.map((c) => qs('video', c));
  const bars = cards.map((c) => qs('.strip__bar', c));
  const prevB = qs('[data-strip-prev]', sec);
  const nextB = qs('[data-strip-next]', sec);
  const idxEl = qs('[data-strip-i]', sec);
  const nEl = qs('[data-strip-n]', sec);
  if (!cards.length) return;
  const pad = (n) => String(n).padStart(2, '0');
  nEl.textContent = pad(cards.length);

  // state label inside each card (PLAYING / PAUSED)
  const states = cards.map((c) => {
    const s = document.createElement('span');
    s.className = 'strip__state';
    s.setAttribute('aria-hidden', 'true');
    qs('.strip__media', c).appendChild(s);
    return s;
  });
  const userPaused = new Set();
  const toggle = (i) => {
    const vd = videos[i];
    if (vd.paused) { userPaused.delete(i); vd.play().catch(() => {}); } else { userPaused.add(i); vd.pause(); }
  };

  if (ctx.reduced) {
    // static, natively scrollable strip; playback only on user request
    cards.forEach((c, i) => c.addEventListener('click', () => toggle(i)));
    return;
  }

  sec.classList.add('is-live');
  [prevB, nextB].forEach((b) => { b.removeAttribute('tabindex'); });
  qs('.strip__ctrl', sec).removeAttribute('aria-hidden');
  prevB.setAttribute('aria-label', '前の実例');
  nextB.setAttribute('aria-label', '次の実例');

  const S = { x: 0, target: 0, vel: 0, skew: 0, drag: null, active: -1, inView: false, centers: [], widths: [], vc: 0, settled: 0 };
  const layout = () => {
    S.vc = view.clientWidth / 2;
    S.centers = cards.map((c) => c.offsetLeft + c.offsetWidth / 2);
    S.widths = cards.map((c) => c.offsetWidth);
    const i = S.active < 0 ? (cards.length > 2 && !ctx.isMobile() ? 1 : 0) : S.active;
    S.target = xFor(i);
    if (S.active < 0) S.x = S.target;
  };
  const xFor = (i) => S.vc - S.centers[clamp(i, 0, cards.length - 1)];
  const minX = () => xFor(cards.length - 1);
  const maxX = () => xFor(0);
  const nearest = (x) => {
    let best = 0, bd = Infinity;
    S.centers.forEach((c, i) => { const d = Math.abs(c + x - S.vc); if (d < bd) { bd = d; best = i; } });
    return best;
  };
  const go = (i) => { S.target = xFor(clamp(i, 0, cards.length - 1)); };

  const setActive = (i) => {
    if (i === S.active) return;
    S.active = i;
    idxEl.textContent = pad(i + 1);
    prevB.disabled = i === 0;
    nextB.disabled = i === cards.length - 1;
    cards.forEach((c, k) => c.classList.toggle('is-on', k === i));
    syncPlayback();
  };
  const syncPlayback = () => {
    videos.forEach((vd, k) => {
      const want = S.inView && k === S.active && !userPaused.has(k);
      if (want) { if (vd.paused) vd.play().catch(() => {}); } else if (!vd.paused) vd.pause();
    });
  };
  videos.forEach((vd, i) => {
    vd.muted = true;
    vd.addEventListener('play', () => { states[i].textContent = '▶ PLAYING'; });
    vd.addEventListener('pause', () => { states[i].textContent = '❚❚ PAUSED'; });
    states[i].textContent = '❚❚ PAUSED';
  });
  new IntersectionObserver(([e]) => { S.inView = e.isIntersecting; syncPlayback(); }, { threshold: 0.35 }).observe(view);

  // ---- physics ----
  const rubber = (x) => {
    const lo = minX(), hi = maxX();
    if (x > hi) return hi + (x - hi) * 0.35;
    if (x < lo) return lo + (x - lo) * 0.35;
    return x;
  };
  ctx.loop(sec, () => {
    const prev = S.x;
    S.x = S.drag ? lerp(S.x, S.target, 0.5) : lerp(S.x, S.target, 0.11);
    if (Math.abs(S.x - S.target) < 0.05) S.x = S.target;
    S.vel = S.x - prev;
    S.skew = lerp(S.skew, clamp(-S.vel * 0.18, -9, 9), 0.2);
    track.style.transform = `translate3d(${S.x.toFixed(2)}px,0,0) skewX(${S.skew.toFixed(3)}deg)`;
    cards.forEach((c, i) => {
      const d = (S.centers[i] + S.x - S.vc) / Math.max(1, S.widths[i]);
      const s = 1 - Math.min(1, Math.abs(d)) * 0.18;
      c.style.transform = `scale(${s.toFixed(4)})`;
    });
    setActive(nearest(S.x));
    const vd = videos[S.active];
    if (vd && vd.duration) bars[S.active].style.setProperty('--t', (vd.currentTime / vd.duration).toFixed(4));
  });

  // drag (pointer), with axis lock so vertical page scroll still works on touch
  let moved = false;
  view.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    S.drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, t0: S.target, lock: null, hist: [[performance.now(), e.clientX]] };
    moved = false;
  });
  view.addEventListener('pointermove', (e) => {
    const d = S.drag;
    if (!d || e.pointerId !== d.id) return;
    const dx = e.clientX - d.x0, dy = e.clientY - d.y0;
    if (!d.lock) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      d.lock = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      if (d.lock === 'x') { view.setPointerCapture(e.pointerId); view.classList.add('is-drag'); }
    }
    if (d.lock !== 'x') return;
    moved = true;
    S.target = rubber(d.t0 + dx);
    d.hist.push([performance.now(), e.clientX]);
    if (d.hist.length > 6) d.hist.shift();
  });
  const release = (e) => {
    const d = S.drag;
    if (!d || e.pointerId !== d.id) return;
    S.drag = null;
    view.classList.remove('is-drag');
    if (d.lock !== 'x') return;
    const h = d.hist, a = h[0], b = h[h.length - 1];
    const v = b && a && b[0] - a[0] > 0 ? (b[1] - a[1]) / (b[0] - a[0]) : 0; // px/ms
    const proj = S.target + v * 260;
    go(nearest(clamp(proj, minX(), maxX())));
  };
  view.addEventListener('pointerup', release);
  view.addEventListener('pointercancel', release);

  // trackpad horizontal swipe
  let wheelT = 0;
  view.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    e.preventDefault();
    S.target = rubber(S.target - e.deltaX);
    clearTimeout(wheelT);
    wheelT = setTimeout(() => go(nearest(S.target)), 140);
  }, { passive: false });

  // clicks: side card → centre it, centre card → play / pause
  cards.forEach((c, i) => c.addEventListener('click', () => {
    if (moved) return;
    if (i === S.active) toggle(i); else go(i);
  }));
  view.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(S.active + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); go(S.active - 1); }
    else if (e.key === 'Home') { e.preventDefault(); go(0); }
    else if (e.key === 'End') { e.preventDefault(); go(cards.length - 1); }
    else if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle(S.active); }
  });
  prevB.addEventListener('click', () => go(S.active - 1));
  nextB.addEventListener('click', () => go(S.active + 1));

  layout();
  ctx.onResize(layout);
  addEventListener('load', layout, { once: true });
  if (document.fonts) document.fonts.ready.then(layout);
}
