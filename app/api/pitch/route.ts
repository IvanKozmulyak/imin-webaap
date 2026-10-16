import { NextRequest, NextResponse } from 'next/server';
import { sendTeamEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

// Reply-To only when the contact looks like an address Resend accepts (no commas, brackets, quotes).
// ponytail: a regex, not a validator; an address it still refuses fails the send with a 500.
const EMAIL_RE = /^[^\s@,;<>()"']+@[^\s@,;<>()"']+\.[^\s@,;<>()"']+$/;

// The three choices of the form on imin.wtf/pro.
const TYPE_LABEL = {
  planned: 'Night planned',
  idea: 'Just an idea',
  company: 'Company or team',
} as const;
type PitchType = keyof typeof TYPE_LABEL;

// Over-long text is cut, not rejected: a real person never reaches these, a script gets no extra room.
const CAP = { name: 100, contact: 200, what: 2000, when: 200, link: 500 };

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

function bad(error: string) {
  return NextResponse.json({ error }, { status: 400 });
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    const parsed: unknown = await request.json();
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('not an object');
    body = parsed as Record<string, unknown>;
  } catch {
    return bad('Invalid request');
  }

  // Honeypot: only a bot fills the hidden field. Answer as if it worked and send nothing.
  // ponytail: the honeypot is the only spam guard (no rate limit); add one if the inbox floods.
  if (body.company_site && String(body.company_site).trim()) {
    return NextResponse.json({ success: true }, { status: 200 });
  }

  const type = typeof body.type === 'string' ? body.type : '';
  const name = text(body.name, CAP.name);
  const contact = text(body.contact, CAP.contact);
  const what = text(body.what, CAP.what, true);
  const when = text(body.when, CAP.when);
  const lang = typeof body.lang === 'string' && /^[a-z]{2,3}(-[A-Za-z]{2,4})?$/.test(body.lang) ? body.lang : '';
  const rawLink = typeof body.link === 'string' ? body.link.trim() : '';

  if (!Object.keys(TYPE_LABEL).includes(type)) return bad('Unknown type');
  if (!name || !contact || !what) return bad('Missing required fields');
  if (body.consent !== true) return bad('Consent is required');
  // A link is optional, but never cut: half a URL is a wrong URL.
  let link: URL | undefined;
  if (rawLink) {
    const url = rawLink.length <= CAP.link ? httpsUrl(rawLink) : null;
    if (!url) return bad(`The link must be an https:// address of at most ${CAP.link} characters`);
    link = url;
  }

  const label = TYPE_LABEL[type as PitchType];
  const replyTo = EMAIL_RE.test(contact) ? contact.toLowerCase() : undefined;

  // Email is the delivery channel: if it fails, answer 500 so the person retries.
  try {
    await sendTeamEmail({
      eyebrow: 'Night pitch',
      accent: '#16b877',
      heading: name,
      subject: `Night pitch: ${name} (${label})`,
      replyTo,
      fields: [
        { label: 'Type', value: label },
        { label: 'Contact', value: contact, href: replyTo ? `mailto:${replyTo}` : undefined },
        { label: 'What', value: what },
        { label: 'When', value: when },
        { label: 'Link', value: rawLink, href: link?.href },
        { label: 'Consent', value: 'Ticked: “Use these details to answer me.”' },
        { label: 'Language', value: lang },
        { label: 'Page', value: 'imin.wtf/pro' },
        { label: 'Sent', value: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC' },
      ],
    });
  } catch (error) {
    console.error('Error sending night pitch:', error);
    return NextResponse.json(
      { error: 'Failed to process request. Please try again later.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
