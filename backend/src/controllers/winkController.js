const db = require('../config/db');
const WinksModel = require('../models/winksModel');
const { handleWinkResponse } = require('./likeWinkBotController'); // NEW

const sendWink = async (req, res) => {
  const senderId = req.user.id;
  const { receiverId } = req.params;

  try {
    await db.query('BEGIN');

    const existing = await db.query(
      'SELECT id FROM winks WHERE sender_id = $1 AND receiver_id = $2',
      [senderId, receiverId]
    );

    if (existing.rows.length > 0) {
      await db.query('ROLLBACK');
      return res.status(200).json({ status: 'already_winked' });
    }

    const coinRes = await db.query(
      `UPDATE coins 
       SET balance = balance - 2, 
           last_transaction_at = NOW(), 
           updated_at = NOW() 
       WHERE user_id = $1 AND balance >= 2 
       RETURNING balance`,
      [senderId]
    );

    if (coinRes.rows.length === 0) {
      await db.query('ROLLBACK');
      return res.status(400).json({ error: 'Not enough coins' });
    }

    const remainingCoins = coinRes.rows[0].balance;

    // Insert wink and get ID
    const winkResult = await db.query(
      'INSERT INTO winks (sender_id, receiver_id) VALUES ($1, $2) RETURNING id',
      [senderId, receiverId]
    );

    const winkId = winkResult.rows[0].id;

    await db.query('COMMIT');

    // ✅ TRIGGER AUTOMATED BOT RESPONSE
    // handleWinkResponse(winkId, senderId, receiverId);

    res.status(200).json({
      status: 'wink_sent',
      remainingCoins
    });

  } catch (err) {
    await db.query('ROLLBACK');
    console.error('Error in sendWink:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

const respondToWink = async (req, res) => {
  const { winkId } = req.params;
  const { message } = req.body;

  if (!message || message.trim() === '') {
    return res.status(400).json({ message: 'Message is required' });
  }

  try {
    const result = await WinksModel.respondToWink(winkId, message);
    res.status(200).json({ success: true, message: 'Responded to wink successfully' });
  } catch (err) {
    console.error("Failed to respond to wink:", err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { sendWink, respondToWink };