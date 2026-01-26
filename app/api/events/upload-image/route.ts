import { NextRequest, NextResponse } from 'next/server';
import { uploadEventImage } from '@/lib/services/supabaseService';
import { updateEventImageUrl } from '@/lib/services/eventService';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/apiResponse';
import { EventNotFoundException } from '@/lib/utils/errors';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const fileName = formData.get('fileName') as string || 'event-image';
    const eventId = formData.get('eventId') as string;

    if (!file) {
      return createErrorResponse('No file provided', 400);
    }

    if (!eventId) {
      return createErrorResponse('Event ID is required', 400);
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return createErrorResponse('Invalid file type. Only JPEG, PNG, and WebP are allowed.', 400);
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return createErrorResponse('File size exceeds 5MB limit', 400);
    }

    // Upload image to Supabase Storage
    const imageUrl = await uploadEventImage(file, fileName || file.name);

    // Save image URL to database
    await updateEventImageUrl(eventId, imageUrl);

    return createSuccessResponse({ imageUrl, eventId });
  } catch (error) {
    console.error('Error uploading image:', error);
    
    if (error instanceof EventNotFoundException) {
      return createErrorResponse(error.message, 404);
    }
    
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to upload image',
      500
    );
  }
}
