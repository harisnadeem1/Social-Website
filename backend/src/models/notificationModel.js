// models/notificationModel.js
const db = require('../config/db');

const getNotificationsByUserId = async (userId) => {
  const query = `
    SELECT id, content, type, is_read, created_at
    FROM notifications
    WHERE user_id = $1
    ORDER BY created_at DESC
    LIMIT 10
  `;
  const result = await db.query(query, [userId]);
  return result.rows;
};

const deleteNotificationsByUserId = async (userId) => {
  await db.query('DELETE FROM notifications WHERE user_id = $1', [userId]);
};

module.exports = {
  getNotificationsByUserId,deleteNotificationsByUserId
};
