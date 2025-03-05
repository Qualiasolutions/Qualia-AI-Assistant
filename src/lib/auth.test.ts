import { registerUser, authenticateUser, verifyToken, validateSession, isAdmin } from './auth';
import { sign } from 'jsonwebtoken';

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mock-token'),
  verify: jest.fn().mockImplementation((token) => {
    if (token === 'valid-token') {
      return { username: 'testuser', isAdmin: false };
    } else if (token === 'admin-token') {
      return { username: 'admin', isAdmin: true };
    } else {
      throw new Error('Invalid token');
    }
  })
}));

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn().mockImplementation(async (password, hashedValue) => {
    // For testing, we'll consider 'correct-password' as the valid password
    return password === 'correct-password';
  })
}));

describe('Auth Library', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('registerUser', () => {
    test('should register a new user successfully', async () => {
      const result = await registerUser('newuser', 'password123');
      
      expect(result).toEqual({ username: 'newuser', isAdmin: false });
      expect(hash).toHaveBeenCalledWith('password123', 10);
    });
    
    test('should return null for empty username or password', async () => {
      const result1 = await registerUser('', 'password123');
      const result2 = await registerUser('username', '');
      const result3 = await registerUser('   ', 'password123');
      
      expect(result1).toBeNull();
      expect(result2).toBeNull();
      expect(result3).toBeNull();
    });
    
    test('should throw error if user already exists', async () => {
      // Register once
      await registerUser('existinguser', 'password123');
      
      // Try to register again with the same username
      await expect(registerUser('existinguser', 'newpassword'))
        .rejects
        .toThrow('User already exists');
    });
    
    test('should set isAdmin flag for admin username', async () => {
      // Mock environment variable
      const originalEnv = process.env.ADMIN_USERNAME;
      process.env.ADMIN_USERNAME = 'adminuser';
      
      const result = await registerUser('adminuser', 'adminpass');
      
      expect(result).toEqual({ username: 'adminuser', isAdmin: true });
      
      // Restore environment
      process.env.ADMIN_USERNAME = originalEnv;
    });
  });
  
  describe('authenticateUser', () => {
    test('should authenticate existing user with correct password', async () => {
      // Register a user first
      await registerUser('existinguser', 'correct-password');
      
      // Now authenticate
      const result = await authenticateUser('existinguser', 'correct-password');
      
      expect(result).toEqual({
        user: { username: 'existinguser', isAdmin: false },
        token: 'mock-token'
      });
      expect(sign).toHaveBeenCalled();
    });
    
    test('should auto-register new users', async () => {
      const result = await authenticateUser('newuser', 'password123');
      
      expect(result).toEqual({
        user: { username: 'newuser', isAdmin: false },
        token: 'mock-token'
      });
    });
    
    test('should return null for empty username or password', async () => {
      const result1 = await authenticateUser('', 'password123');
      const result2 = await authenticateUser('username', '');
      
      expect(result1).toBeNull();
      expect(result2).toBeNull();
    });
    
    test('should return null for incorrect password', async () => {
      // Register a user first
      await registerUser('user1', 'correct-password');
      await registerUser('user2', 'correct-password');
      
      // Try to authenticate with wrong password
      const result = await authenticateUser('user1', 'wrong-password');
      
      expect(result).toBeNull();
    });
    
    test('should handle errors gracefully', async () => {
      // Mock bcrypt.compare to throw an error
      (hash as jest.Mock).mockRejectedValueOnce(new Error('Mocked error'));
      
      const result = await authenticateUser('erroruser', 'password');
      
      expect(result).toBeNull();
    });
  });
  
  describe('verifyToken', () => {
    test('should verify a valid token', () => {
      const result = verifyToken('valid-token');
      
      expect(result).toEqual({ username: 'testuser', isAdmin: false });
    });
    
    test('should verify an admin token', () => {
      const result = verifyToken('admin-token');
      
      expect(result).toEqual({ username: 'admin', isAdmin: true });
    });
    
    test('should return null for invalid token', () => {
      const result = verifyToken('invalid-token');
      
      expect(result).toBeNull();
    });
  });
  
  describe('validateSession', () => {
    test('should return true for valid token', () => {
      const result = validateSession('valid-token');
      
      expect(result).toBe(true);
    });
    
    test('should return false for invalid token', () => {
      const result = validateSession('invalid-token');
      
      expect(result).toBe(false);
    });
    
    test('should return false for null token', () => {
      const result = validateSession(null);
      
      expect(result).toBe(false);
    });
  });
  
  describe('isAdmin', () => {
    test('should return true for admin user', () => {
      const result = isAdmin({ username: 'admin', isAdmin: true });
      
      expect(result).toBe(true);
    });
    
    test('should return false for non-admin user', () => {
      const result = isAdmin({ username: 'user', isAdmin: false });
      
      expect(result).toBe(false);
    });
    
    test('should return false for null user', () => {
      const result = isAdmin(null);
      
      expect(result).toBe(false);
    });
  });
}); 