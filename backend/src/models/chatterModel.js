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
      m.message_type,
      m.gift_id,
      m.image_id,
      m.sent_at,
      u.full_name AS sender_name,
      p.profile_image_url AS sender_image,
      gc.name AS gift_name,
      gc.image_path AS gift_image_path,
      img.image_url
    FROM messages m
    JOIN users u ON u.id = m.sender_id
    LEFT JOIN profiles p ON p.user_id = u.id
    LEFT JOIN gift_catalog gc ON gc.id = m.gift_id
    LEFT JOIN images img ON img.id = m.image_id
    WHERE m.conversation_id = $1
    ORDER BY m.sent_at ASC;
  `;

  const { rows } = await db.query(query, [conversationId]);
  return rows;
};


const sendMessageFromGirl = async (conversationId, girlId, content) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    // Insert the new message
    const insertQuery = `
      INSERT INTO messages (conversation_id, sender_id, content, sent_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING *;
    `;
    const insertValues = [conversationId, girlId, content];
    const { rows } = await client.query(insertQuery, insertValues);
    const newMessage = rows[0];

    // Update last_activity in conversations table
    const updateQuery = `
      UPDATE conversations
      SET last_activity = NOW()
      WHERE id = $1;
    `;
    await client.query(updateQuery, [conversationId]);

    await client.query('COMMIT');
    return newMessage;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
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
    WHERE u.role = 'user'
    ORDER BY w.created_at DESC
    LIMIT 50
  `;
  const result = await db.query(query);
  return result.rows;
};




const findByUserId = async (userId) => {
  const result = await db.query(
    `SELECT p.*, u.full_name, u.email, u.role 
     FROM profiles p
     JOIN users u ON p.user_id = u.id
     WHERE p.user_id = $1`,
    [userId]
  );

  return result.rows[0];
};

module.exports = {getAllActiveConversations,getMessagesByConversationId, sendMessageFromGirl,getAllWinks , findByUserId}