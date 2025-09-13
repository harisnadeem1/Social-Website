const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { getGirlProfileById } = require("../controllers/girlController");

router.get("/public", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    
    // Extract filter parameters
    const { ageMin, ageMax, gender, location, intent, search } = req.query;
    
    // Build dynamic WHERE clause
    let whereConditions = ["u.role = 'girl'"];
    let queryParams = [];
    let paramIndex = 1;
    
    if (ageMin) {
      whereConditions.push(`p.age >= $${paramIndex}`);
      queryParams.push(parseInt(ageMin));
      paramIndex++;
    }
    
    if (ageMax) {
      whereConditions.push(`p.age <= $${paramIndex}`);
      queryParams.push(parseInt(ageMax));
      paramIndex++;
    }
    
    if (gender) {
      whereConditions.push(`p.gender = $${paramIndex}`);
      queryParams.push(gender);
      paramIndex++;
    }
    
    if (location) {
      whereConditions.push(`LOWER(p.city) LIKE LOWER($${paramIndex})`);
      queryParams.push(`%${location}%`);
      paramIndex++;
    }
    
    if (intent) {
      whereConditions.push(`p.intent = $${paramIndex}`);
      queryParams.push(intent);
      paramIndex++;
    }
    
    if (search) {
      whereConditions.push(`LOWER(p.name) LIKE LOWER($${paramIndex})`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }
    
    const whereClause = whereConditions.join(' AND ');
    
    // Add pagination parameters
    queryParams.push(limit, offset);
    
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
      WHERE ${whereClause}
      ORDER BY p.id DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, queryParams);

    // Get total count with same filters (for pagination info)
    const countResult = await db.query(`
      SELECT COUNT(*) as total
      FROM profiles p
      JOIN users u ON p.user_id = u.id
      WHERE ${whereClause}
    `, queryParams.slice(0, -2)); // Remove limit and offset for count

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    res.json({
      profiles: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages
      }
    });
  } catch (err) {
    console.error("Error fetching girl profiles:", err.message);
    res.status(500).json({ error: "Failed to fetch profiles" });
  }
});



router.get("/profile/get/:id", getGirlProfileById);

module.exports = router;
