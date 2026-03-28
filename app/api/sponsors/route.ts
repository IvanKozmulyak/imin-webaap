import { NextRequest, NextResponse } from 'next/server'
import { createSponsor, getActiveSponsors, getSponsorsByTier, getSponsorsByCategory, getSponsorByRedemptionCode, findMatchingSponsors } from '@/lib/services/sponsorshipService'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const tier = searchParams.get('tier')
  const category = searchParams.get('category')
  const redemptionCode = searchParams.get('code')
  const match = searchParams.get('match')

  try {
    // Get sponsor by redemption code
    if (redemptionCode) {
      const sponsor = await getSponsorByRedemptionCode(redemptionCode)
      if (!sponsor) {
        return NextResponse.json({ error: 'Sponsor not found' }, { status: 404 })
      }
      return NextResponse.json(sponsor)
    }

    // Find matching sponsors for an event
    if (match) {
      const eventCategory = searchParams.get('eventCategory') || undefined
      const city = searchParams.get('city') || undefined
      const sponsors = await findMatchingSponsors(eventCategory, city)
      return NextResponse.json(sponsors)
    }

    // Get by tier
    if (tier) {
      const sponsors = await getSponsorsByTier(tier as 'bronze' | 'silver' | 'gold')
      return NextResponse.json(sponsors)
    }

    // Get by category
    if (category) {
      const sponsors = await getSponsorsByCategory(category)
      return NextResponse.json(sponsors)
    }

    // Default: get all active sponsors
    const sponsors = await getActiveSponsors()
    return NextResponse.json(sponsors)
  } catch (error) {
    console.error('Error fetching sponsors:', error)
    return NextResponse.json({ error: 'Failed to fetch sponsors' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const sponsor = await createSponsor({
      name: body.name,
      logoUrl: body.logoUrl,
      description: body.description,
      tier: body.tier,
      category: body.category,
      budgetCents: body.budgetCents,
      pricePerSquadCents: body.pricePerSquadCents,
      targetEventCategories: body.targetEventCategories,
      targetCities: body.targetCities,
      redemptionUrl: body.redemptionUrl,
      perkDescription: body.perkDescription,
      contactEmail: body.contactEmail,
    })

    return NextResponse.json(sponsor, { status: 201 })
  } catch (error) {
    console.error('Error creating sponsor:', error)
    return NextResponse.json({ error: 'Failed to create sponsor' }, { status: 500 })
  }
}