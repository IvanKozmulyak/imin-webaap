import { NextRequest, NextResponse } from 'next/server';
import { getOrganizerByApiKey, createEventForOrganizer, getOrganizerEvents } from '@/lib/services/organizerService';

export async function GET(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-api-key');
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key required' },
        { status: 401 }
      );
    }
    
    const organizer = await getOrganizerByApiKey(apiKey);
    
    if (!organizer) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }
    
    const events = await getOrganizerEvents(organizer.id);
    
    return NextResponse.json({
      success: true,
      events,
    });
  } catch (error) {
    console.error('Get events error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-api-key');
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key required' },
        { status: 401 }
      );
    }
    
    const organizer = await getOrganizerByApiKey(apiKey);
    
    if (!organizer) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { name, description, fromDateTime, toDateTime, location, ticketUrl, imageUrl } = body;
    
    if (!name || !fromDateTime || !toDateTime || !location) {
      return NextResponse.json(
        { error: 'Name, dates, and location are required' },
        { status: 400 }
      );
    }
    
    const event = await createEventForOrganizer(organizer.id, {
      name,
      description,
      fromDateTime: new Date(fromDateTime),
      toDateTime: new Date(toDateTime),
      location,
      ticketUrl,
      imageUrl,
    });
    
    return NextResponse.json({
      success: true,
      event: {
        id: event.id,
        name: event.name,
        fromDateTime: event.fromDateTime,
        toDateTime: event.toDateTime,
        location: event.location,
      },
    });
  } catch (error) {
    console.error('Create event error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}