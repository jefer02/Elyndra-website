// Controller support through the Gamepad API, in the spirit of the app's PadHints and LibraryFocus:
//   D-pad / left stick  move the focus (up/down = previous/next control; inside the features wheel it turns it)
//   LB / RB             previous / next section
//   A                   activate the focused control (or download, when nothing is focused)
//   B                   close the lightbox, or go back to the top
// It only polls while a controller is connected. Uses the standard mapping (buttons 0,1,4,5,12-15).
import { $, $$ } from './env';
import { sfx } from './sound';

const SECTIONS = ['top', 'features', 'masha', 'systems', 'gallery', 'download', 'install', 'faq'];

const FOCUSABLE =
  'a[href], button:not([disabled]):not([hidden]), summary, [tabindex="0"], input, select, textarea';

function visibleFocusables(): HTMLElement[] {
  return $$<HTMLElement>(FOCUSABLE).filter((el) => {
    if (el.closest('[hidden], [inert]')) return false;
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return false;
    const cs = getComputedStyle(el);
    return cs.visibility !== 'hidden' && cs.display !== 'none';
  });
}

function currentSection(): number {
  const mid = window.innerHeight * 0.4;
  let best = 0;
  SECTIONS.forEach((id, i) => {
    const el = document.getElementById(id);
    if (el && el.getBoundingClientRect().top <= mid) best = i;
  });
  return best;
}

function goSection(delta: number) {
  const i = Math.min(Math.max(currentSection() + delta, 0), SECTIONS.length - 1);
  const el = document.getElementById(SECTIONS[i]);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const target = el.querySelector<HTMLElement>('h1, h2') ?? el;
  if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
  target.focus({ preventScroll: true });
  sfx('move');
}

function moveFocus(dir: 1 | -1, horizontal: boolean) {
  const active = document.activeElement as HTMLElement | null;
  // Let widgets with their own arrow keys (wheel rows, palette radios, lightbox) handle it.
  if (active && active !== document.body && active.matches('.feature, [role="radio"], dialog *')) {
    const key = horizontal ? (dir > 0 ? 'ArrowRight' : 'ArrowLeft') : dir > 0 ? 'ArrowDown' : 'ArrowUp';
    active.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
    sfx('move');
    return;
  }
  const list = visibleFocusables();
  if (!list.length) return;
  let next: HTMLElement | undefined;
  const i = active ? list.indexOf(active) : -1;
  if (i !== -1) {
    next = list[Math.min(Math.max(i + dir, 0), list.length - 1)];
  } else if (active && active !== document.body) {
    // Focus is on something that isn't a control (a section heading after LB/RB): take the
    // nearest control after it (or before it, going up) in document order.
    const after = (el: HTMLElement) => !!(active.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING);
    next = dir > 0 ? list.find(after) : [...list].reverse().find((el) => !after(el));
  } else {
    // Nothing focused: start from the first control on screen.
    next = list.find((el) => el.getBoundingClientRect().top >= 0);
  }
  if (!next) return;
  next.focus();
  next.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  sfx('move');
}

export function initGamepad() {
  if (!('getGamepads' in navigator)) return;
  const hints = $('[data-pad-hints]');
  let raf = 0;
  const prev = new Map<number, boolean[]>();
  const repeatAt = new Map<string, number>();

  const press = (key: string, now: number, down: boolean, first: boolean) => {
    if (!down) {
      repeatAt.delete(key);
      return false;
    }
    if (first) {
      repeatAt.set(key, now + 380);
      return true;
    }
    const at = repeatAt.get(key) ?? 0;
    if (now >= at) {
      repeatAt.set(key, now + 110);
      return true;
    }
    return false;
  };

  const loop = (now: number) => {
    raf = 0;
    const pads = navigator.getGamepads().filter(Boolean) as Gamepad[];
    if (!pads.length) return;
    for (const gp of pads) {
      const b = gp.buttons.map((x) => x.pressed);
      const ax = gp.axes[0] ?? 0;
      const ay = gp.axes[1] ?? 0;
      const down = b[13] || ay > 0.6;
      const up = b[12] || ay < -0.6;
      const right = b[15] || ax > 0.6;
      const left = b[14] || ax < -0.6;
      const was = prev.get(gp.index) ?? [];
      const edge = (i: number) => b[i] && !was[i];
      const wasDir = (was as boolean[] & { dirs?: boolean[] }).dirs ?? [false, false, false, false];

      if (press(`${gp.index}d`, now, down, down && !wasDir[0])) moveFocus(1, false);
      if (press(`${gp.index}u`, now, up, up && !wasDir[1])) moveFocus(-1, false);
      if (press(`${gp.index}r`, now, right, right && !wasDir[2])) moveFocus(1, true);
      if (press(`${gp.index}l`, now, left, left && !wasDir[3])) moveFocus(-1, true);
      if (edge(5)) goSection(1);
      if (edge(4)) goSection(-1);
      if (edge(0)) {
        const active = document.activeElement as HTMLElement | null;
        if (active && active !== document.body && active.matches(FOCUSABLE)) {
          active.click();
        } else {
          const dl = $<HTMLAnchorElement>('[data-dl-primary]') ?? $<HTMLAnchorElement>('[data-nav-download]');
          dl?.focus();
          dl?.click();
        }
      }
      if (edge(1)) {
        const dialog = $<HTMLDialogElement>('dialog[open]');
        if (dialog) dialog.close();
        else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          sfx('back');
        }
      }
      const snapshot = b as boolean[] & { dirs?: boolean[] };
      snapshot.dirs = [down, up, right, left];
      prev.set(gp.index, snapshot);
    }
    raf = requestAnimationFrame(loop);
  };

  const update = () => {
    const any = (navigator.getGamepads() as (Gamepad | null)[]).some(Boolean);
    document.documentElement.classList.toggle('has-pad', any);
    if (hints) hints.hidden = !any;
    if (any && !raf) raf = requestAnimationFrame(loop);
  };
  window.addEventListener('gamepadconnected', update);
  window.addEventListener('gamepaddisconnected', update);
}
