const db = require("../config/db");

// ✅ Simple random alphanumeric generator
function generateTrackingCodes(length = 10) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// ✅ Unique generator with DB check
async function generateTrackingCode(length = 10) {
  let code;
  let exists = true;

  while (exists) {
    code = generateTrackingCodes(length);

    const { rows } = await db.query(
      "SELECT 1 FROM referral_campaigns WHERE link_slug=$1 LIMIT 1",
      [code]
    );

    exists = rows.length > 0;
  }

  return code;
}

// ================================
// Get affiliate dashboard
// ================================
exports.getAffiliateDashboard = async (req, res) => {
  try {
    const affiliateId = req.user.id;

    // Fetch affiliate info
    const affiliate = await db.query(
      `SELECT id, full_name, email, status, created_at 
       FROM users 
       WHERE id=$1 AND role='affiliate'`,
      [affiliateId]
    );

    if (affiliate.rows.length === 0) {
      return res.status(404).json({ error: "Affiliate not found" });
    }

    // Fetch campaigns with totals in one query
    const result = await db.query(
      `
      WITH click_stats AS (
        SELECT campaign_id, COUNT(DISTINCT id) AS clicks
        FROM referral_clicks
        GROUP BY campaign_id
      ),
      signup_stats AS (
        SELECT referral_campaign_id AS campaign_id, COUNT(DISTINCT id) AS signups
        FROM users
        WHERE referred_by = $1
        GROUP BY referral_campaign_id
      ),
      revenue_stats AS (
        SELECT u.referral_campaign_id AS campaign_id,
               SUM(t.amount) AS revenue,
               COUNT(DISTINCT t.user_id) AS unique_buyers
        FROM users u
        JOIN (
          SELECT user_id, SUM(amount) AS amount
          FROM transactions
          WHERE type = 'buy'
          GROUP BY user_id
        ) t ON t.user_id = u.id
        WHERE u.referred_by = $1
        GROUP BY u.referral_campaign_id
      ),
      campaign_data AS (
        SELECT 
          c.id,
          c.name,
          c.link_slug,
          c.created_at,
          COALESCE(cs.clicks, 0) AS clicks,
          COALESCE(ss.signups, 0) AS signups,
          COALESCE(rs.revenue, 0)::FLOAT8 AS revenue,
          COALESCE(rs.unique_buyers, 0) AS unique_buyers
        FROM referral_campaigns c
        LEFT JOIN click_stats cs ON cs.campaign_id = c.id
        LEFT JOIN signup_stats ss ON ss.campaign_id = c.id
        LEFT JOIN revenue_stats rs ON rs.campaign_id = c.id
        WHERE c.affiliate_id = $1
      )
      SELECT 
        json_agg(campaign_data) AS campaigns,
        COALESCE(SUM(clicks), 0) AS total_clicks,
        COALESCE(SUM(signups), 0) AS total_signups,
        COALESCE(SUM(revenue), 0)::FLOAT8 AS total_revenue,
        COALESCE(SUM(unique_buyers), 0) AS total_unique_buyers
      FROM campaign_data;
      `,
      [affiliateId]
    );

    // Extract data safely
    const data = result.rows[0] || {};

    res.json({
      affiliate: affiliate.rows[0],
      campaigns: data.campaigns || [],
      total_clicks: data.total_clicks || 0,
      total_signups: data.total_signups || 0,
      total_revenue: data.total_revenue || 0,
      total_unique_buyers: data.total_unique_buyers || 0,
    });
  } catch (err) {
    console.error("Error loading dashboard:", err);
    res.status(500).json({ error: "Failed to load dashboard" });
  }
};



// ================================
// Create campaign
// ================================
exports.createCampaign = async (req, res) => {
  try {
    const affiliateId = req.user.id;
    const { name, type, girl_id } = req.body; 

    if (!name) {
      return res.status(400).json({ error: "Campaign name required" });
    }

    // Generate unique referral code
    const trackingCode = await generateTrackingCode(10);

    let linkSlug;

    if (type === "girl" && girl_id) {
      // ✅ Fetch girl profile username
      const { rows } = await db.query(
        "SELECT username FROM profiles WHERE id=$1 AND is_featured=true",
        [girl_id]
      );

      if (rows.length === 0) {
        return res.status(400).json({ error: "Invalid girl selected" });
      }

      // girl profile → liebenly.com/defne?ref=CODE
      linkSlug = `${rows[0].username}?ref=${trackingCode}`;
    } else {
      // homepage → liebenly.com/?ref=CODE
      linkSlug = `?ref=${trackingCode}`;
    }

    const result = await db.query(
      `INSERT INTO referral_campaigns 
       (affiliate_id, name, link_slug, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING *`,
      [affiliateId, name, linkSlug]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating campaign:", err);
    res.status(500).json({ error: "Failed to create campaign" });
  }
};



// ================================
// Delete campaign
// ================================
exports.deleteCampaign = async (req, res) => {
  try {
    const affiliateId = req.user.id;
    const { id } = req.params;

    const result = await db.query(
      "DELETE FROM referral_campaigns WHERE id=$1 AND affiliate_id=$2 RETURNING id",
      [id, affiliateId]
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ error: "Campaign not found or not yours" });
    }

    res.json({ message: "Campaign deleted" });
  } catch (err) {
    console.error("Error deleting campaign:", err);
    res.status(500).json({ error: "Failed to delete campaign" });
  }
};

// ================================
// Get Featured Girls
// ================================
exports.getFeaturedGirls = async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT id, username, name, profile_image_url
       FROM profiles
       WHERE is_featured = true AND visibility = 'public'
       ORDER BY created_at DESC`
    );

    res.json(rows);
  } catch (err) {
    console.error("Error fetching featured girls:", err);
    res.status(500).json({ error: "Failed to fetch featured girls" });
  }
};
