import './styles/tokens.css';
import './styles/base.css';
import './styles/sections.css';
import { initNav } from './modules/nav';
import { initPalette } from './modules/palette';
import { initSound } from './modules/sound';
import { initReveal } from './modules/reveal';
import { initDownload } from './modules/download';
import { initGallery } from './modules/gallery';
import { initGamepad } from './modules/gamepad';
import { initMeridian } from './modules/meridian';
import { initBoot } from './modules/boot';
import { initAurora } from './modules/aurora';
import { initTilt } from './modules/tilt';
import { initMasha } from './modules/masha';
import { initVideos } from './modules/video';
import { finePointer, lowPower } from './modules/env';

function safely(name: string, fn: () => void) {
  try {
    fn();
  } catch (err) {
    // One broken extra must never take the page (or the download button) down with it.
    console.error(`[elyndra] ${name} failed`, err);
  }
}

safely('boot', initBoot);
safely('nav', initNav);
safely('download', initDownload);
safely('palette', initPalette);
safely('sound', initSound);
safely('meridian', initMeridian);
safely('reveal', initReveal);
safely('gallery', initGallery);
safely('gamepad', initGamepad);
safely('tilt', initTilt);
safely('masha', initMasha);
safely('videos', initVideos);
// The WebGL aurora is an enhancement over the CSS one: desktop only (fine pointer), started on the
// first interaction once the page is idle, so creating a GPU context never delays loading.
if (finePointer() && !lowPower()) {
  const go = () => {
    off();
    const idle = 'requestIdleCallback' in window ? requestIdleCallback : (f: () => void) => setTimeout(f, 200);
    idle(() => safely('aurora', initAurora));
  };
  const evs = ['pointermove', 'scroll', 'keydown'] as const;
  const off = () => evs.forEach((e) => window.removeEventListener(e, go));
  evs.forEach((e) => window.addEventListener(e, go, { passive: true, once: true }));
}
