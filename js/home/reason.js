/* ==========================================================================
   SEC 03 選ばれる理由 #reason — whip-pan (owner: H1)
   Desktop/tablet: the four panels sit on a horizontal dolly track that pins and
   whips from panel to panel (hold → fast quintic pan with horizontal motion
   blur → hold). Every panel carries a hands-on demo:
     board  — storyboard cuts drawn as pencil strokes (click a cut to redraw)
     crop   — 9:16 / 1:1 / 16:9 reframe over one shot (drag / buttons)
     grade  — LOG ⇄ graded wipe (drag / range input)
     gen    — a still dissolves into the AI-generated clip (noise dissolve, pointer reveals)
   Mobile: stacked; each panel whips in sideways once as it enters.
   ========================================================================== */
import { qs, qsa, clamp, lerp } from '../core.js';

/* ---------- demos ---------- */
function boardDemo(el, ctx) {
  const { gsap, reduced } = ctx;
  const cuts = qsa('.board__cut', el);
  const prep = (cut) => qsa('path', cut).map((p) => {
    const len = Math.ceil(p.getTotalLength ? p.getTotalLength() : 300) + 2;
    p.style.strokeDasharray = `${len}`;
    return { p, len };
  });
  const sets = cuts.map(prep);
  const hide = (set) => set.forEach(({ p, len }) => { p.style.strokeDashoffset = `${len}`; });
  const drawCut = (i, delay = 0) => {
    const set = sets[i];
    hide(set);
    const inks = set.filter(({ p }) => p.classList.contains('ink'));
    const marks = set.filter(({ p }) => p.classList.contains('mark'));
    const tl = gsap.timeline({ delay });
    inks.forEach(({ p, len }, k) => tl.to(p, { strokeDashoffset: 0, duration: clamp(len / 260, 0.18, 0.6), ease: 'power1.inOut' }, k ? '>-0.05' : 0));
    marks.forEach(({ p }) => tl.to(p, { strokeDashoffset: 0, duration: 0.35, ease: 'power2.out' }, '>-0.02'));
    cuts[i].classList.add('is-drawn');
    return tl;
  };
  if (reduced) return { activate() {}, deactivate() {} };
  sets.forEach(hide);
  let done = false;
  cuts.forEach((cut, i) => cut.addEventListener('click', () => drawCut(i)));
  return {
    activate() { if (done) return; done = true; cuts.forEach((_, i) => drawCut(i, 0.15 + i * 0.55)); },
    deactivate() {}
  };
}

function cropDemo(el, ctx) {
  const { gsap, reduced } = ctx;
  const stage = qs('.crop__stage', el);
  const frame = qs('.crop__frame', el);
  const ratioEl = qs('.crop__ratio', el);
  const media = qs('.crop__media', el);
  const btns = qsa('[data-ratio]', el);
  const video = qs('video', el);
  const NAMES = { '9:16': 'TikTok・Instagram・YouTube Shorts', '1:1': 'Instagram・Facebook', '16:9': 'YouTube・X' };
  const R = { '9:16': 9 / 16, '1:1': 1, '16:9': 16 / 9 };
  let ratio = '9:16', cx = 0.5, W = 0, H = 0, user = 0, timer = 0, active = false;
  const geo = (r = ratio) => {
    W = stage.clientWidth; H = stage.clientHeight;
    const w = Math.min(W, H * R[r]);
    const x = clamp(cx * W - w / 2, 0, W - w);
    return { w, x };
  };
  const place = (animate = true) => {
    const { w, x } = geo();
    const v = { width: w, x, height: H };
    if (animate && !reduced) gsap.to(frame, { ...v, duration: 0.55, ease: 'cut', overwrite: true });
    else gsap.set(frame, v);
  };
  const setRatio = (r, animate = true) => {
    ratio = r;
    btns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.ratio === r)));
    ratioEl.textContent = r;
    media.textContent = NAMES[r];
    frame.dataset.ratio = r;
    place(animate);
  };
  btns.forEach((b) => b.addEventListener('click', () => { user = performance.now(); setRatio(b.dataset.ratio); }));
  // drag to reframe
  let dragging = false;
  const move = (e) => {
    if (!dragging) return;
    const r = stage.getBoundingClientRect();
    cx = clamp((e.clientX - r.left) / r.width, 0, 1);
    place(false);
  };
  stage.addEventListener('pointerdown', (e) => { dragging = true; user = performance.now(); stage.setPointerCapture(e.pointerId); move(e); });
  stage.addEventListener('pointermove', move);
  stage.addEventListener('pointerup', () => { dragging = false; });
  stage.addEventListener('pointercancel', () => { dragging = false; });
  ctx.onResize(() => place(false));
  requestAnimationFrame(() => setRatio('9:16', false));
  if (video) ctx.autoplayWhenVisible(video);
  const order = ['9:16', '1:1', '16:9'];
  const tick = () => {
    if (!active) return;
    if (performance.now() - user > 6000) {
      const next = order[(order.indexOf(ratio) + 1) % order.length];
      cx = next === '9:16' ? 0.3 + Math.random() * 0.4 : 0.5;
      setRatio(next);
    }
    timer = setTimeout(tick, 2600);
  };
  return {
    activate() { if (active || reduced) return; active = true; clearTimeout(timer); timer = setTimeout(tick, 1800); },
    deactivate() { active = false; clearTimeout(timer); }
  };
}

