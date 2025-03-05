import { NextRequest } from 'next/server';
import { POST } from './route';
import { authenticateUser } from '@/lib/auth';

// Mock the auth library
jest.mock('@/lib/auth', () => ({
  authenticateUser: jest.fn()
}));

describe('Login API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  // Helper to create a mock request
  function createMockRequest(body: any): NextRequest {
    return {
      json: jest.fn().mockResolvedValue(body)
    } as unknown as NextRequest;
  }
  
  test('should return 400 when username is missing', async () => {
    const request = createMockRequest({ password: 'password123' });
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(400);
    expect(data).toEqual({ message: 'Username and password are required' });
    expect(authenticateUser).not.toHaveBeenCalled();
  });
  
  test('should return 400 when password is missing', async () => {
    const request = createMockRequest({ username: 'testuser' });
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(400);
    expect(data).toEqual({ message: 'Username and password are required' });
    expect(authenticateUser).not.toHaveBeenCalled();
  });
  
  test('should return 401 when authentication fails', async () => {
    const request = createMockRequest({ username: 'testuser', password: 'wrongpassword' });
    
    // Mock authentication failure
    (authenticateUser as jest.Mock).mockResolvedValue(null);
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(401);
    expect(data).toEqual({ message: 'Invalid username or password' });
    expect(authenticateUser).toHaveBeenCalledWith('testuser', 'wrongpassword');
  });
  
  test('should return 200 with user and token when authentication succeeds', async () => {
    const request = createMockRequest({ username: 'testuser', password: 'correctpassword' });
    
    // Mock successful authentication
    const mockUser = { username: 'testuser', isAdmin: false };
    const mockToken = 'jwt-token-123';
    (authenticateUser as jest.Mock).mockResolvedValue({ user: mockUser, token: mockToken });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data).toEqual({ user: mockUser, token: mockToken });
    expect(authenticateUser).toHaveBeenCalledWith('testuser', 'correctpassword');
  });
  
  test('should return 500 when an error occurs', async () => {
    const request = createMockRequest({ username: 'testuser', password: 'password123' });
    
    // Mock an error during authentication
    (authenticateUser as jest.Mock).mockRejectedValue(new Error('Database error'));
    
    // Mock console.error to prevent test output pollution
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(500);
    expect(data).toEqual({ message: 'An error occurred during login' });
    expect(authenticateUser).toHaveBeenCalledWith('testuser', 'password123');
    expect(console.error).toHaveBeenCalled();
    
    // Restore console.error
    console.error = originalConsoleError;
  });
  
  test('should handle JSON parsing errors', async () => {
    // Create a request that throws an error when json() is called
    const request = {
      json: jest.fn().mockRejectedValue(new Error('Invalid JSON'))
    } as unknown as NextRequest;
    
    // Mock console.error to prevent test output pollution
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(500);
    expect(data).toEqual({ message: 'An error occurred during login' });
    expect(authenticateUser).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
    
    // Restore console.error
    console.error = originalConsoleError;
  });
}); 