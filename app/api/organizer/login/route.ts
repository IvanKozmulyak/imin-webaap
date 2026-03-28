import { NextRequest, NextResponse } from 'next/server';
import { authenticateOrganizer } from '@/lib/services/organizerService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    const organizer = await authenticateOrganizer(email, password);
    
    if (!organizer) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Return a simple token (in production, use JWT)
    return NextResponse.json({
      success: true,
      organizer: {
        id: organizer.id,
        email: organizer.email,
        name: organizer.name,
        organization: organizer.organization,
      },
      apiKey: organizer.apiKey,
    });
  } catch (error) {
    console.error('Organizer login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}