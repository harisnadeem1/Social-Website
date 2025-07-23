const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { getUnreadConversations } = require('../controllers/mobilenavController');

router.get('/unread-chats', verifyToken, getUnreadConversations);

module.exports = router;
