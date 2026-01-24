import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';

export const dynamic = 'force-dynamic';

interface PartnerRequestData {
  organization: string;
  email: string;
  annualAttendees: string;
  message?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: PartnerRequestData = await request.json();

    // Validate required fields
    if (!body.organization || !body.email || !body.annualAttendees) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Save partner request to database
    const partnerRequest = await prisma.partnerRequest.create({
      data: {
        organization: body.organization.trim(),
        email: body.email.trim().toLowerCase(),
        annualAttendees: body.annualAttendees.trim(),
        message: body.message?.trim() ? body.message.trim() : null,
      },
    });

    console.log('Partner request saved:', {
      id: partnerRequest.id,
      organization: partnerRequest.organization,
      email: partnerRequest.email,
    });

    return NextResponse.json(
      { 
        success: true,
        message: 'Request submitted successfully. We will contact you soon.',
        id: partnerRequest.id
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error processing partner request:', error);
    
    // Handle unique constraint violations or other database errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A request with this email already exists.' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process request. Please try again later.' },
      { status: 500 }
    );
  }
}
