import { NextRequest, NextResponse } from 'next/server';
import { generateLLMResponse } from '@/lib/services/llmService';
import { conversationMemory } from '@/lib/services/conversationMemoryService';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * POST /api/test/llm
 * Test endpoint for LLM functionality
 * 
 * Body:
 * {
 *   "message": "Your test message",
 *   "chatId": "test-chat-123" (optional, defaults to "test-chat")
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, chatId = 'test-chat' } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    // Check if Gemini API key is configured
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      return NextResponse.json(
        {
          error: 'GEMINI_API_KEY is not configured. Please set it in your environment variables.',
          userMessage: message,
          chatId,
          provider: 'Gemini AI',
        },
        { status: 500 }
      );
    }

    console.log(`[Test API] Processing message for chatId: ${chatId}, using Gemini AI`);

    // Add user message to conversation
    await conversationMemory.addUserMessage(chatId, message);

    // Generate LLM response using Gemini
    const llmResponse = await generateLLMResponse(chatId, message);

    if (llmResponse.error) {
      console.error(`[Test API] Gemini API error: ${llmResponse.error}`);
      return NextResponse.json(
        {
          error: llmResponse.error,
          userMessage: message,
          chatId,
          provider: 'Gemini AI',
        },
        { status: 500 }
      );
    }

    console.log(`[Test API] Successfully received response from Gemini AI for chatId: ${chatId}`);

    // Add assistant response to conversation
    await conversationMemory.addAssistantMessage(chatId, llmResponse.content);

    // Get conversation history for response
    const history = await conversationMemory.getConversationHistory(chatId);

    return NextResponse.json({
      success: true,
      userMessage: message,
      assistantResponse: llmResponse.content,
      chatId,
      provider: 'Gemini AI',
      model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp',
      conversationHistory: history.map((msg) => ({
        role: msg.role,
        content: msg.content.substring(0, 100) + (msg.content.length > 100 ? '...' : ''),
        timestamp: msg.timestamp,
      })),
      messageCount: history.length,
    });
  } catch (error: any) {
    console.error('Error in LLM test endpoint:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/test/llm
 * Get conversation history for a chatId
 * 
 * Query params:
 *   chatId: Chat ID (optional, defaults to "test-chat")
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const chatId = searchParams.get('chatId') || 'test-chat';

    const history = await conversationMemory.getConversationHistory(chatId);
    const stats = await conversationMemory.getStats();

    return NextResponse.json({
      chatId,
      conversationHistory: history.map((msg) => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
      })),
      messageCount: history.length,
      globalStats: stats,
    });
  } catch (error: any) {
    console.error('Error getting conversation history:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/test/llm
 * Clear conversation history for a chatId
 * 
 * Query params:
 *   chatId: Chat ID (optional, defaults to "test-chat")
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const chatId = searchParams.get('chatId') || 'test-chat';

    await conversationMemory.clearConversation(chatId);

    return NextResponse.json({
      success: true,
      message: `Conversation cleared for chatId: ${chatId}`,
      chatId,
    });
  } catch (error: any) {
    console.error('Error clearing conversation:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
