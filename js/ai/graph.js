/* ==========================================================================
   A5 FLOW — node graph (#flow). The four steps are nodes on an editor
   canvas, wired out→in with bezier cables. On first view the graph
   "executes": each node runs (RUN → DONE) and a pulse travels the wire to the
   next. Afterwards data keeps flowing along the cables. Nodes can be dragged
   (pointer, or focus + arrow keys); cables follow. Mobile: vertical chain.
   ========================================================================== */
import { qs, qsa, clamp } from '../core.js';

const NS = 'http://www.w3.org/2000/svg';
const LAYOUT = [[0, 0.06], [0.33, 0.9], [0.65, 0.1], [1, 0.84]];

export function init(ctx) {
  const sec = qs('.graph');
  if (!sec) return;
  const board = qs('.graph__board', sec);
  const svg = qs('.graph__wires', sec);
  const nodes = qsa('.node', sec);
  sec.classList.add('is-live');
  const states = nodes.map((n) => qs('.node__st', n));
  const setState = (i, s) => { nodes[i].dataset.state = s; states[i].textContent = s === 'idle' ? 'IDLE' : s === 'run' ? 'RUN…' : 'DONE'; };
  nodes.forEach((_, i) => setState(i, ctx.reduced ? 'done' : 'idle'));

  // ---- wires ----
  const defs = document.createElementNS(NS, 'defs');
  svg.appendChild(defs);
  const wires = nodes.slice(0, -1).map((_, i) => {
    const grad = document.createElementNS(NS, 'linearGradient');
    grad.id = `wireGrad${i}`;
    grad.setAttribute('gradientUnits', 'userSpaceOnUse');
    grad.innerHTML = '<stop offset="0" stop-color="#ff3dbd"/><stop offset="1" stop-color="#2b5bff"/>';
    defs.appendChild(grad);
    const mk = (cls) => { const p = document.createElementNS(NS, 'path'); p.setAttribute('class', cls); svg.appendChild(p); return p; };
    const base = mk('w-base');
    const flow = mk('w-flow');
    flow.setAttribute('stroke', `url(#wireGrad${i})`);
    const draw = mk('w-draw');
    draw.style.opacity = '0';
    const pulse = document.createElementNS(NS, 'circle');
    pulse.setAttribute('r', '4.5');
    pulse.setAttribute('class', 'w-pulse');
    pulse.setAttribute('fill', '#fff');
    pulse.style.filter = 'drop-shadow(0 0 6px #ff3dbd) drop-shadow(0 0 2px #fff)';
    svg.appendChild(pulse);
    return { grad, base, flow, draw, pulse, len: 0 };
  });

  const vertical = () => ctx.isMobile();
  const portXY = (el, br) => { const r = el.getBoundingClientRect(); return [r.left + r.width / 2 - br.left, r.top + r.height / 2 - br.top]; };
  const drawWires = () => {
    const br = board.getBoundingClientRect();
    const vert = vertical();
    wires.forEach((w, i) => {
      const [x1, y1] = portXY(qs('.node__port--out', nodes[i]), br);
      const [x2, y2] = portXY(qs('.node__port--in', nodes[i + 1]), br);
      let d;
      if (vert) { const c = Math.max(30, Math.abs(y2 - y1) * 0.55); d = `M${x1},${y1} C${x1},${y1 + c} ${x2},${y2 - c} ${x2},${y2}`; }
      else { const c = Math.max(60, Math.abs(x2 - x1) * 0.5); d = `M${x1},${y1} C${x1 + c},${y1} ${x2 - c},${y2} ${x2},${y2}`; }
      [w.base, w.flow, w.draw].forEach((p) => p.setAttribute('d', d));
      w.grad.setAttribute('x1', x1); w.grad.setAttribute('y1', y1); w.grad.setAttribute('x2', x2); w.grad.setAttribute('y2', y2);
      w.len = w.base.getTotalLength();
      w.draw.style.strokeDasharray = `${w.len}`;
    });
  };

  // ---- node placement (desktop/tablet: free canvas) ----
  const pos = LAYOUT.map(([x, y]) => ({ x, y }));
  const PAD = 28;
  const place = () => {
    if (vertical()) { nodes.forEach((n) => { n.style.left = ''; n.style.top = ''; }); return; }
    const W = board.clientWidth, H = board.clientHeight;
    nodes.forEach((n, i) => {
      const nw = n.offsetWidth, nh = n.offsetHeight;
      n.style.left = `${Math.round(PAD + pos[i].x * Math.max(0, W - nw - PAD * 2))}px`;
      n.style.top = `${Math.round(PAD + pos[i].y * Math.max(0, H - nh - PAD * 2))}px`;
    });
  };
  const refresh = () => { place(); drawWires(); };
  refresh();
  ctx.onResize(refresh);
  if (document.fonts) document.fonts.ready.then(refresh);
  addEventListener('load', refresh, { once: true });

  // ---- drag (≥768px) + keyboard nudging ----
  const moveTo = (i, left, top) => {
    const W = board.clientWidth, H = board.clientHeight, n = nodes[i];
    const nw = n.offsetWidth, nh = n.offsetHeight;
    left = clamp(left, 0, W - nw); top = clamp(top, 0, H - nh);
    n.style.left = `${left}px`; n.style.top = `${top}px`;
    pos[i].x = clamp((left - PAD) / Math.max(1, W - nw - PAD * 2), -0.1, 1.1);
    pos[i].y = clamp((top - PAD) / Math.max(1, H - nh - PAD * 2), -0.1, 1.1);
    drawWires();
  };
  nodes.forEach((n, i) => {
    n.tabIndex = 0;
    n.setAttribute('data-cursor', 'drag');
    n.addEventListener('pointerdown', (e) => {
      if (vertical() || e.button !== 0) return;
      const sx = e.clientX, sy = e.clientY, l0 = n.offsetLeft, t0 = n.offsetTop;
      n.setPointerCapture(e.pointerId);
      n.classList.add('is-drag');
      nodes.forEach((m) => { m.style.zIndex = m === n ? '5' : ''; });
      const mv = (ev) => moveTo(i, l0 + ev.clientX - sx, t0 + ev.clientY - sy);
      const up = () => { n.classList.remove('is-drag'); n.removeEventListener('pointermove', mv); n.removeEventListener('pointerup', up); n.removeEventListener('pointercancel', up); };
      n.addEventListener('pointermove', mv);
      n.addEventListener('pointerup', up);
      n.addEventListener('pointercancel', up);
      e.preventDefault();
    });
    n.addEventListener('keydown', (e) => {
      if (vertical()) return;
      const k = { ArrowLeft: [-24, 0], ArrowRight: [24, 0], ArrowUp: [0, -24], ArrowDown: [0, 24] }[e.key];
      if (!k) return;
      e.preventDefault();
      moveTo(i, n.offsetLeft + k[0], n.offsetTop + k[1]);
    });
  });

  if (ctx.reduced) { sec.classList.add('is-flowing'); return; }

  // ---- execution on first view, then continuous flow ----
  const { gsap } = ctx;
  const run = () => {
    const tl = gsap.timeline({ onComplete: () => sec.classList.add('is-flowing') });
    nodes.forEach((_, i) => {
      tl.call(() => setState(i, 'run'));
      tl.to({}, { duration: 0.55 });
      tl.call(() => setState(i, 'done'));
      if (i < wires.length) {
        const w = wires[i];
        tl.call(() => { w.draw.style.opacity = '1'; });
        tl.fromTo(w.draw, { strokeDashoffset: () => w.len }, { strokeDashoffset: 0, duration: 0.42, ease: 'power2.in' });
        tl.to(w.draw, { opacity: 0, duration: 0.3 }, '>-0.05');
      }
    });
  };
  const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); drawWires(); run(); } }, { threshold: 0.45 });
  io.observe(board);

  let off = 0;
  ctx.loop(board, (t, dt) => {
    if (!sec.classList.contains('is-flowing')) return;
    off -= dt * 0.045;
    wires.forEach((w, i) => {
      w.flow.style.strokeDashoffset = off.toFixed(1);
      if (!w.len) return;
      const p = ((t * 0.00042 + i * 0.33) % 1) * w.len;
      const pt = w.base.getPointAtLength(p);
      w.pulse.setAttribute('cx', pt.x.toFixed(1));
      w.pulse.setAttribute('cy', pt.y.toFixed(1));
    });
  });
}
