const express = require('express');
const router = express.Router();
const shoppingListController = require('../controllers/shoppingListController');
const auth = require('../middleware/auth');

// All routes are protected with auth middleware
router.use(auth);

// Get all lists for the user
router.get('/', shoppingListController.getLists);

// Create a new list
router.post('/', shoppingListController.createList);

// Get a specific list
router.get('/:listId', shoppingListController.getList);

// Update a list (rename)
router.put('/:listId', shoppingListController.updateList);

// Delete a list
router.delete('/:listId', shoppingListController.deleteList);

// Add an item to a list
router.post('/:listId/items', shoppingListController.addItem);

// Remove an item from a list
router.delete('/:listId/items/:itemId', shoppingListController.removeItem);

// Update an item in a list
router.put('/:listId/items/:itemId', shoppingListController.updateItem);

module.exports = router; 