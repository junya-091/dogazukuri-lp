/* ==========================================================================
   A2 CAPABILITIES — latent-space morph.
   One stage, three images (商品・店舗PR / キャラクター広告 / 世界観・ストーリー)
   interpolated through a shared noise flow field: each image is displaced
   along the field while a second noise field dissolves one into the next,
   with a magenta→blue front. Desktop: pinned, scroll = travel through the
   latent space (with plateaus on each anchor). Tabs (the item rows) jump.
   Big label decodes from glyph noise (scramble). A mini latent map plots the
   current position between the three anchors.
   ========================================================================== */
import { qs, qsa, clamp, lerp } from '../core.js';
import { GLSL_LIB, createGL, makeTexture, uploadTexture, loadImage, fitCanvas } from './gl.js';
import { getSeed } from './state.js';

const FRAG = `#version 300 es
precision highp float;
in vec2 vUv; out vec4 o;
uniform sampler2D uA, uB;
uniform vec2 uRes, uImgA, uImgB, uFocA, uFocB;
uniform float uT, uTime, uSeed;
${GLSL_LIB}
void main(){
  vec2 uv = vUv;
  vec2 asp = vec2(uRes.x / uRes.y, 1.);
  float w = sin(3.14159265 * uT);
  vec2 q = uv * asp * 2.1 + uSeed;
  vec2 flow = vec2(fbm(q + uTime * .04), fbm(q + 5.2 - uTime * .03)) - .5;
  vec2 br = flow * .012;
  vec2 dA = flow * .42 * w * (.4 + uT);
  vec2 dB = -flow * .42 * w * (1.4 - uT);
  float lod = w * 3.2;
  vec2 ua = coverUv(uv + dA + br, uRes, uImgA, uFocA); ua.y = 1. - ua.y;
  vec2 ub = coverUv(uv + dB + br, uRes, uImgB, uFocB); ub.y = 1. - ub.y;
  vec2 ca = flow * .03 * w;
  vec3 a = vec3(textureLod(uA, ua + ca, lod).r, textureLod(uA, ua, lod).g, textureLod(uA, ua - ca, lod).b);
  vec3 b = vec3(textureLod(uB, ub - ca, lod).r, textureLod(uB, ub, lod).g, textureLod(uB, ub + ca, lod).b);
  float m = fbm(uv * asp * 1.7 + 17. + uSeed * .5);
  float t = uT * 1.5 - .25;
  float e = smoothstep(t - .1, t + .1, m);
  vec3 col = mix(b, a, e);
  float edge = (1. - abs(e * 2. - 1.)) * smoothstep(0., .15, w);
  col += edge * mix(vec3(1., .24, .74), vec3(.17, .36, 1.), clamp(uv.x + flow.x, 0., 1.)) * 1.1;
  float v = smoothstep(1.3, .25, length((uv - .5) * vec2(1., 1.1)));
  col *= mix(.68, 1., v);
  o = vec4(col, 1.);
}`;

const GLYPHS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ01<>/#%*+=';
function scramble(el, text, dur = 560) {
  if (el._scr) clearInterval(el._scr);
  const chars = Array.from(text);
  const at = chars.map((_, i) => (i / chars.length) * dur * 0.7 + Math.random() * dur * 0.3);
  const t0 = performance.now();
  el._scr = setInterval(() => {
    const t = performance.now() - t0;
    let html = '';
    let done = true;
    chars.forEach((c, i) => {
      if (t >= at[i]) html += c;
      else { done = false; html += `<span class="sx">${GLYPHS[(Math.random() * GLYPHS.length) | 0]}</span>`; }
    });
    el.innerHTML = html;
    if (done) { clearInterval(el._scr); el._scr = 0; }
  }, 34);
}

