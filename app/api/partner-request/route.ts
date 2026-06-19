import { NextRequest, NextResponse } from 'next/server';
import { sendTeamEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface AccessRequestData {
  name: string;
  email: string;
  phone: string;
  city: string;
  link: string; // optional
}

export async function POST(request: NextRequest) {
  try {
    const body: AccessRequestData = await request.json();

    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    const phone = body.phone?.trim() || ''; // optional
    const city = body.city?.trim();
    const link = body.link?.trim() || ''; // optional

    if (!name || !email || !city) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Email is the delivery channel — if it fails, surface a 500 so the user retries.
    await sendTeamEmail({
      eyebrow: 'New access request',
      accent: '#16b877',
      heading: name,
      subject: `New IMIN access request — ${name} (${city})`,
      replyTo: email,
      fields: [
        { label: 'Email', value: email, href: `mailto:${email}` },
        { label: 'Phone', value: phone, href: phone ? `tel:${phone.replace(/[^\d+]/g, '')}` : undefined },
        { label: 'City', value: city },
        { label: 'Link', value: link, href: /^https?:\/\//i.test(link) ? link : undefined },
      ],
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error processing access request:', error);
    return NextResponse.json(
      { error: 'Failed to process request. Please try again later.' },
      { status: 500 }
    );
  }
}
