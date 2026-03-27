import { NextRequest, NextResponse } from 'next/server';
import { performMatching, getMatchingResults } from '@/lib/services/matchingService';
import { triggerSquadWarmup, getSquadsNeedingWarmup } from '@/lib/services/squadWarmupService';
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
    
    // Trigger squad warmup for newly formed squads
    try {
      const squads = await getSquadsNeedingWarmup(eventId);
      const botUsername = process.env.TELEGRAM_BOT_USERNAME || 'imin_squad_bot';
      
      for (const squad of squads) {
        const config = {
          chatId: squad.chatId,
          eventLanguage: squad.eventLanguage,
          eventName: squad.eventName,
          eventDateTime: squad.eventDateTime,
          botUsername,
        };
        
        // Trigger warmup (sends first icebreaker immediately, schedules others)
        await triggerSquadWarmup(config);
      }
      
      console.log(`[Matching] Triggered warmup for ${squads.length} squads`);
    } catch (warmupError) {
      // Don't fail the matching if warmup fails
      console.error('[Matching] Warning: Failed to trigger warmup:', warmupError);
    }
    
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
