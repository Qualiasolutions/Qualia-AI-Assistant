import { User } from '@/types';

export function authenticate(username: string): User | null {
  // In a production app, this would use a secure authentication system
  // For this demo, we're using simple username validation
  // Only validate that username isn't empty
  if (!username || username.trim() === '') {
    return null;
  }

  // Check if user is admin (optional admin functionality)
  if (process.env.ADMIN_USERNAME && username === process.env.ADMIN_USERNAME) {
    return {
      username,
      isAdmin: true,
    };
  }

  // Regular user
  return {
    username,
    isAdmin: false,
  };
}

export function validateSession(user: User | null): boolean {
  return user !== null;
}

export function isAdmin(user: User | null): boolean {
  return user?.isAdmin === true;
} 