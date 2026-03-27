/**
 * Meetup Logistics Service
 * Day-of coordination messages to help squad members find each other
 * (entrance locations, emoji codes, meeting points)
 */

import { prisma } from '@/lib/db/client';
import { sendTelegramMessage } from './telegramBotService';

export interface MeetupLogisticsConfig {
  chatId: string;
  eventLanguage: string | null;
  eventName: string;
  eventDateTime: Date | string;
  eventLocation?: string | null;
  eventEntrance?: string | null;
  eventEmojiCode?: string | null;
  organizerName?: string | null;
  botUsername: string;
}

// Message templates for day-of coordination
const MEETUP_LOGISTICS_MESSAGES = {
  en: {
    dayOfReminder: {
      title: '🎉 Today is the day!',
      message: "Your squad is ready and waiting! Here's everything you need to find your group:",
    },
    meetingPoint: {
      title: '📍 Where to meet',
      noLocation: "The meeting point will be shared soon! Stay tuned. 👀",
    },
    entrance: {
      title: '🚪 Entrance',
      noEntrance: "Check with the venue staff for entrance directions.",
    },
    emojiCode: {
      title: '🎭 Your Squad Emoji Code',
      emojiIntro: "Look for squad members wearing or holding something with:",
      noEmoji: "No specific emoji code - just look for friendly faces! 👋",
    },
    organizerContact: {
      title: '👤 Your Organizer',
      noOrganizer: "A squad organizer will reach out shortly!",
    },
    finalCall: {
      title: '⏰ Final Call - 1 hour to go!',
      message: "The event starts in 1 hour! If you haven't found your squad yet, head to the meeting point now!",
    },
    arrivedMessage: {
      title: '✅ I made it!',
      message: "Great! Let your squad know you've arrived. Look for people who look as excited as you are! 😄",
    },
    needHelp: {
      title: '🆘 Need Help?',
      message: "Can't find your squad? Message /help and we'll connect you!",
    },
    closing: {
      intro: "Have an amazing time! 🎊",
      hashtag: "See you there! #IMINsquad",
    },
  },
  uk: {
    dayOfReminder: {
      title: '🎉 Сьогодні великий день!',
      message: "Твій сквад чекає! Ось все, що тобі потрібно, щоб знайти свою групу:",
    },
    meetingPoint: {
      title: '📍 Місце зустрічі',
      noLocation: "Місце зустрічі буде повідомлено найближчим часом! Слідкуй за оновленнями. 👀",
    },
    entrance: {
      title: '🚪 Вхід',
      noEntrance: "Звернись до персоналу venues за напрямком до входу.",
    },
    emojiCode: {
      title: '🎭 Твій Emoji-код скваду',
      emojiIntro: "Шукай учасників скваду з:",
      noEmoji: "Конкретний код - просто шукай дружні обличчя! 👋",
    },
    organizerContact: {
      title: '👤 Твій організатор',
      noOrganizer: "Організатор скваду зв'яжеться з тобою найближчим часом!",
    },
    finalCall: {
      title: '⏰ Фінальний дзвінок - залишилась 1 година!',
      message: "Івент починається через 1 годину! Якщо ти ще не знайшов свій сквад, йди до місця зустрічі зараз!",
    },
    arrivedMessage: {
      title: '✅ Я на місці!',
      message: "Чудово! Повідом своєму скваду, що ти прийшов. Шукай людей, які виглядають так само схвильовано, як ти! 😄",
    },
    needHelp: {
      title: '🆘 Потрібна допомога?',
      message: "Не можеш знайти свій сквад? Напиши /help і ми тобі допоможемо!",
    },
    closing: {
      intro: "Чудово проведи час! 🎊",
      hashtag: "Бачимося там! #IMINsquad",
    },
  },
} as const;

function getLang(lang: string | null | undefined): 'en' | 'uk' {
  return lang === 'uk' ? 'uk' : 'en';
}

/**
 * Build the day-of meetup logistics message
 */
