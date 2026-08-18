import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const dist = join(root, 'dist');
const variantName = process.env.DOGAZUKURI_VARIANT || 'base';
const siteUrl = (process.env.PUBLIC_SITE_URL || 'https://junya-091.github.io/dogazukuri-lp').replace(/\/+$/, '');

const fail = (message) => { console.error(`build-variant: ${message}`); process.exitCode = 1; };
if (!/^[a-z][a-z0-9-]*$/.test(variantName)) fail(`invalid DOGAZUKURI_VARIANT: ${variantName}`);
if (process.exitCode) process.exit();

const configPath = join(root, 'variants', `${variantName}.json`);
let config;
try { config = JSON.parse(await readFile(configPath, 'utf8')); } catch (error) { fail(`cannot read variant ${configPath}: ${error.message}`); process.exit(); }

const knownWorkIds = new Set(Array.from({ length: 20 }, (_, i) => `wide-${String(i + 1).padStart(2, '0')}`));
for (const id of Array.from({ length: 20 }, (_, i) => `short-${String(i + 1).padStart(2, '0')}`)) knownWorkIds.add(id);
const knownIds = {
  workIds: knownWorkIds,
  aiMediaIds: new Set(['character-short', 'city-timelapse', 'ramen-story', 'food-sizzle', 'fantasy-world', 'pov-city']),
  publishedWorkIds: new Set(['after-school', 'ai-explainer', 'mushroom-revenge', 'whitening-01', 'whitening-02', 'beisoya-day', 'fluorescent-noise'])
};
for (const [key, known] of Object.entries(knownIds)) {
  const values = config[key];
  if (!Array.isArray(values) || values.length === 0 || new Set(values).size !== values.length || values.some((id) => typeof id !== 'string' || !known.has(id))) fail(`${key} must be a non-empty subset of known IDs`);
}
const heroKeys = ['desktop', 'large', 'mobile'];
if (!config.hero || heroKeys.some((key) => typeof config.hero[key] !== 'string')) fail('hero must define desktop, large, and mobile assets');
if (config.heroVideo !== undefined) {
  if (!config.heroVideo || typeof config.heroVideo !== 'object' || Array.isArray(config.heroVideo)) fail('heroVideo must be an object');
  for (const key of ['id', 'youtubeId', 'poster']) {
    if (typeof config.heroVideo?.[key] !== 'string' || !config.heroVideo[key]) fail(`heroVideo.${key} must be a non-empty string`);
  }
  if (typeof config.heroVideo?.poster === 'string') {
    try { await readFile(join(root, config.heroVideo.poster)); } catch { fail(`heroVideo poster missing: ${config.heroVideo.poster}`); }
  }
}
for (const [key, asset] of Object.entries(config.hero || {})) {
  try { await readFile(join(root, asset)); } catch { fail(`hero asset missing for ${key}: ${asset}`); }
}
if (process.exitCode) process.exit();

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
const sourceOnly = new Set(['.git', 'dist', 'docs', 'variants', 'scripts', 'package.json']);
for (const entry of await readdir(root, { withFileTypes: true })) {
  if (sourceOnly.has(entry.name) || entry.name.startsWith('.') || entry.name.includes('.bak')) continue;
  await cp(join(root, entry.name), join(dist, entry.name), { recursive: true });
}

const publicPages = ['index.html', 'ai-ad-media.html'];
for (const page of publicPages) {
  const output = join(dist, page);
  let html = await readFile(output, 'utf8');
  const pageUrl = `${siteUrl}/${page === 'index.html' ? '' : page}`;
  html = html.replace(/(<link\s+rel=["']canonical["']\s+href=["'])[^"']*(["'])/i, `$1${pageUrl}$2`)
    .replace(/(<meta\s+property=["']og:url["']\s+content=["'])[^"']*(["'])/i, `$1${pageUrl}$2`);
  if (!/<link\s+rel=["']canonical["']/i.test(html)) html = html.replace(/<\/head>/i, `  <link rel="canonical" href="${pageUrl}">\n</head>`);
  html = html.replace(/(<script\s+type=["']application\/ld\+json["'][^>]*>)([\s\S]*?)(<\/script>)/gi, (match, open, json, close) => {
    try {
      const data = JSON.parse(json);
      if (data && typeof data === 'object') data.url = pageUrl;
      return `${open}\n${JSON.stringify(data, null, 2)}\n${close}`;
    } catch {
      return match;
    }
  });
  if (page === 'ai-ad-media.html' && config.heroVideo) {
    html = html.replace(/src="assets\/works\/work-wide-01\.jpg"/g, `src="${config.heroVideo.poster}"`);
    html = html.replace(/data-hero-id="after-school"/g, `data-hero-id="${config.heroVideo.id}"`);
    const youtubeEmbedUrl = `https://www.youtube-nocookie.com/embed/${config.heroVideo.youtubeId}?autoplay=1&amp;mute=1&amp;controls=0&amp;loop=1&amp;playlist=${config.heroVideo.youtubeId}&amp;playsinline=1&amp;rel=0&amp;modestbranding=1&amp;enablejsapi=1&amp;cc_load_policy=0`;
    html = html.replace(/(<iframe id="aiHeroVideo"[^>]*?)data-src="https:\/\/www\.youtube-nocookie\.com\/embed\/[^"]*\?[^"]*"/, `$1data-src="${youtubeEmbedUrl}"`);
  }
  const payload = { ...config, siteUrl, pageUrls: { home: siteUrl, aiAdMedia: `${siteUrl}/ai-ad-media.html` } };
  const script = `<script>window.DOGAZUKURI_VARIANT=${JSON.stringify(payload)};</script>`;
  html = html.replace(/<\/head>/i, `  ${script}\n</head>`);
  await writeFile(output, html);
}
await writeFile(join(dist, 'variant-config.js'), `window.DOGAZUKURI_VARIANT=${JSON.stringify({ ...config, siteUrl })};\n`);
console.log(`Built ${variantName} -> ${relative(root, dist)} (PUBLIC_SITE_URL=${siteUrl})`);
