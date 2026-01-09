import { NextRequest, NextResponse } from 'next/server';
import { performMatching, getMatchingResults } from '@/lib/services/matchingService';
import { EventNotFoundException } from '@/lib/utils/errors';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/apiResponse';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const eventId = params.eventId;
    const result = await performMatching(eventId);
    return createSuccessResponse(result, 201);
  } catch (error: any) {
    if (error instanceof EventNotFoundException) {
      return createErrorResponse(error.message, 404);
    }
    console.error('Error performing matching:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const eventId = params.eventId;
    const result = await getMatchingResults(eventId);
    const response = createSuccessResponse(result);
    // Disable caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  } catch (error: any) {
    if (error instanceof EventNotFoundException) {
      return createErrorResponse(error.message, 404);
    }
    console.error('Error fetching matching results:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
