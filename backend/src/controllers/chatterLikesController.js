const pool = require('../config/db');

const getLikes = async (req, res) => {
  try {
    const girlId = req.user.id;

    const result = await pool.query(`
      SELECT 
        likes.id, 
        sender.id AS user_id, 
        sender.full_name AS user_name, 
        profiles.profile_image_url AS user_image, 
        receiver.full_name AS girl_name, 
        likes.created_at
      FROM likes
      JOIN users AS sender ON sender.id = likes.sender_id
      JOIN users AS receiver ON receiver.id = likes.receiver_id AND receiver.role = 'girl'
      LEFT JOIN profiles ON profiles.user_id = sender.id
      
      ORDER BY likes.created_at DESC
    `, []);


    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

const respondToLike = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ message: 'Message is required' });
    }

    await client.query('BEGIN');

    const likeResult = await client.query(`
      DELETE FROM likes WHERE id = $1 RETURNING sender_id, receiver_id
    `, [id]);

    const senderId = likeResult.rows[0]?.sender_id;
    const girlId = likeResult.rows[0]?.receiver_id;

    if (!senderId || !girlId) throw new Error('Like not found');

    await client.query(`
      INSERT INTO notifications (sender_id, user_id, type, content)
      VALUES ($1, $2, 'like', 'You have been liked!')
    `, [girlId, senderId]);

    const conversationResult = await client.query(`
      SELECT id FROM conversations
      WHERE user_id = $1 AND girl_id = $2
    `, [senderId, girlId]);

    let conversationId;

    if (conversationResult.rows.length > 0) {
      conversationId = conversationResult.rows[0].id;
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
    res.json({ message: 'Like responded with custom message' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ message: 'Failed to respond to like' });
  } finally {
    client.release();
  }
};



module.exports = { getLikes, respondToLike };
