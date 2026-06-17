import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';

export const dynamic = 'force-dynamic';

interface AccessRequestData {
  name: string;
  email: string;
  city: string;
  link: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: AccessRequestData = await request.json();

    const name = body.name?.trim();
    const email = body.email?.trim();
    const city = body.city?.trim();
    const link = body.link?.trim();

    // Validate required fields
    if (!name || !email || !city || !link) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Save access request to database
    const accessRequest = await prisma.accessRequest.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        city,
        link,
      },
    });

    console.log('Access request saved:', {
      id: accessRequest.id,
      name: accessRequest.name,
      email: accessRequest.email,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Error processing access request:', error);

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
