/* ==========================================================================
   A4 PUBLISHED — render queue (publishedWorkIds / publishedWorkPriorityIds).
   Compact grid instead of 8,000px of stacked iframes. Each tile is a queued
   job: greyscale + checkerboard until "rendered" — hover / focus runs a
   scanline top→bottom with a live percentage, leaving the tile in colour
   (DONE). Touch devices process the queue automatically as it scrolls in.
   Media filter (YouTube / Instagram / TikTok) re-queues the visible jobs.
   YouTube: click = lite embed in place (youtube-nocookie). IG / TikTok: new tab.
   ========================================================================== */
import { qs, qsa } from '../core.js';

export function init(ctx) {
  const sec = qs('.q');
  if (!sec) return;
  const v = ctx.variant || window.DOGAZUKURI_VARIANT || {};
  const grid = qs('.q__grid', sec);

  // ---- variant filter + priority (same rules as the old ai-ad-media.js) ----
  const sel = (val) => (Array.isArray(val) ? new Set(val.map((x) => (typeof x === 'string' ? x : x && (x.id || x.key))).filter(Boolean)) : null);
  const ids = sel(v.publishedWorkIds);
  qsa('[data-published-work-id]', grid).forEach((it) => {
    if (!ids) it.hidden = false;
    else if (!ids.has(it.dataset.publishedWorkId)) it.remove();
    else it.hidden = false;
  });
  if (Array.isArray(v.publishedWorkPriorityIds)) {
    const all = qsa('[data-published-work-id]', grid);
    const byId = new Map(all.map((it) => [it.dataset.publishedWorkId, it]));
    const pri = v.publishedWorkPriorityIds.map((id) => byId.get(id)).filter(Boolean);
    [...pri, ...all.filter((it) => !pri.includes(it))].forEach((it) => grid.appendChild(it));
  }
  const items = qsa('.q__item', grid);

  // ---- in-place lite embed (YouTube only) ----
  items.forEach((it) => {
    const play = qs('.q__play', it);
    if (!play) return;
    play.addEventListener('click', () => {
      const thumb = qs('.q__thumb', it);
      const src = play.dataset.embed;
      if (!/^https:\/\/www\.youtube-nocookie\.com\/embed\/[\w-]{11}\?/.test(src)) return;
      const f = document.createElement('iframe');
      f.src = `${src}&autoplay=1`;
      f.title = play.dataset.title || '';
      f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      f.referrerPolicy = 'strict-origin-when-cross-origin';
      f.allowFullscreen = true;
      thumb.appendChild(f);
      play.remove();
      it.classList.add('is-playing');
      f.focus({ preventScroll: true });
    });
  });

  // ---- filters ----
  const filters = qs('.q__filters', sec);
  const counts = { all: items.length, youtube: 0, instagram: 0, tiktok: 0 };
  items.forEach((it) => { counts[it.dataset.media] = (counts[it.dataset.media] || 0) + 1; });
  qsa('[data-count]', filters).forEach((c) => { c.textContent = String(counts[c.dataset.count] || 0).padStart(2, '0'); });
  qsa('.q__f', filters).forEach((b) => { if (b.dataset.filter !== 'all' && !counts[b.dataset.filter]) b.hidden = true; });
  filters.hidden = false;

  if (ctx.reduced) {
    qsa('.q__f', filters).forEach((b) => b.addEventListener('click', () => applyFilter(b)));
    return;
  }

  // ---- render-queue state ----
  sec.classList.add('is-live');
  const jobs = items.map((it, i) => {
    const thumb = qs('.q__thumb', it);
    const color = document.createElement('div');
    color.className = 'q__color';
    color.setAttribute('aria-hidden', 'true');
    qsa('.q__img', thumb).forEach((im) => { const c = im.cloneNode(); c.loading = 'lazy'; color.appendChild(c); });
    thumb.insertBefore(color, qs('.q__play, .q__ext', thumb));
    const st = document.createElement('span');
    st.className = 'q__st';
    st.setAttribute('aria-hidden', 'true');
    st.innerHTML = `<b>#${String(i + 1).padStart(2, '0')}</b><span>QUEUED</span>`;
    thumb.appendChild(st);
    const scan = document.createElement('span');
    scan.className = 'q__scan';
    scan.setAttribute('aria-hidden', 'true');
    thumb.appendChild(scan);
    it.dataset.state = 'queued';
    return { it, thumb, st: st.lastChild, tween: null, p: 0 };
  });

  const render = (job, { dur = 0.9, delay = 0 } = {}) => {
    if (job.tween) job.tween.kill();
    const o = { p: job.it.dataset.state === 'done' ? 0 : job.p };
    const wasDone = job.it.dataset.state === 'done';
    job.tween = ctx.gsap.to(o, {
      p: 1, duration: dur, delay, ease: 'none',
      onStart: () => { job.it.classList.add('is-rendering'); },
      onUpdate: () => {
        // a finished job only re-scans (stays in colour); a queued one reveals as it renders
        if (!wasDone) { job.p = o.p; job.thumb.style.setProperty('--p', o.p.toFixed(3)); }
        else job.thumb.style.setProperty('--s', o.p.toFixed(3));
        job.thumb.querySelector('.q__scan').style.top = `${(o.p * 100).toFixed(1)}%`;
        job.st.textContent = `RENDER ${Math.round(o.p * 100).toString().padStart(3, ' ')}%`;
      },
      onComplete: () => {
        job.it.classList.remove('is-rendering');
        job.it.dataset.state = 'done';
        job.p = 1;
        job.thumb.style.setProperty('--p', '1');
        job.st.textContent = 'DONE';
      }
    });
  };

  if (ctx.isTouch) {
    // no hover: the queue processes itself as tiles come into view
    let chain = 0;
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        const job = jobs.find((j) => j.it === e.target);
        const now = performance.now() / 1000;
        chain = Math.max(chain, now);
        render(job, { dur: 0.6, delay: chain - now });
        chain += 0.16;
      });
    }, { threshold: 0.5 });
    jobs.forEach((j) => io.observe(j.it));
  } else {
    // the queue picks up its first jobs on its own once the grid is on screen; the rest render on hover
    const io = new IntersectionObserver((es) => {
      if (!es.some((e) => e.isIntersecting)) return;
      io.disconnect();
      jobs.slice(0, 6).forEach((job, k) => render(job, { dur: 0.7, delay: 0.25 + k * 0.32 }));
    }, { threshold: 0.25 });
    io.observe(grid);
    jobs.forEach((job) => {
      job.thumb.addEventListener('pointerenter', () => render(job));
      qsa('.q__play, .q__link', job.it).forEach((el) => el.addEventListener('focus', () => { if (job.it.dataset.state !== 'done') render(job); }));
    });
  }

  function applyFilter(btn) {
    const f = btn.dataset.filter;
    qsa('.q__f', filters).forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    const shown = [];
    items.forEach((it) => {
      const on = f === 'all' || it.dataset.media === f;
      it.hidden = !on;
      if (on) shown.push(it);
    });
    return shown;
  }
  qsa('.q__f', filters).forEach((b) => b.addEventListener('click', () => {
    const shown = applyFilter(b);
    // re-queue: the visible jobs render in order
    shown.slice(0, 18).forEach((it, k) => { const job = jobs.find((j) => j.it === it); render(job, { dur: 0.5, delay: k * 0.06 }); });
    ctx.ScrollTrigger && ctx.ScrollTrigger.refresh();
  }));
}
