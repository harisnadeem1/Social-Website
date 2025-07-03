const router = require('express').Router();
const { uploadImageAndCreateMessage  } = require('../controllers/imagesController');
const {verifyToken} = require('../middleware/authMiddleware');

router.post('/upload', verifyToken, uploadImageAndCreateMessage );

module.exports = router;
