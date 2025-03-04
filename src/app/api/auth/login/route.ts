import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json();

    if (!username) {
      return NextResponse.json(
        { message: 'Username is required' },
        { status: 400 }
      );
    }

    const user = authenticate(username);

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid username' },
        { status: 401 }
      );
    }

    // In a production app, we would use a secure HTTP-only cookie
    // and proper session management. For this demo, we'll use a simple
    // cookie to store the user information.
    return NextResponse.json(
      { user },
      {
        status: 200,
        headers: {
          'Set-Cookie': `user=${JSON.stringify(user)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${
            60 * 60 * 24 * 7 // 1 week
          }`,
        },
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'An error occurred during login' },
      { status: 500 }
    );
  }
} 