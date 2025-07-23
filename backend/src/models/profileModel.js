const db = require('../config/db'); // PostgreSQL pool instance

const createProfile = async ({
  
  user_id,
  age,
  gender,
  city,
  height,
  bio,
  interests,
  profile_image_url,
  name
}) => {
  const insertQuery = `
    INSERT INTO profiles 
    (user_id, age, gender, city, height, bio, interests, profile_image_url, name)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8,$9)
    RETURNING *;
  `;

  const values = [user_id, age, gender, city, height, bio, interests, profile_image_url,name];
  const result = await db.query(insertQuery, values);

  return result.rows[0]; // Return the newly created profile
};

const findByUserId = async (userId) => {
  const result = await db.query('SELECT * FROM profiles WHERE user_id = $1', [userId]);
  return result.rows[0]; // Return the profile or undefined
};



const updateProfile = async (userId, updatedFields) => {
  
  const { age, gender, city, height, bio, interests, profile_image_url,name,id } = updatedFields;
  const result = await db.query(
    `UPDATE profiles SET 
      age = $1, gender = $2, city = $3, height = $4,
      bio = $5, interests = $6, profile_image_url = $7,name=$8
     WHERE id = $9`,
    [age, gender, city, height, bio, interests, profile_image_url, name,id]
  );
  return result.rows[0];
};


const findById = async (id) => {
  const result = await db.query(`
    SELECT profiles.*, users.full_name AS name, users.id AS user_id
    FROM profiles
    JOIN users ON users.id = profiles.user_id
    WHERE profiles.id = $1
  `, [id]);

  return result.rows[0];
};

const findPublicGirlById = async (id) => {
  // First: fetch profile + user data
  const profileResult = await db.query(`
    SELECT 
      profiles.*, 
      users.full_name AS name,
      profiles.is_verified
    FROM profiles 
    JOIN users ON users.id = profiles.user_id 
    WHERE profiles.id = $1 
      AND profiles.visibility = 'public'
      AND users.role = 'girl'
  `, [id]);

  if (profileResult.rows.length === 0) return null;

  const profile = profileResult.rows[0];

  // Second: fetch gallery images
  const imagesResult = await db.query(`
    SELECT image_url 
    FROM images 
    WHERE profile_id = $1
    ORDER BY uploaded_at DESC
  `, [id]);

  // Add photos to the profile object
  profile.photos = imagesResult.rows.map(row => row.image_url);

  return profile;
};


const getUserIdByProfileId = async (profileId) => {
  const result = await db.query(
    'SELECT user_id FROM profiles WHERE id = $1',
    [profileId]
  );
  return result.rows[0];
};


const getProfileIdByUserId = async (userId) => {
  
  const result = await db.query(
    'SELECT * FROM profiles WHERE user_id = $1',
    [userId]
  );
  return result.rows[0]; // will return { id: ... } or undefined
};


const getPublicProfileByUsername = async (username) => {
  const query = `
    SELECT 
      p.id, p.name, p.age, p.city, p.gender, p.height,
      p.bio, p.interests, p.profile_image_url,
      p.visibility, p.is_featured,p.user_id,
      json_agg(json_build_object('id', i.id, 'image_url', i.image_url)) AS images
    FROM profiles p
    LEFT JOIN images i ON p.id = i.profile_id
    WHERE LOWER(p.username) = LOWER($1)
      AND p.is_featured = true
      AND p.visibility = 'public'
    GROUP BY p.id
    LIMIT 1;
  `;
  const { rows } = await db.query(query, [username]);
  return rows[0] || null;
};



module.exports = { createProfile, findByUserId,updateProfile , findById,findPublicGirlById  ,getPublicProfileByUsername ,getUserIdByProfileId , getProfileIdByUserId};
