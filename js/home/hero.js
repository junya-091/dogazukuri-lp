/* ==========================================================================
   SEC 01 HERO — scroll-scrubbed image sequence + WebGL RGB-shift / liquid
   displacement, viewfinder HUD, telop cut-ins, and the "drop into the
   timeline clip" exit. (owner: F)
   ========================================================================== */
import { timecode, clamp, lerp, qs, qsa } from '../core.js';

const FRAMES = 90;
const SRC_DURATION = 5.1667; // seconds of hero-motion-web.mp4
const SCRUB_END = 0.76; // portion of the pin used for the frame scrub
const frameUrl = (set, i) => `assets/hero/seq/${set}/${String(i + 1).padStart(3, '0')}.webp`;

/* ---------- frame store ---------- */
function createStore(set) {
  const frames = new Array(FRAMES).fill(null);
  const pending = new Map();
  const decode = async (i) => {
    if (frames[i] || pending.has(i)) return pending.get(i);
    const p = (async () => {
      const url = frameUrl(set, i);
      if ('createImageBitmap' in window) {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`frame ${i} ${res.status}`);
        const blob = await res.blob();
        frames[i] = await createImageBitmap(blob);
      } else {
        const img = new Image();
        img.src = url;
        await img.decode();
        frames[i] = img;
      }
      return frames[i];
    })().catch(() => null).finally(() => pending.delete(i));
    pending.set(i, p);
    return p;
  };
  const queue = async (indices, concurrency = 6) => {
    let k = 0;
    const worker = async () => { while (k < indices.length) { const i = indices[k++]; await decode(i); } };
    await Promise.all(Array.from({ length: concurrency }, worker));
  };
  /** nearest decoded frame to i (searching backwards first so motion never jumps ahead) */
  const nearest = (i) => {
    if (frames[i]) return i;
    for (let d = 1; d < FRAMES; d++) {
      if (i - d >= 0 && frames[i - d]) return i - d;
      if (i + d < FRAMES && frames[i + d]) return i + d;
    }
    return -1;
  };
  return { frames, decode, queue, nearest };
}

/* ---------- renderers ---------- */
const VERT = `#version 300 es
in vec2 position; out vec2 vUv;
void main(){ vUv = position * .5 + .5; gl_Position = vec4(position, 0., 1.); }`;

const FRAG = `#version 300 es
precision highp float;
in vec2 vUv; out vec4 o;
uniform sampler2D uA, uB;
uniform float uMix, uTime, uAmt, uScrollVel;
uniform vec2 uRes, uImg, uFocus, uMouse, uVel;
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f);
  return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
vec2 cover(vec2 uv){
  float rs = uRes.x / uRes.y, ri = uImg.x / uImg.y;
  vec2 s = rs > ri ? vec2(1., ri / rs) : vec2(rs / ri, 1.);
  return uv * s + (1. - s) * uFocus;
}
vec3 samp(vec2 uv){ uv.y = 1. - uv.y; return mix(texture(uA, uv).rgb, texture(uB, uv).rgb, uMix); }
void main(){
  vec2 uv = vUv;
  vec2 asp = vec2(uRes.x / uRes.y, 1.);
  vec2 d = (uv - uMouse) * asp;
  float fall = exp(-dot(d, d) * 9.);
  float sp = clamp(length(uVel) * 6., 0., 1.);
  // liquid displacement: curl-ish noise around the pointer, scaled by pointer speed
  vec2 q = uv * 5. + uTime * .15;
  vec2 nz = vec2(n(q), n(q + 7.3)) - .5;
  vec2 off = (nz * .07 + uVel * .35) * fall * (.25 + sp) * uAmt;
  // RGB split along motion (pointer) + vertical scroll speed
  vec2 dir = uVel * fall * 1.2 * uAmt + vec2(0., uScrollVel * .00022);
  vec2 base = cover(uv + off);
  vec3 c;
  c.r = samp(cover(uv + off + dir)).r;
  c.g = samp(base).g;
  c.b = samp(cover(uv + off - dir)).b;
  // gentle optical vignette
  float v = smoothstep(1.25, .35, length((uv - .5) * vec2(1.05, 1.2)));
  c *= mix(.72, 1., v);
  o = vec4(c, 1.);
}`;

