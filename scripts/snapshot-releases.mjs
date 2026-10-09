// Saves Elyndra's public GitHub release list to public/data/releases.json.
//
// The site reads GitHub live in the visitor's browser; this snapshot is the fallback when
// the API can't be reached (unauthenticated rate limit: 60 requests per hour per IP) and
// what the pages show before JavaScript runs. It never fails the build: if the network is
// blocked, the previous snapshot is kept (or an empty one is written) and a warning is printed.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';

const API = 'https://api.github.com/repos/jefer02/Elyndra/releases?per_page=15';
const OUT = 'public/data/releases.json';

function trim(r) {
  return {
    tag: String(r.tag_name ?? ''),
    name: String(r.name || r.tag_name || ''),
    prerelease: Boolean(r.prerelease),
    draft: Boolean(r.draft),
    publishedAt: String(r.published_at ?? r.created_at ?? ''),
    htmlUrl: String(r.html_url ?? 'https://github.com/jefer02/Elyndra/releases'),
    assets: (Array.isArray(r.assets) ? r.assets : [])
      .filter((a) => typeof a?.name === 'string' && /\.apk$/i.test(a.name))
      .map((a) => ({
        name: a.name,
        size: Number(a.size) || 0,
        digest: typeof a.digest === 'string' ? a.digest : null,
        url: String(a.browser_download_url ?? ''),
      })),
  };
}

mkdirSync('public/data', { recursive: true });

try {
  const res = await fetch(API, {
    headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'elyndra-website-build' },
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`GitHub answered ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data)) throw new Error('unexpected response');
  const releases = data.map(trim).filter((r) => !r.draft);
  writeFileSync(OUT, JSON.stringify({ fetchedAt: new Date().toISOString(), releases }, null, 2) + '\n');
  const latest = releases[0];
  console.log(`[snapshot] ${releases.length} release(s) saved${latest ? `, newest ${latest.tag}` : ''}.`);
} catch (err) {
  const kept = existsSync(OUT);
  if (!kept) writeFileSync(OUT, JSON.stringify({ fetchedAt: null, releases: [] }, null, 2) + '\n');
  console.warn(
    `[snapshot] WARNING: could not reach the GitHub API (${err?.message ?? err}). ` +
      (kept ? 'Keeping the previous snapshot.' : 'Wrote an empty snapshot; the site will link to GitHub Releases.'),
  );
  if (kept) {
    try {
      const prev = JSON.parse(readFileSync(OUT, 'utf8'));
      console.warn(`[snapshot] Previous snapshot is from ${prev.fetchedAt ?? 'unknown date'}.`);
    } catch {
      /* unreadable snapshot: the runtime falls back to the Releases link */
    }
  }
}
