import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, validateSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get auth token from cookies or Authorization header
    const token = 
      request.cookies.get('authToken')?.value ||
      request.headers.get('Authorization')?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Validate token
    if (!validateSession(token)) {
      return NextResponse.json(
        { message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Decode the token to get user information
    const user = verifyToken(token);
    
    if (!user) {
      return NextResponse.json(
        { message: 'Invalid token' },
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