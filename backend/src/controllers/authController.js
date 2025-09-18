const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { createUserByEmail,createInitialCoinBalance } = require("../models/userModel");
require("dotenv").config();
const userModel = require('../models/userModel');
const profileModel = require('../models/profileModel');
const { comparePassword } = require('../utils/hash');
const { generateToken } = require('../utils/jwt');
const db = require("../config/db");


const registerUser = async (req, res) => {
  try {
    const { email, password, role, referral_slug } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ error: "Email, password, and role are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const full_name = email.split('@')[0]; // Default name as prefix

    // 1️⃣ Create the user first
    const newUser = await createUserByEmail(email, hashedPassword, full_name, role);

    // 2️⃣ If referral_slug exists → find campaign and update user
    if (referral_slug) {
      // Remove leading slash if any
      const cleanedSlug = referral_slug.startsWith("/") ? referral_slug.slice(1) : referral_slug;

      const campaignResult = await db.query(
        `SELECT id, affiliate_id FROM referral_campaigns WHERE link_slug = $1`,
        [cleanedSlug]
      );

      if (campaignResult.rows.length > 0) {
        const { id: campaign_id, affiliate_id } = campaignResult.rows[0];

        // Update user with referral data
        await db.query(
          `UPDATE users SET referral_campaign_id = $1, referred_by = $2 WHERE id = $3`,
          [campaign_id, affiliate_id, newUser.id]
        );
      }
    }

    // 3️⃣ Create initial coin balance
    await createInitialCoinBalance(newUser.id);

    // 4️⃣ Generate JWT token
    const token = jwt.sign({ id: newUser.id, role: newUser.role }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.status(201).json({ user: newUser, token });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: err.message });
  }
};


const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check if user exists
    const user = await userModel.findByEmail(email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    // 2. Check password
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    // 3. Get user profile (if any)
    const profile = await profileModel.findByUserId(user.id);
   
    // 4. Create JWT
    const token = generateToken({ userId: user.id });

    // 5. Return response
    return res.json({
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
         profile: profile || null,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Login failed. Please try again later.' });
  }
};


module.exports = {
  registerUser,loginUser,
};





