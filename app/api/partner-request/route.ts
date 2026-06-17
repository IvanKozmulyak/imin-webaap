import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';

export const dynamic = 'force-dynamic';

interface AccessRequestData {
  name: string;
  email: string;
  city: string;
  link: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: AccessRequestData = await request.json();

    const name = body.name?.trim();
    const email = body.email?.trim();
    const city = body.city?.trim();
    const link = body.link?.trim();

    // Validate required fields
    if (!name || !email || !city || !link) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Save access request to database
    const accessRequest = await prisma.accessRequest.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        city,
        link,
      },
    });

    console.log('Access request saved:', {
      id: accessRequest.id,
      name: accessRequest.name,
      email: accessRequest.email,
    });

    // Notify the team by email. Non-blocking: a save still succeeds if email fails.
    await sendNotification({ name, email, city, link }).catch((err) =>
      console.error('Access-request email failed:', err)
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Error processing access request:', error);

    // Handle unique constraint violations or other database errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A request with this email already exists.' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process request. Please try again later.' },
      { status: 500 }
    );
  }
}

// Sends a notification via Resend's REST API. No SDK — one fetch.
// Set RESEND_API_KEY to enable; EMAIL_FROM/EMAIL_TO override the defaults.
// ponytail: onboarding@resend.dev only delivers to the Resend account owner —
// set EMAIL_FROM to a verified-domain address for real inboxes.
async function sendNotification(d: AccessRequestData): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('RESEND_API_KEY unset — skipping access-request email.');
    return;
  }

  // EMAIL_TO is a comma-separated list — any number of recipients.
  const to = (process.env.EMAIL_TO || 'bohdan.shostak.ua@gmail.com')
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
      from: process.env.EMAIL_FROM || 'IMIN <onboarding@resend.dev>',
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
