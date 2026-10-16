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
(() => {
  const MO = window.IMIN_MO;
  const N = MO.night;
  // Numbers only these mocks show, on top of the shared night; each one adds up to the night's own totals.
  Object.assign(N, {
    // Standard tickets sold on each of the 7 days up to the night (8–14 Nov); Early Bird had sold out before. Sums to 44.
    standardByDay: [3, 4, 4, 6, 7, 9, 11],
    // Tagged links: the tickets per tier bought through each (65 of the 84) and the visitors each brought.
    links: [
      { source: 'instagram', visitors: 412, tickets: [18, 20, 0] },
      { source: 'telegram', visitors: 96, tickets: [8, 9, 0] },
      { source: 'poster', visitors: 58, tickets: [4, 6, 0] }
    ]
  });

  // The dashboard's "Revenue" is what buyers paid, fee included; night.revenue (ticket prices) is its "after imin fee".
  const cents = t => Math.round((t.price + MO.fee(t.price)) * 100);
  const paid = counts => counts.reduce((a, n, i) => a + n * cents(N.tiers[i]), 0) / 100;
  N.revenueGross = paid(N.tiers.map(t => t.sold)); // 1196.16 = 40 × 11.49 + 44 × 16.74
  // percentages are whole, as prod rounds them: never 100% before a sell-out, never 0% once something sold
  const pct = (a, b) => { const p = Math.round(a / b * 100); return p >= 100 && a < b ? 99 : p <= 0 && a > 0 ? 1 : p; };
  const VAL = {
    sold: [N.sold, 'int'], in: [N.checkedIn, 'int'], net: [N.revenue, 'eur'], gross: [N.revenueGross, 'eur'],
    cap: [pct(N.sold, N.capacity), 'pct'], rate: [pct(N.checkedIn, N.sold), 'pct']
  };
  N.links.forEach((l, i) => { VAL['src' + i] = [paid(l.tickets), 'eur']; });
  MO.m1 = { values: VAL, heroIn: () => null };

  const gsap = window.gsap;
  if (!gsap) return;
  const motion = !MO.reduce;
  const $$ = (s, r) => Array.from(r.querySelectorAll(s));
  const LOCALE = { en: 'en-GB', fr: 'fr-FR', es: 'es-ES', uk: 'uk-UA' };
  let F;
  const fmt = (f, v) => {
    if (!F) {
      const nf = o => new Intl.NumberFormat(LOCALE[document.documentElement.lang] || 'en-GB', o);
      const int = nf({ maximumFractionDigits: 0 }), eur = nf({ style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 }), per = nf({ style: 'percent', maximumFractionDigits: 0 });
      F = { int: n => int.format(Math.round(n)), eur: n => eur.format(n), pct: n => per.format(Math.round(n) / 100) };
    }
    return F[f](v);
  };

  // whether words follow el on its line: a text run right after it, or the next box beside it rather than below
  const wordsAfter = el => {
    let s = el.nextSibling;
    while (s && s.nodeType === 3 && !s.textContent.trim()) s = s.nextSibling;
    if (!s) return false;
    return s.nodeType === 3 || s.offsetTop < el.offsetTop + el.offsetHeight * .66;
  };

  // One paused timeline per mock: figures count up from 0, bars grow, the chart draws, the links' page comes in last.
  // It sets its first frame now, so nothing jumps when it starts; its last frame puts the page's own text back.
  const build = root => {
    const tl = gsap.timeline({ paused: true });
    const late = el => !!el.closest('.m1-page');
    const nums = [];
    $$('[data-m1-n]', root).forEach((el, i) => {
      const [to, f] = VAL[el.dataset.m1N] || [];
      if (to == null) return;
      const n = { el, f, text: el.dataset.m1Text = el.dataset.m1Text || el.textContent, at: late(el) ? 1.25 + (i % 3) * .12 : 0 };
      nums.push(n);
      const o = { v: 0 };
      el.textContent = fmt(f, 0);
      tl.to(o, { v: to, duration: late(el) ? .7 : 1.1, ease: 'power2.out', onUpdate: () => { if (!n.tick) el.textContent = fmt(f, o.v); }, onComplete: () => { el.textContent = n.text; el.style.minWidth = ''; } }, n.at);
    });
    // As it starts, fonts in: DM Sans has no tabular digits here, so a counting figure would nudge the words on its line.
    // Those figures tick in at their value, the way the dashboard shows a changed figure; figures on their own count up.
    let started = false;
    tl.eventCallback('onStart', () => {
      if (started) return;
      started = true;
      nums.forEach(n => { n.el.textContent = n.text; });
      nums.forEach(n => { n.tick = wordsAfter(n.el); n.w = parseFloat(getComputedStyle(n.el).width); });
      nums.forEach(n => {
        if (n.tick) gsap.fromTo(n.el, { display: 'inline-block', y: '.45em', autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .45, delay: n.at + .15, ease: 'power3.out', clearProps: 'all' });
        else { if (n.w) n.el.style.minWidth = n.w + 'px'; n.el.textContent = fmt(n.f, 0); }
      });
    });
    const grow = (bars, at, stagger) => bars.length && tl.fromTo(bars, { scaleX: 0 }, { scaleX: (i, el) => parseFloat(getComputedStyle(el.parentNode).getPropertyValue('--v')) || 0, duration: 1, ease: 'power2.out', stagger, clearProps: 'transform' }, at);
    grow($$('.m1-bar i', root).filter(b => !b.closest('.m1-sell')), 0, .06);
    grow($$('.m1-sell .m1-bar i', root), .45, .15);
    const plot = root.querySelector('.m1-plot svg');
    if (plot) {
      tl.fromTo(plot, { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'power1.inOut', clearProps: 'clipPath' }, .1)
        .fromTo($$('.m1-dot', root), { scale: 0 }, { scale: 1, duration: .3, ease: 'back.out(2.2)', stagger: 1.1 / 7, clearProps: 'transform' }, .12);
    }
    const page = root.querySelector('.m1-page');
    if (page) {
      tl.from(page, { autoAlpha: 0, y: 14, duration: .6, ease: 'power3.out' }, 1)
        .from($$('tbody tr', page), { autoAlpha: 0, x: -10, duration: .45, ease: 'power2.out', stagger: .12 }, 1.2);
    }
    return tl;
  };

  // the live dot pulses only while its dashboard is on screen
  const pulse = el => { if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => el.classList.toggle('is-in', e.isIntersecting)).observe(el); };

  // Hero: pro.js adds this to the dashboard's entrance, then lights the four answers.
  const ov = document.querySelector('.dash-shot [data-m1-ov]');
  if (ov) {
    pulse(ov);
    MO.m1.heroIn = () => (motion ? build(ov).paused(false) : gsap.timeline());
  }

  // Six tabs: when they close, the same Overview fills the browser frame; it counts up once, as it appears.
  const host = document.querySelector('[data-m1-clone]');
  if (ov && host) {
    const view = ov.cloneNode(true);
    view.querySelector('.m1-sprite').remove();
    view.querySelectorAll('.m1-ring').forEach(r => r.remove());
    // the frame carries the label; the copy inside is its picture
    ['data-m1-ov', 'role', 'aria-label'].forEach(a => view.removeAttribute(a));
    view.classList.add('is-tab');
    host.replaceChildren(view);
    pulse(view);
    if (motion) {
      const tl = build(view);
      const watch = new MutationObserver(() => { if (host.classList.contains('is-on')) { watch.disconnect(); tl.play(0); } });
      watch.observe(host, { attributes: true, attributeFilter: ['class'] });
    }
  }

  // Step 06: plays once, when a third of it is on screen.
  const an = document.querySelector('[data-m1-an]');
  if (an && motion) {
    const tl = build(an);
    MO.onView(an, () => tl.play(0));
  }
})();
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
