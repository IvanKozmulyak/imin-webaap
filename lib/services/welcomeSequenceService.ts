/**
 * Welcome Sequence Service
 * Manages a multi-step welcome flow for new squad members
 */

import { prisma } from '@/lib/db/client';
import { sendTelegramMessage } from './telegramBotService';

export type WelcomeStep = 'instant' | 'intro' | 'icebreaker' | 'event-info' | 'day-before';

interface WelcomeSequenceConfig {
  eventLanguage: string | null | undefined;
  botUsername: string;
  firstName: string;
  chatId: string;
  eventName: string;
  eventDateTime: string | Date;
  ticketUrl?: string | null;
}

const WELCOME_SEQUENCES = {
  en: {
    instant: (firstName: string, botUsername: string) => ({
      title: '🎉 Welcome to the Squad!',
      body: `Hey ${firstName}! You've been matched with an awesome group of people for this event.\n\nThis is your private space to get to know each other before the big day. Let's make this epic! 🚀`,
      tips: `\n📌 **Quick tips:**\n• Share a fun fact about yourself\n• Ask what others are excited for\n• Check the pinned details via @${botUsername}`,
    }),
    intro: (firstName: string) => ({
      title: '👋 Your Crew is Here',
      body: `${firstName}, everyone else in the squad is already introducing themselves! 👇\n\nWhy not say hello? Tell them:`,
      prompts: `• Your name & what you do\n• One thing you're excited about this event\n• A fun fact or hobby`,
    }),
    icebreaker: () => ({
      title: '🎯 Let\'s Break the Ice',
      body: 'Here\'s a fun question to get the conversation rolling:',
      question: '❄️ "If you could bring one person (living or dead, real or fictional) to this event, who would it be and why?"',
      followup: '\nShare your answer in the group! 🎤',
    }),
    eventInfo: (eventName: string, botUsername: string) => ({
      title: '📍 Event Logistics',
      body: `Here's everything you need to know about **${eventName}**:`,
      mention: `\n💡 Want all the details? Just mention @${botUsername} here and I'll share everything!`,
    }),
    dayBefore: (eventName: string) => ({
      title: '🔥 Tomorrow\'s the Day!',
      body: `${eventName} is **TOMORROW** and we're pumped! 🎉`,
      reminder: '\n✅ Final checklist:\n• ✔️ Grab your ticket\n• ✔️ Plan your arrival time\n• ✔️ See you there!\n\nP.S. If you need to reach the squad last-minute, they\'re all here in this chat! 💪',
    }),
  },
  uk: {
    instant: (firstName: string, botUsername: string) => ({
      title: '🎉 Ласкаво просимо до скваду!',
      body: `Привіт ${firstName}! Тебе підібрали до крутої групи людей для цього івенту.\n\nЦе твій приватний простір, щоб познайомитися до самого дня. Зробимо це епічним! 🚀`,
      tips: `\n📌 **Швидкі поради:**\n• Розкажи цікавий факт про себе\n• Запитай, чим інші хвилюються\n• Перевір закріплені деталі через @${botUsername}`,
    }),
    intro: (firstName: string) => ({
      title: '👋 Твоя команда тут',
      body: `${firstName}, решта скваду вже представляються! 👇\n\nЧому б не привітатися? Розкажи їм:`,
      prompts: `• Як тебе звати та чим ти займаєшся\n• Що тебе найбільше цікавить на цьому івенту\n• Цікавий факт або хобі`,
    }),
    icebreaker: () => ({
      title: '🎯 Розламаємо лід',
      body: 'Ось цікаве питання, щоб розпочати розмову:',
      question: '❄️ "Якби ти міг(ла) запросити одну людину (живу, видатну чи вигадану) на цей івент, кого б це була і чому?"',
      followup: '\nПоділися своєю відповіддю! 🎤',
    }),
    eventInfo: (eventName: string, botUsername: string) => ({
      title: '📍 Логістика івенту',
      body: `Ось усе, що потрібно знати про **${eventName}**:`,
      mention: `\n💡 Хочеш усі деталі? Просто згадай @${botUsername} тут, і я усе розповім!`,
    }),
    dayBefore: (eventName: string) => ({
      title: '🔥 Завтра – великий день!',
      body: `**${eventName}** відбувається **ЗАВТРА** і ми в очікуванні! 🎉`,
      reminder: '\n✅ Остаточний чек-лист:\n• ✔️ Купи квиток\n• ✔️ Спланюй час приходу\n• ✔️ Побачимося там!\n\nP.S. Якщо потрібно спілкуватися зі скквадом в останню хвилину, вони всі тут у чаті! 💪',
    }),
  },
} as const;

