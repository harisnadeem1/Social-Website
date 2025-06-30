const express = require('express');
const router = express.Router();
const {verifyToken} = require('../middleware/authMiddleware');
const { getMessagesByConversation,sendMessage } = require('../controllers/messageController');


router.post('/:conversationId', verifyToken, sendMessage);

router.get('/:conversationId', verifyToken, getMessagesByConversation);

module.exports = router;
