import { useEffect } from 'react';

/**
 * Ports the .dc.html Component behavior to React:
 *  - nav shrink + progress bar on scroll/resize
 *  - smooth-scroll for in-page anchors with a -90px offset (#top -> 0)
 *  - IntersectionObserver reveal (threshold .12, rootMargin '0px 0px -8% 0px', once)
 *  - reduced-motion: reveal everything immediately, native 'auto' scroll
 *
 * The page is a single mounted component, so the effect queries the live DOM.
 */
export function useLandingEffects(): void {
  useEffect(() => {
    const reduced =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const nav = document.getElementById('iminNav');
    const bar = document.getElementById('iminProgress');

    // ---- nav + progress bar -------------------------------------------------
    const onScroll = (): void => {
      const y = window.scrollY;
      if (nav) {
        nav.classList.toggle('is-scrolled', y > 24);
      }
      if (bar) {
        const max =
          document.documentElement.scrollHeight -
          document.documentElement.clientHeight;
        const pct = max > 0 ? (y / max) * 100 : 0;
        bar.style.setProperty('--progress', pct.toFixed(2) + '%');
      }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    // ---- smooth-scroll for in-page anchors ----------------------------------
    const behavior: ScrollBehavior = reduced ? 'auto' : 'smooth';
    const anchors = Array.prototype.slice.call(
      document.querySelectorAll('a[href^="#"]')
    ) as HTMLAnchorElement[];
    const clickHandlers: Array<[HTMLAnchorElement, (e: Event) => void]> = [];

    anchors.forEach((a) => {
      const handler = (e: Event): void => {
        const id = a.getAttribute('href');
        if (!id || id.length < 2) {
          if (id === '#top') {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior });
          }
          return;
        }
        if (id === '#top') {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior });
          return;
        }
        const t = document.querySelector(id);
        if (!t) return;
        e.preventDefault();
        const top = t.getBoundingClientRect().top + window.scrollY - 90;
        window.scrollTo({ top, behavior });
      };
      a.addEventListener('click', handler);
      clickHandlers.push([a, handler]);
    });

    // ---- reveal-on-scroll ---------------------------------------------------
    const revealEls = Array.prototype.slice.call(
      document.querySelectorAll('.reveal')
    ) as HTMLElement[];

    let io: IntersectionObserver | null = null;

    if (reduced || !('IntersectionObserver' in window)) {
      revealEls.forEach((el) => el.classList.add('is-visible'));
    } else {
      io = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
      );
      revealEls.forEach((el) => io!.observe(el));
    }

    // ---- cleanup ------------------------------------------------------------
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      clickHandlers.forEach(([a, handler]) =>
        a.removeEventListener('click', handler)
      );
      if (io) io.disconnect();
    };
  }, []);
}
