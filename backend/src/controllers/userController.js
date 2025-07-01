const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');

exports.updateEmail = async (req, res) => {
  const  userId  = req.user.id;
  const { email }= req.body;

  try {
    await userModel.updateEmail(userId, email);
    res.status(200).json({ message: 'Email updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update email' });
  }
};

exports.updatePassword = async (req, res) => {
  const userId  = req.user.id;
  const { currentPassword, newPassword } = req.body;
  console.log(userId,currentPassword,newPassword);

  try {
    const user = await userModel.getUserById(userId);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Incorrect current password' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await userModel.updatePassword(userId, hashed);
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update password' });
  }
};


exports.getUserById = async (req, res) => {
  const userId = req.user.id;
  try {
    const user = await userModel.getUserById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Only return email and safe fields
    res.json({ id: user.id, email: user.email });
  } catch (err) {
    console.error('Error fetching user by ID:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};


exports.getEmailById = async (req, res) => {
  const userId = req.user.id;
  try {
    const user = await userModel.getEmailById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Only return email and safe fields
    res.json({ id: user.id, email: user.email });
  } catch (err) {
    console.error('Error fetching user by ID:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};