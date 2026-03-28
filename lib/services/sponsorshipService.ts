// Sponsored Squad Experiences Service
// Manages brand sponsorships for squads

import { prisma } from '@/lib/db/client'

export type SponsorTier = 'bronze' | 'silver' | 'gold'
export type SponsorshipStatus = 'pending' | 'confirmed' | 'sent' | 'redeemed' | 'expired'

export interface CreateSponsorInput {
  name: string
  logoUrl?: string
  description?: string
  tier: SponsorTier
  category: string
  budgetCents?: number
  pricePerSquadCents: number
  targetEventCategories?: string[]
  targetCities?: string[]
  redemptionUrl?: string
  perkDescription: string
  contactEmail?: string
}

export interface CreateSponsorshipInput {
  sponsorId: string
  eventId: string
  squadId?: string
  tier: SponsorTier
  amountCents: number
}

// Generate unique redemption code
function generateRedemptionCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = 'IMIN'
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// Create a new sponsor
export async function createSponsor(input: CreateSponsorInput) {
  const sponsor = await prisma.sponsor.create({
    data: {
      name: input.name,
      logoUrl: input.logoUrl,
      description: input.description,
      tier: input.tier,
      category: input.category,
      budgetCents: input.budgetCents || 0,
      pricePerSquadCents: input.pricePerSquadCents,
      targetEventCategories: input.targetEventCategories || [],
      targetCities: input.targetCities || [],
      redemptionCode: generateRedemptionCode(),
      redemptionUrl: input.redemptionUrl,
      perkDescription: input.perkDescription,
      contactEmail: input.contactEmail,
    },
  })
  return sponsor
}

// Get all active sponsors
export async function getActiveSponsors() {
  return prisma.sponsor.findMany({
    where: { isActive: true },
    orderBy: { tier: 'desc' },
  })
}

// Get sponsors by tier
export async function getSponsorsByTier(tier: SponsorTier) {
  return prisma.sponsor.findMany({
    where: { tier, isActive: true },
  })
}

// Get sponsors by category
export async function getSponsorsByCategory(category: string) {
  return prisma.sponsor.findMany({
    where: { category, isActive: true },
  })
}

// Get sponsor by redemption code
export async function getSponsorByRedemptionCode(code: string) {
  return prisma.sponsor.findUnique({
    where: { redemptionCode: code },
  })
}

// Create a sponsorship (link sponsor to event/squad)
export async function createSponsorship(input: CreateSponsorshipInput) {
  const sponsorship = await prisma.sponsorship.create({
    data: {
      sponsorId: input.sponsorId,
      eventId: input.eventId,
      squadId: input.squadId,
      tier: input.tier,
      amountCents: input.amountCents,
      status: 'pending',
    },
  })
  return sponsorship
}

// Get sponsorships for an event
export async function getSponsorshipsByEvent(eventId: string) {
  return prisma.sponsorship.findMany({
    where: { eventId },
    include: { sponsor: true },
    orderBy: { createdAt: 'desc' },
  })
}

// Get sponsorships for a squad
export async function getSponsorshipsBySquad(squadId: string) {
  return prisma.sponsorship.findMany({
    where: { squadId },
    include: { sponsor: true },
  })
}

// Mark sponsorship as sent (notified to squad)
export async function markSponsorshipSent(sponsorshipId: string) {
  return prisma.sponsorship.update({
    where: { id: sponsorshipId },
    data: { status: 'sent' },
  })
}

// Redeem a sponsorship (squad member uses the perk)
export async function redeemSponsorship(sponsorshipId: string, redeemedBy: string) {
  return prisma.sponsorship.update({
    where: { id: sponsorshipId },
    data: {
      status: 'redeemed',
      redeemedAt: new Date(),
      redeemedBy,
    },
  })
}

// Redeem by code (find and redeem)
export async function redeemByCode(redemptionCode: string, redeemedBy: string) {
  const sponsor = await prisma.sponsor.findUnique({
    where: { redemptionCode },
    include: {
      sponsorships: {
        where: { status: 'sent' },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  })

  if (!sponsor || sponsor.sponsorships.length === 0) {
    throw new Error('Invalid or expired redemption code')
  }

  const sponsorship = sponsor.sponsorships[0]

  await prisma.sponsorship.update({
    where: { id: sponsorship.id },
    data: {
      status: 'redeemed',
      redeemedAt: new Date(),
      redeemedBy,
    },
  })

  return { sponsor, sponsorship }
}

// Get sponsorship analytics
export async function getSponsorshipAnalytics() {
  const total = await prisma.sponsorship.count()
  const redeemed = await prisma.sponsorship.count({ where: { status: 'redeemed' } })
  const sent = await prisma.sponsorship.count({ where: { status: 'sent' } })
  const pending = await prisma.sponsorship.count({ where: { status: 'pending' } })

  const revenueResult = await prisma.sponsorship.aggregate({
    _sum: { amountCents: true },
    where: { status: { in: ['sent', 'redeemed'] } },
  })

  return {
    total,
    redeemed,
    sent,
    pending,
    redemptionRate: total > 0 ? (redeemed / total) * 100 : 0,
    revenueCents: revenueResult._sum.amountCents || 0,
  }
}

// Find matching sponsors for an event
export async function findMatchingSponsors(eventCategory?: string, city?: string) {
  const sponsors = await prisma.sponsor.findMany({
    where: {
      isActive: true,
      budgetCents: { gt: 0 },
    },
  })

  return sponsors.filter((sponsor) => {
    // Match by category if specified
    if (eventCategory && sponsor.targetEventCategories.length > 0) {
      if (!sponsor.targetEventCategories.includes(eventCategory)) return false
    }
    // Match by city if specified
    if (city && sponsor.targetCities.length > 0) {
      if (!sponsor.targetCities.includes(city)) return false
    }
    return true
  })
}