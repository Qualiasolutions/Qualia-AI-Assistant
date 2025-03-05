import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './src/lib/auth';

// List of paths that don't require authentication
const publicPaths = ['/auth', '/api/auth/login', '/api/auth/register'];

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Check if the path requires authentication
  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  if (isPublicPath) {
    return NextResponse.next();
  }

  // Check for auth token in cookies or headers
  const token = request.cookies.get('authToken')?.value ||
    request.headers.get('Authorization')?.split(' ')[1];

  if (!token) {
    // Redirect to login if no token is found
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  // Verify the token
  const user = verifyToken(token);
  if (!user) {
    // Redirect to login if token is invalid
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public folder)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|images/|public/).*)',
  ],
}; 