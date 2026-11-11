/* ==========================================================================
   A1 HERO — prompt → denoise generation.
   The headline is "typed" into the prompt bar (ghost text → solid; the h1 is
   real text and always readable), then a WebGL sampler runs 30 steps from
   seeded latent noise to heroVideo.poster: per-step noise resampling, 16px
   latent blocks that dissolve, blur-by-mip that sharpens. "もう一度生成" re-runs
   with a new seed. Pointer = local inpainting (noise brush that heals).
   Scrolling away re-noises the frame (back into latent space).
   ========================================================================== */
import { qs, clamp } from '../core.js';
import { GLSL_LIB, createGL, makeTexture, uploadTexture, loadImage, fitCanvas } from './gl.js';
import { getSeed, setSeed, onSeed, fmtSeed, introDone, splitChars, rng } from './state.js';

const STEPS = 30;
const STEP_MS = 74;
const TRAIL = 16;
const DEFAULT_POSTER = 'assets/ai-media/fluorescent-noise.jpg';

const FRAG = `#version 300 es
precision highp float;
in vec2 vUv; out vec4 o;
uniform sampler2D uTex;
uniform vec2 uRes, uImg, uFocus;
uniform float uZoom;
uniform float uSigma, uStep, uSeed, uPx, uLoaded, uTrailOn;
uniform vec3 uTrail[${TRAIL}];
${GLSL_LIB}
void main(){
  vec2 uv = vUv;
  vec2 px = gl_FragCoord.xy;
  vec2 asp = vec2(uRes.x / uRes.y, 1.);
  float loc = 0.;
  if (uTrailOn > .5) for (int i = 0; i < ${TRAIL}; i++) {
    vec2 d = (uv - uTrail[i].xy) * asp;
    loc = max(loc, uTrail[i].z * exp(-dot(d, d) * 55.));
  }
  float s = clamp(max(uSigma, loc), 0., 1.);
  if (uLoaded < .5) s = 1.;
  float sig = sqrt(max(0., 1. - s * s));
  // latent resolution: early steps resolve as coarse latent blocks
  float blk = floor(mix(1., 18., smoothstep(.3, .97, s)) + .5);
  vec2 suv = blk > 1.5 ? (floor(px / blk) + .5) * blk / uRes : uv;
  vec2 cuv = coverUv(suv, uRes, uImg, uFocus);
  cuv = vec2(.5, 1.) + (cuv - vec2(.5, 1.)) / uZoom;
  cuv.y = 1. - cuv.y;
  vec3 img = textureLod(uTex, cuv, s * 5.5).rgb;
  // sampler noise, resampled every step (seeded)
  vec2 g = floor(px / uPx);
  float k = uStep * 7.13 + uSeed;
  vec3 n = vec3(h12(g + k), h12(g + k + 31.7), h12(g + k + 77.1))
         + vec3(h12(g * 1.37 + k + 5.), h12(g * 1.37 + k + 9.), h12(g * 1.37 + k + 13.)) - 1.;
  vec2 lp = uv * asp * 7. + k * .37;
  vec3 lf = vec3(vnoise(lp) + .5 * vnoise(lp * 2.1 + 9.), vnoise(lp + 3.3) + .5 * vnoise(lp * 2.1 + 4.), vnoise(lp + 6.1) + .5 * vnoise(lp * 2.1 + 1.)) / 1.5 - .5;
  vec3 noise = n * .5 + lf * .9 + vec3(.08, -.05, .13);
  vec3 col = img * sig + noise * s + vec3(.14) * s * s;
  float v = smoothstep(1.35, .3, length((uv - .5) * vec2(1., 1.25)));
  col *= mix(.74, 1., v);
  o = vec4(clamp(col, 0., 1.), 1.);
}`;

const sigmaAt = (k) => Math.pow(1 - clamp(k, 0, STEPS) / STEPS, 1.25);

