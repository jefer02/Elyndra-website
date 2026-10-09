// The site's ignition, echoing the app's ELYNDRA intro (ui/intro/IntroTimeline.kt), condensed to
// ~2.8 s and played once per session: dust converges on the wordmark, a radial burst and an
// anamorphic streak, embers off the letters, then everything disperses. The wordmark reveal and
// light sweep are CSS (classes set by the inline boot script), so this canvas is only the light.
import { $, lowPower } from './env';

interface Mote {
  x0: number;
  y0: number;
  delay: number;
  size: number;
  hue: number;
  vx: number;
  vy: number;
}

const ease = (x: number) => 1 - Math.pow(1 - x, 3);
const inout = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const range = (t: number, a: number, b: number) => Math.min(1, Math.max(0, (t - a) / (b - a)));

export function initBoot() {
  const root = document.documentElement;
  if (!root.classList.contains('boot-play')) return;
  const canvas = $<HTMLCanvasElement>('[data-boot]');
  const word = $('[data-wordmark]');
  const hero = canvas?.parentElement;
  if (!canvas || !word || !hero) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  const W = hero.clientWidth;
  const H = hero.clientHeight;
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  ctx.scale(dpr, dpr);

  const hr = hero.getBoundingClientRect();
  const wr = word.getBoundingClientRect();
  const cx = wr.left - hr.left + wr.width / 2;
  const cy = wr.top - hr.top + wr.height / 2;
  const span = wr.width;

  const cs = getComputedStyle(root);
  const c1 = cs.getPropertyValue('--p1').trim() || '#7c5cff';
  const c2 = cs.getPropertyValue('--p2').trim() || '#2bd9ff';
  const ck = cs.getPropertyValue('--spark').trim() || '#fff1c9';

  const N = lowPower() ? 70 : 150;
  const motes: Mote[] = Array.from({ length: N }, () => {
    const a = Math.random() * Math.PI * 2;
    const d = Math.max(W, H) * (0.45 + Math.random() * 0.5);
    return {
      x0: cx + Math.cos(a) * d,
      y0: cy + Math.sin(a) * d * 0.7,
      delay: Math.random() * 280,
      size: 0.6 + Math.random() * 1.8,
      hue: Math.random(),
      vx: (Math.random() - 0.5) * 2,
      vy: -0.4 - Math.random(),
    };
  });
  const embers = Array.from({ length: lowPower() ? 18 : 40 }, () => ({
    x: cx + (Math.random() - 0.5) * span,
    y: cy + (Math.random() - 0.5) * wr.height * 0.6,
    vy: -12 - Math.random() * 34,
    vx: (Math.random() - 0.5) * 16,
    size: 0.6 + Math.random() * 1.4,
    delay: Math.random() * 350,
  }));

  const t0 = performance.now();
  const END = 2900;
  const frame = (now: number) => {
    if (!canvas.isConnected) return;
    const t = now - t0;
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';

    const disperse = inout(range(t, 2350, 2850));

    // Core light that grows as the dust arrives, then settles behind the letters.
    const core = range(t, 250, 1000) * (1 - 0.6 * range(t, 1200, 2200)) * (1 - disperse);
    if (core > 0) {
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, span * 0.5);
      g.addColorStop(0, withAlpha(ck, 0.55 * core));
      g.addColorStop(0.35, withAlpha(c1, 0.3 * core));
      g.addColorStop(1, withAlpha(c1, 0));
      ctx.fillStyle = g;
      ctx.fillRect(cx - span, cy - span, span * 2, span * 2);
    }

    // Dust converging on the centre (gather), then pushed out (disperse).
    for (const m of motes) {
      const k = ease(range(t, 250 + m.delay, 1050 + m.delay * 0.4));
      if (k <= 0) continue;
      const fade = k < 1 ? k : 1 - range(t, 1050, 1200);
      let x = m.x0 + (cx - m.x0) * k;
      let y = m.y0 + (cy - m.y0) * k;
      if (disperse > 0) {
        x += m.vx * disperse * 160;
        y += m.vy * disperse * 120;
      }
      const a = Math.max(0, Math.min(1, fade + disperse * 0.6)) * (1 - disperse);
      if (a <= 0.01) continue;
      ctx.fillStyle = withAlpha(m.hue < 0.5 ? ck : m.hue < 0.8 ? c2 : c1, a);
      ctx.beginPath();
      ctx.arc(x, y, m.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Radial burst.
    const burst = ease(range(t, 1000, 1080)) * Math.pow(1 - range(t, 1080, 1700), 2);
    if (burst > 0) {
      const r = span * (0.3 + 0.7 * range(t, 1000, 1700));
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, withAlpha(ck, 0.8 * burst));
      g.addColorStop(0.4, withAlpha(c2, 0.35 * burst));
      g.addColorStop(1, withAlpha(c2, 0));
      ctx.fillStyle = g;
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    }

    // Anamorphic streak across the word.
    const streak = ease(range(t, 1000, 1100)) * Math.pow(1 - range(t, 1150, 1850), 2);
    if (streak > 0) {
      const half = (W * 0.5) * ease(range(t, 1000, 1350));
      const g = ctx.createLinearGradient(cx - half, cy, cx + half, cy);
      g.addColorStop(0, withAlpha(c2, 0));
      g.addColorStop(0.5, withAlpha(ck, 0.9 * streak));
      g.addColorStop(1, withAlpha(c2, 0));
      ctx.fillStyle = g;
      ctx.fillRect(cx - half, cy - 1.5, half * 2, 3);
      ctx.fillStyle = withAlpha(c1, 0.25 * streak);
      ctx.fillRect(cx - half * 0.7, cy - 7, half * 1.4, 14);
    }

    // Embers rising off the letters.
    const emb = range(t, 1150, 1450) * (1 - range(t, 2300, 2800));
    if (emb > 0) {
      for (const e of embers) {
        const s = Math.max(0, t - 1150 - e.delay) / 1000;
        if (s <= 0) continue;
        ctx.fillStyle = withAlpha(ck, emb * Math.max(0, 1 - s * 0.7));
        ctx.beginPath();
        ctx.arc(e.x + e.vx * s, e.y + e.vy * s, e.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (t < END) requestAnimationFrame(frame);
    else canvas.remove();
  };
  requestAnimationFrame(frame);

  // Any key, tap or scroll skips to the end, like the app (skippable after a moment).
  const skip = () => {
    root.classList.remove('boot', 'boot-play');
    canvas.remove();
  };
  const skipAfter = (e: Event) => {
    if (performance.now() - t0 < 500) return;
    if (e.type === 'keydown' && (e as KeyboardEvent).key === 'Tab') return;
    skip();
    off();
  };
  const evs = ['pointerdown', 'keydown', 'wheel', 'touchstart'] as const;
  const off = () => evs.forEach((ev) => window.removeEventListener(ev, skipAfter));
  evs.forEach((ev) => window.addEventListener(ev, skipAfter, { passive: true }));
  setTimeout(off, END);
}

const cache = new Map<string, [number, number, number]>();
function withAlpha(hex: string, a: number): string {
  let rgb = cache.get(hex);
  if (!rgb) {
    const v = parseInt(hex.replace('#', ''), 16);
    rgb = [(v >> 16) & 255, (v >> 8) & 255, v & 255];
    cache.set(hex, rgb);
  }
  return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${Math.max(0, Math.min(1, a)).toFixed(3)})`;
}
