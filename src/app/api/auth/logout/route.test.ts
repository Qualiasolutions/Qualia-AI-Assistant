import { NextRequest } from 'next/server';
import { POST } from './route';

describe('Logout API Route', () => {
  // Helper to create a mock request
  function createMockRequest(): NextRequest {
    return {} as NextRequest;
  }
  
  test('should return 200 and clear the auth cookie', async () => {
    const request = createMockRequest();
    
    // Mock cookie deletion
    const mockDelete = jest.fn();
    const mockCookies = { delete: mockDelete };
    
    // Mock NextResponse.json to return our custom response
    const originalJson = NextResponse.json;
    NextResponse.json = jest.fn().mockImplementation((body, options) => {
      return {
        cookies: mockCookies,
        status: options?.status || 200,
        json: async () => body
      };
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data).toEqual({ message: 'Logged out successfully' });
    expect(mockDelete).toHaveBeenCalledWith('authToken');
    
    // Restore the original implementation
    NextResponse.json = originalJson;
  });
  
  test('should return 500 when an error occurs', async () => {
    const request = createMockRequest();
    
    // Force an error by making NextResponse.json throw
    const originalJson = NextResponse.json;
    const mockError = new Error('Unexpected error');
    
    NextResponse.json = jest.fn().mockImplementationOnce(() => {
      throw mockError;
    }).mockImplementationOnce((body, options) => {
      return {
        status: options?.status || 200,
        json: async () => body
      };
    });
    
    // Mock console.error to prevent test output pollution
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(500);
    expect(data).toEqual({ message: 'An error occurred during logout' });
    expect(console.error).toHaveBeenCalledWith('Logout error:', mockError);
    
    // Restore the original implementations
    NextResponse.json = originalJson;
    console.error = originalConsoleError;
  });
});

// Mock NextResponse
import { NextResponse } from 'next/server';
jest.mock('next/server', () => {
  const actual = jest.requireActual('next/server');
  return {
    ...actual,
    NextResponse: {
      ...actual.NextResponse,
      json: jest.fn()
    }
  };
}); 