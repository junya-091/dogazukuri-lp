/* ==========================================================================
   SEC 04 制作実績 #works — contact sheet (owner: H1)
   Justified film rows mixing 16:9 and 9:16 frames (sprocket strip between rows,
   edge numbers under each frame). Filters re-flow the sheet (FLIP: every frame
   travels from its old slot to its new one; leaving frames under-expose, new
   ones develop from white). Hover: 3D tilt + inner parallax, cursor turns into
   the PLAY disc. Click: the thumbnail itself flies into the player (shared
   element) and the letterbox bars close in. "もっと見る" keeps 24 + 16.
   Data, filtering and priority come from js/data/works.js unchanged; within the
   priority order, 9:16 and 16:9 frames are interleaved so the vertical work is
   visible in the first rows.
   ========================================================================== */
import { qs, qsa } from '../core.js';
import { filteredWorks, categoriesFor, categoryLabels, hasVideoUrl, initialVisibleCount, loadMoreStep, worksListUrl } from '../data/works.js';

const thumb = (item, size) => item.image.replace(/^assets\/works\//, 'assets/works/thumb/').replace(/\.(jpe?g|png)$/i, `-${size}.webp`);
const AR = { wide: 16 / 9, short: 9 / 16 };

/** Interleave the (already priority-sorted) list: wide units of 1–2, short units of 1–3. */
function arrange(items) {
  const w = items.filter((i) => i.aspect !== 'short');
  const s = items.filter((i) => i.aspect === 'short');
  if (!w.length || !s.length) return items.slice();
  const wu = [1, 2, 1, 1, 2], su = [2, 1, 3, 2, 1];
  const out = [];
  let a = 0, b = 0, k = 0;
  while (a < w.length || b < s.length) {
    for (let n = 0; n < wu[k % wu.length] && a < w.length; n++) out.push(w[a++]);
    for (let n = 0; n < su[k % su.length] && b < s.length; n++) out.push(s[b++]);
    k++;
  }
  return out;
}

function platform(url) {
  try {
    const h = new URL(url).hostname.replace(/^www\./, '');
    if (h.includes('youtu')) return 'YouTube';
    if (h.includes('tiktok')) return 'TikTok';
    if (h.includes('instagram')) return 'Instagram';
  } catch (_) { /* ignore */ }
  return '';
}

export function init(ctx) {
  const { gsap, ScrollTrigger, reduced, isTouch } = ctx;
  const section = qs('#works');
  const sheet = qs('#workGrid');
  const filtersEl = qs('#workFilters');
  const more = qs('#loadMoreWorks');
  if (!section || !sheet) return;
  const anim = !reduced && !!gsap;
  let filter = 'all';
  let visible = initialVisibleCount;
  const cards = new Map(); // id -> { el, item, rect }
  let strips = [];
  let laidOut = false;

  /* ---------- card ---------- */
  const build = (item) => {
    const yt = ctx.parseYouTube(item.url);
    const real = hasVideoUrl(item);
    const url = real ? item.url : worksListUrl;
    const plat = real ? platform(item.url) : 'YouTube';
    const a = document.createElement('a');
    a.className = `works__card works__card--${item.aspect === 'short' ? 'short' : 'wide'}`;
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.dataset.id = item.id;
    a.dataset.cursor = 'play';
    a.dataset.cursorLabel = yt ? 'PLAY' : `${plat || 'OPEN'} ↗`;
    const cats = categoriesFor(item).map((c) => categoryLabels[c] || c).join(' / ');
    const sizes = item.aspect === 'short' ? '(max-width: 767px) 34vw, 220px' : '(max-width: 767px) 92vw, 560px';
    a.innerHTML =
      `<span class="works__frame"><span class="works__pic"><img class="works__img" alt="" loading="lazy" decoding="async"` +
      ` width="${item.aspect === 'short' ? 450 : 800}" height="${item.aspect === 'short' ? 800 : 450}"` +
      ` src="${thumb(item, 'm')}" srcset="${thumb(item, 's')} ${item.aspect === 'short' ? 270 : 480}w, ${thumb(item, 'm')} ${item.aspect === 'short' ? 450 : 800}w" sizes="${sizes}"></span>` +
      `<span class="works__shine" aria-hidden="true"></span></span>` +
      `<span class="works__cap"><span class="works__edge" aria-hidden="true"><b data-edge></b><i>${item.aspect === 'short' ? '9:16' : '16:9'}</i><i>${plat}</i></span>` +
      `<h3 class="works__name"></h3><span class="sr-only"></span></span>`;
    qs('.works__name', a).textContent = item.title;
    qs('.sr-only', a).textContent = `（${cats}）${yt ? '動画を再生' : '新しいタブで開く'}`;
    const img = qs('img', a);
    img.addEventListener('error', () => { if (!img.dataset.fb) { img.dataset.fb = '1'; img.removeAttribute('srcset'); img.src = item.image; } });
    a.addEventListener('click', (e) => onPlay(e, a, item, yt));
    if (anim && !isTouch) tilt(a);
    return a;
  };

  /* ---------- hover: 3D tilt + inner parallax ---------- */
  const tilt = (a) => {
    const frame = qs('.works__frame', a);
    const pic = qs('.works__pic', a);
    const shine = qs('.works__shine', a);
    let q = null;
    const mk = () => {
      q = {
        rx: gsap.quickTo(frame, 'rotationX', { duration: 0.5, ease: 'power3.out' }),
        ry: gsap.quickTo(frame, 'rotationY', { duration: 0.5, ease: 'power3.out' }),
        px: gsap.quickTo(pic, 'x', { duration: 0.6, ease: 'power3.out' }),
        py: gsap.quickTo(pic, 'y', { duration: 0.6, ease: 'power3.out' })
      };
      gsap.set(frame, { transformPerspective: 700 });
    };
    a.addEventListener('pointerenter', () => { if (!q) mk(); gsap.to(pic, { scale: 1.14, duration: 0.6, ease: 'power3.out' }); });
    a.addEventListener('pointermove', (e) => {
      if (!q || e.pointerType !== 'mouse') return;
      const r = frame.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
      q.rx(-py * 9); q.ry(px * 11); q.px(-px * r.width * 0.06); q.py(-py * r.height * 0.06);
      shine.style.setProperty('--sx', `${(px + 0.5) * 100}%`); shine.style.setProperty('--sy', `${(py + 0.5) * 100}%`);
    });
    a.addEventListener('pointerleave', () => { if (!q) return; q.rx(0); q.ry(0); q.px(0); q.py(0); gsap.to(pic, { scale: 1, duration: 0.6, ease: 'power3.out' }); });
  };

  /* ---------- click: shared-element into the player ---------- */
  const onPlay = (e, a, item, yt) => {
    if (!yt || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return; // TikTok / Instagram / list: new tab
    e.preventDefault();
    const frameEl = qs('.works__frame', a);
    const src = qs('img', a).currentSrc || thumb(item, 'm');
    if (!anim) { ctx.openVideo({ url: item.url, title: item.title, originEl: a, poster: src }); return; }
    let fly = null;
    const flyTo = (m, from, to, dur) => {
      if (!fly) {
        fly = document.createElement('div');
        fly.className = 'works__fly';
        fly.innerHTML = `<img alt="" src="${src}">`;
        m.root.appendChild(fly);
      }
      gsap.set(fly, { left: from.left, top: from.top, width: from.width, height: from.height, opacity: 1 });
      return gsap.to(fly, { left: to.left, top: to.top, width: to.width, height: to.height, duration: dur, ease: 'cut' });
    };
    ctx.openVideo({
      url: item.url, title: item.title, originEl: a, poster: src,
      onOpen: (m) => {
        const back = qs('.vmodal__backdrop', m.root);
        const chrome = [m.title, m.close, m.external].filter(Boolean);
        gsap.set(m.frame, { opacity: 0 });
        const to = m.frame.getBoundingClientRect();
        const from = frameEl.getBoundingClientRect();
        a.classList.add('is-lifted');
        gsap.timeline()
          .fromTo(back, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'none' }, 0)
          .add(flyTo(m, from, to, 0.62), 0)
          .fromTo(m.bars, { scaleY: 0 }, { scaleY: 1, duration: 0.32, ease: 'cut', transformOrigin: (i) => (i ? '50% 100%' : '50% 0%') }, 0.42)
          .fromTo(chrome, { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0.6)
          .set(m.frame, { opacity: 1 }, 0.62)
          .to(fly, { opacity: 0, duration: 0.25, ease: 'none', onComplete: () => { fly && fly.remove(); fly = null; } }, 0.9);
      },
      onClose: (m) => new Promise((resolve) => {
        const back = qs('.vmodal__backdrop', m.root);
        const chrome = [m.title, m.close, m.external].filter(Boolean);
        const from = m.frame.getBoundingClientRect();
        const to = frameEl.getBoundingClientRect();
        const onScreen = to.bottom > 0 && to.top < window.innerHeight && to.width > 0;
        gsap.set(m.frame, { opacity: 0 });
        const tl = gsap.timeline({
          onComplete: () => {
            fly && fly.remove(); fly = null;
            a.classList.remove('is-lifted');
            gsap.set([m.frame, back, ...m.bars, ...chrome], { clearProps: 'opacity,transform' });
            resolve();
          }
        });
        tl.to(m.bars, { scaleY: 0, duration: 0.25, ease: 'cut' }, 0)
          .to(chrome, { opacity: 0, duration: 0.15 }, 0)
          .to(back, { opacity: 0, duration: 0.4, ease: 'none' }, 0.1);
        if (onScreen) tl.add(flyTo(m, from, to, 0.5), 0.05);
      })
    });
  };

  /* ---------- layout: justified film rows ---------- */
  const metrics = () => {
    const W = sheet.clientWidth;
    const mob = ctx.isMobile();
    return { W, T: mob ? 196 : W < 1100 ? 230 : 290, gap: mob ? 8 : 14, cap: mob ? 60 : 64, gy: mob ? 20 : 28 };
  };
  const compute = (list) => {
    const { W, T, gap, cap, gy } = metrics();
    const rows = [];
    let row = [], sum = 0;
    const hOf = (r, s) => (W - gap * (r.length - 1)) / s;
    list.forEach((it) => {
      const ar = AR[it.aspect === 'short' ? 'short' : 'wide'];
      const next = [...row, it], ns = sum + ar;
      const h = hOf(next, ns);
      if (h <= T && row.length) {
        const hPrev = hOf(row, sum);
        if (Math.abs(hPrev - T) < Math.abs(h - T) && hPrev <= T * 1.35) { rows.push({ items: row, h: hPrev }); row = [it]; sum = ar; return; }
        rows.push({ items: next, h }); row = []; sum = 0; return;
      }
      row = next; sum = ns;
      if (h <= T) { rows.push({ items: row, h }); row = []; sum = 0; }
    });
    if (row.length) rows.push({ items: row, h: Math.min(T, hOf(row, sum)), last: true });
    const pos = new Map();
    let y = 0;
    const stripYs = [];
    rows.forEach((r, ri) => {
      let x = 0;
      r.items.forEach((it, ci) => {
        const w = AR[it.aspect === 'short' ? 'short' : 'wide'] * r.h;
        pos.set(it.id, { x, y, w, h: r.h, row: ri, col: ci });
        x += w + gap;
      });
      y += r.h + cap;
      if (ri < rows.length - 1) stripYs.push(y + (gy - 12) / 2);
      y += gy;
    });
    return { pos, height: Math.max(0, y - gy), stripYs, cap };
  };

  /* ---------- render ---------- */
  const apply = (el, p, cap) => { el.style.left = `${p.x}px`; el.style.top = `${p.y}px`; el.style.width = `${p.w}px`; el.style.setProperty('--fh', `${p.h}px`); el.style.height = `${p.h + cap}px`; };
  const setStrips = (ys) => {
    strips.forEach((s) => s.remove());
    strips = ys.map((y) => { const s = document.createElement('span'); s.className = 'works__strip'; s.setAttribute('aria-hidden', 'true'); s.style.top = `${y}px`; sheet.appendChild(s); return s; });
  };
  const refreshST = (() => { let t = 0; return () => { clearTimeout(t); t = setTimeout(() => ScrollTrigger && ScrollTrigger.refresh(), 120); }; })();

  const develop = (els) => {
    if (!anim) return;
    els.forEach((el) => el.classList.add('is-latent'));
    developIO && els.forEach((el) => developIO.observe(el));
  };
  const developIO = anim ? new IntersectionObserver((es) => {
    const hit = es.filter((e) => e.isIntersecting).map((e) => e.target);
    hit.sort((a, b) => (parseFloat(a.style.top) - parseFloat(b.style.top)) || (parseFloat(a.style.left) - parseFloat(b.style.left)));
    hit.forEach((el, i) => {
      developIO.unobserve(el);
      el.style.setProperty('--dev-delay', `${Math.min(i, 10) * 70}ms`);
      requestAnimationFrame(() => { el.classList.remove('is-latent'); el.classList.add('is-dev'); });
    });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;

  const render = (animate) => {
    const list = arrange(filteredWorks(filter)).slice(0, visible);
    const total = filteredWorks(filter).length;
    const ids = new Set(list.map((i) => i.id));
    const { pos, height, stripYs, cap } = compute(list);
    // leaving frames under-expose and drop out
    const leaving = [...cards.values()].filter((c) => !ids.has(c.item.id));
    leaving.forEach((c) => {
      cards.delete(c.item.id);
      if (animate && anim) gsap.to(c.el, { opacity: 0, scale: 0.9, filter: 'brightness(0)', duration: 0.22, ease: 'power2.in', onComplete: () => c.el.remove() });
      else c.el.remove();
    });
    const fresh = [];
    list.forEach((item, n) => {
      let c = cards.get(item.id);
      const p = pos.get(item.id);
      if (!c) {
        const el = build(item);
        c = { el, item };
        cards.set(item.id, c);
        apply(el, p, cap);
        sheet.appendChild(el);
        fresh.push(el);
      } else if (animate && anim) {
        const tgt = { left: p.x, top: p.y, width: p.w, height: p.h + cap, '--fh': `${p.h}px` };
        gsap.to(c.el, { ...tgt, duration: 0.7, ease: 'cut', delay: leaving.length ? 0.12 : 0, overwrite: 'auto' });
      } else {
        apply(c.el, p, cap);
      }
      qs('[data-edge]', c.el).textContent = `${String(n + 1).padStart(2, '0')}A`;
      // keep DOM order = reading order
      sheet.appendChild(c.el);
    });
    setStrips(stripYs);
    if (animate && anim) gsap.to(sheet, { height, duration: 0.7, ease: 'cut', onComplete: refreshST });
    else { sheet.style.height = `${height}px`; refreshST(); }
    if (fresh.length) {
      if (laidOut && animate && anim) {
        fresh.forEach((el) => el.classList.add('is-latent'));
        requestAnimationFrame(() => fresh.forEach((el, i) => {
          el.style.setProperty('--dev-delay', `${350 + Math.min(i, 12) * 45}ms`);
          el.classList.remove('is-latent'); el.classList.add('is-dev');
        }));
      } else develop(fresh);
    }
    if (more) {
      const has = total > visible;
      more.hidden = !has;
      more.style.display = has ? '' : 'none';
    }
    laidOut = true;
  };

  /* ---------- controls ---------- */
  if (filtersEl) {
    filtersEl.addEventListener('click', (e) => {
      const b = e.target.closest('[data-filter]');
      if (!b || b.dataset.filter === filter) return;
      filter = b.dataset.filter || 'all';
      visible = initialVisibleCount;
      qsa('[data-filter]', filtersEl).forEach((x) => { const on = x === b; x.classList.toggle('is-active', on); x.setAttribute('aria-pressed', String(on)); });
      render(true);
    });
  }
  if (more) more.addEventListener('click', () => { visible += loadMoreStep; render(true); });

  sheet.classList.add('is-sheet');
  render(false);
  let lastW = sheet.clientWidth;
  ctx.onResize(() => { if (sheet.clientWidth !== lastW) { lastW = sheet.clientWidth; render(false); } });
}
