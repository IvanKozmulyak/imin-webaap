import { prisma } from '@/lib/db/client';
import { EventDto } from '@/lib/types/event';
import { EventNotFoundException } from '@/lib/utils/errors';

export async function getUpcomingEvents(): Promise<EventDto[]> {
  const now = new Date();
  const events = await prisma.event.findMany({
    where: {
      toDateTime: { gt: now },
      isActive: true,
    },
    orderBy: { fromDateTime: 'asc' },
  });

  return events.map(event => ({
    id: event.id,
    name: event.name,
    description: event.description,
    fromDateTime: event.fromDateTime.toISOString(),
    toDateTime: event.toDateTime.toISOString(),
    location: event.location,
    ticketUrl: event.ticketUrl,
    imageUrl: event.imageUrl,
    isActive: event.isActive,
    createdAt: event.createdAt.toISOString(),
  }));
}

/**
 * Get all active events (including past events)
 * Useful for displaying all events regardless of date
 */
export async function getAllActiveEvents(): Promise<EventDto[]> {
  const events = await prisma.event.findMany({
    where: {
      isActive: true,
    },
    orderBy: { fromDateTime: 'asc' },
  });

  return events.map(event => ({
    id: event.id,
    name: event.name,
    description: event.description,
    fromDateTime: event.fromDateTime.toISOString(),
    toDateTime: event.toDateTime.toISOString(),
    location: event.location,
    ticketUrl: event.ticketUrl,
    imageUrl: event.imageUrl,
    isActive: event.isActive,
    createdAt: event.createdAt.toISOString(),
  }));
}

export async function getEventById(eventId: string) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    throw new EventNotFoundException(eventId);
  }

  return event;
}

/**
 * Update event image URL
 * @param eventId - Event ID
 * @param imageUrl - Image URL to save
 * @returns Updated event
 */
export async function updateEventImageUrl(eventId: string, imageUrl: string) {
  // Verify event exists
  const event = await getEventById(eventId);

  // Update the event with the image URL
  const updatedEvent = await prisma.event.update({
    where: { id: eventId },
    data: { imageUrl },
  });

  return updatedEvent;
}
