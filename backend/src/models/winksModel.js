const pool = require('../config/db');

const respondToWink = async (winkId) => {
    console.log(winkId);
  const client = await pool.connect();


  try {
    await client.query('BEGIN');

    // 1. Get wink info
    console.log("in 1");

    const winkRes = await client.query(
      `SELECT w.*, u.full_name AS user_name, p.name AS girl_name
       FROM winks w
       JOIN users u ON w.sender_id = u.id
       JOIN profiles p ON w.receiver_id = p.user_id
       WHERE w.id = $1`,
      [winkId]
    );
    const wink = winkRes.rows[0];
    if (!wink) throw new Error("Wink not found");
    console.log(wink);

    const userId = wink.sender_id;
    const girlProfileId = wink.receiver_id;

    // 2. Get girl user ID
    console.log("in 2");

    const girlRes = await client.query(
      `SELECT id, name FROM profiles WHERE user_id = $1`,
      [girlProfileId]
    );
    const girlUserId = wink.receiver_id;
    const girlName = girlRes.rows[0].name;

    // 3. Delete the wink
    console.log("in 3");

    await client.query(`DELETE FROM winks WHERE id = $1`, [winkId]);

    // 4. Create a notification
    console.log("in 4");

    await client.query(
      `INSERT INTO notifications (user_id, sender_id, type, content)
       VALUES ($1, $2, 'wink', $3)`,
      [userId, girlUserId, `${girlName} winked at you`]
    );

    // 5. Check if conversation already exists
    console.log("in 5");

    console.log(girlUserId);
    

    const convoRes = await client.query(
      `SELECT id FROM conversations WHERE user_id = $1 AND girl_id = $2`,
      [userId, girlUserId]
    );

    let conversationId;
    if (convoRes.rows.length > 0) {
      conversationId = convoRes.rows[0].id;
    } else {
      const newConvo = await client.query(
        `INSERT INTO conversations (user_id, girl_id)
         VALUES ($1, $2) RETURNING id`,
        [userId, girlUserId]
      );
      conversationId = newConvo.rows[0].id;
    }

    // 6. Send predefined message
    console.log("in 6");

    const message = "Hey! I noticed your wink 😊";
    await client.query(
      `INSERT INTO messages (conversation_id, sender_id, content, status)
       VALUES ($1, $2, $3, 'sent')`,
      [conversationId, girlUserId, message]
    );

    // ✅ Commit all operations
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error in respondToWink transaction:', err);
    throw err;
  } finally {
    client.release();
  }
};

module.exports = { respondToWink };
