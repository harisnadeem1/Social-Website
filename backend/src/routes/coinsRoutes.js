const express = require('express');
const router = express.Router();
const { getCoinBalance } = require('../controllers/coinController');
const {verifyToken} = require('../middleware/authMiddleware');

// Route: GET /api/coins/:userId
router.get('/:userId', verifyToken, getCoinBalance);

module.exports = router;
