import { NextRequest } from 'next/server';
import { POST } from './route';
import { registerUser, authenticateUser } from '@/lib/auth';

// Mock the auth library
jest.mock('@/lib/auth', () => ({
  registerUser: jest.fn(),
  authenticateUser: jest.fn()
}));

describe('Register API Route', () => {
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
    expect(registerUser).not.toHaveBeenCalled();
  });
  
  test('should return 400 when password is missing', async () => {
    const request = createMockRequest({ username: 'testuser' });
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(400);
    expect(data).toEqual({ message: 'Username and password are required' });
    expect(registerUser).not.toHaveBeenCalled();
  });
  
  test('should return 400 when registration fails', async () => {
    const request = createMockRequest({ username: 'testuser', password: 'password123' });
    
    // Mock registration failure
    (registerUser as jest.Mock).mockResolvedValue(null);
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(400);
    expect(data).toEqual({ message: 'Registration failed' });
    expect(registerUser).toHaveBeenCalledWith('testuser', 'password123');
    expect(authenticateUser).not.toHaveBeenCalled();
  });
  
  test('should return 500 when registration succeeds but authentication fails', async () => {
    const request = createMockRequest({ username: 'testuser', password: 'password123' });
    
    // Mock registration success but authentication failure
    const mockUser = { username: 'testuser', isAdmin: false };
    (registerUser as jest.Mock).mockResolvedValue(mockUser);
    (authenticateUser as jest.Mock).mockResolvedValue(null);
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(500);
    expect(data).toEqual({ message: 'Registration successful, but login failed' });
    expect(registerUser).toHaveBeenCalledWith('testuser', 'password123');
    expect(authenticateUser).toHaveBeenCalledWith('testuser', 'password123');
  });
  
  test('should return 201 with user and token when registration and authentication succeed', async () => {
    const request = createMockRequest({ username: 'testuser', password: 'password123' });
    
    // Mock successful registration and authentication
    const mockUser = { username: 'testuser', isAdmin: false };
    const mockToken = 'jwt-token-123';
    (registerUser as jest.Mock).mockResolvedValue(mockUser);
    (authenticateUser as jest.Mock).mockResolvedValue({ user: mockUser, token: mockToken });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(201);
    expect(data).toEqual({ user: mockUser, token: mockToken });
    expect(registerUser).toHaveBeenCalledWith('testuser', 'password123');
    expect(authenticateUser).toHaveBeenCalledWith('testuser', 'password123');
  });
  
  test('should return 409 when username already exists', async () => {
    const request = createMockRequest({ username: 'existinguser', password: 'password123' });
    
    // Mock user already exists error
    (registerUser as jest.Mock).mockRejectedValue(new Error('User already exists'));
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(409);
    expect(data).toEqual({ message: 'Username already taken' });
    expect(registerUser).toHaveBeenCalledWith('existinguser', 'password123');
  });
  
  test('should return 500 when an unexpected error occurs', async () => {
    const request = createMockRequest({ username: 'testuser', password: 'password123' });
    
    // Mock an unexpected error
    (registerUser as jest.Mock).mockRejectedValue(new Error('Database connection failed'));
    
    // Mock console.error to prevent test output pollution
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(500);
    expect(data).toEqual({ message: 'An error occurred during registration' });
    expect(registerUser).toHaveBeenCalledWith('testuser', 'password123');
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
    expect(data).toEqual({ message: 'An error occurred during registration' });
    expect(registerUser).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
    
    // Restore console.error
    console.error = originalConsoleError;
  });
}); 