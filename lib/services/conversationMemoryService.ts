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
  private readonly systemPrompt = `You are an AI assistant embedded in a Telegram bot.
You receive only the last 20 messages of the conversation.
Treat them as the full available context.
Do not assume access to earlier messages.
If the user refers to missing context, ask a clarifying question.
Answer concisely and consistently.`;

  /**
   * Ensure system prompt exists for a chatId
   */
  private async ensureSystemPrompt(chatId: string): Promise<void> {
    const existingSystem = await prisma.conversationMessage.findFirst({
      where: {
        chatId,
        role: 'system',
      },
    });

    if (!existingSystem) {
      await prisma.conversationMessage.create({
        data: {
          chatId,
          role: 'system',
          content: this.systemPrompt,
          sequence: 0,
        },
      });
    }
  }

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
    await this.ensureSystemPrompt(chatId);
    
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
    await this.ensureSystemPrompt(chatId);
    
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
   * Always preserves system prompt and removes oldest messages
   * If we have more than maxMessages, delete the oldest non-system message
   */
  private async trimBuffer(chatId: string, maxMessages: number): Promise<void> {
    // Count non-system messages
    const nonSystemCount = await prisma.conversationMessage.count({
      where: {
        chatId,
        role: { not: 'system' },
      },
    });

    // If we exceed the limit, remove the oldest non-system message
    if (nonSystemCount > maxMessages) {
      // Get the oldest non-system message to delete
      const oldestMessage = await prisma.conversationMessage.findFirst({
        where: {
          chatId,
          role: { not: 'system' },
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
   * Returns messages in chronological order with system prompt included
   */
  async getConversationHistory(chatId: string): Promise<Message[]> {
    await this.ensureSystemPrompt(chatId);
    
    const messages = await prisma.conversationMessage.findMany({
      where: { chatId },
      orderBy: { sequence: 'asc' },
    });

    return messages.map((msg: { role: string; content: string; createdAt: Date }) => ({
      role: msg.role as 'system' | 'user' | 'assistant',
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
   * Get formatted messages for LLM (without timestamps)
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
