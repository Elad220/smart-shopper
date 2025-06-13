const express = require('express');
const router = express.Router();
const shoppingListController = require('../controllers/shoppingListController');
const auth = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(auth);

// Get all shopping lists
router.get('/', shoppingListController.getLists);

// Get a single shopping list
router.get('/:listId', shoppingListController.getList);

// Create a new shopping list
router.post('/', shoppingListController.createList);

// Update a shopping list
router.put('/:listId', shoppingListController.updateList);

// Delete a shopping list
router.delete('/:listId', shoppingListController.deleteList);

// Add an item to a shopping list
router.post('/:listId/items', shoppingListController.addItem);

// Update an item in a shopping list
router.put('/:listId/items/:itemId', shoppingListController.updateItem);

// Remove an item from a shopping list
router.delete('/:listId/items/:itemId', shoppingListController.removeItem);

module.exports = router; 