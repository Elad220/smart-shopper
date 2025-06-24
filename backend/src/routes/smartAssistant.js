const express = require('express');
const router = express.Router();
const smartAssistantController = require('../controllers/smartAssistantController');
const auth = require('../middleware/auth');

router.use(auth);

router.post('/generate', smartAssistantController.generateItems);

module.exports = router;