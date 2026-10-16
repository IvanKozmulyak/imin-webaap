/* Product mocks on /pro: shared helpers, then one block per mock.
   Copy lives in the HTML (so a translated page translates the mocks); scripts only move things and count. */
window.IMIN_MO = (() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // One example night, the same in every mock and in the six-tabs scene ("Saturday Night").
  const tiers = [
    { name: 'Early Bird', price: 10, cap: 40, sold: 40 },
    { name: 'Standard', price: 15, cap: 60, sold: 44 },
    { name: 'Door', price: 20, cap: 20, sold: 0 }
  ];
  const night = {
    name: 'Saturday Night', day: 'Sat 14.11', time: '23:00 – 05:00', city: 'Metz', genre: 'House & Techno',
    tiers,
    capacity: tiers.reduce((a, t) => a + t.cap, 0),           // 120
    sold: tiers.reduce((a, t) => a + t.sold, 0),              // 84
    revenue: tiers.reduce((a, t) => a + t.sold * t.price, 0), // 1060, ticket prices only: the buyer fee is IMIN's
    checkedIn: 72
  };
  // The buyer's fee per ticket, same formula as the calculator and the API: 5% + €0.99, nothing on free tickets.
  const fee = price => price > 0 ? Math.round(price * 5 + 99) / 100 : 0;

  const lang = () => document.documentElement.lang || 'en';
  const eur = (n, digits = 2) => '€' + Number(n).toLocaleString(lang(), { minimumFractionDigits: digits, maximumFractionDigits: digits });

  // Runs play() when el is a third on screen; play(true) at once under reduced motion (final state, no movement).
  const onView = (el, play, { repeat = false, threshold = .35 } = {}) => {
    if (!el) return;
    if (reduce || !('IntersectionObserver' in window)) { play(true); return; }
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      play(false);
      if (!repeat) io.disconnect();
    }, { threshold });
    io.observe(el);
  };

  // Counts el's text up to `to`; fmt formats each frame.
  const countUp = (el, to, { dur = 1.2, from = 0, fmt = n => String(Math.round(n)) } = {}) => {
    if (!el) return Promise.resolve();
    if (reduce) { el.textContent = fmt(to); return Promise.resolve(); }
    return new Promise(res => {
      const t0 = performance.now();
      const tick = now => {
        const k = Math.min(1, (now - t0) / (dur * 1000));
        el.textContent = fmt(from + (to - from) * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(tick); else res();
      };
      requestAnimationFrame(tick);
    });
  };

  const wait = ms => new Promise(r => setTimeout(r, reduce ? 0 : ms));

  return { reduce, night, fee, eur, onView, countUp, wait };
})();

/* === M1: overview (hero, six-tabs end state) and analytics === */

/* === end M1 === */



/* === M2: create, studio, tickets === */

/* === end M2 === */



/* === M3: door and crowd === */

/* === end M3 === */
