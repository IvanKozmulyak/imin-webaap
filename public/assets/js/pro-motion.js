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
(() => {
  const M = window.IMIN_MO;
  if (!M) return;
  const { reduce, night, onView, countUp } = M;
  // Your crowd: everyone bought one ticket, so the audience is 84 people. newsYes ticked the organizer's news box
  // at checkout; a campaign reaches only them, SendGate leaves the other 46 out (no lawful basis).
  night.newsYes = 38;

  // The markup is each mock's final state: with reduced motion or without GSAP it just stays as it is.
  const gsap = window.gsap;
  if (reduce || !gsap) return;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  // the dashboard's soldPctShown: a whole percent that never reads 100 before a sell-out or 0 once one sold
  const pctShown = (k, n) => { const p = Math.round(k / n * 100); return p >= 100 && k < n ? 99 : p <= 0 && k > 0 ? 1 : p; };
  // TickValue: the old figure slides up and out, the new one slides in from below
  const tick = (el, to) => {
    const out = el.cloneNode(true);
    out.removeAttribute('data-door-checked');
    el.after(out);
    el.textContent = to;
    gsap.to(out, { yPercent: -60, autoAlpha: 0, duration: .26, ease: 'power2.out', onComplete: () => out.remove() });
    gsap.fromTo(el, { yPercent: 60, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: .26, ease: 'power2.out' });
  };
  // a finger on the screen, then the button gives
  const press = (tl, root, at) => tl
    .fromTo($('[data-m3-tap]', root), { scale: .2, autoAlpha: .7 }, { scale: 2.4, autoAlpha: 0, duration: .55, ease: 'power2.out', immediateRender: false }, at)
    .to($('[data-m3-press]', root), { scale: .96, duration: .09, yoyo: true, repeat: 1, ease: 'power1.inOut' }, at);
  const start = (el, tl) => onView(el, instant => instant ? tl.progress(1) : gsap.delayedCall(.3, () => tl.play()));

  /* ---------- 04 The door: Tonight → Open door scanner → three tickets at the door ---------- */
  const ph = $('[data-mo-door]');
  const card = $('[data-door-card]');
  if (ph && card) {
    const scene = k => $(`[data-m3-scene="${k}"]`, ph);
    const dash = scene('dash'), gate = scene('gate');
    const verdict = k => $(`[data-door-verdict="${k}"]`, ph);
    const tix = $('[data-door-tix]', ph), chk = $('[data-door-checking]', ph), scanned = $('[data-door-scanned]', ph);
    const checked = $('[data-door-checked]', card), pct = $('[data-door-pct]', card);
    const before = night.checkedIn - 1;
    const keys = ['check', 'stop', 'admit'];

    gsap.set(dash, { autoAlpha: 1 });
    gsap.set(gate, { xPercent: 100 });
    gsap.set($('[data-door-bar] i', ph), { scaleX: 0 });
    gsap.set([chk, ...keys.map(verdict)], { autoAlpha: 0 });
    gsap.set(tix, { yPercent: 290 });
    gsap.set(card, { autoAlpha: 0, x: -14 });
    scanned.textContent = '0';
    checked.textContent = before;
    pct.textContent = pctShown(before, night.sold);

    const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });
    tl.to($('[data-door-bar] i', ph), { scaleX: night.sold / night.capacity, duration: .7 }, .05);
    press(tl, dash, .95);
    tl.to(dash, { xPercent: -30, autoAlpha: 0, duration: .5, ease: 'power3.inOut' }, 1.3)
      .to(gate, { xPercent: 0, duration: .5, ease: 'power3.inOut' }, 1.3)
      .to(card, { autoAlpha: 1, x: 0, duration: .5 }, 1.7);
    // a screenshot of a ticket that was already used, a QR that is not a ticket, then a valid Standard ticket
    keys.forEach((k, i) => {
      const at = 1.9 + i * 1.35, v = verdict(k), seen = at + .62;
      tl.call(() => keys.forEach(q => { $(`[data-door-qr="${q}"]`, ph).style.visibility = q === k ? 'visible' : 'hidden'; }), null, at)
        .fromTo(tix, { yPercent: 290, rotation: 10 }, { yPercent: 0, rotation: 0, duration: .45 }, at)
        .to(chk, { autoAlpha: 1, duration: .1 }, at + .4)
        .to(chk, { autoAlpha: 0, duration: .1 }, seen)
        .fromTo(v, { autoAlpha: 0, scale: 1.04 }, { autoAlpha: 1, scale: 1, duration: .2, ease: 'power2.out' }, seen)
        .call(() => { scanned.textContent = i + 1; }, null, seen);
      if (k !== 'admit') tl.set(tix, { yPercent: 290 }, seen + .3).to(v, { autoAlpha: 0, duration: .18 }, seen + .68);
    });
    const valid = 1.9 + 2 * 1.35 + .62;
    tl.call(() => { tick(checked, night.checkedIn); pct.textContent = pctShown(night.checkedIn, night.sold); }, null, valid + .1)
      .fromTo(card, { borderColor: '#16B877' }, { borderColor: '#3A3550', duration: .6, ease: 'power1.in', immediateRender: false }, valid + .1);
    start($('.mo-door'), tl);
  }

  /* ---------- 05 Your crowd: Audience → Start a campaign → the review step, to the 38 who said yes ---------- */
  const cw = $('[data-mo-crowd]');
  if (cw) {
    const aud = $('[data-m3-scene="aud"]', cw), cmp = $('[data-m3-scene="cmp"]', cw);
    const urlAud = $('[data-crowd-url="aud"]', cw), urlCmp = $('[data-crowd-url="cmp"]', cw);
    const ins = $$('[data-crowd-in]', cmp), send = $('[data-crowd-send]', cmp);
    const value = { people: night.sold, newsYes: night.newsYes, noNews: night.sold - night.newsYes };
    const count = (root, dur) => () => $$('[data-crowd-count]', root).forEach(el => countUp(el, value[el.dataset.crowdCount], { dur }));

    gsap.set([aud, urlAud], { autoAlpha: 1 });
    gsap.set([cmp, urlCmp], { autoAlpha: 0 });
    $$('[data-crowd-count]', cw).forEach(el => { el.textContent = '0'; });
    gsap.set($$('[data-crowd-fade]', aud), { autoAlpha: 0 });
    gsap.set($$('.mo-aud-row:not(.is-head)', aud), { autoAlpha: 0, y: 8 });
    gsap.set(ins, { autoAlpha: 0, y: 10 });
    gsap.set(send, { boxShadow: '0 0 0 0px rgba(61,99,255,0)' });

    const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });
    tl.call(count(aud, .9), null, .1)
      .to($$('[data-crowd-fade]', aud), { autoAlpha: 1, duration: .5 }, .45)
      .to($$('.mo-aud-row:not(.is-head)', aud), { autoAlpha: 1, y: 0, duration: .4, stagger: .08 }, .3)
      .fromTo($$('.mo-aud-row.is-yes > :last-child', aud), { backgroundColor: 'rgba(22,184,119,0)' },
        { backgroundColor: 'rgba(22,184,119,.18)', color: '#16B877', duration: .3, stagger: .1 }, 1.3)
      .fromTo($('.mo-aud-stat.is-accent', aud), { boxShadow: '0 0 0 0px rgba(61,99,255,0)' },
        { boxShadow: '0 0 0 4px rgba(61,99,255,.32)', duration: .35, yoyo: true, repeat: 1, ease: 'power1.inOut' }, 1.35);
    press(tl, aud, 2.05);
    tl.to(urlAud, { autoAlpha: 0, duration: .25 }, 2.4)
      .to(urlCmp, { autoAlpha: 1, duration: .25 }, 2.5)
      .to(aud, { xPercent: -5, autoAlpha: 0, duration: .45, ease: 'power3.inOut' }, 2.4)
      .fromTo(cmp, { xPercent: 5 }, { xPercent: 0, autoAlpha: 1, duration: .5, ease: 'power3.inOut' }, 2.5)
      .to(ins[0], { autoAlpha: 1, y: 0, duration: .45 }, 2.95)
      .call(count(cmp, .8), null, 3.05)
      .to(ins[1], { autoAlpha: 1, y: 0, duration: .4 }, 3.45)
      .to(ins[2], { autoAlpha: 1, y: 0, duration: .45 }, 3.75)
      .to(send, { boxShadow: '0 0 0 4px rgba(61,99,255,.22)', duration: .5 }, 4.3);
    start(cw, tl);
  }
})();
/* === end M3 === */
