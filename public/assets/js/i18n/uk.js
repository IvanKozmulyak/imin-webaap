/* Ukrainian strings for client.js (guest) and pro.js (/pro); same keys and kinds as IMIN_I18N.en.
   Loaded only by /uk and /uk/pro, right after en.js. The page writes euros as € (Intl uk-UA with narrowSymbol);
   only the dashboard mocks keep "EUR", as the dashboard shows it. */
window.IMIN_I18N.uk = {
  guest: {
    intro: ['піти кудись сьогодні?', 'Не ускладнюй.', 'I’m in'],
    typing: 'IMIN друкує',
    imIn: 'I’m in',
    soon: 'Скоро',
    ready: { playlist: 'Слухати' },
    night: {
      label: 'Наступна вечірка',
      // the day comes from /api/nights in lowercase ("сб 31.10"); a sentence starts with a capital
      notif: n => {
        const day = n.day.charAt(0).toUpperCase() + n.day.slice(1);
        return n.city ? `Привіт. ${day}, ${n.city}. Головне — музика. Ти з нами?` : `Привіт. ${day}. Головне — музика. Ти з нами?`;
      },
      when: n => `${n.day.charAt(0).toUpperCase() + n.day.slice(1)}, ${n.time}`,
      // client.js formats the amount with Intl's default display ("16,74 EUR" in uk); the page writes €, as narrowSymbol does
      price: {
        soldout: 'Розпродано',
        free: 'Безкоштовно',
        freeOrFrom: amount => `Безкоштовно або від ${amount.replace(/EUR$/, '€')}`,
        from: amount => `Від ${amount.replace(/EUR$/, '€')}`
      }
    },
    noDate: {
      label: 'Наступна вечірка, дата згодом',
      when: '??.??',
      time: 'Дата скоро',
      title: 'Наступна',
      meta: 'Головне — музика · Мец',
      notif: 'Наступної дати ще немає. Хочеш дізнатися раніше за всіх?',
      dockWhen: 'Нова дата скоро',
      dockWhat: 'Дізнатися раніше за всіх?'
    },
    mail: {
      needConsent: 'Спершу увімкни «Хочу отримувати новини IMIN».',
      badEmail: 'Схоже, в адресі помилка.',
      failed: 'Не вийшло надіслати. Спробуй ще раз або напиши на ',
      done: 'Дякуємо. Якщо на цю адресу можна надсилати новини IMIN, у пошті на тебе чекатиме посилання для підтвердження.'
    }
  },
  pro: {
    whatPlanned: 'Що за вечірка?',
    whatIdea: 'Яка ідея?',
    whatCompany: 'Який привід?',
    errName: 'Вкажи імʼя, а тоді надсилай.',
    errContact: 'Вкажи email або Instagram, а тоді надсилай.',
    errWhat: 'Напиши кілька слів про вечірку, а тоді надсилай.',
    errLink: 'Посилання має починатися з https://',
    errConsent: 'Постав галочку, щоб ми могли використати ці дані для відповіді.',
    errSend: 'Не вийшло надіслати. Спробуй ще раз або напиши на contact@imin.support.',
    doneTitle: 'Отримали, {name}.',
    doneText: 'Відповімо протягом 24 годин на {contact}.',
    free: 'Безкоштовно',
    eur: n => new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'EUR', currencyDisplay: 'narrowSymbol', minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 }).format(n),
    cents: n => new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'EUR', currencyDisplay: 'narrowSymbol', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n),
    zero: '0 €',
    feeNote: 'Збір додається до твоєї ціни, і гість бачить його ще до оплати. Під час раннього доступу ти платиш IMIN 0 €.',
    freeNote: 'Безкоштовні вечірки — безкоштовні. Жодних зборів ні для тебе, ні для гостей.',
    tabsMany: '6 вкладок на одну вечірку',
    tabsOne: '1 вкладка на всю вечірку',
    you: 'Ти'
  }
};
