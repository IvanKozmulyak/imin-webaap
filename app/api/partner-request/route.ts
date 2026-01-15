import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';

export const dynamic = 'force-dynamic';

interface PartnerRequestData {
  name: string;
  email: string;
  organization: string;
  phone?: string;
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: PartnerRequestData = await request.json();

    // Validate required fields
    if (!body.name || !body.email || !body.organization || !body.message) {
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
        name: body.name.trim(),
        email: body.email.trim().toLowerCase(),
        organization: body.organization.trim(),
        phone: body.phone?.trim() || null,
        message: body.message.trim(),
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
