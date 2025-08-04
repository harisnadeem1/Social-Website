const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { createUserByEmail,createInitialCoinBalance } = require("../models/userModel");
require("dotenv").config();
const userModel = require('../models/userModel');
const profileModel = require('../models/profileModel');
const { comparePassword } = require('../utils/hash');
const { generateToken } = require('../utils/jwt');

const registerUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ error: "Email, password, and role are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Use email as default full_name or set it to null/empty string
    const full_name = email.split('@')[0]; // Use email prefix as default name
    
    const newUser = await createUserByEmail(email, hashedPassword, full_name, role);

    await createInitialCoinBalance(newUser.id);

    const token = jwt.sign({ id: newUser.id, role: newUser.role }, process.env.JWT_SECRET, {
      expiresIn: "30d", // Changed from 7d to 30d
    });

    res.status(201).json({ user: newUser, token });
  } catch (err) {
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





