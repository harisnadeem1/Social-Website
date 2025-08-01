// routes/chatterRoutes.js
const express = require('express');
const router = express.Router();
const {getActiveConversations , getMessagesForConversation,sendMessageAsGirl,getWinks, getProfileByUserId} = require('../controllers/chatterController');
const {verifyToken} = require('../middleware/authMiddleware'); // JWT auth

// GET all active conversations for chatter
router.get('/conversations', verifyToken, getActiveConversations);

router.get('/conversations/:id/messages', verifyToken, getMessagesForConversation);

router.post('/conversations/chatter/:id/messages', verifyToken, sendMessageAsGirl);

router.get('/winks', verifyToken, getWinks);

router.get('/getProfilebyUserid/:userId', verifyToken, getProfileByUserId);


module.exports = router;
