/* Spanish strings for client.js (guest) and pro.js (pro): the keys of i18n/en.js, nothing else.
   Money is written the way Intl es-ES writes it: "10 €", "11,49 €", with a no-break space. */
window.IMIN_I18N.es = {
  guest: {
    intro: ['¿salgo esta noche?', 'No le des tantas vueltas.', 'I’m in'],
    typing: 'IMIN está escribiendo',
    imIn: 'I’m in',
    soon: 'Próximamente',
    ready: { playlist: 'Escuchar' },
    night: {
      label: 'La próxima noche',
      notif: n => (n.city ? `Ey. El ${n.day} en ${n.city}. Primero la música. ¿Te apuntas?` : `Ey. El ${n.day}. Primero la música. ¿Te apuntas?`),
      when: n => `${n.day}, ${n.time}`,
      price: { soldout: 'Agotado', free: 'Gratis', freeOrFrom: amount => `Gratis o desde ${amount}`, from: amount => `Desde ${amount}` }
    },
    noDate: {
      label: 'La próxima noche, fecha por confirmar',
      when: '??.??',
      time: 'Fecha pronto',
      title: 'La próxima',
      meta: 'Primero la música · Metz',
      notif: 'Aún no hay fecha. ¿Quieres saberla antes que nadie?',
      dockWhen: 'Próxima fecha pronto',
      dockWhat: '¿Quieres saberla antes?'
    },
    mail: {
      needConsent: 'Activa primero «Envíame novedades de IMIN».',
      badEmail: 'Ese email no parece correcto.',
      failed: 'No se ha enviado. Inténtalo de nuevo o escribe a ',
      done: 'Estás en la lista. Nos vemos pronto.'
    }
  },
  pro: {
    whatPlanned: '¿Cómo es la noche?',
    whatIdea: '¿Cuál es la idea?',
    whatCompany: '¿Cuál es la ocasión?',
    errName: 'Añade tu nombre y envía.',
    errContact: 'Añade un email o tu Instagram y envía.',
    errWhat: 'Cuéntanos la noche en unas palabras y envía.',
    errLink: 'El enlace debe empezar por https://',
    errConsent: 'Marca la casilla para que podamos usar estos datos y responderte.',
    errSend: 'No se ha enviado. Inténtalo de nuevo o escribe a contact@imin.support.',
    doneTitle: 'Recibido, {name}.',
    doneText: 'Te respondemos a {contact} en 24 horas como máximo.',
    free: 'Gratis',
    eur: n => {
      const d = Number.isInteger(n) ? 0 : 2;
      return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: d, maximumFractionDigits: d }).format(n);
    },
    cents: n => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n),
    zero: '0 €',
    feeNote: 'La comisión se suma a tu precio y quien compra la ve antes de pagar. Tú pagas 0 € a IMIN durante el acceso anticipado.',
    freeNote: 'Las noches gratis son gratis. Sin comisión para ti ni para quienes vienen.',
    tabsMany: '6 pestañas para una noche',
    tabsOne: '1 pestaña para toda la noche',
    you: 'Tú'
  }
};
