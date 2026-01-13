/**
 * Telegram Service
 * Handles Telegram group creation and invite link generation
 * 
 * Uses GramJS (Telegram client) to create groups programmatically
 * Falls back to Bot API for invite link management
 */

import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { Api } from 'telegram/tl';

const TELEGRAM_API_BASE = 'https://api.telegram.org/bot';

// Singleton Telegram client instance
let telegramClient: TelegramClient | null = null;

/**
 * Helper function to get Telegram environment variables
 * Reads from process.env at runtime to ensure they're loaded correctly
 */
function getTelegramEnv() {
  const env = {
    botToken: process.env.TELEGRAM_BOT_TOKEN,
    apiId: parseInt(process.env.TELEGRAM_API_ID || '0'),
    apiHash: process.env.TELEGRAM_API_HASH || '',
    sessionString: process.env.TELEGRAM_SESSION_STRING || '',
    phoneNumber: process.env.TELEGRAM_PHONE_NUMBER || '',
  };

  // Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Telegram Env Vars:', {
      hasBotToken: !!env.botToken,
      hasApiId: !!env.apiId && env.apiId > 0,
      hasApiHash: !!env.apiHash,
      hasSessionString: !!env.sessionString,
      hasPhoneNumber: !!env.phoneNumber,
      apiIdValue: env.apiId,
    });
  }

  return env;
}

interface CreateGroupResult {
  chatId: string;
  inviteLink: string;
  chatEntity?: Api.Channel; // Optional chat entity for further operations
}

/**
 * Initializes and returns the Telegram client (singleton)
 * @returns TelegramClient instance
 */
async function getTelegramClient(): Promise<TelegramClient> {
  // Get env vars at runtime
  const env = getTelegramEnv();

  // Reuse existing client if it exists and is authorized
  if (telegramClient) {
    try {
      const isAuthorized = await telegramClient.checkAuthorization();
      if (isAuthorized) {
        // Ensure connection is active
        if (!telegramClient.connected) {
          await telegramClient.connect();
        }
        return telegramClient;
      }
    } catch (error) {
      // If check fails, recreate the client
      console.warn('Telegram client authorization check failed, recreating client:', error);
      telegramClient = null;
    }
  }

  if (!env.apiId || !env.apiHash) {
    console.error('Missing Telegram credentials:', {
      hasApiId: !!env.apiId,
      hasApiHash: !!env.apiHash,
      apiId: env.apiId,
    });
    throw new Error('TELEGRAM_API_ID and TELEGRAM_API_HASH must be configured in environment variables');
  }

  const stringSession = new StringSession(env.sessionString);
  
  telegramClient = new TelegramClient(stringSession, env.apiId, env.apiHash, {
    connectionRetries: 5,
  });

  await telegramClient.connect();

  // Check authorization
  if (!await telegramClient.checkAuthorization()) {
    if (!env.phoneNumber) {
      throw new Error(
        'Telegram client is not authorized. Please provide TELEGRAM_SESSION_STRING or TELEGRAM_PHONE_NUMBER for initial authentication.'
      );
    }

    // For initial authentication, you'll need to handle the code input
    // This is a simplified version - in production, you might want to handle this differently
    throw new Error(
      'Telegram client requires authentication. Please authenticate manually and save the session string to TELEGRAM_SESSION_STRING.'
    );
  }

  return telegramClient;
}

/**
 * Creates a new Telegram group using GramJS
 * @param groupName Name of the group to create
 * @param maxMembers Maximum number of members (default: 5)
 * @returns Chat ID and invite link
 */
export async function createTelegramGroupWithGramJS(
  groupName: string,
  maxMembers: number = 5
): Promise<CreateGroupResult> {
  try {
    const client = await getTelegramClient();

    // Create a new group
    const result = await client.invoke(
      new Api.channels.CreateChannel({
        title: groupName,
        about: `Group for ${groupName}`,
        megagroup: true, // Create a supergroup
        broadcast: false,
      })
    );

    // Extract the chat from the result
    // The result can be Updates or UpdatesTooLong, we need to handle both
    let chat: Api.Channel | undefined;
    if ('chats' in result && Array.isArray(result.chats)) {
      chat = result.chats.find((c): c is Api.Channel => c instanceof Api.Channel);
    }
    
    if (!chat) {
      throw new Error('Failed to create channel: Invalid result');
    }

    // Get the chat entity for creating invite links
    const chatEntity = await client.getEntity(chat);
    
    // Create invite link using GramJS first (this works immediately after creation)
    let inviteLink: string;
    try {
      const exportedInvite = await client.invoke(
        new Api.messages.ExportChatInvite({
          peer: chatEntity,
        })
      );
      
      // Handle different invite types
      if (exportedInvite instanceof Api.ChatInviteExported) {
        inviteLink = exportedInvite.link;
      } else if ('link' in exportedInvite && typeof exportedInvite.link === 'string') {
        inviteLink = exportedInvite.link;
      } else {
        throw new Error('Unexpected invite link format');
      }
    } catch (error) {
      console.error('Error creating invite link with GramJS:', error);
      throw new Error(`Failed to create invite link: ${error}`);
    }

    // Convert chat ID to Bot API format for storage
    // Supergroups in Bot API use format: -100 + channel_id
    // GramJS uses BigInt, so we need to convert properly
    const channelId = chat.id.toString();
    // For supergroups, Bot API format is -100{channel_id}
    // But we need to handle the case where the ID might already be in the right format
    let chatId: string;
    if (channelId.startsWith('-')) {
      chatId = channelId;
    } else {
      // Convert to Bot API format for supergroups
      chatId = `-100${channelId}`;
    }
    
    // Try to create invite link with member limit using Bot API if available
    // Note: This requires the bot to be added to the group as admin first
    // For now, we'll use the GramJS link, but you can enhance this later
    const env = getTelegramEnv();
    if (env.botToken) {
      try {
        // Note: The bot needs to be an admin in the group for Bot API to work
        // This is a limitation - you may need to add the bot manually or use GramJS to add it
        // For now, we'll just use the GramJS link
        console.log('Bot API available but using GramJS invite link. To use member limits, add bot as admin to the group.');
      } catch (error) {
        // Ignore - we already have the GramJS link
      }
    }

    return {
      chatId,
      inviteLink,
      chatEntity: chat as Api.Channel,
    };
  } catch (error: any) {
    console.error('Error creating Telegram group with GramJS:', error);
    throw new Error(`Failed to create Telegram group: ${error.message}`);
  }
}

