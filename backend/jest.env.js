// Jest environment setup file
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-testing';
process.env.MONGODB_URI = 'mongodb://localhost:27017/smart-shopper-test';
process.env.PORT = '3001';
process.env.LOG_LEVEL = 'error'; // Reduce logging during tests
process.env.ENCRYPTION_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'; // 64-character hex string for testing

// Suppress specific console warnings during tests
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  // Filter out specific warnings that are expected during tests
  const message = args[0];
  if (typeof message === 'string') {
    if (message.includes('DeprecationWarning') || 
        message.includes('ExperimentalWarning') ||
        message.includes('UnhandledPromiseRejectionWarning')) {
      return;
    }
  }
  originalConsoleWarn(...args);
};

module.exports = {};