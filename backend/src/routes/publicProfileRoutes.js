const express = require('express');
const router = express.Router();
const {getPublicProfileByUsername} = require('../controllers/publicProfileController');

// Public profile route
router.get('/profile/:username', getPublicProfileByUsername);

module.exports = router;
