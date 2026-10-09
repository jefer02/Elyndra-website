// Top bar: glass once the page scrolls, and the dot dock follows the section on screen.
import { $, $$ } from './env';

export function initNav() {
  const bar = $('[data-topbar]');
  if (!bar) return;
  const onScroll = () => bar.classList.toggle('is-scrolled', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const tabs = $$<HTMLAnchorElement>('.dock-tab');
  const sections = tabs.map((t) => document.getElementById(t.dataset.section!)).filter(Boolean) as HTMLElement[];
  if (!sections.length || !('IntersectionObserver' in window)) return;
  const visible = new Map<string, number>();
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) visible.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0);
      let best = '';
      let ratio = 0;
      for (const [id, r] of visible) if (r > ratio) [best, ratio] = [id, r];
      tabs.forEach((t) => {
        const on = t.dataset.section === best;
        t.classList.toggle('is-active', on);
        if (on) t.setAttribute('aria-current', 'location');
        else t.removeAttribute('aria-current');
      });
    },
    { threshold: [0, 0.01, 0.15, 0.3, 0.5, 0.75], rootMargin: '-35% 0px -45% 0px' },
  );
  sections.forEach((s) => io.observe(s));
}
