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
    const { email, password, full_name, role } = req.body;

    if (!email || !password || !full_name || !role) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await createUserByEmail(email, hashedPassword, full_name, role);

    await createInitialCoinBalance(newUser.id);

    const token = jwt.sign({ id: newUser.id, role: newUser.role }, process.env.JWT_SECRET, {
      expiresIn: "7d",
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





