/* ==========================================================================
   SEC 02 実績数値 #worksWall — "数字が窓になる" (owner: H1)
   A giant "900+" whose glyphs are windows onto a flowing wall of real work
   thumbnails (canvas, destination-in mask). The digits roll in like a frame
   counter (stepped at 24fps). On desktop the stage pins and the camera dollies
   into the counter of the first "0" until the hole swallows the screen.
   ========================================================================== */
import { qs, qsa, clamp, lerp } from '../core.js';
import { visibleWorkItems } from '../data/works.js';

const TEXT = ['9', '0', '0', '+'];
const TARGET = 900;
const FONT = '"Big Shoulders Display"';
const thumbUrl = (item) => item.image.replace(/^assets\/works\//, 'assets/works/thumb/').replace(/\.(jpe?g|png)$/i, '-s.webp');

export function init(ctx) {
  const { gsap, ScrollTrigger, reduced, ready } = ctx;
  const section = qs('#worksWall');
  if (!section) return;
  const stage = qs('.stats__stage', section);
  const canvas = qs('.stats__canvas', section);
  const layer = qs('.stats__layer', section);
  const tcEl = qs('[data-stats-tc]', section);
  const titleEl = qs('.stats__title', section);
  const factsEl = qs('.stats__facts', section);
  const holeEl = qs('.stats__hole', section);
  if (!canvas || !canvas.getContext) return;
  const g = canvas.getContext('2d');
  const mask = document.createElement('canvas');
  const m = mask.getContext('2d');
  section.classList.add('is-window');

  /* ---------- the wall ---------- */
  const items = visibleWorkItems().filter((i) => i.image);
  const wides = items.filter((i) => i.aspect !== 'short');
  const shorts = items.filter((i) => i.aspect === 'short');
  const pics = new Map(); // item.id -> HTMLImageElement (ready)
  let loading = false;
  const loadPics = () => {
    if (loading) return; loading = true;
    [...wides.slice(0, 18), ...shorts.slice(0, 18)].forEach((it) => {
      const im = new Image();
      im.decoding = 'async';
      im.onload = () => { pics.set(it.id, im); dirty = true; if (reduced) draw(0); };
      im.onerror = () => { if (im.src.endsWith('.webp')) im.src = it.image; };
      im.src = thumbUrl(it);
    });
  };
  // rows: wide strip / short strip alternating, opposite directions
  const rowsDef = [
    { list: wides.slice(0, 9), short: false, k: 0.2, v: -34 },
    { list: shorts.slice(0, 9), short: true, k: 0.3, v: 24 },
    { list: wides.slice(9, 18).length ? wides.slice(9, 18) : wides.slice(0, 9).reverse(), short: false, k: 0.2, v: -46 },
    { list: shorts.slice(9, 18).length ? shorts.slice(9, 18) : shorts.slice(0, 9).reverse(), short: true, k: 0.3, v: 30 }
  ].filter((r) => r.list.length);
  const offs = rowsDef.map(() => Math.random() * 400);

  /* ---------- layout ---------- */
  let L = null, dirty = true;
  const mobile = () => ctx.isMobile();
  const layout = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const sr = stage.getBoundingClientRect();
    const cr = canvas.getBoundingClientRect();
    const W = cr.width, H = cr.height;
    canvas.width = Math.max(2, Math.round(W * dpr)); canvas.height = Math.max(2, Math.round(H * dpr));
    mask.width = canvas.width; mask.height = canvas.height;
    // measure glyphs at 100px
    g.font = `900 100px ${FONT}`;
    const cw = g.measureText('0').width;
    const pw = g.measureText('+').width;
    const capR = (g.measureText('0').actualBoundingBoxAscent || 72) / 100;
    const track = -0.012 * 100;
    const ratioW = (cw * 3 + pw + track * 3) / 100;
    let top, bottom, availW = W - (mobile() ? 24 : 2 * parseFloat(getComputedStyle(stage).paddingLeft || 40));
    if (mobile()) { top = 0; bottom = H; }
    else {
      const tb = titleEl.getBoundingClientRect(), fb = factsEl.getBoundingClientRect();
      top = tb.bottom - cr.top + 18; bottom = fb.top - cr.top - 18;
    }
    const pad = mobile() ? 0.06 : 0.02;
    const fs = Math.max(40, Math.min(availW / ratioW, ((bottom - top) / (1 + pad * 2)) / capR));
    const capH = capR * fs;
    const total = ratioW * fs;
    const x0 = (W - total) / 2;
    const baseline = top + (bottom - top) / 2 + capH / 2;
    const cells = [];
    let x = x0;
    TEXT.forEach((ch) => { const w = (ch === '+' ? pw : cw) * fs / 100; cells.push({ ch, x, w }); x += w + track * fs / 100; });
    const holeCell = cells[1];
    L = {
      W, H, dpr, fs, capH, baseline, cells,
      box: { x: x0 - 8, y: baseline - capH - 8, w: total + 16, h: capH + 16 },
      hole: { x: holeCell.x + holeCell.w / 2, y: baseline - capH / 2, w: holeCell.w * 0.34, h: capH * 0.6 },
      sTop: sr.top
    };
    dirty = true;
    draw(0);
  };

  /* ---------- odometer ---------- */
  const st = { n: reduced ? TARGET : 0, plus: reduced ? 1 : 0, zoom: 0 };
  const digitVals = (n) => {
    const r0 = n % 10;
    const r1 = Math.floor(n / 10) % 10 + clamp((n % 10) - 9, 0, 1);
    const r2 = Math.floor(n / 100) % 10 + clamp((n % 100) - 99, 0, 1);
    return [r2, r1, r0];
  };

  const glyphs = (c, mode) => {
    const { fs, capH, baseline, cells } = L;
    c.font = `900 ${fs}px ${FONT}`;
    c.textBaseline = 'alphabetic';
    const vals = digitVals(st.n);
    const step = capH * 1.3;
    cells.forEach((cell, i) => {
      if (cell.ch === '+') {
        if (st.plus <= 0) return;
        c.save();
        c.beginPath(); c.rect(cell.x - 4, baseline - capH * st.plus - 4, cell.w + 8, capH * st.plus + 8); c.clip();
        mode === 'fill' ? c.fillText('+', cell.x, baseline) : c.strokeText('+', cell.x, baseline);
        c.restore();
        return;
      }
      const r = vals[i];
      const d = Math.floor(r) % 10, f = r - Math.floor(r);
      c.save();
      c.beginPath(); c.rect(cell.x - 6, baseline - capH - 6, cell.w + 12, capH + 12); c.clip();
      const y = baseline - f * step;
      const put = (s, yy) => { const w = c.measureText(s).width; const xx = cell.x + (cell.w - w) / 2; mode === 'fill' ? c.fillText(s, xx, yy) : c.strokeText(s, xx, yy); };
      put(String(d), y);
      if (f > 0.001) put(String((d + 1) % 10), y + step);
      c.restore();
    });
  };

  const drawWall = (c, t) => {
    const { box } = L;
    c.fillStyle = '#16161a';
    c.fillRect(box.x, box.y, box.w, box.h);
    const gap = Math.max(4, L.fs * 0.008);
    let y = box.y;
    rowsDef.forEach((row, ri) => {
      const h = box.h * row.k - gap;
      const ar = row.short ? 9 / 16 : 16 / 9;
      const w = h * ar;
      const span = row.list.length * (w + gap);
      let x = box.x - (((offs[ri] % span) + span) % span);
      let k = 0;
      while (x < box.x + box.w) {
        const it = row.list[k % row.list.length];
        const im = pics.get(it.id);
        if (x + w > box.x) {
          if (im) {
            // cover-fit into the cell
            const s = Math.max(w / im.naturalWidth, h / im.naturalHeight);
            const sw = w / s, sh = h / s;
            c.drawImage(im, (im.naturalWidth - sw) / 2, (im.naturalHeight - sh) / 2, sw, sh, x, y, w, h);
          } else { c.fillStyle = '#222228'; c.fillRect(x, y, w, h); }
        }
        x += w + gap; k++;
      }
      y += h + gap;
    });
  };

  const draw = (t) => {
    if (!L) return;
    const { W, H, dpr, hole } = L;
    // camera: dolly into the first "0" — the hole drifts to centre while scale grows exponentially
    const z = st.zoom;
    const e = z * z * (3 - 2 * z);
    const sEnd = 2.4 * Math.max(W / hole.w, H / hole.h);
    const s = Math.exp(Math.log(sEnd) * Math.pow(z, 1.6));
    const cx = lerp(hole.x, W / 2, e), cy = lerp(hole.y, H / 2, e);
    const T = [dpr * s, 0, 0, dpr * s, dpr * (cx - hole.x * s), dpr * (cy - hole.y * s)];
    // mask
    m.setTransform(1, 0, 0, 1, 0, 0);
    m.clearRect(0, 0, mask.width, mask.height);
    m.setTransform(...T);
    m.fillStyle = '#fff';
    glyphs(m, 'fill');
    // picture
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalCompositeOperation = 'source-over';
    g.clearRect(0, 0, canvas.width, canvas.height);
    g.setTransform(...T);
    drawWall(g, t);
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalCompositeOperation = 'destination-in';
    g.drawImage(mask, 0, 0);
    g.globalCompositeOperation = 'source-over';
    // hairline edge in the section accent so the letterforms read even on dark frames
    g.setTransform(...T);
    g.strokeStyle = 'rgba(245,217,10,.85)';
    g.lineWidth = 1.25 / s;
    glyphs(g, 'stroke');
    // through the hole: the next clip's accent light
    if (z > 0.02) {
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      const a = clamp((z - 0.55) / 0.45, 0, 1);
      if (a > 0) {
        const rg = g.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.7);
        rg.addColorStop(0, `rgba(25,227,210,${0.16 * a})`);
        rg.addColorStop(1, 'rgba(25,227,210,0)');
        g.globalCompositeOperation = 'destination-over';
        g.fillStyle = rg; g.fillRect(0, 0, W, H);
        g.globalCompositeOperation = 'source-over';
      }
    }
    if (holeEl) {
      const ha = clamp((z - 0.5) / 0.35, 0, 1) * (1 - clamp((z - 0.94) / 0.06, 0, 1));
      holeEl.style.opacity = ha.toFixed(3);
    }
  };

  /* ---------- run ---------- */
  const near = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { loadPics(); near.disconnect(); } }, { rootMargin: '900px 0px' });
  near.observe(section);

  const fontReady = document.fonts ? document.fonts.load(`900 100px ${FONT}`).catch(() => {}) : Promise.resolve();
  fontReady.then(() => { layout(); });
  ctx.onResize(layout);
  if (document.fonts) document.fonts.ready.then(layout);

  if (reduced || !gsap) {
    if (tcEl) tcEl.textContent = ctx.timecode(TARGET);
    section.classList.add('is-counted');
    return;
  }

  // flowing wall (only while visible)
  ctx.loop(section, (t, dt) => {
    const vel = ctx.lenis ? clamp(ctx.lenis.velocity, -60, 60) : 0;
    const boost = 1 + Math.abs(vel) * 0.12;
    rowsDef.forEach((r, i) => { offs[i] += (-r.v * boost * dt) / 1000 * (mobile() ? 0.7 : 1); });
    draw(t);
  });

  // frame-counter odometer: stepped at 24fps, triggered when the window is on screen
  let counted = false;
  const count = () => {
    if (counted) return; counted = true;
    const tw = { n: 0 };
    let fr = -1;
    const tl = gsap.timeline();
    tl.to(tw, {
        n: TARGET, duration: 1.7, ease: 'power3.out',
        onUpdate: () => {
          // quantise to 24fps: a frame counter clicks, it does not glide
          const f = Math.floor(tl.time() * 24);
          if (f === fr && tw.n < TARGET) return;
          fr = f; st.n = tw.n >= TARGET - 0.01 ? TARGET : tw.n;
          if (tcEl) tcEl.textContent = ctx.timecode(st.n);
        }
      })
      .to(st, { plus: 1, duration: 3 / 24, ease: 'steps(3)' }, '-=0.05')
      .call(() => section.classList.add('is-counted'));
  };
  ready.then(() => {
    ScrollTrigger.create({ trigger: section, start: () => (mobile() ? 'top 70%' : 'top 55%'), once: true, onEnter: count });
  });

  // desktop: pin + dolly through the "0"
  const mmq = gsap.matchMedia();
  mmq.add('(min-width: 768px)', () => {
    const fx = (p) => {
      st.zoom = clamp((p - 0.28) / 0.72, 0, 1);
      const z = st.zoom;
      // the copy rides the same dolly: pushed outward from the hole, gone before the hole closes in
      if (L) {
        const s = 1 + Math.pow(z, 1.6) * 3.2;
        const ox = L.hole.x, oy = L.hole.y;
        gsap.set(layer, { transformOrigin: `${ox}px ${oy}px`, scale: s, opacity: 1 - clamp((z - 0.08) / 0.32, 0, 1) });
      }
      if (z > 0 && !counted) { st.n = TARGET; st.plus = 1; counted = true; section.classList.add('is-counted'); }
    };
    const trig = ScrollTrigger.create({
      trigger: stage,
      start: 'top top',
      end: () => `+=${Math.round(window.innerHeight * 1.35)}`,
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onRefresh: () => layout(),
      onUpdate: (self) => fx(self.progress)
    });
    return () => { trig.kill(); gsap.set(layer, { clearProps: 'transform,opacity' }); st.zoom = 0; };
  });
  qsa('a', section).forEach((a) => a.addEventListener('focus', () => { st.zoom = 0; }));
}
