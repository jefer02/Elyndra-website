// Download system. The APK always comes from GitHub Releases; this site never hosts it.
//
//   1. Session cache (15 min) → 2. live GitHub API → 3. build-time snapshot (/data/releases.json)
//   → 4. the static link to the Releases page that is already in the HTML (works without JS).
//
// Newest non-draft release, pre-releases included (Beta badge). On Android the button downloads
// the APK for the device's ABI when the browser can tell it, else the universal build. On desktop
// a QR code opens this page on the phone, and a direct link is still offered.
import {
  RELEASES_API,
  RELEASES_URL,
  assetAbi,
  latestRelease,
  pickAsset,
  trimRelease,
  type Release,
  type ReleaseAsset,
  type ReleaseSnapshot,
} from '../data';
import { $, $$, isAndroid } from './env';
import { strings } from './strings';

const CACHE_KEY = 'elyndra.releases.v1';
const CACHE_MS = 15 * 60 * 1000;

type Source = 'cache' | 'live' | 'snapshot';

async function fetchJson(url: string, ms: number, headers: Record<string, string> = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { headers, signal: ctrl.signal, cache: 'no-store' });
    if (!res.ok) throw new Error(String(res.status));
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

async function loadReleases(): Promise<{ releases: Release[]; source: Source } | null> {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (raw) {
      const c = JSON.parse(raw) as { t: number; releases: Release[] };
      if (Date.now() - c.t < CACHE_MS && Array.isArray(c.releases)) return { releases: c.releases, source: 'cache' };
    }
  } catch {
    /* no cache */
  }
  try {
    const data = await fetchJson(RELEASES_API, 7000, { Accept: 'application/vnd.github+json' });
    if (!Array.isArray(data)) throw new Error('shape');
    const releases = data.map(trimRelease).filter((r) => !r.draft);
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), releases }));
    } catch {
      /* storage full or blocked */
    }
    return { releases, source: 'live' };
  } catch {
    // Rate limited (403/429), offline or blocked: fall back to the snapshot saved at build time.
  }
  try {
    const snap = (await fetchJson('/data/releases.json', 5000)) as ReleaseSnapshot;
    if (Array.isArray(snap.releases)) return { releases: snap.releases, source: 'snapshot' };
  } catch {
    /* nothing else to try */
  }
  return null;
}

/** What the browser can tell about the CPU. Null when unknown (most browsers don't say). */
async function deviceAbi(): Promise<string | null> {
  const uad = (navigator as Navigator & {
    userAgentData?: { getHighEntropyValues?: (h: string[]) => Promise<{ architecture?: string; bitness?: string }> };
  }).userAgentData;
  if (uad?.getHighEntropyValues) {
    try {
      const v = await uad.getHighEntropyValues(['architecture', 'bitness']);
      const arch = (v.architecture || '').toLowerCase();
      const bits = v.bitness || '';
      if (arch === 'arm' && bits === '64') return 'arm64-v8a';
      if (arch === 'arm' && bits === '32') return 'armeabi-v7a';
      if (arch === 'x86' && bits === '64') return 'x86_64';
      if (arch === 'x86' && bits === '32') return 'x86';
    } catch {
      /* not allowed */
    }
  }
  const ua = navigator.userAgent.toLowerCase();
  if (/aarch64|arm64|armv8/.test(ua)) return 'arm64-v8a';
  return null;
}

const shaOf = (a: ReleaseAsset) => a.digest?.replace(/^sha256:/i, '') ?? '';

