/**
 * Telegram bot message strings in English and Ukrainian.
 * Used for welcome, leave, and other event-group messages based on event.messageLanguage.
 */

export type TelegramMessageLanguage = 'en' | 'uk';

const MESSAGES = {
  en: {
    welcome: {
      headline: (firstName: string) => `${firstName}, you're in.`,
      groupForming: {
        title: 'Group is forming',
        body: 'Waiting for more members to join.\nYou\'ll be notified when things start.',
      },
      groupActive: {
        title: 'Group is active',
        body: 'Say hi, introduce yourself, or start a conversation.',
      },
      needInfo: 'Need info?',
      mentionBot: (botUsername: string) => `Mention @${botUsername} to get event details or help.`,
      ticketReminder: 'Heads up: You need a ticket to get past the bouncer.',
      buyTicket: 'Buy Ticket',
    },
    leave: {
      headline: 'Someone left the squad.',
      body: "Don't worry - we're on it! We'll find someone awesome to fill the spot.",
      footer: 'The squad stays strong.',
    },
    bot: {
      helpPrompt: "Hi! I'm here to help. What would you like to know?",
      errorProcessing: 'Sorry, I encountered an error processing your message. Please try again later.',
      errorGeneric: 'Sorry, I encountered an error. Please try again later.',
    },
  },
  uk: {
    welcome: {
      headline: (firstName: string) => `${firstName}, ти в складі.`,
      groupForming: {
        title: 'Група формується',
        body: 'Чекаємо, поки приєднаються інші.\nМи повідомимо, коли все почнеться.',
      },
      groupActive: {
        title: 'Група активна',
        body: 'Привітайся, представся або почни розмову.',
      },
      needInfo: 'Потрібна інформація?',
      mentionBot: (botUsername: string) => `Згадай @${botUsername}, щоб дізнатися деталі про івент або отримати допомогу.`,
      ticketReminder: 'Важливо: для входу потрібен квиток.',
      buyTicket: 'Купити квиток',
    },
    leave: {
      headline: 'Хтось вийшов із скваду.',
      body: 'Не хвилюйся — ми впораємось! Знайдемо когось крутого на це місце.',
      footer: 'Сквад залишається сильним.',
    },
    bot: {
      helpPrompt: 'Привіт! Я тут, щоб допомогти. Що хочеш дізнатися?',
      errorProcessing: 'Вибач, сталася помилка під час обробки повідомлення. Спробуй пізніше.',
      errorGeneric: 'Вибач, сталася помилка. Спробуй пізніше.',
    },
  },
} as const;

function getLang(lang: string | null | undefined): TelegramMessageLanguage {
  return lang === 'uk' ? 'uk' : 'en';
}

export function getWelcomeMessage(
  lang: string | null | undefined,
  firstName: string,
  memberCount: number,
  botUsername: string,
  ticketUrl?: string | null
): { message: string; buyTicketLabel: string } {
  const L = MESSAGES[getLang(lang)].welcome;
  // firstName should be already escaped for Markdown by caller
  let message = `⚡️ **${L.headline(firstName)}**\n\n`;

  if (memberCount <= 3) {
    message += `⏳ **${L.groupForming.title}**\n${L.groupForming.body}`;
  } else {
    message += `🎉 **${L.groupActive.title}**\n${L.groupActive.body}`;
  }

  message += `\n\n💡 **${L.needInfo}**\n${L.mentionBot(botUsername)}`;
  if (ticketUrl) {
    message += `\n\n*${L.ticketReminder}*`;
  }

  return { message, buyTicketLabel: L.buyTicket };
}

export function getLeaveMessage(lang: string | null | undefined): string {
  const L = MESSAGES[getLang(lang)].leave;
  return `👋 **${L.headline}**\n\n${L.body} 🔍\n\n*${L.footer}* 💪`;
}

export function getBotHelpPrompt(lang: string | null | undefined): string {
  return MESSAGES[getLang(lang)].bot.helpPrompt;
}

export function getBotErrorProcessing(lang: string | null | undefined): string {
  return MESSAGES[getLang(lang)].bot.errorProcessing;
}

export function getBotErrorGeneric(lang: string | null | undefined): string {
  return MESSAGES[getLang(lang)].bot.errorGeneric;
}
