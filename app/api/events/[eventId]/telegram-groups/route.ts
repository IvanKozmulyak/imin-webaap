import { NextRequest, NextResponse } from 'next/server';
import { createTelegramGroupsForEvent } from '@/lib/services/telegramService';
import { getEventById } from '@/lib/services/eventService';
import { EventNotFoundException } from '@/lib/utils/errors';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/apiResponse';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface CreateGroupsRequest {
  numberOfGroups?: number;
  maxMembersPerGroup?: number;
  botUsername?: string;
}

/**
 * POST /api/events/[eventId]/telegram-groups
 * Creates Telegram groups for an event
 * 
 * Request body (optional):
 * - numberOfGroups: number of groups to create (default: 10)
 * - maxMembersPerGroup: maximum members per group (default: 5)
 * - botUsername: bot username to add as admin (default: 'imin_squad_bot')
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const eventId = params.eventId;

    // Verify event exists
    const event = await getEventById(eventId);

    // Parse request body (optional parameters)
    let body: CreateGroupsRequest = {};
    try {
      const contentType = request.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        body = await request.json();
      }
    } catch (error) {
      // If body is empty or invalid JSON, use defaults
      body = {};
    }

    const numberOfGroups = body.numberOfGroups ?? 10;
    const maxMembersPerGroup = body.maxMembersPerGroup ?? 5;
    const botUsername = body.botUsername ?? 'imin_squad_bot';

    // Validate parameters
    if (numberOfGroups < 1 || numberOfGroups > 100) {
      return createErrorResponse('numberOfGroups must be between 1 and 100', 400);
    }
    if (maxMembersPerGroup < 1 || maxMembersPerGroup > 200) {
      return createErrorResponse('maxMembersPerGroup must be between 1 and 200', 400);
    }

    // Create groups
    const createdGroups = await createTelegramGroupsForEvent(
      eventId,
      event.name,
      numberOfGroups,
      maxMembersPerGroup,
      botUsername
    );

    return createSuccessResponse({
      eventId: event.id,
      eventName: event.name,
      requestedGroups: numberOfGroups,
      createdGroups: createdGroups.length,
      groups: createdGroups.map(g => ({
        id: g.id,
        groupNumber: g.groupNumber,
        inviteLink: g.inviteLink,
        chatId: g.chatId,
      })),
    }, 201);
  } catch (error: any) {
    if (error instanceof EventNotFoundException) {
      return createErrorResponse(error.message, 404);
    }
    console.error('Error creating Telegram groups:', error);
    return createErrorResponse(
      error.message || 'Internal server error',
      500
    );
  }
}
