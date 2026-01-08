import { prisma } from '@/lib/db/client';
import { EventRegistrationRequestDto, EventRegistrationResponseDto } from '@/lib/types/registration';
import { EventNotFoundException, DuplicateTelegramError } from '@/lib/utils/errors';

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

  // Check for duplicate telegram
  const existing = await prisma.eventRegistration.findUnique({
    where: { telegram: data.telegram },
  });
  if (existing) {
    throw new DuplicateTelegramError(data.telegram);
  }

  // Create registration with languages
  const registration = await prisma.eventRegistration.create({
    data: {
      eventId,
      name: data.name,
      email: data.email,
      telegram: data.telegram,
      age: data.age,
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

  return {
    id: registration.id,
    eventId: registration.eventId,
    name: registration.name,
    email: registration.email,
    telegram: registration.telegram,
    age: registration.age,
    languagesISpeak: registration.languages.map(l => l.languageCode),
    createdAt: registration.createdAt.toISOString(),
  };
}
