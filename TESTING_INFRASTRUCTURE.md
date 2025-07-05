# Testing Infrastructure

This document outlines the comprehensive testing infrastructure implemented for the Smart Shopper application, including best practices, utilities, and guidelines for writing maintainable tests.

## Overview

The testing infrastructure has been significantly enhanced to provide:
- **Robust testing environment** with proper setup/teardown
- **Comprehensive test utilities** for common patterns
- **Performance optimizations** for faster test execution
- **Better coverage reporting** with detailed metrics
- **CI/CD ready configuration** for automated testing
- **Consistent testing patterns** across frontend and backend

## Frontend Testing (Vitest + React Testing Library)

### Configuration

The frontend uses **Vitest** with **React Testing Library** for comprehensive component and integration testing.

**Key Configuration Files:**
- `frontend/vitest.config.ts` - Main Vitest configuration
- `frontend/src/test/setup.ts` - Global test setup and mocks

### Features

- **JSDoc Environment** - Simulates browser environment for component testing
- **Global Mocks** - Pre-configured mocks for common browser APIs
- **Coverage Reporting** - Detailed coverage with 80% thresholds
- **Performance Optimizations** - Parallel test execution with worker pools
- **Enhanced Error Reporting** - Verbose reporting with JSON and HTML outputs

### Testing Scripts

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests in CI mode
npm run test:ci

# Debug tests
npm run test:debug
```

### Global Mocks Available

- `ResizeObserver` - For components using resize observation
- `IntersectionObserver` - For components using intersection observation
- `window.matchMedia` - For responsive component testing
- `localStorage` and `sessionStorage` - For storage testing
- `fetch` - For API call testing
- `window.alert`, `window.confirm`, `window.prompt` - For user interaction testing

### Best Practices

1. **Use data-testid attributes** for reliable element selection
2. **Test user interactions** rather than implementation details
3. **Mock external dependencies** appropriately
4. **Test both success and error scenarios**
5. **Use semantic queries** (getByRole, getByLabelText, etc.)

## Backend Testing (Jest + Supertest)

### Configuration

The backend uses **Jest** with **Supertest** for comprehensive API and integration testing.

**Key Configuration Files:**
- `backend/jest.config.js` - Main Jest configuration
- `backend/jest.setup.js` - Global test setup
- `backend/jest.env.js` - Environment variables setup
- `backend/babel.config.js` - Babel configuration for ES6+ support
- `backend/src/test/utils.js` - Comprehensive test utilities

### Features

- **Database Testing** - Automated setup/teardown of test database
- **API Testing** - Complete request/response testing with Supertest
- **Mock Utilities** - Factories for creating test data
- **Performance Testing** - Built-in performance measurement utilities
- **Error Simulation** - Utilities for testing error scenarios
- **Coverage Reporting** - Detailed coverage with 80% thresholds

### Testing Scripts

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run tests in CI mode
npm run test:ci

# Debug tests
npm run test:debug

# Run integration tests only
npm run test:integration

# Run unit tests only
npm run test:unit
```

### Test Utilities

The `backend/src/test/utils.js` file provides extensive utilities:

#### Database Utilities
- `connectTestDB()` - Connect to test database
- `disconnectTestDB()` - Disconnect and cleanup
- `clearTestDB()` - Clear all test data
- `cleanupTestData()` - Clean specific collections

#### Mock Data Factories
- `createMockUser(overrides)` - Generate mock user data
- `createMockShoppingList(userId, overrides)` - Generate mock shopping list
- `createMockItem(overrides)` - Generate mock shopping item

#### Test Creation Utilities
- `createTestUser(userData)` - Create user in test database
- `createAuthenticatedUser(userData)` - Create user and return auth token
- `createTestShoppingList(userId, listData)` - Create shopping list with items

#### API Testing Utilities
- `expectValidationError(res, message)` - Assert validation errors
- `expectUnauthorizedError(res)` - Assert unauthorized responses
- `expectSuccessResponse(res, data)` - Assert successful responses
- `expectCreatedResponse(res, data)` - Assert creation responses
- `getAuthHeader(token)` - Generate authorization headers

