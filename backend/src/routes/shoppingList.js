const express = require('express');
const router = express.Router();
const shoppingListController = require('../controllers/shoppingListController');

// Get all shopping lists
router.get('/', shoppingListController.getAllLists);

// Get a single shopping list
router.get('/:id', shoppingListController.getList);

// Create a new shopping list
router.post('/', shoppingListController.createList);

// Update a shopping list
router.put('/:id', shoppingListController.updateList);

// Delete a shopping list
router.delete('/:id', shoppingListController.deleteList);

module.exports = router; 