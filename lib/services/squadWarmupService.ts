/**
 * Squad Warmup Service
 * Sends icebreaker messages to newly matched squads to build chemistry before the event
 */

import { prisma } from '@/lib/db/client';
import { sendTelegramMessage } from './telegramBotService';

export interface SquadWarmupConfig {
  chatId: string;
  eventLanguage: string | null;
  eventName: string;
  eventDateTime: Date | string;
  botUsername: string;
}

export type WarmupStep = 'icebreaker1' | 'icebreaker2' | 'icebreaker3';

// Icebreaker questions for squad warmup (progressive intimacy)
const SQUAD_WARMUP_QUESTIONS = {
  en: {
    icebreaker1: {
      title: '🎯 Squad Icebreaker #1',
      question: "Let's get to know each other! First up:\n\n🧡 **What are you most looking forward to at this event?**\n\nShare your answer below! 👇",
      followup: "No wrong answers – we're all here to have a good time! 🎉",
    },
    icebreaker2: {
      title: '🎯 Squad Icebreaker #2',
      question: "Now that we know what you're excited for, let's go deeper:\n\n💬 **What's one thing you'd love to learn or try, but haven't had the chance yet?**\n\nMaybe someone in the squad can help! 🌟",
      followup: "You never know who might share your interests!",
    },
    icebreaker3: {
      title: '🎯 Squad Icebreaker #3 (Final!)',
      question: "Last one before the big day! 🎉\n\n🌙 **If you could create the perfect post-event hangout, what would it be?**\n\n(Drinks? Food? Night walk? Board games? Something else?)",
      followup: "Let's make it happen! 💪\n\nSee you at the event! 🙌",
    },
  },
  uk: {
    icebreaker1: {
      title: '🎯 Лід для скваду #1',
      question: "Давайте познайомимося! Перше питання:\n\n🧡 **Чого ти найбільше чекаєш на цьому івенті?**\n\nПоділися своєю відповіддю! 👇",
      followup: "Немає неправильних відповідей – ми всі тут, щоб чудово провести час! 🎉",
    },
    icebreaker2: {
      title: '🎯 Лід для скваду #2',
      question: "Тепер, коли ми знаємо, чим ти захоплюєшся, давай глибше:\n\n💬 **Що б ти хотів(ла) спробувати або дізнатися, але ще не мав(ла) нагоди?**\n\nМожливо, хтось у скваді тобі допоможе! 🌟",
      followup: "Хто знає, можливо, в тебе є спільні інтереси з кимось!",
    },
    icebreaker3: {
      title: '🎯 Лід для скваду #3 (Останній!)',
      question: "Останнє питання перед великим днем! 🎉\n\n🌙 **Якби ти міг(ла) створити ідеальну зустріч після івенту, якою б вона була?**\n\n(Напої? Їжа? Нічна прогулянка? Настільні ігри? Щось інше?)",
      followup: "Давайте зробимо це! 💪\n\nБачимося на івенті! 🙌",
    },
  },
} as const;

function getLang(lang: string | null | undefined): 'en' | 'uk' {
  return lang === 'uk' ? 'uk' : 'en';
}

function buildWarmupMessage(
  lang: string | null | undefined,
  step: WarmupStep,
  eventName: string
): string {
  const L = SQUAD_WARMUP_QUESTIONS[getLang(lang)];
  const stepData = L[step];
  
  return `${stepData.title}\n\n${stepData.question}\n\n${stepData.followup}`;
}

/**
 * Get all squads (matching groups) for an event that haven't received warmup yet
 */
export async function getSquadsNeedingWarmup(eventId: string): Promise<
  Array<{
    matchingGroupId: string;
    chatId: string;
    eventLanguage: string | null;
    eventName: string;
    eventDateTime: Date;
    memberCount: number;
  }>
