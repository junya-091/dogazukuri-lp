/* ==========================================================================
   SEC 06 SERVICES — video switcher (owner: H2)
   6 services = 6 inputs on a multiview. The selected input is cut to the PGM
   monitor with a switcher wipe (pattern per input, coloured border), PGM red
   tally / PVW green tally, program & preset bus, T-bar, AUTO transition.
   Click a tile, press 1–6 while the section is on screen, or let AUTO run.
   Reduced motion / no JS: the static 3×2 multiview with every text visible.
   ========================================================================== */
import { qs, qsa, clamp } from '../core.js';

const AUTO_MS = 5200;
const WIPE_S = 0.62;

/* wipe patterns: p = 0..1 → clip-path for the incoming source; b = border width (0..1 units) */
const pct = (v) => `${(v * 100).toFixed(3)}%`;
const WIPES = {
  h: (p) => `polygon(0 0, ${pct(p)} 0, ${pct(p)} 100%, 0 100%)`,
  d: (p) => { const a = p * 1.4; return `polygon(0 0, ${pct(a)} 0, ${pct(a - 0.4)} 100%, 0 100%)`; },
  v: (p) => `polygon(0 0, 100% 0, 100% ${pct(p)}, 0 ${pct(p)})`,
  box: (p) => { const h = p / 2; return `polygon(${pct(.5 - h)} ${pct(.5 - h)}, ${pct(.5 + h)} ${pct(.5 - h)}, ${pct(.5 + h)} ${pct(.5 + h)}, ${pct(.5 - h)} ${pct(.5 + h)})`; },
  barn: (p) => { const h = p / 2; return `polygon(${pct(.5 - h)} 0, ${pct(.5 + h)} 0, ${pct(.5 + h)} 100%, ${pct(.5 - h)} 100%)`; },
  r: (p) => { // clock wipe from 12 o'clock
    const a = p * Math.PI * 2, pts = ['50% 50%', '50% -50%'];
    for (let k = 1; k <= 8; k++) {
      const t = Math.min(a, (k / 8) * Math.PI * 2);
      pts.push(`${pct(.5 + Math.sin(t) * 1.2)} ${pct(.5 - Math.cos(t) * 1.2)}`);
    }
    return `polygon(${pts.join(', ')})`;
  }
};

