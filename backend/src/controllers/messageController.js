const db = require('../config/db');

const getMessagesByConversation = async (req, res) => {
  const conversationId = parseInt(req.params.conversationId);
  try {
    const result = await db.query(
      `
      SELECT 
        m.id,
        m.sender_id,
        m.content,
        m.status,
        m.sent_at,
        m.message_type,
        m.gift_id,
        g.name AS gift_name,
        g.image_path AS gift_image_path,
        m.image_id,
        i.image_url AS image_url
      FROM messages m
      LEFT JOIN gift_catalog g ON m.gift_id = g.id
      LEFT JOIN images i ON m.image_id = i.id
      WHERE m.conversation_id = $1
      ORDER BY m.sent_at ASC
      `,
      [conversationId]
    );

    res.status(200).json({ messages: result.rows });
  } catch (err) {
    console.error('Fetch messages error:', err);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
};





const sendMessage = async (req, res) => {
  const { conversationId } = req.params;
  const { content } = req.body;
  const senderId = req.user.id;

  if (!content || !content.trim()) {
    return res.status(400).json({ message: 'Message content is required.' });
  }

  try {
    await db.query('BEGIN');

    // Deduct 5 coins atomically if the user has enough
    const coinResult = await db.query(
      `UPDATE coins 
       SET balance = balance - 5, 
           last_transaction_at = NOW(), 
           updated_at = NOW() 
       WHERE user_id = $1 AND balance >= 5 
       RETURNING balance`,
      [senderId]
    );

    if (coinResult.rows.length === 0) {
      await db.query('ROLLBACK');
      return res.status(403).json({ message: 'Insufficient coin balance' });
    }

    // Log the transaction
    await db.query(
      `INSERT INTO transactions (user_id, amount, type, purpose) 
       VALUES ($1, 5, 'spend', 'message')`,
      [senderId]
    );

    // Insert the message
    const messageResult = await db.query(
      `INSERT INTO messages (conversation_id, sender_id, content, sent_at) 
       VALUES ($1, $2, $3, NOW()) 
       RETURNING id, content, sent_at`,
      [conversationId, senderId, content]
    );

    // Update last activity in the conversation
    await db.query(
      `UPDATE conversations SET last_activity = NOW() WHERE id = $1`,
      [conversationId]
    );

    await db.query('COMMIT');

    res.status(201).json({
      message: messageResult.rows[0],
      remainingCoins: coinResult.rows[0].balance
    });

  } catch (err) {
    await db.query('ROLLBACK');
    console.error('Send message error:', err);
    res.status(500).json({ message: 'Failed to send message' });
  }
};




module.exports = {
  getMessagesByConversation,
  sendMessage
};
