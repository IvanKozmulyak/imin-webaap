/**
 * Telegram Bot Service
 * Handles bot webhook events and sends messages to Telegram groups
 */

import { prisma } from '@/lib/db/client';

const TELEGRAM_API_BASE = 'https://api.telegram.org/bot';

/**
 * Gets the Telegram bot token from environment
 */
function getBotToken(): string {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    throw new Error('TELEGRAM_BOT_TOKEN is not configured');
  }
  return token;
}

/**
 * Sends a message to a Telegram chat
 * @param chatId Telegram chat ID
 * @param text Message text (supports Markdown)
 * @param parseMode Parse mode for the message (default: 'Markdown')
 * @param inlineKeyboard Optional inline keyboard buttons
 */
async function sendTelegramMessage(
  chatId: string,
  text: string,
  parseMode: 'Markdown' | 'HTML' = 'Markdown',
  inlineKeyboard?: Array<Array<{ text: string; url?: string; callback_data?: string }>>
): Promise<void> {
  const token = getBotToken();
  
  try {
    const payload: any = {
      chat_id: chatId,
      text,
      parse_mode: parseMode,
      disable_web_page_preview: false,
    };

    // Add inline keyboard if provided
    if (inlineKeyboard && inlineKeyboard.length > 0) {
      payload.reply_markup = {
        inline_keyboard: inlineKeyboard,
      };
    }

    const response = await fetch(`${TELEGRAM_API_BASE}${token}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    
    if (!data.ok) {
      console.error('Error sending Telegram message:', {
        chatId,
        error: data.description,
        errorCode: data.error_code,
        fullResponse: JSON.stringify(data, null, 2),
      });
      throw new Error(`Failed to send message: ${data.description || 'Unknown error'}`);
    }
    
    console.log('Message sent successfully:', {
      chatId,
      messageId: data.result?.message_id,
    });
  } catch (error: any) {
    console.error('Error in sendTelegramMessage:', error);
    throw error;
  }
}

/**
 * Gets the real member count of a Telegram group, excluding bots and admins
 * @param chatId Telegram chat ID
 * @returns Real member count (excluding bots and admins)
 */
async function getRealMemberCount(chatId: string): Promise<number> {
  const token = getBotToken();
  
  try {
    // Get total member count
    const countResponse = await fetch(
      `${TELEGRAM_API_BASE}${token}/getChatMemberCount`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
        }),
      }
    );

    const countData = await countResponse.json();
    
    if (!countData.ok) {
      console.error('Error getting chat member count:', countData.description);
      return 0;
    }

    const totalCount = countData.result || 0;

    const realMemberCount = Math.max(0, totalCount - 1);

    console.log(`Member count for chat ${chatId}: total=${totalCount}, real=${realMemberCount}`);
    
    return realMemberCount;
  } catch (error: any) {
    console.error('Error getting real member count:', error);
    return 0;
  }
}

/**
 * Updates the member count in the database based on real Telegram group membership
 * @param telegramGroupId The Telegram group ID in our database
 * @param chatId The Telegram chat ID
 */
async function updateMemberCountFromTelegram(telegramGroupId: string, chatId: string): Promise<void> {
  try {
    const realMemberCount = await getRealMemberCount(chatId);
    
    // Get the group to check maxMembers
    const telegramGroup = await prisma.telegramGroup.findUnique({
      where: { id: telegramGroupId },
      select: { maxMembers: true },
    });
    
    const maxMembers = telegramGroup?.maxMembers ?? 5;
    const isFull = realMemberCount >= maxMembers;
    
    // Update the database with the real count
    await prisma.telegramGroup.update({
      where: { id: telegramGroupId },
      data: {
        memberCount: realMemberCount,
        isFull: isFull,
      },
    });

    console.log(`Updated member count for group ${telegramGroupId} to ${realMemberCount} (max: ${maxMembers}, full: ${realMemberCount >= maxMembers})`);
  } catch (error: any) {
    console.error('Error updating member count from Telegram:', error);
  }
}

/**
 * Creates a welcome message for new group members
 * @param firstName First name of the new member
 * @param ticketUrl Optional ticket URL
 * @returns Object with message text and optional inline keyboard
 */
function createWelcomeMessage(
  firstName: string,
  ticketUrl?: string | null
): { message: string; inlineKeyboard?: Array<Array<{ text: string; url: string }>> } {
  const message = `⚡️ **Yo ${firstName}, you're in.**\n\n` +
    `Don't be a ghost - drop a GIF or Voice Note to prove you're real. 👻\n\n` +
    `*Heads up: You need a ticket to get past the bouncer.*`;
  
  const result: { message: string; inlineKeyboard?: Array<Array<{ text: string; url: string }>> } = {
    message,
  };

  // Add buy ticket button if ticket URL is available
  if (ticketUrl) {
    result.inlineKeyboard = [
      [
        {
          text: 'Buy Ticket',
          url: ticketUrl,
        },
      ],
    ];
  }

  return result;
}

/**
 * Handles a Telegram webhook update
 * @param update The webhook update object from Telegram
 */
export async function handleTelegramWebhook(update: any): Promise<void> {
  try {
    // Handle new chat member events
    if (update.message?.new_chat_members) {
      await handleNewChatMembers(update.message);
    }
    
    // Handle chat_member updates (when someone joins via invite link)
    if (update.chat_member) {
      await handleChatMemberUpdate(update.chat_member);
    }
    
    // Log unhandled updates for debugging
    if (!update.message?.new_chat_members && !update.chat_member) {
      console.log('Unhandled webhook update type:', update.update_id);
    }
  } catch (error: any) {
    console.error('Error handling webhook update:', error);
    throw error;
  }
}

/**
 * Handles new chat members joining via the message.new_chat_members event
 * @param message The message object containing new_chat_members
 */
async function handleNewChatMembers(message: any): Promise<void> {
  const chatId = message.chat.id.toString();
  const newMembers = message.new_chat_members || [];
  
  // Get event information for this group
  const telegramGroup = await prisma.telegramGroup.findFirst({
    where: {
      telegramChatId: chatId,
    },
    include: {
      event: true,
    },
  });
  
  if (!telegramGroup) {
    console.log(`No event found for chat ${chatId}, skipping welcome message`);
    return;
  }
  
  const event = telegramGroup.event;
  
  // Send welcome message for each new member
  for (const member of newMembers) {
    // Skip if the new member is a bot (unless it's our bot)
    if (member.is_bot && member.username !== 'imin_squad_bot') {
      continue;
    }
    
    try {
      const firstName = member.first_name || 'there';
      const { message, inlineKeyboard } = createWelcomeMessage(
        firstName,
        event.ticketUrl
      );
      
      await sendTelegramMessage(chatId, message, 'Markdown', inlineKeyboard);
      
      console.log(`Welcome message sent to ${firstName} in chat ${chatId}`);
    } catch (error: any) {
      console.error(`Failed to send welcome message to new member:`, error);
      // Continue with other members even if one fails
    }
  }

  await updateMemberCountFromTelegram(telegramGroup.id, chatId);
}

/**
 * Handles chat_member updates (when someone joins via invite link)
 * @param chatMemberUpdate The chat_member update object
 */
async function handleChatMemberUpdate(chatMemberUpdate: any): Promise<void> {
  const chatId = chatMemberUpdate.chat.id.toString();
  const newStatus = chatMemberUpdate.new_chat_member.status;
  const oldStatus = chatMemberUpdate.old_chat_member.status;
  const member = chatMemberUpdate.new_chat_member.user;
  
  // Only handle when someone becomes a member (joins the group)
  if (newStatus === 'member' && oldStatus !== 'member') {
    // Skip if the new member is a bot (unless it's our bot)
    if (member.is_bot && member.username !== 'imin_squad_bot') {
      return;
    }
    
    // Get event information for this group
    const telegramGroup = await prisma.telegramGroup.findFirst({
      where: {
        telegramChatId: chatId,
      },
      include: {
        event: true,
      },
    });
    
    if (!telegramGroup) {
      console.log(`No event found for chat ${chatId}, skipping welcome message`);
      return;
    }
    
    const event = telegramGroup.event;
    
    try {
      const firstName = member.first_name || 'there';
      const { message, inlineKeyboard } = createWelcomeMessage(
        firstName,
        event.ticketUrl
      );
      
      await sendTelegramMessage(chatId, message, 'Markdown', inlineKeyboard);
      
      console.log(`Welcome message sent to ${firstName} in chat ${chatId}`);
    } catch (error: any) {
      console.error(`Failed to send welcome message to new member:`, error);
    }

    await updateMemberCountFromTelegram(telegramGroup.id, chatId);
  }
}
