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

// Remove all items in a category from a shopping list
router.post('/:listId/items/delete-category', shoppingListController.deleteCategoryItems);

// Remove all checked items from a shopping list
router.post('/:listId/items/delete-checked', shoppingListController.deleteCheckedItems);

// Export/Import routes
router.get('/:listId/export', shoppingListController.exportList);
router.post('/:listId/import', shoppingListController.importList);

// Sharing routes
router.post('/:listId/share', shoppingListController.shareList);
router.post('/:listId/unshare', shoppingListController.unshareList);
router.get('/:listId/shares', shoppingListController.getListShares);
router.put('/:listId/share-permission', shoppingListController.updateSharePermission);

module.exports = router;