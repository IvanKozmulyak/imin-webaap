import { NextRequest, NextResponse } from 'next/server';
import { sendTeamEmail } from '@/lib/email';
import { guardPost, windowLimiter } from '@/lib/guard';
import { checkPitch } from '@/lib/pitch';

export const dynamic = 'force-dynamic';

// A person sends one pitch, maybe a retry or two.
const limiter = windowLimiter(5, 10 * 60_000);

export async function POST(request: NextRequest) {
  const refused = guardPost(request, limiter);
  if (refused) return refused;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const check = checkPitch(body);
  // A bot filled the hidden field: answer as if it worked and send nothing.
  if (check.kind === 'bot') return NextResponse.json({ success: true }, { status: 200 });
  if (check.kind === 'bad') return NextResponse.json({ error: check.error }, { status: 400 });
  const p = check.pitch;

  // Email is the delivery channel: if it fails, answer 500 so the person retries.
  try {
    await sendTeamEmail({
      eyebrow: 'Night pitch',
      accent: '#16b877',
      heading: p.name,
      subject: `Night pitch: ${p.name} (${p.label})`,
      replyTo: p.replyTo,
      fields: [
        { label: 'Type', value: p.label },
        { label: 'Contact', value: p.contact, href: p.replyTo ? `mailto:${p.replyTo}` : undefined },
        { label: 'What', value: p.what },
        { label: 'When', value: p.when },
        { label: 'Link', value: p.link, href: p.linkHref },
        { label: 'Consent', value: 'Ticked: “Use these details to answer me.”' },
        { label: 'Language', value: p.lang },
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
