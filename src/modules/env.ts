// Runtime facts about the visitor's device and preferences.

const mq = (q: string) => typeof matchMedia === 'function' && matchMedia(q).matches;

export const reducedMotion = (): boolean => mq('(prefers-reduced-motion: reduce)');

export const finePointer = (): boolean => mq('(hover: hover) and (pointer: fine)');

/** Save-Data, few cores or little memory: skip the heavy extras (shader quality, 3D autoload). */
export function lowPower(): boolean {
  const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
  if (nav.connection?.saveData) return true;
  if (typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 2) return true;
  if (typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency <= 2) return true;
  return false;
}

export const isAndroid = (): boolean => /Android/i.test(navigator.userAgent);

/** localStorage with every access guarded (private mode, blocked storage). */
export function store(key: string, value?: string | null): string | null {
  try {
    if (value === undefined) return localStorage.getItem(key);
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    /* storage blocked: preferences just aren't remembered */
  }
  return value ?? null;
}

export const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel);
export const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) =>
  Array.from(root.querySelectorAll<T>(sel));
