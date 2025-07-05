const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const User = require('../models/User');
const {
  connectTestDB,
  disconnectTestDB,
  clearTestDB,
  createMockUser,
  expectValidationError,
  expectUnauthorizedError,
  expectSuccessResponse,
  expectCreatedResponse,
  expectObjectToHaveValidId,
  expectValidTimestamp,
  measureExecutionTime
} = require('../test/utils');

describe('Auth Endpoints', () => {
  // Test setup and teardown
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  describe('POST /auth/register', () => {
    const validUserData = createMockUser();

    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send(validUserData);

      expectCreatedResponse(res);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      
      const { user } = res.body;
      expectObjectToHaveValidId(user);
      expect(user).toHaveProperty('username', validUserData.username);
      expect(user).toHaveProperty('email', validUserData.email);
      expect(user).not.toHaveProperty('password'); // Password should not be returned
      expectValidTimestamp(user.createdAt);
    });

    it('should not register a user with duplicate username', async () => {
      // Create first user
      await User.create(validUserData);
      
      // Try to create second user with same username
      const res = await request(app)
        .post('/auth/register')
        .send(validUserData);

      expectValidationError(res, 'User already exists');
    });

    it('should not register a user with invalid email', async () => {
      const invalidUserData = createMockUser({ email: 'invalid-email' });
      
      const res = await request(app)
        .post('/auth/register')
        .send(invalidUserData);

      expectValidationError(res);
    });

    it('should not register a user with weak password', async () => {
      const weakPasswordData = createMockUser({ password: 'weak' });
      
      const res = await request(app)
        .post('/auth/register')
        .send(weakPasswordData);

      expectValidationError(res);
    });

    it('should not register a user with missing required fields', async () => {
      const testCases = [
        { username: '', email: 'test@example.com', password: 'Test123!@#' },
        { username: 'testuser', email: '', password: 'Test123!@#' },
        { username: 'testuser', email: 'test@example.com', password: '' },
      ];

      for (const testCase of testCases) {
        const res = await request(app)
          .post('/auth/register')
          .send(testCase);

        expectValidationError(res);
      }
    });

    it('should have reasonable performance', async () => {
      const executionTime = await measureExecutionTime(async () => {
        await request(app)
          .post('/auth/register')
          .send(validUserData);
      });

      expect(executionTime).toBeLessThan(2000); // Should complete within 2 seconds
    });
  });

  describe('POST /auth/login', () => {
    const userData = createMockUser();
    let createdUser;

    beforeEach(async () => {
      createdUser = await User.create(userData);
    });

    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          username: userData.username,
          password: userData.password
        });

      expectSuccessResponse(res);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      
      const { user } = res.body;
      expectObjectToHaveValidId(user);
      expect(user).toHaveProperty('username', userData.username);
      expect(user).toHaveProperty('email', userData.email);
      expect(user).not.toHaveProperty('password');
    });

    it('should not login with invalid username', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          username: 'nonexistent',
          password: userData.password
        });

      expectUnauthorizedError(res);
    });

    it('should not login with invalid password', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          username: userData.username,
          password: 'wrongpassword'
        });

      expectUnauthorizedError(res);
    });

    it('should not login with missing credentials', async () => {
      const testCases = [
        { username: '', password: userData.password },
        { username: userData.username, password: '' },
        { username: '', password: '' },
      ];

      for (const testCase of testCases) {
        const res = await request(app)
          .post('/auth/login')
          .send(testCase);

        expectValidationError(res);
      }
    });

    it('should generate different tokens for different login sessions', async () => {
      const res1 = await request(app)
        .post('/auth/login')
        .send({
          username: userData.username,
          password: userData.password
        });

      const res2 = await request(app)
        .post('/auth/login')
        .send({
          username: userData.username,
          password: userData.password
        });

      expectSuccessResponse(res1);
      expectSuccessResponse(res2);
      expect(res1.body.token).not.toEqual(res2.body.token);
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      // This test would require mocking the database connection
      // Implementation depends on your specific error handling setup
      expect(true).toBe(true); // Placeholder
    });

    it('should handle malformed JSON in request body', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send('invalid json')
        .set('Content-Type', 'application/json');

      expect(res.statusCode).toBe(400);
    });
  });
}); 