/* ==========================================================================
   SEC 09 WEB・3D — aperture iris (owner: H2)
   The 1LDK plate tilts toward the pointer (isometric-ish, HUD tags float at
   different depths). It opens into view through a 7-blade aperture, and the
   CTA closes the page down to black through the same aperture — expanding
   from the button — before moving to space-demo.html.
   Reduced motion: plain image, plain link.
   ========================================================================== */
import { qs } from '../core.js';

const BLADES = 7;
/** regular heptagon aperture around (cx, cy) with radius r (px), rotated by rot (rad) */
function aperture(cx, cy, r, rot) {
  const pts = [];
  for (let i = 0; i < BLADES; i++) {
    const a = rot + (i / BLADES) * Math.PI * 2;
    pts.push(`${(cx + Math.cos(a) * r).toFixed(1)}px ${(cy + Math.sin(a) * r).toFixed(1)}px`);
  }
  return `polygon(${pts.join(', ')})`;
}

export function init(ctx) {
  const { gsap, reduced } = ctx;
  const root = qs('#experience');
  if (!root || reduced || !gsap) return;
  const visual = qs('.xp__visual', root);
  const tilt = qs('.xp__tilt', root);
  const plate = qs('.xp__plate', root);
  const cta = qs('.xp__cta', root);

  /* ---------- pointer tilt (fine pointer) ---------- */
  const base = { rx: 16, ry: -10 };
  const cur = { rx: base.rx, ry: base.ry }, tgt = { rx: base.rx, ry: base.ry };
  let dirty = true, entering = true;
  if (!ctx.isTouch) {
    root.addEventListener('pointermove', (e) => {
      const r = visual.getBoundingClientRect();
      const nx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      const ny = ((e.clientY - r.top) / r.height - 0.5) * 2;
      tgt.ry = base.ry + ctx.clamp(nx, -1.4, 1.4) * 11;
      tgt.rx = base.rx - ctx.clamp(ny, -1.4, 1.4) * 9;
      dirty = true;
    }, { passive: true });
    root.addEventListener('pointerleave', () => { tgt.rx = base.rx; tgt.ry = base.ry; dirty = true; });
  }
  tilt.style.transition = 'none';
  ctx.loop(visual, () => {
    if (!dirty || entering) return;
    cur.rx = ctx.lerp(cur.rx, tgt.rx, 0.08);
    cur.ry = ctx.lerp(cur.ry, tgt.ry, 0.08);
    tilt.style.setProperty('--rx', `${cur.rx.toFixed(2)}deg`);
    tilt.style.setProperty('--ry', `${cur.ry.toFixed(2)}deg`);
    if (Math.abs(cur.rx - tgt.rx) + Math.abs(cur.ry - tgt.ry) < 0.02) dirty = false;
  });

  /* ---------- entrance: the plate opens through the aperture ---------- */
  const ap = { r: 0, rot: 0 };
  const drawAp = () => {
    const w = plate.offsetWidth, h = plate.offsetHeight;
    plate.style.clipPath = aperture(w / 2, h / 2, ap.r * Math.hypot(w, h) * 0.62, ap.rot);
  };
  drawAp();
  gsap.set(tilt, { '--rx': '58deg', '--ry': '-28deg' });
  const io = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    io.disconnect();
    ctx.ready.then(() => {
      gsap.to(ap, { r: 1, rot: 1.6, duration: 1.1, ease: 'expo.inOut', onUpdate: drawAp, onComplete: () => { plate.style.clipPath = ''; } });
      gsap.to(tilt, { '--rx': `${base.rx}deg`, '--ry': `${base.ry}deg`, duration: 1.4, ease: 'expo.out', onComplete: () => { entering = false; dirty = true; } });
    });
  }, { threshold: 0.35 });
  io.observe(visual);

  /* ---------- CTA: iris out to black, then go ---------- */
  let going = false;
  cta.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || going) return;
    e.preventDefault();
    going = true;
    const href = cta.href;
    const b = cta.getBoundingClientRect();
    const cx = b.left + b.width / 2, cy = b.top + b.height / 2;
    const R = Math.hypot(Math.max(cx, innerWidth - cx), Math.max(cy, innerHeight - cy)) * 1.12;
    const iris = document.createElement('div');
    iris.className = 'iris';
    iris.setAttribute('aria-hidden', 'true');
    iris.innerHTML = '<p>OPENING 3D SPACE</p>';
    document.body.appendChild(iris);
    const o = { r: 0, rot: 0 };
    const draw = () => { iris.style.clipPath = aperture(cx, cy, o.r, o.rot); };
    draw();
    if (ctx.lenis) ctx.lenis.stop();
    gsap.to(o, { r: R, rot: -1.4, duration: 0.75, ease: 'expo.in', onUpdate: draw, onComplete: () => { window.location.href = href; } });
    // safety net if navigation is blocked
    setTimeout(() => { window.location.href = href; }, 1600);
  });
  // coming back via bfcache: drop the black iris
  window.addEventListener('pageshow', (e) => {
    if (!e.persisted) return;
    document.querySelectorAll('.iris').forEach((n) => n.remove());
    going = false;
    if (ctx.lenis) ctx.lenis.start();
  });
}
