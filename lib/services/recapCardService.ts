/**
 * Recap Card Service
 * Generates shareable Instagram Story cards for post-event sharing
 */

// Type definitions for recap card data

type RecapCardData = {
  eventName: string;
  eventDate: string;
  venue?: string;
  squadName?: string;
  squadSize: number;
  userName: string;
  language?: 'en' | 'uk';
};

type GeneratedCard = {
  imageUrl: string;
  thumbnailUrl: string;
};

/**
 * Generate recap card data for API response
 */
export function generateRecapCardPayload(data: RecapCardData): {
  title: string;
  subtitle: string;
  eventInfo: string;
  squadInfo: string;
  cta: string;
  branding: string;
} {
  const isUkrainian = data.language === 'uk';
  
  return {
    title: isUkrainian ? '🎉 Я був там!' : '🎉 I Was There!',
    subtitle: data.eventName,
    eventInfo: data.eventDate + (data.venue ? ` • ${data.venue}` : ''),
    squadInfo: data.squadName 
      ? (isUkrainian ? `Моя команда: ${data.squadName}` : `My Squad: ${data.squadName}`)
      : (isUkrainian ? `Разом з ${data.squadSize} людьми` : `With ${data.squadSize} people`),
    cta: isUkrainian ? 'Знайди свою команду на imin.wtf' : 'Find your squad at imin.wtf',
    branding: 'imin.wtf',
  };
}

/**
 * Build OG image URL for dynamic card generation
 * Uses the site's existing OG image infrastructure
 */
export function buildRecapCardUrl(data: RecapCardData): string {
  const params = new URLSearchParams({
    event: data.eventName,
    date: data.eventDate,
    squad: data.squadName || '',
    size: data.squadSize.toString(),
    name: data.userName,
    lang: data.language || 'en',
  });
  
  return `/api/og/recap?${params.toString()}`;
}

/**
 * Get Telegram inline keyboard for sharing recap
 */
export function getRecapShareKeyboard(cardUrl: string,TG_WEBAPP_URL?: string) {
  const shareText = encodeURIComponent('🎉 Just had an amazing time at an event with IMIN! Find your squad at imin.wtf');
  
  return {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '📤 Share on Instagram', url: `instagram://share?text=${shareText}` },
        ],
        [
          { text: '📱 Open in App', web_app: { url: TG_WEBAPP_URL || 'https://imin.wtf' } },
        ],
      ],
    },
  };
}

/**
 * Create recap message for Telegram
 */
export function createRecapMessage(data: RecapCardData, cardUrl: string): string {
  const isUkrainian = data.language === 'uk';
  
  const messages = {
    en: `
🎉 *Great event!*

Thanks for joining *${data.eventName}*!

Share your squad experience and help others discover IMIN:

📸 *Your Recap Card:*
${cardUrl}

🔗 *imin.wtf* — Find your squad at every event
    `.trim(),
    
    uk: `
🎉 *Чудова подія!*

Дякую, що приєднався до *${data.eventName}!* 

Поділися досвідом своєї команди та допоможи іншим відкрити IMIN:

📸 *Твоя картка:*
${cardUrl}

🔗 *imin.wtf* — Знайди свою команду на кожній події
    `.trim(),
  };
  
  return isUkrainian ? messages.uk : messages.en;
}

export type { RecapCardData, GeneratedCard };