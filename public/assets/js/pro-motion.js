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
  // euros the way the dashboard writes them in the page's language (€1,060.00 · 1 060,00 €)
  const LOCALE = { en: 'en-GB', fr: 'fr-FR', es: 'es-ES', uk: 'uk-UA' };
  const eur = (n, digits = 2) => new Intl.NumberFormat(LOCALE[lang()] || 'en-GB', { style: 'currency', currency: 'EUR', minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n);

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

  // without GSAP nothing counts or draws, but the six-tabs frame still gets its copy of the Overview
  const gsap = window.gsap;
  const motion = !MO.reduce && !!gsap;
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
    MO.m1.heroIn = () => (motion ? build(ov).paused(false) : null);
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
// Step 01 builder, step 02 concepts to posters, step 03 tiers. Counts come from IMIN_MO.night;
// the words they type or swap are read from the HTML, so a translated page animates its own copy.
(() => {
  const MO = window.IMIN_MO;
  if (!MO) return;
  const N = MO.night;
  N.type = 'Club';      // step 01: the event type picked in the builder (a club night)
  N.country = 'France'; // step 01: the builder's country field (Metz)

  const q = (r, k) => r.querySelector(`[data-m2="${k}"]`);
  const qa = (r, k) => Array.from(r.querySelectorAll(`[data-m2="${k}"]`));
  const set = (el, c, on = true) => { if (el) el.classList.toggle(c, on); };
  const val = el => el.querySelector('.m2-v');
  const wait = MO.wait;
  const press = async el => { set(el, 'is-press'); await wait(150); set(el, 'is-press', false); };

  // Types `text` back into a field one character at a time; `each` mirrors every step elsewhere.
  const typeIn = async (box, text, ms, each) => {
    set(box, 'is-typing');
    for (let i = 1; i <= text.length; i++) {
      val(box).textContent = text.slice(0, i);
      set(box, 'is-empty', false);
      if (each) each(text.slice(0, i), i);
      await wait(ms);
    }
    set(box, 'is-typing', false);
  };

  // Arms a board in its first state and plays it once in view. Reduced motion never arms,
  // so the HTML (the final state) stays as it is; `done` lands on that same final state.
  const board = (root, arm, play, done) => {
    if (!root || MO.reduce) return;
    // the first state is set without transitions, so nothing rewinds on screen at load
    set(root, 'm2-still');
    arm();
    void root.offsetWidth;
    requestAnimationFrame(() => set(root, 'm2-still', false));
    MO.onView(root, final => (final ? done() : play().then(done, done)));
  };

  /* ---- 01 the page: type the night in, the preview follows ---- */
  const page = document.querySelector('.m2-page');
  if (page) {
    const f = k => q(page, k);
    const name = f('name'), genre = f('genre'), type = f('type'), starts = f('starts'), ends = f('ends');
    const country = f('country'), city = f('city'), scroll = f('scroll'), chips = f('chips');
    const chipG = f('chip-genre'), chipT = f('chip-type');
    const pvName = f('pv-name'), pvDate = f('pv-date'), pvDur = f('pv-dur'), pvPlace = f('pv-place');
    const nameText = val(name).textContent, cityText = val(city).textContent;
    const empties = [name, genre, starts, ends, country, city, pvName, pvDate, pvPlace];
    const fields = [name, genre, starts, ends, country, city];
    board(page,
      () => {
        empties.forEach(el => set(el, 'is-empty'));
        [name, city, pvName].forEach(el => { val(el).textContent = ''; });
        set(type, 'is-on', false);
        [chips, pvDur].forEach(el => set(el, 'is-shut'));
        [chipG, chipT].forEach(el => set(el, 'is-off'));
        set(scroll, 'is-top');
        ['is-a', 'is-dis'].forEach(c => set(city, c));
      },
      async () => {
        await wait(300);
        set(name, 'is-focus');
        await typeIn(name, nameText, 50, s => { val(pvName).textContent = s; set(pvName, 'is-empty', false); });
        await wait(200);
        set(name, 'is-focus', false);
        set(genre, 'is-focus');
        await wait(250);
        set(genre, 'is-empty', false);
        set(chips, 'is-shut', false);
        set(chipG, 'is-off', false);
        await wait(300);
        set(genre, 'is-focus', false);
        set(type, 'is-on');
        set(chipT, 'is-off', false);
        await wait(400);
        // on to the date: a start presets the end two hours later, as the builder does, then the end is moved
        set(scroll, 'is-top', false);
        set(scroll, 'is-mid');
        await wait(450);
        set(starts, 'is-focus');
        await wait(200);
        [starts, ends, pvDate].forEach(el => set(el, 'is-empty', false));
        [ends, pvDate, pvDur].forEach(el => set(el, 'is-a'));
        set(pvDur, 'is-shut', false);
        await wait(400);
        set(starts, 'is-focus', false);
        set(ends, 'is-focus');
        await wait(300);
        [ends, pvDate, pvDur].forEach(el => set(el, 'is-a', false));
        await wait(300);
        set(ends, 'is-focus', false);
        // then the place: the country first, the city search opens after it
        set(scroll, 'is-mid', false);
        await wait(300);
        set(country, 'is-focus');
        await wait(200);
        [country, pvPlace].forEach(el => set(el, 'is-empty', false));
        set(pvPlace, 'is-a');
        ['is-a', 'is-dis'].forEach(c => set(city, c, false));
        await wait(250);
        set(country, 'is-focus', false);
        set(city, 'is-focus');
        await typeIn(city, cityText, 70);
        await wait(200);
        set(pvPlace, 'is-a', false);
        set(city, 'is-focus', false);
      },
      () => {
        empties.forEach(el => set(el, 'is-empty', false));
        val(name).textContent = val(pvName).textContent = nameText;
        val(city).textContent = cityText;
        fields.forEach(el => { set(el, 'is-focus', false); set(el, 'is-typing', false); });
        set(type, 'is-on');
        [chips, pvDur].forEach(el => set(el, 'is-shut', false));
        [chipG, chipT].forEach(el => set(el, 'is-off', false));
        [ends, pvDate, pvDur, pvPlace, city].forEach(el => set(el, 'is-a', false));
        set(city, 'is-dis', false);
        set(scroll, 'is-top', false);
        set(scroll, 'is-mid', false);
      });
  }

  /* ---- 02 the poster: a brief, three concepts, one picked; a vibe, three posters ---- */
  const pst = document.querySelector('.m2-poster');
  if (pst) {
    const f = k => q(pst, k);
    const brief = f('brief'), count = f('count'), gen = f('gen'), status = f('status'), empty = f('empty');
    const c1 = f('c1'), c2 = f('c2'), d1 = f('d1'), d2 = f('d2'), use = f('use'), aiIn = f('ai-in'), aiR = f('ai-r');
    const v1 = f('v1'), v2 = f('v2'), genp = f('genp'), vars = f('vars'), p1 = f('p1');
    const step1 = pst.querySelector('.m2-st1'), vibeLabel = pst.querySelector('.m2-pfl .m2-f1');
    const briefText = val(brief).textContent, t1 = d1.textContent, t2 = d2.textContent;
    count.textContent = briefText.length;
    // descriptions arrive the way AI Studio streams them: 6 characters every 18 ms
    const stream = async (el, text) => {
      set(el.parentNode, 'is-run');
      for (let i = 6; i < text.length + 6; i += 6) { el.textContent = text.slice(0, i); await wait(18); }
      set(el.parentNode, 'is-run', false);
    };
    board(pst,
      () => {
        ['is-ai', 'is-v1'].forEach(c => set(pst, c));
        set(brief, 'is-empty');
        val(brief).textContent = '';
        count.textContent = '0';
        set(gen, 'is-dim');
        status.dataset.s = '0';
        set(empty, 'is-on');
        [c1, c2].forEach(el => set(el, 'is-off'));
        d1.textContent = d2.textContent = '';
        [step1, vibeLabel].forEach(el => set(el, 'is-a'));
        set(v1, 'is-on');
        set(v2, 'is-on', false);
        set(p1, 'is-sel', false);
      },
      async () => {
        await wait(300);
        set(brief, 'is-focus');
        await typeIn(brief, briefText, 10, (s, i) => { count.textContent = i; if (i >= 10) set(gen, 'is-dim', false); });
        await wait(150);
        set(brief, 'is-focus', false);
        await press(gen);
        set(gen, 'is-a');
        set(empty, 'is-a');
        // on a phone the studio is one column: the page scrolls on to the concepts
        const y = aiR.getBoundingClientRect().top - aiIn.getBoundingClientRect().top - parseFloat(getComputedStyle(aiIn).paddingTop);
        if (y > 4) aiIn.style.translate = `0 ${-Math.round(y)}px`;
        await wait(450);
        set(gen, 'is-a', false);
        ['is-on', 'is-a'].forEach(c => set(empty, c, false));
        status.dataset.s = '1';
        [c1, c2].forEach(el => set(el, 'is-off', false));
        await stream(d1, t1);
        await stream(d2, t2);
        delete status.dataset.s;
        await wait(250);
        await press(use);
        await wait(200);
        // the concept becomes a draft night; its posters are made in Poster Studio
        set(pst, 'is-ai', false);
        await wait(700);
        set(v1, 'is-on', false);
        set(v2, 'is-on');
        set(vibeLabel, 'is-a', false);
        await wait(400);
        await press(genp);
        set(vars, 'is-a');
        set(pst, 'is-gen');
        set(pst, 'is-v1', false);
        set(step1, 'is-a', false);
        await wait(700);
        set(vars, 'is-a', false);
        set(pst, 'is-gen', false);
        set(p1, 'is-sel');
        await wait(500);
      },
      () => {
        ['is-ai', 'is-v1', 'is-gen'].forEach(c => set(pst, c, false));
        ['is-empty', 'is-focus', 'is-typing'].forEach(c => set(brief, c, false));
        val(brief).textContent = briefText;
        count.textContent = briefText.length;
        ['is-dim', 'is-a'].forEach(c => set(gen, c, false));
        delete status.dataset.s;
        ['is-on', 'is-a'].forEach(c => set(empty, c, false));
        [c1, c2].forEach(el => set(el, 'is-off', false));
        d1.textContent = t1;
        d2.textContent = t2;
        [step1, vibeLabel, vars].forEach(el => set(el, 'is-a', false));
        set(v1, 'is-on', false);
        set(v2, 'is-on');
        set(p1, 'is-sel');
        aiIn.style.translate = '';
      });
  }

  /* ---- 03 tickets: the night's tiers fill up, Early Bird sells out ---- */
  const tix = document.querySelector('.m2-tix');
  if (tix) (() => {
    const T = N.tiers, n = T.length;
    const fills = qa(tix, 'fill'), sold = qa(tix, 'sold'), caps = qa(tix, 'cap'), left = qa(tix, 'left'), state = qa(tix, 'state'), price = qa(tix, 'price');
    const share = t => (t.cap > 0 ? Math.min(1, t.sold / t.cap) : 0);
    if (sold.length !== 2 * n || left.length !== n) return; // the markup draws one row per tier of the night
    // the legend lists the tiers first, then the rows do: index i and i + n are the same tier
    const show = (i, s) => {
      const t = T[i];
      sold[i].textContent = sold[i + n].textContent = s;
      left[i].textContent = Math.max(0, t.cap - s);
      set(state[i], 'is-out', t.cap > 0 && s >= t.cap);
    };
    qa(tix, 'cols').forEach(el => { el.style.gridTemplateColumns = T.map(t => `${t.cap}fr`).join(' '); });
    q(tix, 'total').textContent = N.capacity;
    T.forEach((t, i) => {
      [fills[i], fills[i + n]].forEach(el => el.style.setProperty('--f', share(t).toFixed(4)));
      caps[i].textContent = caps[i + n].textContent = t.cap;
      price[i].textContent = MO.eur(t.price);
      show(i, t.sold);
    });
    board(tix,
      () => { set(tix, 'is-zero'); T.forEach((t, i) => show(i, 0)); },
      async () => {
        await wait(250);
        set(tix, 'is-zero', false);
        // the bars ease to their share in CSS over 1.6 s; the counts follow the same curve
        await Promise.all(T.map(async (t, i) => {
          await wait(i * 120);
          await MO.countUp(sold[i + n], t.sold, { dur: 1.6, fmt: x => { const s = Math.round(x); show(i, s); return String(s); } });
        }));
      },
      () => { set(tix, 'is-zero', false); T.forEach((t, i) => show(i, t.sold)); });
  })();
})();
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
