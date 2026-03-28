import { prisma } from '../db/client';

// Simple hash function for demo (in production use bcrypt)
function simpleHash(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return 'hash_' + Math.abs(hash).toString(16);
}

function generateApiKey(): string {
  return 'imin_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export async function createOrganizer(data: {
  email: string;
  name: string;
  organization: string;
  password: string;
}) {
  const passwordHash = simpleHash(data.password);
  const apiKey = generateApiKey();
  
  const organizer = await prisma.organizer.create({
    data: {
      email: data.email,
      name: data.name,
      organization: data.organization,
      passwordHash,
      apiKey,
    },
  });
  
  return {
    id: organizer.id,
    email: organizer.email,
    name: organizer.name,
    organization: organizer.organization,
    apiKey: organizer.apiKey,
  };
}

export async function authenticateOrganizer(email: string, password: string) {
  const passwordHash = simpleHash(password);
  
  const organizer = await prisma.organizer.findFirst({
    where: {
      email,
      passwordHash,
      isActive: true,
    },
  });
  
  if (!organizer) {
    return null;
  }
  
  return {
    id: organizer.id,
    email: organizer.email,
    name: organizer.name,
    organization: organizer.organization,
    apiKey: organizer.apiKey,
  };
}

export async function getOrganizerByApiKey(apiKey: string) {
  const organizer = await prisma.organizer.findFirst({
    where: {
      apiKey,
      isActive: true,
    },
    include: {
      events: {
        include: {
          event: {
            include: {
              registrations: true,
              telegramGroups: true,
            },
          },
        },
      },
    },
  });
  
  return organizer;
}

export async function getOrganizerEvents(organizerId: string) {
  const organizerEvents = await prisma.organizerEvent.findMany({
    where: {
      organizerId,
    },
    include: {
      event: {
        include: {
          registrations: true,
          telegramGroups: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  
  return organizerEvents.map(oe => ({
    id: oe.event.id,
    name: oe.event.name,
    description: oe.event.description,
    fromDateTime: oe.event.fromDateTime,
    toDateTime: oe.event.toDateTime,
    location: oe.event.location,
    ticketUrl: oe.event.ticketUrl,
    imageUrl: oe.event.imageUrl,
    isActive: oe.event.isActive,
    status: oe.status,
    commissionRate: oe.commissionRate,
    registrations: {
      total: oe.event.registrations.length,
      male: oe.event.registrations.filter(r => r.sex === 'male').length,
      female: oe.event.registrations.filter(r => r.sex === 'female').length,
      other: oe.event.registrations.filter(r => r.sex === 'other').length,
    },
    squads: oe.event.telegramGroups.length,
    matchedUsers: oe.event.telegramGroups.reduce((acc, tg) => acc + tg.memberCount, 0),
  }));
}

export async function createEventForOrganizer(organizerId: string, eventData: {
  name: string;
  description?: string;
  fromDateTime: Date;
  toDateTime: Date;
  location: string;
  ticketUrl?: string;
  imageUrl?: string;
}) {
  // Create the event first
  const event = await prisma.event.create({
    data: {
      name: eventData.name,
      description: eventData.description,
      fromDateTime: eventData.fromDateTime,
      toDateTime: eventData.toDateTime,
      location: eventData.location,
      ticketUrl: eventData.ticketUrl,
      imageUrl: eventData.imageUrl,
    },
  });
  
  // Link to organizer
  await prisma.organizerEvent.create({
    data: {
      organizerId,
      eventId: event.id,
      status: 'active',
      commissionRate: 0,
    },
  });
  
  return event;
}

export async function getEventAnalytics(organizerId: string, eventId: string) {
  // Verify the event belongs to this organizer
  const organizerEvent = await prisma.organizerEvent.findFirst({
    where: {
      organizerId,
      eventId,
    },
    include: {
      event: {
        include: {
          registrations: true,
          telegramGroups: true,
        },
      },
    },
  });
  
  if (!organizerEvent) {
    return null;
  }
  
  const event = organizerEvent.event;
  const registrations = event.registrations;
  const groups = event.telegramGroups;
  
  // Calculate analytics
  const totalRegistrations = registrations.length;
  const matchedUsers = groups.reduce((acc, g) => acc + g.memberCount, 0);
  const pendingRegistrations = totalRegistrations - matchedUsers;
  
  // Age distribution
  const ageGroups = {
    '18-24': registrations.filter(r => r.age >= 18 && r.age <= 24).length,
    '25-34': registrations.filter(r => r.age >= 25 && r.age <= 34).length,
    '35-44': registrations.filter(r => r.age >= 35 && r.age <= 44).length,
    '45+': registrations.filter(r => r.age >= 45).length,
  };
  
  // Gender distribution
  const genderDist = {
    male: registrations.filter(r => r.sex === 'male').length,
    female: registrations.filter(r => r.sex === 'female').length,
    other: registrations.filter(r => r.sex === 'other').length,
    preferNotToSay: registrations.filter(r => r.sex === 'prefer_not_to_say').length,
  };
  
  // Squad stats
  const squadStats = {
    totalSquads: groups.length,
    fullSquads: groups.filter(g => g.isFull).length,
    averageSize: groups.length > 0 
      ? groups.reduce((acc, g) => acc + g.memberCount, 0) / groups.length 
      : 0,
  };
  
  // Timeline - registrations by day
  const registrationsByDay = registrations.reduce((acc, r) => {
    const day = r.createdAt.toISOString().split('T')[0];
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return {
    event: {
      id: event.id,
      name: event.name,
      fromDateTime: event.fromDateTime,
      toDateTime: event.toDateTime,
      location: event.location,
    },
    summary: {
      totalRegistrations,
      matchedUsers,
      pendingRegistrations,
      matchRate: totalRegistrations > 0 
        ? Math.round((matchedUsers / totalRegistrations) * 100) 
        : 0,
    },
    demographics: {
      ageGroups,
      genderDist,
    },
    squads: squadStats,
    timeline: registrationsByDay,
  };
}

export async function updateOrganizerEventStatus(
  organizerId: string, 
  eventId: string, 
  status: 'active' | 'paused' | 'cancelled'
) {
  return prisma.organizerEvent.updateMany({
    where: {
      organizerId,
      eventId,
    },
    data: {
      status,
    },
  });
}