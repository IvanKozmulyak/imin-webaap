// "Send us your night" on imin.wtf/pro: what the form may send, cut to size, before anyone is emailed.

// The three choices of the form.
export const PITCH_TYPES = {
  planned: 'Night planned',
  idea: 'Just an idea',
  company: 'Company or team',
} as const;

// Over-long text is cut, not rejected: a real person never reaches these, a script gets no extra room.
export const PITCH_CAP = { name: 100, contact: 200, what: 2000, when: 200, link: 500 };

// Reply-To only when the contact looks like an address Resend accepts (no commas, brackets, quotes).
// ponytail: a regex, not a validator; an address it still refuses fails the send with a 500.
const EMAIL_RE = /^[^\s@,;<>()"']+@[^\s@,;<>()"']+\.[^\s@,;<>()"']+$/;
const LANG_RE = /^[a-z]{2,3}(-[A-Za-z]{2,4})?$/;

export interface Pitch {
  label: string; // the type, as the team reads it
  name: string;
  contact: string;
  what: string;
  when: string;
  link: string; // as typed, '' when none
  linkHref?: string;
  replyTo?: string;
  lang: string;
}

export type PitchCheck = { kind: 'bot' } | { kind: 'bad'; error: string } | { kind: 'ok'; pitch: Pitch };

/** The parsed JSON body, judged: a bot (answer as if it worked), a bad request (400), or a pitch to send. */
export function checkPitch(body: unknown): PitchCheck {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return { kind: 'bad', error: 'Invalid request' };
  const b = body as Record<string, unknown>;
  // Honeypot: only a bot fills the hidden field. The route answers as if it worked and sends nothing.
  if (b.company_site && String(b.company_site).trim()) return { kind: 'bot' };

  const type = typeof b.type === 'string' ? b.type : '';
  if (!Object.hasOwn(PITCH_TYPES, type)) return { kind: 'bad', error: 'Unknown type' };
  const name = text(b.name, PITCH_CAP.name);
  const contact = text(b.contact, PITCH_CAP.contact);
  const what = text(b.what, PITCH_CAP.what, true);
  if (!name || !contact || !what) return { kind: 'bad', error: 'Missing required fields' };
  if (b.consent !== true) return { kind: 'bad', error: 'Consent is required' };

  // A link is optional, but never cut: half a URL is a wrong URL.
  const link = typeof b.link === 'string' ? b.link.trim() : '';
  let linkHref: string | undefined;
  if (link) {
    const url = link.length <= PITCH_CAP.link ? httpsUrl(link) : null;
    if (!url) return { kind: 'bad', error: `The link must be an https:// address of at most ${PITCH_CAP.link} characters` };
    linkHref = url.href;
  }

  return {
    kind: 'ok',
    pitch: {
      label: PITCH_TYPES[type as keyof typeof PITCH_TYPES],
      name,
      contact,
      what,
      when: text(b.when, PITCH_CAP.when),
      link,
      linkHref,
      replyTo: EMAIL_RE.test(contact) ? contact.toLowerCase() : undefined,
      lang: typeof b.lang === 'string' && LANG_RE.test(b.lang) ? b.lang : '',
    },
  };
}

function text(value: unknown, max: number, multiline = false): string {
  if (typeof value !== 'string') return '';
  const clean = multiline ? value.replace(/\r\n?/g, '\n').trim() : value.replace(/\s+/g, ' ').trim();
  const cut = clean.slice(0, max);
  // Never end on half an emoji: a lone surrogate is not valid text.
  return /[\ud800-\udbff]$/.test(cut) ? cut.slice(0, -1) : cut;
}

function httpsUrl(value: string): URL | null {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url : null;
  } catch {
    return null;
  }
}
