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
module.exports = {
  createUserByEmail, findByEmail,createInitialCoinBalance
};
