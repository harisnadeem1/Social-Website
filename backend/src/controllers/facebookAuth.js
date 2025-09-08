const axios = require("axios");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const pool = require("../config/db");

const generateFacebookPassword = (facebookId) => {
  const salt = process.env.JWT_SECRET;
  return crypto
    .createHmac("sha256", salt)
    .update(`facebook_${facebookId}`)
    .digest("hex")
    .substring(0, 16);
};

const facebookRegisterUser = async (req, res) => {
  try {
    const { accessToken } = req.body;
    if (!accessToken) return res.status(400).json({ error: "Access token required" });

    // Get user data from Facebook
    const fbRes = await axios.get(
      `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`
    );

    const { id: facebookId, name, email, picture } = fbRes.data;
    if (!email) return res.status(400).json({ error: "Facebook account has no email" });

    // Check if user exists
    const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    let user;
    let plainPassword;
    let isNewUser = false;

    if (existingUser.rows.length === 0) {
      // New user
      plainPassword = generateFacebookPassword(facebookId);
      const hashedPassword = bcrypt.hashSync(plainPassword, 10);

      const insertUser = await pool.query(
        `INSERT INTO users (full_name, email, password, role)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [name, email, hashedPassword, "user"]
      );

      user = insertUser.rows[0];
      isNewUser = true;

      await pool.query(`INSERT INTO coins (user_id, balance) VALUES ($1, $2)`, [user.id, 20]);
      await pool.query(
        `INSERT INTO profiles (user_id, profile_image_url) VALUES ($1, $2)`,
        [user.id, picture?.data?.url || null]
      );
    } else {
      user = existingUser.rows[0];
      plainPassword = generateFacebookPassword(facebookId);
    }

    res.json({
      email: user.email,
      password: plainPassword,
      isNewUser,
      message: isNewUser ? "New user created" : "User already exists",
    });
  } catch (error) {
    console.error("Facebook auth error:", error.response?.data || error.message);
    res.status(400).json({ error: "Facebook authentication failed" });
  }
};

module.exports = { facebookRegisterUser };
