/* ==========================================================================
   A6 FAQ — prompt / response chat (#faq). Questions become prompt chips;
   choosing one "sends" it and the answer streams in token by token.
   The full answer text is in the DOM from the start (not-yet-asked items are
   only visually clipped, like .sr-only), so screen readers and no-JS read all.
   ========================================================================== */
import { qs, qsa } from '../core.js';
import { splitChars } from './state.js';

export function init(ctx) {
  const sec = qs('.chat');
  if (!sec || ctx.reduced) return; // reduced: the static Q&A log is the layout
  const log = qs('.chat__log', sec);
  const chipsWrap = qs('.chat__chips', sec);
  const qas = qsa('.qa', sec);
  sec.classList.add('is-live');

  const parts = qas.map((qa) => {
    const a = qs('.qa__a', qa);
    const dots = document.createElement('span');
    dots.className = 'qa__dots';
    dots.setAttribute('aria-hidden', 'true');
    dots.innerHTML = '<i></i><i></i><i></i>';
    a.appendChild(dots);
    const chars = splitChars(a).filter((c) => !c.closest('.qa__dots'));
    qa.classList.add('is-pending');
    return { qa, a, chars, timer: 0 };
  });

  const chips = qas.map((qa, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chat__chip';
    b.textContent = qs('.qa__q', qa).textContent;
    b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', () => ask(i));
    chipsWrap.appendChild(b);
    return b;
  });
  chipsWrap.hidden = false;

  const cursor = document.createElement('span');
  cursor.className = 'qa__cur';
  cursor.setAttribute('aria-hidden', 'true');

  function ask(i) {
    const P = parts[i];
    clearTimeout(P.timer);
    chips[i].setAttribute('aria-pressed', 'true');
    log.appendChild(P.qa); // newest exchange goes to the bottom of the thread
    P.qa.classList.remove('is-pending');
    P.qa.classList.add('is-stream', 'is-think');
    P.chars.forEach((c) => c.classList.remove('is-on'));
    cursor.remove();
    const r = P.qa.getBoundingClientRect();
    if (r.bottom > innerHeight - 60 && ctx.lenis) ctx.lenis.scrollTo(P.qa, { offset: -innerHeight * 0.35, duration: 0.8 });
    let k = 0;
    const step = () => {
      // stream a few characters per tick, like tokens
      const n = 1 + ((Math.random() * 3) | 0);
      for (let j = 0; j < n && k < P.chars.length; j++, k++) P.chars[k].classList.add('is-on');
      if (k < P.chars.length) { P.chars[k - 1].after(cursor); P.timer = setTimeout(step, 38 + Math.random() * 40); }
      else { cursor.remove(); P.qa.classList.remove('is-stream'); }
    };
    P.timer = setTimeout(() => { P.qa.classList.remove('is-think'); step(); }, 520);
  }

  // the thread opens with the first question once the window is on screen
  const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); ask(0); } }, { threshold: 0.5 });
  io.observe(log);
}
