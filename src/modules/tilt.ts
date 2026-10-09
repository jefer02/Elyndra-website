// The hero tablet leans toward the pointer (desktop, fine pointer, motion allowed).
import { $, finePointer, reducedMotion } from './env';

export function initTilt() {
  const host = $('[data-tilt]');
  const device = host?.querySelector<HTMLElement>('.hero-device');
  const hero = host?.closest<HTMLElement>('.hero');
  if (!host || !device || !hero || !finePointer() || reducedMotion()) return;
  let raf = 0;
  let tx = 0;
  let ty = 0;
  hero.addEventListener('pointermove', (e) => {
    const r = hero.getBoundingClientRect();
    tx = (e.clientX - r.left) / r.width - 0.5;
    ty = (e.clientY - r.top) / r.height - 0.5;
    if (!raf)
      raf = requestAnimationFrame(() => {
        raf = 0;
        device.style.transform = `rotateY(${-13 + tx * 10}deg) rotateX(${5 - ty * 8}deg) rotateZ(0.6deg)`;
      });
  });
  hero.addEventListener('pointerleave', () => {
    device.style.transform = '';
  });
}
