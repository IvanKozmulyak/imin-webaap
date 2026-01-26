import { NextRequest, NextResponse } from 'next/server';
import { getEventById } from '@/lib/services/eventService';
import { EventNotFoundException } from '@/lib/utils/errors';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/apiResponse';
import { EventDto } from '@/lib/types/event';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const eventId = params.eventId;
    const event = await getEventById(eventId);
    
    const eventDto: EventDto = {
      id: event.id,
      name: event.name,
      description: event.description,
      fromDateTime: event.fromDateTime.toISOString(),
      toDateTime: event.toDateTime.toISOString(),
      location: event.location,
      ticketUrl: event.ticketUrl,
      imageUrl: event.imageUrl,
      isActive: event.isActive,
      createdAt: event.createdAt.toISOString(),
    };
    
    const response = createSuccessResponse(eventDto);
    // Disable caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  } catch (error: any) {
    if (error instanceof EventNotFoundException) {
      return createErrorResponse(error.message, 404);
    }
    console.error('Error fetching event:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
