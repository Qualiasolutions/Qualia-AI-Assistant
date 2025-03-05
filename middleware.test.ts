import { NextRequest, NextResponse } from 'next/server';
import { middleware } from './middleware';
import { verifyToken } from './src/lib/auth';

// Mock the auth library
jest.mock('./src/lib/auth', () => ({
  verifyToken: jest.fn()
}));

// Mock NextResponse
jest.mock('next/server', () => {
  const originalModule = jest.requireActual('next/server');
  return {
    ...originalModule,
    NextResponse: {
      next: jest.fn().mockReturnValue({ type: 'next' }),
      redirect: jest.fn().mockImplementation((url) => ({ 
        type: 'redirect', 
        url: url.toString() 
      }))
    }
  };
});

describe('Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  // Helper to create mock request
  function createMockRequest(path: string, token?: string): NextRequest {
    const headers = new Headers();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    const cookies = {
      get: jest.fn().mockImplementation((name) => {
        if (name === 'authToken' && token) {
          return { value: token };
        }
        return undefined;
      })
    };
    
    return {
      nextUrl: {
        pathname: path,
      },
      cookies,
      headers,
      url: `http://localhost${path}`
    } as unknown as NextRequest;
  }
  
  test('should allow access to public paths without token', () => {
    const publicPaths = ['/auth', '/api/auth/login', '/api/auth/register'];
    
    publicPaths.forEach(path => {
      const request = createMockRequest(path);
      const response = middleware(request);
      
      expect(NextResponse.next).toHaveBeenCalled();
      expect(response).toEqual({ type: 'next' });
      expect(verifyToken).not.toHaveBeenCalled();
      
      jest.clearAllMocks();
    });
  });
  
  test('should redirect to /auth when no token is provided for protected paths', () => {
    const protectedPaths = ['/dashboard', '/api/data', '/settings'];
    
    protectedPaths.forEach(path => {
      const request = createMockRequest(path);
      const response = middleware(request);
      
      expect(NextResponse.redirect).toHaveBeenCalledWith(expect.objectContaining({
        pathname: '/auth'
      }));
      expect(response).toEqual({
        type: 'redirect',
        url: `http://localhost/auth`
      });
      
      jest.clearAllMocks();
    });
  });
  
  test('should redirect to /auth when token is invalid', () => {
    // Mock verifyToken to return null (invalid token)
    (verifyToken as jest.Mock).mockReturnValue(null);
    
    const request = createMockRequest('/dashboard', 'invalid-token');
    const response = middleware(request);
    
    expect(verifyToken).toHaveBeenCalledWith('invalid-token');
    expect(NextResponse.redirect).toHaveBeenCalledWith(expect.objectContaining({
      pathname: '/auth'
    }));
    expect(response).toEqual({
      type: 'redirect',
      url: `http://localhost/auth`
    });
  });
  
  test('should allow access when token is valid', () => {
    // Mock verifyToken to return a valid user
    (verifyToken as jest.Mock).mockReturnValue({ username: 'testuser', isAdmin: false });
    
    const request = createMockRequest('/dashboard', 'valid-token');
    const response = middleware(request);
    
    expect(verifyToken).toHaveBeenCalledWith('valid-token');
    expect(NextResponse.next).toHaveBeenCalled();
    expect(response).toEqual({ type: 'next' });
  });
  
  test('should get token from cookies if available', () => {
    // Mock verifyToken to return a valid user
    (verifyToken as jest.Mock).mockReturnValue({ username: 'testuser', isAdmin: false });
    
    const request = createMockRequest('/dashboard', 'cookie-token');
    const response = middleware(request);
    
    expect(request.cookies.get).toHaveBeenCalledWith('authToken');
    expect(verifyToken).toHaveBeenCalledWith('cookie-token');
    expect(NextResponse.next).toHaveBeenCalled();
  });
  
  test('should get token from Authorization header if cookie is not available', () => {
    // Mock verifyToken to return a valid user
    (verifyToken as jest.Mock).mockReturnValue({ username: 'testuser', isAdmin: false });
    
    // Create a request with Authorization header but no cookie
    const headers = new Headers();
    headers.set('Authorization', 'Bearer header-token');
    
    const cookies = {
      get: jest.fn().mockReturnValue(undefined)
    };
    
    const request = {
      nextUrl: {
        pathname: '/dashboard',
      },
      cookies,
      headers,
      url: 'http://localhost/dashboard'
    } as unknown as NextRequest;
    
    const response = middleware(request);
    
    expect(request.cookies.get).toHaveBeenCalledWith('authToken');
    expect(verifyToken).toHaveBeenCalledWith('header-token');
    expect(NextResponse.next).toHaveBeenCalled();
  });
}); 