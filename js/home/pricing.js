/* ==========================================================================
   SEC 08 PRICING — posting calendar (owner: H2)
   One month as a calendar strip. Each post is a 9:16 "koma" on its day; each
   shoot day carries a REC tag. Choosing a plan (segmented control, or by
   hovering / clicking a plan column) re-schedules the koma with Flip.
   Plan columns get a cursor-following spotlight on their frame.
   All prices / plan text live in static HTML; the calendar is decoration
   (aria-hidden) that only restates 月4本 / 8本 / 15本 and 撮影回数.
   ========================================================================== */
import { qs, qsa } from '../core.js';

const DAYS = 30;
const DOW = ['月', '火', '水', '木', '金', '土', '日'];
const PLANS = {
  light: { name: 'ライト', posts: [0, 7, 14, 21], shoots: [0], label: '月4本（週1投稿）', shootLabel: '撮影 月1回' },
  standard: { name: 'スタンダード', posts: [0, 3, 7, 10, 14, 17, 21, 24], shoots: [0, 14], label: '月8本（週2投稿）', shootLabel: '撮影 月2回' },
  premium: { name: 'プレミアム', posts: Array.from({ length: 15 }, (_, i) => i * 2), shoots: [0, 10, 20], label: '月15本（ほぼ毎日ペース）', shootLabel: '撮影 月3回まで' }
};

export function init(ctx) {
  const { gsap, Flip, reduced } = ctx;
  const root = qs('#pricing');
  if (!root) return;
  const cal = qs('.pr__cal', root);
  const plansWrap = qs('.pr__plans', root);
  const planEls = qsa('.pr__plan', root);

  /* ---------- build the month ---------- */
  cal.innerHTML =
    '<div class="pr__calhead">' +
      '<div class="pr__calcount"><span class="t-num" data-pr-count>08</span><small><span data-pr-label></span><i data-pr-shoot></i></small></div>' +
      `<div class="pr__seg" role="group" aria-label="投稿カレンダーの表示プラン">${Object.entries(PLANS).map(([k, p]) => `<button type="button" data-plan="${k}" aria-pressed="false">${p.name}<small>月${p.posts.length}本</small></button>`).join('')}</div>` +
    '</div>' +
    `<div class="pr__month">${Array.from({ length: DAYS }, (_, d) => `<div class="pr__day${d % 7 >= 5 ? ' is-weekend' : ''}" data-d="${d}"><span class="pr__dow">${DOW[d % 7]}</span><span class="pr__date">${d + 1}</span><span class="pr__slot"></span></div>`).join('')}</div>` +
    '<p class="pr__legend"><span><i class="k"></i>投稿（ショート動画1本）</span><span><i class="r">REC</i>撮影日</span><span class="t-dim">※1か月の投稿ペースのイメージです</span></p>';
  cal.classList.add('is-built');
  cal.removeAttribute('aria-hidden');
  // the strip itself is decorative; the control row stays operable
  qs('.pr__month', cal).setAttribute('aria-hidden', 'true');
  qs('.pr__legend', cal).setAttribute('aria-hidden', 'true');
  qs('.pr__calcount', cal).setAttribute('aria-live', 'polite');

  const days = qsa('.pr__day', cal);
  const slots = days.map((d) => qs('.pr__slot', d));
  const segBtns = qsa('.pr__seg button', cal);
  const countEl = qs('[data-pr-count]', cal);
  const labelEl = qs('[data-pr-label]', cal);
  const shootEl = qs('[data-pr-shoot]', cal);

  const koma = Array.from({ length: 15 }, (_, i) => {
    const k = document.createElement('i');
    k.className = 'pr__koma';
    k.style.backgroundPosition = `${(i / 14) * 100}% 0`;
    k.dataset.flipId = `k${i}`;
    return k;
  });
  const recs = Array.from({ length: 3 }, (_, i) => {
    const r = document.createElement('b');
    r.className = 'pr__rec';
    r.textContent = 'REC';
    r.dataset.flipId = `r${i}`;
    return r;
  });

  let current = null;
  const place = (key) => {
    const p = PLANS[key];
    koma.forEach((k, i) => { if (i < p.posts.length) slots[p.posts[i]].appendChild(k); else k.remove(); });
    recs.forEach((r, i) => { if (i < p.shoots.length) days[p.shoots[i]].appendChild(r); else r.remove(); });
    days.forEach((d) => d.classList.toggle('has-rec', !!qs('.pr__rec', d)));
    countEl.textContent = String(p.posts.length).padStart(2, '0');
    labelEl.textContent = p.label;
    shootEl.textContent = p.shootLabel;
    segBtns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.plan === key)));
    planEls.forEach((el) => el.classList.toggle('is-selected', el.dataset.plan === key));
  };

  const select = (key, animate = true) => {
    if (key === current || !PLANS[key]) return;
    current = key;
    if (!animate || reduced || !Flip || !gsap) { place(key); return; }
    const state = Flip.getState([...koma, ...recs]);
    place(key);
    Flip.from(state, {
      duration: 0.62, ease: 'cut', absolute: true, stagger: 0.012, prune: true,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.2, rotate: -14 }, { opacity: 1, scale: 1, rotate: 0, duration: 0.42, ease: 'back.out(2)', stagger: 0.03, delay: 0.12 }),
      onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.2, rotate: 14, duration: 0.3, ease: 'power2.in' })
    });
    // count rolls like a frame counter
    const from = parseInt(countEl.textContent, 10) || 0;
    const o = { v: from };
    gsap.to(o, { v: PLANS[key].posts.length, duration: 0.5, ease: 'steps(6)', onUpdate: () => { countEl.textContent = String(Math.round(o.v)).padStart(2, '0'); } });
  };

  segBtns.forEach((b) => b.addEventListener('click', () => select(b.dataset.plan)));
  planEls.forEach((el) => {
    el.addEventListener('click', (e) => { if (!e.target.closest('a')) select(el.dataset.plan); });
    el.addEventListener('focusin', () => select(el.dataset.plan));
  });
  select('standard', false);

  if (reduced || !gsap) return;

  /* ---------- hover preview (fine pointer) + spotlight ---------- */
  if (!ctx.isTouch) {
    planEls.forEach((el) => el.addEventListener('pointerenter', () => select(el.dataset.plan)));
    plansWrap.addEventListener('pointermove', (e) => {
      planEls.forEach((el) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', `${e.clientX - r.left}px`);
        el.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
      plansWrap.classList.add('is-lit');
    }, { passive: true });
    plansWrap.addEventListener('pointerleave', () => plansWrap.classList.remove('is-lit'));
  }

  /* ---------- entrance: the month is turned over day by day, then the koma land ---------- */
  const month = qs('.pr__month', cal);
  gsap.set(days, { rotateX: -90, transformPerspective: 600, transformOrigin: '50% 0%', opacity: 0 });
  gsap.set([...koma, ...recs], { opacity: 0, y: -16 });
  const io = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    io.disconnect();
    ctx.ready.then(() => {
      const tl = gsap.timeline();
      tl.to(days, { rotateX: 0, opacity: 1, duration: 0.32, ease: 'power3.out', stagger: 0.018, clearProps: 'transform,opacity' });
      tl.to([...koma, ...recs].filter((k) => k.isConnected), { opacity: 1, y: 0, duration: 0.3, ease: 'back.out(2)', stagger: 0.04, clearProps: 'opacity,transform' }, '-=0.25');
      tl.add(() => gsap.set([...koma, ...recs], { clearProps: 'opacity,transform' }));
    });
  }, { threshold: 0.4 });
  io.observe(month);
}
