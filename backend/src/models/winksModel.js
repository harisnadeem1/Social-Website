const pool = require('../config/db');

const respondToWink = async (winkId, message) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const winkResult = await client.query(`
      DELETE FROM winks WHERE id = $1 RETURNING sender_id, receiver_id
    `, [winkId]);

    const senderId = winkResult.rows[0]?.sender_id;
    const girlId = winkResult.rows[0]?.receiver_id;

    if (!senderId || !girlId) throw new Error('Wink not found');

    await client.query(`
      INSERT INTO notifications (sender_id, user_id, type, content)
      VALUES ($1, $2, 'wink', 'You have been winked at!')
    `, [girlId, senderId]);

    const conversationRes = await client.query(`
      SELECT id FROM conversations WHERE user_id = $1 AND girl_id = $2
    `, [senderId, girlId]);

    let conversationId;

    if (conversationRes.rows.length > 0) {
      conversationId = conversationRes.rows[0].id;
    } else {
      const newConv = await client.query(`
        INSERT INTO conversations (user_id, girl_id)
        VALUES ($1, $2)
        RETURNING id
      `, [senderId, girlId]);
      conversationId = newConv.rows[0].id;
    }

    await client.query(`
      INSERT INTO messages (conversation_id, sender_id, content)
      VALUES ($1, $2, $3)
    `, [conversationId, girlId, message]);

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

module.exports = { respondToWink };
