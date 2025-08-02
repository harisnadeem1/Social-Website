const express = require("express");
const crypto = require("crypto");
const pool = require("../config/db"); // PostgreSQL connection

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
            console.log("📦 Shopify Order Payload:", JSON.stringify(order, null, 2));

            const note = order.note || "";
            console.log("📝 Order Note:", note);

            // Parse note into key/value pairs
            const noteParts = note.split(";").reduce((acc, part) => {
                const [key, value] = part.split(":").map((x) => x?.trim());
                if (key && value) acc[key] = value;
                return acc;
            }, {});

            const userId = noteParts.user_id;
            const coins = parseInt(noteParts.coins, 10);

            if (!userId || isNaN(coins)) {
                throw new Error("Missing or invalid user_id or coins in order note");
            }

            // Start DB transaction
            await client.query("BEGIN");

            // 1️⃣ Add coins to user
            const updateResult = await client.query(
                "UPDATE users SET coins = coins + $1 WHERE id = $2 RETURNING coins",
                [coins, userId]
            );
            if (updateResult.rowCount === 0) {
                throw new Error(`User with id ${userId} not found`);
            }

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
            console.error("❌ Shopify webhook error:", err);
            res.status(400).send("Webhook error");
        } finally {
            client.release();
        }
    }
);

module.exports = router;