export function buildMeetupLogisticsMessage(config: MeetupLogisticsConfig): string {
  const L = getLang(config.eventLanguage);
  const messages = MEETUP_LOGISTICS_MESSAGES[L];

  let output = `${messages.dayOfReminder.title}\n\n${messages.dayOfReminder.message}\n\n`;

  // Meeting point
  output += `${messages.meetingPoint.title}\n`;
  output += config.eventLocation 
    ? `📍 ${config.eventLocation}\n\n`
    : `${messages.meetingPoint.noLocation}\n\n`;

  // Entrance instructions
  if (config.eventEntrance) {
    output += `${messages.entrance.title}\n`;
    output += `🚪 ${config.eventEntrance}\n\n`;
  }

  // Emoji code for easy recognition
  output += `${messages.emojiCode.title}\n`;
  if (config.eventEmojiCode) {
    output += `${messages.emojiCode.emojiIntro}\n`;
    output += `${config.eventEmojiCode}\n\n`;
  } else {
    output += `${messages.emojiCode.noEmoji}\n\n`;
  }

  // Organizer contact (optional)
  if (config.organizerName) {
    output += `${messages.organizerContact.title}\n`;
    output += `${config.organizerName}\n\n`;
  }

  // Closing
  output += `—\n${messages.closing.intro}\n${messages.closing.hashtag}`;

  return output;
}

/**
 * Build the 1-hour final call message
 */
export function buildFinalCallMessage(config: MeetupLogisticsConfig): string {
  const L = getLang(config.eventLanguage);
  const messages = MEETUP_LOGISTICS_MESSAGES[L];

  let output = `${messages.finalCall.title}\n\n${messages.finalCall.message}\n\n`;

  if (config.eventLocation) {
    output += `${messages.meetingPoint.title}: 📍 ${config.eventLocation}\n`;
  }

  if (config.eventEmojiCode) {
    output += `${messages.emojiCode.title}: ${config.eventEmojiCode}\n`;
  }

  output += `\n${messages.needHelp.title}\n${messages.needHelp.message}`;

  return output;
}

/**
 * Get all squads for an event that need logistics coordination
 */
export async function getSquadsNeedingLogistics(eventId: string): Promise<
  Array<{
    matchingGroupId: string;
    chatId: string;
    eventLanguage: string | null;
    eventName: string;
    eventDateTime: Date;
    eventLocation: string | null;
    eventEntrance: string | null;
    eventEmojiCode: string | null;
    memberCount: number;
  }>
> {
  const matchingGroups = await prisma.matchingGroup.findMany({
    where: { eventId },
    include: {
      members: {
        include: {
          eventRegistration: {
            include: {
              event: true,
              telegramGroup: true,
            },
          },
        },
      },
    },
  });

  const squads = matchingGroups
    .map((group) => {
      const firstMember = group.members[0];
      const telegramGroup = firstMember?.eventRegistration?.telegramGroup;
      const event = firstMember?.eventRegistration?.event;

      if (!telegramGroup?.telegramChatId || !event) {
        return null;
      }

      return {
        matchingGroupId: group.id,
        chatId: telegramGroup.telegramChatId,
        eventLanguage: event.messageLanguage,
        eventName: event.name,
        eventDateTime: event.fromDateTime,
        eventLocation: event.location || null,
        eventEntrance: (event as any).entrance || null,
        eventEmojiCode: (event as any).emojiCode || null,
        memberCount: group.members.length,
      };
    })
    .filter((squad): squad is NonNullable<typeof squad> => squad !== null);

  return squads;
}

/**
 * Send day-of logistics message to a squad
 */
export async function sendMeetupLogistics(config: MeetupLogisticsConfig): Promise<void> {
  const message = buildMeetupLogisticsMessage(config);
  await sendTelegramMessage(config.chatId, message, 'Markdown');
  console.log(`[Meetup Logistics] Day-of message sent to chat ${config.chatId}`);
}

/**
 * Send 1-hour final call to a squad
 */
