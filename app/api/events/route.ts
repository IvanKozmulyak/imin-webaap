import { NextResponse } from 'next/server';
import { getAllActiveEvents } from '@/lib/services/eventService';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/apiResponse';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/events
 * Get all active events (including past events)
 * Use this endpoint to display all events regardless of date
 */
export async function GET() {
  try {
    const events = await getAllActiveEvents();
    const response = createSuccessResponse(events);
    // Disable caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  } catch (error) {
    console.error('Error fetching events:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
