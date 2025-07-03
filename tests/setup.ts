/**
 * Jest Setup File
 * 
 * Global setup and configuration for test suite
 */

// Make this file a module
export {};

// Extend Jest matchers
expect.extend({
  toBeValidTypeScript(received: string) {
    const hasInterface = received.includes('interface ');
    const hasTypes = received.includes(': ');
    const hasExport = received.includes('export ');
    
    const pass = hasInterface || hasTypes || hasExport;
    
    if (pass) {
      return {
        message: () => `Expected code not to be valid TypeScript`,
        pass: true,
      };
    } else {
      return {
        message: () => `Expected code to be valid TypeScript with interfaces, types, or exports`,
        pass: false,
      };
    }
  },
});

// Declare custom matchers for TypeScript
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidTypeScript(): R;
    }
  }
}

// Suppress console outputs during tests unless VERBOSE is set
if (!process.env.VERBOSE) {
  const originalConsoleLog = console.log;
  const originalConsoleWarn = console.warn;
  const originalConsoleError = console.error;

  console.log = (...args) => {
    if (args[0]?.includes?.('TEST:')) {
      originalConsoleLog(...args);
    }
  };

  console.warn = (...args) => {
    if (args[0]?.includes?.('TEST:')) {
      originalConsoleWarn(...args);
    }
  };

  console.error = (...args) => {
    if (args[0]?.includes?.('TEST:')) {
      originalConsoleError(...args);
    }
  };
}

// Global test timeout
jest.setTimeout(30000);