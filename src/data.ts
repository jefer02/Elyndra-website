// Facts shared by the build-time pages and the runtime code.

export const REPO = 'jefer02/Elyndra';
export const REPO_URL = `https://github.com/${REPO}`;
export const RELEASES_URL = `${REPO_URL}/releases`;
export const RELEASES_API = `https://api.github.com/repos/${REPO}/releases?per_page=15`;
export const AUTHOR_URL = 'https://github.com/jefer02';
export const LICENSE_URL = `${REPO_URL}/blob/main/LICENSE`;
export const NOTICES_URL = `${REPO_URL}/blob/main/THIRD_PARTY_NOTICES.md`;

/**
 * The systems the app recognizes (app/src/main/java/.../data/Systems.kt, 47 entries),
 * grouped by maker for display. Plain names only: no logos.
 */
export const SYSTEM_GROUPS: { key: string; systems: string[] }[] = [
  {
    key: 'nintendo',
    systems: [
      'Nintendo Switch', 'Nintendo Wii U', 'Nintendo Wii', 'Nintendo GameCube', 'Nintendo 3DS', 'Nintendo DS',
      'Nintendo 64', 'Super Nintendo', 'Nintendo Entertainment System', 'Famicom Disk System',
      'Game Boy Advance', 'Game Boy Color', 'Game Boy', 'Virtual Boy',
    ],
  },
  {
    key: 'sony',
    systems: ['PlayStation 4', 'PlayStation 3', 'PlayStation 2', 'PlayStation', 'PlayStation Portable', 'PlayStation Vita'],
  },
  { key: 'microsoft', systems: ['Xbox 360', 'Xbox'] },
  {
    key: 'sega',
    systems: [
      'Sega Dreamcast', 'Sega Saturn', 'Sega 32X', 'Mega-CD / Sega CD', 'Mega Drive / Genesis', 'Master System',
      'Game Gear', 'Sega SG-1000',
    ],
  },
  { key: 'snk', systems: ['Neo Geo', 'Neo Geo Pocket', 'Neo Geo Pocket Color'] },
  { key: 'nec', systems: ['PC Engine / TurboGrafx-16', 'PC Engine CD'] },
  { key: 'atari', systems: ['Atari 2600', 'Atari 7800', 'Atari Lynx', 'Atari Jaguar'] },
  { key: 'bandai', systems: ['WonderSwan', 'WonderSwan Color'] },
  {
    key: 'other',
    systems: ['Arcade', '3DO Interactive Multiplayer', 'MSX', 'Commodore 64', 'MS-DOS', 'PC (Windows)'],
  },
];

export const SYSTEM_COUNT = SYSTEM_GROUPS.reduce((n, g) => n + g.systems.length, 0);

/** The app's signature palettes (data/SignaturePalette.kt): primary, secondary, spark. */
export const PALETTES = [
  { id: 'plasma', p: '#7C5CFF', s: '#2BD9FF', k: '#FFF1C9' },
  { id: 'ember', p: '#FF8A1F', s: '#FF3D5A', k: '#FFE2B8' },
  { id: 'aurora', p: '#19E3A5', s: '#3AA8FF', k: '#E6FFF6' },
  { id: 'neon_rose', p: '#FF4FA3', s: '#B15CFF', k: '#FFE6F3' },
  { id: 'solar', p: '#E9B44C', s: '#F3CE7A', k: '#FFF1D6' },
] as const;

export type PaletteId = (typeof PALETTES)[number]['id'];

/** Screenshot base names in public/img (-800/-1600 or -400/-800 for portrait). */
export interface Shot {
  name: string;
  w: number;
  h: number;
  portrait?: boolean;
}

export const SHOTS: Record<string, Shot> = {
  'meridian-library': { name: 'meridian-library', w: 1586, h: 956 },
  'meridian-add': { name: 'meridian-add', w: 1586, h: 956 },
  intro: { name: 'intro', w: 1586, h: 956 },
  'settings-display': { name: 'settings-display', w: 1586, h: 956 },
  'settings-palettes': { name: 'settings-palettes', w: 1586, h: 956 },
  masha: { name: 'masha', w: 1586, h: 956 },
  'game-details': { name: 'game-details', w: 1586, h: 956 },
  'add-rom-folder': { name: 'add-rom-folder', w: 1586, h: 956 },
  'settings-appearance': { name: 'settings-appearance', w: 1586, h: 956 },
  'settings-updates-about': { name: 'settings-updates-about', w: 1586, h: 956 },
  'portrait-library': { name: 'portrait-library', w: 786, h: 1264, portrait: true },
};

/** A trimmed GitHub release, as stored in public/data/releases.json and in the session cache. */
export interface ReleaseAsset {
  name: string;
  size: number;
  digest: string | null;
  url: string;
}

export interface Release {
  tag: string;
  name: string;
  prerelease: boolean;
  draft: boolean;
  publishedAt: string;
  htmlUrl: string;
  assets: ReleaseAsset[];
}

export interface ReleaseSnapshot {
  fetchedAt: string | null;
  releases: Release[];
}

export function trimRelease(r: any): Release {
  return {
    tag: String(r.tag_name ?? ''),
    name: String(r.name || r.tag_name || ''),
    prerelease: Boolean(r.prerelease),
    draft: Boolean(r.draft),
    publishedAt: String(r.published_at ?? r.created_at ?? ''),
    htmlUrl: String(r.html_url ?? RELEASES_URL),
    assets: (Array.isArray(r.assets) ? r.assets : [])
      .filter((a: any) => typeof a?.name === 'string' && /\.apk$/i.test(a.name))
      .map((a: any) => ({
        name: a.name,
        size: Number(a.size) || 0,
        digest: typeof a.digest === 'string' ? a.digest : null,
        url: String(a.browser_download_url ?? ''),
      })),
  };
}

/** Newest published release, pre-releases included (drafts never appear for anonymous users, but skip them anyway). */
export function latestRelease(list: Release[]): Release | null {
  const usable = list.filter((r) => !r.draft && r.assets.length > 0);
  usable.sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
  return usable[0] ?? null;
}

/** ABI token in an asset name, using the same tokens as the in-app updater (docs/RELEASING.md). */
export function assetAbi(name: string): 'arm64-v8a' | 'armeabi-v7a' | 'x86_64' | 'x86' | 'universal' | null {
  const n = name.toLowerCase();
  if (/(^|[^a-z0-9])(arm64-v8a|arm64|aarch64)([^a-z0-9]|$)/.test(n)) return 'arm64-v8a';
  if (/(^|[^a-z0-9])(armeabi-v7a|armv7)([^a-z0-9]|$)/.test(n)) return 'armeabi-v7a';
  if (/(^|[^a-z0-9])x86_64([^a-z0-9]|$)/.test(n)) return 'x86_64';
  if (/(^|[^a-z0-9])x86([^a-z0-9_]|$)/.test(n)) return 'x86';
  if (/(^|[^a-z0-9])universal([^a-z0-9]|$)/.test(n)) return 'universal';
  return null;
}

/**
 * The asset to offer. `deviceAbi` is what the browser could tell (null when unknown).
 * Known ABI: its own build, else universal. Unknown: universal (works everywhere), else arm64.
 */
export function pickAsset(rel: Release, deviceAbi: string | null): ReleaseAsset | null {
  const by = (abi: string) => rel.assets.find((a) => assetAbi(a.name) === abi) ?? null;
  if (deviceAbi) {
    const own = by(deviceAbi);
    if (own) return own;
  }
  return by('universal') ?? by('arm64-v8a') ?? rel.assets[0] ?? null;
}
