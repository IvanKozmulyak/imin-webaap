import { NextResponse } from 'next/server';
import { getUpcomingEvents } from '@/lib/services/eventService';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/apiResponse';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const events = await getUpcomingEvents();
    const response = createSuccessResponse(events);
    // Disable caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
