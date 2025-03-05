// This file provides TypeScript declarations for Jest globals
// It helps fix linter errors in test files

declare global {
  // Jest globals
  const describe: (name: string, fn: () => void) => void;
  const test: (name: string, fn: (done?: jest.DoneCallback) => void | Promise<void>, timeout?: number) => void;
  const it: typeof test;
  const expect: jest.Expect;
  const beforeEach: (fn: () => void | Promise<void>) => void;
  const afterEach: (fn: () => void | Promise<void>) => void;
  const beforeAll: (fn: () => void | Promise<void>) => void;
  const afterAll: (fn: () => void | Promise<void>) => void;
  const jest: jest.Jest;
}

// Jest namespace
declare namespace jest {
  interface Jest {
    fn: <T extends (...args: any[]) => any>(implementation?: T) => MockInstance<ReturnType<T>, Parameters<T>>;
    mock: (moduleName: string, factory?: any, options?: any) => Jest;
    clearAllMocks: () => Jest;
    resetAllMocks: () => Jest;
    restoreAllMocks: () => Jest;
    spyOn: <T extends {}, M extends keyof T>(object: T, method: M) => MockInstance<ReturnType<T[M]>, Parameters<T[M]>>;
    requireActual: <T = any>(moduleName: string) => T;
    requireMock: <T = any>(moduleName: string) => T;
  }

  interface MockInstance<TReturn, TArgs extends any[]> {
    mockImplementation: (fn: (...args: TArgs) => TReturn) => this;
    mockImplementationOnce: (fn: (...args: TArgs) => TReturn) => this;
    mockReturnValue: (value: TReturn) => this;
    mockReturnValueOnce: (value: TReturn) => this;
    mockResolvedValue: (value: Awaited<TReturn>) => this;
    mockResolvedValueOnce: (value: Awaited<TReturn>) => this;
    mockRejectedValue: (value: any) => this;
    mockRejectedValueOnce: (value: any) => this;
    mockReturnThis: () => this;
    mockClear: () => this;
    mockReset: () => this;
    mockRestore: () => this;
    getMockName: () => string;
    mockName: (name: string) => this;
    mock: {
      calls: TArgs[];
      results: { type: 'return' | 'throw'; value: any }[];
      instances: any[];
      contexts: any[];
      lastCall: TArgs;
    };
  }

  interface Expect {
    <T = any>(actual: T): Matchers<T>;
    extend: (matchers: Record<string, any>) => void;
    anything: () => any;
    any: (constructor: any) => any;
    arrayContaining: <T = any>(sample: Array<T>) => any;
    objectContaining: <T = any>(sample: Partial<T>) => any;
    stringContaining: (sample: string) => any;
    stringMatching: (sample: string | RegExp) => any;
  }

  interface Matchers<R> {
    toBe: (expected: any) => R;
    toEqual: (expected: any) => R;
    toStrictEqual: (expected: any) => R;
    toBeNull: () => R;
    toBeUndefined: () => R;
    toBeDefined: () => R;
    toBeTruthy: () => R;
    toBeFalsy: () => R;
    toBeGreaterThan: (expected: number | bigint) => R;
    toBeGreaterThanOrEqual: (expected: number | bigint) => R;
    toBeLessThan: (expected: number | bigint) => R;
    toBeLessThanOrEqual: (expected: number | bigint) => R;
    toBeNaN: () => R;
    toBeCloseTo: (expected: number, precision?: number) => R;
    toMatch: (expected: string | RegExp) => R;
    toContain: (expected: any) => R;
    toContainEqual: (expected: any) => R;
    toHaveLength: (expected: number) => R;
    toHaveProperty: (path: string, value?: any) => R;
    toBeInstanceOf: (expected: any) => R;
    toThrow: (expected?: string | Error | RegExp) => R;
    toThrowError: (expected?: string | Error | RegExp) => R;
    not: Matchers<R>;
    resolves: Matchers<Promise<R>>;
    rejects: Matchers<Promise<R>>;
    toHaveBeenCalled: () => R;
    toHaveBeenCalledTimes: (expected: number) => R;
    toHaveBeenCalledWith: (...args: any[]) => R;
    toHaveBeenLastCalledWith: (...args: any[]) => R;
    toHaveBeenNthCalledWith: (nth: number, ...args: any[]) => R;
    toHaveReturned: () => R;
    toHaveReturnedTimes: (expected: number) => R;
    toHaveReturnedWith: (expected: any) => R;
    toHaveLastReturnedWith: (expected: any) => R;
    toHaveNthReturnedWith: (nth: number, expected: any) => R;
  }

  type DoneCallback = (error?: any) => void;
}

export {}; 