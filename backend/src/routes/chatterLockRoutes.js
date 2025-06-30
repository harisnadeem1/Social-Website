const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { lockChat, unlockChat, checkLock } = require('../controllers/lockController');

router.post('/lock/:id', verifyToken, lockChat);
router.post('/unlock/:id', verifyToken, unlockChat);
router.get('/status/:id', verifyToken, checkLock);

module.exports = router;
