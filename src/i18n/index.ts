// Locale registry. To add a language (pt, fr, de, ja):
//   1. copy es.ts to xx.ts and translate it (TypeScript flags missing keys);
//   2. add it to LOCALES below;
//   3. create the page stubs xx/index.html and xx/privacy/index.html (copy the es/ ones).
// Japanese also needs a font with Japanese glyphs (the self-hosted Poppins subset is Latin only).
import en, { type Dict } from './en.ts';
import es from './es.ts';

export type { Dict };

export interface Locale {
  code: string;
  /** Path prefix: '' for the default locale, '/es' for Spanish. */
  prefix: string;
  /** Name in its own language, for the switcher. */
  label: string;
  dict: Dict;
}

export const LOCALES: Locale[] = [
  { code: 'en', prefix: '', label: 'English', dict: en },
  { code: 'es', prefix: '/es', label: 'Español', dict: es },
];

export const DEFAULT_LOCALE = LOCALES[0];

export function localeByCode(code: string): Locale {
  return LOCALES.find((l) => l.code === code) ?? DEFAULT_LOCALE;
}
