/**
 * Type validation utilities for runtime type checking
 */

/**
 * Validates that a value is a string
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Validates that a value is a number
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * Validates that a value is a boolean
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/**
 * Validates that a value is an object
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Validates that a value is an array
 */
export function isArray<T>(value: unknown, validator?: (item: unknown) => item is T): value is T[] {
  if (!Array.isArray(value)) return false;
  if (!validator) return true;
  return value.every(validator);
}

/**
 * Validates that a value is a Date
 */
export function isDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

/**
 * Validates that a value matches one of the allowed values
 */
export function isOneOf<T extends string | number>(value: unknown, allowedValues: readonly T[]): value is T {
  return allowedValues.includes(value as T);
}

/**
 * Validates that an object has the required properties
 */
export function hasRequiredProperties<T extends Record<string, unknown>>(
  obj: unknown, 
  requiredProps: string[]
): obj is T {
  if (!isObject(obj)) return false;
  return requiredProps.every(prop => prop in obj);
}

/**
 * Validates a message object
 */
export function isValidMessage(message: unknown): boolean {
  if (!isObject(message)) return false;
  
  return (
    'id' in message && isString(message.id) &&
    'role' in message && isString(message.role) &&
    'content' in message && isString(message.content) &&
    'timestamp' in message && (
      isDate(message.timestamp) || 
      (isString(message.timestamp) && !isNaN(new Date(message.timestamp).getTime()))
    )
  );
}

/**
 * Validates a user object
 */
export function isValidUser(user: unknown): boolean {
  if (!isObject(user)) return false;
  
  return (
    'username' in user && isString(user.username) &&
    'isAdmin' in user && isBoolean(user.isAdmin)
  );
}

/**
 * Type-safe parsing of JSON
 */
export function safeJsonParse<T>(json: string, validator: (value: unknown) => value is T): T | null {
  try {
    const parsed = JSON.parse(json);
    return validator(parsed) ? parsed : null;
  } catch (error) {
    console.error('JSON parse error:', error);
    return null;
  }
}

/**
 * Type-safe access to localStorage
 */
export function getFromLocalStorage<T>(key: string, validator: (value: unknown) => value is T): T | null {
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;
    return safeJsonParse(item, validator);
  } catch (error) {
    console.error(`Error getting ${key} from localStorage:`, error);
    return null;
  }
}

/**
 * Type-safe setting of localStorage
 */
export function setToLocalStorage<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error setting ${key} in localStorage:`, error);
    return false;
  }
} 