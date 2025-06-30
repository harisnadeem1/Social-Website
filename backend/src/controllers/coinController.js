const db = require('../config/db'); // adjust path if needed

const getCoinBalance = async (req, res) => {
  const userId = req.params.userId;

  try {
    const result = await db.query(
      'SELECT balance FROM coins WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Coin balance not found' });
    }

    res.json({ balance: result.rows[0].balance });
  } catch (err) {
    console.error("Error fetching coin balance:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { getCoinBalance };
