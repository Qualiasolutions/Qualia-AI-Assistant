import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST() {
  try {
    // Since we're using JWT, we'll just clear the token cookie
    // The actual invalidation of the token would be handled server-side
    // with a token blacklist in a production environment
    
    const response = NextResponse.json(
      { message: 'Logged out successfully' },
      { status: 200 }
    );
    
    // Clear the auth token cookie
    response.cookies.delete('authToken');
    
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { message: 'An error occurred during logout' },
      { status: 500 }
    );
  }
} 