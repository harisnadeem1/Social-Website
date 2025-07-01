const express = require('express');
const router = express.Router();
const {updateEmail,updatePassword ,getUserById,getEmailById} = require('../controllers/userController');
const {verifyToken} = require('../middleware/authMiddleware');

// Update Email
router.put('/update-email', verifyToken, updateEmail);

// Update Password
router.put('/update-password', verifyToken, updatePassword);
router.get('/', verifyToken, getEmailById);

module.exports = router;
