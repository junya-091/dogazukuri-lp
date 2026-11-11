/* ==========================================================================
   SEC 07 PROCESS — the sequence assembles itself in an NLE (owner: H2)
   企画 = markers / 台本 = text clips / 撮影 = footage drops onto V1+A1 /
   編集 = laser cut + ripple delete / テロップ = subtitles typed into SUB /
   納品 = render bar + export to each platform.
   Desktop (≥1024px wide, ≥680px tall): pinned and scrubbed by scroll.
   Tablet / phone / short windows: no pin, plays once in view.
   Reduced motion: the finished timeline, static, next to the full step list.
   ========================================================================== */
import { qs, qsa, clamp } from '../core.js';

const IMG = {
  a: 'assets/switcher/ramen-story-640.jpg',
  b: 'assets/switcher/food-sizzle-640.jpg',
  c: 'assets/switcher/city-timelapse-640.jpg',
  d: 'assets/switcher/character-short-360.jpg'
};
// raw footage with NG takes in between; after the cut everything ripples left
const RAW = [
  { k: 'a', l: 0, w: 20, name: 'A001_C003' },
  { ng: true, l: 20, w: 8 },
  { k: 'b', l: 28, w: 22, name: 'A001_C007' },
  { ng: true, l: 50, w: 7 },
  { k: 'c', l: 57, w: 23, name: 'A002_C002' },
  { ng: true, l: 80, w: 6 },
  { k: 'd', l: 86, w: 31, name: 'A002_C011' }
];
const MARKS = [{ x: 3, t: 'つかみ' }, { x: 36, t: '本題' }, { x: 80, t: '締め' }];
const SCRIPT = [{ l: 1, w: 30, t: '#1 導入' }, { l: 33, w: 44, t: '#2 本題' }, { l: 79, w: 18, t: '#3 まとめ' }];
const SUBS = [{ l: 1, w: 19, t: '最初の3秒で' }, { l: 22, w: 19, t: 'ここがポイント' }, { l: 43, w: 21, t: '実際にやってみた' }, { l: 67, w: 27, t: 'フォローしてね' }];
const DESTS = ['Instagram', 'TikTok', 'YouTube Shorts', 'X', 'Facebook'];

function wave(seed) {
  let s = seed, d = 'M0 50';
  const pts = [];
  for (let x = 0; x <= 200; x += 2) {
    s = (s * 9301 + 49297) % 233280;
    const r = s / 233280;
    const env = 0.35 + 0.65 * Math.abs(Math.sin(x / 13 + seed));
    pts.push([x, 6 + r * 40 * env]);
  }
  pts.forEach(([x, h]) => { d += ` L${x} ${50 - h}`; });
  for (let i = pts.length - 1; i >= 0; i--) d += ` L${pts[i][0]} ${50 + pts[i][1]}`;
  return `<svg viewBox="0 0 200 100" preserveAspectRatio="none"><path d="${d} Z"/></svg>`;
}

