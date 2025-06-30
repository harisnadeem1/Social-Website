const db = require('../config/db');
const WinksModel = require('../models/winksModel');

const addWink = async (req, res) => {
  const senderId = req.user.id;
  const receiverId = parseInt(req.params.receiverId);

  try {
    await db.query(`
      INSERT INTO winks (sender_id, receiver_id)
      VALUES ($1, $2)
      ON CONFLICT (sender_id, receiver_id) DO NOTHING
    `, [senderId, receiverId]);

    res.json({ message: 'Wink sent' });
  } catch (err) {
    console.error('Error sending wink:', err);
    res.status(500).json({ message: 'Failed to send wink' });
  }
};

const sendWink = async (req, res) => {
  const senderId = req.user.id;
  const { receiverId } = req.params;

  try {
    await db.query('BEGIN');

    // Step 1: Check if wink already exists
    const existing = await db.query(
      'SELECT id FROM winks WHERE sender_id = $1 AND receiver_id = $2',
      [senderId, receiverId]
    );

    if (existing.rows.length > 0) {
      await db.query('ROLLBACK');
      return res.status(200).json({ status: 'already_winked' });
    }

    // Step 2: Deduct 2 coins only if enough balance
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

    // Step 3: Insert wink
    await db.query(
      'INSERT INTO winks (sender_id, receiver_id) VALUES ($1, $2)',
      [senderId, receiverId]
    );

    // Step 4: Log transaction
    await db.query(
      'INSERT INTO transactions (user_id, amount, type, purpose) VALUES ($1, $2, $3, $4)',
      [senderId, 2, 'spend', 'wink']
    );

    await db.query('COMMIT');

    // Step 5: Return success + new balance
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

  try {
    const result = await WinksModel.respondToWink(winkId);
    res.status(200).json({ success: true, message: 'Responded to wink successfully' });
  } catch (err) {
    console.error("Failed to respond to wink:", err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { sendWink, addWink ,respondToWink};
