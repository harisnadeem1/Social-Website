const db = require('../config/db');

exports.getUnreadConversations = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await db.query(`
      SELECT COUNT(*) AS unread_count
      FROM (
        SELECT c.id
        FROM conversations c
        JOIN LATERAL (
          SELECT sender_id
          FROM messages
          WHERE conversation_id = c.id
          ORDER BY sent_at DESC
          LIMIT 1
        ) m ON true
        WHERE c.user_id = $1 AND m.sender_id != $1
      ) AS unread_conversations;
    `, [userId]);

    res.status(200).json({ count: parseInt(result.rows[0].unread_count, 10) });
  } catch (err) {
    console.error("Unread chat count error:", err);
    res.status(500).json({ error: 'Failed to get unread chat count' });
  }
};
