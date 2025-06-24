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

module.exports = router;