export function init(ctx) {
  const { gsap, ScrollTrigger, reduced } = ctx;
  const root = qs('#process');
  if (!root || !gsap) return;
  const pf = qs('.pf', root);
  const nle = qs('.nle', root);
  const steps = qsa('.pf__step', root);

  /* ---------- build the editor ---------- */
  const ticks = [0, 5, 10, 15, 20, 25].map((s, i) => `<span style="left:${i * (100 / 6)}%">00:${String(s).padStart(2, '0')}</span>`).join('');
  nle.innerHTML =
    '<div class="nle__top"><span class="nle__dot"></span><b>SEQ 01 — ドーガづくり</b><span class="nle__fmt">1080×1920 · 24p</span><span class="nle__tc">00:00:00:00</span></div>' +
    '<div class="nle__body">' +
      '<div class="nle__view"><div class="nle__bars">NO CLIP<br>— V1 —</div>' +
        Object.entries(IMG).map(([k, src]) => `<img data-k="${k}" src="${src}" alt="" loading="lazy" decoding="async">`).join('') +
        '<div class="nle__vframe"></div><div class="nle__vtelop"><span></span></div><span class="nle__vlabel">PROGRAM</span></div>' +
      '<div class="nle__tl">' +
        `<div class="nle__ruler">${ticks}</div><div class="nle__render"><i></i></div>` +
        '<div class="nle__marks"></div>' +
        '<div class="nle__tracks">' +
          '<div class="nle__track" data-tr="sub"><span class="nle__th">SUB</span><div class="nle__lane"></div></div>' +
          '<div class="nle__track" data-tr="v2"><span class="nle__th">V2</span><div class="nle__lane"></div></div>' +
          '<div class="nle__track" data-tr="v1"><span class="nle__th">V1</span><div class="nle__lane"></div></div>' +
          '<div class="nle__track" data-tr="a1"><span class="nle__th">A1</span><div class="nle__lane"></div></div>' +
        '</div>' +
        '<div class="nle__head"></div><div class="nle__laser"></div><div class="nle__spark"></div>' +
      '</div>' +
    '</div>' +
    `<div class="nle__exp"><span class="nle__exp-label">EXPORT <b>0%</b></span><div class="nle__dests">${DESTS.map((d) => `<span class="nle__dest">${d}</span>`).join('')}</div></div>`;
  nle.classList.add('is-built');

  const lane = (n) => qs(`[data-tr="${n}"] .nle__lane`, nle);
  const marksEl = qs('.nle__marks', nle);
  const tl0 = qs('.nle__tl', nle);
  const head = qs('.nle__head', nle);
  const laser = qs('.nle__laser', nle);
  const spark = qs('.nle__spark', nle);
  const tcEl = qs('.nle__tc', nle);
  const renderI = qs('.nle__render i', nle);
  const expLabel = qs('.nle__exp-label b', nle);
  const dests = qsa('.nle__dest', nle);
  const viewImgs = qsa('.nle__view img', nle);
  const vtelop = qs('.nle__vtelop span', nle);

  const marks = MARKS.map((m) => {
    const el = document.createElement('span');
    el.className = 'nle__mark';
    el.style.left = `${m.x}%`;
    el.innerHTML = `<span>${m.t}</span>`;
    marksEl.appendChild(el);
    return el;
  });
  const mk = (laneEl, cls, l, w, html) => {
    const el = document.createElement('div');
    el.className = `nle__clip ${cls}`;
    el.style.left = `${l}%`; el.style.width = `${w}%`;
    el.innerHTML = html;
    laneEl.appendChild(el);
    return el;
  };
  const script = SCRIPT.map((c) => mk(lane('v2'), 'nle__clip--text', c.l, c.w, c.t));
  const v1 = RAW.map((c, i) => c.ng
    ? mk(lane('v1'), 'nle__clip--ng', c.l, c.w, '<span>NG</span>')
    : (() => { const el = mk(lane('v1'), 'nle__clip--video', c.l, c.w, `<span>${c.name}</span>`); el.style.backgroundImage = `url(${IMG[c.k]})`; el.dataset.k = c.k; return el; })());
  const a1 = RAW.map((c, i) => mk(lane('a1'), c.ng ? 'nle__clip--ng' : 'nle__clip--audio', c.l, c.w, c.ng ? '<span>NG</span>' : wave(i + 3)));
  const subs = SUBS.map((c) => mk(lane('sub'), 'nle__clip--sub', c.l, c.w, ''));

  // final (rippled) positions
  const finalPos = [];
  { let shift = 0; RAW.forEach((c) => { if (c.ng) { finalPos.push(null); shift += c.w; } else finalPos.push(c.l - shift); }); }

  /* ---------- helpers driven by the master timeline ---------- */
  const st = { head: 0, rend: 0, exp: 0, sub: SUBS.map(() => 0) };
  const laneW = () => lane('v1').getBoundingClientRect().width;
  const laneX0 = () => lane('v1').getBoundingClientRect().left - tl0.getBoundingClientRect().left;
  const sync = () => {
    const x0 = laneX0(), w = laneW();
    head.style.left = `${x0 + (st.head / 100) * w}px`;
    tcEl.textContent = ctx.timecode((st.head / 100) * 30 * 24);
    renderI.style.transform = `scaleX(${st.rend})`;
    expLabel.textContent = `${Math.round(st.exp * 100)}%`;
    // viewer: the V1 clip under the playhead
    let k = null, best = -1;
    v1.forEach((el) => {
      if (!el.dataset.k || getComputedStyle(el).opacity === '0') return;
      const l = parseFloat(el.style.left);
      if (l <= st.head + 0.01 && l > best) { best = l; k = el.dataset.k; }
    });
    viewImgs.forEach((im) => im.classList.toggle('is-on', im.dataset.k === k));
    // typed subtitles
    let telop = '';
    SUBS.forEach((s, i) => {
      const n = Math.round(st.sub[i] * s.t.length);
      const txt = s.t.slice(0, n);
      if (subs[i].textContent !== txt) subs[i].textContent = txt;
      if (st.head >= s.l && st.head < s.l + s.w && n) telop = txt;
    });
    if (vtelop.textContent !== telop) vtelop.textContent = telop;
  };

  const setStep = (i) => steps.forEach((s, k) => { s.classList.toggle('is-on', k === i); s.classList.toggle('is-done', k < i); });

  /* ---------- reduced: the finished sequence, static ---------- */
  if (reduced) {
    v1.forEach((el, i) => { if (RAW[i].ng) el.style.display = 'none'; else el.style.left = `${finalPos[i]}%`; });
    a1.forEach((el, i) => { if (RAW[i].ng) el.style.display = 'none'; else el.style.left = `${finalPos[i]}%`; });
    st.sub = SUBS.map(() => 1); st.rend = 1; st.exp = 1; st.head = 10;
    dests.forEach((d) => d.classList.add('is-on'));
    requestAnimationFrame(sync);
    ctx.onResize(sync);
    return;
  }

  pf.classList.add('is-live');

  /* ---------- the master timeline (6 phases) ---------- */
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'cut' }, onUpdate: sync });
  const phaseAt = [];
  const P = (i) => { phaseAt[i] = tl.duration(); tl.addLabel(`p${i}`); tl.call(() => {}, null); };

  gsap.set(marks, { scale: 0, transformOrigin: '50% 0%' });
  gsap.set(script, { scaleX: 0 });
  gsap.set([...v1, ...a1], { y: -70, opacity: 0 });
  gsap.set(subs, { opacity: 0 });
  gsap.set(laser, { opacity: 0, left: 0 });

  // 1 企画 — markers
  P(0);
  tl.to(marks, { scale: 1, duration: 0.25, ease: 'back.out(3)', stagger: 0.25 });
  tl.to({}, { duration: 0.25 });
  // 2 台本 — text clips type out across V2
  P(1);
  tl.to(script, { scaleX: 1, duration: 0.45, ease: 'steps(8)', stagger: 0.3 });
  tl.to({}, { duration: 0.2 });
  // 3 撮影 — footage drops onto V1 (linked audio lands with it)
  P(2);
  RAW.forEach((c, i) => {
    tl.to([v1[i], a1[i]], { y: 0, opacity: 1, duration: 0.3, ease: 'bounce.out' }, `p2+=${i * 0.12}`);
  });
  tl.to({}, { duration: 0.25 });
  // 4 編集 — laser cut + ripple delete
  P(3);
  const ngIdx = RAW.map((c, i) => (c.ng ? i : -1)).filter((i) => i >= 0);
  const pos = RAW.map((c) => c.l);
  tl.set(laser, { opacity: 1 });
  ngIdx.forEach((ni) => {
    const at = pos[ni];
    tl.to(laser, { left: () => `${laneX0() + (at / 100) * laneW()}px`, duration: 0.22, ease: 'power2.inOut' });
    tl.fromTo(spark, { opacity: 1, scale: 0.4, left: () => `${laneX0() + (at / 100) * laneW()}px`, top: () => `${lane('v1').offsetTop + qs('.nle__tracks', nle).offsetTop + 18}px` }, { opacity: 0, scale: 1.8, duration: 0.18, ease: 'power1.out', immediateRender: false });
    tl.to([v1[ni], a1[ni]], { scaleY: 0, opacity: 0, duration: 0.12, ease: 'steps(3)' }, '<');
    // ripple: everything to the right slides left by the gap
    const w = RAW[ni].w;
    for (let j = ni + 1; j < RAW.length; j++) pos[j] -= w;
    const moves = [];
    for (let j = ni + 1; j < RAW.length; j++) moves.push([j, pos[j]]);
    moves.forEach(([j, l]) => tl.to([v1[j], a1[j]], { left: `${l}%`, duration: 0.24, ease: 'power3.inOut' }, '<0.06'));
  });
  tl.to(laser, { opacity: 0, duration: 0.1 });
  // 5 テロップ — subtitles typed while the playhead plays through
  P(4);
  tl.set(subs, { opacity: 1 });
  tl.to(st, { head: 96, duration: 1.4, ease: 'none' }, 'p4');
  SUBS.forEach((s, i) => {
    tl.to(st.sub, { [i]: 1, duration: 0.24, ease: 'none' }, `p4+=${Math.max(0, (s.l / 96) * 1.4 - 0.1).toFixed(3)}`);
  });
  // 6 納品 — render bar, then export to each platform
  P(5);
  tl.set(st, { head: 0 });
  tl.to(st, { rend: 1, head: 96, duration: 0.8, ease: 'none' });
  tl.to(st, { exp: 1, duration: 0.7, ease: 'none' });
  tl.to({}, { duration: 0.35 });
  const total = tl.duration();
  const phaseEnds = phaseAt.slice(1).concat(total);
  const updateDests = () => { dests.forEach((d, i) => d.classList.toggle('is-on', st.exp >= (i + 1) / DESTS.length - 0.02)); };
  tl.eventCallback('onUpdate', () => {
    sync(); updateDests();
    const t = tl.time();
    let p = 0;
    phaseAt.forEach((a, i) => { if (t >= a - 0.001) p = i; });
    setStep(p);
  });
  setStep(-1);
  sync();
  ctx.onResize(sync);

  /* ---------- drive: pinned scrub (≥768) / autoplay (phones) ---------- */
  const mm = gsap.matchMedia();
  mm.add('(min-width: 1024px) and (min-height: 680px)', () => {
    root.classList.add('is-pinned');
    // fit the copy column into one screen on short windows (type scales via --fit)
    const copyEl = qs('.pf__copy', root);
    const fit = () => {
      const nav = qs('.nav');
      const avail = window.innerHeight - (nav ? nav.offsetHeight : 72) - 12 - 44 - 20;
      let k = 1;
      root.style.setProperty('--fit', '1');
      for (let n = 0; n < 4; n++) {
        const h = copyEl.offsetHeight;
        if (h <= avail) break;
        k = Math.max(0.7, k * (avail / h) * 0.985);
        root.style.setProperty('--fit', k.toFixed(3));
      }
    };
    fit();
    ScrollTrigger.addEventListener('refreshInit', fit);
    const stc = ScrollTrigger.create({
      trigger: root,
      start: 'top top',
      end: () => `+=${Math.round(window.innerHeight * 2)}`,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      scrub: 0.6,
      animation: tl
    });
    return () => { ScrollTrigger.removeEventListener('refreshInit', fit); root.style.removeProperty('--fit'); root.classList.remove('is-pinned'); stc.kill(); };
  });
  mm.add('(max-width: 1023px), (max-height: 679px)', () => {
    tl.progress(0);
    let played = false;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !played) { played = true; ctx.ready.then(() => tl.timeScale(0.9).play(0)); }
    }, { threshold: 0.35 });
    io.observe(nle);
    return () => io.disconnect();
  });
  void phaseEnds; void clamp;
}
