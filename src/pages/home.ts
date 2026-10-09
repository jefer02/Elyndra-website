// Build-time renderer of the home page.
import { PALETTES, SHOTS, SYSTEM_COUNT, SYSTEM_GROUPS, REPO_URL, RELEASES_URL, latestRelease, pickAsset, assetAbi } from '../data.ts';
import { esc, pagePath, type PageCtx } from './layout.ts';
import { FEATURE_ICONS, icon } from './icons.ts';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * A silent loop recorded on the device, when `npm run video` has produced it (public/video/<name>.*).
 * No autoplay attribute: src/modules/video.ts plays it only while visible and never with reduced
 * motion. The first frame is a lazy <img> under the video rather than a `poster`, which browsers
 * fetch eagerly and which would compete with the hero image. Without JS that frame is what shows.
 * Falls back to the given picture when the recording is absent.
 */
function videoOr(name: string, fallback: string, label: string): string {
  if (!existsSync(resolve(import.meta.dirname, '../../public/video', `${name}.webm`))) return fallback;
  // 1280x772: the encoded size after scripts/encode-videos.mjs crops the ZUI chrome.
  return `<div class="loop-media"><img class="loop-poster" src="/video/${name}.jpg" width="1280" height="772" alt="${esc(label)}" loading="lazy" decoding="async">
<video class="loop-video" data-loop-video muted loop playsinline preload="none" width="1280" height="772" aria-hidden="true">
<source src="/video/${name}.webm" type="video/webm"><source src="/video/${name}.mp4" type="video/mp4"></video></div>`;
}

/** <picture> for a screenshot. `sizes` describes the rendered width. */
export function picture(shotKey: string, alt: string, sizes: string, opts: { eager?: boolean; cls?: string } = {}): string {
  const s = SHOTS[shotKey];
  const [w1, w2] = s.portrait ? [400, 800] : [800, 1600];
  const srcset = (ext: string) => `/img/${s.name}-${w1}.${ext} ${w1}w, /img/${s.name}-${w2}.${ext} ${w2}w`;
  const h = Math.round((w2 * s.h) / s.w);
  const loading = opts.eager ? 'fetchpriority="high"' : 'loading="lazy" decoding="async"';
  return `<picture${opts.cls ? ` class="${opts.cls}"` : ''}>
<source type="image/avif" srcset="${srcset('avif')}" sizes="${sizes}">
<source type="image/webp" srcset="${srcset('webp')}" sizes="${sizes}">
<img src="/img/${s.name}-${w2}.webp" width="${w2}" height="${h}" alt="${esc(alt)}" ${loading}>
</picture>`;
}

function tablet(inner: string, cls = ''): string {
  return `<div class="device device-tablet ${cls}"><div class="device-screen">${inner}</div><span class="device-cam" aria-hidden="true"></span></div>`;
}

function fmtSize(bytes: number, mb: string, lang: string) {
  return `${new Intl.NumberFormat(lang, { maximumFractionDigits: 0 }).format(bytes / 1048576)} ${mb}`;
}

