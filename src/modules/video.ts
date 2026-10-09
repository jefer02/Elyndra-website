// Device recordings (when the build found them): play only while on screen, never with reduced
// motion or Save-Data; the poster frame stays otherwise.
import { $$, lowPower, reducedMotion } from './env';

/**
 * Ancestors that hide a video without moving it off screen: a faded-out Meridian card, Masha in 3D
 * or about to load it (then her recording is never fetched; it is only the fallback without WebGL).
 */
const HIDERS = '.mer-shot, .masha-stage';
const hidden = (v: HTMLVideoElement) => !!v.closest('.mer-shot:not(.is-shown), .masha-stage.is-3d, .masha-stage.is-3d-pending');

export function initVideos() {
  const videos = $$<HTMLVideoElement>('[data-loop-video]');
  if (!videos.length || reducedMotion() || lowPower() || !('IntersectionObserver' in window)) return;
  const onScreen = new WeakSet<HTMLVideoElement>();

  const sync = (v: HTMLVideoElement) => {
    if (onScreen.has(v) && !hidden(v)) {
      if (v.preload === 'none') v.preload = 'auto';
      if (v.paused)
        v.play().catch(() => {
          /* autoplay refused: the poster stays */
        });
    } else if (!v.paused) v.pause();
  };

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const v = e.target as HTMLVideoElement;
        if (e.isIntersecting) onScreen.add(v);
        else onScreen.delete(v);
        sync(v);
      }
    },
    { threshold: 0.25 },
  );
  // The wheel swaps cards and Masha's stage switches to 3D by toggling classes.
  const mo = new MutationObserver(() => videos.forEach(sync));
  videos.forEach((v) => {
    io.observe(v);
    const host = v.closest(HIDERS);
    if (host) mo.observe(host, { attributes: true, attributeFilter: ['class'] });
  });
}
