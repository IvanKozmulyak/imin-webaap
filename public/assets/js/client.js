
(() => {
  /* Every string this script puts on the page. Another language adds its own key, picked by <html lang>. */
  const STRINGS = {
    en: {
      intro: ['should I go out tonight?', 'Don’t overthink it.', 'I’m in'],
      typing: 'IMIN is typing',
      imIn: 'I’m in',
      soon: 'Coming soon',
      ready: { playlist: 'Listen' },
      night: {
        label: 'The next night',
        notif: n => (n.city ? `Hey. ${n.day} in ${n.city}. Music first. You in?` : `Hey. ${n.day}. Music first. You in?`),
        when: n => `${n.day}, ${n.time}`,
        price: { soldout: 'Sold out', free: 'Free', from: amount => `From ${amount}` }
      },
      noDate: {
        label: 'The next night, date to come',
        when: '??.??',
        time: 'Date soon',
        title: 'The next one',
        meta: 'Music first · Metz',
        notif: 'Next date’s not out yet. Want it first?',
        dockWhen: 'Next date soon',
        dockWhat: 'Want it first?'
      },
      mail: {
        needConsent: 'Switch on “Send me IMIN news” first.',
        badEmail: 'That email doesn’t look right.',
        failed: 'That didn’t go through. Try again, or write to ',
        done: 'You’re on the list. See you soon.'
      }
    }
  };
  const LANG = (document.documentElement.lang || 'en').toLowerCase().slice(0, 2);
  const STR = STRINGS[LANG] || STRINGS.en;
  const CFG = window.IMIN || {};

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let lenis = null;
  const wait = ms => new Promise(res => setTimeout(res, reduce ? 0 : ms));
  const two = n => String(n).padStart(2, '0');
  const now = () => { const d = new Date(); return two(d.getHours()) + ':' + two(d.getMinutes()); };
  const paintClock = () => $$('[data-clock]').forEach(el => { el.textContent = now(); });
  paintClock();
  setInterval(paintClock, 20000);

  const top = $('.top');
  const onScroll = () => top.classList.toggle('scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  document.addEventListener('click', e => {
    $$('details.lang[open]').forEach(d => { if (!d.contains(e.target)) d.open = false; });
  });

  const DOTS = '<span class="dots" aria-hidden="true"><i></i><i></i><i></i></span>';
  const go = (el, block) => el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: block || 'start' });
  const add = (parent, cls, html, before) => {
    const li = document.createElement(parent.tagName === 'OL' || parent.tagName === 'UL' ? 'li' : 'div');
    li.className = cls + ' gen';
    li.innerHTML = html;
    parent.insertBefore(li, before || null);
    return li;
  };
  /* ---------------------------------------------------------
     Loading screen: a short chat, then the night. Once per session (flag set inline), about 1.2 s.
     Never waits for images; any tap, scroll or key skips it; off with reduced motion.
     --------------------------------------------------------- */
  const root = document.documentElement;
  const introRun = root.classList.contains('intro-run');
  // scripts that arrive after the first screen has painted skip the intro and the hero entrance
  const late = introRun ? performance.now() > 1000 : root.classList.contains('painted');
  const introEl = $('[data-intro]');
  const intro = (() => {
    if (!introEl) return Promise.resolve();
    if (reduce || late || !introRun) { introEl.classList.add('gone'); return Promise.resolve(); }
    root.classList.add('intro-lock');
    const thread = $('[data-intro-thread]', introEl);
    const load = v => introEl.style.setProperty('--load', v);
    let skip;
    const skipped = new Promise(res => { skip = res; });
    ['pointerdown', 'touchstart', 'wheel'].forEach(t => introEl.addEventListener(t, () => skip(), { once: true, passive: true }));
    addEventListener('keydown', () => skip(), { once: true });
    const pause = ms => Promise.race([wait(ms), skipped]);
    const say = async (cls, text, typing) => {
      if (typing) {
        const t = add(thread, 'b in typing', DOTS);
        await pause(typing);
        t.remove();
      }
      add(thread, cls, '<p>' + text + '</p>');
    };
    const chat = (async () => {
      await pause(150);  load(.3);
      await say('b out', STR.intro[0]);
      load(.6);
      await say('b in', STR.intro[1], 450);
      await pause(250);  load(.85);
      await say('b out yes', STR.intro[2]);
      await pause(350);
    })();
    return Promise.race([chat, skipped]).then(() => {
      load(1);
      introEl.classList.add('out');
      root.classList.remove('intro-lock');
      setTimeout(() => introEl.classList.add('gone'), 950);
    });
  })();

  const iminSays = async (parent, text) => {
    const t = add(parent, 'b in typing', DOTS);
    t.setAttribute('aria-label', STR.typing);
    await wait(1000);
    t.remove();
    add(parent, 'b in', '<p>' + text + '</p>');
  };
  const scrollToEl = (el, center) => {
    if (lenis) lenis.scrollTo(el, { offset: center ? -(innerHeight - el.offsetHeight) / 2 : -72 });
    else el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: center ? 'center' : 'start' });
  };
  const plainClick = e => !(e.button > 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey);

  /* hero: the night's poster and IMIN's message.
     The markup is the neutral state (no JS, before the nights load, API down): no date, "I'm in" opens all nights.
     'night' = a pinned night is on; 'soon' = the API answered and nothing is upcoming. */
  const notif = $('[data-notif]');
  const btnIn = $('[data-reply="in"]');
  const poster = $('[data-poster]');
  const pWhen = $('[data-pwhen]');
  const pTitle = $('[data-ptitle]');
  const pMeta = $('[data-pmeta]');
  const notifText = $('[data-notif-text]');
  const heroNight = $('[data-hero-night]');
  const heroAlt = $('[data-hero-alt]');
  const dockWhat = $('[data-dock-what]');
  const dockGo = $('[data-dock-go]');
  const topWhen = $('[data-top-when]');
  const topGo = $('[data-go-in]');
  const picks = $('[data-picks]');
  let heroState = 'neutral';

  /* the price as the night's own page states it: all-in, in the visitor's language */
  const money = (minor, currency) => {
    const digits = new Intl.NumberFormat(LANG, { style: 'currency', currency }).resolvedOptions().maximumFractionDigits;
    const amount = minor / 10 ** digits;
    const shown = Number.isInteger(amount) ? 0 : digits; // "€18", not "€18.00"
    return new Intl.NumberFormat(LANG, { style: 'currency', currency, minimumFractionDigits: shown, maximumFractionDigits: shown }).format(amount);
  };
  const priceText = p => {
    if (!p) return '';
    if (p.kind === 'soldout') return STR.night.price.soldout;
    if (p.kind === 'free') return STR.night.price.free;
    if (p.kind === 'from' && Number.isSafeInteger(p.minor) && p.minor > 0 && /^[A-Z]{3}$/.test(p.currency)) {
      try { return STR.night.price.from(money(p.minor, p.currency)); } catch (_) { /* a currency this browser can't format: no price */ }
    }
    return '';
  };

  const paintPoster = (label, when, time, title, meta) => {
    poster.setAttribute('aria-label', label);
    const day = document.createElement('span');
    day.textContent = when;
    const small = document.createElement('small');
    small.textContent = time;
    pWhen.replaceChildren(day, small);
    pWhen.hidden = false;
    pTitle.textContent = title;
    // ponytail: two size steps by name length, not a measured fit; a 70+ character name can still crowd the sticker.
    pTitle.classList.toggle('is-long', title.length > 26 && title.length <= 40);
    pTitle.classList.toggle('is-xlong', title.length > 40);
    pMeta.textContent = meta;
    pMeta.hidden = !meta;
  };
  const paintDock = (when, what, href) => {
    const b = document.createElement('b');
    b.textContent = when;
    dockWhat.replaceChildren(b, what);
    dockGo.href = href;
  };
  const paintTop = (when, href) => {
    topWhen.textContent = when;
    topWhen.hidden = false;
    topGo.href = href;
  };
  // under I'M IN: price, day and time, city; read with the button by screen readers
  const paintHeroNight = (n, price) => {
    const parts = [];
    if (price) { const b = document.createElement('b'); b.textContent = price; parts.push(b); }
    const when = document.createElement('span');
    when.textContent = STR.night.when(n);
    parts.push(when);
    if (n.city) { const at = document.createElement('span'); at.textContent = n.city; parts.push(at); }
    heroNight.replaceChildren(...parts.flatMap((el, i) => (i ? [' · ', el] : [el])));
    heroNight.hidden = false;
    btnIn.setAttribute('aria-describedby', heroNight.id);
  };
  let pickChips = [];
  const showNight = n => {
    heroState = 'night';
    poster.dataset.state = 'night';
    paintPoster(STR.night.label, n.day, n.time, n.name, n.meta);
    notifText.textContent = STR.night.notif(n);
    btnIn.href = n.url;
    const price = priceText(n.price);
    paintHeroNight(n, price);
    paintDock(price ? `${n.dock} · ${price}` : n.dock, n.name, n.url);
    paintTop(n.dock, n.url);
    pickChips.forEach(c => c.setAttribute('aria-pressed', String(c.night === n)));
  };
  const showNights = list => {
    if (list.length > 1) {
      pickChips = list.map(n => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'chip pick';
        chip.night = n;
        const day = document.createElement('b');
        day.textContent = n.day;
        chip.append(day, n.name);
        chip.addEventListener('click', () => showNight(n));
        return chip;
      });
      $('[data-picks-row]', picks).replaceChildren(...pickChips);
      picks.hidden = false;
      picks.parentElement.classList.add('has-picks');
    }
    showNight(list[0]);
  };
  const showNoDate = () => {
    const s = STR.noDate;
    heroState = 'soon';
    poster.dataset.state = 'soon';
    paintPoster(s.label, s.when, s.time, s.title, s.meta);
    notifText.textContent = s.notif;
    btnIn.href = '#stay';
    heroAlt.hidden = true; // I'M IN itself leads to Stay close now
    paintDock(s.dockWhen, s.dockWhat, '#stay');
    paintTop(s.dockWhen, '#stay');
  };
  const isNight = n => n && typeof n.name === 'string' && typeof n.day === 'string' && typeof n.time === 'string'
    && typeof n.dock === 'string' && typeof n.meta === 'string' && typeof n.url === 'string' && /^https:\/\//.test(n.url);
  // No config at all says nothing about the nights; an empty list means none is pinned.
  const ids = Array.isArray(CFG.events) ? CFG.events.map(e => e && e.id).filter(Boolean).slice(0, 5) : null;
  (!ids ? Promise.reject(new Error('nights: no config'))
    : ids.length
      ? fetch('/api/nights?' + new URLSearchParams({ ids: ids.join(','), lang: LANG }))
          .then(res => (res.ok ? res.json() : Promise.reject(new Error('nights ' + res.status))))
          .then(data => {
            const list = data && Array.isArray(data.nights) ? data.nights : null;
            if (!list || !list.every(isNight)) throw new Error('nights: unexpected answer');
            if (list.length) showNights(list); else showNoDate();
          })
      : Promise.resolve().then(showNoDate)
  ).catch(() => { /* the neutral markup stays: no date claim, "I'm in" opens all nights */ })
    .finally(() => root.classList.remove('night-wait'));

  /* "Stay close": scroll to the email form and put the cursor in it */
  const toMail = () => {
    const mailForm = $('#mail-form');
    scrollToEl(mailForm, true);
    mailForm.elements.email.focus({ preventScroll: true });
  };

  /* I'M IN answers IMIN's message, then opens the night (or, with no date yet, the email form) */
  const replyIn = () => {
    if (btnIn.classList.contains('sent')) return false;
    const reply = document.createElement('div');
    reply.className = 'b out yes gen';
    reply.innerHTML = '<p>' + STR.imIn + '</p>';
    notif.appendChild(reply);
    btnIn.classList.add('sent');
    btnIn.innerHTML = '<svg class="ico" aria-hidden="true"><use href="#i-check"/></svg>' + STR.imIn;
    return true;
  };
  btnIn.addEventListener('click', e => {
    if (!plainClick(e)) return; // a new tab or window: let the link go as it is
    e.preventDefault();
    const fresh = replyIn();
    if (heroState === 'soon') { wait(fresh ? 450 : 0).then(toMail); return; }
    const to = btnIn.href;
    wait(fresh ? 700 : 0).then(() => { location.assign(to); });
  });

  /* FAQ: one answer at a time */
  const chips = $$('.chip[role="tab"]');
  const select = chip => {
    let typed = Promise.resolve();
    chips.forEach(c => {
      const on = c === chip;
      c.setAttribute('aria-selected', String(on));
      c.tabIndex = on ? 0 : -1;
      const p = $('#' + c.getAttribute('aria-controls'));
      p.hidden = !on;
      if (on) typed = typeIn(p);
    });
    return typed;
  };
  // the answer sits under all the questions: scroll just enough to show it above the dock
  const reveal = el => {
    const over = el.getBoundingClientRect().bottom - (innerHeight - 96);
    if (over <= 0) return;
    if (lenis) lenis.scrollTo(window.scrollY + over);
    else window.scrollBy({ top: over, behavior: reduce ? 'auto' : 'smooth' });
  };
  const typeIn = async p => {
    const a = $('.b.in', p);
    const q = $('.b.out', p);
    if (q) { q.classList.remove('gen'); void q.offsetWidth; q.classList.add('gen'); }
    a.hidden = true;
    const t = document.createElement('div');
    t.className = 'b in typing gen';
    t.innerHTML = DOTS;
    p.appendChild(t);
    await wait(700);
    t.remove();
    a.hidden = false;
  };
  chips.forEach((c, i) => {
    c.addEventListener('click', () => {
      const p = $('#' + c.getAttribute('aria-controls'));
      const typed = select(c);
      reveal(p);
      typed.then(() => reveal(p)); // a long answer grows once it is typed
    });
    c.addEventListener('keydown', e => {
      const k = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!k) return;
      e.preventDefault();
      const n = chips[(i + k + chips.length) % chips.length];
      n.focus();
      select(n);
    });
  });

  /* setlist player */
  const player = $('[data-player]');
  if (player) {
    const rows = $$('.np-list > li', player);
    const trk = $('.np-scrub .trk', player);
    let at = 0;
    const play = () => {
      rows.forEach((r, i) => r.classList.toggle('on', i === at));
      trk.style.setProperty('--p', String((at + 1) / rows.length));
      at = (at + 1) % rows.length;
    };
    play();
    if (!reduce) {
      let timer = null;
      new IntersectionObserver(([en]) => {
        clearInterval(timer);
        if (en.isIntersecting) timer = setInterval(play, 2600);
      }).observe(player);
    }
  }

  /* email: "Keep me posted" emails the team; the bubble shows only once the server took it */
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const CONTACT = CFG.contact || 'contact@imin.support';
  const form = $('#mail-form');
  const done = $('[data-mail-done]');
  const err = $('[data-mail-err]');
  const send = $('button[type="submit"]', form);
  const showErr = (text, contact) => {
    err.replaceChildren(text);
    if (contact) {
      const a = document.createElement('a');
      a.href = 'mailto:' + contact;
      a.textContent = contact;
      err.append(a, '.');
    }
    err.hidden = false;
  };
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (send.disabled) return;
    err.hidden = true;
    const field = form.elements.email;
    if (!field.checkValidity()) { field.reportValidity(); return; }
    const email = field.value.trim();
    if (!EMAIL_RE.test(email)) { showErr(STR.mail.badEmail); field.focus(); return; }
    if (!form.elements.ok.checked) { showErr(STR.mail.needConsent); form.elements.ok.focus(); return; }
    send.disabled = true;
    form.setAttribute('aria-busy', 'true');
    let ok = false;
    try {
      const res = await fetch(CFG.subscribeEndpoint || '/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          consent: true,
          consent_text: $('[data-consent-text]', form).textContent.trim(),
          source: 'guest-stay',
          lang: LANG,
          company: form.elements.company.value
        })
      });
      ok = res.ok;
    } catch (_) { /* offline or blocked: same as a failed send */ }
    send.disabled = false;
    form.removeAttribute('aria-busy');
    if (!ok) { showErr(STR.mail.failed, CONTACT); return; }
    done.replaceChildren();
    const bubble = add(done, 'b out', '<p></p>');
    bubble.firstChild.textContent = email;
    form.reset();
    await iminSays(done, STR.mail.done);
  });

  /* phone dock and desktop header button, once the hero's button has scrolled away;
     the dock steps aside while the email form is on screen */
  const dock = $('[data-dock]');
  const topBox = $('[data-top-go]');
  if ('IntersectionObserver' in window) {
    const links = $$('a', dock);
    let past = false, atForm = false;
    const paint = () => {
      const show = past && !atForm;
      dock.classList.toggle('show', show);
      dock.setAttribute('aria-hidden', String(!show));
      links.forEach(a => { a.tabIndex = show ? 0 : -1; });
      topBox.classList.toggle('show', past);
    };
    new IntersectionObserver(([en]) => { past = !en.isIntersecting && en.boundingClientRect.top < 0; paint(); }).observe(btnIn);
    new IntersectionObserver(([en]) => { atForm = en.isIntersecting; paint(); }).observe(form);
  }
  // both do what the hero's I'M IN does: back to it and press it; with no date yet, straight to the email form
  const goIn = e => {
    if (!plainClick(e)) return;
    e.preventDefault();
    if (heroState === 'soon') { toMail(); return; }
    go($('#hero'));
    setTimeout(() => btnIn.click(), reduce ? 0 : 600);
  };
  dockGo.addEventListener('click', goIn);
  topGo.addEventListener('click', goIn);


  /* links from config; one with no address yet is "coming soon" on a tile and hidden elsewhere */
  const L = CFG.links || {};
  $$('[data-link]').forEach(a => {
    const u = L[a.dataset.link];
    const tile = a.classList.contains('tile2');
    if (u) {
      a.href = u;
      a.hidden = false;
      const label = STR.ready[a.dataset.link];
      if (tile && a.classList.contains('is-soon') && label) {
        a.classList.remove('is-soon');
        $('.text-link', a).innerHTML = label + ' <svg class="ico" aria-hidden="true"><use href="#i-arrow-up-right"/></svg>';
      }
    } else if (tile) {
      a.removeAttribute('href');
      a.classList.add('is-soon');
      $('.text-link', a).textContent = STR.soon;
    } else a.hidden = true;
  });

  /* ---------------------------------------------------------
     The beat: the brand pattern, I Paper · M Haze · N Doorlight.
     Drawn once; only the Paper sticks move, like a level meter.
     --------------------------------------------------------- */
  const NS = 'http://www.w3.org/2000/svg';
  const D_BACK = 'M292.215 52.8235C285.967 25.8047 306.486 0 334.218 0C354.056 0 371.334 13.5391 376.078 32.8025L550.268 740.176C557.762 770.606 534.728 800 503.389 800C480.916 800 461.414 784.494 456.351 762.598L292.215 52.8235Z';
  const D_FWD = 'M877.785 52.8235C884.033 25.8047 863.514 0 835.782 0C815.944 0 798.666 13.5391 793.922 32.8025L619.732 740.176C612.238 770.606 635.272 800 666.611 800C689.084 800 708.586 784.494 713.649 762.598L877.785 52.8235Z';
  const BAR = [['v', 0, 'p'], ['v', 140, 'h'], ['b', 0, 'h'], ['f', 0, 'h'], ['v', 930, 'h'], ['v', 1070, 'p'], ['v', 1210, 'd'], ['b', 1070, 'd'], ['v', 1675, 'd']];
  const FILL = { p: '#F4EFE7', h: '#9C8CFF', d: '#16B877' };
  const bands = $$('[data-beat]').map(el => ({ el, live: [], on: false }));
  const drawBand = band => {
    const h = band.el.clientHeight || 56;
    const bars = Math.ceil(innerWidth * 800 / (h * 1815)) + 1;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${bars * 1815 - 40} 800`);
    band.live = [];
    for (let b = 0; b < bars; b++) for (const [k, x, c] of BAR) {
      let n;
      if (k === 'v') { n = document.createElementNS(NS, 'rect'); n.setAttribute('x', b * 1815 + x); n.setAttribute('y', 0); n.setAttribute('width', 100); n.setAttribute('height', 800); n.setAttribute('rx', 50); }
      else { n = document.createElementNS(NS, 'path'); n.setAttribute('d', k === 'b' ? D_BACK : D_FWD); n.setAttribute('transform', `translate(${b * 1815 + x} 0)`); }
      n.setAttribute('fill', FILL[c]);
      if (c === 'p') { n.style.transformBox = 'fill-box'; n.style.transformOrigin = '50% 100%'; band.live.push(n); }
      svg.appendChild(n);
    }
    band.el.replaceChildren(svg);
    band.prm = band.live.map(() => [1.8 + Math.random() * 2.6, 3.1 + Math.random() * 3.4, Math.random() * 6.28, Math.random() * 6.28]);
  };
  bands.forEach(drawBand);
  let rz; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => bands.forEach(drawBand), 200); });
  if ('IntersectionObserver' in window) bands.forEach(band => new IntersectionObserver(([en]) => { band.on = en.isIntersecting; }).observe(band.el));
  const meter = t => bands.forEach(band => {
    if (!band.on) return;
    band.live.forEach((nd, i) => {
      const [f1, f2, p1, p2] = band.prm[i];
      const v = Math.max(.3, Math.min(1, (.78 + .22 * Math.sin(t * 1.6 - i * .6)) * (.3 + .7 * Math.abs(.6 * Math.sin(t * f1 + p1) + .4 * Math.sin(t * f2 + p2)))));
      nd.style.transform = `scaleY(${v.toFixed(3)})`;
    });
  });

  if (reduce || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger, ...(window.SplitText ? [SplitText] : []));
  document.documentElement.classList.add('motion');

  /* smooth scroll */
  if (window.Lenis) {
    lenis = new Lenis({ lerp: .12 });
    if (introEl && !introEl.classList.contains('gone')) { lenis.stop(); intro.then(() => lenis.start()); }
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      const t = a.getAttribute('href');
      if (t.length < 2 || !$(t)) return;
      e.preventDefault();
      lenis.scrollTo(t, { offset: -72 });
    }));
  }
  gsap.ticker.add(t => meter(t));

  /* ---------- Hero: the flyers land, IMIN texts, the phone buzzes ---------- */
  const hero = $('#hero');
  const notifBox = $('.notif', notif);
  const heroParts = ['.hero-copy > *', '.flyer-back', '.poster', '.tape', '.sticker', notifBox];
  const heroIn = () => {
    const still = $$('.poster, .hero .btn-door');
    still.forEach(el => { el.style.transition = 'none'; });
    gsap.set(heroParts, { autoAlpha: 1 });
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    const h1 = $('#hero-h');
    if (window.SplitText) {
      const sp = SplitText.create(h1, { type: 'lines', mask: 'lines', linesClass: 'line' });
      tl.from(sp.lines, { yPercent: 105, rotate: 3, transformOrigin: '0 100%', duration: 1.1, stagger: .1 }, 0);
    }
    // the button lands first, so it can be tapped while the rest settles
    tl.from('.hero .btn-door', { y: 14, autoAlpha: 0, scale: .96, duration: .5, ease: 'back.out(2)' }, .1)
      .from('.hero-lead', { y: 18, autoAlpha: 0, duration: .7 }, .15)
      .from('.hero-night, .hero-alt', { y: 10, autoAlpha: 0, duration: .6, stagger: .08 }, .3)
      .from('.flyer-back', { x: 60, y: -40, rotate: 18, autoAlpha: 0, duration: 1.2, clearProps: 'transform' }, .15)
      .from('.poster', { y: -80, rotate: -9, autoAlpha: 0, duration: 1.2, ease: 'power4.out', clearProps: 'transform' }, .3)
      .from('.poster > img', { scale: 1.5, duration: 2.2, ease: 'power2.out', clearProps: 'transform' }, .3)
      .from('.p-top > *', { y: -16, autoAlpha: 0, duration: .7, stagger: .1 }, .8)
      .from('.p-title', { yPercent: 40, autoAlpha: 0, duration: .9 }, .9)
      .from('.p-meta', { autoAlpha: 0, duration: .6 }, 1.15)
      .from('.tape', { scaleX: 0, autoAlpha: 0, duration: .5, ease: 'power2.out' }, 1.1)
      .from('.sticker', { scale: 0, rotate: -120, duration: .9, ease: 'back.out(2.2)', clearProps: 'transform' }, 1.25)
      .from(notifBox, { y: -46, autoAlpha: 0, scale: .9, duration: .7, ease: 'back.out(1.8)' }, 1.7)
      .to(notifBox, { keyframes: { x: [0, -3, 3, -3, 3, -2, 2, 0], ease: 'none' }, duration: .5 }, 2.35)
      .to(notifBox, { keyframes: { x: [0, -3, 3, -3, 3, -2, 2, 0], ease: 'none' }, duration: .5 }, 3.1)
      .call(() => { $('.sticker').style.animation = ''; still.forEach(el => { el.style.transition = ''; }); }, null, 2.2);
  };
  // scripts that came late find the hero already on screen: leave it there
  if (!late) {
    notifBox.style.animation = 'none';
    $('.sticker').style.animation = 'none';
    gsap.set(heroParts, { autoAlpha: 0 });
    Promise.all([intro, document.fonts ? Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1500))]) : null]).then(heroIn);
  }

  // parallax: the back flyer lags, the poster leads, the message floats off last
  gsap.to('.hero-visual', { y: -60, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to(notif, { yPercent: -60, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero-copy', { y: -40, opacity: .35, ease: 'none', scrollTrigger: { trigger: hero, start: 'center top', end: 'bottom top', scrub: true } });

  // the flyers lean toward the pointer
  const flyers = $('.flyers');
  if (matchMedia('(hover: hover)').matches) {
    const rx = gsap.quickTo(flyers, 'rotationY', { duration: .8, ease: 'power3' });
    const ry = gsap.quickTo(flyers, 'rotationX', { duration: .8, ease: 'power3' });
    gsap.set(flyers, { transformPerspective: 1200 });
    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect();
      rx(((e.clientX - r.left) / r.width - .5) * 8);
      ry(-((e.clientY - r.top) / r.height - .5) * 6);
    });
    hero.addEventListener('pointerleave', () => { rx(0); ry(0); });
  }

  /* ---------- Section titles ---------- */
  document.fonts?.ready.then(() => {
    if (window.SplitText) $$('.sec .t-h1, .room .t-display').forEach(el => {
      const sp = SplitText.create(el, { type: 'lines', mask: 'lines' });
      gsap.from(sp.lines, { yPercent: 110, rotate: 2, transformOrigin: '0 100%', duration: 1.1, stagger: .08, scrollTrigger: { trigger: el, start: 'top 86%' } });
    });
    ScrollTrigger.refresh();
  });
  $$('.sec-top .lead, .sec-top .label, .col-head .label, .col-head .lead, .col-head .cap').forEach(el => {
    gsap.from(el, { y: 20, opacity: 0, duration: 1, scrollTrigger: { trigger: el, start: 'top 90%' } });
  });

  /* ---------- The idea: each photo is a chat. Question out, IMIN types, answer in ---------- */
  $$('#idea .card').forEach((card, i) => {
    const img = $('img', card), q = $('.q', card), a = $('.a', card);
    gsap.fromTo(img, { yPercent: -6, scale: 1.14 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true } });
    const dots = document.createElement('span');
    dots.className = 'b in typing';
    dots.setAttribute('aria-hidden', 'true');
    dots.innerHTML = DOTS;
    card.appendChild(dots);
    gsap.set([q, a, dots], { opacity: 0 });
    gsap.timeline({ scrollTrigger: { trigger: '#idea .row', start: 'top 78%' }, delay: i * .25 })
      .from(card, { clipPath: 'inset(100% 0 0 0)', y: 40, duration: 1.1, ease: 'expo.out' })
      .fromTo(q, { opacity: 0, scale: .4, y: 10 }, { opacity: 1, scale: 1, y: 0, duration: .5, ease: 'back.out(2.4)' }, '-=.4')
      .fromTo(dots, { opacity: 0, scale: .5 }, { opacity: 1, scale: 1, duration: .3, ease: 'back.out(2)' }, '+=.2')
      .to(dots, { opacity: 0, scale: .6, duration: .2 }, '+=.9')
      .fromTo(a, { opacity: 0, scale: .4, y: 10 }, { opacity: 1, scale: 1, y: 0, duration: .5, ease: 'back.out(2.4)' }, '-=.05');
  });

  // Bohdan's words light up as you read
  const quote = $('.voice blockquote');
  if (quote) {
    quote.innerHTML = quote.textContent.split(/(\s+)/).map(w => /\s/.test(w) ? w : `<span class="w">${w}</span>`).join('');
    const ws = $$('.w', quote);
    gsap.from('.voice .face', { scale: .6, opacity: 0, duration: .8, ease: 'back.out(2)', scrollTrigger: { trigger: '.voice', start: 'top 88%' } });
    ScrollTrigger.create({
      trigger: quote, start: 'top 85%', end: 'bottom 50%', scrub: true,
      onUpdate: st => {
        const n = Math.round(st.progress * ws.length);
        ws.forEach((w, i) => w.classList.toggle('on', i < n));
        $('.voice').classList.toggle('talking', st.progress > 0 && st.progress < 1);
      }
    });
  }

  /* ---------- The nights: photos rise, 3PM / 1AM roll in ---------- */
  $$('#nights .card').forEach((card, i) => {
    const img = $('img', card);
    gsap.from(card, { y: 60, opacity: 0, rotate: i % 2 ? 1.5 : -1.5, duration: 1.2, ease: 'expo.out', delay: i * .12, scrollTrigger: { trigger: '#nights .row', start: 'top 82%' } });
    if (img) gsap.fromTo(img, { yPercent: -6, scale: 1.14 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true } });
    const big = $('.when b', card);
    if (big) {
      big.innerHTML = `<i>${big.textContent}</i>`;
      gsap.from($('i', big), { yPercent: 110, duration: 1, ease: 'power4.out', delay: .4 + i * .12, scrollTrigger: { trigger: '#nights .row', start: 'top 82%' } });
    }
  });
  gsap.from('.np-list li', { x: -16, opacity: 0, duration: .6, stagger: .08, scrollTrigger: { trigger: '.np', start: 'top 85%' } });

  /* ---------- FAQ: the chips arrive like a keyboard of questions ---------- */
  gsap.from('.chips .chip', { y: 14, opacity: 0, scale: .9, duration: .5, ease: 'back.out(2)', stagger: .035, scrollTrigger: { trigger: '.chips', start: 'top 88%' } });
  gsap.from('#faq .answer:not([hidden]) .b', { scale: .5, opacity: 0, duration: .5, ease: 'back.out(2.4)', stagger: .35, scrollTrigger: { trigger: '.chips', start: 'top 70%' } });

  /* ---------- Stay close ---------- */
  gsap.from('.tile2', { y: 40, opacity: 0, duration: 1, ease: 'expo.out', stagger: .1, clearProps: 'transform,translate,rotate,scale', scrollTrigger: { trigger: '.tiles', start: 'top 86%' } });
  gsap.from('.stay-foot > *', { y: 24, opacity: 0, duration: .9, stagger: .1, scrollTrigger: { trigger: '.stay-foot', start: 'top 90%' } });

  /* ---------- The other side of the room: outline words assemble letter by letter ---------- */
  const room = $('.room');
  if (room) {
    $$('.room__bg span', room).forEach((w, i) => {
      w.innerHTML = [...w.textContent].map(c => `<i>${c}</i>`).join('');
      const ch = $$('i', w);
      gsap.fromTo(w, { xPercent: i ? 16 : -16 }, { xPercent: i ? -6 : 6, ease: 'none', scrollTrigger: { trigger: room, start: 'top bottom', end: 'bottom top', scrub: .8 } });
      gsap.fromTo(ch, { yPercent: i ? -70 : 70, rotate: i ? -8 : 8, opacity: 0 }, { yPercent: 0, rotate: 0, opacity: 1, ease: 'power3.out', stagger: .06, scrollTrigger: { trigger: room, start: 'top 90%', end: 'top 30%', scrub: .8 } });
      gsap.fromTo(ch, { '--fill': 0 }, { '--fill': 1, ease: 'none', stagger: .08, scrollTrigger: { trigger: room, start: 'top 40%', end: 'bottom 60%', scrub: .8 } });
    });
    gsap.timeline({ scrollTrigger: { trigger: room, start: 'top 70%' } })
      .from('.room__done', { y: 20, opacity: 0, duration: .8 })
      .from('.room__done .ico', { scale: 0, rotate: -45, duration: .6, ease: 'back.out(3)' }, '-=.3')
      .from('.room__next', { y: 20, opacity: 0, filter: 'blur(6px)', duration: .8, stagger: .2 }, '-=.2')
      .from('.room__text, .room__actions', { y: 24, opacity: 0, duration: .9, stagger: .12 }, '-=.6');
    gsap.from(room, { clipPath: 'inset(6% 3% 6% 3%)', ease: 'none', scrollTrigger: { trigger: room, start: 'top bottom', end: 'top 35%', scrub: true } });
  }

  /* ---------- Footer ---------- */
  gsap.from('.foot-cols > div', { y: 24, opacity: 0, duration: .8, stagger: .06, scrollTrigger: { trigger: '.foot-cols', start: 'top 92%' } });

})();
