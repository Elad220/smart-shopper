// Increase timeout for all tests
jest.setTimeout(10000);

// Mock environment variables
process.env.JWT_SECRET = 'test-secret';
process.env.MONGODB_URI = 'mongodb://localhost:27017/smart-shopper-test'; 