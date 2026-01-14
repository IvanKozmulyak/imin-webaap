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
 */
async function sendTelegramMessage(
  chatId: string,
  text: string,
  parseMode: 'Markdown' | 'HTML' = 'Markdown'
): Promise<void> {
  const token = getBotToken();
  
  try {
    const response = await fetch(`${TELEGRAM_API_BASE}${token}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: parseMode,
        disable_web_page_preview: false,
      }),
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
 * Creates a welcome message for new group members
 * @param eventName Name of the event
 * @param ticketUrl Optional ticket URL
 * @param memberName Optional name of the new member
 * @returns Formatted welcome message
 */
function createWelcomeMessage(
  eventName: string,
  ticketUrl?: string | null,
  memberName?: string
): string {
  const greeting = memberName 
    ? `👋 Welcome to the group, ${memberName}!`
    : `👋 Welcome to the group!`;
  
  let message = `${greeting}\n\n`;
  message += `🎉 You've joined the **${eventName}** community!\n\n`;
  message += `💬 This is your squad - feel free to introduce yourself and start chatting with your fellow participants.\n\n`;
  message += `✨ Here's what you can do:\n`;
  message += `• Share your interests and hobbies\n`;
  message += `• Plan meetups before the event\n`;
  message += `• Get to know your squad members\n`;
  message += `• Ask questions about the event\n\n`;
  message += `💡 **Icebreaker ideas:**\n`;
  message += `• What are you most excited about for this event?\n`;
  message += `• Share a fun fact about yourself\n`;
  message += `• What brings you here today?\n\n`;
  
  if (ticketUrl) {
    message += `🎫 **Get your tickets:** [Click here](${ticketUrl})\n\n`;
  }
  
  message += `🚀 Let's make this event amazing together! Don't be shy - say hello! 👋`;
  
  return message;
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
      const memberName = member.first_name || 'there';
      const welcomeMessage = createWelcomeMessage(
        event.name,
        event.ticketUrl,
        memberName
      );
      
      await sendTelegramMessage(chatId, welcomeMessage);
      
      console.log(`Welcome message sent to ${memberName} in chat ${chatId}`);
    } catch (error: any) {
      console.error(`Failed to send welcome message to new member:`, error);
      // Continue with other members even if one fails
    }
  }
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
      const memberName = member.first_name || 'there';
      const welcomeMessage = createWelcomeMessage(
        event.name,
        event.ticketUrl,
        memberName
      );
      
      await sendTelegramMessage(chatId, welcomeMessage);
      
      console.log(`Welcome message sent to ${memberName} in chat ${chatId}`);
    } catch (error: any) {
      console.error(`Failed to send welcome message to new member:`, error);
    }
  }
}
