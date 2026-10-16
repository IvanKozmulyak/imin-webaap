/* French for /fr and /fr/pro: the keys of IMIN_I18N.en, in the informal "tu" of the pages.
   A no-break space goes before : ; ! ? » and after «; npm run check:i18n checks both. */
window.IMIN_I18N.fr = {
  guest: {
    intro: ['je sors ce soir ?', 'Te prends pas la tête.', 'I’m in'],
    typing: 'IMIN est en train d’écrire',
    imIn: 'I’m in',
    soon: 'Bientôt',
    ready: { playlist: 'Écouter' },
    night: {
      label: 'La prochaine soirée',
      notif: n => (n.city ? `Salut. Rendez-vous ${n.day} à ${n.city}. La musique d’abord. Ça te dit ?` : `Salut. Rendez-vous ${n.day}. La musique d’abord. Ça te dit ?`),
      when: n => `${n.day}, ${n.time}`,
      price: { soldout: 'Complet', free: 'Gratuit', freeOrFrom: amount => `Gratuit ou dès ${amount}`, from: amount => `Dès ${amount}` }
    },
    noDate: {
      label: 'La prochaine soirée, date à venir',
      when: '??.??',
      time: 'Date à venir',
      title: 'La prochaine',
      meta: 'La musique d’abord · Metz',
      notif: 'La prochaine date n’est pas encore tombée. Tu la veux en premier ?',
      dockWhen: 'Prochaine date bientôt',
      dockWhat: 'Tu la veux en premier ?'
    },
    mail: {
      needConsent: 'Active d’abord « Envoie-moi les news d’IMIN ».',
      badEmail: 'Cette adresse e-mail ne semble pas correcte.',
      failed: 'Ça n’est pas passé. Réessaie, ou écris à ',
      done: 'C’est noté, tu es sur la liste. À bientôt.'
    }
  },
  pro: {
    whatPlanned: 'C’est quoi, la soirée ?',
    whatIdea: 'C’est quoi, l’idée ?',
    whatCompany: 'C’est pour quelle occasion ?',
    errName: 'Ajoute ton nom, puis envoie.',
    errContact: 'Ajoute un e-mail ou un Instagram, puis envoie.',
    errWhat: 'Ajoute quelques mots sur la soirée, puis envoie.',
    errLink: 'Le lien doit commencer par https://',
    errConsent: 'Coche la case pour qu’on puisse utiliser ces infos pour te répondre.',
    errSend: 'Ça n’est pas passé. Réessaie, ou écris à contact@imin.support.',
    doneTitle: 'C’est noté, {name}.',
    doneText: 'On te répond sous 24 heures à {contact}.',
    free: 'Gratuit',
    eur: n => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 }).format(n),
    cents: n => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n),
    zero: '0 €',
    feeNote: 'Les frais s’ajoutent à ton prix, et l’acheteur les voit avant de payer. Tu paies 0 € à IMIN pendant l’accès anticipé.',
    freeNote: 'Les soirées gratuites restent gratuites. Pas de frais pour toi, pas de frais pour ton public.',
    tabsMany: '6 onglets pour une soirée',
    tabsOne: '1 onglet pour toute la soirée',
    you: 'Toi'
  }
};
