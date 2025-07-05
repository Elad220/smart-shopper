const { setupTestEnvironment } = require('./src/test/utils');

// Set up test environment
setupTestEnvironment();

// Increase timeout for all tests
jest.setTimeout(30000);

// Mock environment variables
process.env.JWT_SECRET = 'test-secret';
process.env.MONGODB_URI = 'mongodb://localhost:27017/smart-shopper-test';
process.env.NODE_ENV = 'test';

// Global test utilities
global.testUtils = require('./src/test/utils');

// Console override for cleaner test output
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.error = (...args) => {
    // Only show actual errors, not expected ones during tests
    if (args[0] && typeof args[0] === 'string' && args[0].includes('Warning:')) {
      return;
    }
    originalConsoleError(...args);
  };
  
  console.warn = (...args) => {
    // Only show actual warnings, not expected ones during tests
    if (args[0] && typeof args[0] === 'string' && args[0].includes('Warning:')) {
      return;
    }
    originalConsoleWarn(...args);
  };
});

afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Global error handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
}); 