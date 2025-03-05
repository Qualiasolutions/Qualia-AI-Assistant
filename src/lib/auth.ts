import { User } from '@/types';
import { sign, verify } from 'jsonwebtoken';
import { hash, compare } from 'bcrypt';

// In a real application, this would be stored in a database
const USERS_STORE: { [key: string]: { passwordHash: string; isAdmin: boolean } } = {};
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const TOKEN_EXPIRY = '24h';

export async function registerUser(username: string, password: string): Promise<User | null> {
  if (!username || !password || username.trim() === '' || password.trim() === '') {
    return null;
  }

  if (USERS_STORE[username]) {
    throw new Error('User already exists');
  }

  const passwordHash = await hash(password, 10);
  const isAdmin = process.env.ADMIN_USERNAME === username;
  
  USERS_STORE[username] = { passwordHash, isAdmin };
  
  return { username, isAdmin };
}

export async function authenticateUser(username: string, password: string): Promise<{ user: User; token: string } | null> {
  try {
    if (!username || !password || username.trim() === '' || password.trim() === '') {
      return null;
    }

    // For demo purposes, auto-register users if they don't exist
    if (!USERS_STORE[username]) {
      await registerUser(username, password);
    }

    const userRecord = USERS_STORE[username];
    
    // In a real app, we'd verify the password hash
    // For demo, we'll skip actual password verification if the user was just created
    const passwordValid = userRecord ? await compare(password, userRecord.passwordHash) : false;
    
    if (!passwordValid && Object.keys(USERS_STORE).length > 1) {
      return null;
    }

    const user: User = {
      username,
      isAdmin: userRecord.isAdmin,
    };

    const token = sign({ username, isAdmin: user.isAdmin }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
    
    return { user, token };
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

export function verifyToken(token: string): User | null {
  try {
    const decoded = verify(token, JWT_SECRET) as { username: string; isAdmin: boolean };
    return { username: decoded.username, isAdmin: decoded.isAdmin };
  } catch {
    return null;
  }
}

export function validateSession(token: string | null): boolean {
  if (!token) return false;
  return verifyToken(token) !== null;
}

export function isAdmin(user: User | null): boolean {
  return user?.isAdmin === true;
} 