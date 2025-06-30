const express = require('express');
const router = express.Router();
const {verifyToken} = require('../middleware/authMiddleware');
const { startConversation , deleteConversation } = require('../controllers/conversationController');

router.post('/start/:girlId', verifyToken, startConversation);
router.delete('/:id', verifyToken, deleteConversation);




module.exports = router;
