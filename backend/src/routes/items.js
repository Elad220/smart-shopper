const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Get all items
router.get('/', itemController.getItems);

// Create a new item
router.post('/', itemController.createItem);

// Update an item
router.put('/:id', itemController.updateItem);

// Delete an item
router.delete('/:id', itemController.deleteItem);

// Delete checked items
router.post('/delete-checked', itemController.deleteCheckedItems);

// Delete items by category
router.post('/delete-category', itemController.deleteCategoryItems);

module.exports = router; 