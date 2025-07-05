const express = require('express');
const router = express.Router();
const smartAssistantController = require('../controllers/smartAssistantController');
const auth = require('../middleware/auth');

router.use(auth);

// Chat functionality
router.post('/chat', smartAssistantController.chat);
router.get('/chat/history', smartAssistantController.getChatHistory);
router.delete('/chat/history', smartAssistantController.clearChatHistory);
router.put('/preferences', smartAssistantController.updatePreferences);

// Original item generation (kept for backward compatibility)
router.post('/generate', smartAssistantController.generateItems);

module.exports = router;