/**
 * Countdown Drip Campaign Service
 * Sends automated messages at T-7, T-3, and T-1 days before events
 * to maintain user engagement and prevent churn.
 */

import { prisma } from '@/lib/db/client';
import { sendTelegramMessage } from './telegramBotService';

// Message types
export type CountdownType = 't-7' | 't-3' | 't-1';

// Countdown thresholds in days
const COUNTDOWN_THRESHOLDS: Record<CountdownType, number> = {
  't-7': 7,
  't-3': 3,
  't-1': 1,
};

// Bilingual messages
const MESSAGES = {
  en: {
    't-7': {
      title: "🎉 Event in 1 week!",
      body: "Your squad adventure is coming up! Time to get excited and prepare for an amazing experience.\n\n💡 Quick tips:\n• Check if you need a ticket\n• Save the event date\n• Start thinking of icebreakers to share with your squad!",
    },
    't-3': {
      title: "📅 3 days to go!",
      body: "The countdown is on! Just 3 days until you meet your squad.\n\n🗺️ Logistics reminder:\n• Note the venue location\n• Plan your route\n• Bring your best vibe!",
    },
    't-1': {
      title: "🚀 Tomorrow's the day!",
      body: "Tomorrow you meet your squad! 🎉\n\n📍 Meeting point info:\n• Look for the IMIN welcome sign\n• Look for people with [EVENT EMOJI]\n• Don't be nervous - everyone's here to make friends!\n\nSee you there!",
    },
  },
  uk: {
    't-7': {
      title: "🎉 Подія через тиждень!",
      body: "Твоя пригода з командою вже близько! Час схвилюватися та підготуватися до неймовірного досвіду.\n\n💡 Поради:\n• Перевір, чи потрібен тобі квиток\n• Запам'ятай дату\n• Почни думати про те, чим поділишся зі своєю командою!",
    },
    't-3': {
      title: "📅 Залишилось 3 дні!",
      body: "Відлік триває! Всього 3 дні до зустрічі з командою.\n\n🗺️ Нагадування:\n• Запиши локацію\n• Сплануй маршрут\n• Візьми з собою найкращий настрій!",
    },
    't-1': {
      title: "🚀 Завтра великий день!",
      body: "Завтра ти зустрінеш свою команду! 🎉\n\n📍 Інформація про місце зустрічі:\n• Шукай табличку IMIN\n• Шукай людей з [EMOJІ ПОДІЇ]\n• Не хвилюйся - всі тут, щоб знайти друзів!\n\nДо зустрічі!",
    },
  },
};

/**
 * Calculate days until an event
 */
function daysUntilEvent(eventDate: Date): number {
  const now = new Date();
  const event = new Date(eventDate);
  const diffTime = event.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Get the countdown message in the appropriate language
 */
function getCountdownMessage(
  countdownType: CountdownType,
  language: string,
  eventName?: string
): { title: string; body: string } {
  const lang = language === 'uk' ? 'uk' : 'en';
  const msg = MESSAGES[lang][countdownType];
  
  // Customize with event name if provided
  let body = msg.body;
  if (eventName) {
    body = body.replace('[EVENT EMOJI]', '🎶').replace('[EMOJІ ПОДІЇ]', '🎶');
  }
  
  return {
    title: msg.title,
    body,
  };
}

/**
 * Process all registrations and send appropriate countdown messages
 * This should be called periodically (e.g., daily via cron)
 */
export async function processCountdownMessages(): Promise<{
  processed: number;
  sent: number;
  errors: number;
}> {
  const stats = { processed: 0, sent: 0, errors: 0 };
  
  try {
    // Get all active events
    const events = await prisma.event.findMany({
      where: { isActive: true },
      include: {
        registrations: {
          include: {
            telegramGroup: true,
            countdownMessages: true,
          },
        },
      },
    });

    for (const event of events) {
      const eventDate = new Date(event.fromDateTime);
      const daysUntil = daysUntilEvent(eventDate);
      
      for (const registration of event.registrations) {
        stats.processed++;
        
        // Determine which countdown messages to send based on days until event
        const countdownTypes: CountdownType[] = [];
        
        if (daysUntil === 7) {
          countdownTypes.push('t-7');
        } else if (daysUntil === 3) {
          countdownTypes.push('t-3');
        } else if (daysUntil === 1) {
          countdownTypes.push('t-1');
        }
        
        for (const countdownType of countdownTypes) {
          // Check if this message was already sent
          const alreadySent = registration.countdownMessages.some(
            (m) => m.messageType === countdownType
          );
          
          if (alreadySent) {
            continue;
          }
          
          // Get the Telegram group chat ID
          const chatId = registration.telegramGroup?.telegramChatId;
          if (!chatId) {
            console.log(`No Telegram group for registration ${registration.id}`);
            continue;
          }
          
          try {
            // Send the countdown message
            const { title, body } = getCountdownMessage(
              countdownType,
              event.messageLanguage,
              event.name
            );
            
            const fullMessage = `${title}\n\n${body}`;
            
            await sendTelegramMessage(chatId, fullMessage, 'Markdown');
            
            // Record that the message was sent
            await prisma.countdownMessage.create({
              data: {
                eventRegistrationId: registration.id,
                messageType: countdownType,
              },
            });
            
            stats.sent++;
            console.log(
              `Sent ${countdownType} message to registration ${registration.id} for event ${event.name}`
            );
          } catch (error) {
            stats.errors++;
            console.error(
              `Error sending ${countdownType} message to registration ${registration.id}:`,
              error
            );
          }
        }
      }
    }
  } catch (error) {
    console.error('Error processing countdown messages:', error);
    throw error;
  }
  
  return stats;
}

/**
 * Manual trigger for sending countdown messages
 * Can be called via API endpoint
 */
export async function triggerCountdownDrip(): Promise<{
  success: boolean;
  stats: { processed: number; sent: number; errors: number };
}> {
  const stats = await processCountdownMessages();
  
  return {
    success: true,
    stats,
  };
}