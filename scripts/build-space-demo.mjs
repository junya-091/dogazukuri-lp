import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { basename, join, relative, resolve } from 'node:path';
import { cp, lstat, readFile, writeFile } from 'node:fs/promises';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const outputOverride = process.env.DOGAZUKURI_BUILD_OUT_DIR;
if (!outputOverride) throw new Error('DOGAZUKURI_BUILD_OUT_DIR is required; use a fresh /private/tmp/dogazukuri-build-* directory');
const outDir = resolve(outputOverride);
const relativeOutput = relative(resolve('/private/tmp'), outDir);
if (!outputOverride.startsWith('/') || relativeOutput.startsWith('..') || !basename(outDir).startsWith('dogazukuri-build-')) throw new Error('Unsafe DOGAZUKURI_BUILD_OUT_DIR');
const info = await lstat(outDir);
if (!info.isDirectory()) throw new Error('DOGAZUKURI_BUILD_OUT_DIR must be an existing build directory');
await build({
  entryPoints: [resolve(root, 'src/space-demo/main.js')],
  outfile: join(outDir, 'space-demo.bundle.js'),
  bundle: true,
  format: 'esm',
  minify: true,
  target: ['es2020'],
  legalComments: 'none',
});
const bundlePath = join(outDir, 'space-demo.bundle.js');
let bundle = await readFile(bundlePath, 'utf8');
bundle = bundle
  .replace(/^ +(?=\t)/gm, '')
  .replace(/[ \t]+$/gm, '')
  .replace(/\n+$/, '') + '\n';
await writeFile(bundlePath, bundle);
for (const path of ['space-demo.html', 'space-demo.css']) await cp(join(root, path), join(outDir, path));
for (const path of ['scenes', 'models']) await cp(join(root, path), join(outDir, path), { recursive: true });
const siteUrl = (process.env.PUBLIC_SITE_URL || 'https://junya-091.github.io/dogazukuri-lp').replace(/\/+$/, '');
const canonicalUrl = `${siteUrl}/space-demo.html`;
const htmlPath = join(outDir, 'space-demo.html');
let html = await readFile(htmlPath, 'utf8');
const canonicalPattern = /<link\b(?=[^>]*\brel\s*=\s*["']canonical["'])[^>]*>/i;
if (canonicalPattern.test(html)) {
  html = html.replace(canonicalPattern, `<link rel="canonical" href="${canonicalUrl}">`);
} else if (/<\/head>/i.test(html)) {
  html = html.replace(/<\/head>/i, `    <link rel="canonical" href="${canonicalUrl}">\n</head>`);
} else {
  throw new Error('space-demo.html has no closing head element; cannot set canonical URL');
}
await writeFile(htmlPath, html);
console.log(`Built space-demo assets -> ${outDir}`);
