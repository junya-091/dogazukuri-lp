/* ==========================================================================
   A7 CONTACT — prompt-bar CTA (#contact). The mailto button is drawn as a
   prompt field whose example text keeps typing / clearing general request
   examples (labelled 例, aria-hidden; the link's name stays 「メールで相談する」).
   Runs only while on screen; reduced motion keeps the first example static.
   ========================================================================== */
import { qs } from '../core.js';

const EXAMPLES = [
  '新商品の魅力を、短い縦型動画で伝えたい',
  '店舗の雰囲気が伝わる広告動画をつくりたい',
  'キャラクターを使って、SNSで継続発信したい',
  '撮影が難しい世界観を、映像で表現したい',
  'ひとつの素材を、複数の媒体向けに展開したい'
];

export function init(ctx) {
  const sec = qs('.cta');
  const out = sec && qs('[data-cta-typed]', sec);
  if (!out || ctx.reduced) return;
  let i = 0, n = Array.from(EXAMPLES[0]).length, mode = 'hold', wait = 1400, acc = 0;
  ctx.loop(sec, (t, dt) => {
    acc += dt;
    if (acc < wait) return;
    acc = 0;
    const chars = Array.from(EXAMPLES[i]);
    if (mode === 'hold') { mode = 'erase'; wait = 22; }
    else if (mode === 'erase') {
      n -= 1;
      if (n <= 0) { n = 0; i = (i + 1) % EXAMPLES.length; mode = 'type'; wait = 260; }
    } else if (mode === 'type') {
      n += 1;
      wait = 48 + Math.random() * 50;
      if (n >= chars.length) { n = chars.length; mode = 'hold'; wait = 1800; }
    }
    out.textContent = Array.from(EXAMPLES[i]).slice(0, n).join('');
  });
}
