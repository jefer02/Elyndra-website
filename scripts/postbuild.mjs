// Size budget for dist/. Fails the build when something grows past its cap.
//
//   initial JS (entry chunk)   ≤ 40 KB gzip
//   initial CSS                ≤ 22 KB gzip
//   three.js + Masha chunk     ≤ 190 KB gzip (lazy, only near the Masha section)
//   any image                  ≤ 160 KB      any font ≤ 30 KB      the 3D model ≤ 900 KB
//   home page first load (HTML + CSS + entry JS + fonts + hero image, avif) ≤ 450 KB transferred
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import { gzipSync } from 'node:zlib';

const DIST = 'dist';
const kb = (n) => n / 1024;
const gz = (file) => gzipSync(readFileSync(file), { level: 9 }).length;

function walk(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

if (!existsSync(DIST)) {
  console.error('dist/ not found');
  process.exit(1);
}
const files = walk(DIST);
const errors = [];
const row = (label, size, cap) => {
  const over = size > cap;
  if (over) errors.push(`${label}: ${kb(size).toFixed(1)} KB > ${kb(cap).toFixed(0)} KB`);
  console.log(`${over ? '✗' : '✓'} ${label.padEnd(46)} ${kb(size).toFixed(1).padStart(8)} KB  (cap ${kb(cap).toFixed(0)} KB)`);
};

const html = readFileSync(join(DIST, 'index.html'), 'utf8');
const entry = [...html.matchAll(/<script type="module"[^>]*src="([^"]+)"/g)].map((m) => m[1]);
const css = [...html.matchAll(/<link rel="stylesheet"[^>]*href="([^"]+)"/g)].map((m) => m[1]);
const entryJs = entry.reduce((n, f) => n + gz(join(DIST, f)), 0);
const entryCss = css.reduce((n, f) => n + gz(join(DIST, f)), 0);
row('entry JS (gzip)', entryJs, 40 * 1024);
row('entry CSS (gzip)', entryCss, 22 * 1024);

const js = files.filter((f) => extname(f) === '.js');
const lazy = js.filter((f) => !entry.some((e) => f.replace(/\\/g, '/').endsWith(e)));
const lazyGz = lazy.reduce((n, f) => n + gz(f), 0);
row('lazy chunks (three.js, Masha, QR) gzip', lazyGz, 190 * 1024);

for (const f of files) {
  const ext = extname(f);
  const size = statSync(f).size;
  if (['.avif', '.webp', '.png', '.jpg', '.svg'].includes(ext)) {
    if (size > 160 * 1024) errors.push(`${f}: ${kb(size).toFixed(1)} KB > 160 KB`);
  } else if (ext === '.woff2') {
    if (size > 30 * 1024) errors.push(`${f}: ${kb(size).toFixed(1)} KB > 30 KB`);
  } else if (ext === '.glb') {
    row('3D model', size, 900 * 1024);
  }
}

const fonts = ['poppins_regular', 'poppins_semibold', 'cinzel_bold'].reduce(
  (n, f) => n + statSync(join(DIST, 'fonts', `${f}.woff2`)).size,
  0,
);
const heroImg = statSync(join(DIST, 'img', 'meridian-library-1600.avif')).size;
const first = gz(join(DIST, 'index.html')) + entryCss + entryJs + fonts + heroImg;
row('home first load (approx.)', first, 450 * 1024);

const total = files.reduce((n, f) => n + statSync(f).size, 0);
console.log(`\ndist/ total on disk: ${(total / 1048576).toFixed(2)} MB in ${files.length} files`);
if (errors.length) {
  console.error('\nBudget exceeded:\n  ' + errors.join('\n  '));
  process.exit(1);
}
