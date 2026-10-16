/* IMIN · creators page imin.wtf/pro */
(() => {
  /* Every sentence and amount this script writes lives in i18n/en.js (and i18n/<lang>.js); {name} slots go through fill(). */
  const T = window.IMIN_I18N ? window.IMIN_I18N.pick('pro') : {};
  const fill = (s, v) => s.replace(/\{(\w+)\}/g, (_, k) => v[k] ?? '');

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // the six-tabs scene is pinned to the scroll only where it can be read whole; phones play it once instead
  const pinTabs = window.matchMedia('(min-width: 760px)').matches;
  const wait = ms => new Promise(res => setTimeout(res, reduce ? 0 : ms));
  const C = (window.IMIN && window.IMIN.pro) || {};
  const L = C.links || {};

  /* images: resolve once decoded, so a reveal never animates an empty frame */
  const ready = img => !img ? Promise.resolve() : (img.complete && img.naturalWidth ? (img.decode ? img.decode().catch(() => {}) : Promise.resolve())
    : new Promise(res => { img.addEventListener('load', () => res(img.decode ? img.decode().catch(() => {}) : null), { once: true }); img.addEventListener('error', res, { once: true }); setTimeout(res, 4000); }));
  // after the page has loaded, fetch the lazy images in the background so they are there before the reader is,
  // unless the visitor asked to save data; each image's srcset still picks the right-sized file
  addEventListener('load', () => setTimeout(() => {
    if (navigator.connection && navigator.connection.saveData) return;
    $$('img[loading="lazy"]').forEach(i => { i.loading = 'eager'; });
  }, 600), { once: true });

  /* analytics: events from the spec, pushed to a dataLayer for whatever reads it */
  const track = (event, params = {}) => { (window.dataLayer = window.dataLayer || []).push({ event, ...params }); };

  /* header */
  const top = $('.top');
  const onScroll = () => top.classList.toggle('scrolled', window.scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  document.addEventListener('click', e => {
    $$('details.lang[open]').forEach(d => { if (!d.contains(e.target)) d.open = false; });
  });

  /* tells the team someone started booking; a failed beacon never holds up the visitor's click */
  const ping = url => { try { navigator.sendBeacon(url); } catch (e) {} };

  /* links from config (page links, then the shared ones); a link with no URL yet stays hidden, the call falls back to the form */
  $$('[data-link]').forEach(a => {
    const k = a.dataset.link;
    const raw = L[k] || ((window.IMIN && window.IMIN.links) || {})[k];
    // a link inside this site stays in the page's language (/ → /fr)
    const lang = (document.documentElement.lang || 'en').slice(0, 2);
    const u = raw && lang !== 'en' && /^\/(?!assets\/|api\/)/.test(raw) ? '/' + lang + (raw === '/' ? '' : raw) : raw;
    if (u) {
      a.href = u;
      a.hidden = false;
      if (k === 'call') a.addEventListener('click', () => ping('/api/call-click'));
      return;
    }
    if (k !== 'call') { a.hidden = true; return; }
    a.removeAttribute('target');
    a.removeAttribute('rel');
    if (!a.dataset.pitch) a.dataset.pitch = 'planned';
    a.href = '#pitch';
    const ico = $('use', a);
    if (ico) ico.setAttribute('href', '#i-arrow-right');
  });

  /* CREATE YOUR NIGHT: count it, and remember the visit so a return shows the softer ways in */
  const FLAG = 'imin-pro-signup';
  $$('[data-create]').forEach(a => a.addEventListener('click', () => {
    track('pro_create_click', { place: a.dataset.create });
    try { sessionStorage.setItem(FLAG, '1'); } catch (e) {}
  }));
  const doubt = $('[data-doubt]');
  const checkReturn = () => {
    let back = false;
    try { back = sessionStorage.getItem(FLAG) === '1'; } catch (e) {}
    if (back && doubt.hidden) {
      doubt.hidden = false;
      if (window.ScrollTrigger) requestAnimationFrame(() => ScrollTrigger.refresh());
      track('signup_doubt_block_shown', { trigger: 'return' });
    }
  };
  checkReturn();
  addEventListener('pageshow', checkReturn);
  $$('[data-alt]').forEach(a => a.addEventListener('click', () => {
    const p = { type: a.dataset.alt, place: a.dataset.place || closestPlace(a) };
    if (a.dataset.channel) p.channel = a.dataset.channel;
    track('pro_alt_click', p);
  }));
  const closestPlace = el => (el.closest('section, aside') || {}).id || 'page';

  /* ---------- the one form: Send us your night / Pitch us your night ---------- */
  const pitch = $('#pitch');
  const form = $('#pitch-form');
  const whatLabel = $('[data-what-label]');
  const WHAT = { planned: T.whatPlanned, idea: T.whatIdea, company: T.whatCompany };
  const setType = t => {
    const r = form.elements.type;
    Array.from(r).forEach(i => { i.checked = i.value === t; });
    whatLabel.textContent = WHAT[t] || WHAT.planned;
  };
  form.addEventListener('change', e => { if (e.target.name === 'type') setType(e.target.value); });
  const openPitch = type => {
    setType(type);
    pitch.classList.remove('lit'); void pitch.offsetWidth; pitch.classList.add('lit');
    setTimeout(() => { const f = $('#pf-name'); if (f) f.focus({ preventScroll: true }); }, reduce ? 0 : 900);
  };
  $$('[data-pitch]').forEach(a => a.addEventListener('click', () => {
    if (a.getAttribute('href') !== '#pitch') return;
    openPitch(a.dataset.pitch);
  }));

  const err = $('[data-pitch-err]');
  const done = $('[data-pitch-done]');
  const ERR = { name: T.errName, contact: T.errContact, what: T.errWhat };
  const fail = (msg, field) => { err.textContent = msg; err.hidden = false; if (field) field.focus(); };
  let sending = false;
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (sending) return;
    err.hidden = true;
    if (form.elements.company_site.value) return;
    const bad = ['name', 'contact', 'what'].map(n => form.elements[n]).find(f => !f.value.trim());
    if (bad) return fail(ERR[bad.name], bad);
    const link = form.elements.link;
    // the server takes https links only, so say so here rather than after a failed send
    if (link.value && (!link.checkValidity() || !/^https:\/\//i.test(link.value.trim()))) return fail(T.errLink, link);
    if (!form.elements.ok.checked) return fail(T.errConsent);
    const data = Object.fromEntries(new FormData(form));
    delete data.company_site;
    data.consent = true;
    data.lang = document.documentElement.lang;
    track('pitch_form_submit', { type: data.type });
    sending = true;
    try {
      if (!C.pitchEndpoint) throw new Error('no pitch endpoint');
      const res = await fetch(C.pitchEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error('pitch ' + res.status);
    } catch (x) {
      return fail(T.errSend);
    } finally {
      sending = false;
    }
    form.hidden = true;
    done.innerHTML = '<svg class="ico gen" aria-hidden="true"><use href="#i-check"/></svg><div class="gen"><b></b><p></p></div>';
    $('b', done).textContent = fill(T.doneTitle, { name: data.name.trim().split(/\s+/)[0] });
    $('p', done).textContent = fill(T.doneText, { contact: data.contact.trim() });
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  });

  /* ---------- Earn: your price + the IMIN fee = what your guest pays ---------- */
  const range = $('#calc-price');
  if (range) {
    const { eur, cents } = T;
    const paint = () => {
      const p = Number(range.value);
      const fee = p ? Math.round((p * 0.05 + 0.99) * 100) / 100 : 0;
      $('[data-price]').textContent = p ? eur(p) : T.free;
      $('[data-yours]').textContent = p ? cents(p) : T.zero;
      $('[data-total]').textContent = p ? cents(p + fee) : T.zero;
      $('[data-fee]').textContent = p ? cents(fee) : T.zero;
      $('[data-note]').textContent = p ? T.feeNote : T.freeNote;
      range.style.setProperty('--p', (p / Number(range.max) * 100) + '%');
    };
    range.addEventListener('input', paint);
    paint();
  }

  /* ---------- IMIN x you ---------- */
  const you = $('[data-you]');
  const yourName = $('#imx-name');
  if (you && yourName) yourName.addEventListener('input', () => { you.textContent = yourName.value.trim() || T.you; });

  /* ---------- FAQ: smooth open and close ---------- */
  $$('.acc details').forEach(d => {
    const s = $('summary', d), a = $('.acc-a', d);
    s.addEventListener('click', e => {
      e.preventDefault();
      // an answer changes the page height, so the reveals below it are re-measured
      const relayout = () => { if (window.ScrollTrigger) ScrollTrigger.refresh(); };
      if (reduce) { d.open = !d.open; relayout(); if (d.open) track('faq_open', { question_id: d.dataset.q }); return; }
      if (d.open) {
        a.animate([{ height: a.offsetHeight + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 320, easing: 'cubic-bezier(.2,.7,.2,1)' }).onfinish = () => { d.open = false; relayout(); };
        $('.ico', s).style.transform = 'none';
      } else {
        d.open = true;
        $('.ico', s).style.transform = '';
        a.animate([{ height: '0px', opacity: 0 }, { height: a.offsetHeight + 'px', opacity: 1 }], { duration: 420, easing: 'cubic-bezier(.2,.7,.2,1)' }).onfinish = relayout;
        track('faq_open', { question_id: d.dataset.q });
      }
    });
  });

  /* phone dock + header button: after the hero's button scrolls away */
  const heroBtn = $('.hero .btn-door');
  const dock = $('[data-dock]');
  const topCta = $('.top-cta');
  if (heroBtn && 'IntersectionObserver' in window) {
    const dockLinks = $$('a', dock);
    let past = false, atForm = false;
    // the dock steps aside while a Create button in the page itself is on screen
    const inline = new Set();
    const paint = () => {
      const show = past && !atForm && !inline.size;
      dock.classList.toggle('show', show);
      dock.setAttribute('aria-hidden', String(!show));
      dockLinks.forEach(a => { a.tabIndex = show ? 0 : -1; });
      topCta.classList.toggle('show', past);
    };
    new IntersectionObserver(([en]) => { past = !en.isIntersecting && en.boundingClientRect.top < 0; paint(); }).observe(heroBtn);
    new IntersectionObserver(([en]) => { atForm = en.isIntersecting; paint(); }).observe($('#pitch'));
    const inPage = new IntersectionObserver(ens => {
      ens.forEach(en => { if (en.isIntersecting) inline.add(en.target); else inline.delete(en.target); });
      paint();
    });
    $$('main .btn-door[data-create]').filter(b => b !== heroBtn).forEach(b => inPage.observe(b));
  }

  /* which sections get read */
  if ('IntersectionObserver' in window) {
    const seen = new Set();
    const io = new IntersectionObserver(ens => ens.forEach(en => {
      if (en.isIntersecting && !seen.has(en.target.id)) { seen.add(en.target.id); track('pro_section_view', { section_id: en.target.id }); }
    }), { threshold: .3 });
    $$('main > section[id]').forEach(s => io.observe(s));
  }

  /* hero thoughts without GSAP: the dashboard simply stays answered */
  /* the pile of tool windows is drawn at a fixed size and scaled to fit the browser frame */
  const view = $('[data-view]');
  if (view) {
    const fit = () => {
      // pinned: fit the width and the height, so the whole browser and its caption are visible at once; phones: the width
      const cs = getComputedStyle(view), W = +cs.getPropertyValue('--W'), H = +cs.getPropertyValue('--H');
      const box = view.closest('.brw'), room = box.parentElement.clientWidth;
      const s = Math.min(1, (room - 26) / W, pinTabs ? (innerHeight - 300) / H : 1);
      view.style.setProperty('--s', s.toFixed(4));
      box.style.maxWidth = Math.round(W * s + 26) + 'px';
    };
    fit();
    addEventListener('resize', fit);
  }

  if (reduce || !window.gsap || !window.ScrollTrigger) return;

  /* =========================================================
     Motion
     ========================================================= */
  gsap.registerPlugin(ScrollTrigger, ...(window.SplitText ? [SplitText] : []));
  ScrollTrigger.config({ ignoreMobileResize: true });

  // Ties a paused animation to scroll, forward only: it follows the scroll down,
  // and when the reader scrolls back up it stays where it got to instead of rewinding.
  const oneWay = (anim, st) => {
    let max = 0;
    anim.pause();
    return ScrollTrigger.create({
      ...st,
      onUpdate: self => {
        if (self.progress <= max) return;
        max = self.progress;
        gsap.to(anim, { progress: max, duration: .5, ease: 'power1.out', overwrite: true });
      },
      onRefresh: () => { anim.progress(0).invalidate().progress(max); }
    });
  };
  document.documentElement.classList.add('motion');

  if (window.Lenis) {
    const lenis = new Lenis({ lerp: .12 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      const t = a.getAttribute('href');
      if (t.length < 2 || !$(t)) return;
      e.preventDefault();
      lenis.scrollTo(t, { offset: -76 });
    }));
  }

  /* ---------- Hero: the night lands on both sides, the creator's questions get answered ---------- */
  const hero = $('#hero');
  // each thought's answer on the drawn dashboard: the poster, the public page and share, check-ins, revenue
  const spots = $$('.dash-shot [data-spot]').sort((a, b) => a.dataset.spot - b.dataset.spot);
  const thoughts = $$('[data-thoughts] li');
  gsap.set(thoughts, { autoAlpha: 0 });
  gsap.set(['.hero-copy > *', '.dash', '.poster'], { autoAlpha: 0 });

  const heroIn = () => {
    gsap.set(['.hero-copy > *', '.dash', '.poster'], { autoAlpha: 1 });
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    const h1 = $('#hero-h');
    if (window.SplitText) {
      let first = true;
      SplitText.create(h1, { type: 'lines', mask: 'lines', autoSplit: true, onSplit: self => {
        if (!first) return;
        first = false;
        return gsap.from(self.lines, { yPercent: 105, rotate: 3, transformOrigin: '0 100%', duration: 1.1, stagger: .1, delay: .1, ease: 'power3.out' });
      } });
    }
    // what IMIN carries lands under the lead; the founders fade in just before the soft link
    tl.from('.hero-gets li', { y: 12, autoAlpha: 0, duration: .6, stagger: .05 }, .5)
      .from('.hero-team', { autoAlpha: 0, duration: .8 }, .8);
    tl.from('.hero-copy .label', { y: 12, autoAlpha: 0, duration: .7 }, 0)
      .from('.hero-lead', { y: 18, autoAlpha: 0, duration: .9 }, .45)
      .from('.hero-act > *', { y: 18, autoAlpha: 0, duration: .9, stagger: .1, ease: 'back.out(1.8)' }, .6)
      .from('.alt-line', { autoAlpha: 0, duration: .8 }, .9)
      .from('.dash', { y: 60, rotateX: 12, transformPerspective: 1200, transformOrigin: '50% 100%', autoAlpha: 0, duration: 1.2, clearProps: 'transform' }, .2)
      .from('.poster', { y: -90, x: 40, rotation: 14, autoAlpha: 0, duration: 1.2, ease: 'power4.out', clearProps: 'transform' }, .5);
    // the dashboard's figures count up and its chart draws as it lands (pro-motion.js)
    const figures = window.IMIN_MO && IMIN_MO.m1 && IMIN_MO.m1.heroIn();
    if (figures) tl.add(figures, .45);
    // four thoughts, about 2.4 s; each one lights up its answer on the dashboard
    const t0 = 1.6;
    thoughts.forEach((b, i) => {
      const at = t0 + i * .6;
      tl.fromTo(b, { autoAlpha: 0, scale: .5, y: 10, transformOrigin: '100% 100%' }, { autoAlpha: 1, scale: 1, y: 0, duration: .4, ease: 'back.out(2.4)' }, at)
        .fromTo(spots[i] || {}, { autoAlpha: 0, scale: 1.15 }, { autoAlpha: 1, scale: 1, duration: .45, ease: 'power3.out' }, at + .15)
    });
    tl.to(thoughts, { autoAlpha: 0, y: -14, duration: .5, stagger: .06, ease: 'power2.in' }, t0 + thoughts.length * .6 + .9)
      .to(spots, { autoAlpha: 0, duration: .6, stagger: .06 }, '<');
  };
  (document.fonts ? Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 600))]) : Promise.resolve()).then(heroIn);

  gsap.to('.hero-visual', { y: -50, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.poster-card', { yPercent: -14, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });

  // the two sides lean toward the pointer
  const sides = $('.sides');
  if (matchMedia('(hover: hover)').matches && sides) {
    const rx = gsap.quickTo(sides, 'rotationY', { duration: .8, ease: 'power3' });
    const ry = gsap.quickTo(sides, 'rotationX', { duration: .8, ease: 'power3' });
    gsap.set(sides, { transformPerspective: 1400 });
    let r = null;
    hero.addEventListener('pointerenter', () => { r = hero.getBoundingClientRect(); });
    addEventListener('scroll', () => { r = null; }, { passive: true });
    hero.addEventListener('pointermove', e => {
      if (!r) r = hero.getBoundingClientRect();
      rx(((e.clientX - r.left) / r.width - .5) * 7);
      ry(-((e.clientY - r.top) / r.height - .5) * 5);
    });
    hero.addEventListener('pointerleave', () => { rx(0); ry(0); });
  }

  /* ---------- section titles and leads ---------- */
  document.fonts?.ready.then(() => {
    if (window.SplitText) $$('.sec .t-h1, .earn-h, .final-h, .band-h').forEach(el => {
      let played = false;
      SplitText.create(el, { type: 'lines', mask: 'lines', autoSplit: true, onSplit: self => {
        if (played) return;
        return gsap.from(self.lines, { yPercent: 110, rotate: 2, transformOrigin: '0 100%', duration: 1.1, stagger: .08, scrollTrigger: { trigger: el, start: 'top 95%', once: true, onEnter: () => { played = true; } } });
      } });
    });
    ScrollTrigger.refresh();
  });
  $$('.sec-top .lead, .sec-title .label, .col-head > .label, .col-head > .cap, .insight-foot > *, .sec-foot > *').forEach(el => {
    gsap.from(el, { y: 20, opacity: 0, duration: 1, scrollTrigger: { trigger: el, start: 'top 98%' } });
  });

  /* ---------- Six browser tabs: their windows pile up as you scroll, then get swept away and IMIN stays, forward only ---------- */
  const brw = $('[data-brw]');
  if (brw) {
    const tabs = $$('.bt:not(.bt-imin)', brw);
    const imin = $('.bt-imin', brw);
    const wins = $$('.cw', brw);
    const iminView = $('.bv-imin', brw);
    const url = $('[data-url]', $('.brw-url', brw));
    const count = $('[data-count]', brw);
    let shown = -1;
    const show = i => {
      if (i === shown) return;
      shown = i;
      const tab = i < 6 ? tabs[i] : imin;
      [...tabs, imin].forEach(t => t.classList.toggle('is-on', t === tab));
      iminView.classList.toggle('is-on', i === 6);
      url.innerHTML = tab.dataset.url;
    };
    gsap.set(imin, { display: 'flex', maxWidth: 0, paddingLeft: 0, paddingRight: 0, opacity: 0 });
    const pile = gsap.timeline({
      paused: true,
      onUpdate: () => {
        const t = pile.time();
        show(t >= 6.6 ? 6 : Math.min(5, Math.floor(t + .35)));
        count.textContent = t >= 6.6 ? T.tabsOne : T.tabsMany;
      }
    });
    wins.slice(1).forEach((w, i) => pile.fromTo(w, { y: 90, scale: .9, opacity: 0, rotation: 4 }, { y: 0, scale: 1, opacity: 1, rotation: 0, duration: .55, ease: 'back.out(1.4)' }, i + .65));
    pile.to(wins, { y: 140, scale: .55, opacity: 0, duration: .5, ease: 'power2.in', stagger: { each: .05, from: 'end' } }, 6)
      .to(tabs, { maxWidth: 0, paddingLeft: 0, paddingRight: 0, opacity: 0, duration: .4, ease: 'power2.in', stagger: { each: .06, from: 'end' } }, 6)
      .to(imin, { maxWidth: 260, paddingLeft: 12, paddingRight: 12, opacity: 1, duration: .45, ease: 'power3.out' }, 6.5)
      .to({}, { duration: .5 });
    if (pinTabs) oneWay(pile, { trigger: brw, start: 'center 54%', end: () => '+=' + Math.round(innerHeight * 1.8), pin: true, anticipatePin: 1 });
    else ScrollTrigger.create({ trigger: brw, start: 'top 65%', once: true, onEnter: () => pile.timeScale(1.6).play() });
    gsap.from('.brw', { y: 60, opacity: 0, duration: 1.1, ease: 'power4.out', scrollTrigger: { trigger: brw, start: 'top 92%' } });
  }

  /* ---------- people ---------- */
  [['.band img', '.band'], ['.imx-media img', '.imx']].forEach(([sel, trig]) => {
    const img = $(sel);
    if (!img) return;
    const zoom = gsap.fromTo(img, { scale: 1.12, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.4, ease: 'power3.out', paused: true });
    ScrollTrigger.create({ trigger: trig, start: 'top 95%', once: true, onEnter: () => ready(img).then(() => zoom.play()) });
  });

  /* ---------- Steps: each card settles, the one behind steps back ---------- */
  const mm = gsap.matchMedia();
  const steps = $$('.step');
  mm.add('(min-width: 960px)', () => {
    steps.forEach((s, i) => {
      const next = steps[i + 1];
      if (!next) return;
      oneWay(gsap.to(s, { scale: .95, ease: 'none', paused: true }), { trigger: next, start: 'top bottom', end: 'top 30%' });
    });
  });
  steps.forEach(s => {
    gsap.from($$('.step-text > *', s), { y: 24, opacity: 0, duration: .9, stagger: .08, scrollTrigger: { trigger: s, start: 'top 92%' } });
    const mock = $('.mock', s);
    const reveal = gsap.from(mock, { y: 40, opacity: 0, duration: 1, ease: 'expo.out', paused: true });
    ScrollTrigger.create({ trigger: s, start: 'top 92%', once: true, onEnter: () => ready($('img', mock)).then(() => reveal.play()) });
  });

  /* ---------- Why ---------- */
  gsap.from('.reasons li', { y: 30, opacity: 0, duration: .9, stagger: .1, ease: 'expo.out', scrollTrigger: { trigger: '.reasons', start: 'top 92%' } });
  gsap.from('.faces-row img', { scale: .5, opacity: 0, duration: .8, stagger: .12, ease: 'back.out(2)', scrollTrigger: { trigger: '.faces', start: 'top 97%' } });

  /* ---------- Earn: the numbers land ---------- */
  const earn = $('#earn');
  if (earn) {
    $$('.fig', earn).forEach((f, i) => {
      const n = $('.fig-n', f);
      n.innerHTML = `<span style="display:inline-block">${n.textContent}</span>`;
      f.style.overflow = 'hidden';
      gsap.from($('span', n), { yPercent: 110, duration: 1, ease: 'power4.out', delay: i * .12, scrollTrigger: { trigger: '.figs', start: 'top 94%' } });
      gsap.from($('p', f), { y: 16, opacity: 0, duration: .8, delay: .3 + i * .12, scrollTrigger: { trigger: '.figs', start: 'top 94%' } });
    });
    gsap.from('.calc', { y: 30, opacity: 0, duration: 1, scrollTrigger: { trigger: '.calc', start: 'top 97%' } });
  }

  /* ---------- What you can create ---------- */
  gsap.from('.kind', { y: 40, opacity: 0, duration: 1, ease: 'expo.out', stagger: .07, scrollTrigger: { trigger: '.kinds', start: 'top 94%' } });
  gsap.from(['.imx-lock > svg', '.imx-row'], { yPercent: 60, opacity: 0, duration: 1, ease: 'power4.out', stagger: .12, scrollTrigger: { trigger: '.imx', start: 'top 92%' } });

  /* ---------- How you start: the line runs from sign-up to the door ---------- */
  const road = $('[data-road]');
  if (road) {
    oneWay(gsap.fromTo(road, { '--road': 0 }, { '--road': 1, ease: 'none', paused: true }), { trigger: road, start: 'top 92%', end: 'bottom 55%' });
    gsap.from($$('li', road), { y: 30, opacity: 0, duration: .9, stagger: .12, scrollTrigger: { trigger: road, start: 'top 92%' } });
    gsap.from('.code i', { y: -10, opacity: 0, duration: .4, stagger: .07, ease: 'back.out(2)', scrollTrigger: { trigger: '.code', start: 'top 98%' } });
  }

  /* ---------- FAQ + final ---------- */
  gsap.from('.acc details', { y: 16, opacity: 0, duration: .7, stagger: .05, scrollTrigger: { trigger: '.acc', start: 'top 94%' } });
  gsap.fromTo('.final-photo img', { yPercent: -8, scale: 1.1 }, { yPercent: 4, scale: 1, ease: 'none', scrollTrigger: { trigger: '.final', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.from('.final .btn-door', { scale: .9, y: 16, duration: .9, ease: 'back.out(2)', scrollTrigger: { trigger: '.final', start: 'top 85%' } });
  gsap.from('.way', { y: 36, opacity: 0, duration: 1, ease: 'expo.out', stagger: .1, scrollTrigger: { trigger: '.ways', start: 'top 95%' } });
  gsap.from('.foot-cols > div', { y: 24, opacity: 0, duration: .8, stagger: .06, scrollTrigger: { trigger: '.foot-cols', start: 'top 98%' } });

  // an image that lands after the triggers were measured can push down what is below it: measure again then
  let measured = 0, reflow;
  ScrollTrigger.addEventListener('refresh', () => { measured = document.documentElement.scrollHeight; });
  $$('main img').forEach(i => { if (!i.complete) i.addEventListener('load', () => {
    clearTimeout(reflow);
    reflow = setTimeout(() => { if (document.documentElement.scrollHeight !== measured) ScrollTrigger.refresh(); }, 150);
  }, { once: true }); });

  /* keep trigger positions right: page order first, then again once everything has loaded */
  ScrollTrigger.sort();
  ScrollTrigger.refresh();
  addEventListener('load', () => { ScrollTrigger.sort(); ScrollTrigger.refresh(); }, { once: true });
})();
