const db = require('../config/db');

// Utility: Get all girl IDs
async function getAllRandomGirlIds(limit = 100) {
  const result = await db.query(`
    SELECT id FROM users
    WHERE role = 'girl'
    ORDER BY RANDOM()
    LIMIT $1;
  `, [limit]);
  return result.rows.map(r => r.id);
}

// Utility: Shuffle array
function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

exports.createRotationLoop = async (userId) => {
  const girlIds = await getAllRandomGirlIds(100);
  if (girlIds.length < 30) throw new Error("Not enough girl accounts for rotation loop");

  const messageGirls = shuffle(girlIds).slice(0, 29); // 29 unique girls for messages

  const weeklyPattern = [
    { dm: 1, like: 1, wink: 1 }, // Day 2
    { dm: 1, like: 1, wink: 0 }, // Day 3
    { dm: 1, like: 0, wink: 1 }, // Day 4
    { dm: 1, like: 1, wink: 1 }, // Day 5
    { dm: 1, like: 0, wink: 0 }, // Day 6
    { dm: 1, like: 1, wink: 1 }, // Day 7
    { dm: 1, like: 1, wink: 0 }, // Day 8
  ];

  const insertValues = [];

  for (let i = 0; i < 29; i++) {
    const day = i + 2;
    const pattern = weeklyPattern[i % 7];
    const usedGirls = new Set();

    // Add DM
    if (pattern.dm === 1) {
      const girlId = messageGirls[i];
      insertValues.push({ user_id: userId, girl_id: girlId, day_number: day, action: 'message' });
      usedGirls.add(girlId);
    }

    // Add Like
    if (pattern.like === 1) {
      const available = girlIds.filter(id => !usedGirls.has(id));
      const likeGirl = shuffle(available)[0];
      insertValues.push({ user_id: userId, girl_id: likeGirl, day_number: day, action: 'like' });
      usedGirls.add(likeGirl);
    }

    // Add Wink
    if (pattern.wink === 1) {
      const available = girlIds.filter(id => !usedGirls.has(id));
      const winkGirl = shuffle(available)[0];
      insertValues.push({ user_id: userId, girl_id: winkGirl, day_number: day, action: 'wink' });
    }
  }

  // Insert into DB
  for (const row of insertValues) {
    await db.query(`
      INSERT INTO rotation_loops (user_id, girl_id, day_number, action)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT DO NOTHING
    `, [row.user_id, row.girl_id, row.day_number, row.action]);
  }
};



//If we have 87 girls

// exports.createRotationLoop = async (userId) => {
//   const girlIds = await getAllRandomGirlIds(100);
//   if (girlIds.length < 87) throw new Error("Need at least 87 girl accounts");

//   const weeklyPattern = [
//     { dm: 1, like: 1, wink: 1 }, // Day 2
//     { dm: 1, like: 1, wink: 0 }, // Day 3
//     { dm: 1, like: 0, wink: 1 }, // Day 4
//     { dm: 1, like: 1, wink: 1 }, // Day 5
//     { dm: 1, like: 0, wink: 0 }, // Day 6
//     { dm: 1, like: 1, wink: 1 }, // Day 7
//     { dm: 1, like: 1, wink: 0 }, // Day 8
//   ];

//   const shuffledGirls = shuffle(girlIds);
//   const insertValues = [];

//   let girlIndex = 0;

//   for (let i = 0; i < 29; i++) {
//     const day = i + 2;
//     const pattern = weeklyPattern[i % 7];

//     // Ensure unique girls for each action per day
//     if (pattern.dm === 1) {
//       insertValues.push({
//         user_id: userId,
//         girl_id: shuffledGirls[girlIndex++],
//         day_number: day,
//         action: 'message',
//       });
//     }
//     if (pattern.like === 1) {
//       insertValues.push({
//         user_id: userId,
//         girl_id: shuffledGirls[girlIndex++],
//         day_number: day,
//         action: 'like',
//       });
//     }
//     if (pattern.wink === 1) {
//       insertValues.push({
//         user_id: userId,
//         girl_id: shuffledGirls[girlIndex++],
//         day_number: day,
//         action: 'wink',
//       });
//     }
//   }

