import { User } from '@/types';

export function authenticate(username: string, password: string): User | null {
  // In a production app, this would use a secure authentication system
  // For this demo, we're using hardcoded credentials from .env
  if (
    username === process.env.AUTH_USERNAME &&
    password === process.env.AUTH_PASSWORD
  ) {
    return {
      username,
      isAdmin: false,
    };
  }

  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    return {
      username,
      isAdmin: true,
    };
  }

  return null;
}

export function validateSession(user: User | null): boolean {
  return user !== null;
}

export function isAdmin(user: User | null): boolean {
  return user?.isAdmin === true;
} 