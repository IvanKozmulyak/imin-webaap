/**
 * Telegram Bot Service
 * Handles bot webhook events and sends messages to Telegram groups
 */

import { prisma } from '@/lib/db/client';
import { conversationMemory } from './conversationMemoryService';
import { generateLLMResponse } from './llmService';
import {
  getWelcomeMessage,
  getLeaveMessage,
  getBotHelpPrompt,
  getBotErrorProcessing,
  getBotErrorGeneric,
} from '@/lib/constants/telegramMessages';

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

/** Escape text for Telegram HTML parse_mode so < > & don't break the message. */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Prefix reply with a mention of the user so they get tagged/notified.
 * Returns message suitable for sendMessage with parse_mode: 'HTML'.
 */
function formatReplyWithMention(userId: number, firstName: string, replyText: string): { text: string; parseMode: 'HTML' } {
  const safeName = escapeHtml(firstName || 'there');
  const safeReply = escapeHtml(replyText);
  const mention = `<a href="tg://user?id=${userId}">${safeName}</a>, ${safeReply}`;
  return { text: mention, parseMode: 'HTML' };
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
  parseMode: 'Markdown' | 'HTML' | null = null,
  inlineKeyboard?: Array<Array<{ text: string; url?: string; callback_data?: string }>>
): Promise<void> {
  const token = getBotToken();
  
  try {
    const payload: any = {
      chat_id: chatId,
      text,
      disable_web_page_preview: false,
    };

    // Only add parse_mode if specified (null means plain text)
    if (parseMode) {
      payload.parse_mode = parseMode;
    }

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
 * Gets the real member count of a Telegram group, excluding bots, the creator, and admins
 * @param chatId Telegram chat ID
 * @returns Real member count (excluding bots, creator, and admins)
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

    const realMemberCount = Math.max(0, totalCount - 2);

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

/** Escape user-controlled text for Telegram Markdown. */
function escapeMarkdown(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/_/g, '\\_').replace(/\*/g, '\\*');
}

/**
 * Creates a welcome message (EN or UK from event.messageLanguage).
 */
function createWelcomeMessage(
  firstName: string,
  memberCount: number,
  ticketUrl: string | null | undefined,
  botUsername: string,
  messageLanguage: string | null | undefined
): { message: string; inlineKeyboard?: Array<Array<{ text: string; url: string }>> } {

  const { message: msg, buyTicketLabel } = getWelcomeMessage(
    messageLanguage,
    escapeMarkdown(firstName),
    memberCount,
    botUsername,
    ticketUrl
  );
  const result: {
    message: string;
    inlineKeyboard?: Array<Array<{ text: string; url: string }>>;
  } = { message: msg };
  if (ticketUrl) {
    result.inlineKeyboard = [[{ text: buyTicketLabel, url: ticketUrl }]];
  }
  return result;
}

/** Creates a leave message in the event's language (EN or UK). */
function createLeaveMessage(messageLanguage: string | null | undefined): string {
  return getLeaveMessage(messageLanguage);
}

/**
 * Handles a Telegram webhook update
 * @param update The webhook update object from Telegram
 */
export async function handleTelegramWebhook(update: any): Promise<void> {
  try {
    // Handle regular messages (including mentions)
    if (update.message?.text && !update.message?.new_chat_members && !update.message?.left_chat_member) {
      await handleMessage(update.message);
    }
    
    // Handle new chat member events
    if (update.message?.new_chat_members) {
      await handleNewChatMembers(update.message);
    }
    
    // Handle left chat member events
    if (update.message?.left_chat_member) {
      await handleLeftChatMember(update.message);
    }
    
    // Handle chat_member updates (when someone joins or leaves via invite link)
    if (update.chat_member) {
      await handleChatMemberUpdate(update.chat_member);
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
  const newMembers: any[] = message.new_chat_members || [];
  
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
  const botUsername = process.env.TELEGRAM_BOT_USERNAME || 'imin_squad_bot';
  
  const currentMemberCount = await getRealMemberCount(chatId);
  
  // Count real new members (excluding bots except our bot)
  const realNewMembersCount = newMembers.filter((m) => {
    return !m.is_bot || m.username === 'imin_squad_bot';
  }).length;
  
  // Send welcome message for each new member
  for (const member of newMembers) {
    // Skip if the new member is a bot (unless it's our bot)
    if (member.is_bot && member.username !== 'imin_squad_bot') {
      continue;
    }
    
    try {
      const firstName = member.first_name || 'there';
      // Use current count + new members for welcome message
      const memberCountForMessage = currentMemberCount + realNewMembersCount;
      const { message, inlineKeyboard } = createWelcomeMessage(
        firstName,
        memberCountForMessage,
        event.ticketUrl,
        botUsername,
        event.messageLanguage
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
 * Handles chat_member updates (when someone joins or leaves via invite link)
 * @param chatMemberUpdate The chat_member update object
 */
async function handleChatMemberUpdate(chatMemberUpdate: any): Promise<void> {
  const chatId = chatMemberUpdate.chat.id.toString();
  const newStatus = chatMemberUpdate.new_chat_member.status;
  const oldStatus = chatMemberUpdate.old_chat_member.status;
  const member = chatMemberUpdate.new_chat_member.user;
  
  // Handle when someone becomes a member (joins the group)
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
    const botUsername = process.env.TELEGRAM_BOT_USERNAME || 'imin_squad_bot';
    
    // Get current member count before updating
    const currentMemberCount = await getRealMemberCount(chatId);
    
    try {
      const firstName = member.first_name || 'there';
      // Use current count + 1 for welcome message (this new member)
      const memberCountForMessage = currentMemberCount + 1;
      const { message, inlineKeyboard } = createWelcomeMessage(
        firstName,
        memberCountForMessage,
        event.ticketUrl,
        botUsername,
        event.messageLanguage
      );
      
      await sendTelegramMessage(chatId, message, 'Markdown', inlineKeyboard);
      
      console.log(`Welcome message sent to ${firstName} in chat ${chatId}`);
    } catch (error: any) {
      console.error(`Failed to send welcome message to new member:`, error);
    }

    await updateMemberCountFromTelegram(telegramGroup.id, chatId);
  }
  
  // Handle when someone leaves the group (status changes from member to left or kicked)
  if ((newStatus === 'left' || newStatus === 'kicked') && oldStatus === 'member') {
    // Skip if the leaving member is a bot (unless it's our bot)
    if (member.is_bot && member.username !== 'imin_squad_bot') {
      return;
    }
    
    // Get the Telegram group for this chat (include event for message language)
    const telegramGroup = await prisma.telegramGroup.findFirst({
      where: { telegramChatId: chatId },
      include: { event: true },
    });
    
    if (!telegramGroup) {
      console.log(`No event found for chat ${chatId}, skipping member count update`);
      return;
    }
    
    try {
      const leaveMessage = createLeaveMessage(telegramGroup.event?.messageLanguage);
      await sendTelegramMessage(chatId, leaveMessage, 'Markdown');
      console.log(`Leave message sent to group ${chatId}`);
    } catch (error: any) {
      console.error(`Failed to send leave message:`, error);
    }
    
    await updateMemberCountFromTelegram(telegramGroup.id, chatId);
    console.log(`Member left group ${chatId}, updated member count`);
  }
}

/**
 * Handles regular text messages and mentions
 * @param message The message object from Telegram
 */
async function handleMessage(message: any): Promise<void> {
  const chatId = message.chat.id.toString();
  const text = message.text || '';
  const botUsername = process.env.TELEGRAM_BOT_USERNAME || 'imin_squad_bot';
  
  // Skip if message is empty or from a bot (unless it's our bot)
  if (!text || (message.from?.is_bot && message.from?.username !== botUsername)) {
    return;
  }

  // Check if bot is mentioned/tagged in the message
  const isMentioned = 
    text.includes(`@${botUsername}`) ||
    (message.entities && message.entities.some((e: any) => 
      e.type === 'mention' && text.substring(e.offset, e.offset + e.length) === `@${botUsername}`
    ));

  // Save ALL messages to conversation memory (for context)
  // But only respond if bot is mentioned
  try {
    // Remove the mention from the message text for storage
    const cleanText = text.replace(`@${botUsername}`, '').trim();
    
    // Always save user messages to conversation memory
    if (cleanText) {
      await conversationMemory.addUserMessage(chatId, cleanText);
      console.log(`[Telegram] Saved message to conversation memory for chatId: ${chatId}`);
    }

    // Only respond if bot is mentioned
    if (!isMentioned) {
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

    const eventInfo = telegramGroup?.event ? {
      name: telegramGroup.event.name,
      description: telegramGroup.event.description,
      fromDateTime: telegramGroup.event.fromDateTime,
      toDateTime: telegramGroup.event.toDateTime,
      location: telegramGroup.event.location,
      ticketUrl: telegramGroup.event.ticketUrl,
    } : null;

    const msgLang = telegramGroup?.event?.messageLanguage;
    const from = message.from;
    const userId = from?.id;
    const firstName = from?.first_name || 'there';

    if (!cleanText) {
      const reply = userId != null
        ? formatReplyWithMention(userId, firstName, getBotHelpPrompt(msgLang))
        : { text: getBotHelpPrompt(msgLang), parseMode: 'Markdown' as const };
      await sendTelegramMessage(chatId, reply.text, reply.parseMode);
      return;
    }

    const llmResponse = await generateLLMResponse(chatId, cleanText, eventInfo);

    if (llmResponse.error) {
      console.error('LLM error:', llmResponse.error);
      const errorReply = userId != null
        ? formatReplyWithMention(userId, firstName, getBotErrorProcessing(msgLang))
        : { text: getBotErrorProcessing(msgLang), parseMode: null as const };
      await sendTelegramMessage(chatId, errorReply.text, errorReply.parseMode);
      return;
    }

    await conversationMemory.addAssistantMessage(chatId, llmResponse.content);

    const reply = userId != null
      ? formatReplyWithMention(userId, firstName, llmResponse.content)
      : { text: llmResponse.content, parseMode: null as const };
    await sendTelegramMessage(chatId, reply.text, reply.parseMode);

    console.log(`[Telegram] Response sent to chat ${chatId}`);
  } catch (error: any) {
    console.error(`[Telegram] Error handling message in chat ${chatId}:`, error);
    if (isMentioned) {
      try {
        const from = message.from;
        const userId = from?.id;
        const firstName = from?.first_name || 'there';
        const reply = userId != null
          ? formatReplyWithMention(userId, firstName, getBotErrorGeneric(undefined))
          : { text: getBotErrorGeneric(undefined), parseMode: null as const };
        await sendTelegramMessage(chatId, reply.text, reply.parseMode);
      } catch (sendError) {
        console.error('Failed to send error message:', sendError);
      }
    }
  }
}

/**
 * Handles when a chat member leaves via the message.left_chat_member event
 * @param message The message object containing left_chat_member
 */
async function handleLeftChatMember(message: any): Promise<void> {
  const chatId = message.chat.id.toString();
  const leftMember = message.left_chat_member;
  
  // Skip if the leaving member is a bot (unless it's our bot)
  if (leftMember?.is_bot && leftMember.username !== 'imin_squad_bot') {
    return;
  }
  
  const telegramGroup = await prisma.telegramGroup.findFirst({
    where: { telegramChatId: chatId },
    include: { event: true },
  });
  
  if (!telegramGroup) {
    console.log(`No event found for chat ${chatId}, skipping member count update`);
    return;
  }
  
  try {
    const leaveMessage = createLeaveMessage(telegramGroup.event?.messageLanguage);
    await sendTelegramMessage(chatId, leaveMessage, 'Markdown');
    console.log(`Leave message sent to group ${chatId}`);
  } catch (error: any) {
    console.error(`Failed to send leave message:`, error);
  }
  
  await updateMemberCountFromTelegram(telegramGroup.id, chatId);
  console.log(`Member left group ${chatId}, updated member count`);
}
