const db = require("../config/db");

exports.trackClick = async (req, res) => {

  try {
    let { link_slug } = req.body;
    let ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      req.ip;
    const userAgent = req.headers["user-agent"];

    // Remove leading slash if present
    if (link_slug.startsWith("/")) {
      link_slug = link_slug.slice(1);
    }

    // 1. Find campaign and affiliate (the user who owns the campaign)
    const result = await db.query(
      "SELECT id, affiliate_id FROM referral_campaigns WHERE link_slug = $1",
      [link_slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, msg: "Invalid referral link" });
    }

    const campaign_id = result.rows[0].id;
    const referred_user_id = result.rows[0].affiliate_id; // ✅ affiliate who owns the campaign

    // 2. Insert click details in referral_clicks
    await db.query(
      `INSERT INTO referral_clicks (campaign_id, ip_address, user_agent, referred_user_id) 
       VALUES ($1, $2, $3, $4)`,
      [campaign_id, ip, userAgent, referred_user_id]
    );

    return res.json({ success: true, message: "Click tracked successfully" });
  } catch (error) {
    console.error("Error tracking click:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};
