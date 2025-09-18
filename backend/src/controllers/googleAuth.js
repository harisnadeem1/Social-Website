const { OAuth2Client } = require("google-auth-library");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const pool = require("../config/db");

// Helper to get user profile details from DB
async function getUserProfile(userId) {
  const result = await pool.query(
    `SELECT id, full_name, email, role
     FROM users
     WHERE id = $1`,
    [userId]
  );
  return result.rows[0] || null;
}

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const createJwtToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Generate deterministic password from Google sub
const generateGooglePassword = (googleSub) => {
  const salt = process.env.JWT_SECRET;
  return crypto
    .createHmac("sha256", salt)
    .update(`google_${googleSub}`)
    .digest("hex")
    .substring(0, 16); // 16 chars for reasonable password length
};

const googleRegisterUser = async (req, res) => {
  try {
    const { credential, referral_slug } = req.body;

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { email, name, sub } = payload;

    // Check if user exists
    const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    let user;
    let plainPassword;
    let isNewUser = false;

    if (existingUser.rows.length === 0) {
      // Create new user
      plainPassword = generateGooglePassword(sub);
      const hashedPassword = bcrypt.hashSync(plainPassword, 10);

      const insertUser = await pool.query(
        `INSERT INTO users (full_name, email, password, role)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [name, email, hashedPassword, "user"]
      );

      user = insertUser.rows[0];
      isNewUser = true;

      // Add default coins
      await pool.query(`INSERT INTO coins (user_id, balance) VALUES ($1, $2)`, [user.id, 20]);

      // ✅ Link referral if slug exists
      if (referral_slug) {
        const cleanedSlug = referral_slug.startsWith("/") ? referral_slug.slice(1) : referral_slug;
        const campaign = await pool.query(
          `SELECT id, affiliate_id FROM referral_campaigns WHERE link_slug = $1`,
          [cleanedSlug]
        );

        if (campaign.rows.length > 0) {
          const { id: campaign_id, affiliate_id } = campaign.rows[0];
          await pool.query(
            `UPDATE users SET referral_campaign_id = $1, referred_by = $2 WHERE id = $3`,
            [campaign_id, affiliate_id, user.id]
          );
        }
      }
    } else {
      user = existingUser.rows[0];
      plainPassword = generateGooglePassword(sub);
    }

    res.json({
      email: user.email,
      password: plainPassword,
      isNewUser,
      message: isNewUser ? "New user created" : "User already exists"
    });

  } catch (error) {
    console.error("Google auth error:", error);
    res.status(400).json({ error: "Google authentication failed" });
  }
};


const googleLoginUser = async (req, res) => {
  try {
    const { credential } = req.body;

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, sub } = payload;

    // Check if user exists
    const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (existingUser.rows.length === 0) {
      return res.status(400).json({ error: "No account found. Please sign up first." });
    }

    const user = existingUser.rows[0];

    // Verify deterministic password
    const plainPassword = generateGooglePassword(sub);
    const valid = bcrypt.compareSync(plainPassword, user.password);
    if (!valid) {
      return res.status(400).json({ error: "Google login failed" });
    }

    // Create JWT
    const token = createJwtToken(user.id, user.role);

    res.json({
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        profile: await getUserProfile(user.id),
      },
    });

  } catch (error) {
    console.error("Google login error:", error);
    res.status(400).json({ error: "Google login failed" });
  }
};

module.exports = {
  googleRegisterUser,
  googleLoginUser
};
