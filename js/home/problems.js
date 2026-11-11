/* ==========================================================================
   SEC 05 こんな悩み #problems — red pen on the script (owner: H1)
   The worries are set as dialogue on a script page. As each scene scrolls up,
   a red pen marks it — circle (S#1), double strike (S#2), wavy underline (S#3) —
   then an arrow runs into the margin and the fix is hand-written there, letter
   by letter (Zen Kurenaido). All strokes are SVG paths scrubbed by scroll.
   ========================================================================== */
import { qs, qsa } from '../core.js';

const NS = 'http://www.w3.org/2000/svg';
let seed = 7;
const rand = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
const j = (a) => (rand() - 0.5) * 2 * a; // jitter

function circlePath(r) {
  const cx = r.x + r.w / 2, cy = r.y + r.h / 2;
  const rx = r.w / 2 + 16, ry = r.h / 2 + 10;
  const t0 = -2.6, turn = Math.PI * 2 * 1.1;
  const pts = [];
  for (let i = 0; i <= 64; i++) {
    const t = t0 + (turn * i) / 64;
    const k = 1 + 0.035 * Math.sin(t * 3 + 1.3) + (i / 64) * 0.06;
    pts.push([cx + Math.cos(t) * rx * k, cy + Math.sin(t) * ry * k * 1.04]);
  }
  return 'M' + pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' L');
}
function strikePath(r) {
  const y = r.y + r.h * 0.5;
  const a = `M${r.x - 8} ${y + 3 + j(1)} C${r.x + r.w * 0.3} ${y - 1 + j(2)} ${r.x + r.w * 0.7} ${y + 2 + j(2)} ${r.x + r.w + 10} ${y - 4}`;
  const b = `M${r.x + r.w + 6} ${y + 6} C${r.x + r.w * 0.66} ${y + 9 + j(2)} ${r.x + r.w * 0.33} ${y + 6 + j(2)} ${r.x - 4} ${y + 10}`;
  return [a, b];
}
function wavePath(r) {
  const y = r.y + r.h + 4;
  let d = `M${r.x - 4} ${y}`;
  const n = Math.max(4, Math.round(r.w / 18));
  const step = (r.w + 10) / n;
  for (let i = 0; i < n; i++) {
    const x = r.x - 4 + step * (i + 1);
    d += ` Q${(x - step / 2).toFixed(1)} ${(y + (i % 2 ? -7 : 7) + j(1.5)).toFixed(1)} ${x.toFixed(1)} ${(y + j(1)).toFixed(1)}`;
  }
  return d;
}
function arrowPaths(a, b, down) {
  // a → b with a hand-drawn bow; returns [shaft, head]
  const dx = b[0] - a[0], dy = b[1] - a[1];
  // desktop: leave the marked phrase horizontally (never back across the dialogue), then climb into the margin
  const c1 = down ? [a[0] - 26, a[1] + dy * 0.55] : [a[0] + Math.max(dx * 0.62, 40), a[1] + 2];
  const c2 = down ? [b[0] - 22, b[1] - dy * 0.45] : [b[0] - dx * 0.22, b[1] + (dy > 0 ? -6 : 6)];
  const shaft = `M${a[0].toFixed(1)} ${a[1].toFixed(1)} C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${b[0].toFixed(1)} ${b[1].toFixed(1)}`;
  const ang = Math.atan2(b[1] - c2[1], b[0] - c2[0]);
  const L = 15;
  const h1 = [b[0] - Math.cos(ang - 0.5) * L, b[1] - Math.sin(ang - 0.5) * L];
  const h2 = [b[0] - Math.cos(ang + 0.5) * L, b[1] - Math.sin(ang + 0.5) * L];
  const head = `M${h1[0].toFixed(1)} ${h1[1].toFixed(1)} L${b[0].toFixed(1)} ${b[1].toFixed(1)} L${h2[0].toFixed(1)} ${h2[1].toFixed(1)}`;
  return [shaft, head];
}

