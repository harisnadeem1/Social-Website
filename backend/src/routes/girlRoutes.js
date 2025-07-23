const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { getGirlProfileById } = require("../controllers/girlController");

router.get("/public", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        p.id, 
        p.name, 
        p.age, 
        p.city, 
        p.gender, 
        p.height, 
        p.bio, 
        p.interests, 
        p.profile_image_url,
        p.is_verified
      FROM profiles p
      JOIN users u ON p.user_id = u.id
      WHERE u.role = 'girl'
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching girl profiles:", err.message);
    res.status(500).json({ error: "Failed to fetch profiles" });
  }
});



router.get("/profile/get/:id", getGirlProfileById);

module.exports = router;
