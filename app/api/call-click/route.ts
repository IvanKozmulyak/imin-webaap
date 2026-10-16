import { NextRequest, NextResponse } from 'next/server';
import { sendTeamEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

// Beacon from the 20-minute call links on imin.wtf/pro: tells the team someone started booking.
// Errors are logged, never surfaced; ponytail: one email per click, no dedupe or rate limit.
export async function POST(request: NextRequest) {
  try {
    await sendTeamEmail({
      eyebrow: 'Creator call',
      accent: '#8b5cf6', // violet, so it never reads as a night pitch (green)
      heading: 'Book-a-call clicked',
      subject: 'Someone is booking a 20-minute call from imin.wtf/pro',
      fields: [
        {
          label: 'What',
          value:
            'A visitor clicked a 20-minute call link on imin.wtf/pro. Booking details follow from Cal.com if they finish.',
        },
        { label: 'Device', value: request.headers.get('user-agent') || '' },
      ],
    });
  } catch (error) {
    console.error('Error sending call-click notification:', error);
  }
  return NextResponse.json({ success: true }, { status: 200 });
}
