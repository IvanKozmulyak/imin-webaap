/**
 * LLM Service
 * Handles communication with LLM APIs for generating responses
 */

import { GoogleGenAI } from '@google/genai';
import { conversationMemory, Message } from './conversationMemoryService';

export interface LLMResponse {
  content: string;
  error?: string;
}

export interface EventInfo {
  name: string;
  description?: string | null;
  eventDateTime: Date;
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

    // Try Gemini first (default)
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      return await generateGeminiResponse(messages, geminiKey, eventInfo);
    }

    return {
      content: '',
      error: 'No LLM API key configured. Please set GEMINI_API_KEY in environment variables.',
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
 * Generate response using Google Gemini API with @google/genai SDK
 * Concatenates all messages into a single prompt string
 * System prompt is sent directly via systemInstruction
 */
async function generateGeminiResponse(
  messages: Array<{ role: string; content: string }>,
  apiKey: string,
  eventInfo?: EventInfo | null
): Promise<LLMResponse> {
  // Initialize the Gemini client
  const genai = new GoogleGenAI({ apiKey });

  // System prompt (not stored in DB, sent directly to LLM)
  let systemPrompt = `You are ImIn Bot, the assistant for ImIn.

ImIn helps people find event buddies and join small groups (up to 5) so they don't go alone. It focuses on good vibes, clear rules, and mixed-gender balance.

Answer briefly and clearly. No hype, no fluff. Use short sentences or bullets. If something isn't supported, say it directly. Speak like a friendly, cheeky guide—confident, slightly playful, and nudging users toward action. End with a light action hint when useful.

Positioning: Small groups. Real connections. Better events.

You receive only the last 20 messages of the conversation.
Treat them as the full available context.
Do not assume access to earlier messages.
If the user refers to missing context, ask a clarifying question.
Answer concisely and consistently. Answer in the same language as the user's last message.`;

  // Build event context if available
  if (eventInfo) {
    const eventDate = new Date(eventInfo.eventDateTime).toLocaleString();
    const eventContext = `\n\nEvent Information:\n` +
      `- Event Name: ${eventInfo.name}\n` +
      (eventInfo.description ? `- Description: ${eventInfo.description}\n` : '') +
      `- Date & Time: ${eventDate}\n` +
      `- Location: ${eventInfo.location}\n` +
      (eventInfo.ticketUrl ? `- Ticket URL: ${eventInfo.ticketUrl}\n` : '') +
      `\nYou are helping users who are attending this event. Use this information to provide relevant and helpful responses.`;
    
    systemPrompt += eventContext;
  }

  // Concatenate conversation messages (user and assistant only, no system)
  const prompt = messages
    .filter((msg) => msg.role !== 'system') // Filter out any system messages
    .map((msg) => {
      // Format each message with role prefix
      const rolePrefix = msg.role === 'user' 
        ? 'User: ' 
        : 'Assistant: ';
      
      return `${rolePrefix}${msg.content}`;
    })
    .join('\n\n');

  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';

  // Log request to Gemini
  console.log('[Gemini Request]', {
    model,
    messageCount: messages.length,
    promptLength: prompt.length,
    promptPreview: prompt.substring(0, 300) + (prompt.length > 300 ? '...' : ''),
    hasSystemInstruction: true,
    hasEventInfo: !!eventInfo,
  });

  try {
    // Call the model using the SDK with system instruction and conversation prompt
    // systemInstruction can be a string directly
    const response = await genai.models.generateContent({
      model,
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        temperature: 0.7,
        maxOutputTokens: 500,
        systemInstruction: systemPrompt,
      },
    });

    // Get the text response
    // The SDK response structure: response.candidates[0].content.parts[0].text
    let content = '';
    
    // Access response through candidates array (standard SDK structure)
    if (response.candidates && response.candidates.length > 0) {
      const candidate = response.candidates[0];
      if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
        const part = candidate.content.parts[0];
        content = part.text || '';
      }
    }
    
    // Fallback: try direct text property access (some SDK versions)
    if (!content) {
      const responseAny = response as any;
      if (responseAny.text !== undefined) {
        const textValue = responseAny.text;
        content = typeof textValue === 'function' ? textValue() : String(textValue || '');
      }
    }

    // Remove role prefixes that the LLM might include in its response
    // Common prefixes: "Assistant: ", "Asistente: ", "助手: ", etc.
    content = content.trim();
    const rolePrefixes = [
      /^Assistant:\s*/i,
      /^Asistente:\s*/i,
      /^助手:\s*/i,
      /^アシスタント:\s*/i,
      /^Помощник:\s*/i,
      /^Aide:\s*/i,
      /^Assistent:\s*/i,
      /^User:\s*/i,
      /^Usuario:\s*/i,
      /^System:\s*/i,
    ];
    
    for (const prefix of rolePrefixes) {
      content = content.replace(prefix, '');
    }
    content = content.trim();

    // Log successful response from Gemini
    console.log('[Gemini Response]', {
      model,
      contentLength: content.length,
      contentPreview: content.substring(0, 200) + (content.length > 200 ? '...' : ''),
      hasCandidates: !!(response.candidates && response.candidates.length > 0),
    });

    if (!content) {
      // Log response structure for debugging
      console.error('[Gemini Response Structure]', {
        responseKeys: Object.keys(response),
        candidates: response.candidates ? response.candidates.length : 0,
        responsePreview: JSON.stringify(response).substring(0, 500),
      });
      throw new Error('Empty response from Gemini - check response structure in logs');
    }

    return { content };
  } catch (error: any) {
    // Log error response
    console.error('[Gemini Error Response]', {
      model,
      error: error.message || 'Unknown error',
      errorDetails: error,
    });
    
    throw new Error(`Gemini API error: ${error.message || 'Unknown error'}`);
  }
}
