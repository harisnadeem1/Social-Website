const express = require("express");
const crypto = require("crypto");
const pool = require("../config/db"); // Adjust path to your PostgreSQL connection

const router = express.Router();

// Verify Shopify webhook signature
function verifyShopifyWebhook(req, res, buf) {
    const hmac = req.get("X-Shopify-Hmac-Sha256");
    const generatedHash = crypto
        .createHmac("sha256", process.env.SHOPIFY_WEBHOOK_SECRET)
        .update(buf, "utf8")
        .digest("base64");

    if (generatedHash !== hmac) {
        throw new Error("Invalid Shopify webhook signature");
    }
}

router.post(
    "/webhook/orders-paid",
    express.json({ verify: verifyShopifyWebhook }),
    async (req, res) => {
        const client = await pool.connect();

        try {
            const order = req.body;
            const note = order.note || "";

            console.log("Shopify Order Paid:", order.id, note);

            // Extract user_id and coins from note
            const userIdMatch = note.match(/user_id:([^;]+)/);
            const coinsMatch = note.match(/coins:([^;]+)/);

            if (!userIdMatch || !coinsMatch) {
                throw new Error("Missing user_id or coins in order note");
            }

            const userId = userIdMatch[1];
            const coins = parseInt(coinsMatch[1], 10);

            // Start transaction
            await client.query("BEGIN");

            // 1️⃣ Add coins to user
            await client.query(
                "UPDATE users SET coins = coins + $1 WHERE id = $2",
                [coins, userId]
            );

            // 2️⃣ Insert into transactions table
            await client.query(
                `INSERT INTO transactions (user_id, amount, transaction_type, reference, status)
                 VALUES ($1, $2, 'coin_purchase', $3, 'completed')`,
                [userId, coins, `shopify_order_${order.id}`]
            );

            await client.query("COMMIT");

            console.log(`✅ Added ${coins} coins to user ${userId}`);
            res.status(200).send("OK");
        } catch (err) {
            await client.query("ROLLBACK");
            console.error("❌ Shopify webhook error:", err.message);
            res.status(400).send("Webhook error");
        } finally {
            client.release();
        }
    }
);

module.exports = router;