function gradeDemo(el, ctx) {
  const { gsap, reduced } = ctx;
  const stage = qs('.grade__stage', el);
  const range = qs('.grade__range', el);
  let touched = false, shown = false;
  const set = (v) => { stage.style.setProperty('--x', `${v}%`); };
  range.addEventListener('input', () => { touched = true; set(range.value); });
  range.addEventListener('pointerdown', () => { touched = true; });
  return {
    activate() {
      if (shown || reduced || touched) return; shown = true;
      // one demonstrative sweep so the wipe reads as draggable
      const o = { v: 50 };
      gsap.timeline({ delay: 0.25 })
        .to(o, { v: 16, duration: 0.7, ease: 'cut', onUpdate: () => !touched && (set(o.v), range.value = o.v) })
        .to(o, { v: 82, duration: 0.9, ease: 'cut', onUpdate: () => !touched && (set(o.v), range.value = o.v) })
        .to(o, { v: 50, duration: 0.6, ease: 'cut', onUpdate: () => !touched && (set(o.v), range.value = o.v) });
    },
    deactivate() {}
  };
}

function genDemo(el, ctx) {
  const { reduced } = ctx;
  const stage = qs('.gen__stage', el);
  const canvas = qs('.gen__canvas', el);
  const video = qs('video', el);
  const g = canvas.getContext('2d');
  const NW = 96, NH = 54;
  // value noise, 3 octaves
  const rnd = new Float32Array((NW + 1) * (NH + 1)).map(() => Math.random());
  const noise = new Float32Array(NW * NH);
  const sample = (x, y, s) => {
    const fx = x / s, fy = y / s, ix = Math.floor(fx), iy = Math.floor(fy), tx = fx - ix, ty = fy - iy;
    const at = (a, b) => rnd[((b * 7 + a * 13) % rnd.length + rnd.length) % rnd.length];
    const sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);
    return lerp(lerp(at(ix, iy), at(ix + 1, iy), sx), lerp(at(ix, iy + 1), at(ix + 1, iy + 1), sx), sy);
  };
  for (let y = 0; y < NH; y++) for (let x = 0; x < NW; x++) {
    noise[y * NW + x] = sample(x, y, 14) * 0.6 + sample(x + 31, y + 17, 6) * 0.3 + sample(x + 7, y + 3, 2.5) * 0.1;
  }
  const mask = document.createElement('canvas'); mask.width = NW; mask.height = NH;
  const mg = mask.getContext('2d');
  const md = mg.createImageData(NW, NH);
  const edge = document.createElement('canvas'); edge.width = NW; edge.height = NH;
  const eg = edge.getContext('2d');
  const ed = eg.createImageData(NW, NH);
  const still = new Image();
  let ready = false;
  still.onload = () => { ready = true; size(); paint(0.5); };
  let W = 0, H = 0;
  const size = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = stage.clientWidth; H = stage.clientHeight;
    canvas.width = Math.max(2, Math.round(W * dpr)); canvas.height = Math.max(2, Math.round(H * dpr));
  };
  const ptr = { x: -1, y: -1, a: 0 };
  const paint = (d) => {
    if (!ready || !W) return;
    const cw = canvas.width, ch = canvas.height;
    for (let y = 0; y < NH; y++) for (let x = 0; x < NW; x++) {
      const i = y * NW + x;
      let n = noise[i];
      if (ptr.a > 0) {
        const dx = (x / NW - ptr.x) * 1.78, dy = y / NH - ptr.y;
        n += Math.exp(-(dx * dx + dy * dy) * 26) * 0.75 * ptr.a;
      }
      const v = clamp((n - (1 - d)) / 0.05 + 0.5, 0, 1); // 1 = replaced by the generated clip
      md.data[i * 4 + 3] = v * 255;
      const e = clamp(1 - Math.abs(n - (1 - d)) / 0.022, 0, 1);
      ed.data[i * 4] = 255; ed.data[i * 4 + 1] = 61; ed.data[i * 4 + 2] = 189; ed.data[i * 4 + 3] = e * e * 200;
    }
    mg.putImageData(md, 0, 0);
    eg.putImageData(ed, 0, 0);
    g.globalCompositeOperation = 'source-over';
    g.clearRect(0, 0, cw, ch);
    // the still: a desaturated reference frame
    const s = Math.max(cw / still.naturalWidth, ch / still.naturalHeight);
    const iw = still.naturalWidth * s, ih = still.naturalHeight * s;
    g.drawImage(still, (cw - iw) / 2, (ch - ih) / 2, iw, ih);
    g.globalCompositeOperation = 'saturation';
    g.fillStyle = '#808080'; g.fillRect(0, 0, cw, ch);
    g.globalCompositeOperation = 'multiply';
    g.fillStyle = '#c9c4bb'; g.fillRect(0, 0, cw, ch);
    // punch holes where the generated clip takes over
    g.globalCompositeOperation = 'destination-out';
    g.imageSmoothingEnabled = true;
    g.drawImage(mask, 0, 0, cw, ch);
    g.globalCompositeOperation = 'source-over';
    g.drawImage(edge, 0, 0, cw, ch);
  };
  still.src = (video && video.getAttribute('poster')) || '';
  ctx.onResize(() => { size(); paint(0.5); });
  if (reduced) { // static: half still, half generated
    return { activate() {}, deactivate() {} };
  }
  if (video) ctx.autoplayWhenVisible(video);
  const local = (e) => { const r = stage.getBoundingClientRect(); ptr.x = (e.clientX - r.left) / r.width; ptr.y = (e.clientY - r.top) / r.height; ptr.tgt = 1; };
  stage.addEventListener('pointermove', local, { passive: true });
  stage.addEventListener('pointerdown', local, { passive: true });
  stage.addEventListener('pointerleave', () => { ptr.tgt = 0; });
  let t0 = 0;
  ctx.loop(stage, (t) => {
    if (!t0) t0 = t;
    ptr.a = lerp(ptr.a, ptr.tgt || 0, 0.12);
    const d = 0.5 + 0.38 * Math.sin((t - t0) / 1800 - Math.PI / 2);
    paint(d);
  });
  return { activate() {}, deactivate() {} };
}

