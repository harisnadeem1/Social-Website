const db = require('../config/db');

exports.addLike = async (req, res) => {
  const senderId = req.user.id;
  const receiverId = parseInt(req.params.receiverId);

  try {
    await db.query(`
      INSERT INTO likes (sender_id, receiver_id)
      VALUES ($1, $2)
      ON CONFLICT (sender_id, receiver_id) DO NOTHING
    `, [senderId, receiverId]);

    res.json({ message: 'Like added' });
  } catch (err) {
    console.error('Error adding like:', err);
    res.status(500).json({ message: 'Failed to like profile' });
  }
};
