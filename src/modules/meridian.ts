// Features as the app's Meridian wheel (docs/UI_DESIGN.md §11): rows on a circle whose centre is
// off-screen to the left at the focus line, a depth table by row distance, an orbital dial with one
// tick per item and a lit node at the focus, a tabular counter, and the art of the focused item on
// the right. Scrolling turns the wheel (the stage is sticky). On narrow screens it becomes the
// Classic carousel, as the app does in portrait. Without JS it stays a plain grid of cards.
import { $, $$, reducedMotion } from './env';
import { sfx } from './sound';

/* Depth by row distance 0, ±1, ±2, ±3, ±4, interpolated (softer than the app's: these rows carry text).
   As in the app, only the focused row and its neighbours show text; farther rows are shapes. */
const SCALE = [1, 0.8, 0.66, 0.55, 0.46];
const ALPHA = [1, 1, 0.5, 0.26, 0];
const TURN = [0, 6, 12, 18, 18];
/** Cumulative distance from the focus line, in units of the wheel height. */
const OFFSET = [0, 0.235, 0.4, 0.52, 0.61];

function table(t: number[], d: number): number {
  const a = Math.min(Math.abs(d), t.length - 1);
  const i = Math.floor(a);
  const f = a - i;
  return i >= t.length - 1 ? t[t.length - 1] : t[i] + (t[i + 1] - t[i]) * f;
}

const SVG = 'http://www.w3.org/2000/svg';