const DEMOS = { board: boardDemo, crop: cropDemo, grade: gradeDemo, gen: genDemo };

/* ---------- section ---------- */
export function init(ctx) {
  const { gsap, ScrollTrigger, reduced } = ctx;
  const section = qs('#reason');
  if (!section) return;
  const viewport = qs('.reason__viewport', section);
  const track = qs('.reason__track', section);
  const panels = qsa('.reason__panel', section);
  const ticks = qsa('.reason__pan i', section);
  const demos = panels.map((p) => {
    const fn = DEMOS[p.dataset.demo];
    try { return fn ? fn(p, ctx) : null; } catch (e) { console.warn('[reason]', e); return null; }
  });
  let current = -1;
  const activate = (i) => {
    if (i === current) return;
    if (current >= 0 && demos[current]) demos[current].deactivate();
    current = i;
    panels.forEach((p, k) => p.classList.toggle('is-active', k === i));
    ticks.forEach((t, k) => t.classList.toggle('is-on', k === i));
    if (demos[i]) demos[i].activate();
  };
  if (reduced || !gsap) { panels.forEach((p) => p.classList.add('is-active')); return; }

  // horizontal motion blur for the whip (SVG filter, only applied while moving)
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('width', '0'); svg.setAttribute('height', '0'); svg.setAttribute('aria-hidden', 'true');
  svg.style.position = 'absolute';
  svg.innerHTML = '<filter id="reasonWhip" x="-10%" y="0" width="120%" height="100%" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="0 0"/></filter>';
  section.appendChild(svg);
  const blurEl = svg.querySelector('feGaussianBlur');

  const mm = gsap.matchMedia();
  mm.add('(min-width: 768px)', () => {
    section.classList.add('is-pan');
    const N = panels.length;
    const HOLD = 1.35, PAN = 1;
    const total = N * HOLD + (N - 1) * PAN;
    const quint = (t) => (t < 0.5 ? 16 * t ** 5 : 1 - Math.pow(-2 * t + 2, 5) / 2);
    const posAt = (p) => {
      let u = p * total;
      for (let i = 0; i < N; i++) {
        if (u <= HOLD) return { pos: i, hold: true };
        u -= HOLD;
        if (i < N - 1) { if (u <= PAN) return { pos: i + quint(u / PAN), hold: false }; u -= PAN; }
      }
      return { pos: N - 1, hold: true };
    };
    let lastPos = 0, blur = 0, filterOn = false;
    const setBlur = (b) => {
      blur = lerp(blur, b, 0.5);
      if (blur < 0.6) { if (filterOn) { track.style.filter = ''; filterOn = false; } return; }
      blurEl.setAttribute('stdDeviation', `${blur.toFixed(1)} 0`);
      if (!filterOn) { track.style.filter = 'url(#reasonWhip)'; filterOn = true; }
    };
    const apply = (p) => {
      const { pos, hold } = posAt(p);
      const w = viewport.clientWidth;
      gsap.set(track, { x: -pos * w });
      const dv = Math.abs(pos - lastPos) * w;
      lastPos = pos;
      setBlur(Math.min(28, dv * 0.22));
      track.style.setProperty('--whip', clamp(dv / 120, 0, 1).toFixed(3));
      if (hold || Math.abs(pos - Math.round(pos)) < 0.12) activate(Math.round(pos));
    };
    const st = ScrollTrigger.create({
      trigger: viewport,
      start: 'top top',
      end: () => `+=${Math.round(window.innerHeight * 2.1)}`,
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => apply(self.progress),
      onRefresh: (self) => apply(self.progress),
      onEnter: () => activate(Math.max(0, current)),
      onEnterBack: () => activate(Math.max(0, current))
    });
    // ease the blur back to zero once scrolling stops
    const settle = ctx.loop(viewport, () => { if (blur > 0) setBlur(0); });
    // keyboard: focusing something inside an off-screen panel scrolls the track there
    const onFocus = (e) => {
      const i = panels.findIndex((p) => p.contains(e.target));
      if (i < 0 || i === current) return;
      const holdStart = (i * (HOLD + PAN) + HOLD * 0.5) / total;
      ctx.scrollToY(st.start + (st.end - st.start) * holdStart, { immediate: true });
    };
    section.addEventListener('focusin', onFocus);
    activate(0);
    return () => {
      st.kill(); settle.kill(); section.removeEventListener('focusin', onFocus);
      section.classList.remove('is-pan'); gsap.set(track, { clearProps: 'x,filter' });
    };
  });
  mm.add('(max-width: 767px)', () => {
    // stacked: each panel whips in sideways (direction alternates) and wakes its demo
    const tws = panels.map((p, i) => {
      gsap.set(p, { xPercent: i % 2 ? 60 : -60, autoAlpha: 0 });
      return ScrollTrigger.create({
        trigger: p, start: 'top 82%', once: true,
        onEnter: () => {
          gsap.to(p, { xPercent: 0, autoAlpha: 1, duration: 0.42, ease: 'whip' });
          gsap.fromTo(p, { filter: 'blur(10px)' }, { filter: 'blur(0px)', duration: 0.42, ease: 'power2.in', clearProps: 'filter' });
          setTimeout(() => demos[i] && demos[i].activate(), 300);
        }
      });
    });
    return () => { tws.forEach((t) => t.kill()); gsap.set(panels, { clearProps: 'all' }); };
  });
}
