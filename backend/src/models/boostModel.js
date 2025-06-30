const db = require('../config/db');

exports.checkUserHasEnoughCoins = async (userId, cost) => {
  const result = await db.query(
    'SELECT balance FROM coins WHERE user_id = $1',
    [userId]
  );
  return result.rows.length && result.rows[0].balance >= cost;
};

exports.performBoost = async (userId, cost) => {
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    // 1. Check if user already has an active boost
    const { rows: existingBoosts } = await client.query(
      `SELECT * FROM boosts 
       WHERE user_id = $1 AND status = 'active' AND ended_at > NOW()`,
      [userId]
    );

    if (existingBoosts.length > 0) {
      throw new Error('User already has an active boost.');
    }

    // 2. Deduct coins
    const coinResult = await client.query(
      `UPDATE coins 
       SET balance = balance - $1, 
           last_transaction_at = NOW(), 
           updated_at = NOW()
       WHERE user_id = $2 AND balance >= $1
       RETURNING balance`,
      [cost, userId]
    );

    if (coinResult.rows.length === 0) {
      throw new Error('Insufficient coin balance.');
    }

   

    // 4. Set is_featured = true
    await client.query(
      `UPDATE profiles 
       SET is_featured = TRUE 
       WHERE user_id = $1`,
      [userId]
    );

    // 5. Insert boost record
    await client.query(
      `INSERT INTO boosts (user_id, duration_minutes, status, started_at, ended_at) 
       VALUES ($1, 1440, 'active', NOW(), NOW() + interval '24 hours')`,
      [userId]
    );

    // 6. Insert notification
    await client.query(
      `INSERT INTO notifications (user_id, type, content) 
       VALUES ($1, 'boosted', 'Your profile is now boosted for 24 hours.')`,
      [userId]
    );

    await client.query('COMMIT');
    return { success: true, message: 'Boost activated.' };

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Boost failed:', error.message);
    throw error;
  } finally {
    client.release();
  }
};
