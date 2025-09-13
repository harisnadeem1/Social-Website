const cron = require("node-cron");
const db = require("../config/db");
const transporter = require("../config/mail");
const { buildEmailHTML } = require("../utils/emailTemplates");

const delay = ms => new Promise(res => setTimeout(res, ms));

cron.schedule("0 0 * * *", async () => {
  console.log("📨 Running notification email job...");

  try {
    // 1. Fetch notifications from last 24h
    const { rows: notifications } = await db.query(
      `SELECT n.user_id, n.type, n.sender_id, u.email, u.full_name,
              p.name as sender_name, p.profile_image_url, p.id as profile_id
       FROM notifications n
       JOIN users u ON n.user_id = u.id
       JOIN profiles p ON n.sender_id = p.user_id
       WHERE n.created_at >= NOW() - INTERVAL '1 day'
       ORDER BY n.user_id, n.type`
    );

    if (notifications.length === 0) {
      console.log("ℹ️ No new notifications to email.");
      return;
    }

    // 2. Group by user
    const userMap = {};
    notifications.forEach(n => {
      if (!userMap[n.user_id]) {
        userMap[n.user_id] = {
          email: n.email,
          name: n.full_name || "there",
          messages: [],
          winks: [],
          likes: [],
        };
      }
      if (n.type === "message") userMap[n.user_id].messages.push(n);
      if (n.type === "wink") userMap[n.user_id].winks.push(n);
      if (n.type === "like") userMap[n.user_id].likes.push(n);
    });

    // 3. Send emails safely
    for (const userId of Object.keys(userMap)) {
      const user = userMap[userId];
      const html = buildEmailHTML(user);

      try {
        await transporter.sendMail({
          from: '"Liebenly" <chat@liebenly.com>',
          to: user.email,
          subject: "✨ Your Daily Activity Summary on Liebenly",
          html,
        });

        console.log(`✅ Email sent to ${user.email}`);
      } catch (err) {
        console.error(`❌ Failed to send email to ${user.email}:`, err.message);
      }

      // throttle so SMTP isn't hammered
      await delay(500);
    }
  } catch (err) {
    console.error("❌ Cron job failed:", err);
  }
});
