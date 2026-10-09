// Turns the originals in assets-src/ into the web files in public/img/.
//
//   npm run assets
//
// Screenshots lose a 14 px strip on the left (the tablet's system edge handle shows there)
// and are written as AVIF + WebP at two widths. Every output must stay under its size cap.
import sharp from 'sharp';
import { mkdirSync, readdirSync, statSync, copyFileSync } from 'node:fs';
import { join, parse } from 'node:path';

const SRC = 'assets-src';
const OUT = 'public/img';
const CAP_KB = { shot: 160, icon: 80 };
mkdirSync(OUT, { recursive: true });

const problems = [];
function check(file, capKb) {
  const kb = statSync(file).size / 1024;
  const flag = kb > capKb ? '  <-- over cap' : '';
  if (flag) problems.push(file);
  console.log(`${file.padEnd(52)} ${kb.toFixed(1).padStart(7)} KB${flag}`);
}

// Screenshots
for (const f of readdirSync(join(SRC, 'screenshots'))) {
  if (!/\.(jpe?g|png)$/i.test(f)) continue;
  const name = parse(f).name;
  const input = join(SRC, 'screenshots', f);
  const meta = await sharp(input).metadata();
  const crop = { left: 14, top: 0, width: meta.width - 14, height: meta.height };
  const portrait = meta.height > meta.width;
  const widths = portrait ? [400, 800] : [800, 1600];
  for (const w of widths) {
    const base = sharp(input).extract(crop).resize({ width: w });
    const avif = join(OUT, `${name}-${w}.avif`);
    const webp = join(OUT, `${name}-${w}.webp`);
    await base.clone().avif({ quality: 52, effort: 6 }).toFile(avif);
    await base.clone().webp({ quality: 74, effort: 6 }).toFile(webp);
    check(avif, CAP_KB.shot);
    check(webp, CAP_KB.shot);
  }
}

// App icon: the adaptive foreground carries the whole rounded icon; trim the transparent margin.
const fg = join(SRC, 'brand', 'app-icon-foreground.webp');
const trimmed = await sharp(fg).trim({ threshold: 1 }).png().toBuffer();
for (const [file, size] of [
  ['favicon-32.png', 32],
  ['favicon-48.png', 48],
  ['apple-touch-icon.png', 180],
  ['icon-192.png', 192],
]) {
  const out = join(OUT, file);
  const img = sharp(trimmed).resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } });
  // iOS draws a black square behind transparent touch icons: give it the icon's own ink.
  if (file === 'apple-touch-icon.png') img.flatten({ background: '#0b0d1f' });
  await img.png({ compressionLevel: 9 }).toFile(out);
  check(out, CAP_KB.icon);
}
for (const size of [96, 256]) {
  const out = join(OUT, `app-icon-${size}.webp`);
  await sharp(trimmed).resize(size, size).webp({ quality: 88 }).toFile(out);
  check(out, CAP_KB.icon);
}
copyFileSync(join(SRC, 'brand', 'masha-emblem.svg'), join(OUT, 'masha-emblem.svg'));

if (problems.length) {
  console.error(`\n${problems.length} file(s) over their size cap.`);
  process.exit(1);
}
