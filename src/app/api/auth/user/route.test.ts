import { NextRequest } from 'next/server';
import { GET } from './route';
import { verifyToken, validateSession } from '@/lib/auth';

// Mock the auth library
jest.mock('@/lib/auth', () => ({
  verifyToken: jest.fn(),
  validateSession: jest.fn()
}));

describe('User API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  // Helper to create a mock request
  function createMockRequest(token?: string): NextRequest {
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
      cookies,
      headers
    } as unknown as NextRequest;
  }
  
  test('should return 401 when no token is provided', async () => {
    const request = createMockRequest();
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(401);
    expect(data).toEqual({ message: 'Not authenticated' });
    expect(validateSession).not.toHaveBeenCalled();
    expect(verifyToken).not.toHaveBeenCalled();
  });
  
  test('should return 401 when token is invalid', async () => {
    const request = createMockRequest('invalid-token');
    
    // Mock token validation failure
    (validateSession as jest.Mock).mockReturnValue(false);
    
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(401);
    expect(data).toEqual({ message: 'Invalid or expired token' });
    expect(validateSession).toHaveBeenCalledWith('invalid-token');
    expect(verifyToken).not.toHaveBeenCalled();
  });
  
  test('should return 401 when verifyToken returns null', async () => {
    const request = createMockRequest('valid-but-corrupt-token');
    
    // Mock token validation success but verification failure
    (validateSession as jest.Mock).mockReturnValue(true);
    (verifyToken as jest.Mock).mockReturnValue(null);
    
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(401);
    expect(data).toEqual({ message: 'Invalid token' });
    expect(validateSession).toHaveBeenCalledWith('valid-but-corrupt-token');
    expect(verifyToken).toHaveBeenCalledWith('valid-but-corrupt-token');
  });
  
  test('should return 200 with user data when token is valid', async () => {
    const request = createMockRequest('valid-token');
    
    // Mock successful token validation and verification
    const mockUser = { username: 'testuser', isAdmin: false };
    (validateSession as jest.Mock).mockReturnValue(true);
    (verifyToken as jest.Mock).mockReturnValue(mockUser);
    
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data).toEqual({ user: mockUser });
    expect(validateSession).toHaveBeenCalledWith('valid-token');
    expect(verifyToken).toHaveBeenCalledWith('valid-token');
  });
  
  test('should get token from Authorization header if cookie is not available', async () => {
    // Create a request with Authorization header but no cookie
    const headers = new Headers();
    headers.set('Authorization', 'Bearer header-token');
    
    const cookies = {
      get: jest.fn().mockReturnValue(undefined)
    };
    
    const request = {
      cookies,
      headers
    } as unknown as NextRequest;
    
    // Mock successful token validation and verification
    const mockUser = { username: 'testuser', isAdmin: false };
    (validateSession as jest.Mock).mockReturnValue(true);
    (verifyToken as jest.Mock).mockReturnValue(mockUser);
    
    await GET(request);
    
    expect(cookies.get).toHaveBeenCalledWith('authToken');
    expect(validateSession).toHaveBeenCalledWith('header-token');
  });
  
  test('should return 500 when an error occurs', async () => {
    const request = createMockRequest('valid-token');
    
    // Mock an error during validation
    (validateSession as jest.Mock).mockImplementation(() => {
      throw new Error('Unexpected error');
    });
    
    // Mock console.error to prevent test output pollution
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(500);
    expect(data).toEqual({ message: 'An error occurred while getting user information' });
    expect(console.error).toHaveBeenCalled();
    
    // Restore console.error
    console.error = originalConsoleError;
  });
}); 