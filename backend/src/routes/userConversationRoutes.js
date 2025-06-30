const express = require('express');
const router = express.Router();
const { getMyConversations } = require('../controllers/userConversationController');
const {verifyToken} = require('../middleware/authMiddleware');


// GET /api/users/me/conversations
router.get('/me/conversations', verifyToken, getMyConversations);

module.exports = router;
