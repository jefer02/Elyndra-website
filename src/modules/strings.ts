// Locale strings the build inlined into the page (#runtime-strings).
import type { Dict } from '../i18n/en';

export interface RuntimeStrings {
  lang: string;
  privacyPath: string;
  a11y: Dict['a11y'];
  download: Dict['download'];
  masha: { loading3d: string; failed3d: string; canvasLabel: string };
  features: { counterLabel: string };
  mb: string;
  ctaDesktop: string;
}

let cached: RuntimeStrings | null = null;

export function strings(): RuntimeStrings {
  if (cached) return cached;
  const el = document.getElementById('runtime-strings');
  cached = JSON.parse(el?.textContent || '{}') as RuntimeStrings;
  return cached;
}

export const fmt = (s: string, vars: Record<string, string | number>) =>
  s.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