export function initMeridian() {
  const host = $('[data-meridian]');
  if (!host) return;
  const list = $('[data-feature-list]', host)!;
  const rows = $$<HTMLLIElement>('.feature', list);
  const wheel = $('[data-wheel]', host)!;
  const dial = $<SVGSVGElement>('[data-dial]', host)!;
  const counter = $('[data-counter]', host)!;
  const shots = $$('.mer-shot', host);
  const n = rows.length;
  if (!n) return;

  const wide = matchMedia('(min-width: 1000px) and (min-height: 600px)');
  const still = reducedMotion();
  let mode: 'wheel' | 'classic' = 'classic';
  let pos = 0;
  let target = 0;
  let focus = -1;
  let raf = 0;
  let H = 600;
  let step = 200;
  let ticks: SVGLineElement[] = [];
  let node: SVGCircleElement | null = null;
  let halo: SVGCircleElement | null = null;

  rows.forEach((row, i) => {
    row.tabIndex = 0;
    row.addEventListener('click', () => go(i));
    row.addEventListener('focus', () => {
      if (mode === 'wheel' && i !== focus) go(i, true);
      if (mode === 'classic') row.scrollIntoView({ inline: 'center', block: 'nearest', behavior: still ? 'auto' : 'smooth' });
    });
    row.addEventListener('keydown', (e) => {
      const d = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      const j = i + d;
      if (j < 0 || j >= n) return;
      e.preventDefault();
      rows[j].focus({ preventScroll: mode === 'wheel' });
    });
  });

  /* ── Wheel geometry ── */
  const R = () => 1.6 * H; // circle radius, as WheelArc
  const yOf = (d: number) => Math.sign(d) * table(OFFSET, d) * H;
  const xOf = (y: number) => {
    const r = R();
    return -(r - Math.sqrt(Math.max(0, r * r - y * y)));
  };

  function scrollTopFor(i: number) {
    const top = host!.getBoundingClientRect().top + window.scrollY;
    return top + i * step;
  }

  function go(i: number, fromFocus = false) {
    if (mode === 'wheel') {
      window.scrollTo({ top: scrollTopFor(i), behavior: still || fromFocus ? 'auto' : 'smooth' });
    } else {
      rows[i].scrollIntoView({ inline: 'center', block: 'nearest', behavior: still ? 'auto' : 'smooth' });
    }
  }

  function buildDial() {
    dial.replaceChildren();
    const defs = document.createElementNS(SVG, 'defs');
    defs.innerHTML =
      '<linearGradient id="dial-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="ds-a"/><stop offset=".25" class="ds-b"/><stop offset=".75" class="ds-c"/><stop offset="1" class="ds-d"/></linearGradient>';
    dial.append(defs);
    const w = wheel.clientWidth;
    const x0 = w - 8;
    let d = '';
    for (let k = 0; k <= 40; k++) {
      const y = -0.47 * H + (k / 40) * 0.94 * H;
      d += `${k ? 'L' : 'M'}${(x0 + xOf(y)).toFixed(1)},${(H / 2 + y).toFixed(1)}`;
    }
    const mk = (attrs: Record<string, string>) => {
      const p = document.createElementNS(SVG, 'path');
      for (const k in attrs) p.setAttribute(k, attrs[k]);
      dial.append(p);
    };
    mk({ d, fill: 'none', stroke: 'url(#dial-grad)', 'stroke-width': '7', opacity: '0.18' });
    mk({ d, fill: 'none', stroke: 'url(#dial-grad)', 'stroke-width': '1.5' });
    ticks = rows.map(() => {
      const l = document.createElementNS(SVG, 'line');
      l.setAttribute('stroke', 'currentColor');
      l.setAttribute('stroke-linecap', 'round');
      dial.append(l);
      return l;
    });
    halo = document.createElementNS(SVG, 'circle');
    halo.setAttribute('r', '12');
    halo.setAttribute('class', 'dial-halo');
    node = document.createElementNS(SVG, 'circle');
    node.setAttribute('r', '5');
    node.setAttribute('class', 'dial-node');
    const cx = String(x0);
    const cy = String(H / 2);
    for (const c of [halo, node]) {
      c.setAttribute('cx', cx);
      c.setAttribute('cy', cy);
      dial.append(c);
    }
    const counterChip = counter.parentElement!;
    counterChip.style.left = `${x0 + 20}px`;
    counterChip.style.right = 'auto';
    counterChip.style.transform = 'translateY(-50%)';
  }

  function layoutWheel() {
    const x0base = wheel.clientWidth - 8;
    for (let i = 0; i < n; i++) {
      const d = i - pos;
      const row = rows[i];
      const a = table(ALPHA, d);
      if (Math.abs(d) > 4.2) {
        row.style.visibility = 'hidden';
      } else {
        row.style.visibility = '';
        const y = yOf(d);
        const x = xOf(y) + 0.05 * H;
        const s = table(SCALE, d);
        const turn = still ? 0 : table(TURN, d);
        row.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotateY(${turn.toFixed(1)}deg) scale(${s.toFixed(3)})`;
        row.style.opacity = a.toFixed(3);
        row.style.zIndex = String(10 - Math.round(Math.abs(d)));
        row.classList.toggle('is-far', Math.abs(d) >= 1.5);
        row.classList.toggle('is-side', Math.abs(d) >= 0.5 && Math.abs(d) < 1.5);
      }
      // Dial tick for this item, perpendicular to the arc.
      const tk = ticks[i];
      if (tk) {
        const y = yOf(d);
        const vis = Math.abs(d) <= 4.2;
        const x = x0base + xOf(y);
        const lit = Math.max(0, 1 - Math.abs(d));
        const len = 6 + 8 * lit;
        tk.setAttribute('x1', (x - len).toFixed(1));
        tk.setAttribute('x2', (x - 2).toFixed(1));
        tk.setAttribute('y1', (H / 2 + y).toFixed(1));
        tk.setAttribute('y2', (H / 2 + y).toFixed(1));
        tk.setAttribute('stroke-width', (1.25 + lit).toFixed(2));
        tk.setAttribute('opacity', vis ? (0.2 + 0.8 * Math.max(a, lit)).toFixed(2) : '0');
      }
    }
  }

  function setFocus(i: number) {
    if (i === focus) return;
    const first = focus === -1;
    focus = i;
    rows.forEach((r, k) => r.classList.toggle('is-focus', k === i));
    counter.textContent = String(i + 1).padStart(2, '0');
    const shot = rows[i].dataset.shot;
    shots.forEach((s) => s.classList.toggle('is-shown', s.dataset.shotKey === shot));
    if (node && halo && !still) {
      halo.animate([{ r: 12, opacity: 0.5 }, { r: 20, opacity: 0 }, { r: 12, opacity: 0.28 }], { duration: 520, easing: 'ease-out' });
    }
    if (!first) sfx('move');
  }

  /* ── Scroll → wheel ── */
  function readScroll() {
    const top = host!.getBoundingClientRect().top;
    const p = Math.min(Math.max(-top / ((n - 1) * step), 0), 1);
    target = p * (n - 1);
  }

  function tick() {
    raf = 0;
    if (mode !== 'wheel') return;
    const diff = target - pos;
    pos = still || Math.abs(diff) < 0.002 ? target : pos + diff * 0.16;
    layoutWheel();
    setFocus(Math.round(pos));
    if (pos !== target) raf = requestAnimationFrame(tick);
  }

  const onScroll = () => {
    if (mode !== 'wheel') return;
    readScroll();
    if (!raf) raf = requestAnimationFrame(tick);
  };

  /* ── Classic carousel ── */
  let io: IntersectionObserver | null = null;
  function startClassic() {
    io?.disconnect();
    io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setFocus(rows.indexOf(e.target as HTMLLIElement));
      },
      { root: list, threshold: 0.6 },
    );
    rows.forEach((r) => io!.observe(r));
  }

  function setMode() {
    const next = wide.matches ? 'wheel' : 'classic';
    mode = next;
    host!.classList.toggle('is-wheel', next === 'wheel');
    host!.classList.toggle('is-classic', next === 'classic');
    rows.forEach((r) => {
      r.style.transform = '';
      r.style.opacity = '';
      r.style.visibility = '';
      r.style.zIndex = '';
      r.classList.remove('is-far', 'is-side');
    });
    if (next === 'wheel') {
      io?.disconnect();
      H = wheel.clientHeight || window.innerHeight * 0.8;
      step = Math.max(160, window.innerHeight * 0.3);
      host!.style.height = `${window.innerHeight + (n - 1) * step}px`;
      buildDial();
      readScroll();
      pos = target;
      focus = -1;
      layoutWheel();
      setFocus(Math.round(pos));
    } else {
      host!.style.height = '';
      dial.replaceChildren();
      focus = -1;
      setFocus(0);
      startClassic();
    }
  }

  setMode();
  wide.addEventListener('change', setMode);
  // Re-measure on real resizes only: mobile URL bars change the height by a few dozen pixels while
  // scrolling, and re-laying the runway then would shift the page.
  let rt = 0;
  let lastW = window.innerWidth;
  let lastH = window.innerHeight;
  window.addEventListener(
    'resize',
    () => {
      clearTimeout(rt);
      rt = window.setTimeout(() => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        if (w === lastW && Math.abs(h - lastH) < 120) return;
        lastW = w;
        lastH = h;
        if (mode === 'wheel') setMode();
      }, 150);
    },
    { passive: true },
  );
  window.addEventListener('scroll', onScroll, { passive: true });
}
