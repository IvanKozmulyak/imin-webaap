import { NextRequest, NextResponse } from 'next/server';
import { sendTeamEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

// Fire-and-forget beacon from the "Book a call with Bohdan" button.
// Notifies the team that someone started booking; the visitor's flow
// (Cal.com / mailto) is untouched, so errors are logged, never surfaced.
export async function POST(request: NextRequest) {
  try {
    await sendTeamEmail({
      eyebrow: 'Investor call',
      accent: '#8b5cf6', // violet — distinct from access (green) and growth (amber)
      heading: 'Book-a-call clicked',
      subject: 'Someone is booking a call with Bohdan',
      fields: [
        {
          label: 'What',
          value:
            'A visitor clicked "Book a call with Bohdan" on the landing page. Booking details follow from Cal.com (or their email) if they finish.',
        },
        { label: 'Device', value: request.headers.get('user-agent') || '' },
      ],
    });
  } catch (error) {
    console.error('Error sending call-click notification:', error);
  }
  return NextResponse.json({ success: true }, { status: 200 });
}
