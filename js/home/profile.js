/* ==========================================================================
   SEC 11 PROFILE — clapperboard (owner: H2)
   The slate is held open, snaps shut exactly once when it comes on screen
   (no sound — a hard 2-frame jolt instead), and the slate fields are then
   chalked in left-to-right. Slate TC runs while on screen.
   Reduced motion / no JS: the closed slate with every field filled in.
   ========================================================================== */
import { qs, qsa } from '../core.js';

export function init(ctx) {
  const { gsap, reduced } = ctx;
  const root = qs('#profile');
  const slate = root && qs('[data-slate]', root);
  if (!slate) return;
  const tc = qs('.slate__tc', slate);
  let f = 0;
  ctx.loop(slate, (t, dt) => { f += dt / (1000 / 24); tc.textContent = ctx.timecode(f); });
  if (reduced || !gsap) return;

  const top = qs('.slate__stick--top', slate);
  const values = qsa('.slate__v', slate);
  const board = qs('.slate__board', slate);
  slate.classList.add('is-armed');
  // hand the pre-states over to GSAP explicitly (see CONVENTIONS §10)
  gsap.set(top, { rotate: -26, transformOrigin: '18px 100%' });
  gsap.set(values, { clipPath: 'inset(0 100% 0 0)' });
  slate.classList.remove('is-armed');

  let done = false;
  const io = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting || done) return;
    done = true;
    io.disconnect();
    ctx.ready.then(() => {
      const tl = gsap.timeline({ delay: 0.25 });
      // a little hesitation, then the clap
      tl.to(top, { rotate: -31, duration: 0.28, ease: 'power2.out' })
        .to(top, { rotate: 0, duration: 0.11, ease: 'power4.in' })
        .to(slate, { x: 3, y: 2, rotate: 0.35, duration: 1 / 24, ease: 'none' })
        .to(slate, { x: -2, y: -1, rotate: -0.2, duration: 1 / 24, ease: 'none' })
        .to(slate, { x: 0, y: 0, rotate: 0, duration: 1 / 24, ease: 'none', clearProps: 'transform' })
        .fromTo(board, { boxShadow: '0 0 0 2px #fff, 0 0 60px rgba(255,255,255,.35)' }, { boxShadow: '0 0 0 2px #2a2a2e, 0 40px 80px -30px rgba(0,0,0,.9)', duration: 0.4, ease: 'power2.out', clearProps: 'boxShadow' }, '<-0.04')
        .to(values, { clipPath: 'inset(0 0% 0 0)', duration: 0.45, ease: 'steps(9)', stagger: 0.12, clearProps: 'clipPath' }, '-=0.25');
    });
  }, { threshold: 0.55 });
  io.observe(slate);
}
