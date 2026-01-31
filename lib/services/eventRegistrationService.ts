import { prisma } from '@/lib/db/client';
import { EventRegistrationRequestDto, EventRegistrationResponseDto } from '@/lib/types/registration';
import { EventNotFoundException } from '@/lib/utils/errors';
import { createTelegramGroupInvite } from './telegramService';

// Type for telegram group (compatible with both raw query and Prisma result)
interface TelegramGroupResult {
  id: string;
  eventId: string;
  telegramChatId: string | null;
  inviteLink: string | null;
  memberCount: number;
  maxMembers: number;
  isFull: boolean;
  groupType?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

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
  // For festival events with festivalJoinOption, find group by type
  let telegramGroup: TelegramGroupResult | null = null;
  if (event.useFestivalRegistration && data.festivalJoinOption) {
    // For festival events, find group matching the festivalJoinOption type
    // We need to use raw SQL to compare memberCount < maxMembers
    const groups = await prisma.$queryRaw<Array<{
      id: string;
      event_id: string;
      telegram_chat_id: string | null;
      invite_link: string | null;
      member_count: number;
      max_members: number;
      is_full: boolean;
      group_type: string | null;
      created_at: Date;
      updated_at: Date;
    }>>`
      SELECT * FROM telegram_group
      WHERE event_id = ${eventId}
        AND group_type = ${data.festivalJoinOption}
        AND is_full = false
        AND member_count < max_members
      ORDER BY created_at ASC
      LIMIT 1
    `;
    
    if (groups.length > 0) {
      const group = groups[0];
      telegramGroup = {
        id: group.id,
        eventId: group.event_id,
        telegramChatId: group.telegram_chat_id,
        inviteLink: group.invite_link,
        memberCount: group.member_count,
        maxMembers: group.max_members,
        isFull: group.is_full,
        groupType: group.group_type,
        createdAt: group.created_at,
        updatedAt: group.updated_at,
      };
    }
  } else {
    // For non-festival events, find any available group
    telegramGroup = await prisma.telegramGroup.findFirst({
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
  }

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
        country: data.country,
        city: data.city,
        telegramGroupId: telegramGroup?.id,
        festivalJoinOption: data.festivalJoinOption,
        travelMethod: data.travelMethod,
        hasCar: data.hasCar,
        carSeatsAvailable: data.carSeatsAvailable,
        accommodationPreference: data.accommodationPreference,
        danceStyle: data.danceStyle,
        danceLevel: data.danceLevel,
        hasTicket: data.hasTicket,
        languages: {
          create: (data.languagesISpeak ?? []).map((langCode: string) => ({
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

  const reg: any = registration;

  return {
    id: reg.id,
    eventId: reg.eventId,
    name: reg.name,
    email: reg.email,
    age: reg.age,
    sex: reg.sex,
    languagesISpeak: (reg.languages ?? []).map((l: any) => l.languageCode),
    createdAt: reg.createdAt.toISOString(),
    telegramInviteLink: inviteLink,
    country: reg.country ?? null,
    city: reg.city ?? null,
  };
}
