// controllers/notificationController.js
const NotificationModel = require('../models/notificationModel');

const getNotificationsByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const notifications = await NotificationModel.getNotificationsByUserId(userId);
    res.status(200).json(notifications);
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const clearNotificationsByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    await NotificationModel.deleteNotificationsByUserId(userId);
    res.status(200).json({ message: 'Notifications cleared' });
  } catch (err) {
    console.error('Error clearing notifications:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


const deleteNotifications = async (req, res) => {
  const { notifId } = req.params;

  try {
    await NotificationModel.deleteNotifications(notifId);
    res.status(200).json({ message: 'Notification Deleted' });
  } catch (err) {
    console.error('Error deleting notification:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


const fetchUnreadCount = async (req, res) => {
  const userId = req.params.userId;

  try {
    const count = await NotificationModel.getUnreadNotificationCount(userId);
    res.json({ count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Failed to fetch notification count' });
  }
};

module.exports = {
  getNotificationsByUser,clearNotificationsByUser, deleteNotifications , fetchUnreadCount
};
