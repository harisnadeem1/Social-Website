const express = require('express');
const router = express.Router();
const { addLike ,checkLikeStatus} = require('../controllers/likeController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/:receiverId', verifyToken, addLike);
router.get('/status/:receiverId', verifyToken, checkLikeStatus);
module.exports = router;
