const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const User = require('../models/User');
const ShoppingList = require('../models/ShoppingList');

describe('Shopping List Endpoints', () => {
  let token;
  let userId;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-shopper-test');
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await ShoppingList.deleteMany({});

    // Create a test user and get token
    const user = await User.create({
      username: 'testuser',
      password: 'Test123!@#',
      email: 'test@example.com'
    });
    userId = user._id;

    const loginRes = await request(app)
      .post('/auth/login')
      .send({
        username: 'testuser',
        password: 'Test123!@#'
      });
    token = loginRes.body.token;
  });

  describe('GET /api/shopping-lists', () => {
    it('should get all shopping lists for user', async () => {
      await ShoppingList.create({
        name: 'Test List',
        user: userId,
        items: []
      });

      const res = await request(app)
        .get('/api/shopping-lists')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toBe(1);
      expect(res.body[0]).toHaveProperty('name', 'Test List');
    });
  });

  describe('POST /api/shopping-lists', () => {
    it('should create a new shopping list', async () => {
      const res = await request(app)
        .post('/api/shopping-lists')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'New List'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('name', 'New List');
      expect(res.body).toHaveProperty('user', userId.toString());
    });

    it('should not create list without name', async () => {
      const res = await request(app)
        .post('/api/shopping-lists')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('PUT /api/shopping-lists/:id', () => {
    let listId;

    beforeEach(async () => {
      const list = await ShoppingList.create({
        name: 'Test List',
        user: userId,
        items: []
      });
      listId = list._id;
    });

    it('should update shopping list name', async () => {
      const res = await request(app)
        .put(`/api/shopping-lists/${listId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Updated List'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('name', 'Updated List');
    });

    it('should not update list with invalid id', async () => {
      const res = await request(app)
        .put('/api/shopping-lists/invalid-id')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Updated List'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('DELETE /api/shopping-lists/:id', () => {
    let listId;

    beforeEach(async () => {
      const list = await ShoppingList.create({
        name: 'Test List',
        user: userId,
        items: []
      });
      listId = list._id;
    });

    it('should delete shopping list', async () => {
      const res = await request(app)
        .delete(`/api/shopping-lists/${listId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      
      const list = await ShoppingList.findById(listId);
      expect(list).toBeNull();
    });

    it('should not delete list with invalid id', async () => {
      const res = await request(app)
        .delete('/api/shopping-lists/invalid-id')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message');
    });
  });
}); 