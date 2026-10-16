import { NextRequest, NextResponse } from 'next/server';
import { sendTeamEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL = 254;
const MAX_CONSENT_TEXT = 300;
const SOURCE_RE = /^[a-z0-9-]{1,40}$/;
const LANG_RE = /^[a-z]{2}$/;

// "Keep me posted" on the guest page. The email to the team is the only record, so a failed send is a 500.
export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    const parsed: unknown = await request.json();
    if (!parsed || typeof parsed !== 'object') throw new Error('not an object');
    body = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  // Honeypot: a bot filled the hidden field. Look successful, send nothing.
  if (text(body.company)) {
    return NextResponse.json({ success: true }, { status: 200 });
  }

  const email = text(body.email).toLowerCase();
  if (!email || email.length > MAX_EMAIL || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }
  const consentText = text(body.consent_text);
  if (body.consent !== true || !consentText || consentText.length > MAX_CONSENT_TEXT) {
    return NextResponse.json({ error: 'Consent is required' }, { status: 400 });
  }
  const source = SOURCE_RE.test(text(body.source)) ? text(body.source) : 'unknown';
  const lang = LANG_RE.test(text(body.lang)) ? text(body.lang) : 'unknown';
  const at = new Date();

  try {
    await sendTeamEmail({
      eyebrow: 'Keep me posted',
      accent: '#9C8CFF', // haze, the guest page's colour for your own messages
      heading: email,
      subject: `Keep me posted: ${email}`,
      replyTo: email,
      fields: [
        { label: 'Email', value: email, href: `mailto:${email}` },
        { label: 'Consent', value: `Switched on: “${consentText}”` },
        { label: 'When', value: `${at.toISOString().replace('T', ' ').slice(0, 19)} UTC` },
        { label: 'Language', value: lang },
        { label: 'Page', value: `imin.wtf (${source})` },
      ],
    });
  } catch (error) {
    console.error('Error sending keep-me-posted email:', error);
    return NextResponse.json(
      { error: 'Could not sign you up right now. Please try again later.' },
      { status: 500 },
    );
  }
  return NextResponse.json({ success: true }, { status: 200 });
}

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}
