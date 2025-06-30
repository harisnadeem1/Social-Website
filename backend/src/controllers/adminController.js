const bcrypt = require("bcryptjs");
const db = require("../config/db"); // adjust path as needed

const createUser = async (req, res) => {

    console.log(req.body);
  try {
    const { name, email, password, role } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query(
      `INSERT INTO users (full_name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, full_name, email, role`,
      [name, email, hashedPassword, role]
    );

    res.status(201).json({ message: "User created", user: result.rows[0] });
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


const getDashboardStats = async (req, res) => {
  try {
    console.log("👉 Stats API hit");

    const totalUsersRes = await db.query("SELECT COUNT(*) AS total_users FROM users WHERE role = 'user'");
    const totalAdminsRes = await db.query("SELECT COUNT(*) AS total_admins FROM users WHERE role = 'admin'");
    const totalChattersRes = await db.query("SELECT COUNT(*) AS total_chatters FROM users WHERE role = 'chatter'");
    
    const totalRevenueRes = await db.query("SELECT COALESCE(SUM(amount), 0) AS total_revenue FROM transactions WHERE type = 'buy'");
    const coinsPurchasedRes = await db.query("SELECT COALESCE(SUM(amount), 0) AS coins_purchased FROM transactions WHERE type = 'buy'");
    const totalGirls = await db.query("SELECT COUNT(*) AS girls FROM users WHERE role = 'girl'");

    res.status(200).json({
      total_users: parseInt(totalUsersRes.rows[0].total_users),
      total_admins: parseInt(totalAdminsRes.rows[0].total_admins),
      total_chatters: parseInt(totalChattersRes.rows[0].total_chatters),
      total_revenue: parseInt(totalRevenueRes.rows[0].total_revenue),
      coins_purchased: parseInt(coinsPurchasedRes.rows[0].coins_purchased),
      girls: parseInt(totalGirls.rows[0].girls),
    });
  } catch (err) {
    console.error("❌ Error in getDashboardStats:", err.message);
    res.status(500).json({ error: "Dashboard stats fetch failed" });
  }
};


const getAllUsers = async (req, res) => {
  try {
    const result = await db.query(`
    SELECT 
  u.id, 
  u.full_name AS name, 
  u.role, 
  COALESCE(c.balance, 0) AS coins,
  p.profile_image_url,
  CASE 
    WHEN EXISTS (
      SELECT 1 
      FROM boosts b 
      WHERE b.user_id = u.id AND b.status = 'active'
    ) THEN 'Yes' 
    ELSE 'No' 
  END AS boost
FROM users u
LEFT JOIN coins c ON u.id = c.user_id
LEFT JOIN profiles p ON u.id = p.user_id
ORDER BY u.created_at DESC;

    `);

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM users WHERE id = $1', [id]);
    res.status(200).json({ message: 'User deleted' });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ error: "Failed to delete user" });
  }
};



const createGirlProfile = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      age,
      city,
      height,
      interests,
      bio,
      profile_image_url,
      gallery_image_urls = [] // <-- Expecting this as an array
    } = req.body;

console.log("in backend======gallery")
    console.log(req.body)

    const hashedPassword = await bcrypt.hash(password || "default123", 10);

    // 1. Create user
    const userResult = await db.query(
      `INSERT INTO users (full_name, email, password, role)
       VALUES ($1, $2, $3, 'girl') RETURNING id`,
      [name, email, hashedPassword]
    );

    const user_id = userResult.rows[0].id;

    // 2. Create profile
    const profileResult = await db.query(
      `INSERT INTO profiles (user_id, bio, age, gender, city, height, interests, profile_image_url,name)
       VALUES ($1, $2, $3, 'female', $4, $5, $6, $7,$8) RETURNING id`,
      [user_id, bio, age, city, height, interests, profile_image_url,name]
    );

    const profile_id = profileResult.rows[0].id;

    console.log(gallery_image_urls);

    // 3. Insert gallery images
   await Promise.all(
  gallery_image_urls.map((url) =>
    db.query(`INSERT INTO images (profile_id, image_url) VALUES ($1, $2)`, [profile_id, url])
  )
);


    res.status(201).json({
      message: "Girl profile created",
      user_id,
      profile_id
    });

  } catch (err) {
    console.error("Error creating girl profile:", err);
    res.status(500).json({ error: "Failed to create girl profile" });
  }
};


module.exports = {
  createUser,
  getDashboardStats,
  getAllUsers,
  deleteUser,
  createGirlProfile
};



