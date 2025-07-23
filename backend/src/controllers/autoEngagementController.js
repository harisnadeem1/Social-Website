const autoEngagementModel = require('../models/autoEngagementModel');

const generateRotationLoop = async (req, res) => {
    console.log("Rotation Body--------------");

    console.log(req.user.id);
  const userId = req.user.id;
  try {
    await autoEngagementModel.createRotationLoop(userId);
    res.status(200).json({ message: 'Rotation loop generated.' });
  } catch (err) {
    console.error('Rotation Loop Error:', err);
    res.status(500).json({ error: 'Failed to generate rotation loop' });
  }
};

const scheduleDay1Actions = async (req, res) => {
    console.log("Day 1Body--------------");
    console.log(req.user.id);

  const userId = req.user.id;
  try {
    await autoEngagementModel.triggerDay1Sequence(userId);
    res.status(200).json({ message: 'Day 1 actions scheduled.' });
  } catch (err) {
    console.error('Day 1 Scheduling Error:', err);
    res.status(500).json({ error: 'Failed to schedule Day 1 actions' });
  }
};




const db = require('../config/db');

const triggerDailyEngagements = async (req, res) => {
  try {
    const users = await db.query(`
      SELECT id, first_login_at FROM users
      WHERE role = 'user' AND first_login_at IS NOT NULL
    `);

    const today = new Date();

    for (const user of users.rows) {
      const { id: userId, first_login_at } = user;

      const dayDiff = Math.floor((today - new Date(first_login_at)) / (1000 * 60 * 60 * 24)) + 1;
      if (dayDiff < 2 || dayDiff > 30) continue;

      const actions = await db.query(`
        SELECT girl_id, action FROM rotation_loops
        WHERE user_id = $1 AND day_number = $2
      `, [userId, dayDiff]);

      for (const { girl_id, action } of actions.rows) {
        // Prevent duplicates
        const exists = await db.query(`
          SELECT 1 FROM auto_engagement_logs
          WHERE user_id = $1 AND girl_id = $2 AND action = $3 AND DATE(triggered_on) = CURRENT_DATE
        `, [userId, girl_id, action]);

        if (exists.rows.length) continue;

        if (action === 'message') {
          // Check for existing conversation
          const existingConvo = await db.query(`
            SELECT id FROM conversations
            WHERE user_id = $1 AND girl_id = $2
            LIMIT 1
          `, [userId, girl_id]);

          let convoId;
          if (existingConvo.rows.length > 0) {
            convoId = existingConvo.rows[0].id;
          } else {
            const convo = await db.query(`
              INSERT INTO conversations (user_id, girl_id)
              VALUES ($1, $2) RETURNING id
            `, [userId, girl_id]);
            convoId = convo.rows[0].id;
          }

          const msg = await db.query(`
            SELECT content FROM flirty_templates
            WHERE category = 'default' AND is_active = true
            ORDER BY RANDOM() LIMIT 1
          `);

          if (msg.rows.length === 0) {
            console.warn(`⚠️ No flirty templates found for user ${userId}`);
            continue;
          }

          await db.query(`
            INSERT INTO messages (conversation_id, sender_id, content)
            VALUES ($1, $2, $3)
          `, [convoId, girl_id, msg.rows[0].content]);

        } else if (action === 'wink') {
          await db.query(`
            INSERT INTO winks (sender_id, receiver_id)
            VALUES ($1, $2)
          `, [girl_id, userId]);

          await db.query(`
            INSERT INTO notifications (user_id, sender_id, type, content)
            VALUES ($1, $2, 'wink', 'You have been winked at!')
          `, [userId, girl_id]);

        } else if (action === 'like') {
          await db.query(`
            INSERT INTO likes (sender_id, receiver_id)
            VALUES ($1, $2)
          `, [girl_id, userId]);

          await db.query(`
            INSERT INTO notifications (user_id, sender_id, type, content)
            VALUES ($1, $2, 'like', 'You have been liked!')
          `, [userId, girl_id]);
        }

        // Log the auto engagement
        await db.query(`
          INSERT INTO auto_engagement_logs (user_id, girl_id, action)
          VALUES ($1, $2, $3)
        `, [userId, girl_id, action]);
      }
    }

    res.status(200).json({ message: '✅ Daily engagement triggered.' });
  } catch (err) {
    console.error('❌ Daily engagement error:', err);
    res.status(500).json({ error: 'Failed to run daily engagement' });
  }
};




module.exports = {generateRotationLoop, scheduleDay1Actions, triggerDailyEngagements}
