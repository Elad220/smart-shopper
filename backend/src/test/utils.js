const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ShoppingList = require('../models/ShoppingList');

// Database utilities
const connectTestDB = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-shopper-test';
  await mongoose.connect(mongoUri);
};

const disconnectTestDB = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
};

const clearTestDB = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
};

// Mock data factories
const createMockUser = (overrides = {}) => ({
  username: 'testuser',
  email: 'test@example.com',
  password: 'Test123!@#',
  ...overrides,
});

const createMockShoppingList = (userId, overrides = {}) => ({
  name: 'Test Shopping List',
  user: userId,
  items: [],
  ...overrides,
});

const createMockItem = (overrides = {}) => ({
  name: 'Test Item',
  category: 'Dairy',
  amount: 1,
  units: 'pcs',
  completed: false,
  priority: 'medium',
  ...overrides,
});

// Test user creation and authentication
const createTestUser = async (userData = {}) => {
  const mockUser = createMockUser(userData);
  const user = await User.create(mockUser);
  return user;
};

const createAuthenticatedUser = async (userData = {}) => {
  const user = await createTestUser(userData);
  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );
  return { user, token };
};

// Shopping list utilities
const createTestShoppingList = async (userId, listData = {}) => {
  const mockList = createMockShoppingList(userId, listData);
  const list = await ShoppingList.create(mockList);
  return list;
};

const createTestShoppingListWithItems = async (userId, listData = {}, itemsData = []) => {
  const items = itemsData.length > 0 ? itemsData : [createMockItem()];
  const list = await createTestShoppingList(userId, { ...listData, items });
  return list;
};

// API testing utilities
const expectValidationError = (res, expectedMessage) => {
  expect(res.statusCode).toBe(400);
  expect(res.body).toHaveProperty('message');
  if (expectedMessage) {
    expect(res.body.message).toContain(expectedMessage);
  }
};

const expectUnauthorizedError = (res) => {
  expect(res.statusCode).toBe(401);
  expect(res.body).toHaveProperty('message');
};

const expectNotFoundError = (res) => {
  expect(res.statusCode).toBe(404);
  expect(res.body).toHaveProperty('message');
};

const expectSuccessResponse = (res, expectedData) => {
  expect(res.statusCode).toBe(200);
  if (expectedData) {
    expect(res.body).toMatchObject(expectedData);
  }
};

const expectCreatedResponse = (res, expectedData) => {
  expect(res.statusCode).toBe(201);
  if (expectedData) {
    expect(res.body).toMatchObject(expectedData);
  }
};

// Authentication header helper
const getAuthHeader = (token) => ({
  Authorization: `Bearer ${token}`,
});

// Test data cleanup
const cleanupTestData = async () => {
  await Promise.all([
    User.deleteMany({}),
    ShoppingList.deleteMany({}),
  ]);
};

// Mock environment variables
const setupTestEnvironment = () => {
  process.env.JWT_SECRET = 'test-secret';
  process.env.MONGODB_URI = 'mongodb://localhost:27017/smart-shopper-test';
  process.env.NODE_ENV = 'test';
};

// Advanced test utilities
const expectArrayToContainObject = (array, expectedObject) => {
  expect(array).toEqual(
    expect.arrayContaining([
      expect.objectContaining(expectedObject)
    ])
  );
};

const expectObjectToHaveValidId = (obj) => {
  expect(obj).toHaveProperty('id');
  expect(obj.id).toMatch(/^[a-f\d]{24}$/i); // MongoDB ObjectId pattern
};

const expectValidTimestamp = (timestamp) => {
  expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);
  expect(new Date(timestamp)).toBeInstanceOf(Date);
};

// Error simulation utilities
const simulateNetworkError = () => {
  const error = new Error('Network Error');
  error.code = 'ECONNRESET';
  return error;
};

const simulateTimeoutError = () => {
  const error = new Error('Request Timeout');
  error.code = 'ETIMEDOUT';
  return error;
};

// Performance testing utilities
const measureExecutionTime = async (fn) => {
  const start = process.hrtime.bigint();
  await fn();
  const end = process.hrtime.bigint();
  return Number(end - start) / 1000000; // Convert to milliseconds
};

module.exports = {
  // Database utilities
  connectTestDB,
  disconnectTestDB,
  clearTestDB,
  
  // Mock data factories
  createMockUser,
  createMockShoppingList,
  createMockItem,
  
  // Test creation utilities
  createTestUser,
  createAuthenticatedUser,
  createTestShoppingList,
  createTestShoppingListWithItems,
  
  // API testing utilities
  expectValidationError,
  expectUnauthorizedError,
  expectNotFoundError,
  expectSuccessResponse,
  expectCreatedResponse,
  getAuthHeader,
  
  // Cleanup utilities
  cleanupTestData,
  setupTestEnvironment,
  
  // Advanced utilities
  expectArrayToContainObject,
  expectObjectToHaveValidId,
  expectValidTimestamp,
  
  // Error simulation
  simulateNetworkError,
  simulateTimeoutError,
  
  // Performance testing
  measureExecutionTime,
};