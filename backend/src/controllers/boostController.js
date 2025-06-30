const boostModel = require('../models/boostModel');


exports.boostProfile = async (req, res) => {
  const userId = req.user.id;
  const boostCost = 50;

  try {
    // Attempt full boost operation via model
    const result = await boostModel.performBoost(userId, boostCost);

    return res.status(200).json({
      success: true,
      message: result.message || 'Profile successfully boosted for 24 hours.'
    });

  } catch (err) {
    console.error('Boost Error:', err.message);

    // Specific known errors
    if (err.message === 'User already has an active boost.') {
      return res.status(400).json({ error: err.message });
    }

    if (err.message === 'Insufficient coin balance.') {
      return res.status(400).json({ error: err.message });
    }

    // Unknown internal error
    return res.status(500).json({ error: 'Internal server error' });
  }
};

