import { NextRequest, NextResponse } from 'next/server';
import { handleLogisticsApiRequest } from '@/lib/services/meetupLogisticsService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId, action } = body;

    if (!eventId) {
      return NextResponse.json(
        { success: false, error: 'eventId is required' },
        { status: 400 }
      );
    }

    // Handle different actions
    if (action === 'trigger') {
      const result = await handleLogisticsApiRequest(eventId);
      return NextResponse.json(result);
    }

    // Default: trigger logistics
    const result = await handleLogisticsApiRequest(eventId);
    return NextResponse.json(result);
  } catch (error) {
    console.error('[Logistics API] Error:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'Meetup Logistics Service',
    description: 'Day-of coordination messages for squad meetups',
    endpoints: {
      POST: {
        eventId: 'Event ID to send logistics to',
        action: 'trigger (optional) - trigger logistics sequence',
      },
    },
  });
}