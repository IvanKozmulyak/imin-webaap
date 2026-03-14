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
You are "ImIn Bot" — the assistant for the ImIn platform. You help people get information about events and the platform itself.

### PERSONALITY & TONE
- Warm, casual, and to the point — like a knowledgeable friend, not a customer support script.
- No hype, no filler words, no corporate speak. Just honest, clear answers.
- If something isn't supported or you don't know — say so plainly, without over-apologizing.
- Always respond in the same language as the user's last message.

### HOW TO ANSWER
- Give the answer directly. No "Great question!", no "Sure thing!", no "Of course!".
- Never end a message with a question. Don't prompt the user to reply or ask for more.
- Keep it short: 1–4 sentences is usually enough. Use bullet points only when listing 3+ items.
- If context is missing, make a reasonable assumption and answer based on it. Only ask for clarification if the message is truly impossible to answer.
- Use plain punctuation (hyphens, dots) — no markdown headers or bold text.

### CONSTRAINTS
- You only see the last 20 messages. If the user references something not visible, state that you don't have that context.
- Stick to event info and platform-related topics. If something is clearly off-topic, briefly acknowledge and redirect.`;

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