export function init(ctx) {
  const sec = qs('.lat');
  if (!sec || ctx.reduced) return;
  const stage = qs('.lat__stage', sec);
  const canvas = qs('.lat__canvas', sec);
  const items = qsa('.lat__item', sec);
  const label = qs('.lat__scramble', sec);
  const zEl = qs('.lat__z', sec);
  const map = qs('.lat__map', sec);

  let G = null;
  try { G = createGL(canvas, FRAG, ['uA', 'uB', 'uRes', 'uImgA', 'uImgB', 'uFocA', 'uFocB', 'uT', 'uTime', 'uSeed']); } catch (e) { console.warn('[ai latent] webgl', e.message); }
  if (!G) return; // stays as the static three-image list
  sec.classList.add('is-live');

  // ---- items become tabs ----
  const names = items.map((it) => qs('.lat__name', it).textContent.trim());
  const hits = items.map((it, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'lat__hit';
    b.setAttribute('aria-label', `${names[i]}の表現を表示`);
    b.setAttribute('aria-pressed', 'false');
    it.appendChild(b);
    const meter = document.createElement('span');
    meter.className = 'lat__meter';
    meter.setAttribute('aria-hidden', 'true');
    meter.innerHTML = '<i></i>';
    it.appendChild(meter);
    return b;
  });
  const meters = items.map((it) => qs('.lat__meter', it));

  // ---- latent map ----
  const NS = 'http://www.w3.org/2000/svg';
  const A = [[20, 94], [60, 24], [100, 92]];
  const path = qs('.lat__path', map);
  path.setAttribute('d', `M${A[0]} Q 26 34 ${A[1]} Q 98 30 ${A[2]}`);
  const seg1 = document.createElementNS(NS, 'path');
  seg1.setAttribute('d', `M${A[0]} Q 26 34 ${A[1]}`);
  const L1 = seg1.getTotalLength();
  const L = path.getTotalLength();
  const anchors = A.map(([x, y], i) => {
    const g = qs('.lat__anchors', map);
    const c = document.createElementNS(NS, 'circle');
    c.setAttribute('cx', x); c.setAttribute('cy', y); c.setAttribute('r', 4);
    const t = document.createElementNS(NS, 'text');
    t.setAttribute('x', x + (i === 2 ? -16 : 7)); t.setAttribute('y', y + (i === 1 ? -6 : 14));
    t.textContent = `0${i + 1}`;
    g.appendChild(c); g.appendChild(t);
    return c;
  });
  const dot = qs('.lat__dot', map);

  // ---- textures ----
  const { gl, U } = G;
  const imgs = items.map((it) => qs('.lat__img', it));
  const srcs = imgs.map((im) => im.getAttribute('src'));
  const sizes = imgs.map((im) => [+im.getAttribute('width') || 16, +im.getAttribute('height') || 9]);
  const focus = [[0.5, 0.5], [0.5, 0.84], [0.5, 0.5]];
  const tex = srcs.map((_, i) => makeTexture(gl, i));
  let loaded = 0;
  const S = { p: 0, target: 0, active: -1, dirty: true, t: 0 };
  const load = () => {
    if (load.done) return;
    load.done = true;
    srcs.forEach((src, i) => loadImage(src).then((im) => {
      uploadTexture(gl, i, tex[i], im);
      sizes[i] = [im.naturalWidth, im.naturalHeight];
      loaded++; S.dirty = true;
    }).catch(() => {}));
  };
  const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { load(); io.disconnect(); } }, { rootMargin: '600px 0px' });
  io.observe(sec);

  const seedF = (getSeed() % 997) * 0.013;
  const render = (time) => {
    if (fitCanvas(canvas, Math.min(devicePixelRatio || 1, 1.5) * 0.8)) gl.viewport(0, 0, canvas.width, canvas.height);
    const i = Math.min(1, Math.floor(S.p));
    const t = clamp(S.p - i, 0, 1);
    gl.uniform1i(U.uA, i); gl.uniform1i(U.uB, i + 1);
    gl.uniform2f(U.uRes, canvas.width, canvas.height);
    gl.uniform2f(U.uImgA, sizes[i][0], sizes[i][1]);
    gl.uniform2f(U.uImgB, sizes[i + 1][0], sizes[i + 1][1]);
    gl.uniform2f(U.uFocA, focus[i][0], focus[i][1]);
    gl.uniform2f(U.uFocB, focus[i + 1][0], focus[i + 1][1]);
    gl.uniform1f(U.uT, t);
    gl.uniform1f(U.uTime, time / 1000);
    gl.uniform1f(U.uSeed, seedF);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  const fmt = (n) => (n >= 0 ? '+' : '−') + Math.abs(n).toFixed(3);
  const hud = () => {
    const z = [0, 1, 2, 3].map((k) => Math.sin(S.p * (1.7 + k * 0.9) + k * 2.1 + seedF) * (1.2 - k * 0.2));
    zEl.textContent = `LATENT  z(t)\n[${z.map(fmt).join(' ')}]\nINTERP  t = ${S.p.toFixed(2)}`;
    const len = S.p <= 1 ? S.p * L1 : L1 + (S.p - 1) * (L - L1);
    const pt = path.getPointAtLength(len);
    dot.setAttribute('cx', pt.x.toFixed(2)); dot.setAttribute('cy', pt.y.toFixed(2));
    meters.forEach((m, i) => m.style.setProperty('--w', Math.max(0, 1 - Math.abs(S.p - i)).toFixed(3)));
    const a = Math.round(S.p);
    if (a !== S.active) {
      S.active = a;
      items.forEach((it, i) => it.classList.toggle('is-on', i === a));
      hits.forEach((b, i) => b.setAttribute('aria-pressed', String(i === a)));
      anchors.forEach((c, i) => c.classList.toggle('is-on', i === a));
      scramble(label, names[a]);
    }
  };
  hud();

  ctx.loop(stage, (time) => {
    const prev = S.p;
    S.p = Math.abs(S.target - S.p) < 0.0008 ? S.target : lerp(S.p, S.target, 0.085);
    if (S.p !== prev || S.dirty || loaded) { hud(); S.dirty = false; }
    if (loaded) render(time); // continuous: the latent field breathes while in view
  });

  // ---- drive: pinned scroll on desktop, tabs everywhere ----
  let st = null;
  const shape = (r) => { const s = Math.min(1, Math.floor(r)); const f = r - s; return Math.min(2, s + (f <= 0.22 ? 0 : f >= 0.78 ? 1 : (f - 0.22) / 0.56)); };
  const mm = ctx.gsap.matchMedia();
  mm.add('(min-width: 1024px)', () => {
    st = ctx.ScrollTrigger.create({
      trigger: sec, start: 'top top', end: () => `+=${Math.round(innerHeight * 0.9)}`,
      pin: true, scrub: true, invalidateOnRefresh: true, anticipatePin: 1,
      onUpdate: (self) => { S.target = shape(self.progress * 2); }
    });
    return () => { st = null; };
  });
  // without the pin (mobile / tablet) the stage walks the latent space by itself while on screen,
  // until the visitor picks an item
  let auto = true, autoAcc = 0;
  ctx.loop(stage, (t, dt) => {
    if (st || !auto) return;
    autoAcc += dt;
    if (autoAcc > 3400) { autoAcc = 0; S.target = (Math.round(S.target) + 1) % 3; }
  });
  hits.forEach((b, i) => b.addEventListener('click', () => {
    auto = false;
    if (st) {
      const y = st.start + (st.end - st.start) * (i / 2);
      ctx.scrollToY(Math.round(y), { duration: 1 + Math.abs(i - S.p) * 0.4 });
    } else {
      S.target = i;
    }
  }));
}
