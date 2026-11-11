/* Shared generation state for the AI page: the current seed + an intro gate. */
const subs = new Set();
let seed = (Math.random() * 4294967296) >>> 0;

export const getSeed = () => seed;
/** New seed (or a given one); notifies subscribers (hero, HUD). */
export function setSeed(next) {
  seed = (next === undefined ? (Math.random() * 4294967296) : next) >>> 0;
  subs.forEach((fn) => { try { fn(seed); } catch (e) { console.warn(e); } });
  return seed;
}
export function onSeed(fn) { subs.add(fn); return () => subs.delete(fn); }
export const fmtSeed = (s) => String(s >>> 0).padStart(10, '0');

/** deterministic PRNG (mulberry32) */
export function rng(s) {
  let a = s >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

let resolveIntro;
/** resolves when the A0 seed-noise intro has finished (or was skipped). */
export const introDone = new Promise((r) => { resolveIntro = r; });
export const finishIntro = () => resolveIntro();

/** Wrap every character of the text nodes inside `el` in <span class="ch">, keeping element structure. */
export function splitChars(el) {
  const out = [];
  const walk = (node) => {
    Array.from(node.childNodes).forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        for (const c of Array.from(n.textContent)) {
          const s = document.createElement('span');
          s.className = 'ch';
          s.textContent = c;
          frag.appendChild(s);
          out.push(s);
        }
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && n.tagName !== 'WBR' && n.tagName !== 'BR') walk(n);
    });
  };
  walk(el);
  return out;
}