export async function sendFinalCall(config: MeetupLogisticsConfig): Promise<void> {
  const message = buildFinalCallMessage(config);
  await sendTelegramMessage(config.chatId, message, 'Markdown');
  console.log(`[Meetup Logistics] Final call sent to chat ${config.chatId}`);
}

/**
 * Send "I made it" confirmation to squad
 */
export async function sendArrivalConfirmation(config: MeetupLogisticsConfig): Promise<void> {
  const L = getLang(config.eventLanguage);
  const messages = MEETUP_LOGISTICS_MESSAGES[L];
  
  const message = `${messages.arrivedMessage.title}\n\n${messages.arrivedMessage.message}`;
  await sendTelegramMessage(config.chatId, message, 'Markdown');
  console.log(`[Meetup Logistics] Arrival confirmation template sent to chat ${config.chatId}`);
}

/**
 * Trigger logistics sequence for a specific squad
 * Call this when the event is today
 * 
 * Timing:
 * - Day-of reminder: 2 hours before event
 * - Final call: 1 hour before event
 */
export async function triggerLogisticsSequence(config: MeetupLogisticsConfig): Promise<void> {
  console.log(`[Meetup Logistics] Starting logistics sequence for chat ${config.chatId}`);

  // Send day-of reminder
  try {
    await sendMeetupLogistics(config);
  } catch (error) {
    console.error(`[Meetup Logistics] Failed to send day-of message:`, error);
  }

  // Send final call 1 hour before event (if event time is in the future)
  const eventTime = new Date(config.eventDateTime).getTime();
  const now = Date.now();
  const timeUntilEvent = eventTime - now;

  if (timeUntilEvent > 60 * 60 * 1000) { // More than 1 hour away
    setTimeout(async () => {
      try {
        await sendFinalCall(config);
      } catch (error) {
        console.error(`[Meetup Logistics] Failed to send final call:`, error);
      }
    }, timeUntilEvent - 60 * 60 * 1000); // 1 hour before

    console.log(`[Meetup Logistics] Final call scheduled for 1 hour before event`);
  }

  console.log(`[Meetup Logistics] Logistics sequence complete for chat ${config.chatId}`);
}

/**
 * Process logistics for all squads for an event
 */
export async function processLogisticsForEvent(eventId: string): Promise<{
  processed: number;
  failed: number;
}> {
  const squads = await getSquadsNeedingLogistics(eventId);
  
  let processed = 0;
  let failed = 0;

  const botUsername = process.env.TELEGRAM_BOT_USERNAME || 'imin_squad_bot';

  for (const squad of squads) {
    const config: MeetupLogisticsConfig = {
      chatId: squad.chatId,
      eventLanguage: squad.eventLanguage,
      eventName: squad.eventName,
      eventDateTime: squad.eventDateTime,
      eventLocation: squad.eventLocation,
      eventEntrance: squad.eventEntrance,
      eventEmojiCode: squad.eventEmojiCode,
      botUsername,
    };

    try {
      await triggerLogisticsSequence(config);
      processed++;
    } catch (error) {
      console.error(`[Meetup Logistics] Failed to trigger logistics for group ${squad.matchingGroupId}:`, error);
      failed++;
    }
  }

  return { processed, failed };
}

/**
 * API handler to manually trigger logistics for an event
 */
export async function handleLogisticsApiRequest(eventId: string): Promise<{
  success: boolean;
  processed?: number;
  failed?: number;
  error?: string;
}> {
  try {
    const result = await processLogisticsForEvent(eventId);
    return { success: true, ...result };
  } catch (error) {
    console.error('[Meetup Logistics API] Error:', error);
    return { success: false, error: String(error) };
  }
}

export default {
  sendMeetupLogistics,
  sendFinalCall,
  sendArrivalConfirmation,
  triggerLogisticsSequence,
  processLogisticsForEvent,
  getSquadsNeedingLogistics,
  buildMeetupLogisticsMessage,
  buildFinalCallMessage,
  handleLogisticsApiRequest,
};