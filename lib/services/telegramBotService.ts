/**
 * Telegram Bot Service
 * Handles bot webhook events and sends messages to Telegram groups
 */

import { prisma } from '@/lib/db/client';
import { conversationMemory } from './conversationMemoryService';
import { generateLLMResponse } from './llmService';

const TELEGRAM_API_BASE = 'https://api.telegram.org/bot';

const scheduledIcebreakers = new Map<string, NodeJS.Timeout>();
const MIN_MEMBERS_FOR_DISCUSSIONS = 3;
const ICEBREAKER_DELAY_MS = 2 * 60 * 1000;

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
 * Gets icebreaker messages to help people get to know each other
 * @returns Array of icebreaker message texts
 */
function getIcebreakerMessages(): string[] {
  return [
    `🌟 **Let's break the ice!**\n\n` +
    `Share something fun about yourself! What's the best concert or event you've ever been to? 🎵`,
    
    `🎯 **Quick question for everyone:**\n\n` +
    `What are you most excited about for this event? Drop a message and let's chat! 💬`,
    
    `🎨 **Time to get creative!**\n\n` +
    `Share a GIF or emoji that describes your vibe right now! Let's see what everyone's feeling! 😎`,
    
    `🗣️ **Let's hear from everyone:**\n\n` +
    `What's one thing you'd like to know about your squad members? Ask away! 🤔`,
    
    `🎪 **Fun fact time!**\n\n` +
    `Share a fun fact about yourself - something that might surprise the group! 🎲`,
  ];
}

/**
 * Sends icebreaker messages to help group members get to know each other
 * @param chatId Telegram chat ID
 */
async function sendIcebreakerMessages(chatId: string): Promise<void> {
  console.log(`[Icebreaker] Starting to send icebreaker messages for chat ${chatId}`);
  
  try {
    const messages = getIcebreakerMessages();
    console.log(`[Icebreaker] Got ${messages.length} icebreaker messages to send`);
    
    // Send first message immediately
    try {
      await sendTelegramMessage(chatId, messages[0], 'Markdown');
      console.log(`[Icebreaker] Message 1/5 sent to chat ${chatId}`);
    } catch (error: any) {
      console.error(`[Icebreaker] Failed to send message 1/5:`, error);
    }
    
    // Schedule remaining messages with delays
    for (let i = 1; i < messages.length; i++) {
      const delay = i * 30000; // 30 seconds between messages
      const messageIndex = i + 1;
      
      setTimeout(async () => {
        try {
          console.log(`[Icebreaker] Attempting to send message ${messageIndex}/5 to chat ${chatId}`);
          await sendTelegramMessage(chatId, messages[i], 'Markdown');
          console.log(`[Icebreaker] Message ${messageIndex}/5 sent successfully to chat ${chatId}`);
        } catch (error: any) {
          console.error(`[Icebreaker] Failed to send message ${messageIndex}/5:`, error);
        }
      }, delay);
      
      console.log(`[Icebreaker] Scheduled message ${messageIndex}/5 for ${delay}ms delay`);
    }
    
    // Clean up the scheduled entry after all messages are sent
    const totalDelay = messages.length * 30000;
    setTimeout(() => {
      scheduledIcebreakers.delete(chatId);
      console.log(`[Icebreaker] Cleaned up icebreaker schedule for chat ${chatId}`);
    }, totalDelay);
    
    console.log(`[Icebreaker] All messages scheduled for chat ${chatId}`);
  } catch (error: any) {
    console.error(`[Icebreaker] Error in sendIcebreakerMessages for chat ${chatId}:`, error);
    scheduledIcebreakers.delete(chatId);
  }
}

/**
 * Schedules icebreaker messages if minimum members have joined and not already scheduled
 * @param chatId Telegram chat ID
 * @param memberCount Current member count
 */
