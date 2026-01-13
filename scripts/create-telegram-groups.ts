#!/usr/bin/env tsx
/**
 * Script to create 10 Telegram groups and save invite links to the database
 * Groups are named after the event name and the bot @imin_squad_bot is added as admin
 * 
 * Usage:
 *   tsx scripts/create-telegram-groups.ts <eventId>
 * 
 * eventId is required - the event must exist in the database
 */

import { prisma } from '../lib/db/client';
import { createTelegramGroupWithGramJS, addBotAsAdmin } from '../lib/services/telegramService';

const NUMBER_OF_GROUPS = 10;
const MAX_MEMBERS_PER_GROUP = 5;

/**
 * Gets an event by ID (required)
 */
async function getEvent(eventId: string) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });
  if (!event) {
    throw new Error(`Event with ID ${eventId} not found`);
  }
  return event;
}

/**
 * Creates a Telegram group and saves it to the database
 */
async function createAndSaveGroup(
  eventId: string,
  eventName: string,
  groupNumber: number,
  botUsername: string = 'imin_squad_bot'
) {
  const groupName = `${eventName} ${groupNumber}`;
  
  console.log(`Creating group ${groupNumber}/${NUMBER_OF_GROUPS}: ${groupName}...`);
  
  try {
    // Create the Telegram group
    const { chatId, inviteLink, chatEntity } = await createTelegramGroupWithGramJS(
      groupName,
      MAX_MEMBERS_PER_GROUP
    );

    // Add bot as admin if chat entity is available
    if (chatEntity) {
      try {
        await addBotAsAdmin(chatEntity, botUsername);
        console.log(`  - Added @${botUsername} as admin`);
      } catch (error: any) {
        console.warn(`  ⚠ Warning: Failed to add bot as admin: ${error.message}`);
        // Continue even if adding bot fails
      }
    } else {
      console.warn(`  ⚠ Warning: Chat entity not available, skipping bot admin addition`);
    }

    // Save to database
    const telegramGroup = await prisma.telegramGroup.create({
      data: {
        eventId,
        telegramChatId: chatId,
        inviteLink,
        maxMembers: MAX_MEMBERS_PER_GROUP,
        memberCount: 0,
        isFull: false,
      },
    });

    console.log(`✓ Group ${groupNumber} created successfully:`);
    console.log(`  - ID: ${telegramGroup.id}`);
    console.log(`  - Chat ID: ${chatId}`);
    console.log(`  - Invite Link: ${inviteLink}`);
    console.log('');

    return telegramGroup;
  } catch (error: any) {
    console.error(`✗ Failed to create group ${groupNumber}:`, error.message);
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  const eventId = process.argv[2];

  if (!eventId) {
    console.error('Error: Event ID is required as a parameter');
    console.error('Usage: tsx scripts/create-telegram-groups.ts <eventId>');
    process.exit(1);
  }

  try {
    console.log('Starting Telegram group creation script...\n');

    // Get event (required)
    const event = await getEvent(eventId);
    console.log(`Event: ${event.name} (${event.id})\n`);

    // Create groups sequentially to avoid rate limits
    const createdGroups = [];
    for (let i = 1; i <= NUMBER_OF_GROUPS; i++) {
      try {
        const group = await createAndSaveGroup(event.id, event.name, i);
        createdGroups.push(group);
        
        // Add a small delay between requests to avoid rate limiting
        if (i < NUMBER_OF_GROUPS) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
        }
      } catch (error) {
        console.error(`Failed to create group ${i}, continuing with next group...`);
        // Continue with next group even if one fails
      }
    }

    console.log('\n=== Summary ===');
    console.log(`Successfully created ${createdGroups.length} out of ${NUMBER_OF_GROUPS} groups`);
    console.log(`Event ID: ${event.id}`);
    console.log(`Event Name: ${event.name}`);
    console.log('\nCreated groups:');
    createdGroups.forEach((group, index) => {
      console.log(`${index + 1}. ${group.inviteLink}`);
    });

  } catch (error: any) {
    console.error('\n✗ Script failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