export function init(ctx) {
  const { gsap, ScrollTrigger, reduced } = ctx;
  const section = qs('#problems');
  if (!section) return;
  const scenes = qsa('.problems__scene', section);
  const stamp = qs('.problems__stamp', section);
  const anim = !reduced && !!gsap;

  const built = scenes.map((scene) => {
    const fix = qs('.problems__fix', scene);
    const mark = qs('[data-mark]', scene);
    // hand-written copy: visible letters are a decorative duplicate, the real text stays for AT
    const text = fix.textContent;
    fix.textContent = '';
    const sr = document.createElement('span'); sr.className = 'sr-only'; sr.textContent = text;
    const vis = document.createElement('span'); vis.setAttribute('aria-hidden', 'true'); vis.className = 'problems__ink-text';
    const chars = [...text].map((ch) => { const s = document.createElement('span'); s.textContent = ch; vis.appendChild(s); return s; });
    fix.append(sr, vis);
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'problems__ink');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    scene.appendChild(svg);
    return { scene, fix, mark, chars, svg, paths: { mark: [], arrow: [] } };
  });

  const mkPath = (svg, d, cls) => {
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('d', d);
    p.setAttribute('pathLength', '1');
    p.setAttribute('class', cls);
    svg.appendChild(p);
    return p;
  };

  const setD = (list, svg, ds, cls) => {
    ds.forEach((d, i) => { if (!list[i]) { list[i] = mkPath(svg, d, cls); list[i].style.strokeDasharray = '1 1'; list[i].style.strokeDashoffset = anim ? '1' : '0'; } else list[i].setAttribute('d', d); });
  };
  const geometry = () => {
    seed = 7;
    const down = window.matchMedia('(max-width: 1023px)').matches;
    built.forEach((b) => {
      const sr = b.scene.getBoundingClientRect();
      if (!sr.width) return;
      b.svg.setAttribute('viewBox', `0 0 ${sr.width} ${sr.height}`);
      b.svg.setAttribute('width', sr.width); b.svg.setAttribute('height', sr.height);
      const mr = b.mark.getBoundingClientRect();
      const r = { x: mr.left - sr.left, y: mr.top - sr.top, w: mr.width, h: mr.height };
      const kind = b.mark.dataset.mark;
      const marks = kind === 'circle' ? [circlePath(r)] : kind === 'strike' ? strikePath(r) : [wavePath(r), wavePath({ ...r, y: r.y + 7, x: r.x + 6, w: r.w - 10 })];
      setD(b.paths.mark, b.svg, marks, 'pen');
      const fr = b.fix.getBoundingClientRect();
      const f = { x: fr.left - sr.left, y: fr.top - sr.top };
      let a, e;
      if (down) { a = [r.x + Math.min(r.w * 0.3, 40), r.y + r.h + (kind === 'circle' ? 14 : 20)]; e = [Math.max(f.x + 10, a[0] + 14), f.y - 6]; if (e[1] - a[1] < 24) e[1] = a[1] + 24; }
      else { a = [r.x + r.w + (kind === 'circle' ? 20 : 14), r.y + r.h * 0.5]; e = [f.x - 14, Math.min(Math.max(a[1], f.y + 14), f.y + fr.height - 14)]; }
      setD(b.paths.arrow, b.svg, arrowPaths(a, e, down), 'pen pen--thin');
    });
  };

  if (document.fonts) document.fonts.ready.then(() => { geometry(); if (anim) build(); });
  else geometry();

  let tls = [];
  const build = () => {
    tls.forEach((t) => { t.scrollTrigger && t.scrollTrigger.kill(); t.kill(); });
    tls = built.map((b) => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: b.scene, start: 'top 76%', end: () => (ctx.isMobile() ? 'bottom 55%' : 'top 22%'), scrub: 0.6, invalidateOnRefresh: true }
      });
      gsap.set(b.chars, { opacity: 0 });
      gsap.set(b.paths.mark.concat(b.paths.arrow), { strokeDashoffset: 1 });
      tl.to(b.paths.mark, { strokeDashoffset: 0, duration: 0.3, ease: 'power1.inOut', stagger: 0.1 })
        .to(b.paths.arrow[0], { strokeDashoffset: 0, duration: 0.22, ease: 'power1.in' })
        .to(b.paths.arrow[1], { strokeDashoffset: 0, duration: 0.06, ease: 'none' })
        .to(b.chars, { opacity: 1, duration: 0.02, stagger: 0.012, ease: 'none' }, '>-0.02');
      return tl;
    });
    if (stamp) {
      tls.push(gsap.timeline({ scrollTrigger: { trigger: stamp, start: 'top 85%', toggleActions: 'play none none reverse' } })
        .fromTo(stamp, { scale: 1.9, rotation: -4, opacity: 0 }, { scale: 1, rotation: -12, opacity: 1, duration: 0.18, ease: 'power4.in' })
        .fromTo(stamp, { x: 0 }, { x: 2, duration: 0.04, yoyo: true, repeat: 3, ease: 'none' }));
    }
  };

  let lastW = window.innerWidth;
  ctx.onResize(() => { if (window.innerWidth === lastW) return; lastW = window.innerWidth; geometry(); });
  if (ScrollTrigger) ScrollTrigger.addEventListener('refreshInit', geometry);
  if (!anim) section.classList.add('is-marked');
}
