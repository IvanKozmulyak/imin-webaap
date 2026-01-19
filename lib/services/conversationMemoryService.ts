/**
 * Conversation Memory Service
 * Implements bounded conversational memory with rolling buffer per chatId
 * Stores conversations in database and removes old records
 */

import { prisma } from '@/lib/db/client';

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: number;
}

class ConversationMemoryService {
  private readonly defaultMaxMessages = 20;

  /**
   * Get the next sequence number for a chatId
   */
  private async getNextSequence(chatId: string): Promise<number> {
    const lastMessage = await prisma.conversationMessage.findFirst({
      where: { chatId },
      orderBy: { sequence: 'desc' },
      select: { sequence: true },
    });

    return lastMessage ? lastMessage.sequence + 1 : 1;
  }

  /**
   * Add a user message to the buffer
   */
  async addUserMessage(chatId: string, content: string, maxMessages: number = this.defaultMaxMessages): Promise<void> {
    const sequence = await this.getNextSequence(chatId);
    
    await prisma.conversationMessage.create({
      data: {
        chatId,
        role: 'user',
        content,
        sequence,
      },
    });

    await this.trimBuffer(chatId, maxMessages);
  }

  /**
   * Add an assistant message to the buffer
   */
  async addAssistantMessage(chatId: string, content: string, maxMessages: number = this.defaultMaxMessages): Promise<void> {
    const sequence = await this.getNextSequence(chatId);
    
    await prisma.conversationMessage.create({
      data: {
        chatId,
        role: 'assistant',
        content,
        sequence,
      },
    });

    await this.trimBuffer(chatId, maxMessages);
  }

  /**
   * Trim buffer to maintain maxMessages limit
   * If we have more than maxMessages, delete the oldest message
   */
  private async trimBuffer(chatId: string, maxMessages: number): Promise<void> {
    // Count all messages
    const messageCount = await prisma.conversationMessage.count({
      where: {
        chatId,
      },
    });

    // If we exceed the limit, remove the oldest message
    if (messageCount > maxMessages) {
      // Get the oldest message to delete
      const oldestMessage = await prisma.conversationMessage.findFirst({
        where: {
          chatId,
        },
        orderBy: { sequence: 'asc' },
        select: { id: true, sequence: true, role: true },
      });

      if (oldestMessage) {
        await prisma.conversationMessage.delete({
          where: {
            id: oldestMessage.id,
          },
        });
        
        console.log(`[Conversation Memory] Deleted oldest message (sequence: ${oldestMessage.sequence}, role: ${oldestMessage.role}) for chatId: ${chatId}`);
      }
    }
  }

  /**
   * Get the conversation history for a chatId
   * Returns messages in chronological order (excluding system messages)
   */
  async getConversationHistory(chatId: string): Promise<Message[]> {
    const messages = await prisma.conversationMessage.findMany({
      where: { 
        chatId,
        role: { not: 'system' }, // Exclude system messages
      },
      orderBy: { sequence: 'asc' },
    });

    return messages.map((msg: { role: string; content: string; createdAt: Date }) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
      timestamp: msg.createdAt.getTime(),
    }));
  }

  /**
   * Clear conversation history for a chatId
   */
  async clearConversation(chatId: string): Promise<void> {
    await prisma.conversationMessage.deleteMany({
      where: { chatId },
    });
  }

  /**
   * Get formatted messages for LLM (without timestamps, excluding system messages)
   */
  async getFormattedMessages(chatId: string): Promise<Array<{ role: string; content: string }>> {
    const messages = await this.getConversationHistory(chatId);
    return messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));
  }

  /**
   * Check if a chatId has an active conversation
   */
  async hasConversation(chatId: string): Promise<boolean> {
    const count = await prisma.conversationMessage.count({
      where: { chatId },
    });
    return count > 0;
  }

  /**
   * Get statistics about memory usage
   */
  async getStats(): Promise<{ totalChats: number; totalMessages: number }> {
    const [totalChats, totalMessages] = await Promise.all([
      prisma.conversationMessage.groupBy({
        by: ['chatId'],
      }).then((result: Array<{ chatId: string }>) => result.length),
      prisma.conversationMessage.count(),
    ]);

    return {
      totalChats,
      totalMessages,
    };
  }


  /**
   * Get conversation count for a specific chatId
   */
  async getConversationCount(chatId: string): Promise<number> {
    return await prisma.conversationMessage.count({
      where: { chatId },
    });
  }
}

// Export singleton instance
export const conversationMemory = new ConversationMemoryService();
