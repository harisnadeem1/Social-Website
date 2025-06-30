const express = require('express');
const router = express.Router();
const { sendWink , respondToWink} = require('../controllers/winkController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/:receiverId', verifyToken, sendWink);

router.post('/respond/:winkId', verifyToken, respondToWink);
module.exports = router;
