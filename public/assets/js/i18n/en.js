/* The sentences the page scripts write: `guest` for client.js (imin.wtf), `pro` for pro.js (imin.wtf/pro).
   A translated page also loads i18n/<lang>.js, which sets IMIN_I18N.<lang> with the same keys;
   `npm run check:i18n` keeps those keys and the translated pages in step with English. */
window.IMIN_I18N = {
  en: {
    guest: {
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
    },
    pro: {
      whatPlanned: 'What’s the night?',
      whatIdea: 'What’s the idea?',
      whatCompany: 'What’s the occasion?',
      errName: 'Add your name, then send.',
      errContact: 'Add an email or Instagram, then send.',
      errWhat: 'Add a few words about the night, then send.',
      errLink: 'The link should start with https://',
      errConsent: 'Tick the box so we can use these details to answer you.',
      errSend: 'That didn’t go through. Try again, or write to contact@imin.support.',
      doneTitle: 'Got it, {name}.',
      doneText: 'We’ll answer within 24 hours at {contact}.',
      free: 'Free',
      eur: n => '€' + (Number.isInteger(n) ? n : n.toFixed(2)),
      cents: n => '€' + n.toFixed(2),
      zero: '€0',
      feeNote: 'The fee goes on top of your price, and your guest sees it before paying. You pay IMIN €0 during early access.',
      freeNote: 'Free nights are free. No fee for you, no fee for your guests.',
      tabsMany: '6 tabs for one night',
      tabsOne: '1 tab for the whole night',
      you: 'You'
    }
  },

  // one page's strings in <html lang>, English for any key that language lacks
  pick(part) {
    const lang = (document.documentElement.lang || 'en').toLowerCase().slice(0, 2);
    const merge = (a, b) => {
      if (!b) return a;
      const out = { ...a };
      for (const k of Object.keys(b)) {
        const nested = b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && a && typeof a[k] === 'object';
        out[k] = nested ? merge(a[k], b[k]) : b[k];
      }
      return out;
    };
    return merge(this.en[part], (this[lang] || {})[part]);
  }
};
