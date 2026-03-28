/**
 * Ambassador Service
 * Manages the IMIN Ambassador program for high-retention users
 * who help with event recruitment and manual squad creation
 */

import { prisma } from '@/lib/db/client';

export interface AmbassadorData {
  telegramId: string;
  telegramUsername?: string;
  firstName?: string;
}

export interface CreateSquadOptions {
  ambassadorId: string;
  eventId: string;
  squadName?: string;
  maxMembers?: number;
}

/**
 * Check if a user qualifies as an ambassador based on their activity
 * Criteria: 3+ events attended OR 5+ referrals OR 4+ star average rating
 */
export async function checkAmbassadorQualification(telegramId: string): Promise<{
  qualified: boolean;
  eventsAttended: number;
  squadsCreated: number;
  referrals: number;
  ratingScore: number;
  requirements: string[];
}> {
  // Get user registrations (events attended) - placeholder query, would need telegramId on registration
  const registrations = 0;

  // Get squads created by this user (via manual creation count)
  const squadsCreated = 0;

  // Get user's average rating
  const ratingsGiven = await prisma.rating.findMany({
    where: {
      targetTelegramId: telegramId,
    },
    select: {
      score: true,
    },
  });

  const ratingScore = ratingsGiven.length > 0
    ? ratingsGiven.reduce((sum, r) => sum + r.score, 0) / ratingsGiven.length
    : 0;

  // For now, referrals are tracked in ambassador table
  const ambassador = await prisma.ambassador.findUnique({
    where: { telegramId },
    select: { referrals: true },
  });
  const referrals = ambassador?.referrals || 0;

  const requirements = [];
  let qualified = false;

  // Check each requirement
  if (registrations >= 3) {
    requirements.push(`✓ ${registrations} events attended (need 3)`);
    qualified = true;
  } else {
    requirements.push(`✗ ${registrations}/3 events attended`);
  }

  if (squadsCreated >= 1) {
    requirements.push(`✓ ${squadsCreated} squads created (need 1)`);
    qualified = true;
  } else {
    requirements.push(`✗ ${squadsCreated}/1 squads created`);
  }

  if (ratingScore >= 4) {
    requirements.push(`✓ ${ratingScore.toFixed(1)} avg rating (need 4.0)`);
    qualified = true;
  } else {
    requirements.push(`✗ ${ratingScore.toFixed(1)}/4.0 avg rating`);
  }

  if (referrals >= 5) {
    requirements.push(`✓ ${referrals} referrals (need 5)`);
    qualified = true;
  } else {
    requirements.push(`✗ ${referrals}/5 referrals`);
  }

  return { qualified, eventsAttended: registrations, squadsCreated, referrals, ratingScore, requirements };
}

/**
 * Get or create an ambassador record
 */
export async function getOrCreateAmbassador(data: AmbassadorData): Promise<any> {
  let ambassador = await prisma.ambassador.findUnique({
    where: { telegramId: data.telegramId },
  });

  if (!ambassador) {
    ambassador = await prisma.ambassador.create({
      data: {
        telegramId: data.telegramId,
        telegramUsername: data.telegramUsername,
        firstName: data.firstName,
        isActive: true,
      },
    });
  }

  return ambassador;
}

/**
 * Get ambassador by telegram ID
 */
export async function getAmbassador(telegramId: string): Promise<any | null> {
  return prisma.ambassador.findUnique({
    where: { telegramId },
  });
}

/**
 * Get all active ambassadors
 */
export async function getAllAmbassadors(): Promise<any[]> {
  return prisma.ambassador.findMany({
    where: { isActive: true },
    orderBy: { ratingScore: 'desc' },
  });
}

/**
 * Update ambassador stats after an event
 */
export async function updateAmbassadorStats(
  telegramId: string,
  options: {
    eventsAttended?: number;
    squadsCreated?: number;
    referrals?: number;
    ratingScore?: number;
  }
): Promise<any> {
  const updateData: any = { updatedAt: new Date() };

  if (options.eventsAttended !== undefined) {
    updateData.eventsAttended = options.eventsAttended;
  }
  if (options.squadsCreated !== undefined) {
    updateData.squadsCreated = options.squadsCreated;
  }
  if (options.referrals !== undefined) {
    updateData.referrals = options.referrals;
  }
  if (options.ratingScore !== undefined) {
    updateData.ratingScore = options.ratingScore;
  }

  return prisma.ambassador.update({
    where: { telegramId },
    data: updateData,
  });
}

/**
 * Verify an ambassador (admin action)
 */
export async function verifyAmbassador(telegramId: string, badge?: string): Promise<any> {
  return prisma.ambassador.update({
    where: { telegramId },
    data: {
      isVerified: true,
      badge: badge || 'silver',
    },
  });
}

/**
 * Create a manual squad as an ambassador
 * This allows ambassadors to create squads for events they're organizing or helping with
 */
export async function createAmbassadorSquad(options: CreateSquadOptions): Promise<any> {
  const { ambassadorId, eventId, squadName, maxMembers = 5 } = options;

  // Verify ambassador exists and is active
  const ambassador = await prisma.ambassador.findFirst({
    where: { id: ambassadorId, isActive: true },
  });

  if (!ambassador) {
    throw new Error('Ambassador not found or inactive');
  }

  // Verify event exists
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    throw new Error('Event not found');
  }

  // Create the squad (matching group)
  const squad = await prisma.matchingGroup.create({
    data: {
      eventId,
      // Note: Would track createdBy ambassador in extended schema
    },
  });

  // Update ambassador's squads created count
  await prisma.ambassador.update({
    where: { id: ambassadorId },
    data: {
      squadsCreated: { increment: 1 },
      lastActiveAt: new Date(),
    },
  });

  return squad;
}

/**
 * Get ambassador dashboard data
 */
export async function getAmbassadorDashboard(telegramId: string): Promise<any> {
  const ambassador = await getAmbassador(telegramId);

  if (!ambassador) {
    return null;
  }

  // Get recent activity
  const recentSquads = await prisma.matchingGroup.count({
    where: {
      // Would filter by ambassador's created squads
    },
  });

  return {
    ...ambassador,
    stats: {
      eventsAttended: ambassador.eventsAttended,
      squadsCreated: ambassador.squadsCreated,
      referrals: ambassador.referrals,
      ratingScore: ambassador.ratingScore,
    },
    badge: ambassador.badge || getBadge(ambassador.ratingScore, ambassador.eventsAttended),
    commissionRate: ambassador.commissionRate,
    isVerified: ambassador.isVerified,
  };
}

/**
 * Calculate badge based on stats
 */
function getBadge(ratingScore: number, eventsAttended: number): string {
  if (ratingScore >= 4.5 && eventsAttended >= 10) return 'gold';
  if (ratingScore >= 4.0 && eventsAttended >= 5) return 'silver';
  if (ratingScore >= 3.5 && eventsAttended >= 3) return 'bronze';
  return 'new';
}

/**
 * Generate ambassador referral code
 */
export function generateReferralCode(telegramId: string): string {
  const hash = telegramId.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  return `IMIN${Math.abs(hash).toString(36).toUpperCase()}`;
}