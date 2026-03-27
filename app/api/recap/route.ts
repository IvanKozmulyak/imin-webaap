import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { createRecapMessage, buildRecapCardUrl } from '@/lib/services/recapCardService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId, registrationId, language = 'en' } = body;

    if (!eventId || !registrationId) {
      return NextResponse.json(
        { error: 'eventId and registrationId are required' },
        { status: 400 }
      );
    }

    // Fetch event data
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Fetch registration with matching group
    const registration = await prisma.eventRegistration.findUnique({
      where: { id: registrationId },
      include: {
        matchingGroupMembers: {
          include: {
            matchingGroup: {
              include: {
                members: true,
              },
            },
          },
        },
      },
    });

    if (!registration) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      );
    }

    // Get user's matching group for this event
    const groupMember = registration.matchingGroupMembers[0];
    const group = groupMember?.matchingGroup;
    
    // Format the date
    const eventDate = new Date(event.fromDateTime).toLocaleDateString(
      language === 'uk' ? 'uk-UA' : 'en-US',
      { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric',
        hour: '2-digit', 
        minute: '2-digit'
      }
    );

    // Build recap card data
    const recapData = {
      eventName: event.name,
      eventDate,
      venue: event.location || undefined,
      squadName: undefined,
      squadSize: group?.members?.length || 0,
      userName: registration.name || 'Friend',
      language: language as 'en' | 'uk',
    };

    // Generate the card URL (for OG image)
    const cardUrl = buildRecapCardUrl(recapData);
    const fullCardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://imin.wtf'}${cardUrl}`;

    // Create the message
    const message = createRecapMessage(recapData, fullCardUrl);

    return NextResponse.json({
      success: true,
      cardUrl: fullCardUrl,
      message: 'Recap card generated',
      telegramMessage: message,
    });

  } catch (error) {
    console.error('Error generating recap card:', error);
    return NextResponse.json(
      { error: 'Failed to generate recap card' },
      { status: 500 }
    );
  }
}