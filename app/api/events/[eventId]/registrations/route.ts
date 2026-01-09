import { NextRequest, NextResponse } from 'next/server';
import { createEventRegistration } from '@/lib/services/eventRegistrationService';
import { eventRegistrationRequestSchema } from '@/lib/utils/validation';
import { EventNotFoundException, DuplicateTelegramError } from '@/lib/utils/errors';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/apiResponse';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const eventId = params.eventId;
    
    // Parse and validate request body
    const body = await request.json();
    const validationResult = eventRegistrationRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      validationResult.error.errors.forEach(err => {
        if (err.path.length > 0) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      return createErrorResponse('Validation failed', 400, fieldErrors);
    }

    const data = validationResult.data;

    // Create registration
    const registration = await createEventRegistration(eventId, data);
    return createSuccessResponse(registration, 201);
  } catch (error: any) {
    if (error instanceof EventNotFoundException) {
      return createErrorResponse(error.message, 404);
    }
    if (error instanceof DuplicateTelegramError) {
      return createErrorResponse(error.message, 400);
    }
    // Handle Prisma unique constraint violation
    if (error.code === 'P2002' && error.meta?.target?.includes('telegram')) {
      // Try to get telegram from error message or use generic message
      const telegram = error.meta?.target?.find((t: string) => t === 'telegram') 
        ? 'provided' 
        : 'provided';
      return createErrorResponse(
        `Telegram ${telegram} is already registered`,
        400
      );
    }
    console.error('Error creating event registration:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