//   // Insert into DB
//   for (const row of insertValues) {
//     await db.query(
//       `INSERT INTO rotation_loops (user_id, girl_id, day_number, action)
//        VALUES ($1, $2, $3, $4)
//        ON CONFLICT DO NOTHING`,
//       [row.user_id, row.girl_id, row.day_number, row.action]
//     );
//   }
// };




const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;



exports.triggerDay1Sequence = async (userId) => {
  const res = await db.query(`SELECT first_login_at FROM users WHERE id = $1`, [userId]);
  if (!res.rows.length) throw new Error('User not found');

  // Set first_login_at if not already
  if (!res.rows[0].first_login_at) {
    await db.query(`UPDATE users SET first_login_at = NOW() WHERE id = $1`, [userId]);
  }

  const girlIds = await getAllRandomGirlIds(50);
  const [girl1, girl2, girl3, girl4, girl5, girl6] = shuffle(girlIds);

   const actions = [
    { delay: randomBetween(30, 60), action: 'like', girl_id: girl1 },          // 00:30–01:00
    { delay: randomBetween(90, 120), action: 'wink', girl_id: girl2 },        // 01:30–02:00
    { delay: randomBetween(240, 300), action: 'message', girl_id: girl3 },    // 04:00–05:00
    { delay: randomBetween(900, 1200), action: 'like', girl_id: girl4 },      // 15:00–20:00
    { delay: randomBetween(1800, 2100), action: 'message', girl_id: girl5 },  // 30:00–35:00
    { delay: randomBetween(2700, 3600), action: 'wink', girl_id: girl6 },     // 45:00–60:00
  ];

  for (const a of actions) {
    setTimeout(async () => {
      if (a.action === 'message') {
        const convo = await db.query(`
          INSERT INTO conversations (user_id, girl_id) VALUES ($1, $2)
          RETURNING id;
        `, [userId, a.girl_id]);

        const convoId = convo.rows[0].id;
        const msg = await db.query(`
          SELECT content FROM flirty_templates WHERE category = 'day1' AND is_active = true ORDER BY RANDOM() LIMIT 1;
        `);

        await db.query(`
          INSERT INTO messages (conversation_id, sender_id, content)
          VALUES ($1, $2, $3)
        `, [convoId, a.girl_id, msg.rows[0].content]);

        await db.query(`
          INSERT INTO auto_engagement_logs (user_id, girl_id, action)
          VALUES ($1, $2, 'message')
        `, [userId, a.girl_id]);


      } 
      else if (a.action === 'wink') {
  await db.query(`
    INSERT INTO winks (sender_id, receiver_id)
    VALUES ($1, $2)
  `, [a.girl_id, userId]);

  await db.query(`
    INSERT INTO auto_engagement_logs (user_id, girl_id, action)
    VALUES ($1, $2, 'wink')
  `, [userId, a.girl_id]);

  await db.query(`
    INSERT INTO notifications (user_id, sender_id, type, content)
    VALUES ($1, $2, 'wink', 'You have been winked at!')
  `, [userId, a.girl_id]);
}
     else if (a.action === 'like') {
  await db.query(`
    INSERT INTO likes (sender_id, receiver_id)
    VALUES ($1, $2)
  `, [a.girl_id, userId]);

  await db.query(`
    INSERT INTO auto_engagement_logs (user_id, girl_id, action)
    VALUES ($1, $2, 'like')
  `, [userId, a.girl_id]);

  await db.query(`
    INSERT INTO notifications (user_id, sender_id, type, content)
    VALUES ($1, $2, 'like', 'You have been liked!')
  `, [userId, a.girl_id]);
}

    }, a.delay * 1000);
  }
};
