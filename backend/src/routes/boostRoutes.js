const express = require('express');
const router = express.Router();
const {boostProfile} = require('../controllers/boostController');
const {verifyToken} = require('../middleware/authMiddleware'); // ensure this validates the token

router.post('/boost', verifyToken, boostProfile);

module.exports = router;