function createGL(canvas) {
  const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, premultipliedAlpha: false, powerPreference: 'high-performance' });
  if (!gl) return null;
  const sh = (type, src) => {
    const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  };
  const prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'position');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = {};
  ['uA', 'uB', 'uMix', 'uTime', 'uAmt', 'uScrollVel', 'uRes', 'uImg', 'uFocus', 'uMouse', 'uVel'].forEach((n) => { U[n] = gl.getUniformLocation(prog, n); });
  const mkTex = (unit) => {
    const t = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([2, 4, 11, 255]));
    return t;
  };
  const tex = [mkTex(0), mkTex(1)];
  gl.uniform1i(U.uA, 0); gl.uniform1i(U.uB, 1);
  const slot = [-1, -1];
    const upload = (unit, bmp, idx) => {
    if (slot[unit] === idx) return;
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, tex[unit]);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bmp);
    slot[unit] = idx;
  };
  return {
    kind: 'gl',
    draw({ a, b, ia, ib, mix, w, h, img, focus, mouse, vel, time, amt, scrollVel }) {
      if (a) {
        // keep the slot holding `ia`; reuse the other slot for `ib`
        if (slot[1] === ia && slot[0] !== ib) { upload(1, a, ia); upload(0, b || a, ib); gl.uniform1i(U.uA, 1); gl.uniform1i(U.uB, 0); }
        else { upload(0, a, ia); upload(1, b || a, ib); gl.uniform1i(U.uA, 0); gl.uniform1i(U.uB, 1); }
      }
      gl.viewport(0, 0, w, h);
      gl.uniform1f(U.uMix, mix);
      gl.uniform1f(U.uTime, time);
      gl.uniform1f(U.uAmt, amt);
      gl.uniform1f(U.uScrollVel, scrollVel);
      gl.uniform2f(U.uRes, w, h);
      gl.uniform2f(U.uImg, img[0], img[1]);
      gl.uniform2f(U.uFocus, focus[0], focus[1]);
      gl.uniform2f(U.uMouse, mouse[0], mouse[1]);
      gl.uniform2f(U.uVel, vel[0], vel[1]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
  };
}

function create2D(canvas) {
  const c = canvas.getContext('2d', { alpha: false });
  return {
    kind: '2d',
    draw({ a, w, h, img, focus }) {
      if (!a) return;
      const s = Math.max(w / img[0], h / img[1]);
      const dw = img[0] * s, dh = img[1] * s;
      c.drawImage(a, (w - dw) * focus[0], (h - dh) * (1 - focus[1]), dw, dh);
    }
  };
}

/* ---------- module ---------- */
export function init(ctx) {
  const { gsap, ScrollTrigger, reduced, hud, registerLoad, ready, cutIn } = ctx;
  const section = qs('#top.hero');
  if (!section) return;
  const frameEl = qs('.hero__frame', section);
  const canvas = qs('.hero__canvas', section);
  const tcEl = qs('[data-hero-tc]', section);
  const fEl = qs('[data-hero-f]', section);
  const copy = qs('.hero__copy', section);
  const telops = qsa('[data-telop]', section);
  const proofs = qsa('[data-telop-proof]', section);
  const failsafe = () => section.classList.add('is-live');

  if (reduced || !gsap) { failsafe(); return; }

  const mobile = window.matchMedia('(max-width: 767px)').matches;
  const set = mobile ? 'm' : 'd';
  const imgSize = mobile ? [720, 960] : [1440, 810];
  const focus = mobile ? [0.5, 0.5] : [0.62, 0.5];
  const store = createStore(set);

  // ---- loading: first frame for the leader, a coarse pass, then everything ----
  const first = store.decode(0);
  const last = store.decode(FRAMES - 1);
  registerLoad(first);
  const coarse = [];
  for (let i = 8; i < FRAMES - 1; i += 8) coarse.push(i);
  const coarseDone = store.queue(coarse, 4);
  registerLoad(Promise.race([coarseDone, new Promise((r) => setTimeout(r, 1200))]));
  coarseDone.then(() => {
    const rest = [];
    for (let i = 1; i < FRAMES - 1; i++) if (!coarse.includes(i)) rest.push(i);
    const go = () => store.queue(rest, 4);
    'requestIdleCallback' in window ? requestIdleCallback(go, { timeout: 800 }) : setTimeout(go, 200);
  });

  // ---- renderer ----
  let r = null;
  try { r = mobile ? create2D(canvas) : (createGL(canvas) || create2D(canvas)); }
  catch (e) { console.warn('[hero] WebGL unavailable, using 2D', e.message); try { r = create2D(canvas); } catch (_) { r = null; } }
  if (!r) { section.classList.add('no-canvas'); failsafe(); return; }

  let W = 0, H = 0;
  const size = () => {
    const rect = frameEl.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, r.kind === 'gl' ? 1.5 : 2);
    W = Math.max(2, Math.round(rect.width * dpr));
    H = Math.max(2, Math.round(rect.height * dpr));
    if (canvas.width !== W || canvas.height !== H) { canvas.width = W; canvas.height = H; }
    dirty = true;
  };

  // ---- state ----
  let target = 0, shown = 0, dirty = true;
  const mouse = [0.7, 0.4], vel = [0, 0];
  let lastPX = null, lastPY = null, scrollVel = 0, amt = mobile ? 0 : 1;
  let lastIdx = -1;

  const render = (t) => {
    shown = lerp(shown, target, 0.35);
    if (Math.abs(shown - target) < 0.01) shown = target;
    const f = clamp(shown, 0, FRAMES - 1);
    const i0 = Math.floor(f);
    const ia = store.nearest(i0);
    if (ia < 0) return;
    const ib = store.frames[Math.min(FRAMES - 1, i0 + 1)] ? Math.min(FRAMES - 1, i0 + 1) : ia;
    const mix = ia === i0 && ib !== ia ? f - i0 : 0;
    vel[0] *= 0.9; vel[1] *= 0.9;
    const lv = ctx.lenis ? ctx.lenis.velocity : 0;
    scrollVel = lerp(scrollVel, clamp(lv, -40, 40), 0.2);
    const moving = Math.abs(vel[0]) + Math.abs(vel[1]) > 0.0004 || Math.abs(scrollVel) > 0.05;
    if (!dirty && !moving && f === lastIdx && r.kind === 'gl') return;
    if (!dirty && f === lastIdx && r.kind === '2d') return;
    dirty = false; lastIdx = f;
    r.draw({ a: store.frames[ia], b: store.frames[ib], ia, ib, mix, w: W, h: H, img: imgSize, focus, mouse, vel, time: t / 1000, amt, scrollVel });
    const idx = Math.round(f);
    if (tcEl) tcEl.textContent = timecode((idx / (FRAMES - 1)) * SRC_DURATION * 24);
    if (fEl) fEl.textContent = `F${String(idx + 1).padStart(3, '0')}/${FRAMES}`;
  };
  const rl = ctx.loop(section, render);
  first.then(() => { dirty = true; rl.start(); });
  store.frames && setInterval(() => { dirty = true; }, 500); // pick up frames that finish decoding while idle

  if (!mobile) {
    frameEl.addEventListener('pointermove', (e) => {
      const rect = frameEl.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width, y = 1 - (e.clientY - rect.top) / rect.height;
      if (lastPX !== null) { vel[0] = lerp(vel[0], x - lastPX, 0.5); vel[1] = lerp(vel[1], y - lastPY, 0.5); }
      lastPX = x; lastPY = y; mouse[0] = x; mouse[1] = y;
    }, { passive: true });
    frameEl.addEventListener('pointerleave', () => { lastPX = lastPY = null; });
  }
  size();
  ctx.onResize(size);

  // ---- telops: hidden until cut in ----
  section.classList.add('is-live'); // drop the CSS pre-hide first so GSAP doesn't parse it into `y`
  gsap.set([...telops, ...proofs].map((l) => l.firstElementChild), { y: 0, yPercent: 105 });

  const intro = () => {
    const tl = gsap.timeline();
    tl.add(cutIn(telops, { frames: 3, stagger: 0.11 }));
    return tl;
  };

  if (mobile) {
    // no pin on phones: the clip plays once, proof telops land on its beats.
    ready.then(() => {
      intro();
      const beats = [0.3, 0.45, 0.6, 0.75];
      const state = { f: 0 };
      first.then(() => gsap.to(state, {
        f: FRAMES - 1, duration: SRC_DURATION, ease: 'none', delay: 0.2,
        onUpdate: () => {
          target = state.f;
          const p = state.f / (FRAMES - 1);
          proofs.forEach((el, i) => { if (p >= beats[i] && !el.dataset.in) { el.dataset.in = '1'; cutIn([el], { frames: 3 }); } });
        }
      }));
    });
    return;
  }

  // ---- desktop / tablet: pinned scrub ----
  ready.then(intro);
  const beats = [0.14, 0.28, 0.42, 0.56]; // proof telops as lower-thirds on the scrub
  const proofIn = proofs.map(() => false);
  let copyOut = false;
  let landing = null; // cached geometry for the drop
  const geo = () => {
    const vw = window.innerWidth, vh = window.innerHeight;
    const rect = hud.clipRect(section);
    const tr = rect || { left: vw / 2 - 40, top: vh - 30, width: 80, height: 22 };
    // stage 1 parks the shot as a thumbnail on the right (clear of the copy), stage 2 drops it into its clip
    const w1 = Math.min(420, vw * 0.3), h1 = (w1 * vh) / vw;
    const x1 = vw - w1 - Math.max(24, vw * 0.06);
    const y1 = vh * 0.48 - h1 / 2;
    landing = { vw, vh, tr, w1, h1, x1, y1 };
  };
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const setDrop = (p) => {
    // p: 0..1 across the drop portion
    if (!landing) geo();
    const { vw, vh, tr, w1, h1, x1, y1 } = landing;
    let x, y, sx, sy, o = 1;
    if (p <= 0) { x = 0; y = 0; sx = 1; sy = 1; }
    else if (p < 0.62) { // stage 1: shot shrinks to a thumbnail above its clip
      const t = ease(p / 0.62);
      x = lerp(0, x1, t); y = lerp(0, y1, t); sx = sy = lerp(1, w1 / vw, t);
    } else { // stage 2: thumbnail drops and squashes into the clip
      const t = Math.pow((p - 0.62) / 0.38, 2.2);
      x = lerp(x1, tr.left, t); y = lerp(y1, tr.top, t);
      sx = lerp(w1 / vw, tr.width / vw, t); sy = lerp(h1 / vh, tr.height / vh, t);
      if (p > 0.985) o = 0;
    }
    gsap.set(frameEl, { x, y, scaleX: sx, scaleY: sy, opacity: o });
    frameEl.classList.toggle('is-dropping', p > 0);
    const clip = hud.clipEl(section);
    if (clip) clip.classList.toggle('is-landed', p > 0.97);
  };

  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: () => `+=${Math.round(window.innerHeight * 1.8)}`,
    pin: true,
    pinSpacing: true,
    anticipatePin: 1,
    invalidateOnRefresh: true,
    onRefresh: () => { landing = null; },
    onUpdate: (self) => {
      const p = self.progress;
      target = clamp(p / SCRUB_END, 0, 1) * (FRAMES - 1);
      beats.forEach((b, i) => {
        const on = p >= b;
        if (on !== proofIn[i]) {
          proofIn[i] = on;
          gsap.to(proofs[i].firstElementChild, { yPercent: on ? 0 : 105, duration: 3 / 24, ease: 'steps(3)', overwrite: true });
        }
      });
      // the picture leaves, the words stay: scrim lifts so the copy sits on clean black
      const out = p > SCRUB_END + 0.01;
      if (out !== copyOut) {
        copyOut = out;
        gsap.to(qsa('.hero__scrim, .hero__vf', section), { opacity: out ? 0 : 1, duration: 2 / 24, ease: 'steps(2)', overwrite: true });
        gsap.to(qs('.hero__scrollcue', section), { opacity: out ? 0 : 1, duration: 0.1, ease: 'none', overwrite: true });
      }
      setDrop(clamp((p - (SCRUB_END + 0.02)) / (1 - SCRUB_END - 0.02), 0, 1));
      amt = 1 - clamp((p - SCRUB_END) * 6, 0, 1) * 0.8;
      dirty = true;
    }
  });
}
