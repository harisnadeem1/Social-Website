const express = require('express');
const router = express.Router();
const {getGiftCatalog,sendGift} = require('../controllers/giftController');
const {verifyToken} = require('../middleware/authMiddleware'); // JWT auth


// GET /gifts/catalog
router.get('/catalog', getGiftCatalog);

// POST /gifts/send
router.post('/send-gift', verifyToken, sendGift);

module.exports = router;
