// Fades blocks in as they enter the viewport (CSS does the motion; reduced motion skips it).
import { $$ } from './env';

export function initReveal() {
  const els = $$('.reveal');
  if (!('IntersectionObserver' in window)) {
    els.forEach((e) => e.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
  );
  els.forEach((e, i) => {
    e.style.transitionDelay = `${(i % 6) * 60}ms`;
    io.observe(e);
  });
}
