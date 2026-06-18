import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface AccessRequestData {
  name: string;
  email: string;
  city: string;
  link: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const body: AccessRequestData = await request.json();

    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    const city = body.city?.trim();
    const link = body.link?.trim();

    if (!name || !email || !city || !link) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Email is the delivery channel — if it fails, surface a 500 so the user retries.
    await sendNotification({ name, email, city, link });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error processing access request:', error);
    return NextResponse.json(
      { error: 'Failed to process request. Please try again later.' },
      { status: 500 }
    );
  }
}

// Sends the request via Resend's REST API. No SDK — one fetch.
// ponytail: the From domain (imin.support) must be verified in Resend, else
// sends fail — override with EMAIL_FROM if the domain changes.
async function sendNotification(d: AccessRequestData): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY unset — cannot deliver access request.');
  }

  // EMAIL_TO is a comma-separated list — any number of recipients.
  const to = (process.env.EMAIL_TO || 'bohdan.shostak.ua@gmail.com,ivankozmulyak@gmail.com')
    .split(',')
    .map((addr) => addr.trim())
    .filter(Boolean);

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || 'IMIN <contact@imin.support>',
      to,
      reply_to: d.email,
      subject: `New IMIN access request — ${d.name} (${d.city})`,
      text: `Name: ${d.name}\nEmail: ${d.email}\nCity: ${d.city}\nLink: ${d.link}`,
    }),
  });

  if (!res.ok) {
    throw new Error(`Resend ${res.status}: ${await res.text()}`);
  }
}
