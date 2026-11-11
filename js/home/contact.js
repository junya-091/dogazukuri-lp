/* ==========================================================================
   SEC 13 CONTACT + FOOTER — bars & tone → end roll (owner: H2)
   SMPTE bars rise in a vertical wipe (CSS, triggered once), the title panel
   mattes open over them, the mail button is magnetic. The footer is an end
   roll: the credits travel up faster than the page so they "roll" as you
   reach the end, landing exactly in place at the bottom of the page.
   Reduced motion: bars and credits static. No JS: all visible.
   ========================================================================== */
import { qs } from '../core.js';

export function init(ctx) {
  const { gsap, ScrollTrigger, reduced } = ctx;
  const root = qs('#contact');
  if (!root) return;
  const tc = qs('.ct__tc', root);
  let f = 59 * 60 * 24 + 50 * 24; // bars run up to 01:00:00:00, like a tape head before programme start
  ctx.loop(root, (t, dt) => { f += dt / (1000 / 24); tc.textContent = ctx.timecode(f); });

  if (reduced || !gsap) { root.classList.add('is-on'); return; }

  const io = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    io.disconnect();
    ctx.ready.then(() => root.classList.add('is-on'));
  }, { threshold: 0.3 });
  io.observe(root);

  /* magnetic mail button */
  const mail = qs('.ct__mail', root);
  if (mail && !ctx.isTouch) {
    const xTo = gsap.quickTo(mail, 'x', { duration: 0.45, ease: 'power3.out' });
    const yTo = gsap.quickTo(mail, 'y', { duration: 0.45, ease: 'power3.out' });
    const R = 140;
    root.addEventListener('pointermove', (e) => {
      const b = mail.getBoundingClientRect();
      const cx = b.left + b.width / 2 - (gsap.getProperty(mail, 'x') || 0);
      const cy = b.top + b.height / 2 - (gsap.getProperty(mail, 'y') || 0);
      const dx = e.clientX - cx, dy = e.clientY - cy;
      const d = Math.hypot(dx, dy);
      const reach = Math.max(b.width, b.height) / 2 + R;
      if (d < reach) { const k = (1 - d / reach) * 0.42; xTo(dx * k); yTo(dy * k); }
      else { xTo(0); yTo(0); }
    }, { passive: true });
    root.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
  }

  /* footer end roll */
  const footer = qs('#footer');
  const reel = footer && qs('.roll__reel', footer);
  if (reel) {
    gsap.fromTo(reel, { y: () => Math.min(window.innerHeight * 0.55, reel.offsetHeight * 0.5) }, {
      y: 0, ease: 'none',
      scrollTrigger: { trigger: footer, start: 'top bottom', end: 'bottom bottom', scrub: true, invalidateOnRefresh: true }
    });
  }
}
