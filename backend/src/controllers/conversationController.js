const db = require('../config/db');

const startConversation = async (req, res) => {
  const userId = req.user.id;
  const girlId = parseInt(req.params.girlId);

  try {
    // Check if it already exists
    const existing = await db.query(
      `SELECT id FROM conversations WHERE user_id = $1 AND girl_id = $2`,
      [userId, girlId]
    );

    if (existing.rows.length > 0) {
      return res.status(200).json({ conversationId: existing.rows[0].id, status: 'exists' });
    }

    // Create a new conversation
    const result = await db.query(
      `INSERT INTO conversations (user_id, girl_id, started_at, last_activity)
       VALUES ($1, $2, NOW(), NOW())
       RETURNING id`,
      [userId, girlId]
    );

    res.status(201).json({ conversationId: result.rows[0].id, status: 'created' });
  } catch (err) {
    console.error('Start conversation error:', err);
    res.status(500).json({ message: 'Could not start conversation' });
  }
};



const deleteConversation = async (req, res) => {
  const userId = req.user.id;
  const conversationId = req.params.id;

  try {
    const check = await db.query(
      'SELECT * FROM conversations WHERE id = $1 AND (user_id = $2 OR girl_id = $2)',
      [conversationId, userId]
    );

    if (check.rows.length === 0) {
      return res.status(403).json({ error: 'Not authorized to delete this conversation' });
    }

    await db.query('DELETE FROM conversations WHERE id = $1', [conversationId]);
    await db.query('DELETE FROM messages WHERE conversation_id = $1', [conversationId]);

    res.status(200).json({ message: 'Conversation deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};



module.exports = {
 startConversation, deleteConversation
};
