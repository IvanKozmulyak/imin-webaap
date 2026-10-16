/* =========================================================
   IMIN guest page (/) and creators page (/pro): links and nights.
   Edit this file only; both pages read it.
   ========================================================= */
window.IMIN = {
  links: {
    create: '/pro',                                   // page for creators
    signIn: 'https://app.imin.wtf/auth/sign-in',      // guest account
    creatorSignIn: 'https://dashboard.imin.wtf/auth/login', // "Already creating? Sign in"
    allNights: 'https://app.imin.wtf/events',
    instagram: 'https://www.instagram.com/imin.wtf/',
    threads: 'https://www.threads.com/@imin.wtf',
    playlist: '',                                     // TODO: Spotify "Friday playlist" link
    privacy: 'https://app.imin.wtf/legal/privacy'
  },

  /* Creators page (/pro). Empty = not ready yet: the page hides that channel or falls back to the form. */
  pro: {
    links: {
      signUp: 'https://dashboard.imin.wtf/auth/signup',
      signIn: 'https://dashboard.imin.wtf/auth/login',
      nights: '/',                                     // the guest page
      instagram: 'https://www.instagram.com/imin.wtf/',
      call: 'https://cal.com/bohdan-shostak',
      privacy: 'https://app.imin.wtf/legal/privacy'
    },
    /* "Send us your night" (JSON: type, name, contact, what, when, link, consent, lang). */
    pitchEndpoint: '/api/pitch'
  },

  contact: 'contact@imin.support',

  /* "Keep me posted" (JSON: email, consent, source, lang, consent_text). */
  subscribeEndpoint: '/api/subscribe',

  /* Nights shown on the guest page, by their app.imin.wtf event id. Name, date, time and place
     come live from the event itself; a night that is over, cancelled or unpublished drops out,
     and with none left the page shows its "no date yet" state. */
  events: []
};
