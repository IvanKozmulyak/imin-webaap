import { prisma } from '@/lib/db/client';
import { EventDto } from '@/lib/types/event';
import { EventNotFoundException } from '@/lib/utils/errors';

export async function getUpcomingEvents(): Promise<EventDto[]> {
  const now = new Date();
  const events = await prisma.event.findMany({
    where: {
      eventDateTime: { gt: now },
      isActive: true,
    },
    orderBy: { eventDateTime: 'asc' },
  });

  return events.map(event => ({
    id: event.id,
    name: event.name,
    description: event.description,
    eventDateTime: event.eventDateTime.toISOString(),
    location: event.location,
    ticketUrl: event.ticketUrl,
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