function getLang(lang: string | null | undefined): 'en' | 'uk' {
  return lang === 'uk' ? 'uk' : 'en';
}

function buildMessage(lang: string | null | undefined, step: WelcomeStep, config: WelcomeSequenceConfig): string {
  const L = WELCOME_SEQUENCES[getLang(lang)];
  const stepConfig = L[step];

  let message = '';

  if (step === 'instant') {
    const seq = stepConfig(config.firstName, config.botUsername);
    message = `${seq.body}${seq.tips}`;
  } else if (step === 'intro') {
    const seq = stepConfig(config.firstName);
    message = `${seq.body}\n${seq.prompts}`;
  } else if (step === 'icebreaker') {
    const seq = stepConfig();
    message = `${seq.body}\n${seq.question}${seq.followup}`;
  } else if (step === 'event-info') {
    const seq = stepConfig(config.eventName, config.botUsername);
    message = `${seq.body}${seq.mention}`;
  } else if (step === 'day-before') {
    const seq = stepConfig(config.eventName);
    message = `${seq.body}${seq.reminder}`;
  }

  return message;
}

/**
 * Sends the instant welcome message when member joins
 */
export async function sendInstantWelcome(config: WelcomeSequenceConfig): Promise<void> {
  try {
    const message = buildMessage(config.eventLanguage, 'instant', config);
    await sendTelegramMessage(config.chatId, message, 'Markdown');
    console.log(`[Welcome Sequence] Instant welcome sent to ${config.firstName} in chat ${config.chatId}`);
  } catch (error) {
    console.error('[Welcome Sequence] Error sending instant welcome:', error);
    throw error;
  }
}

/**
 * Sends intro prompt message (30 seconds after join)
 */
export async function sendIntroPrompt(config: WelcomeSequenceConfig): Promise<void> {
  try {
    const message = buildMessage(config.eventLanguage, 'intro', config);
    await sendTelegramMessage(config.chatId, message, 'Markdown');
    console.log(`[Welcome Sequence] Intro prompt sent to chat ${config.chatId}`);
  } catch (error) {
    console.error('[Welcome Sequence] Error sending intro prompt:', error);
  }
}

/**
 * Sends icebreaker question (2 minutes after join)
 */
export async function sendIcebreakerQuestion(config: WelcomeSequenceConfig): Promise<void> {
  try {
    const message = buildMessage(config.eventLanguage, 'icebreaker', config);
    await sendTelegramMessage(config.chatId, message, 'Markdown');
    console.log(`[Welcome Sequence] Icebreaker question sent to chat ${config.chatId}`);
  } catch (error) {
    console.error('[Welcome Sequence] Error sending icebreaker:', error);
  }
}

/**
 * Sends event information message (5 minutes after join)
 */
export async function sendEventInfoMessage(config: WelcomeSequenceConfig): Promise<void> {
  try {
    const message = buildMessage(config.eventLanguage, 'event-info', config);
    await sendTelegramMessage(config.chatId, message, 'Markdown');
    console.log(`[Welcome Sequence] Event info sent to chat ${config.chatId}`);
  } catch (error) {
    console.error('[Welcome Sequence] Error sending event info:', error);
  }
}

/**
 * Schedules the welcome sequence (in production, this would use a job queue)
 * For now, we'll send instant messages and store timing info for scheduled messages
 */
export async function startWelcomeSequence(config: WelcomeSequenceConfig): Promise<void> {
  try {
    // Send instant welcome immediately
    await sendInstantWelcome(config);

    // Schedule intro prompt after 30 seconds
    setTimeout(() => {
      sendIntroPrompt(config).catch((err) => {
        console.error('Failed to send intro prompt:', err);
      });
    }, 30000);

    // Schedule icebreaker after 2 minutes
    setTimeout(() => {
      sendIcebreakerQuestion(config).catch((err) => {
        console.error('Failed to send icebreaker:', err);
      });
    }, 120000);

    // Schedule event info after 5 minutes
    setTimeout(() => {
      sendEventInfoMessage(config).catch((err) => {
        console.error('Failed to send event info:', err);
      });
    }, 300000);

    console.log('[Welcome Sequence] Sequence started for chat:', config.chatId);
  } catch (error) {
    console.error('[Welcome Sequence] Error starting welcome sequence:', error);
    throw error;
  }
}
