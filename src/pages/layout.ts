// Build-time document shell: <head>, top bar, footer. Runs in Node (vite.config.ts), never in the browser.
import type { Locale, Dict } from '../i18n/index.ts';
import { LOCALES } from '../i18n/index.ts';
import { AUTHOR_URL, LICENSE_URL, NOTICES_URL, REPO_URL, RELEASES_URL, type ReleaseSnapshot } from '../data.ts';
import { icon } from './icons.ts';

export type PageId = 'home' | 'privacy' | '404';

export interface PageCtx {
  locale: Locale;
  page: PageId;
  /** Absolute origin without trailing slash, e.g. https://elyndra.example. Empty when not configured. */
  siteUrl: string;
  snapshot: ReleaseSnapshot;
}

/**
 * The only inline script, run before first paint: flips no-js → js, restores the saved palette and
 * picks the boot animation (full once per session, short afterwards, none with reduced motion).
 * The animation itself is CSS, so it plays even if the module bundle fails. Its hash goes into the CSP.
 */
export const INLINE_BOOT_JS =
  "(function(h){var c=h.classList;c.replace('no-js','js');try{var p=localStorage.getItem('elyndra.palette');" +
  "if(p&&/^[a-z_]+$/.test(p))h.setAttribute('data-palette',p);" +
  "if(h.getAttribute('data-page')==='home'&&!matchMedia('(prefers-reduced-motion: reduce)').matches){" +
  "var s=sessionStorage.getItem('elyndra.booted');c.add('boot',s?'boot-short':'boot-play');sessionStorage.setItem('elyndra.booted','1')}}catch(e){}})(document.documentElement)";

export const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Path of a page in a locale: '/', '/es/', '/privacy/', '/es/privacy/'. */
export function pagePath(locale: Locale, page: PageId): string {
  if (page === '404') return '/404.html';
  return `${locale.prefix}/${page === 'privacy' ? 'privacy/' : ''}`;
}

function head(ctx: PageCtx, title: string, description: string): string {
  const { locale, page, siteUrl } = ctx;
  const t = locale.dict;
  const path = pagePath(locale, page);
  const abs = (p: string) => (siteUrl ? siteUrl + p : p);
  const alternates =
    page === '404'
      ? ''
      : LOCALES.map((l) => `<link vite-ignore rel="alternate" hreflang="${l.code}" href="${esc(abs(pagePath(l, page)))}">`).join('') +
        `<link vite-ignore rel="alternate" hreflang="x-default" href="${esc(abs(pagePath(LOCALES[0], page)))}">`;
  const canonical = siteUrl && page !== '404' ? `<link vite-ignore rel="canonical" href="${esc(abs(path))}">` : '';
  const ogImage = abs('/og.jpg');
  const robots = page === '404' ? '<meta name="robots" content="noindex">' : '';
  const jsonLd =
    page === 'home'
      ? `<script type="application/ld+json">${JSON.stringify(structuredData(ctx)).replace(/</g, '\\u003c')}</script>`
      : '';
  return `<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<script>${INLINE_BOOT_JS}</script>
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${robots}
<meta name="color-scheme" content="dark">
<meta name="theme-color" content="#0b0d16">
<meta name="author" content="Jeferson Manuel Morillo Vallejo">
${canonical}${alternates}
<link rel="icon" href="/img/favicon-32.png" sizes="32x32" type="image/png">
<link rel="icon" href="/img/favicon-48.png" sizes="48x48" type="image/png">
<link rel="apple-touch-icon" href="/img/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preload" href="/fonts/poppins_regular.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/poppins_semibold.woff2" as="font" type="font/woff2" crossorigin>
${page === 'home' ? '<link rel="preload" href="/fonts/cinzel_bold.woff2" as="font" type="font/woff2" crossorigin><link rel="preload" href="/fonts/poppins_extrabold.woff2" as="font" type="font/woff2" crossorigin>' : ''}
<meta property="og:type" content="website">
<meta property="og:site_name" content="Elyndra">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:locale" content="${t.meta.ogLocale}">
${LOCALES.filter((l) => l !== locale).map((l) => `<meta property="og:locale:alternate" content="${l.dict.meta.ogLocale}">`).join('')}
${siteUrl ? `<meta property="og:url" content="${esc(abs(path))}">` : ''}
<meta property="og:image" content="${esc(ogImage)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Elyndra">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${esc(ogImage)}">
${jsonLd}
<script type="module" src="/src/main.ts"></script>
</head>`;
}

function structuredData(ctx: PageCtx) {
  const t = ctx.locale.dict;
  const latest = ctx.snapshot.releases[0];
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Elyndra',
    description: t.meta.description,
    applicationCategory: 'GameApplication',
    operatingSystem: 'Android 8.0+',
    inLanguage: ['en', 'es', 'pt', 'fr', 'de', 'ja'],
    ...(latest ? { softwareVersion: latest.tag.replace(/^v/, '') } : {}),
    downloadUrl: RELEASES_URL,
    installUrl: RELEASES_URL,
    ...(ctx.siteUrl ? { url: ctx.siteUrl + pagePath(ctx.locale, 'home'), image: ctx.siteUrl + '/og.jpg' } : {}),
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    author: { '@type': 'Person', name: 'Jeferson Manuel Morillo Vallejo', url: AUTHOR_URL },
    license: LICENSE_URL,
  };
}

