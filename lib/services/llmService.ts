/**
 * LLM Service
 * Handles communication with LLM APIs for generating responses
 */

import { OpenRouter } from '@openrouter/sdk';
import { conversationMemory } from './conversationMemoryService';

export interface LLMResponse {
  content: string;
  error?: string;
}

export interface EventInfo {
  name: string;
  description?: string | null;
  fromDateTime: Date;
  toDateTime: Date;
  location: string;
  ticketUrl?: string | null;
}

/**
 * Generate a response using Gemini AI (default)
 * Falls back to other providers if Gemini is not configured
 */
export async function generateLLMResponse(
  chatId: string,
  userMessage: string,
  eventInfo?: EventInfo | null
): Promise<LLMResponse> {
  try {
    // Get conversation history
    const messages = await conversationMemory.getFormattedMessages(chatId);
    
    // Try OpenRouter first (highest priority)
    const openRouterKey = process.env.OPENROUTER_API_KEY;
    if (openRouterKey) {
      return await generateOpenRouterResponse(messages, openRouterKey, eventInfo);
    }

    return {
      content: '',
      error: 'No LLM API key configured.',
    };
  } catch (error: any) {
    console.error('Error generating LLM response:', error);
    return {
      content: '',
      error: error.message || 'Failed to generate response',
    };
  }
}

/**
 * Generate response using OpenRouter API
 * Uses OpenRouter SDK to access various LLM models
 */
async function generateOpenRouterResponse(
  messages: Array<{ role: string; content: string }>,
  apiKey: string,
  eventInfo?: EventInfo | null
): Promise<LLMResponse> {
  // Initialize OpenRouter client
  const openrouter = new OpenRouter({
    apiKey: apiKey
  });

  // Build system prompt with structured sections
  let systemPrompt = `### ROLE
You are "ImIn Bot," the cheeky, confident, and helpful assistant for the ImIn platform. Your mission is to help people with information about events.

### PERSONALITY & TONE
- Friendly, slightly playful, and action-oriented.
- Direct and honest: No "hype," no "fluff," and no corporate jargon.
- If a feature isn't supported, say it straight.
- Language: ALWAYS respond in the same language as the user's last message.

### CONSTRAINTS
- Context: You only see the last 20 messages. If the user refers to something missing, ask for clarification.
- Format: Use short sentences or bullet points. Use hyphens - or dots . instead of markdown. Keep it scannable.`;

  // Add event data section if available
  if (eventInfo) {
    const fromDate = new Date(eventInfo.fromDateTime).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
    const toDate = new Date(eventInfo.toDateTime).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
    
    systemPrompt += `\n\n### EVENT DATA
- Name: ${eventInfo.name}`;
    
    if (eventInfo.description) {
      systemPrompt += `\n- Details: ${eventInfo.description}`;
    }
    
    systemPrompt += `\n- Time: ${fromDate} to ${toDate}`;
    systemPrompt += `\n- Place: ${eventInfo.location}`;
    
    if (eventInfo.ticketUrl) {
      systemPrompt += `\n- Tickets: ${eventInfo.ticketUrl}`;
    }
  }

  // Build messages array for OpenRouter (includes system message)
  // OpenRouter accepts messages with content as string or array format
  const openRouterMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string | Array<{ type: string; text?: string; image_url?: { url: string } }> }> = [
    {
      role: 'system',
      content: systemPrompt,
    },
  ];

  // Add conversation messages (user and assistant only, no system)
  for (const msg of messages) {
    if (msg.role !== 'system') {
      openRouterMessages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content, // Simple string format for text messages
      });
    }
  }

  const model = process.env.OPENROUTER_MODEL || 'anthropic/claude-sonnet-4.5';

  // Log request to OpenRouter
  console.log('[OpenRouter Request]', {
    model,
    messageCount: openRouterMessages.length,
    message: openRouterMessages,
    hasEventInfo: !!eventInfo,
  });

  try {
    // Call OpenRouter API with streaming
    const stream = await openrouter.chat.send({
      model: model,
      messages: openRouterMessages as any,
      stream: true,
    });

    // Collect streamed content
    let content = '';
    for await (const chunk of stream) {
      const chunkContent = chunk.choices[0]?.delta?.content;
      if (chunkContent) {
        content += chunkContent;
      }
    }

    // Log successful response from OpenRouter
    console.log('[OpenRouter Response]', {
      model,
      contentLength: content.length,
      contentPreview: content,
    });

    if (!content) {
      throw new Error('Empty response from OpenRouter');
    }

    return { content };
  } catch (error: any) {
    // Log error response
    console.error('[OpenRouter Error Response]', {
      model,
      error: error.message || 'Unknown error',
      errorDetails: error,
    });
    
    throw new Error(`OpenRouter API error: ${error.message || 'Unknown error'}`);
  }
}
