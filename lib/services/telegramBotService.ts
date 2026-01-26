/**
 * Telegram Bot Service
 * Handles bot webhook events and sends messages to Telegram groups
 */

import { prisma } from '@/lib/db/client';
import { conversationMemory } from './conversationMemoryService';
import { generateLLMResponse } from './llmService';

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

/**
 * Creates a welcome message for new group members based on current member count
 * @param firstName First name of the new member
 * @param memberCount Current number of members in the group
 * @param ticketUrl Optional ticket URL
 * @param botUsername Bot username for tagging
 * @returns Object with message text and optional inline keyboard
 */
function createWelcomeMessage(
    firstName: string,
    memberCount: number,
    ticketUrl?: string | null,
    botUsername: string = 'imin_squad_bot'
): { message: string; inlineKeyboard?: Array<Array<{ text: string; url: string }>> } {

    let message = `⚡️ **${firstName}, you’re in.**\n\n`;

    if (memberCount <= 3) {
        message +=
            `⏳ **Group is forming**\n` +
            `Waiting for more members to join.\n` +
            `You’ll be notified when things start.`;
    } else {
        message +=
            `🎉 **Group is active**\n` +
            `Say hi, introduce yourself, or start a conversation.`;
    }

    message +=
        `\n\n💡 **Need info?**\n` +
        `Mention @${botUsername} to get event details or help.`;

    if (ticketUrl) {
        message += `\n\n*Heads up: You need a ticket to get past the bouncer.*`;
    }

    const result: {
        message: string;
        inlineKeyboard?: Array<Array<{ text: string; url: string }>>;
    } = { message };

    if (ticketUrl) {
        result.inlineKeyboard = [
            [{ text: 'Buy Ticket', url: ticketUrl }],
        ];
    }

    return result;
}

/**
 * Creates a message when someone leaves the group
 * @returns Message text to reassure the group
 */
function createLeaveMessage(): string {
  return `👋 **Someone left the squad.**\n\n` +
    `Don't worry - we're on it! We'll find someone awesome to fill the spot. 🔍\n\n` +
    `*The squad stays strong.* 💪`;
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
        botUsername
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
        botUsername
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
    
    // Get the Telegram group for this chat
    const telegramGroup = await prisma.telegramGroup.findFirst({
      where: {
        telegramChatId: chatId,
      },
    });
    
    if (!telegramGroup) {
      console.log(`No event found for chat ${chatId}, skipping member count update`);
      return;
    }
    
    // Send leave message to the group
    try {
      const leaveMessage = createLeaveMessage();
      await sendTelegramMessage(chatId, leaveMessage, 'Markdown');
      console.log(`Leave message sent to group ${chatId}`);
    } catch (error: any) {
      console.error(`Failed to send leave message:`, error);
      // Continue with member count update even if message fails
    }
    
    // Update member count - this will automatically set isFull to false if count drops below maxMembers
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

    // If message is just a mention (no text after cleaning), send a helpful response
    if (!cleanText) {
      await sendTelegramMessage(
        chatId,
        'Hi! I\'m here to help. What would you like to know?',
        'Markdown'
      );
      return;
    }

    // Generate LLM response with event information
    const llmResponse = await generateLLMResponse(chatId, cleanText, eventInfo);

    if (llmResponse.error) {
      console.error('LLM error:', llmResponse.error);
      await sendTelegramMessage(
        chatId,
        'Sorry, I encountered an error processing your message. Please try again later.'
      );
      return;
    }

    // Add assistant response to buffer
    await conversationMemory.addAssistantMessage(chatId, llmResponse.content);

    // Send response back to Telegram (without parse mode to avoid Markdown parsing errors)
    // LLM responses may contain special characters that break Markdown parsing
    await sendTelegramMessage(chatId, llmResponse.content);

    console.log(`[Telegram] Response sent to chat ${chatId}`);
  } catch (error: any) {
    console.error(`[Telegram] Error handling message in chat ${chatId}:`, error);
    // Try to send error message to user (only if bot was mentioned)
    if (isMentioned) {
      try {
        await sendTelegramMessage(
          chatId,
          'Sorry, I encountered an error. Please try again later.'
        );
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
  
  // Get the Telegram group for this chat
  const telegramGroup = await prisma.telegramGroup.findFirst({
    where: {
      telegramChatId: chatId,
    },
  });
  
  if (!telegramGroup) {
    console.log(`No event found for chat ${chatId}, skipping member count update`);
    return;
  }
  
  // Send leave message to the group
  try {
    const leaveMessage = createLeaveMessage();
    await sendTelegramMessage(chatId, leaveMessage, 'Markdown');
    console.log(`Leave message sent to group ${chatId}`);
  } catch (error: any) {
    console.error(`Failed to send leave message:`, error);
    // Continue with member count update even if message fails
  }
  
  // Update member count - this will automatically set isFull to false if count drops below maxMembers
  await updateMemberCountFromTelegram(telegramGroup.id, chatId);
  
  console.log(`Member left group ${chatId}, updated member count`);
}