function topbar(ctx: PageCtx): string {
  const { locale, page } = ctx;
  const t = locale.dict;
  const home = pagePath(locale, 'home');
  const onHome = page === 'home';
  const link = (id: string) => (onHome ? `#${id}` : `${home}#${id}`);
  const tabs = (['features', 'masha', 'systems', 'gallery', 'install', 'faq'] as const)
    .map(
      (id) =>
        `<a class="dock-tab" href="${link(id)}" data-section="${id}"><span class="dock-dot" aria-hidden="true"></span><span class="dock-label">${esc(t.nav[id])}</span></a>`,
    )
    .join('');
  const other = LOCALES.filter((l) => l !== locale);
  const langLinks = other
    .map(
      (l) =>
        `<a class="pill pill-quiet lang-link" href="${pagePath(l, page === '404' ? 'home' : page)}" hreflang="${l.code}" lang="${l.code}" data-lang="${l.code}" title="${esc(l.label)}"><span class="sr-only">${esc(t.a11y.langSwitch)}: </span>${l.code.toUpperCase()}</a>`,
    )
    .join('');
  return `<header class="topbar" data-topbar>
  <a class="brand" href="${home}" aria-label="Elyndra">
    <img src="/img/app-icon-96.webp" width="34" height="34" alt="">
    <span class="brand-word" aria-hidden="true">ELYNDRA</span>
  </a>
  <nav class="dock" aria-label="${esc(t.a11y.nav)}" data-dock>${tabs}</nav>
  <div class="bar-right">
    ${langLinks}
    <button class="pill pill-quiet pill-icon" type="button" data-sound-toggle aria-pressed="false" hidden
      data-label-on="${esc(t.a11y.soundOn)}" data-label-off="${esc(t.a11y.soundOff)}" aria-label="${esc(t.a11y.soundOff)}">
      <span class="when-on">${icon('soundOn')}</span><span class="when-off">${icon('soundOff')}</span>
    </button>
    <a class="pill pill-accent" href="${link('download')}" data-nav-download>${icon('download')}<span>${esc(t.nav.download)}</span></a>
  </div>
</header>`;
}

function footer(ctx: PageCtx): string {
  const t = ctx.locale.dict;
  const f = t.footer;
  return `<footer class="footer">
  <div class="wrap footer-grid">
    <div class="footer-brand">
      <a class="brand" href="${pagePath(ctx.locale, 'home')}" aria-label="Elyndra">
        <img src="/img/app-icon-96.webp" width="40" height="40" alt="" loading="lazy">
        <span class="brand-word" aria-hidden="true">ELYNDRA</span>
      </a>
      <p>${esc(f.tagline)}</p>
    </div>
    <nav class="footer-col" aria-label="${esc(f.product)}">
      <p class="overline">${esc(f.product)}</p>
      <a href="${RELEASES_URL}">${esc(f.releases)}</a>
      <a href="${REPO_URL}">${esc(f.source)}</a>
      <a href="${pagePath(ctx.locale, 'privacy')}">${esc(f.privacy)}</a>
    </nav>
    <nav class="footer-col" aria-label="${esc(f.legal)}">
      <p class="overline">${esc(f.legal)}</p>
      <a href="${LICENSE_URL}">${esc(f.license)}</a>
      <a href="${NOTICES_URL}">${esc(f.notices)}</a>
      <a href="${AUTHOR_URL}">${esc(f.author)}</a>
    </nav>
  </div>
  <div class="wrap footer-fine">
    <p>${f.disclaimer}</p>
    <p>${f.voice}</p>
    <p>${esc(f.credits)}</p>
    <p class="copyright">${f.copyright}</p>
  </div>
</footer>`;
}

function padHints(t: Dict): string {
  return `<div class="pad-hints" data-pad-hints hidden aria-hidden="true">
  <span class="pad-hint-title">${esc(t.pad.connected)}</span>
  <span><kbd class="glyph glyph-a">A</kbd>${esc(t.pad.a)}</span>
  <span><kbd class="glyph glyph-b">B</kbd>${esc(t.pad.b)}</span>
  <span><kbd class="glyph glyph-bump">LB</kbd><kbd class="glyph glyph-bump">RB</kbd>${esc(t.pad.lbrb)}</span>
  <span><kbd class="glyph glyph-dpad">✛</kbd>${esc(t.pad.dpad)}</span>
</div>`;
}

/** Strings the browser code needs, per locale, inlined as JSON (not executed). */
function runtimeStrings(ctx: PageCtx): string {
  const t = ctx.locale.dict;
  const data = {
    lang: t.meta.lang,
    privacyPath: pagePath(ctx.locale, 'privacy'),
    a11y: t.a11y,
    download: t.download,
    masha: { loading3d: t.masha.loading3d, failed3d: t.masha.failed3d, canvasLabel: t.masha.canvasLabel },
    features: { counterLabel: t.features.counterLabel },
    mb: t.runtime.mb,
    ctaDesktop: t.hero.ctaDesktop,
  };
  return `<script type="application/json" id="runtime-strings">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;
}

export function documentShell(ctx: PageCtx, title: string, description: string, main: string): string {
  const t = ctx.locale.dict;
  return `<!doctype html>
<html lang="${t.meta.lang}" class="no-js" data-page="${ctx.page}">
${head(ctx, title, description)}
<body>
<a class="skip-link" href="#main">${esc(t.a11y.skip)}</a>
${topbar(ctx)}
<main id="main" tabindex="-1">
${main}
</main>
${footer(ctx)}
${padHints(t)}
${runtimeStrings(ctx)}
</body>
</html>`;
}
