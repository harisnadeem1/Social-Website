const db = require("../config/db");
const bcrypt = require("bcryptjs");

// GET all affiliates
exports.getAffiliates = async (req, res) => {
  try {
    const { rows } = await db.query(
      `
      WITH campaign_stats AS (
        SELECT 
          u.id AS affiliate_id,
          COUNT(DISTINCT rc.id) AS campaigns
        FROM users u
        LEFT JOIN referral_campaigns rc ON rc.affiliate_id = u.id
        WHERE u.role = 'affiliate'
        GROUP BY u.id
      ),
      click_stats AS (
        SELECT 
          rc.affiliate_id,
          COUNT(DISTINCT rcl.id) AS clicks
        FROM referral_campaigns rc
        LEFT JOIN referral_clicks rcl ON rcl.campaign_id = rc.id
        GROUP BY rc.affiliate_id
      ),
      signup_stats AS (
        SELECT 
          rc.affiliate_id,
          COUNT(DISTINCT su.id) AS signups
        FROM referral_campaigns rc
        LEFT JOIN users su ON su.referral_campaign_id = rc.id
        GROUP BY rc.affiliate_id
      ),
      revenue_stats AS (
        SELECT 
          rc.affiliate_id,
          COALESCE(SUM(t.amount), 0) AS revenue
        FROM referral_campaigns rc
        LEFT JOIN users su ON su.referral_campaign_id = rc.id
        LEFT JOIN transactions t ON t.user_id = su.id AND t.type = 'buy'
        GROUP BY rc.affiliate_id
      )
      SELECT 
        u.id,
        u.full_name,
        u.email,
        u.status,
        u.created_at,
        COALESCE(cs.campaigns, 0) AS campaigns,
        COALESCE(cl.clicks, 0) AS clicks,
        COALESCE(ss.signups, 0) AS signups,
        COALESCE(rs.revenue, 0) AS revenue
      FROM users u
      LEFT JOIN campaign_stats cs ON cs.affiliate_id = u.id
      LEFT JOIN click_stats cl ON cl.affiliate_id = u.id
      LEFT JOIN signup_stats ss ON ss.affiliate_id = u.id
      LEFT JOIN revenue_stats rs ON rs.affiliate_id = u.id
      WHERE u.role = 'affiliate'
      GROUP BY u.id, cs.campaigns, cl.clicks, ss.signups, rs.revenue
      ORDER BY u.created_at DESC
      `
    );

    res.json(rows);
  } catch (error) {
    console.error("Error fetching affiliates:", error);
    res.status(500).json({ error: "Failed to fetch affiliates" });
  }
};




// CREATE a new affiliate
exports.createAffiliate = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { rows } = await db.query(
      `INSERT INTO users (full_name, email, password, role, status)
       VALUES ($1, $2, $3, 'affiliate', 'active')
       RETURNING id, full_name, email, role, status, created_at`,
      [name, email, hashedPassword]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Error creating affiliate:", error);
    res.status(500).json({ error: "Failed to create affiliate" });
  }
};


exports.deleteAffiliate = async (req, res) => {
  try {
    const { id } = req.params;

    // prevent deleting non-affiliates / admins accidentally
    const { rowCount } = await db.query(
      `DELETE FROM users 
       WHERE id = $1 AND role = 'affiliate' 
       RETURNING id`,
      [id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ error: "Affiliate not found or not deletable" });
    }

    res.json({ message: "Affiliate deleted successfully" });
  } catch (error) {
    console.error("Error deleting affiliate:", error);
    res.status(500).json({ error: "Failed to delete affiliate" });
  }
};


exports.getAffiliateById = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch affiliate
    const { rows } = await db.query(
      `SELECT id, full_name, email, status, created_at 
       FROM users 
       WHERE id = $1 AND role = 'affiliate'`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Affiliate not found" });
    }

    // Campaign stats
    const { rows: campaigns } = await db.query(
      `WITH click_stats AS (
  SELECT campaign_id, COUNT(DISTINCT id) AS clicks
  FROM referral_clicks
  GROUP BY campaign_id
),
signup_stats AS (
  SELECT referral_campaign_id AS campaign_id, COUNT(DISTINCT id) AS signups
  FROM users
  GROUP BY referral_campaign_id
),
revenue_stats AS (
  SELECT u.referral_campaign_id AS campaign_id, SUM(t.amount) AS revenue
  FROM users u
  JOIN (
    SELECT user_id, SUM(amount) AS amount
    FROM transactions
    WHERE type = 'buy'
    GROUP BY user_id
  ) t ON t.user_id = u.id
  GROUP BY u.referral_campaign_id
)
SELECT 
  rc.id,
  rc.name,
  rc.link_slug AS "trackingCode",
  rc.created_at AS "createdAt",
  COALESCE(c.clicks, 0) AS clicks,
  COALESCE(s.signups, 0) AS signups,
  COALESCE(r.revenue, 0) AS revenue,
  CASE WHEN COALESCE(c.clicks, 0) > 0
       THEN ROUND((COALESCE(s.signups, 0)::decimal / COALESCE(c.clicks, 1)) * 100, 2)
       ELSE 0 END AS "conversionRate"
FROM referral_campaigns rc
LEFT JOIN click_stats c ON rc.id = c.campaign_id
LEFT JOIN signup_stats s ON rc.id = s.campaign_id
LEFT JOIN revenue_stats r ON rc.id = r.campaign_id
WHERE rc.affiliate_id = $1
ORDER BY rc.created_at DESC;


`,
      [id]
    );

    // Totals
    const totals = {
      totalClicks: campaigns.reduce((sum, c) => sum + Number(c.clicks || 0), 0),
      totalSignups: campaigns.reduce((sum, c) => sum + Number(c.signups || 0), 0),
      totalRevenue: campaigns.reduce((sum, c) => sum + Number(c.revenue || 0), 0),
      conversionRate: campaigns.length
        ? Number(
            (
              campaigns.reduce((s, c) => s + Number(c.signups || 0), 0) /
              Math.max(1, campaigns.reduce((s, c) => s + Number(c.clicks || 0), 0))
            ) * 100
          ).toFixed(2)
        : 0
    };

    res.json({ affiliate: rows[0], campaigns, totals });
  } catch (error) {
    console.error("Error fetching affiliate:", error);
    res.status(500).json({ message: "Error fetching affiliate details" });
  }
};

