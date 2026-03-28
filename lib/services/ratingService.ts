/**
 * Rating Service - Post-event feedback & rating system
 * 
 * Handles:
 * - 1-5 star ratings for users, groups, events, and organizers
 * - Bad actor identification
 * - Review collection for marketing/trust
 */

import { PrismaClient, Rating, BadActor } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateRatingInput {
  eventId: string;
  raterTelegramId: string;
  targetType: 'user' | 'group' | 'event' | 'organizer';
  targetTelegramId?: string;
  targetGroupId?: string;
  score: number; // 1-5
  review?: string;
  category?: 'overall' | 'friendliness' | 'reliability' | 'communication' | 'fun';
}

export interface RatingSummary {
  averageScore: number;
  totalRatings: number;
  categories: Record<string, { average: number; count: number }>;
}

class RatingService {
  /**
   * Submit a rating for a user, group, event, or organizer
   */
  async createRating(input: CreateRatingInput): Promise<Rating> {
    const { eventId, raterTelegramId, targetType, targetTelegramId, targetGroupId, score, review, category } = input;

    // Validate score
    if (score < 1 || score > 5) {
      throw new Error('Rating score must be between 1 and 5');
    }

    // Validate target
    if (!targetTelegramId && !targetGroupId && targetType !== 'event') {
      throw new Error('Rating must have a target (user, group, or event)');
    }

    // Check for duplicate rating
    if (targetTelegramId) {
      const existing = await prisma.rating.findUnique({
        where: {
          eventId_raterTelegramId_targetTelegramId_targetType: {
            eventId,
            raterTelegramId,
            targetTelegramId,
            targetType,
          },
        },
      });

      if (existing) {
        throw new Error('You have already rated this target for this event');
      }
    }

    // Create rating
    const rating = await prisma.rating.create({
      data: {
        eventId,
        raterTelegramId,
        targetType,
        targetTelegramId,
        targetGroupId,
        score,
        review,
        category,
        isBadActor: score <= 2, // Auto-flag low ratings as potential bad actors
      },
    });

    // If low score, check if we should flag as bad actor
    if (score <= 2) {
      await this.handlePotentialBadActor(raterTelegramId, targetTelegramId, review);
    }

    return rating;
  }

  /**
   * Handle potential bad actor reporting
   */
  private async handlePotentialBadActor(raterId: string, targetId?: string, reason?: string) {
    if (!targetId) return;

    const existing = await prisma.badActor.findUnique({
      where: { telegramId: targetId },
    });

    if (existing) {
      // Increment report count
      await prisma.badActor.update({
        where: { telegramId: targetId },
        data: {
          reportedByCount: { increment: 1 },
          reason: reason ? `${existing.reason}\n${reason}` : existing.reason,
        },
      });
    } else {
      // Create new bad actor entry
      await prisma.badActor.create({
        data: {
          telegramId: targetId,
          reason: reason || 'Low rating',
        },
      });
    }
  }

  /**
   * Get ratings for a specific target
   */
  async getRatingsForTarget(targetTelegramId: string, eventId?: string): Promise<Rating[]> {
    const where: any = {
      targetTelegramId,
    };

    if (eventId) {
      where.eventId = eventId;
    }

    return prisma.rating.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get rating summary for a user
   */
  async getRatingSummary(targetTelegramId: string, eventId?: string): Promise<RatingSummary> {
    const where: any = {
      targetTelegramId,
    };

    if (eventId) {
      where.eventId = eventId;
    }

    const ratings = await prisma.rating.findMany({ where });

    if (ratings.length === 0) {
      return {
        averageScore: 0,
        totalRatings: 0,
        categories: {},
      };
    }

    // Calculate average
    const totalScore = ratings.reduce((sum, r) => sum + r.score, 0);
    const averageScore = totalScore / ratings.length;

    // Group by category
    const categories: Record<string, { total: number; count: number }> = {};
    for (const rating of ratings) {
      if (rating.category) {
        if (!categories[rating.category]) {
          categories[rating.category] = { total: 0, count: 0 };
        }
        categories[rating.category].total += rating.score;
        categories[rating.category].count++;
      }
    }

    // Calculate category averages
    const categorySummary: Record<string, { average: number; count: number }> = {};
    for (const [cat, data] of Object.entries(categories)) {
      categorySummary[cat] = {
        average: data.total / data.count,
        count: data.count,
      };
    }

    return {
      averageScore: Math.round(averageScore * 10) / 10,
      totalRatings: ratings.length,
      categories: categorySummary,
    };
  }

  /**
   * Get all bad actors
   */
  async getBadActors(minReports: number = 2): Promise<BadActor[]> {
    return prisma.badActor.findMany({
      where: {
        reportedByCount: { gte: minReports },
      },
      orderBy: { reportedByCount: 'desc' },
    });
  }

  /**
   * Check if a user is flagged as a bad actor
   */
  async isBadActor(telegramId: string): Promise<boolean> {
    const badActor = await prisma.badActor.findUnique({
      where: { telegramId },
    });
    return !!badActor && badActor.reportedByCount >= 2;
  }

  /**
   * Get positive reviews for marketing
   */
  async getPositiveReviews(eventId?: string, minScore: number = 4, limit: number = 10): Promise<Rating[]> {
    const where: any = {
      score: { gte: minScore },
      review: { not: null },
    };

    if (eventId) {
      where.eventId = eventId;
    }

    return prisma.rating.findMany({
      where,
      orderBy: { score: 'desc' },
      take: limit,
    });
  }

  /**
   * Get ratings for an event
   */
  async getEventRatings(eventId: string): Promise<Rating[]> {
    return prisma.rating.findMany({
      where: { eventId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get event rating summary
   */
  async getEventRatingSummary(eventId: string): Promise<RatingSummary> {
    const ratings = await prisma.rating.findMany({
      where: { eventId, targetType: 'event' },
    });

    if (ratings.length === 0) {
      return {
        averageScore: 0,
        totalRatings: 0,
        categories: {},
      };
    }

    const totalScore = ratings.reduce((sum, r) => sum + r.score, 0);
    const averageScore = totalScore / ratings.length;

    return {
      averageScore: Math.round(averageScore * 10) / 10,
      totalRatings: ratings.length,
      categories: {},
    };
  }
}

export const ratingService = new RatingService();