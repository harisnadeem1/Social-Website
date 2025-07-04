const db = require('../config/db'); // PostgreSQL db instance



const fetchUserConversations = async (userId) => {

  const query = `
   SELECT 
  c.id AS conversation_id,
  u.id AS girl_id,
  u.full_name AS girl_name,
  p.profile_image_url AS avatar,
  c.last_activity
FROM conversations c
JOIN users u ON c.girl_id = u.id
LEFT JOIN profiles p ON p.user_id = u.id
WHERE c.user_id = $1
ORDER BY c.last_activity DESC
  `;
  const result = await db.query(query, [userId]);
  return result.rows;
};


const lockConversation = async (conversationId, chatterId) => {
  const result = await db.query(
    `UPDATE conversations
     SET locked_by = $1, lock_time = NOW()
     WHERE id = $2 AND (locked_by IS NULL OR locked_by = $1)
     RETURNING *`,
    [chatterId, conversationId]
  );
  return result.rows[0];
};

const unlockConversation = async (conversationId, chatterId) => {
  const result = await db.query(
    `UPDATE conversations
     SET locked_by = NULL, lock_time = NULL
     WHERE id = $1 AND locked_by = $2
     RETURNING *`,
    [conversationId, chatterId]
  );
  return result.rows[0];
};

const getLockStatus = async (conversationId) => {
  const result = await db.query(
    'SELECT locked_by, lock_time FROM conversations WHERE id = $1',
    [conversationId]
  );

  const conversation = result.rows[0];

  if (!conversation) {
    return { status: 404, data: { error: 'Conversation not found' } };
  }

  const now = new Date();
  const lockTime = new Date(conversation.lock_time);
  const diffMs = now - lockTime;
  const expired = diffMs > 2 * 60 * 1000; // 2 minutes

  if (conversation.locked_by && expired) {
    await db.query(
      'UPDATE conversations SET locked_by = NULL, lock_time = NULL WHERE id = $1',
      [conversationId]
    );
    return { status: 200, data: { locked_by: null } };
  }

  if (conversation.locked_by) {
    const userRes = await db.query(
      'SELECT full_name FROM users WHERE id = $1',
      [conversation.locked_by]
    );
    const name = userRes.rows[0]?.name || 'Unknown';
    return { status: 200, data: { locked_by: conversation.locked_by, lock_holder_name: name } };
  }

  return { status: 200, data: { locked_by: null } };
};


module.exports = { fetchUserConversations,lockConversation, unlockConversation, getLockStatus};
