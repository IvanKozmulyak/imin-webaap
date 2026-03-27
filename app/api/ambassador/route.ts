import { NextRequest, NextResponse } from 'next/server';
import { getAmbassador, getOrCreateAmbassador, getAmbassadorDashboard, verifyAmbassador, checkAmbassadorQualification, generateReferralCode } from '@/lib/services/ambassadorService';

/**
 * GET /api/ambassador - Get ambassador info
 * Query params: telegramId (required)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const telegramId = searchParams.get('telegramId');
    const action = searchParams.get('action');

    if (!telegramId) {
      return NextResponse.json({ error: 'telegramId is required' }, { status: 400 });
    }

    if (action === 'check') {
      // Check if user qualifies as ambassador
      const qualification = await checkAmbassadorQualification(telegramId);
      return NextResponse.json(qualification);
    }

    if (action === 'referral') {
      // Generate referral code
      const code = generateReferralCode(telegramId);
      return NextResponse.json({ referralCode: code });
    }

    // Default: get ambassador dashboard
    const dashboard = await getAmbassadorDashboard(telegramId);
    
    if (!dashboard) {
      return NextResponse.json({ 
        isAmbassador: false,
        message: 'You are not an ambassador yet. Join events to qualify!' 
      });
    }

    return NextResponse.json({
      isAmbassador: true,
      ...dashboard,
    });
  } catch (error: any) {
    console.error('Error in ambassador GET:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/ambassador - Create or update ambassador
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { telegramId, telegramUsername, firstName, action } = body;

    if (!telegramId) {
      return NextResponse.json({ error: 'telegramId is required' }, { status: 400 });
    }

    // Admin actions
    if (action === 'verify') {
      const { badge } = body;
      const ambassador = await verifyAmbassador(telegramId, badge);
      return NextResponse.json({ success: true, ambassador });
    }

    // Default: get or create ambassador
    const ambassador = await getOrCreateAmbassador({
      telegramId,
      telegramUsername,
      firstName,
    });

    return NextResponse.json({ success: true, ambassador });
  } catch (error: any) {
    console.error('Error in ambassador POST:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}