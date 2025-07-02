// models/notificationModel.js
const db = require('../config/db');

const getNotificationsByUserId = async (userId) => {
  const query = `
   SELECT 
  n.id,
  n.content,
  n.type,
  n.is_read,
  n.created_at,
  p.user_id AS sender_id,
  p.profile_image_url
FROM notifications n
LEFT JOIN profiles p ON p.user_id = n.sender_id
WHERE n.user_id = $1
ORDER BY n.created_at DESC
LIMIT 10
  `;
  const result = await db.query(query, [userId]);
  return result.rows;
};

const deleteNotificationsByUserId = async (userId) => {
  await db.query('DELETE FROM notifications WHERE user_id = $1', [userId]);
};

const deleteNotifications = async (notifId) => {
  await db.query('DELETE FROM notifications WHERE id = $1', [notifId]);
};





const getUnreadNotificationCount = async (userId) => {
  const query = `
    SELECT COUNT(*) FROM notifications 
    WHERE user_id = $1 AND is_read = FALSE
  `;
  const result = await db.query(query, [userId]);
  return parseInt(result.rows[0].count, 10);
};

module.exports = {
  getNotificationsByUserId,deleteNotificationsByUserId, deleteNotifications ,getUnreadNotificationCount
};
