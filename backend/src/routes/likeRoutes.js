const express = require('express');
const router = express.Router();
const { addLike } = require('../controllers/likeController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/:receiverId', verifyToken, addLike);

module.exports = router;
