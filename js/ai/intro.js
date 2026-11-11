/* ==========================================================================
   A0 INTRO — seed-noise flash. A 10-digit seed races while full-frame latent
   noise flashes (magenta/blue tinted), the digits lock left→right, then the
   noise dissolves pixel by pixel (threshold dither) into the page.
   Once per session, ~1.2s, click/key skips, never on reduced motion.
   ========================================================================== */
import { qs } from '../core.js';
import { getSeed, fmtSeed, finishIntro } from './state.js';

export function init(ctx) {
  const root = document.documentElement;
  const el = qs('.intro');
  if (!el || !root.classList.contains('ai-intro') || ctx.reduced) {
    if (el) el.classList.add('is-done');
    root.classList.remove('ai-intro');
    finishIntro();
    return;
  }
  try { sessionStorage.setItem('dz-ai-intro-seen', '1'); } catch (_) { /* private mode */ }
  if (ctx.lenis) ctx.lenis.stop();

  const cv = qs('.intro__noise', el);
  const seedEl = qs('.intro__seed', el);
  const W = 160;
  const H = Math.max(60, Math.round(W * innerHeight / innerWidth));
  cv.width = W; cv.height = H;
  const g = cv.getContext('2d');
  const img = g.createImageData(W, H);
  const keep = new Float32Array(W * H); // per-pixel dissolve order (fixed once)
  for (let i = 0; i < keep.length; i++) keep[i] = Math.random();
  const target = fmtSeed(getSeed());

  const FLASH = [0, 140, 300, 470];
  const LOCK0 = 520, LOCK1 = 820, DIS0 = 820, END = 1220;
  const t0 = performance.now();
  let raf = 0, done = false, lastFrame = -1;

  const finish = () => {
    if (done) return;
    done = true;
    cancelAnimationFrame(raf);
    el.classList.add('is-done');
    root.classList.remove('ai-intro');
    if (ctx.lenis) ctx.lenis.start();
    removeEventListener('keydown', finish);
    finishIntro();
  };

  const tick = (now) => {
    const t = now - t0;
    // step the noise at ~16fps so it reads as discrete sampler frames
    const frame = Math.floor(t / 60);
    if (frame !== lastFrame) {
      lastFrame = frame;
      let flash = 0;
      FLASH.forEach((f) => { const d = t - f; if (d >= 0 && d < 70) flash = Math.max(flash, 1 - d / 70); });
      const base = t < DIS0 ? 0.5 + flash * 0.5 : 0.55;
      const thr = t < DIS0 ? -1 : (t - DIS0) / (END - DIS0);
      const d = img.data;
      for (let i = 0, p = 0; i < keep.length; i++, p += 4) {
        const v = Math.random();
        const tint = Math.random();
        const L = v * 255 * base;
        // magenta / blue latent tint on a portion of pixels
        d[p] = L + (tint > 0.82 ? 120 * base : 0);
        d[p + 1] = L * 0.82;
        d[p + 2] = L + (tint < 0.2 ? 140 * base : 30);
        d[p + 3] = keep[i] < thr ? 0 : 255;
      }
      g.putImageData(img, 0, 0);
    }
    // seed readout: free-running digits, then lock left → right
    const lockN = t < LOCK0 ? 0 : Math.min(10, Math.floor(((t - LOCK0) / (LOCK1 - LOCK0)) * 10) + 1);
    let s = '';
    for (let i = 0; i < 10; i++) s += i < lockN ? target[i] : String((Math.random() * 10) | 0);
    seedEl.textContent = s;
    el.style.setProperty('--fade', t > DIS0 ? String(1 - (t - DIS0) / (END - DIS0)) : '1');
    qs('.intro__read', el).style.opacity = t > DIS0 + 120 ? String(Math.max(0, 1 - (t - DIS0 - 120) / 200)) : '1';
    if (t >= END) return finish();
    raf = requestAnimationFrame(tick);
  };
  // the intro canvas paints transparent pixels once dissolving: the page behind needs no background
  el.style.background = 'transparent';
  cv.style.background = 'transparent';
  raf = requestAnimationFrame(tick);
  el.addEventListener('click', finish, { once: true });
  addEventListener('keydown', finish, { once: true });
}
