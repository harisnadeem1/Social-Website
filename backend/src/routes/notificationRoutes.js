// routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const {getNotificationsByUser , clearNotificationsByUser , deleteNotifications} = require('../controllers/notificationController');
const {verifyToken} = require('../middleware/authMiddleware');

router.get('/get/:userId', verifyToken, getNotificationsByUser);
router.delete('/clear/:userId', verifyToken, clearNotificationsByUser);
router.delete('/delete/:notifId', verifyToken, deleteNotifications);



module.exports = router;
