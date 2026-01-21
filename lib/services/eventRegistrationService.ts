import { prisma } from '@/lib/db/client';
import { EventRegistrationRequestDto, EventRegistrationResponseDto } from '@/lib/types/registration';
import { EventNotFoundException } from '@/lib/utils/errors';
import { createTelegramGroupInvite } from './telegramService';

export async function createEventRegistration(
  eventId: string,
  data: EventRegistrationRequestDto
): Promise<EventRegistrationResponseDto> {
  // Verify event exists
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });
  if (!event) {
    throw new EventNotFoundException(eventId);
  }

  // Find or create a Telegram group
  let telegramGroup = await prisma.telegramGroup.findFirst({
    where: {
      eventId,
      isFull: false,
      memberCount: {
        lt: 5, // Less than 5 members
      },
    },
    orderBy: {
      createdAt: 'asc', // Use oldest available group first
    },
  });

  let inviteLink: string | null = null;

  // If no available group, create a new one
  if (!telegramGroup) {
      console.error('Error getting invite link');
  } else {
    inviteLink = telegramGroup.inviteLink;
  }

  // Create registration with languages and Telegram group assignment
  const registration = await prisma.$transaction(async (tx) => {
    const newRegistration = await tx.eventRegistration.create({
      data: {
        eventId,
        name: data.name,
        email: data.email,
        age: data.age,
        sex: data.sex,
        telegramGroupId: telegramGroup?.id,
        languages: {
          create: data.languagesISpeak.map(langCode => ({
            languageCode: langCode,
          })),
        },
      },
      include: {
        languages: true,
      },
    });


    return newRegistration;
  });

  return {
    id: registration.id,
    eventId: registration.eventId,
    name: registration.name,
    email: registration.email,
    age: registration.age,
    sex: registration.sex,
    languagesISpeak: registration.languages.map(l => l.languageCode),
    createdAt: registration.createdAt.toISOString(),
    telegramInviteLink: inviteLink,
  };
}
