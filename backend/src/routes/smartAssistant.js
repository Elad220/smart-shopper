const express = require('express');
const router = express.Router();
const smartAssistantController = require('../controllers/smartAssistantController');
const auth = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } });

router.use(auth);

// Chat functionality
router.post('/chat', smartAssistantController.chat);
router.get('/chat/history', smartAssistantController.getChatHistory);
router.delete('/chat/history', smartAssistantController.clearChatHistory);
router.put('/preferences', smartAssistantController.updatePreferences);

// Autofill item details
router.post('/autofill', smartAssistantController.autofillItemDetails);

// Original item generation (kept for backward compatibility)
router.post('/generate', smartAssistantController.generateItems);

// Audio transcription endpoint
router.post('/audio', upload.single('audio'), smartAssistantController.transcribeAudio);

module.exports = router;