export function initDownload() {
  const card = $('[data-dl-card]');
  const heroBtn = $<HTMLAnchorElement>('[data-dl-primary]');
  const navBtn = $<HTMLAnchorElement>('[data-nav-download]');
  if (!card && !heroBtn) return;
  const t = strings().download;
  const lang = strings().lang;
  const android = isAndroid();
  const mb = (b: number) => `${new Intl.NumberFormat(lang, { maximumFractionDigits: 0 }).format(b / 1048576)} ${strings().mb}`;
  const date = (iso: string) => {
    const d = new Date(iso);
    return isNaN(+d) ? '' : new Intl.DateTimeFormat(lang, { year: 'numeric', month: 'long', day: 'numeric' }).format(d);
  };

  // Off Android the hero button scrolls to the download card (QR); it stays a real link to the card.
  if (!android && heroBtn) {
    heroBtn.href = '#download';
    const label = heroBtn.querySelector('[data-dl-label]');
    if (label && strings().ctaDesktop) label.textContent = strings().ctaDesktop;
  }

  if (card && !android) showQr(card);

  // Copy SHA-256
  const copyBtn = $<HTMLButtonElement>('[data-copy-sha]');
  if (copyBtn && navigator.clipboard) {
    copyBtn.hidden = false;
    copyBtn.addEventListener('click', async () => {
      const sha = $('[data-dl-sha]')?.textContent?.trim() ?? '';
      if (!/^[0-9a-f]{64}$/i.test(sha)) return;
      try {
        await navigator.clipboard.writeText(sha);
        copyBtn.classList.add('is-done');
        copyBtn.setAttribute('aria-label', strings().a11y.copied);
        setTimeout(() => {
          copyBtn.classList.remove('is-done');
          copyBtn.setAttribute('aria-label', `${strings().a11y.copy} SHA-256`);
        }, 1800);
      } catch {
        /* clipboard refused */
      }
    });
  }

  const status = $('[data-dl-status]');
  const setStatus = (s: string) => {
    if (status) status.textContent = s;
  };

  void (async () => {
    const [res, abi] = await Promise.all([loadReleases(), android ? deviceAbi() : Promise.resolve(null)]);
    if (!res) {
      setStatus(t.failed);
      return;
    }
    const rel = latestRelease(res.releases);
    if (!rel) {
      setStatus(t.noRelease);
      return;
    }
    setStatus(res.source === 'snapshot' ? t.fromSnapshot : '');
    const asset = pickAsset(rel, abi);
    render(rel, asset, abi);
  })();

  function render(rel: Release, asset: ReleaseAsset | null, abi: string | null) {
    const badgeText = rel.prerelease ? t.beta : t.stable;
    $$('[data-dl-badge]').forEach((b) => {
      b.hidden = false;
      b.textContent = badgeText;
      b.className = `badge ${rel.prerelease ? 'badge-beta' : 'badge-stable'}`;
    });
    const set = (sel: string, text: string) => $$(sel).forEach((e) => (e.textContent = text));
    set('[data-dl-version]', rel.tag);
    set('[data-dl-date]', `${t.published} ${date(rel.publishedAt)}`);
    const notes = $<HTMLAnchorElement>('[data-dl-notes]');
    if (notes) notes.href = rel.htmlUrl || RELEASES_URL;
    if (!asset) return;

    const kind = assetAbi(asset.name);
    set('[data-dl-file]', asset.name);
    set('[data-verify-file]', asset.name);
    set('[data-dl-size]', mb(asset.size));
    set('[data-dl-sha]', shaOf(asset) || t.shaMissing);
    const copy = $('[data-copy-sha]');
    if (copy && !shaOf(asset)) copy.hidden = true;
    set('[data-dl-abi]', kind === 'arm64-v8a' ? t.arm64 : kind === 'universal' ? t.universal : kind ?? '');
    set('[data-dl-meta]', `${rel.tag} · ${mb(asset.size)}`);

    const dlBtn = $<HTMLAnchorElement>('[data-dl-button]');
    if (dlBtn) {
      dlBtn.href = asset.url;
      // GitHub serves the file with its own name; the attribute is a hint only (cross-origin).
      dlBtn.setAttribute('download', asset.name);
    }
    if (android && heroBtn) heroBtn.href = asset.url;
    if (android && navBtn) navBtn.href = '#download';

    const hint = $('[data-dl-hint]');
    if (hint && android) {
      const hasArm64 = rel.assets.some((a) => assetAbi(a.name) === 'arm64-v8a');
      hint.textContent =
        abi && assetAbi(asset.name) === abi ? t.detected : kind === 'universal' && !abi && hasArm64 ? t.pickedUniversal : '';
    }

    // The other APKs of the release, with size and checksum, for anyone who wants a specific build.
    const others = rel.assets.filter((a) => a !== asset);
    const box = $('[data-dl-others]');
    const ul = $('[data-dl-other-list]');
    if (box && ul && others.length) {
      ul.replaceChildren(
        ...others.map((a) => {
          const li = document.createElement('li');
          const link = document.createElement('a');
          link.href = a.url;
          link.textContent = a.name;
          const small = document.createElement('small');
          small.textContent = `${mb(a.size)}${shaOf(a) ? ` · SHA-256 ${shaOf(a).slice(0, 12)}…` : ''}`;
          li.append(link, small);
          return li;
        }),
      );
      box.hidden = false;
    }
  }
}

async function showQr(card: HTMLElement) {
  const box = $('[data-dl-qr]', card);
  const target = $('[data-qr]', card);
  if (!box || !target) return;
  try {
    const { renderSVG } = await import('uqr');
    const url = new URL(location.href);
    url.hash = 'download';
    url.search = '';
    target.innerHTML = renderSVG(url.toString(), { ecc: 'M', border: 1, pixelSize: 6, whiteColor: '#ffffff', blackColor: '#0d0f16' });
    box.hidden = false;
  } catch {
    /* no QR: the direct link is still there */
  }
}