export function init(ctx) {
  const { gsap, reduced } = ctx;
  const root = qs('#services');
  const sw = root && qs('[data-sw]', root);
  if (!sw || reduced || !gsap) return;

  const inputs = qsa('.sw__in', sw);
  const N = inputs.length;
  const data = inputs.map((li, i) => ({
    li,
    tag: qs('.service-tag', li).textContent.trim(),
    name: qs('h3', li).textContent.trim(),
    descHTML: qs('.sw__desc', li).innerHTML,
    wipe: li.dataset.wipe || 'h',
    mon: qs('.sw__mon', li),
    i
  }));

  /* ---------- build: PGM monitor ---------- */
  const pgm = document.createElement('div');
  pgm.className = 'sw__pgm';
  pgm.setAttribute('aria-hidden', 'true');
  pgm.innerHTML = '<div class="sw__screen"><div class="sw__edge"></div></div>' +
    '<div class="sw__osd"><span class="sw__safe"></span><span class="sw__badge">PGM</span><span class="sw__src"></span><span class="sw__tc">00:00:00:00</span>' +
    '<span class="sw__lt"><small></small><span></span></span></div><div class="sw__auto"><i></i></div>';
  const screen = qs('.sw__screen', pgm);
  const edge = qs('.sw__edge', pgm);
  const osdSrc = qs('.sw__src', pgm);
  const osdTc = qs('.sw__tc', pgm);
  const ltTag = qs('.sw__lt small', pgm);
  const ltName = qs('.sw__lt span', pgm);
  const autoBar = qs('.sw__auto i', pgm);

  const layers = data.map((d) => {
    const layer = document.createElement('div');
    layer.className = 'sw__layer';
    const mon = d.mon.cloneNode(true);
    mon.removeAttribute('aria-hidden');
    // swap the poster that stands for a clip into a real (lazy) video on the program bus
    qsa('img[data-video]', mon).forEach((img) => {
      const v = document.createElement('video');
      v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'none';
      v.setAttribute('muted', ''); v.setAttribute('playsinline', '');
      v.poster = img.getAttribute('src');
      v.dataset.src = img.dataset.video;
      v.className = img.className;
      img.replaceWith(v);
    });
    qsa('img', mon).forEach((im) => { im.loading = 'eager'; });
    layer.appendChild(mon);
    screen.insertBefore(layer, edge);
    return layer;
  });

  /* ---------- build: info + control panel ---------- */
  const info = document.createElement('div');
  info.className = 'sw__info';
  const keys = (bus) => data.map((d) => `<button type="button" class="sw__key" tabindex="-1" aria-hidden="true" data-bus="${bus}" data-i="${d.i}">${d.i + 1}</button>`).join('');
  info.innerHTML =
    '<p class="sw__status" aria-hidden="true"><span><b>●</b> PGM</span><span data-sw-in>IN 1 / 6</span><span data-sw-next>PVW IN 2</span></p>' +
    '<div class="sw__copy" aria-live="polite"><p class="sw__tag" aria-hidden="true"></p><p class="sw__name"></p><p class="sw__text"></p></div>' +
    '<div class="sw__panel">' +
      `<div class="sw__bus" aria-hidden="true"><div class="sw__busrow sw__busrow--pgm"><span>PGM</span>${keys('pgm')}</div><div class="sw__busrow sw__busrow--pvw"><span>PVW</span>${keys('pvw')}</div></div>` +
      '<div class="sw__tbar" aria-hidden="true"><i></i></div>' +
      '<div class="sw__ctl"><button type="button" class="sw__btn" data-sw-auto aria-pressed="true">AUTO</button><button type="button" class="sw__btn" data-sw-cut>CUT ▸ PVW</button><span class="sw__hint" aria-hidden="true">KEY 1–6</span></div>' +
    '</div>';
  const copy = qs('.sw__copy', info);
  const cTag = qs('.sw__tag', info), cName = qs('.sw__name', info), cText = qs('.sw__text', info);
  const stIn = qs('[data-sw-in]', info), stNext = qs('[data-sw-next]', info);
  const autoBtn = qs('[data-sw-auto]', info), cutBtn = qs('[data-sw-cut]', info);
  const tbar = qs('.sw__tbar', info), tHandle = qs('.sw__tbar i', info);

  sw.insertBefore(info, sw.firstChild);
  sw.insertBefore(pgm, info.nextSibling);

  /* ---------- tiles: tally, accessible pick buttons, "no source" boot ---------- */
  data.forEach((d) => {
    const h3 = qs('h3', d.li);
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'sw__pick';
    b.setAttribute('aria-pressed', 'false');
    b.setAttribute('aria-controls', 'services-pgm-copy');
    b.textContent = h3.textContent;
    h3.textContent = '';
    h3.appendChild(b);
    d.btn = b;
    const t = document.createElement('span');
    t.className = 'sw__tally';
    t.setAttribute('aria-hidden', 'true');
    t.innerHTML = '<b class="pgm">PGM</b><b class="pvw">PVW</b>';
    d.mon.appendChild(t);
    qsa(':scope > img', d.mon).forEach((im) => im.style.setProperty('--i', d.i));
    d.mon.style.setProperty('--i', d.i);
    qsa(':scope > :not(.sw__tally)', d.mon).forEach((el) => el.style.setProperty('--i', d.i));
    d.li.addEventListener('click', (e) => { if (!e.target.closest('.sw__pick')) d.btn.click(); });
    b.addEventListener('click', () => { take(d.i, { user: true }); });
  });
  copy.id = 'services-pgm-copy';
  sw.classList.add('is-live');

  /* ---------- state ---------- */
  let cur = -1, next = 1, busy = false, inView = false, hovering = false, auto = true;
  let autoT0 = 0, autoTween = null;

  const setTallies = () => {
    data.forEach((d) => {
      d.li.classList.toggle('is-pgm', d.i === cur);
      d.li.classList.toggle('is-pvw', d.i === next && d.i !== cur);
      d.btn.setAttribute('aria-pressed', String(d.i === cur));
    });
    qsa('.sw__busrow--pgm .sw__key', info).forEach((k, i) => k.classList.toggle('is-on', i === cur));
    qsa('.sw__busrow--pvw .sw__key', info).forEach((k, i) => k.classList.toggle('is-on', i === next));
    stIn.textContent = `IN ${cur + 1} / ${N}`;
    stNext.textContent = `PVW IN ${next + 1}`;
  };
  const setCopy = (d) => {
    cTag.textContent = `IN ${d.i + 1} — ${d.tag}`;
    cName.textContent = d.name;
    cText.innerHTML = d.descHTML;
    ltTag.textContent = d.tag.toUpperCase();
    ltName.textContent = d.name;
    osdSrc.textContent = `IN ${d.i + 1}  ${d.tag.toUpperCase()}`;
  };
  const playLayer = (i) => {
    layers.forEach((l, k) => qsa('video', l).forEach((v) => {
      if (k === i && inView) { if (!v.src && v.dataset.src) v.src = v.dataset.src; v.play().catch(() => {}); }
      else v.pause();
    }));
  };

  const take = (i, { user = false, cut = false } = {}) => {
    i = ((i % N) + N) % N;
    if (i === cur || busy) return;
    const prev = cur;
    const d = data[i];
    cur = i;
    next = (i + 1) % N;
    setTallies();
    if (user) restartAuto();
    if (prev < 0 || cut) {
      layers.forEach((l, k) => { l.classList.toggle('is-on', k === i); l.style.clipPath = ''; l.style.zIndex = k === i ? 2 : ''; });
      setCopy(d); playLayer(i);
      return;
    }
    busy = true;
    const incoming = layers[i], outgoing = layers[prev];
    const fn = WIPES[d.wipe] || WIPES.h;
    incoming.classList.add('is-on');
    incoming.style.zIndex = 5;
    outgoing.style.zIndex = 2;
    edge.style.visibility = 'visible';
    playLayer(i);
    const st = { p: 0 };
    const B = 0.022;
    // info copy wipes on the same bus: hide, swap at mid point, reveal
    gsap.to(copy, { clipPath: 'inset(0 0 0 100%)', duration: WIPE_S * 0.45, ease: 'cut', onComplete: () => {
      setCopy(d);
      gsap.fromTo(copy, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: WIPE_S * 0.55, ease: 'cut', clearProps: 'clipPath' });
    } });
    const travel = Math.max(0, tbar.clientHeight - 20);
    gsap.to(st, {
      p: 1, duration: WIPE_S, ease: 'cut',
      onUpdate: () => {
        const p = st.p;
        incoming.style.clipPath = fn(p);
        edge.style.clipPath = fn(clamp(p + B * (1 - p) * 4, 0, 1));
        tHandle.style.setProperty('--t', `${(prev % 2 ? 1 - p : p) * travel}px`);
      },
      onComplete: () => {
        outgoing.classList.remove('is-on');
        outgoing.style.zIndex = '';
        incoming.style.zIndex = 2;
        incoming.style.clipPath = '';
        edge.style.visibility = 'hidden';
        busy = false;
      }
    });
  };

  /* ---------- AUTO: advances while on screen, idles while the visitor is reading ---------- */
  const restartAuto = () => {
    if (autoTween) autoTween.kill();
    gsap.set(autoBar, { scaleX: 0 });
    if (!auto || !inView || hovering) return;
    autoTween = gsap.to(autoBar, { scaleX: 1, duration: AUTO_MS / 1000, ease: 'none', onComplete: () => { take(cur + 1); restartAuto(); } });
  };
  autoBtn.addEventListener('click', () => {
    auto = !auto;
    autoBtn.setAttribute('aria-pressed', String(auto));
    restartAuto();
  });
  cutBtn.addEventListener('click', () => { take(next, { user: true, cut: true }); });
  qsa('.sw__key', info).forEach((k) => k.addEventListener('click', () => {
    const i = +k.dataset.i;
    if (k.dataset.bus === 'pgm') take(i, { user: true });
    else { next = i; setTallies(); }
  }));
  sw.addEventListener('pointerenter', () => { hovering = true; if (autoTween) autoTween.pause(); });
  sw.addEventListener('pointerleave', () => { hovering = false; if (autoTween) autoTween.resume(); else restartAuto(); });
  sw.addEventListener('focusin', () => { hovering = true; if (autoTween) autoTween.pause(); });
  sw.addEventListener('focusout', (e) => { if (!sw.contains(e.relatedTarget)) { hovering = false; restartAuto(); } });

  window.addEventListener('keydown', (e) => {
    if (!inView || e.metaKey || e.ctrlKey || e.altKey) return;
    const t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    if (document.querySelector('.vmodal.is-open')) return;
    const n = parseInt(e.key, 10);
    if (n >= 1 && n <= N) { take(n - 1, { user: true }); }
  });

  /* program timecode runs only on screen */
  let frames = 0;
  ctx.loop(screen, (t, dt) => { frames += dt / (1000 / 24); osdTc.textContent = ctx.timecode(frames); });

  take(0, { cut: true });

  /* ---------- entrance: inputs boot one by one, then the first take ---------- */
  let booted = false;
  const io = new IntersectionObserver(([e]) => {
    inView = e.isIntersecting;
    playLayer(cur);
    if (inView && !booted) {
      booted = true;
      ctx.ready.then(() => requestAnimationFrame(() => sw.classList.add('is-booted')));
      setTimeout(restartAuto, 900);
    } else restartAuto();
  }, { threshold: 0.2 });
  io.observe(sw);
}