function scheduleIcebreakerMessagesIfNeeded(chatId: string, memberCount: number): void {
  // Only schedule if we have minimum members and haven't already scheduled
  if (memberCount >= MIN_MEMBERS_FOR_DISCUSSIONS && !scheduledIcebreakers.has(chatId)) {
    console.log(`[Icebreaker] Scheduling icebreaker messages for chat ${chatId} (${memberCount} members, minimum: ${MIN_MEMBERS_FOR_DISCUSSIONS})`);
    
    const timeoutId = setTimeout(async () => {
      console.log(`[Icebreaker] ⏰ Timeout fired for chat ${chatId} at ${new Date().toISOString()}, calling sendIcebreakerMessages`);
      try {
        await sendIcebreakerMessages(chatId);
      } catch (error: any) {
        console.error(`[Icebreaker] Error in timeout callback for chat ${chatId}:`, error);
        scheduledIcebreakers.delete(chatId);
      }
    }, ICEBREAKER_DELAY_MS);
    
    // Verify timeout was created
    if (!timeoutId) {
      console.error(`[Icebreaker] ❌ Failed to create timeout for chat ${chatId}`);
      return;
    }
    
    scheduledIcebreakers.set(chatId, timeoutId);
    const scheduledTime = new Date(Date.now() + ICEBREAKER_DELAY_MS);
    console.log(`[Icebreaker] ✅ Icebreaker messages scheduled for chat ${chatId}`);
    console.log(`[Icebreaker]    Delay: ${ICEBREAKER_DELAY_MS}ms (${ICEBREAKER_DELAY_MS / 1000 / 60} minutes)`);
    console.log(`[Icebreaker]    Scheduled to fire at: ${scheduledTime.toISOString()}`);
    console.log(`[Icebreaker]    Timeout ID: ${timeoutId}`);
    console.log(`[Icebreaker]    Total scheduled icebreakers: ${scheduledIcebreakers.size}`);
  } else {
    if (memberCount < MIN_MEMBERS_FOR_DISCUSSIONS) {
      console.log(`[Icebreaker] Not scheduling - member count ${memberCount} is below minimum ${MIN_MEMBERS_FOR_DISCUSSIONS}`);
    } else if (scheduledIcebreakers.has(chatId)) {
      console.log(`[Icebreaker] Not scheduling - already scheduled for chat ${chatId}`);
    }
  }
}

/**
 * Cancels scheduled icebreaker messages if member count drops below minimum
 * @param chatId Telegram chat ID
 * @param memberCount Current member count
 */
function cancelIcebreakerMessagesIfNeeded(chatId: string, memberCount: number): void {
  // Cancel if count drops below minimum and we have a scheduled icebreaker
  if (memberCount < MIN_MEMBERS_FOR_DISCUSSIONS && scheduledIcebreakers.has(chatId)) {
    const timeoutId = scheduledIcebreakers.get(chatId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      scheduledIcebreakers.delete(chatId);
      console.log(`Cancelled icebreaker messages for chat ${chatId} (member count dropped to ${memberCount})`);
    }
  }
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

  // Update member count and check if we should schedule icebreakers
  await updateMemberCountFromTelegram(telegramGroup.id, chatId);
  
  // Get updated member count after the update
  const updatedMemberCount = await getRealMemberCount(chatId);
  
  // Schedule icebreaker messages if minimum members reached
  scheduleIcebreakerMessagesIfNeeded(chatId, updatedMemberCount);
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

    // Update member count and check if we should schedule icebreakers
    await updateMemberCountFromTelegram(telegramGroup.id, chatId);
    
    // Get updated member count after the update
    const updatedMemberCount = await getRealMemberCount(chatId);
    
    // Schedule icebreaker messages if minimum members reached
    scheduleIcebreakerMessagesIfNeeded(chatId, updatedMemberCount);
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
    
    // Get updated member count after the update
    const updatedMemberCount = await getRealMemberCount(chatId);
    
    // Cancel icebreaker messages if count drops below minimum
    cancelIcebreakerMessagesIfNeeded(chatId, updatedMemberCount);
    
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
      eventDateTime: telegramGroup.event.eventDateTime,
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
  
  // Get updated member count after the update
  const updatedMemberCount = await getRealMemberCount(chatId);
  
  // Cancel icebreaker messages if count drops below minimum
  cancelIcebreakerMessagesIfNeeded(chatId, updatedMemberCount);
  
  console.log(`Member left group ${chatId}, updated member count`);
}
