// Optional UI sounds, synthesized with Web Audio (no audio files). Off by default; the choice is remembered.
import { $, store } from './env';
import { strings } from './strings';

const KEY = 'elyndra.sound';
let ctx: AudioContext | null = null;
let enabled = false;

export type Sfx = 'move' | 'select' | 'confirm' | 'back';

const VOICES: Record<Sfx, { f: number[]; d: number; type: OscillatorType; g: number }> = {
  move: { f: [880], d: 0.05, type: 'sine', g: 0.035 },
  select: { f: [660, 990], d: 0.09, type: 'triangle', g: 0.05 },
  confirm: { f: [523.25, 783.99, 1046.5], d: 0.16, type: 'triangle', g: 0.055 },
  back: { f: [660, 440], d: 0.08, type: 'sine', g: 0.045 },
};

export function sfx(kind: Sfx) {
  const ac = ctx;
  if (!enabled || !ac) return;
  const v = VOICES[kind];
  const t0 = ac.currentTime;
  v.f.forEach((f, i) => {
    const o = ac.createOscillator();
    const g = ac.createGain();
    const start = t0 + i * 0.045;
    o.type = v.type;
    o.frequency.setValueAtTime(f, start);
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(v.g, start + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, start + v.d);
    o.connect(g).connect(ac.destination);
    o.start(start);
    o.stop(start + v.d + 0.02);
  });
}

export function initSound() {
  const btn = $<HTMLButtonElement>('[data-sound-toggle]');
  if (!btn || !('AudioContext' in window)) return;
  btn.hidden = false;
  const t = strings().a11y;
  const render = () => {
    btn.setAttribute('aria-pressed', String(enabled));
    btn.setAttribute('aria-label', enabled ? t.soundOn : t.soundOff);
    btn.title = enabled ? t.soundOn : t.soundOff;
  };
  // A remembered "on" only starts after the next user gesture (browser autoplay rules).
  if (store(KEY) === 'on') {
    const unlock = () => {
      if (ctx) return;
      ctx = new AudioContext();
      enabled = true;
      render();
    };
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
  }
  btn.addEventListener('click', () => {
    if (!ctx) ctx = new AudioContext();
    enabled = !enabled;
    store(KEY, enabled ? 'on' : null);
    render();
    if (enabled) sfx('select');
  });
  render();

  document.addEventListener('click', (e) => {
    const el = (e.target as Element | null)?.closest<HTMLElement>('[data-sfx]');
    if (el) sfx((el.dataset.sfx as Sfx) || 'select');
  });
}