#### Advanced Utilities
- `expectObjectToHaveValidId(obj)` - Validate MongoDB ObjectIds
- `expectValidTimestamp(timestamp)` - Validate timestamp formats
- `measureExecutionTime(fn)` - Measure function execution time
- `simulateNetworkError()` - Create network error for testing
- `simulateTimeoutError()` - Create timeout error for testing

### Best Practices

1. **Use test utilities** for consistent test patterns
2. **Test both success and error paths** for all endpoints
3. **Validate response structure** and data types
4. **Test authentication and authorization** thoroughly
5. **Use proper database setup/teardown** to avoid test pollution
6. **Test performance** for critical operations
7. **Mock external services** appropriately

## Makefile Integration

The enhanced Makefile provides comprehensive testing commands:

```bash
# Install all dependencies
make install

# Run all tests (frontend and backend in parallel)
make test

# Run tests with coverage
make test-coverage

# Run tests in watch mode
make test-watch

# Run tests in CI mode
make test-ci

# Lint all code
make lint

# Fix linting issues
make fix

# Clean build artifacts
make clean

# Development workflow
make dev

# Production build
make build
```

## CI/CD Integration

The testing infrastructure is designed for seamless CI/CD integration:

### GitHub Actions Example

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      mongodb:
        image: mongo:latest
        ports:
          - 27017:27017
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: make install
      - run: make test-ci
      - uses: codecov/codecov-action@v2
        with:
          files: ./backend/coverage/lcov.info,./frontend/coverage/lcov.info
```

## Coverage Reporting

Both frontend and backend are configured with comprehensive coverage reporting:

### Coverage Thresholds
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

### Coverage Reports
- **Text**: Console output during test runs
- **HTML**: Detailed browsable reports
- **LCOV**: For CI/CD integration
- **JSON**: For programmatic analysis

### Coverage Files
- `backend/coverage/` - Backend coverage reports
- `frontend/coverage/` - Frontend coverage reports
- `test-results.html` - Combined test results

## Performance Optimizations

### Frontend (Vitest)
- **Parallel execution** with worker pools
- **Optimized thread management** (1-4 threads)
- **Efficient mocking** with automatic cleanup
- **Smart test discovery** with include/exclude patterns

### Backend (Jest)
- **Parallel execution** with 50% of available cores
- **Efficient database operations** with proper cleanup
- **Memory management** with force exit and open handle detection
- **Optimized transforms** with Babel caching

## Error Handling and Debugging

### Debug Mode
Both frontend and backend support debug mode for troubleshooting:

```bash
# Frontend debugging
npm run test:debug

# Backend debugging
npm run test:debug
```

### Error Simulation
The backend includes utilities for simulating various error conditions:
- Network errors
- Timeout errors
- Database connection errors
- Validation errors

## Best Practices Summary

1. **Write tests first** (TDD approach when possible)
2. **Use descriptive test names** that explain the scenario
3. **Group related tests** using describe blocks
4. **Test both happy and sad paths**
5. **Mock external dependencies** appropriately
6. **Use test utilities** for consistent patterns
7. **Keep tests isolated** and independent
8. **Assert on specific behaviors** rather than implementation details
9. **Use performance testing** for critical operations
10. **Maintain high coverage** without sacrificing quality

## File Structure

```
project/
├── backend/
│   ├── src/
│   │   ├── __tests__/          # Test files
│   │   └── test/
│   │       └── utils.js        # Test utilities
│   │   
│   │   └── test/
│   │       └── setup.ts        # Global test setup
│   └── vitest.config.ts        # Vitest configuration
├── Makefile                    # Build and test automation
└── TESTING_INFRASTRUCTURE.md   # This documentation
```

## Getting Started

1. **Install dependencies**: `make install`
2. **Start MongoDB**: `make docker-up`
3. **Run tests**: `make test`
4. **View coverage**: Open `coverage/index.html` in browser
5. **Write your tests** following the patterns in existing test files

This infrastructure provides a solid foundation for maintaining high-quality code through comprehensive testing. The utilities and patterns established here should be followed for all new features and maintained as the codebase evolves.