> {
  // Get matching groups with their Telegram groups via event registrations
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
      // Get the first member's telegram group (all members in a squad share the same group)
      const firstMember = group.members[0];
      const telegramGroup = firstMember?.eventRegistration?.telegramGroup;
      
      if (!telegramGroup?.telegramChatId) {
        return null;
      }

      return {
        matchingGroupId: group.id,
        chatId: telegramGroup.telegramChatId,
        eventLanguage: firstMember.eventRegistration.event.messageLanguage,
        eventName: firstMember.eventRegistration.event.name,
        eventDateTime: firstMember.eventRegistration.event.fromDateTime,
        memberCount: group.members.length,
      };
    })
    .filter((squad): squad is NonNullable<typeof squad> => squad !== null);

  return squads;
}

/**
 * Send the first icebreaker to a squad
 */
export async function sendFirstIcebreaker(config: SquadWarmupConfig): Promise<void> {
  const message = buildWarmupMessage(config.eventLanguage, 'icebreaker1', config.eventName);
  await sendTelegramMessage(config.chatId, message, 'Markdown');
  console.log(`[Squad Warmup] Icebreaker #1 sent to chat ${config.chatId}`);
}

/**
 * Send the second icebreaker to a squad
 */
export async function sendSecondIcebreaker(config: SquadWarmupConfig): Promise<void> {
  const message = buildWarmupMessage(config.eventLanguage, 'icebreaker2', config.eventName);
  await sendTelegramMessage(config.chatId, message, 'Markdown');
  console.log(`[Squad Warmup] Icebreaker #2 sent to chat ${config.chatId}`);
}

/**
 * Send the final icebreaker to a squad
 */
export async function sendThirdIcebreaker(config: SquadWarmupConfig): Promise<void> {
  const message = buildWarmupMessage(config.eventLanguage, 'icebreaker3', config.eventName);
  await sendTelegramMessage(config.chatId, message, 'Markdown');
  console.log(`[Squad Warmup] Icebreaker #3 sent to chat ${config.chatId}`);
}

/**
 * Trigger warmup sequence for a specific squad
 * This is called when a squad is newly formed after matching
 * 
 * Timing:
 * - Icebreaker 1: Immediate (when squad is matched)
 * - Icebreaker 2: 4 hours after matching
 * - Icebreaker 3: 1 day before event
 */
export async function triggerSquadWarmup(config: SquadWarmupConfig): Promise<void> {
  console.log(`[Squad Warmup] Starting warmup sequence for chat ${config.chatId}`);

  // Send first icebreaker immediately
  try {
    await sendFirstIcebreaker(config);
  } catch (error) {
    console.error(`[Squad Warmup] Failed to send icebreaker #1:`, error);
  }

  // Schedule second icebreaker for 4 hours later
  setTimeout(async () => {
    try {
      await sendSecondIcebreaker(config);
    } catch (error) {
      console.error(`[Squad Warmup] Failed to send icebreaker #2:`, error);
    }
  }, 4 * 60 * 60 * 1000); // 4 hours

  // Third icebreaker is handled by the countdown drip service (1 day before event)
  // This prevents duplicate messages - the countdown service should include this

  console.log(`[Squad Warmup] Warmup sequence scheduled for chat ${config.chatId}`);
}

/**
 * Process warmup for all squads that need it (called by cron job or matching webhook)
 */
export async function processWarmupForEvent(eventId: string): Promise<{
  processed: number;
  failed: number;
}> {
  const squads = await getSquadsNeedingWarmup(eventId);
  
  let processed = 0;
  let failed = 0;

  const botUsername = process.env.TELEGRAM_BOT_USERNAME || 'imin_squad_bot';

  for (const squad of squads) {
    const config: SquadWarmupConfig = {
      chatId: squad.chatId,
      eventLanguage: squad.eventLanguage,
      eventName: squad.eventName,
      eventDateTime: squad.eventDateTime,
      botUsername,
    };

    try {
      await triggerSquadWarmup(config);
      processed++;
    } catch (error) {
      console.error(`[Squad Warmup] Failed to trigger warmup for group ${squad.matchingGroupId}:`, error);
      failed++;
    }
  }

  return { processed, failed };
}

export default {
  sendFirstIcebreaker,
  sendSecondIcebreaker,
  sendThirdIcebreaker,
  triggerSquadWarmup,
  processWarmupForEvent,
  getSquadsNeedingWarmup,
};