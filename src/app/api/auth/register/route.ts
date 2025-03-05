import { NextRequest, NextResponse } from 'next/server';
import { registerUser, authenticateUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { message: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Attempt to register the user
    const user = await registerUser(username, password);

    if (!user) {
      return NextResponse.json(
        { message: 'Registration failed' },
        { status: 400 }
      );
    }

    // Automatically log in the user after successful registration
    const authResult = await authenticateUser(username, password);

    if (!authResult) {
      return NextResponse.json(
        { message: 'Registration successful, but login failed' },
        { status: 500 }
      );
    }

    const { token } = authResult;

    // Return the token to the client
    return NextResponse.json(
      { user, token },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    
    // Check if it's a known error
    if (error instanceof Error && error.message === 'User already exists') {
      return NextResponse.json(
        { message: 'Username already taken' },
        { status: 409 }  // Conflict
      );
    }
    
    return NextResponse.json(
      { message: 'An error occurred during registration' },
      { status: 500 }
    );
  }
} 