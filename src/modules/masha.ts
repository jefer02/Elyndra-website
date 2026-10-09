// Decides whether and when to show Masha in 3D. three.js and the model are only fetched when the
// section is about to be seen, on devices that can take it; Save-Data and low-power devices get a
// button instead, and any failure leaves the real screenshot in place.
import { $, lowPower, reducedMotion } from './env';
import { strings } from './strings';

/** Cheap capability check: creating a real context here would cost the page a GPU start-up. */
const webglOk = () => 'WebGLRenderingContext' in window;

export function initMasha() {
  const stage = $('[data-masha-stage]');
  const mount = $('[data-masha-canvas]');
  const button = $<HTMLButtonElement>('[data-masha-load]');
  const status = $('[data-masha-status]');
  if (!stage || !mount || !button || !status || !webglOk()) return;
  const s = strings().masha;
  let started = false;

  const start = async () => {
    if (started) return;
    started = true;
    button.hidden = true;
    status.textContent = s.loading3d;
    try {
      const { mountMasha } = await import('./masha3d');
      await mountMasha(mount, { still: reducedMotion(), label: s.canvasLabel });
      stage.classList.add('is-3d');
      status.textContent = '';
    } catch (err) {
      console.warn('[elyndra] Masha 3D unavailable', err);
      status.textContent = s.failed3d;
      mount.replaceChildren();
      // The recording (if any) takes over: src/modules/video.ts sees the class go.
      stage.classList.remove('is-3d-pending');
    }
  };

  button.addEventListener('click', start);
  if (lowPower()) {
    button.hidden = false;
    return;
  }
  // 3D will autoload: the stage's recording stays unloaded unless 3D fails (src/modules/video.ts).
  stage.classList.add('is-3d-pending');
  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        io.disconnect();
        void start();
      }
    },
    { rootMargin: '300px 0px' },
  );
  io.observe(stage);
}
