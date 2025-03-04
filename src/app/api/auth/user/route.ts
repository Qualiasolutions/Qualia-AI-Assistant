import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get user from cookie
    const userCookie = request.cookies.get('user')?.value;
    
    if (!userCookie) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const user = JSON.parse(userCookie);
    
    // Validate session
    if (!validateSession(user)) {
      return NextResponse.json(
        { message: 'Invalid session' },
        { status: 401 }
      );
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { message: 'An error occurred while getting user information' },
      { status: 500 }
    );
  }
} 