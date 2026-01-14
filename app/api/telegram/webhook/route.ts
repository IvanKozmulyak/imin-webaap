import { NextRequest, NextResponse } from 'next/server';
import { handleTelegramWebhook } from '@/lib/services/telegramBotService';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * POST /api/telegram/webhook
 * Telegram Bot API webhook endpoint
 * Receives updates from Telegram when events occur (new members, messages, etc.)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Log the update for debugging
    console.log('Telegram webhook received:', JSON.stringify(body, null, 2));
    
    // Handle the webhook update
    await handleTelegramWebhook(body);
    
    // Always return 200 OK to acknowledge receipt
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Error handling Telegram webhook:', error);
    // Still return 200 to prevent Telegram from retrying
    return NextResponse.json({ ok: false, error: error.message }, { status: 200 });
  }
}

/**
 * GET /api/telegram/webhook
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    message: 'Telegram webhook endpoint is active'
  });
}
