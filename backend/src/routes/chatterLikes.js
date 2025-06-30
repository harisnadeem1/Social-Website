const express = require('express');
const router = express.Router();
const { getLikes, respondToLike } = require('../controllers/chatterLikesController');
const {verifyToken} = require('../middleware/authMiddleware');

router.get('/get', verifyToken, getLikes);
router.post('/respond/:id', verifyToken, respondToLike);

module.exports = router;
