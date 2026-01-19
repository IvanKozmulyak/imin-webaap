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
  // Build system prompt with structured sections
  let systemPrompt = `### ROLE
You are "ImIn Bot," the cheeky, confident, and helpful assistant for the ImIn platform. Your mission is to help people find event buddies and organize small groups (max 5 people).

### PERSONALITY & TONE
- Friendly, slightly playful, and action-oriented.
- Direct and honest: No "hype," no "fluff," and no corporate jargon.
- If a feature isn't supported, say it straight.
- Language: ALWAYS respond in the same language as the user's last message.

### CONSTRAINTS
- Context: You only see the last 20 messages. If the user refers to something missing, ask for clarification.
- Format: Use short sentences or bullet points. Keep it scannable.
- Focus: Your primary goal is to get people to the event together. Don't get distracted by off-topic chatter (like singing songs) for too long—pivot back to the event.`;

  // Add event data section if available
  if (eventInfo) {
    const eventDate = new Date(eventInfo.eventDateTime).toLocaleString('en-US', {
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
    
    systemPrompt += `\n- Time: ${eventDate}`;
    systemPrompt += `\n- Place: ${eventInfo.location}`;
    
    if (eventInfo.ticketUrl) {
      systemPrompt += `\n- Tickets: ${eventInfo.ticketUrl}`;
    }
  }

  // Add response structure section
  systemPrompt += `\n\n### RESPONSE STRUCTURE
1. Answer the question directly and briefly.
2. If the user seems lonely or undecided, nudge them toward the "Small Group" (max 5) philosophy.
3. End with a light "Action Hint" (e.g., "Grab a ticket before the group fills up," or "Want to see who else is going?").`;

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
  
  // Combine system prompt with conversation history
  const fullPrompt = systemPrompt + '\n\n### CONVERSATION HISTORY\n' + prompt;
  // Log request to Gemini
  console.log('[Gemini Request]', {
    model,
    messageCount: messages.length,
    promptLength: fullPrompt.length,
    promptPreview: fullPrompt.substring(0, 500) + (fullPrompt.length > 500 ? '...' : ''),
    hasEventInfo: !!eventInfo,
  });

  try {
    // Call the model using the SDK with full prompt (system + conversation)
    const response = await genai.models.generateContent({
      model,
      contents: {
        parts: [{ text: fullPrompt }],
      },
      config: {
        temperature: 0.7,
        maxOutputTokens: 500,
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

    // // Remove role prefixes that the LLM might include in its response
    // // Common prefixes: "Assistant: ", "Asistente: ", "助手: ", etc.
    // content = content.trim();
    // const rolePrefixes = [
    //   /^Assistant:\s*/i,
    //   /^Asistente:\s*/i,
    //   /^助手:\s*/i,
    //   /^アシスタント:\s*/i,
    //   /^Помощник:\s*/i,
    //   /^Aide:\s*/i,
    //   /^Assistent:\s*/i,
    //   /^User:\s*/i,
    //   /^Usuario:\s*/i,
    //   /^System:\s*/i,
    // ];
    
    // for (const prefix of rolePrefixes) {
    //   content = content.replace(prefix, '');
    // }
    // content = content.trim();

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
