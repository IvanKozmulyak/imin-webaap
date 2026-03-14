/**
 * Telegram bot message strings in English and Ukrainian.
 * Used for welcome, leave, and other event-group messages based on event.messageLanguage.
 */

export type TelegramMessageLanguage = 'en' | 'uk';

const MESSAGES = {
  en: {
    welcome: {
      headline: (firstName: string) => `${firstName}, you're in! 🎉`,
      groupForming: {
        title: '👥 Group is forming...',
        body: "Hang tight — we're waiting for a few more people to join.\nWe'll ping you when things kick off! 🔔",
      },
      groupActive: {
        title: '🔥 Group is live!',
        body: "Everyone's here! Say hi, drop an intro, or just jump into the convo. 👋",
      },
      needInfo: 'Got questions? 🤔',
      mentionBot: (botUsername: string) => `Just mention @${botUsername} — it's got all the event details and can help you out! 🤖`,
      ticketReminder: '🎟️ Heads up: you will need a ticket to get past the bouncer!',
      buyTicket: 'Grab a Ticket 🎫',
    },
    leave: {
      headline: 'Someone just left the squad. 👋',
      body: "No worries — we've got this! We'll find someone amazing to fill the spot. 💪",
      footer: "The squad stays strong. Always. 🔥",
    },
    bot: {
      helpPrompt: "Hey! 👋 I'm here to help — what's on your mind?",
      errorProcessing: "Oops, something went wrong while handling your message. 😅 Give it another shot in a bit!",
      errorGeneric: "Hmm, something didn't go as planned. 😬 Try again in a moment!",
    },
  },
  uk: {
    welcome: {
      headline: (firstName: string) => `${firstName}, ти в скваді! 🎉`,
      groupForming: {
        title: '👥 Група збирається...',
        body: 'Зачекай трохи — чекаємо ще кількох учасників.\nПовідомимо, як тільки все почнеться! 🔔',
      },
      groupActive: {
        title: '🔥 Група активна!',
        body: 'Усі тут! Привітайся, розкажи про себе або просто стрибай у розмову. 👋',
      },
      needInfo: 'Є запитання? 🤔',
      mentionBot: (botUsername: string) => `Просто згадай @${botUsername} — він розкаже все про івент і залюбки допоможе! 🤖`,
      ticketReminder: '🎟️ Важливо: на вході потрібен квиток, не забудь!',
      buyTicket: 'Купити квиточок 🎫',
    },
    leave: {
      headline: 'Хтось щойно вийшов зі скваду. 👋',
      body: 'Не переживай — розберемось! Знайдемо когось крутого на це місце. 💪',
      footer: 'Сквад залишається сильним. Завжди. 🔥',
    },
    bot: {
      helpPrompt: 'Привіт! 👋 Я тут, щоб допомогти — що тебе цікавить?',
      errorProcessing: 'Ой, щось пішло не так під час обробки. 😅 Спробуй ще раз трохи згодом!',
      errorGeneric: 'Хм, щось не спрацювало як треба. 😬 Спробуй ще раз за мить!',
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