function fmtDate(iso: string, lang: string) {
  const d = new Date(iso);
  return isNaN(+d) ? '' : new Intl.DateTimeFormat(lang, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(d);
}

export function renderHome(ctx: PageCtx): string {
  const t = ctx.locale.dict;
  const lang = t.meta.lang;
  const rel = latestRelease(ctx.snapshot.releases);
  // Before JavaScript runs we can't know the device, so the prerendered link is the release page.
  const asset = rel ? pickAsset(rel, null) : null;
  const relMeta = rel ? `${rel.tag}${asset ? ` · ${fmtSize(asset.size, t.runtime.mb, lang)}` : ''}` : '';
  const badge = rel ? `<span class="badge ${rel.prerelease ? 'badge-beta' : 'badge-stable'}" data-dl-badge>${esc(rel.prerelease ? t.download.beta : t.download.stable)}</span>` : '<span class="badge" data-dl-badge hidden></span>';

  /* ── Hero ── */
  const hero = `<section class="hero" id="top" aria-labelledby="hero-title">
  <div class="aurora-css" aria-hidden="true"><span class="au au1"></span><span class="au au2"></span><span class="au au3"></span><span class="stars stars1"></span><span class="stars stars2"></span></div>
  <canvas class="aurora" data-aurora aria-hidden="true"></canvas>
  <canvas class="boot" data-boot aria-hidden="true"></canvas>
  <div class="hero-grain" aria-hidden="true"></div>
  <div class="wrap hero-inner">
    <div class="hero-copy">
      <h1 id="hero-title" class="wordmark"><span class="wordmark-text" data-wordmark>Elyndra</span><span class="wordmark-sweep" aria-hidden="true"></span></h1>
      <p class="eyebrow hero-eyebrow">${esc(t.hero.eyebrow)}</p>
      <p class="display">${t.hero.title}</p>
      <p class="lead">${esc(t.hero.lead)}</p>
      <div class="cta-row">
        <a class="btn btn-primary btn-xl" href="${RELEASES_URL}" data-dl-primary data-sfx="confirm">
          <kbd class="glyph glyph-a pad-only" aria-hidden="true">A</kbd>
          ${icon('download')}
          <span class="btn-text"><span data-dl-label>${esc(t.hero.cta)}</span><span class="btn-meta" data-dl-meta>${esc(relMeta)}</span></span>
        </a>
        <a class="btn btn-ghost" href="${REPO_URL}">${icon('code')}<span>${esc(t.hero.secondary)}</span></a>
      </div>
      <p class="reqs">${badge}<span>${esc(t.hero.reqs)}</span></p>
      <noscript><p class="reqs">${esc(t.hero.noJs)}</p></noscript>
    </div>
    <div class="hero-visual" data-tilt>
      <div class="hero-halo" aria-hidden="true"></div>
      ${tablet(picture('meridian-library', t.hero.shotAlt, '(min-width: 1100px) 56vw, 92vw', { eager: true }), 'hero-device')}
      <div class="hero-phone" aria-hidden="true">${`<div class="device device-phone"><div class="device-screen">${picture('portrait-library', '', '(min-width: 1100px) 12vw, 26vw')}</div></div>`}</div>
    </div>
  </div>
  <a class="scroll-cue" href="#features" aria-label="${esc(t.nav.features)}"><span></span></a>
</section>`;

  /* ── Features: a Meridian wheel built from this list (the list itself is the no-JS view) ── */
  const items = t.features.items;
  const total = items.length;
  const pad = (n: number) => String(n).padStart(2, '0');
  const featureCards = items
    .map(
      (f, i) => `<li class="feature" id="feature-${f.id}" data-shot="${f.shot}" data-index="${i}">
  <span class="feature-tile">${icon(FEATURE_ICONS[f.id] ?? 'spark')}</span>
  <span class="feature-num" aria-hidden="true">${pad(i + 1)}</span>
  <h3 class="feature-title">${esc(f.title)}</h3>
  <p class="feature-body">${f.body}</p>
</li>`,
    )
    .join('');
  // Every screenshot the wheel can show, preloaded lazily in a hidden stack (one <picture> each).
  const shotKeys = [...new Set(items.map((f) => f.shot))];
  const shotStack = shotKeys
    .map((k) => {
      const pic = picture(k, '', '(min-width: 1100px) 46vw, 90vw');
      return `<div class="mer-shot" data-shot-key="${k}">${tablet(k === 'meridian-library' ? videoOr('wheel', pic, '') : pic)}</div>`;
    })
    .join('');
  const features = `<section class="section features" id="features" aria-labelledby="features-title">
  <div class="wrap section-head">
    <p class="eyebrow">${esc(t.features.eyebrow)}</p>
    <h2 id="features-title">${esc(t.features.title)}</h2>
    <p class="lead lead-wheel">${esc(t.features.lead)}</p>
  </div>
  <div class="meridian" data-meridian data-count="${total}">
    <div class="mer-sticky">
      <div class="mer-stage wrap-wide">
        <div class="mer-wheel" data-wheel>
          <ol class="feature-list" data-feature-list>${featureCards}</ol>
          <svg class="mer-dial" data-dial aria-hidden="true"></svg>
          <div class="mer-counter" aria-hidden="true"><span class="mer-counter-cur" data-counter>01</span><span class="mer-counter-sep">/</span><span class="mer-counter-total">${pad(total)}</span></div>
        </div>
        <div class="mer-hero" data-mer-hero aria-hidden="true">
          <div class="mer-art">${shotStack}</div>
        </div>
      </div>
    </div>
  </div>
  <div class="wrap palettes" data-palettes>
    <div class="palettes-copy">
      <h3>${esc(t.palettes.title)}</h3>
      <p>${esc(t.palettes.lead)}</p>
    </div>
    <div class="swatches" role="radiogroup" aria-label="${esc(t.a11y.palette)}">
      ${PALETTES.map(
        (p, i) => `<button type="button" class="swatch" role="radio" aria-checked="${i === 0}" data-palette="${p.id}" disabled>
        <span class="swatch-orb" aria-hidden="true"></span><span class="swatch-name">${esc(t.palettes.names[p.id as keyof typeof t.palettes.names])}</span></button>`,
      ).join('')}
    </div>
  </div>
</section>`;

  /* ── Masha ── */
  const masha = `<section class="section masha" id="masha" aria-labelledby="masha-title">
  <div class="masha-bg" aria-hidden="true"></div>
  <div class="wrap masha-grid">
    <div class="masha-stage" data-masha-stage>
      <div class="masha-poster">${videoOr('masha', picture('masha', t.masha.posterAlt, '(min-width: 1000px) 44vw, 92vw', { cls: 'masha-poster-pic' }), t.masha.posterAlt)}</div>
      <div class="masha-canvas" data-masha-canvas></div>
      <button type="button" class="btn btn-holo" data-masha-load hidden>${icon('spark')}<span>${esc(t.masha.load3d)}</span></button>
      <p class="masha-status" data-masha-status role="status"></p>
      <p class="masha-model-note">${esc(t.masha.modelNote)}</p>
    </div>
    <div class="masha-copy">
      <p class="eyebrow eyebrow-holo"><img src="/img/masha-emblem.svg" width="28" height="28" alt="" loading="lazy">${esc(t.masha.eyebrow)}</p>
      <h2 id="masha-title">${esc(t.masha.title)}</h2>
      <p class="lead">${esc(t.masha.lead)}</p>
      <ul class="masha-points">
        ${t.masha.points.map((p) => `<li><h3>${esc(p.t)}</h3><p>${p.d}</p></li>`).join('')}
      </ul>
      <p class="masha-ai-note">${icon('shield')}<span>${t.masha.aiNote.replace('{privacy}', pagePath(ctx.locale, 'privacy'))}</span></p>
    </div>
  </div>
</section>`;

  /* ── Systems ── */
  const systems = `<section class="section systems" id="systems" aria-labelledby="systems-title">
  <div class="wrap">
    <div class="section-head">
      <p class="eyebrow">${esc(t.systems.eyebrow)}</p>
      <h2 id="systems-title">${esc(t.systems.title)}</h2>
      <p class="lead">${t.systems.lead.replace('{count}', String(SYSTEM_COUNT))}</p>
    </div>
    <div class="system-groups">
      ${SYSTEM_GROUPS.map(
        (g) => `<div class="system-group reveal">
        <h3 class="overline">${esc(t.systems.groups[g.key as keyof typeof t.systems.groups])}<span class="count">${g.systems.length}</span></h3>
        <ul class="chips">${g.systems.map((s) => `<li class="chip">${esc(s)}</li>`).join('')}</ul>
      </div>`,
      ).join('')}
    </div>
    <p class="notice">${icon('shield')}<span>${esc(t.systems.disclaimer)}</span></p>
  </div>
</section>`;

  /* ── Gallery ── */
  const gallery = `<section class="section gallery" id="gallery" aria-labelledby="gallery-title">
  <div class="wrap">
    <div class="section-head">
      <p class="eyebrow">${esc(t.gallery.eyebrow)}</p>
      <h2 id="gallery-title">${esc(t.gallery.title)}</h2>
    </div>
    <ul class="gallery-grid">
      ${t.gallery.items
        .map(
          (g, i) => `<li class="gallery-item reveal${g.portrait ? ' is-portrait' : ''}${i === 0 ? ' is-wide' : ''}">
        <a href="/img/${SHOTS[g.shot].name}-${g.portrait ? 800 : 1600}.webp" class="gallery-link" data-lightbox data-caption="${esc(g.cap)}" aria-label="${esc(t.a11y.openImage)}: ${esc(g.cap)}">
          ${picture(g.shot, g.alt, g.portrait ? '(min-width: 900px) 22vw, 60vw' : i === 0 ? '(min-width: 900px) 64vw, 92vw' : '(min-width: 900px) 32vw, 92vw')}
        </a>
        <p class="gallery-cap">${esc(g.cap)}</p>
      </li>`,
        )
        .join('')}
    </ul>
    <p class="fine">${esc(t.gallery.note)}</p>
  </div>
  <dialog class="lightbox" data-lightbox-dialog aria-label="${esc(t.gallery.title)}">
    <figure><img alt="" data-lightbox-img><figcaption data-lightbox-cap></figcaption></figure>
    <button type="button" class="lb-btn lb-close" data-lb-close aria-label="${esc(t.a11y.close)}">${icon('close')}</button>
    <button type="button" class="lb-btn lb-prev" data-lb-prev aria-label="${esc(t.a11y.prev)}">${icon('chevronL')}</button>
    <button type="button" class="lb-btn lb-next" data-lb-next aria-label="${esc(t.a11y.next)}">${icon('chevronR')}</button>
  </dialog>
</section>`;

  /* ── Download ── */
  const d = t.download;
  const sha = asset?.digest?.replace(/^sha256:/, '') ?? '';
  const download = `<section class="section download" id="download" aria-labelledby="download-title">
  <div class="wrap">
    <div class="section-head center">
      <p class="eyebrow">${esc(d.eyebrow)}</p>
      <h2 id="download-title">${esc(d.title)}</h2>
      <p class="lead">${esc(d.lead)}</p>
    </div>
    <div class="dl-card" data-dl-card data-state="${rel ? 'ready' : 'empty'}">
      <div class="dl-main">
        <div class="dl-head">
          <img src="/img/app-icon-256.webp" width="72" height="72" alt="" loading="lazy">
          <div>
            <p class="dl-name">Elyndra <span data-dl-version>${esc(rel?.tag ?? '')}</span> ${badge}</p>
            <p class="dl-date" data-dl-date>${rel ? esc(`${d.published} ${fmtDate(rel.publishedAt, lang)}`) : ''}</p>
          </div>
        </div>
        <dl class="dl-facts">
          <div><dt>${esc(d.file)}</dt><dd data-dl-file>${esc(asset?.name ?? '—')}</dd></div>
          <div><dt>${esc(d.size)}</dt><dd data-dl-size>${asset ? esc(fmtSize(asset.size, t.runtime.mb, lang)) : '—'}</dd></div>
          <div class="dl-sha-row"><dt>${esc(d.sha)}</dt><dd><code class="sha" data-dl-sha>${esc(sha || d.shaMissing)}</code>
            <button type="button" class="copy-btn" data-copy-sha aria-label="${esc(t.a11y.copy)} SHA-256" hidden>${icon('copy')}</button></dd></div>
        </dl>
        <div class="dl-actions">
          <a class="btn btn-primary btn-xl" href="${RELEASES_URL}" data-dl-button data-sfx="confirm">
            <kbd class="glyph glyph-a pad-only" aria-hidden="true">A</kbd>${icon('download')}
            <span class="btn-text"><span data-dl-button-label>${esc(d.button)}</span><span class="btn-meta" data-dl-abi>${asset ? esc(assetAbi(asset.name) === 'arm64-v8a' ? d.arm64 : d.universal) : ''}</span></span>
          </a>
          <p class="dl-hint" data-dl-hint></p>
        </div>
        <div class="dl-others" data-dl-others hidden>
          <p class="overline">${esc(d.otherFiles)}</p>
          <ul data-dl-other-list></ul>
        </div>
        <p class="dl-status" data-dl-status role="status" aria-live="polite">${rel ? '' : esc(d.noRelease)}</p>
        <p class="dl-links"><a href="${rel?.htmlUrl ?? RELEASES_URL}" data-dl-notes>${esc(d.notes)}</a><span aria-hidden="true">·</span><a href="${RELEASES_URL}">${esc(d.allReleases)}</a></p>
      </div>
      <aside class="dl-qr" data-dl-qr hidden>
        <p class="dl-qr-title">${icon('phone')}${esc(d.desktopTitle)}</p>
        <div class="qr" data-qr role="img" aria-label="${esc(d.qrAlt)}"></div>
        <p class="dl-qr-body">${esc(d.desktopBody)}</p>
      </aside>
    </div>
  </div>
</section>`;

  /* ── Install + verify ── */
  const ins = t.install;
  const install = `<section class="section install" id="install" aria-labelledby="install-title">
  <div class="wrap">
    <div class="section-head">
      <p class="eyebrow">${esc(ins.eyebrow)}</p>
      <h2 id="install-title">${esc(ins.title)}</h2>
    </div>
    <ol class="steps">
      ${ins.steps.map((s, i) => `<li class="step reveal"><span class="step-num" aria-hidden="true">${i + 1}</span><h3>${esc(s.t)}</h3><p>${s.d}</p></li>`).join('')}
    </ol>
    <div class="verify reveal">
      <h3>${icon('shield')}${esc(ins.verifyTitle)}</h3>
      <p>${esc(ins.verifyBody)}</p>
      <div class="verify-cmds">
        <p><span class="os">Windows</span><code>certutil -hashfile <span data-verify-file>${esc(asset?.name ?? 'Elyndra.apk')}</span> SHA256</code></p>
        <p><span class="os">macOS</span><code>shasum -a 256 <span data-verify-file>${esc(asset?.name ?? 'Elyndra.apk')}</span></code></p>
        <p><span class="os">Linux</span><code>sha256sum <span data-verify-file>${esc(asset?.name ?? 'Elyndra.apk')}</span></code></p>
      </div>
      <p class="fine">${esc(ins.verifyAuto)}</p>
    </div>
  </div>
</section>`;

  /* ── Updates ── */
  const up = t.updates;
  const updates = `<section class="section updates" id="updates" aria-labelledby="updates-title">
  <div class="wrap updates-grid">
    <div>
      <p class="eyebrow">${esc(up.eyebrow)}</p>
      <h2 id="updates-title">${esc(up.title)}</h2>
      <p class="lead">${up.body}</p>
    </div>
    <ul class="check-list">${up.points.map((p) => `<li class="reveal">${icon('check')}<span>${p}</span></li>`).join('')}</ul>
  </div>
</section>`;

  /* ── FAQ ── */
  const faq = `<section class="section faq" id="faq" aria-labelledby="faq-title">
  <div class="wrap faq-wrap">
    <div class="section-head">
      <p class="eyebrow">${esc(t.faq.eyebrow)}</p>
      <h2 id="faq-title">${esc(t.faq.title)}</h2>
    </div>
    <div class="faq-list">
      ${t.faq.items.map((f) => `<details class="faq-item"><summary><span>${esc(f.q)}</span>${icon('chevronD')}</summary><div class="faq-a"><p>${f.a}</p></div></details>`).join('')}
    </div>
  </div>
</section>`;

  /* ── Privacy teaser ── */
  const pt = t.privacyTeaser;
  const privacy = `<section class="section privacy-teaser" id="privacy" aria-labelledby="privacy-title">
  <div class="wrap">
    <div class="privacy-card reveal">
      ${icon('shield', 'ico ico-xl')}
      <div>
        <p class="eyebrow">${esc(pt.eyebrow)}</p>
        <h2 id="privacy-title">${esc(pt.title)}</h2>
        <p>${esc(pt.body)}</p>
        <a class="btn btn-ghost" href="${pagePath(ctx.locale, 'privacy')}"><span>${esc(pt.link)}</span>${icon('arrow')}</a>
      </div>
    </div>
  </div>
</section>`;

  return hero + features + masha + systems + gallery + download + install + updates + faq + privacy;
}
