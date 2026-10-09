// Line icons drawn for this site (24×24, 1.75 stroke, round caps), in the spirit of the
// app's ConsoleGlyph set. No third-party icon fonts or brand marks.

const wrap = (body: string, cls = 'ico') =>
  `<svg class="${cls}" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`;

const paths: Record<string, string> = {
  library: '<rect x="3" y="4" width="5" height="16" rx="1.5"/><rect x="10" y="4" width="5" height="16" rx="1.5"/><path d="m17.2 5.2 3.3 14"/>',
  layouts: '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M9 4v16"/><circle cx="6" cy="12" r="1.2"/><path d="M12 15h6M12 18h4"/>',
  gamepad: '<path d="M7.5 7h9a5 5 0 0 1 4.8 6.4l-1.1 3.7a2.4 2.4 0 0 1-4.1.9L14 16h-4l-2.1 2a2.4 2.4 0 0 1-4.1-.9l-1.1-3.7A5 5 0 0 1 7.5 7Z"/><path d="M8 10.5v3M6.5 12h3"/><circle cx="15.5" cy="11" r=".6" fill="currentColor"/><circle cx="17.3" cy="12.8" r=".6" fill="currentColor"/>',
  chip: '<rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9.5" y="9.5" width="5" height="5" rx="1"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3"/>',
  folder: '<path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H9l2 2.2h7.5A2.5 2.5 0 0 1 21 9.7v7.8a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5Z"/><path d="M8 14h8"/>',
  metadata: '<rect x="3" y="4" width="11" height="16" rx="2"/><path d="m3 15 3.5-3.5 3 3L14 10"/><path d="M17 7h4M17 11h4M17 15h3"/>',
  translate: '<path d="M4 6h9M8.5 4v2c0 4-2 7-4.5 8.5"/><path d="M6 10c1 2 3 3.6 5 4.4"/><path d="m13 20 3.8-9 3.8 9M14.4 17h4.8"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  drop: '<path d="M12 3.5s6 6.2 6 10.3a6 6 0 0 1-12 0C6 9.7 12 3.5 12 3.5Z"/><path d="M9.2 14.5a2.9 2.9 0 0 0 2.6 2.4"/>',
  widget: '<rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="17" height="7" rx="2"/>',
  globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.4 2.4 3.4 5.3 3.4 8.5s-1 6.1-3.4 8.5c-2.4-2.4-3.4-5.3-3.4-8.5s1-6.1 3.4-8.5Z"/>',
  update: '<path d="M7 18.5a4.5 4.5 0 0 1-.6-9 6 6 0 0 1 11.5 1.6A3.8 3.8 0 0 1 17.5 18.5"/><path d="M12 12v8M9 17l3 3 3-3"/>',
  download: '<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5"/><path d="M5 19.5h14"/>',
  code: '<path d="m8 7-5 5 5 5M16 7l5 5-5 5M13.5 4.5l-3 15"/>',
  soundOn: '<path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4Z"/><path d="M15.5 9a4.2 4.2 0 0 1 0 6M18.2 6.5a8 8 0 0 1 0 11"/>',
  soundOff: '<path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4Z"/><path d="m16 9.5 5 5M21 9.5l-5 5"/>',
  copy: '<rect x="8.5" y="8.5" width="11" height="11" rx="2.2"/><path d="M15.5 5.5A2 2 0 0 0 13.5 4H6a2 2 0 0 0-2 2v7.5a2 2 0 0 0 1.5 1.9"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  external: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14.5V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3.5"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  chevronL: '<path d="m14.5 6-6 6 6 6"/>',
  chevronR: '<path d="m9.5 6 6 6-6 6"/>',
  chevronD: '<path d="m6 9.5 6 6 6-6"/>',
  shield: '<path d="M12 3.5 5 6v5.5c0 4.3 3 7.6 7 9 4-1.4 7-4.7 7-9V6Z"/><path d="m9 12 2.2 2.2L15.5 10"/>',
  spark: '<path d="M12 3.5c.6 4.2 2.3 5.9 6.5 6.5-4.2.6-5.9 2.3-6.5 6.5-.6-4.2-2.3-5.9-6.5-6.5 4.2-.6 5.9-2.3 6.5-6.5Z"/><path d="M18.5 15.5c.3 1.6.9 2.2 2.5 2.5-1.6.3-2.2.9-2.5 2.5-.3-1.6-.9-2.2-2.5-2.5 1.6-.3 2.2-.9 2.5-2.5Z"/>',
  phone: '<rect x="6.5" y="2.5" width="11" height="19" rx="2.5"/><path d="M10.5 18.5h3"/>',
};

export function icon(name: keyof typeof paths | string, cls?: string): string {
  return wrap(paths[name] ?? paths.spark, cls);
}

/** Feature id → icon. */
export const FEATURE_ICONS: Record<string, string> = {
  library: 'library',
  layouts: 'layouts',
  gamepad: 'gamepad',
  emulators: 'chip',
  folders: 'folder',
  metadata: 'metadata',
  translate: 'translate',
  playtime: 'clock',
  look: 'drop',
  widget: 'widget',
  languages: 'globe',
  updates: 'update',
};
