// trong routes/chatbot.route.js
const express = require('express');
const router = express.Router();
const { queryChatbot, updateInteractionContext } = require('../controllers/chatbot.controller.js');

router.post('/query', queryChatbot);
router.post('/update-context', updateInteractionContext);

module.exports = router;
