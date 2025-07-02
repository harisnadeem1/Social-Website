// routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const {getNotificationsByUser , clearNotificationsByUser , deleteNotifications,fetchUnreadCount} = require('../controllers/notificationController');
const {verifyToken} = require('../middleware/authMiddleware');

router.get('/get/:userId', verifyToken, getNotificationsByUser);
router.delete('/clear/:userId', verifyToken, clearNotificationsByUser);
router.delete('/delete/:notifId', verifyToken, deleteNotifications);


router.get('/unread-count/:userId',verifyToken, fetchUnreadCount);

module.exports = router;
