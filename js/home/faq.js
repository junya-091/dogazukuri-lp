/* ==========================================================================
   SEC 12 FAQ — SRT subtitle cues (owner: H2)
   Each <details> becomes a cue row: index, "start --> end" timecode, text.
   Cue timing is derived from the answer length (≈8 chars / s, like a real
   subtitle file). Opening a cue highlights it like the selected line of a
   subtitle editor and the answer rolls open. ↑/↓ move between cues.
   Reduced motion: same rows, instant open. No JS: plain <details>.
   ========================================================================== */
import { qs, qsa } from '../core.js';

const srtTime = (ms) => {
  const p = (n, l = 2) => String(Math.floor(n)).padStart(l, '0');
  return `${p(ms / 3600000)}:${p((ms / 60000) % 60)}:${p((ms / 1000) % 60)},${p(ms % 1000, 3)}`;
};

export function init(ctx) {
  const { gsap, reduced } = ctx;
  const root = qs('#faq');
  if (!root) return;
  const cues = qsa('.srt__cue', root);
  const list = qs('.srt', root);
  if (list) list.classList.add('is-built');
  let t = 1000;
  cues.forEach((d, i) => {
    const sum = qs('summary', d);
    const ans = qs(':scope > p', d);
    const len = ans.textContent.trim().length;
    const dur = Math.round((len / 8) * 1000 / 10) * 10;
    const start = t, end = t + dur;
    t = end + 400;
    const q = document.createElement('span');
    q.className = 'srt__q';
    while (sum.firstChild) q.appendChild(sum.firstChild);
    sum.innerHTML = `<span class="srt__idx" aria-hidden="true">${i + 1}</span><span class="srt__tcs" aria-hidden="true">${srtTime(start)} <i>--&gt;</i> ${srtTime(end)}</span>`;
    sum.appendChild(q);
    const tog = document.createElement('span');
    tog.className = 'srt__tog';
    tog.setAttribute('aria-hidden', 'true');
    sum.appendChild(tog);
    ans.dataset.meta = `TEXT ▸ ${len}字 · ${(len / (dur / 1000)).toFixed(1)} CPS`;

    // arrow keys between cues
    sum.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      const n = cues[i + (e.key === 'ArrowDown' ? 1 : -1)];
      if (n) { e.preventDefault(); qs('summary', n).focus(); }
    });

    if (reduced || !gsap) return;
    // animated open / close that keeps native <details> semantics
    let anim = null;
    sum.addEventListener('click', (e) => {
      e.preventDefault();
      if (anim) anim.kill();
      if (!d.open) {
        d.open = true;
        anim = gsap.fromTo(ans, { height: 0, paddingBottom: 0, opacity: 0 }, { height: 'auto', paddingBottom: '', opacity: 1, duration: 0.38, ease: 'cut', clearProps: 'height,paddingBottom,opacity' });
        gsap.fromTo(ans, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 0.5, ease: 'steps(10)', clearProps: 'clipPath' });
      } else {
        anim = gsap.to(ans, { height: 0, paddingBottom: 0, opacity: 0, duration: 0.26, ease: 'cut', onComplete: () => { d.open = false; gsap.set(ans, { clearProps: 'height,paddingBottom,opacity' }); } });
      }
    });
  });
}
