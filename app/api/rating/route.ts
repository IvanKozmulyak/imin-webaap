import { NextRequest, NextResponse } from 'next/server';
import { ratingService } from '@/lib/services/ratingService';

export const dynamic = 'force-dynamic';

/**
 * POST /api/rating
 * Submit a rating
 * 
 * Body: {
 *   eventId: string,
 *   raterTelegramId: string,
 *   targetType: 'user' | 'group' | 'event' | 'organizer',
 *   targetTelegramId?: string,
 *   targetGroupId?: string,
 *   score: number (1-5),
 *   review?: string,
 *   category?: 'overall' | 'friendliness' | 'reliability' | 'communication' | 'fun'
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      eventId,
      raterTelegramId,
      targetType,
      targetTelegramId,
      targetGroupId,
      score,
      review,
      category,
    } = body;

    // Validation
    if (!eventId || !raterTelegramId || !targetType || !score) {
      return NextResponse.json(
        { error: 'Missing required fields: eventId, raterTelegramId, targetType, score' },
        { status: 400 }
      );
    }

    if (score < 1 || score > 5) {
      return NextResponse.json(
        { error: 'Score must be between 1 and 5' },
        { status: 400 }
      );
    }

    const rating = await ratingService.createRating({
      eventId,
      raterTelegramId,
      targetType,
      targetTelegramId,
      targetGroupId,
      score,
      review,
      category,
    });

    return NextResponse.json({ success: true, rating });
  } catch (error: any) {
    console.error('Error creating rating:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create rating' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/rating
 * Get ratings - query params: targetTelegramId, eventId
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const targetTelegramId = searchParams.get('targetTelegramId');
    const eventId = searchParams.get('eventId');

    // If targetTelegramId provided, get ratings for that user
    if (targetTelegramId) {
      const summary = await ratingService.getRatingSummary(targetTelegramId, eventId || undefined);
      return NextResponse.json(summary);
    }

    // If eventId provided, get event ratings
    if (eventId) {
      const ratings = await ratingService.getEventRatings(eventId);
      const summary = await ratingService.getEventRatingSummary(eventId);
      return NextResponse.json({ ratings, summary });
    }

    // Otherwise, get bad actors
    const badActors = await ratingService.getBadActors();
    return NextResponse.json({ badActors });
  } catch (error: any) {
    console.error('Error fetching ratings:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch ratings' },
      { status: 500 }
    );
  }
}