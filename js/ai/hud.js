/* ==========================================================================
   Page HUD — "STEP / SEED" progress (instead of the top page's timecode).
   Desktop/tablet: bottom bar with the current seed, a 30-cell sampler bar
   driven by page scroll, STEP n/30 and the section being "generated".
   Mobile: 2px gradient bar at the top of the nav + STEP n/30 in the nav.
   ========================================================================== */
import { qs, qsa, clamp } from '../core.js';
import { getSeed, onSeed, fmtSeed } from './state.js';

const STEPS = 30;

export function init(ctx) {
  const hud = qs('.ghud');
  const nav = qs('.nav');
  const navStep = qs('.ai-nav__step');
  const cellsWrap = hud && qs('[data-ghud-cells]', hud);
  const seedEl = hud && qs('[data-ghud-seed]', hud);
  const stepEl = hud && qs('[data-ghud-step]', hud);
  const nameEl = hud && qs('[data-ghud-name]', hud);
  const idxEl = hud && qs('[data-ghud-idx]', hud);
  const cells = [];
  if (cellsWrap) {
    for (let i = 0; i < STEPS; i++) {
      const c = document.createElement('i');
      c.style.setProperty('--k', (i / (STEPS - 1)).toFixed(3));
      cellsWrap.appendChild(c);
      cells.push(c);
    }
  }
  const setSeedText = (s) => { if (seedEl) seedEl.textContent = fmtSeed(s); };
  setSeedText(getSeed());
  onSeed(setSeedText);

  const sections = qsa('main > section[data-step-label]');
  let lastStep = -1;
  const update = () => {
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const p = clamp(scrollY / max, 0, 1);
    const step = Math.round(p * STEPS);
    if (nav) nav.style.setProperty('--progress', p.toFixed(4));
    if (step !== lastStep) {
      lastStep = step;
      const txt = `${String(step).padStart(2, '0')}/${STEPS}`;
      if (stepEl) stepEl.textContent = txt;
      if (navStep) navStep.textContent = `STEP ${txt}`;
      cells.forEach((c, i) => { c.classList.toggle('is-on', i < step); c.classList.toggle('is-head', i === step - 1 && step < STEPS); });
    }
  };
  // which section is "being generated": the one crossing the viewport's middle line
  let active = -1;
  const pick = () => {
    const mid = innerHeight * 0.5;
    let a = 0;
    sections.forEach((s, i) => { if (s.getBoundingClientRect().top <= mid) a = i; });
    if (a !== active) {
      active = a;
      if (nameEl) nameEl.textContent = sections[a].dataset.stepLabel;
      if (idxEl) idxEl.textContent = `A${a + 1}`;
    }
  };
  const onScroll = () => { update(); pick(); };
  addEventListener('scroll', onScroll, { passive: true });
  ctx.onResize(onScroll);
  if (ctx.ScrollTrigger) ctx.ScrollTrigger.addEventListener('refresh', onScroll);
  onScroll();
}
