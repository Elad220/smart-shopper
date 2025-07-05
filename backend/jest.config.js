module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js', '**/?(*.)+(spec|test).js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js',
    '!src/config/**',
    '!src/test/**',
    '!**/*.config.js',
    '!**/node_modules/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'json', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  setupFilesAfterEnv: ['./jest.setup.js'],
  // Performance and reliability improvements
  maxWorkers: '50%',
  testTimeout: 30000,
  detectOpenHandles: true,
  forceExit: true,
  // Better error reporting
  verbose: true,
  bail: false,
  // Test organization
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/build/'],
  // Mock configuration
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  // Environment variables
  setupFiles: ['<rootDir>/jest.env.js'],
  // Transform and module handling
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  // Test result reporting
  reporters: [
    'default',
    ['jest-html-reporter', {
      pageTitle: 'Backend Test Results',
      outputPath: 'test-results.html',
      includeFailureMsg: true,
      includeSuiteFailure: true
    }]
  ],
  // Collect coverage from all files
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js',
    '!src/config/**',
    '!src/test/**',
    '!**/*.config.js',
    '!**/node_modules/**',
  ],
}; 