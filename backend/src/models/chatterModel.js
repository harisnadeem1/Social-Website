// models/chatterModel.js
const db = require('../config/db');

const getAllActiveConversations = async () => {
  const query = `
    SELECT 
      c.id AS conversation_id,
      c.user_id,
      c.girl_id,
      up.name AS user_name,
      up.profile_image_url AS user_image,
      gp.name AS girl_name,
      gp.profile_image_url AS girl_image,
      m.content AS last_message,
      m.sent_at AS last_message_time
    FROM conversations c
    JOIN (
      SELECT DISTINCT ON (conversation_id) *
      FROM messages
      ORDER BY conversation_id, sent_at DESC
    ) m ON m.conversation_id = c.id
    JOIN profiles up ON up.user_id = c.user_id
    JOIN profiles gp ON gp.user_id = c.girl_id
    ORDER BY m.sent_at DESC;
  `;
  const { rows } = await db.query(query);
  return rows;
};



const getMessagesByConversationId = async (conversationId) => {
  const query = `
    SELECT 
      m.id,
      m.conversation_id,
      m.sender_id,
      m.content,
      m.sent_at,
      u.full_name AS sender_name,
      p.profile_image_url AS sender_image
    FROM messages m
    JOIN users u ON u.id = m.sender_id
    LEFT JOIN profiles p ON p.user_id = u.id
    WHERE m.conversation_id = $1
    ORDER BY m.sent_at ASC;
  `;

  const { rows } = await db.query(query, [conversationId]);
  return rows;
};


const sendMessageFromGirl = async (conversationId, girlId, content) => {
  const query = `
    INSERT INTO messages (conversation_id, sender_id, content, sent_at)
    VALUES ($1, $2, $3, NOW())
    RETURNING *;
  `;
  const values = [conversationId, girlId, content];
  const { rows } = await db.query(query, values);
  return rows[0];
};



const getAllWinks = async () => {
  const query = `
    SELECT 
  w.id, 
  w.created_at, 
  u.full_name AS user_name,
  p.profile_image_url AS user_image,
  p.name AS girl_name,
  p.id AS girl_id,
  w.status
FROM winks w
JOIN users u ON w.sender_id = u.id
JOIN profiles p ON w.receiver_id = p.user_id
ORDER BY w.created_at DESC
LIMIT 50
  `;
  const result = await db.query(query);
  return result.rows;
};


module.exports = {getAllActiveConversations,getMessagesByConversationId, sendMessageFromGirl,getAllWinks}