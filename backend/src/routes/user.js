const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

router.use(auth);

// GET route to check if an API key exists
router.get('/api-key/status', userController.getApiKeyStatus);

// PUT route to update/save the API key
router.put('/api-key', userController.updateApiKey);

// DELETE route to remove the API key
router.delete('/api-key', userController.removeApiKey);

// PUT route to update last used shopping list
router.put('/last-used-list', userController.updateLastUsedList);

// GET route to get last used shopping list
router.get('/last-used-list', userController.getLastUsedList);

module.exports = router;