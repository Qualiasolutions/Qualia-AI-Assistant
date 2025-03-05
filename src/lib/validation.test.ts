import {
  isString,
  isNumber,
  isBoolean,
  isObject,
  isArray,
  isDate,
  isOneOf,
  hasRequiredProperties,
  isValidMessage,
  isValidUser,
  safeJsonParse,
} from './validation';

describe('Validation Utilities', () => {
  describe('isString', () => {
    it('should return true for strings', () => {
      expect(isString('')).toBe(true);
      expect(isString('hello')).toBe(true);
    });

    it('should return false for non-strings', () => {
      expect(isString(123)).toBe(false);
      expect(isString(null)).toBe(false);
      expect(isString(undefined)).toBe(false);
      expect(isString({})).toBe(false);
      expect(isString([])).toBe(false);
    });
  });

  describe('isNumber', () => {
    it('should return true for numbers', () => {
      expect(isNumber(0)).toBe(true);
      expect(isNumber(123)).toBe(true);
      expect(isNumber(-123)).toBe(true);
      expect(isNumber(1.23)).toBe(true);
    });

    it('should return false for NaN', () => {
      expect(isNumber(NaN)).toBe(false);
    });

    it('should return false for non-numbers', () => {
      expect(isNumber('123')).toBe(false);
      expect(isNumber(null)).toBe(false);
      expect(isNumber(undefined)).toBe(false);
      expect(isNumber({})).toBe(false);
      expect(isNumber([])).toBe(false);
    });
  });

  describe('isBoolean', () => {
    it('should return true for booleans', () => {
      expect(isBoolean(true)).toBe(true);
      expect(isBoolean(false)).toBe(true);
    });

    it('should return false for non-booleans', () => {
      expect(isBoolean(0)).toBe(false);
      expect(isBoolean(1)).toBe(false);
      expect(isBoolean('true')).toBe(false);
      expect(isBoolean(null)).toBe(false);
      expect(isBoolean(undefined)).toBe(false);
      expect(isBoolean({})).toBe(false);
      expect(isBoolean([])).toBe(false);
    });
  });

  describe('isObject', () => {
    it('should return true for objects', () => {
      expect(isObject({})).toBe(true);
      expect(isObject({ a: 1 })).toBe(true);
    });

    it('should return false for arrays', () => {
      expect(isObject([])).toBe(false);
    });

    it('should return false for null', () => {
      expect(isObject(null)).toBe(false);
    });

    it('should return false for non-objects', () => {
      expect(isObject(123)).toBe(false);
      expect(isObject('hello')).toBe(false);
      expect(isObject(true)).toBe(false);
      expect(isObject(undefined)).toBe(false);
    });
  });

  describe('isArray', () => {
    it('should return true for arrays', () => {
      expect(isArray([])).toBe(true);
      expect(isArray([1, 2, 3])).toBe(true);
    });

    it('should return false for non-arrays', () => {
      expect(isArray({})).toBe(false);
      expect(isArray(123)).toBe(false);
      expect(isArray('hello')).toBe(false);
      expect(isArray(true)).toBe(false);
      expect(isArray(null)).toBe(false);
      expect(isArray(undefined)).toBe(false);
    });

    it('should validate array items with a validator function', () => {
      expect(isArray([1, 2, 3], isNumber)).toBe(true);
      expect(isArray(['a', 'b', 'c'], isString)).toBe(true);
      expect(isArray([1, '2', 3], isNumber)).toBe(false);
    });
  });

  describe('isDate', () => {
    it('should return true for valid Date objects', () => {
      expect(isDate(new Date())).toBe(true);
      expect(isDate(new Date('2023-01-01'))).toBe(true);
    });

    it('should return false for invalid Date objects', () => {
      expect(isDate(new Date('invalid'))).toBe(false);
    });

    it('should return false for non-Date objects', () => {
      expect(isDate({})).toBe(false);
      expect(isDate(123)).toBe(false);
      expect(isDate('2023-01-01')).toBe(false);
      expect(isDate(null)).toBe(false);
      expect(isDate(undefined)).toBe(false);
    });
  });

  describe('isOneOf', () => {
    it('should return true for values in the allowed list', () => {
      expect(isOneOf('a', ['a', 'b', 'c'] as const)).toBe(true);
      expect(isOneOf(1, [1, 2, 3] as const)).toBe(true);
    });

    it('should return false for values not in the allowed list', () => {
      expect(isOneOf('d', ['a', 'b', 'c'] as const)).toBe(false);
      expect(isOneOf(4, [1, 2, 3] as const)).toBe(false);
    });

    it('should return false for values of wrong type', () => {
      expect(isOneOf(1, ['a', 'b', 'c'] as const)).toBe(false);
      expect(isOneOf('1', [1, 2, 3] as const)).toBe(false);
    });
  });

  describe('hasRequiredProperties', () => {
    it('should return true for objects with all required properties', () => {
      expect(hasRequiredProperties({ a: 1, b: 2 }, ['a', 'b'])).toBe(true);
      expect(hasRequiredProperties({ a: 1, b: 2, c: 3 }, ['a', 'b'])).toBe(true);
    });

    it('should return false for objects missing required properties', () => {
      expect(hasRequiredProperties({ a: 1 }, ['a', 'b'])).toBe(false);
      expect(hasRequiredProperties({}, ['a'])).toBe(false);
    });

    it('should return false for non-objects', () => {
      expect(hasRequiredProperties(null, ['a'])).toBe(false);
      expect(hasRequiredProperties(123, ['a'])).toBe(false);
      expect(hasRequiredProperties('hello', ['a'])).toBe(false);
      expect(hasRequiredProperties([], ['a'])).toBe(false);
    });
  });

  describe('isValidMessage', () => {
    it('should return true for valid message objects', () => {
      const validMessage = {
        id: '123',
        role: 'user',
        content: 'Hello',
        timestamp: new Date(),
      };
      expect(isValidMessage(validMessage)).toBe(true);
    });

    it('should return true for messages with string timestamps', () => {
      const validMessage = {
        id: '123',
        role: 'user',
        content: 'Hello',
        timestamp: '2023-01-01T00:00:00.000Z',
      };
      expect(isValidMessage(validMessage)).toBe(true);
    });

    it('should return false for messages missing required properties', () => {
      expect(isValidMessage({ id: '123', role: 'user', content: 'Hello' })).toBe(false);
      expect(isValidMessage({ id: '123', role: 'user', timestamp: new Date() })).toBe(false);
      expect(isValidMessage({ id: '123', content: 'Hello', timestamp: new Date() })).toBe(false);
      expect(isValidMessage({ role: 'user', content: 'Hello', timestamp: new Date() })).toBe(false);
    });

    it('should return false for messages with invalid property types', () => {
      expect(isValidMessage({ id: 123, role: 'user', content: 'Hello', timestamp: new Date() })).toBe(false);
      expect(isValidMessage({ id: '123', role: 123, content: 'Hello', timestamp: new Date() })).toBe(false);
      expect(isValidMessage({ id: '123', role: 'user', content: 123, timestamp: new Date() })).toBe(false);
      expect(isValidMessage({ id: '123', role: 'user', content: 'Hello', timestamp: 'invalid-date' })).toBe(false);
    });
  });

  describe('isValidUser', () => {
    it('should return true for valid user objects', () => {
      const validUser = {
        username: 'john',
        isAdmin: false,
      };
      expect(isValidUser(validUser)).toBe(true);
    });

    it('should return false for users missing required properties', () => {
      expect(isValidUser({ username: 'john' })).toBe(false);
      expect(isValidUser({ isAdmin: false })).toBe(false);
    });

    it('should return false for users with invalid property types', () => {
      expect(isValidUser({ username: 123, isAdmin: false })).toBe(false);
      expect(isValidUser({ username: 'john', isAdmin: 'false' })).toBe(false);
    });
  });

  describe('safeJsonParse', () => {
    it('should parse valid JSON and validate it', () => {
      const json = '{"name":"John","age":30}';
      const validator = (value: unknown): value is { name: string; age: number } => {
        return (
          isObject(value) &&
          'name' in value && isString(value.name) &&
          'age' in value && isNumber(value.age)
        );
      };
      expect(safeJsonParse(json, validator)).toEqual({ name: 'John', age: 30 });
    });

    it('should return null for invalid JSON', () => {
      const json = '{invalid json}';
      const validator = (value: unknown): value is { name: string } => {
        return isObject(value) && 'name' in value && isString(value.name);
      };
      expect(safeJsonParse(json, validator)).toBeNull();
    });

    it('should return null for JSON that fails validation', () => {
      const json = '{"name":123}';
      const validator = (value: unknown): value is { name: string } => {
        return isObject(value) && 'name' in value && isString(value.name);
      };
      expect(safeJsonParse(json, validator)).toBeNull();
    });
  });
}); 