const bcrypt = require("bcryptjs");
const db = require("../config/db"); // adjust path as needed

const createUser = async (req, res) => {

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
    console.log("👉 Enhanced Stats API hit");

    // ===================================
    // 1. BASIC TOTALS (Your existing stats)
    // ===================================
    const totalUsersRes = await db.query("SELECT COUNT(*) AS total_users FROM users WHERE role = 'user'");
    const totalAdminsRes = await db.query("SELECT COUNT(*) AS total_admins FROM users WHERE role = 'admin'");
    const totalChattersRes = await db.query("SELECT COUNT(*) AS total_chatters FROM users WHERE role = 'chatter'");
    const totalGirls = await db.query("SELECT COUNT(*) AS girls FROM users WHERE role = 'girl'");
    
    const totalRevenueRes = await db.query("SELECT COALESCE(SUM(amount), 0) AS total_revenue FROM transactions WHERE type = 'buy'");
    const coinsPurchasedRes = await db.query("SELECT COALESCE(SUM(amount), 0) AS coins_purchased FROM transactions WHERE type = 'buy'");

    // ===================================
    // 2. TODAY'S ACTIVITY
    // ===================================
    const todaySignupsRes = await db.query(`
      SELECT COUNT(*) as today_signups 
      FROM users 
      WHERE role = 'user' 
        AND DATE(created_at) = CURRENT_DATE
    `);

    const dailyActiveUsersRes = await db.query(`
      SELECT COUNT(DISTINCT c.user_id) as daily_active_users
      FROM conversations c
      JOIN users u ON c.user_id = u.id
      WHERE u.role = 'user' 
        AND DATE(c.last_activity) = CURRENT_DATE
    `);

    const todayRevenueRes = await db.query(`
      SELECT COALESCE(SUM(amount), 0) as today_revenue
      FROM transactions 
      WHERE type = 'buy' 
        AND DATE(created_at) = CURRENT_DATE
    `);

    const todayChatsRes = await db.query(`
      SELECT 
    COUNT(DISTINCT c.id) AS today_chats,    -- unique conversations with user replies today
    COUNT(m.id) AS today_messages           -- total user messages today
FROM conversations c
JOIN messages m ON m.conversation_id = c.id
JOIN users u ON m.sender_id = u.id
WHERE u.role = 'user'
  AND DATE(m.sent_at) = CURRENT_DATE;


    `);

    // ===================================
    // 3. WEEKLY/MONTHLY REVENUE
    // ===================================
    const weeklyRevenueRes = await db.query(`
      SELECT COALESCE(SUM(amount), 0) as weekly_revenue
      FROM transactions 
      WHERE type = 'buy' 
        AND created_at >= CURRENT_DATE - INTERVAL '7 days'
    `);

    const monthlyRevenueRes = await db.query(`
      SELECT COALESCE(SUM(amount), 0) as monthly_revenue
      FROM transactions 
      WHERE type = 'buy' 
        AND created_at >= CURRENT_DATE - INTERVAL '30 days'
    `);

    // ===================================
    // 4. DAILY SIGNUPS CHART DATA (Multiple periods)
    // ===================================
    const dailySignups7DaysRes = await db.query(`
      SELECT 
        DATE(created_at) as signup_date,
        COUNT(*) as new_users
      FROM users 
      WHERE role = 'user' 
        AND created_at >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY signup_date ASC
    `);

    const dailySignups30DaysRes = await db.query(`
      SELECT 
        DATE(created_at) as signup_date,
        COUNT(*) as new_users
      FROM users 
      WHERE role = 'user' 
        AND created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY signup_date ASC
    `);

    const dailySignups90DaysRes = await db.query(`
      SELECT 
        DATE(created_at) as signup_date,
        COUNT(*) as new_users
      FROM users 
      WHERE role = 'user' 
        AND created_at >= CURRENT_DATE - INTERVAL '90 days'
      GROUP BY DATE(created_at)
      ORDER BY signup_date ASC
    `);

    // ===================================
    // 5. DAILY REVENUE CHART DATA (Multiple periods)
    // ===================================
    const dailyRevenue7DaysRes = await db.query(`
      SELECT 
        DATE(created_at) as revenue_date,
        COALESCE(SUM(amount), 0) as daily_revenue,
        COUNT(*) as transaction_count
      FROM transactions 
      WHERE type = 'buy' 
        AND created_at >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY revenue_date ASC
    `);

    const dailyRevenue30DaysRes = await db.query(`
      SELECT 
        DATE(created_at) as revenue_date,
        COALESCE(SUM(amount), 0) as daily_revenue,
        COUNT(*) as transaction_count
      FROM transactions 
      WHERE type = 'buy' 
        AND created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY revenue_date ASC
    `);

    const dailyRevenue90DaysRes = await db.query(`
      SELECT 
        DATE(created_at) as revenue_date,
        COALESCE(SUM(amount), 0) as daily_revenue,
        COUNT(*) as transaction_count
      FROM transactions 
      WHERE type = 'buy' 
        AND created_at >= CURRENT_DATE - INTERVAL '90 days'
      GROUP BY DATE(created_at)
      ORDER BY revenue_date ASC
    `);

    // ===================================
    // 6. DAILY CHAT ACTIVITY (Last 7 days)
    // ===================================
    const dailyChatsRes = await db.query(`
    SELECT 
    DATE(m.sent_at) AS chat_date,
    COUNT(DISTINCT c.id) AS new_chats,       -- count unique chats with user replies
    COUNT(m.id) AS total_messages            -- count all user messages
FROM conversations c
JOIN messages m ON m.conversation_id = c.id
JOIN users u ON m.sender_id = u.id
WHERE u.role = 'user'
  AND m.sent_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(m.sent_at)
ORDER BY chat_date DESC;

    `);

    // ===================================
    // 7. TOP COIN BUYERS
    // ===================================
    const topBuyersRes = await db.query(`
      SELECT 
        u.id,
        u.full_name,
        u.email,
        COALESCE(SUM(t.amount), 0) as total_spent,
        COUNT(t.id) as purchase_count
      FROM users u
      LEFT JOIN transactions t ON u.id = t.user_id AND t.type = 'buy'
      WHERE u.role = 'user'
      GROUP BY u.id, u.full_name, u.email
      HAVING COALESCE(SUM(t.amount), 0) > 0
      ORDER BY total_spent DESC
      LIMIT 5
    `);

    // ===================================
    // 8. AVERAGE REVENUE PER USER (ARPU)
    // ===================================
    const arpuRes = await db.query(`
      SELECT 
        CASE 
          WHEN COUNT(DISTINCT u.id) > 0 
          THEN ROUND(COALESCE(SUM(t.amount), 0)::decimal / COUNT(DISTINCT u.id), 2)
          ELSE 0 
        END as average_revenue_per_user
      FROM users u
      LEFT JOIN transactions t ON u.id = t.user_id AND t.type = 'buy'
      WHERE u.role = 'user'
    `);

    // ===================================
    // 9. CONVERSION METRICS
    // ===================================
    const conversionRes = await db.query(`
      SELECT 
        COUNT(DISTINCT CASE WHEN t.id IS NOT NULL THEN u.id END) as paying_users,
        COUNT(DISTINCT u.id) as total_users,
        CASE 
          WHEN COUNT(DISTINCT u.id) > 0 
          THEN ROUND((COUNT(DISTINCT CASE WHEN t.id IS NOT NULL THEN u.id END)::decimal / COUNT(DISTINCT u.id) * 100), 2)
          ELSE 0 
        END as conversion_rate
      FROM users u
      LEFT JOIN transactions t ON u.id = t.user_id AND t.type = 'buy'
      WHERE u.role = 'user'
    `);

    // ===================================
    // 10. GIFT STATS (if you have gifts)
    // ===================================
    const giftStatsRes = await db.query(`
      SELECT 
        COUNT(*) as gifts_sent_today,
        COALESCE(SUM(gc.coin_cost), 0) as gift_coins_spent_today
      FROM messages m
      JOIN conversations c ON m.conversation_id = c.id
      JOIN users u ON c.user_id = u.id
      LEFT JOIN gift_catalog gc ON m.gift_id = gc.id
      WHERE m.message_type = 'gift' 
        AND u.role = 'user'
        AND DATE(m.sent_at) = CURRENT_DATE
    `);

    // ===================================
    // 11. MESSAGE ACTIVITY
    // ===================================
    const messageStatsRes = await db.query(`
      SELECT 
        COUNT(*) as total_messages_today,
        COUNT(DISTINCT m.conversation_id) as active_conversations_today
      FROM messages m
      JOIN conversations c ON m.conversation_id = c.id
      JOIN users u ON c.user_id = u.id
      WHERE u.role = 'user'
        AND DATE(m.sent_at) = CURRENT_DATE
    `);

    // ===================================
    // WEEKLY ACTIVE USERS
    // ===================================
    const weeklyActiveUsersRes = await db.query(`
      SELECT COUNT(DISTINCT c.user_id) as weekly_active_users
      FROM conversations c
      JOIN users u ON c.user_id = u.id
      WHERE u.role = 'user'
        AND c.last_activity >= CURRENT_DATE - INTERVAL '7 days'
    `);

    // ===================================
    // FORMAT CHART DATA FOR MULTIPLE PERIODS
    // ===================================
    
    // Format daily signups for different periods
    const chartSignups = {
      '7days': dailySignups7DaysRes.rows.map(row => ({
        date: row.signup_date,
        users: parseInt(row.new_users)
      })),
      '30days': dailySignups30DaysRes.rows.map(row => ({
        date: row.signup_date,
        users: parseInt(row.new_users)
      })),
      '90days': dailySignups90DaysRes.rows.map(row => ({
        date: row.signup_date,
        users: parseInt(row.new_users)
      }))
    };

    // Format daily revenue for different periods
    const chartRevenue = {
      '7days': dailyRevenue7DaysRes.rows.map(row => ({
        date: row.revenue_date,
        revenue: parseInt(row.daily_revenue),
        transactions: parseInt(row.transaction_count)
      })),
      '30days': dailyRevenue30DaysRes.rows.map(row => ({
        date: row.revenue_date,
        revenue: parseInt(row.daily_revenue),
        transactions: parseInt(row.transaction_count)
      })),
      '90days': dailyRevenue90DaysRes.rows.map(row => ({
        date: row.revenue_date,
        revenue: parseInt(row.daily_revenue),
        transactions: parseInt(row.transaction_count)
      }))
    };

    // Format daily chats for chart
    const chartChats = dailyChatsRes.rows.map(row => ({
      date: row.chat_date,
      chats: parseInt(row.new_chats),
      messages: parseInt(row.messages || 0)
    }));

    // User engagement pie chart data
    const paying_users = parseInt(conversionRes.rows[0].paying_users);
    const total_users = parseInt(conversionRes.rows[0].total_users);
    const free_users = total_users - paying_users;

    const userEngagement = [
      { name: 'Paying Users', value: paying_users, color: '#10B981' },
      { name: 'Free Users', value: free_users, color: '#6B7280' }
    ];

    // ===================================
    // COMPILE RESPONSE
    // ===================================
    const response = {
      // Basic totals (your existing structure)
      total_users: parseInt(totalUsersRes.rows[0].total_users),
      total_admins: parseInt(totalAdminsRes.rows[0].total_admins),
      total_chatters: parseInt(totalChattersRes.rows[0].total_chatters),
      girls: parseInt(totalGirls.rows[0].girls),
      total_revenue: parseInt(totalRevenueRes.rows[0].total_revenue),
      coins_purchased: parseInt(coinsPurchasedRes.rows[0].coins_purchased),

      // Today's activity
      today_signups: parseInt(todaySignupsRes.rows[0].today_signups),
      daily_active_users: parseInt(dailyActiveUsersRes.rows[0].daily_active_users),
      today_revenue: parseInt(todayRevenueRes.rows[0].today_revenue),
      today_chats: parseInt(todayChatsRes.rows[0].today_chats),
      
      // Period revenue
      weekly_revenue: parseInt(weeklyRevenueRes.rows[0].weekly_revenue),
      monthly_revenue: parseInt(monthlyRevenueRes.rows[0].monthly_revenue),
      weekly_active_users: parseInt(weeklyActiveUsersRes.rows[0].weekly_active_users),
      
      // Advanced metrics
      average_revenue_per_user: parseFloat(arpuRes.rows[0].average_revenue_per_user),
      conversion_rate: parseFloat(conversionRes.rows[0].conversion_rate),
      paying_users: paying_users,
      
      // Message & Gift stats
      total_messages_today: parseInt(messageStatsRes.rows[0]?.total_messages_today || 0),
      active_conversations_today: parseInt(messageStatsRes.rows[0]?.active_conversations_today || 0),
      gifts_sent_today: parseInt(giftStatsRes.rows[0]?.gifts_sent_today || 0),
      gift_coins_spent_today: parseInt(giftStatsRes.rows[0]?.gift_coins_spent_today || 0),

      // Chart data with multiple periods
      dailySignups: chartSignups,
      revenueChart: chartRevenue,
      chatActivity: chartChats,
      userEngagement: userEngagement,
      top_buyers: topBuyersRes.rows
    };

    res.status(200).json(response);
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



// const createGirlProfile = async (req, res) => {
//   try {
//     const {
//       name,
//       email,
//       password,
//       age,
//       city,
//       height,
//       interests,
//       bio,
//       profile_image_url,
//       gallery_image_urls = [], // <-- Expecting this as an array
//       is_featured = false,     // <-- New field for featured status
//       username                 // <-- New field for custom username
//     } = req.body;

//     // Validate username if profile is featured
//     if (is_featured && (!username || username.trim() === '')) {
//       return res.status(400).json({ 
//         error: "Username is required for featured profiles" 
//       });
//     }

//     // Check if username is already taken (if provided)
//     if (username && username.trim() !== '') {
//       const existingUsername = await db.query(
//         `SELECT id FROM profiles WHERE username = $1`,
//         [username.trim()]
//       );
      
//       if (existingUsername.rows.length > 0) {
//         return res.status(400).json({ 
//           error: "Username is already taken. Please choose a different one." 
//         });
//       }
//     }

//     const hashedPassword = await bcrypt.hash(password || "default123", 10);

//     // 1. Create user
//     const userResult = await db.query(
//       `INSERT INTO users (full_name, email, password, role)
//        VALUES ($1, $2, $3, 'girl') RETURNING id`,
//       [name, email, hashedPassword]
//     );

//     const user_id = userResult.rows[0].id;

//     // 2. Create profile with featured fields
//     const profileResult = await db.query(
//       `INSERT INTO profiles (
//         user_id, 
//         bio, 
//         age, 
//         gender, 
//         city, 
//         height, 
//         interests, 
//         profile_image_url, 
//         name, 
//         is_featured, 
//         username
//       )
//        VALUES ($1, $2, $3, 'female', $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
//       [
//         user_id, 
//         bio, 
//         age, 
//         city, 
//         height, 
//         interests, 
//         profile_image_url, 
//         name, 
//         is_featured, 
//         username ? username.trim() : null  // Store trimmed username or null
//       ]
//     );

//     const profile_id = profileResult.rows[0].id;

//     // 3. Insert gallery images
//     await Promise.all(
//       gallery_image_urls.map((url) =>
//         db.query(`INSERT INTO images (profile_id, image_url) VALUES ($1, $2)`, [profile_id, url])
//       )
//     );

//     // 4. Prepare response message
//     const responseMessage = is_featured 
//       ? `Featured girl profile created successfully! Profile accessible at /${username}`
//       : "Girl profile created successfully";

//     res.status(201).json({
//       message: responseMessage,
//       user_id,
//       profile_id,
//       is_featured,
//       username: is_featured ? username : null,
//       profile_url: is_featured ? `/${username}` : null
//     });

//   } catch (err) {
//     console.error("Error creating girl profile:", err);
    
//     // Handle specific database errors
//     if (err.code === '23505') { // PostgreSQL unique constraint violation
//       return res.status(400).json({ 
//         error: "Username or email already exists" 
//       });
//     }
    
//     res.status(500).json({ error: "Failed to create girl profile" });
//   }
// };


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
      gallery_image_urls = [], // <-- Expecting this as an array
      is_featured = false,     // <-- Field for featured status
      username,                // <-- Field for custom username
      is_verified = false      // <-- NEW: Field for verified status
    } = req.body;

    // Validate username if profile is featured
    if (is_featured && (!username || username.trim() === '')) {
      return res.status(400).json({ 
        error: "Username is required for featured profiles" 
      });
    }

    // Check if username is already taken (if provided)
    if (username && username.trim() !== '') {
      const existingUsername = await db.query(
        `SELECT id FROM profiles WHERE username = $1`,
        [username.trim()]
      );
      
      if (existingUsername.rows.length > 0) {
        return res.status(400).json({ 
          error: "Username is already taken. Please choose a different one." 
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password || "default123", 10);

    // 1. Create user
    const userResult = await db.query(
      `INSERT INTO users (full_name, email, password, role)
       VALUES ($1, $2, $3, 'girl') RETURNING id`,
      [name, email, hashedPassword]
    );

    const user_id = userResult.rows[0].id;

    // 2. Create profile with featured and verified fields
    const profileResult = await db.query(
      `INSERT INTO profiles (
        user_id, 
        bio, 
        age, 
        gender, 
        city, 
        height, 
        interests, 
        profile_image_url, 
        name, 
        is_featured, 
        username,
        is_verified
      )
       VALUES ($1, $2, $3, 'female', $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
      [
        user_id, 
        bio, 
        age, 
        city, 
        height, 
        interests, 
        profile_image_url, 
        name, 
        is_featured, 
        username ? username.trim() : null,  // Store trimmed username or null
        is_verified  // NEW: Store verification status
      ]
    );

    const profile_id = profileResult.rows[0].id;

    // 3. Insert gallery images
    await Promise.all(
      gallery_image_urls.map((url) =>
        db.query(`INSERT INTO images (profile_id, image_url) VALUES ($1, $2)`, [profile_id, url])
      )
    );

    // 4. Prepare enhanced response message with verification status
    let responseMessage = "Girl profile created successfully";
    
    if (is_featured && is_verified) {
      responseMessage = `Featured & Verified girl profile created successfully! Profile accessible at /${username} with verification badge`;
    } else if (is_featured) {
      responseMessage = `Featured girl profile created successfully! Profile accessible at /${username}`;
    } else if (is_verified) {
      responseMessage = "Verified girl profile created successfully with verification badge";
    }

    res.status(201).json({
      message: responseMessage,
      user_id,
      profile_id,
      is_featured,
      is_verified,  // NEW: Include verification status in response
      username: is_featured ? username : null,
      profile_url: is_featured ? `/${username}` : null,
      verification_status: is_verified ? 'verified' : 'unverified'  // Additional status info
    });

  } catch (err) {
    console.error("Error creating girl profile:", err);
    
    // Handle specific database errors
    if (err.code === '23505') { // PostgreSQL unique constraint violation
      return res.status(400).json({ 
        error: "Username or email already exists" 
      });
    }
    
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



