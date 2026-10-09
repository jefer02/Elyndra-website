// Screenshot lightbox on a native <dialog>. Without JS (or <dialog>) the links open the image itself.
import { $, $$ } from './env';
import { sfx } from './sound';

export function initGallery() {
  const dialog = $<HTMLDialogElement>('[data-lightbox-dialog]');
  const links = $$<HTMLAnchorElement>('[data-lightbox]');
  if (!dialog || !links.length || typeof dialog.showModal !== 'function') return;
  const img = $<HTMLImageElement>('[data-lightbox-img]', dialog)!;
  const cap = $('[data-lightbox-cap]', dialog)!;
  let index = 0;
  let opener: HTMLElement | null = null;

  const show = (i: number) => {
    index = (i + links.length) % links.length;
    const a = links[index];
    img.src = a.href;
    img.alt = a.querySelector('img')?.alt ?? '';
    cap.textContent = a.dataset.caption ?? '';
  };

  links.forEach((a, i) =>
    a.addEventListener('click', (e) => {
      e.preventDefault();
      opener = a;
      show(i);
      dialog.showModal();
      sfx('select');
    }),
  );
  $('[data-lb-close]', dialog)!.addEventListener('click', () => dialog.close());
  $('[data-lb-prev]', dialog)!.addEventListener('click', () => {
    show(index - 1);
    sfx('move');
  });
  $('[data-lb-next]', dialog)!.addEventListener('click', () => {
    show(index + 1);
    sfx('move');
  });
  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') show(index - 1);
    if (e.key === 'ArrowRight') show(index + 1);
  });
  // Click on the backdrop closes.
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => {
    sfx('back');
    opener?.focus();
  });
}
