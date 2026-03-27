import { NextRequest, NextResponse } from 'next/server';
import { getOrganizerByApiKey, getEventAnalytics } from '@/lib/services/organizerService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const apiKey = request.headers.get('x-api-key');
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key required' },
        { status: 401 }
      );
    }
    
    const organizer = await getOrganizerByApiKey(apiKey);
    
    if (!organizer) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }
    
    const { eventId } = await params;
    const analytics = await getEventAnalytics(organizer.id, eventId);
    
    if (!analytics) {
      return NextResponse.json(
        { error: 'Event not found or access denied' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      analytics,
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}