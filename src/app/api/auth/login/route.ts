import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { message: 'Username and password are required' },
        { status: 400 }
      );
    }

    const user = authenticate(username, password);

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid username or password' },
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