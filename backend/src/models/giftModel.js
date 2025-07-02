const db = require('../config/db');

// Fetch all available gifts
exports.fetchAllGifts = async () => {
  const { rows } = await db.query(
    `SELECT id, name, image_path, coin_cost FROM gift_catalog ORDER BY coin_cost ASC`
  );
  return rows;
};

// Get a single gift by ID
exports.getGiftById = async (id) => {
  const { rows } = await db.query(
    `SELECT * FROM gift_catalog WHERE id = $1`,
    [id]
  );
  return rows[0];
};

// Get user's current coin balance
exports.getUserCoinBalance = async (userId) => {
  const { rows } = await db.query(
    `SELECT balance FROM coins WHERE user_id = $1`,
    [userId]
  );
  return rows[0]?.balance || 0;
};

// Deduct coins from user's balance
exports.deductUserCoins = async (userId, amount) => {
  await db.query(
    `UPDATE coins
     SET balance = balance - $1,
         last_transaction_at = CURRENT_TIMESTAMP,
         updated_at = CURRENT_TIMESTAMP
     WHERE user_id = $2`,
    [amount, userId]
  );
};

// Log transaction for gift send
exports.logGiftTransaction = async (userId, amount, purpose) => {
  await db.query(
    `INSERT INTO transactions (user_id, amount, type, purpose)
     VALUES ($1, $2, 'spend', $3)`,
    [userId, amount, purpose]
  );
};

// Insert message of type "gift"
exports.insertGiftMessage = async ({ conversationId, senderId, giftId }) => {
  const { rows } = await db.query(
    `INSERT INTO messages (conversation_id, sender_id, message_type, gift_id, status)
     VALUES ($1, $2, 'gift', $3, 'sent')
     RETURNING *`,
    [conversationId, senderId, giftId]
  );
  return rows[0];
};
