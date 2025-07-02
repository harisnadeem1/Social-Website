const db = require('../config/db');

// Fetch all available gifts
const fetchAllGifts = async () => {
  const { rows } = await db.query(
    `SELECT id, name, image_path, coin_cost FROM gift_catalog ORDER BY coin_cost ASC`
  );
  return rows;
};

// Get a single gift by ID
const getGiftById = async (id) => {
  const { rows } = await db.query(
    `SELECT * FROM gift_catalog WHERE id = $1`,
    [id]
  );
  return rows[0];
};

// Get user's current coin balance
const getUserCoinBalance = async (userId) => {
  const { rows } = await db.query(
    `SELECT balance FROM coins WHERE user_id = $1`,
    [userId]
  );
  return rows[0]?.balance || 0;
};

// Deduct coins from user's balance
const deductUserCoins = async (userId, amount) => {
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
const logGiftTransaction = async (userId, amount, purpose) => {
  await db.query(
    `INSERT INTO transactions (user_id, amount, type, purpose)
     VALUES ($1, $2, 'spend', $3)`,
    [userId, amount, purpose]
  );
};

// Insert message of type "gift"
const insertGiftMessage = async ({ conversationId, senderId, giftId }) => {
  const { rows } = await db.query(
    `
    INSERT INTO messages (conversation_id, sender_id, message_type, gift_id, status)
    VALUES ($1, $2, 'gift', $3, 'sent')
    RETURNING *;
    `,
    [conversationId, senderId, giftId]
  );

  const message = rows[0];

  // Join with gift_catalog to get name + image
  const { rows: giftRows } = await db.query(
    `
    SELECT name AS gift_name, image_path AS gift_image_path
    FROM gift_catalog
    WHERE id = $1
    `,
    [giftId]
  );

  if (giftRows.length > 0) {
    message.gift_name = giftRows[0].gift_name;
    message.gift_image_path = giftRows[0].gift_image_path;
  }

  return message;
};



module.exports = {getGiftById, insertGiftMessage , logGiftTransaction, deductUserCoins , fetchAllGifts , getUserCoinBalance}