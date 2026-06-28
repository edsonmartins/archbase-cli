/**
 * Vitest Setup File
 *
 * Global setup and configuration for the test suite.
 */

import { expect } from 'vitest';

// Make this file a module
export {};

// Custom matcher: lightweight heuristic that generated output looks like TypeScript
expect.extend({
  toBeValidTypeScript(received: string) {
    const hasInterface = received.includes('interface ');
    const hasTypes = received.includes(': ');
    const hasExport = received.includes('export ');

    const pass = hasInterface || hasTypes || hasExport;

    return {
      pass,
      message: () =>
        pass
          ? `Expected code not to be valid TypeScript`
          : `Expected code to be valid TypeScript with interfaces, types, or exports`,
    };
  },
});

// Type augmentation for the custom matcher
declare module 'vitest' {
  interface Assertion<T = any> {
    toBeValidTypeScript(): T;
  }
  interface AsymmetricMatchersContaining {
    toBeValidTypeScript(): void;
  }
}

// Suppress noisy console output during tests unless VERBOSE is set
if (!process.env.VERBOSE) {
  const originalConsoleLog = console.log;
  const originalConsoleWarn = console.warn;
  const originalConsoleError = console.error;

  console.log = (...args: any[]) => {
    if (args[0]?.includes?.('TEST:')) {
      originalConsoleLog(...args);
    }
  };

  console.warn = (...args: any[]) => {
    if (args[0]?.includes?.('TEST:')) {
      originalConsoleWarn(...args);
    }
  };

  console.error = (...args: any[]) => {
    if (args[0]?.includes?.('TEST:')) {
      originalConsoleError(...args);
    }
  };
}
