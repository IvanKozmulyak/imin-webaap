import { NextResponse } from 'next/server';
import { triggerCountdownDrip } from '@/lib/services/countdownDripService';

/**
 * POST /api/countdown/drip
 * Triggers the countdown drip campaign to send T-7, T-3, T-1 messages
 */
export async function POST() {
  try {
    const result = await triggerCountdownDrip();
    
    return NextResponse.json({
      success: result.success,
      message: `Processed ${result.stats.processed} registrations, sent ${result.stats.sent} messages, ${result.stats.errors} errors`,
      stats: result.stats,
    });
  } catch (error: any) {
    console.error('Countdown drip error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process countdown messages' },
      { status: 500 }
    );
  }
}