import { NextRequest, NextResponse } from 'next/server';
import { processWarmupForEvent } from '@/lib/services/squadWarmupService';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/apiResponse';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * POST /api/warmup
 * Trigger warmup sequence for squads in an event
 * 
 * Body: { eventId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId } = body;

    if (!eventId) {
      return createErrorResponse('eventId is required', 400);
    }

    console.log(`[Warmup API] Processing warmup for event: ${eventId}`);
    
    const result = await processWarmupForEvent(eventId);
    
    return createSuccessResponse({
      message: `Warmup processed for event ${eventId}`,
      ...result,
    });
  } catch (error: any) {
    console.error('[Warmup API] Error processing warmup:', error);
    return createErrorResponse(error.message || 'Internal server error', 500);
  }
}