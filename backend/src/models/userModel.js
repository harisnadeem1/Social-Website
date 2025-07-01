const db = require("../config/db");

const createUserByEmail = async (email, password, full_name, role) => {
  const result = await db.query(
    `INSERT INTO users (email, password, full_name, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, email, full_name, role, created_at`,
    [email, password, full_name, role]
  );
  return result.rows[0];
};



const createInitialCoinBalance = async (userId, amount = 50) => {
  await db.query(
    `INSERT INTO coins (user_id, balance) VALUES ($1, $2)`,
    [userId, amount]
  );
};


const findByEmail = async (email) => {
  const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
};




const updateEmail = async (userId, email) => {
  console.log(email,userId);
  
  const query = 'UPDATE users SET email = $1 WHERE id = $2';
  try {
    await db.query(query, [email, userId]);
    console.log(`✅ Email updated for user ID ${userId}`);
  } catch (error) {
    console.log(`❌ Error updating email for user ID ${userId}:`, error.message);
    throw error;
  }
};

const updatePassword = async (userId, hashedPassword) => {
  const query = 'UPDATE users SET password = $1 WHERE id = $2';
  try {
    await db.query(query, [hashedPassword, userId]);
    console.log(`✅ Password updated for user ID ${userId}`);
  } catch (error) {
    console.log(`❌ Error updating password for user ID ${userId}:`, error.message);
    throw error;
  }
};

const getUserById = async (userId) => {
  const query = 'SELECT * FROM users WHERE id = $1';
  const result = await db.query(query, [userId]);
  return result.rows[0];
};

const getEmailById = async (userId) => {
  const query = 'SELECT id, email FROM users WHERE id = $1';
  const result = await db.query(query, [userId]);
  return result.rows[0];
};


module.exports = {
  createUserByEmail, findByEmail,createInitialCoinBalance ,updateEmail ,updatePassword, getUserById ,getEmailById
};