export function init(ctx) {
  const sec = qs('.gen');
  if (!sec) return;
  const v = ctx.variant || window.DOGAZUKURI_VARIANT || {};
  const hv = v.heroVideo || null;
  const posterImg = qs('.gen__poster', sec);
  const canvas = qs('.gen__canvas', sec);
  const title = qs('.gen__title', sec);
  const runBtn = qs('[data-gen-run]', sec);
  const seedEl = qs('[data-gen-seed]', sec);
  const stepEl = qs('[data-gen-step]', sec);
  const stateEl = qs('[data-gen-state]', sec);
  const ticksEl = qs('[data-gen-ticks]', sec);
  const full = qs('[data-gen-full]', sec);
  const mobile = ctx.isMobile();

  // ---- variant poster / full-length video (runtime, replaces the old build-time regex) ----
  let posterUrl = posterImg ? posterImg.currentSrc || posterImg.src : '';
  if (hv && hv.poster) {
    const light = hv.poster === DEFAULT_POSTER;
    posterUrl = light ? `assets/ai-media/fluorescent-noise-${mobile ? 960 : 1920}.jpg` : hv.poster;
    if (!light && posterImg) { posterImg.removeAttribute('srcset'); posterImg.src = hv.poster; }
  }
  if (full) {
    if (hv && hv.youtubeId) full.href = `https://youtu.be/${hv.youtubeId}`;
    full.addEventListener('click', (e) => {
      const card = hv && document.querySelector(`[data-published-work-id="${hv.id}"] .q__title`);
      const m = ctx.openVideo({ url: full.href, title: card ? card.textContent.trim() : '', originEl: full });
      if (m || !ctx.parseYouTube(full.href)) e.preventDefault();
    });
  }

  // ---- meta (seed / step ticks) ----
  const ticks = [];
  for (let i = 0; i < STEPS; i++) {
    const t = document.createElement('i');
    t.style.setProperty('--k', (i / (STEPS - 1)).toFixed(3));
    ticksEl.appendChild(t); ticks.push(t);
  }
  const showStep = (k) => {
    stepEl.textContent = `${String(k).padStart(2, '0')}/${STEPS}`;
    ticks.forEach((t, i) => t.classList.toggle('is-on', i < k));
  };
  const showSeed = (s) => { seedEl.textContent = fmtSeed(s); };
  const setPhase = (p, label) => { sec.dataset.phase = p; stateEl.textContent = label; };
  showSeed(getSeed());
  onSeed(showSeed);

  if (ctx.reduced) {
    showStep(STEPS); setPhase('done', 'DONE');
    return;
  }

  // ---- prompt typing (ghost text → typed) ----
  title.setAttribute('aria-label', title.textContent.replace(/\s+/g, ''));
  const chars = splitChars(title);
  const caret = document.createElement('span');
  caret.className = 'gen__caret';
  caret.setAttribute('aria-hidden', 'true');
  title.classList.add('is-typing');
  chars[0].before(caret);
  showStep(0); setPhase('typing', 'PROMPT');

  // ---- WebGL sampler ----
  let G = null;
  try { G = createGL(canvas, FRAG, ['uTex', 'uRes', 'uImg', 'uFocus', 'uSigma', 'uStep', 'uSeed', 'uPx', 'uLoaded', 'uTrail', 'uTrailOn', 'uZoom']); } catch (e) { console.warn('[ai hero] webgl', e.message); }
  if (G) sec.classList.add('has-gl');

  const S = {
    phase: 'noise', t0: 0, k: 0, sigma: 1, exit: 0, step: 0, loaded: 0,
    img: [1920, 1081], dirty: true, trail: [], lastNoise: 0
  };
  const trailBuf = new Float32Array(TRAIL * 3);
  const fullScale = Math.min(devicePixelRatio || 1, 1.5) * (mobile ? 0.8 : 0.72);
  const noisyScale = Math.min(fullScale, 0.5);
  const focus = mobile ? [0.42, 0.5] : [0.5, 0.76];
  const zoom = mobile ? 1.45 : 1;

  if (G) {
    const { gl, U } = G;
    const tex = makeTexture(gl, 0);
    gl.uniform1i(U.uTex, 0);
    const p = loadImage(posterUrl).then((img) => {
      uploadTexture(gl, 0, tex, img);
      S.img = [img.naturalWidth, img.naturalHeight];
      S.loaded = 1; S.dirty = true;
    }).catch(() => { sec.classList.remove('has-gl'); G = null; });
    ctx.registerLoad(p);
  }

  const render = () => {
    if (!G) return;
    const { gl, U } = G;
    const scale = S.phase === 'done' && S.exit < 0.35 ? fullScale : noisyScale;
    if (fitCanvas(canvas, scale)) gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(U.uRes, canvas.width, canvas.height);
    gl.uniform2f(U.uImg, S.img[0], S.img[1]);
    gl.uniform2f(U.uFocus, focus[0], focus[1]);
    gl.uniform1f(U.uZoom, zoom);
    gl.uniform1f(U.uSigma, Math.max(S.sigma, S.exit));
    gl.uniform1f(U.uStep, S.step);
    gl.uniform1f(U.uSeed, (getSeed() % 9973) * 0.731);
    gl.uniform1f(U.uPx, Math.max(1, Math.round(2 * scale)));
    gl.uniform1f(U.uLoaded, S.loaded);
    gl.uniform3fv(U.uTrail, trailBuf);
    gl.uniform1f(U.uTrailOn, S.trail.length ? 1 : 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  const startSampling = () => {
    S.phase = 'sampling'; S.t0 = performance.now(); S.k = 0;
    setPhase('sampling', 'SAMPLING');
    runBtn.disabled = true;
  };

  const tick = (now) => {
    let need = S.dirty;
    if (S.phase === 'noise' || S.phase === 'typing') {
      S.sigma = 1;
      if (now - S.lastNoise > 90) { S.lastNoise = now; S.step += 1; need = true; }
    } else if (S.phase === 'sampling') {
      const el = Math.max(0, performance.now() - S.t0);
      const k = Math.min(STEPS, Math.floor(el / STEP_MS));
      const f = (el % STEP_MS) / STEP_MS;
      if (k !== S.k) { S.k = k; showStep(k); }
      S.step = 1000 + k; // a fresh noise sample per sampler step
      S.sigma = k >= STEPS ? 0 : sigmaAt(k) + (sigmaAt(k + 1) - sigmaAt(k)) * Math.min(1, f / 0.3);
      need = true;
      if (k >= STEPS) {
        S.phase = 'done'; S.sigma = 0;
        setPhase('done', 'DONE');
        runBtn.disabled = false;
      }
    }
    // inpainting brush
    if (S.trail.length) {
      const life = 1500;
      S.trail = S.trail.filter((p) => now - p.t < life);
      for (let i = 0; i < TRAIL; i++) {
        const p = S.trail[S.trail.length - 1 - i];
        trailBuf[i * 3] = p ? p.x : -9; trailBuf[i * 3 + 1] = p ? p.y : -9;
        trailBuf[i * 3 + 2] = p ? 0.9 * Math.pow(1 - (now - p.t) / life, 1.2) : 0;
      }
      need = true;
      if (!S.trail.length) S.dirty = true;
    }
    if (need) { render(); S.dirty = false; }
  };
  const lp = ctx.loop(sec, tick);
  ctx.onResize(() => { S.dirty = true; if (!lp.running) render(); });

  if (G && !ctx.isTouch) {
    sec.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse' || S.phase !== 'done') return;
      const r = canvas.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = 1 - (e.clientY - r.top) / r.height;
      const last = S.trail[S.trail.length - 1];
      if (last && Math.hypot((x - last.x) * r.width, (y - last.y) * r.height) < 14) return;
      S.trail.push({ x, y, t: performance.now() });
      if (S.trail.length > TRAIL) S.trail.shift();
    }, { passive: true });
  }

  // scrolling away = the frame dissolves back into latent noise
  if (G && ctx.ScrollTrigger && !mobile) {
    ctx.ScrollTrigger.create({
      trigger: sec, start: 'top top', end: 'bottom top',
      onUpdate: (st) => { S.exit = Math.pow(st.progress, 1.4) * 0.8; S.dirty = true; }
    });
  }

  runBtn.addEventListener('click', () => {
    if (S.phase === 'typing') return;
    setSeed();
    runBtn.classList.add('is-press');
    setTimeout(() => runBtn.classList.remove('is-press'), 140);
    showStep(0);
    startSampling();
  });

  // ---- sequence: intro gate → typing → sampling ----
  const R = rng(getSeed());
  introDone.then(() => new Promise((r) => setTimeout(r, 260))).then(() => {
    let i = 0;
    const typeNext = () => {
      if (i >= chars.length) {
        caret.remove();
        title.classList.remove('is-typing');
        title.classList.add('is-typed');
        runBtn.classList.add('is-press');
        setTimeout(() => { runBtn.classList.remove('is-press'); startSampling(); }, 180);
        return;
      }
      chars[i].classList.add('is-on');
      chars[i].after(caret);
      const c = chars[i].textContent;
      i += 1;
      setTimeout(typeNext, (/[、。]/.test(c) ? 150 : 34) + R() * 40);
    };
    typeNext();
  });
}
