// Signature palette switcher (a radio group). The inline boot script restores the saved one before paint.
import { $$, store } from './env';
import { sfx } from './sound';

const KEY = 'elyndra.palette';

export function currentPalette(): string {
  return document.documentElement.getAttribute('data-palette') || 'plasma';
}

function apply(id: string) {
  const root = document.documentElement;
  if (id === 'plasma') root.removeAttribute('data-palette');
  else root.setAttribute('data-palette', id);
  store(KEY, id === 'plasma' ? null : id);
  document.dispatchEvent(new CustomEvent('palettechange', { detail: id }));
}

export function initPalette() {
  const swatches = $$<HTMLButtonElement>('button[data-palette]');
  if (!swatches.length) return;
  const sync = () => {
    const cur = currentPalette();
    swatches.forEach((b) => {
      const on = b.dataset.palette === cur;
      b.setAttribute('aria-checked', String(on));
      b.tabIndex = on ? 0 : -1;
    });
  };
  swatches.forEach((b, i) => {
    b.disabled = false;
    b.addEventListener('click', () => {
      apply(b.dataset.palette!);
      sync();
      sfx('select');
    });
    b.addEventListener('keydown', (e) => {
      const d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      const next = swatches[(i + d + swatches.length) % swatches.length];
      next.focus();
      next.click();
    });
  });
  sync();
}
