const db = require('../config/db');
const { handleLikeResponse } = require('./likeWinkBotController'); // NEW

const addLike = async (req, res) => {
  const senderId = req.user.id;
  const { receiverId } = req.params;

  try {
    const existing = await db.query(
      'SELECT * FROM likes WHERE sender_id = $1 AND receiver_id = $2',
      [senderId, receiverId]
    );

    if (existing.rows.length > 0) {
      return res.status(200).json({ status: 'already_liked' });
    }

    const likeResult = await db.query(
      'INSERT INTO likes (sender_id, receiver_id) VALUES ($1, $2) RETURNING id',
      [senderId, receiverId]
    );

    const likeId = likeResult.rows[0].id;

    // ✅ TRIGGER AUTOMATED BOT RESPONSE
    // handleLikeResponse(likeId, senderId, receiverId);

    return res.status(201).json({ status: 'like_sent' });
  } catch (err) {
    console.error('Error sending like:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

const checkLikeStatus = async (req, res) => {
  const senderId = req.user.id;
  const { receiverId } = req.params;

  try {
    const result = await db.query(
      'SELECT * FROM likes WHERE sender_id = $1 AND receiver_id = $2',
      [senderId, receiverId]
    );

    const liked = result.rows.length > 0;
    return res.status(200).json({ liked });
  } catch (err) {
    console.error('Error checking like status:', err);
    return res.status(500).json({ error: 'Failed to check like status' });
  }
};

module.exports = { checkLikeStatus, addLike };