/**
 * Creates an invite link for a specific Telegram group with member limit
 * @param chatId Telegram chat ID of the group
 * @param groupName Optional name for the invite link
 * @param memberLimit Maximum number of members (default: 5)
 * @returns Chat ID and invite link
 */
export async function createTelegramGroupInvite(
  chatId: string,
  groupName?: string,
  memberLimit: number = 5
): Promise<CreateGroupResult> {
  const env = getTelegramEnv();

  if (!env.botToken) {
    throw new Error('TELEGRAM_BOT_TOKEN is not configured');
  }

  if (!chatId) {
    throw new Error('Chat ID is required');
  }

  try {
    // Create an invite link with member limit
    const response = await fetch(
      `${TELEGRAM_API_BASE}${env.botToken}/createChatInviteLink`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          name: groupName || `Squad ${Date.now()}`,
          member_limit: memberLimit,
          creates_join_request: false,
          expire_date: undefined, // No expiration
        }),
      }
    );

    const data = await response.json();

    if (!data.ok) {
      throw new Error(`Telegram API error: ${data.description || 'Unknown error'}`);
    }

    return {
      chatId: chatId,
      inviteLink: data.result?.invite_link || '',
    };
  } catch (error: any) {
    console.error('Error creating Telegram group invite:', error);
    throw new Error(`Failed to create Telegram group invite: ${error.message}`);
  }
}



/**
 * Adds a bot as admin to a Telegram group
 * @param chatEntity The chat entity (Channel) to add the bot to
 * @param botUsername The username of the bot (without @)
 * @returns True if successful
 */
export async function addBotAsAdmin(
  chatEntity: Api.Channel,
  botUsername: string
): Promise<boolean> {
  try {
    const client = await getTelegramClient();

    // Resolve the bot username to get its user entity
    const botEntity = await client.getEntity(botUsername);
    
    if (!(botEntity instanceof Api.User)) {
      throw new Error(`Bot ${botUsername} not found or is not a user`);
    }

    // Add the bot as admin with appropriate permissions
    await client.invoke(
      new Api.channels.EditAdmin({
        channel: chatEntity,
        userId: botEntity,
        adminRights: new Api.ChatAdminRights({
          changeInfo: true,
          postMessages: false, // For groups, this is usually false
          editMessages: false,
          deleteMessages: true,
          banUsers: true,
          inviteUsers: true,
          pinMessages: true,
          addAdmins: false, // Don't allow bot to add other admins
          anonymous: false,
          manageCall: true,
          other: true, // Other permissions
        }),
        rank: 'Bot', // Admin rank/title
      })
    );

    console.log(`✓ Added bot @${botUsername} as admin to group`);
    return true;
  } catch (error: any) {
    console.error(`Error adding bot @${botUsername} as admin:`, error);
    throw new Error(`Failed to add bot as admin: ${error.message}`);
  }
}

/**
 * Gets the member count of a Telegram group
 * Note: This gets the total count of the base group, not per-invite-link
 * We track per-invite-link member counts in our database
 * @param chatId Telegram chat ID
 * @returns Member count
 */
export async function getGroupMemberCount(chatId: string): Promise<number> {
  const env = getTelegramEnv();

  if (!env.botToken) {
    throw new Error('TELEGRAM_BOT_TOKEN is not configured');
  }

  try {
    const response = await fetch(
      `${TELEGRAM_API_BASE}${env.botToken}/getChatMemberCount`,
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

    const data = await response.json();

    if (!data.ok) {
      throw new Error(`Telegram API error: ${data.description || 'Unknown error'}`);
    }

    return data.result || 0;
  } catch (error: any) {
    console.error('Error getting group member count:', error);
    // Return 0 if we can't get the count - we'll rely on our database count
    return 0;
  }
}
