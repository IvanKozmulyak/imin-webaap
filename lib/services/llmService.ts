/**
 * LLM Service
 * Handles communication with LLM APIs for generating responses
 */

import { GoogleGenAI } from '@google/genai';
import { Pinecone } from '@pinecone-database/pinecone';
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
    const pineconeKey = process.env.PINECONE_API_KEY;
    const pineconeAssistantName = process.env.PINECONE_ASSISTANT_NAME;
    if (pineconeKey && pineconeAssistantName) {
      return await generatePineconeResponse(messages, pineconeKey, pineconeAssistantName, eventInfo);
    }
    
    // Try Gemini first (default)
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      return await generateGeminiResponse(messages, geminiKey, eventInfo);
    }

    // Try Eden AI as fallback
    const edenAiKey = process.env.EDENAI_API_KEY;
    if (edenAiKey) {
      return await generateEdenAIResponse(messages, edenAiKey, eventInfo);
    }

    return {
      content: '',
      error: 'No LLM API key configured. Please set GEMINI_API_KEY, EDENAI_API_KEY, or PINECONE_API_KEY in environment variables.',
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
- Format: Use short sentences or bullet points. Use hyphens - or dots . instead of markdown. Keep it scannable.`;

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
    promptPreview: fullPrompt,
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
      contentPreview: content,
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

/**
 * Generate response using Eden AI API
 * Uses V3 chat completions endpoint
 */
async function generateEdenAIResponse(
  messages: Array<{ role: string; content: string }>,
  apiKey: string,
  eventInfo?: EventInfo | null
): Promise<LLMResponse> {
  // Build system prompt with structured sections
  let systemPrompt = `### ROLE
You are "ImIn Bot," the cheeky, confident, and helpful assistant for the ImIn platform. Your mission is to help people find event buddies and organize small groups (max 5 people).

### PERSONALITY & TONE
- Friendly, slightly playful, and action-oriented.
- Direct and honest: No "hype," no "fluff," and no corporate jargon.
- If a feature isn't supported, say it straight.
- Language: ALWAYS respond in the same language as the user's last message.

### CONSTRAINTS
- NO MARKDOWN: Do not use asterisks, hashes, or brackets. Use plain text only.
- Context: You only see the last 20 messages. If the user refers to something missing, ask for clarification.
- Format: Use short sentences or bullet points. Use hyphens - or dots . instead of markdown. Keep it scannable.`;

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

  // Build messages array for Eden AI (includes system message)
  const edenMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    {
      role: 'system',
      content: systemPrompt,
    },
  ];

  // Add conversation messages (user and assistant only, no system)
  for (const msg of messages) {
    if (msg.role !== 'system') {
      edenMessages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      });
    }
  }

  const model = process.env.EDENAI_MODEL || 'gpt-4';
  const url = 'https://api.edenai.run/v3/llm/chat/completions';

  // Log request to Eden AI
  console.log('[Eden AI Request]', {
    model,
    messageCount: edenMessages.length,
    message: edenMessages,
    hasEventInfo: !!eventInfo,
  });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: edenMessages,
        stream: false,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText };
      }
      
      // Log error response
      console.error('[Eden AI Error Response]', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });
      
      throw new Error(`Eden AI API error: ${errorData.error?.message || JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    
    // Eden AI V3 response structure: data.choices[0].message.content
    let content = '';
    
    if (data.choices && data.choices.length > 0) {
      const choice = data.choices[0];
      if (choice.message && choice.message.content) {
        content = choice.message.content;
      }
    }
    
    // Fallback: try alternative response structures
    if (!content && data.output) {
      const output = data.output;
      if (output.choices && output.choices.length > 0) {
        content = output.choices[0].message?.content || '';
      }
    }

    // Log successful response from Eden AI
    console.log('[Eden AI Response]', {
      model,
      contentLength: content.length,
      contentPreview: content.substring(0, 200) + (content.length > 200 ? '...' : ''),
    });

    if (!content) {
      // Log response structure for debugging
      console.error('[Eden AI Response Structure]', {
        responseKeys: Object.keys(data),
        responsePreview: JSON.stringify(data).substring(0, 500),
      });
      throw new Error('Empty response from Eden AI - check response structure in logs');
    }

    return { content };
  } catch (error: any) {
    // Log error response
    console.error('[Eden AI Error Response]', {
      model,
      error: error.message || 'Unknown error',
      errorDetails: error,
    });
    
    throw new Error(`Eden AI API error: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Generate response using Pinecone Assistant API
 * Uses Pinecone's Assistant chat endpoint
 */
async function generatePineconeResponse(
  messages: Array<{ role: string; content: string }>,
  apiKey: string,
  assistantName: string,
  eventInfo?: EventInfo | null
): Promise<LLMResponse> {
  // Build system prompt with structured sections
  let systemPrompt = `### ROLE
You are "ImIn Bot," the cheeky, confident, and helpful assistant for the ImIn platform. Your mission is to help people find event buddies and organize small groups (max 5 people).

### PERSONALITY & TONE
- Friendly, slightly playful, and action-oriented.
- Direct and honest: No "hype," no "fluff," and no corporate jargon.
- If a feature isn't supported, say it straight.
- Language: ALWAYS respond in the same language as the user's last message.

### CONSTRAINTS
- NO MARKDOWN: Do not use asterisks, hashes, or brackets. Use plain text only.
- Context: You only see the last 20 messages. If the user refers to something missing, ask for clarification.
- Format: Use short sentences or bullet points. Use hyphens - or dots . instead of markdown. Keep it scannable.`;

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

  // Build messages array for Pinecone (includes system message)
  const pineconeMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    {
      role: 'system',
      content: systemPrompt,
    },
  ];

  // Add conversation messages (user and assistant only, no system)
  for (const msg of messages) {
    if (msg.role !== 'system') {
      pineconeMessages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      });
    }
  }

  const model = process.env.PINECONE_MODEL || 'gpt-4o';
  const pc = new Pinecone({ apiKey });
  const assistant = pc.assistant(assistantName);

  // Log request to Pinecone
  console.log('[Pinecone Request]', {
    assistantName,
    model,
    messageCount: pineconeMessages.length,
    message: pineconeMessages,
    hasEventInfo: !!eventInfo,
  });

  try {
    const response = await assistant.chat({
      messages: pineconeMessages,
    });

    // Pinecone response structure: response.message.content
    const content = response.message?.content || '';

    // Log successful response from Pinecone
    console.log('[Pinecone Response]', {
      assistantName,
      model,
      contentLength: content.length,
      contentPreview: content,
      finishReason: response.finishReason,
      citations: response.citations?.length || 0,
    });

    if (!content) {
      // Log response structure for debugging
      console.error('[Pinecone Response Structure]', {
        responseKeys: Object.keys(response),
        responsePreview: JSON.stringify(response).substring(0, 500),
      });
      throw new Error('Empty response from Pinecone - check response structure in logs');
    }

    return { content };
  } catch (error: any) {
    // Log error response
    console.error('[Pinecone Error Response]', {
      assistantName,
      model,
      error: error.message || 'Unknown error',
      errorDetails: error,
    });
    
    throw new Error(`Pinecone API error: ${error.message || 'Unknown error'}`);
  }
}
