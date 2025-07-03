const db = require('../config/db');

exports.saveImage = async (profile_id, image_url) => {
  const result = await db.query('INSERT INTO images (image_url) VALUES  ($1) RETURNING id', [image_url]);
  return result.rows[0];
};


exports.createImageMessage = async ({ conversation_id, sender_id, image_id }) => {
  const result = await db.query(
    `INSERT INTO messages (conversation_id, sender_id, content, message_type, gift_id, image_id)
     VALUES ($1, $2, '', 'image', NULL, $3)
     RETURNING *`,
    [conversation_id, sender_id, image_id]
  );
  return result.rows[0];
};