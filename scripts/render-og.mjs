// Renders scripts/og.html to public/og.jpg (1200×630, the Open Graph / Twitter image).
// Playwright is not a dependency of the site; install it only when you need to re-render:
//   npm i --no-save playwright@1.64.0 && npx playwright install chromium && node scripts/render-og.mjs
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { statSync } from 'node:fs';
import sharp from 'sharp';

let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  console.error('Playwright is not installed. Run: npm i --no-save playwright@1.64.0 && npx playwright install chromium');
  process.exit(1);
}
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.goto(pathToFileURL(resolve('scripts/og.html')).href);
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(300);
const png = await page.screenshot({ type: 'png' });
await browser.close();
await sharp(png).jpeg({ quality: 86, mozjpeg: true }).toFile('public/og.jpg');
console.log(`public/og.jpg: ${(statSync('public/og.jpg').size / 1024).toFixed(0)} KB`);
