import { NextRequest, NextResponse } from 'next/server';
import { sendTeamEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_RESUME_BYTES = 5 * 1024 * 1024; // 5 MB

interface GrowthApplicationData {
  name: string;
  email: string;
  phone?: string;
  linkedin?: string;
  message: string;
  resume?: { filename: string; content: string }; // content = base64 (no data: prefix)
}

export async function POST(request: NextRequest) {
  try {
    const body: GrowthApplicationData = await request.json();

    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    const phone = body.phone?.trim() || '';
    const linkedin = body.linkedin?.trim() || '';
    const message = body.message?.trim();
    const resume = body.resume;

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }
    if (!resume?.content || !resume.filename) {
      return NextResponse.json({ error: 'Resume is required' }, { status: 400 });
    }
    // base64 length → byte size ≈ len * 3/4
    if (Math.floor((resume.content.length * 3) / 4) > MAX_RESUME_BYTES) {
      return NextResponse.json({ error: 'Resume must be under 5 MB' }, { status: 400 });
    }

    await sendTeamEmail({
      eyebrow: 'Growth application',
      accent: '#fbbf24', // amber — distinct from the green access-request emails
      heading: name,
      subject: `Growth application — ${name}`,
      replyTo: email,
      fields: [
        { label: 'Email', value: email, href: `mailto:${email}` },
        { label: 'Phone', value: phone, href: phone ? `tel:${phone.replace(/[^\d+]/g, '')}` : undefined },
        { label: 'LinkedIn', value: linkedin, href: /^https?:\/\//i.test(linkedin) ? linkedin : undefined },
        { label: 'Resume', value: resume.filename },
        { label: 'Pitch', value: message },
      ],
      attachments: [{ filename: resume.filename, content: resume.content }],
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error processing growth application:', error);
    return NextResponse.json(
      { error: 'Failed to submit. Please try again later.' },
      { status: 500 }
    );
  }
}
