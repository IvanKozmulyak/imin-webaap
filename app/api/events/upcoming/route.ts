import { NextResponse } from 'next/server';
import { getUpcomingEvents } from '@/lib/services/eventService';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/apiResponse';

export async function GET() {
  try {
    const events = await getUpcomingEvents();
    return createSuccessResponse(events);
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
