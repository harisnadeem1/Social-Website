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

            // Debug log full order object
            console.log("🔹 Shopify Order Payload:", JSON.stringify(order, null, 2));

            // Shopify sometimes sends customer note here:
            const note = order.note || "";

            // Shopify might send custom attributes here:
            let attrsNote = "";
            if (order.note_attributes && order.note_attributes.length > 0) {
                attrsNote = order.note_attributes
                    .map(attr => `${attr.name}:${attr.value}`)
                    .join(";");
            }

            // Use whichever has data
            const finalNote = note || attrsNote;

            console.log("📝 Extracted Note:", finalNote);

            // Extract user_id and coins from note string
            const userIdMatch = finalNote.match(/user_id:([^;]+)/);
            const coinsMatch = finalNote.match(/coins:([^;]+)/);

            if (!userIdMatch || !coinsMatch) {
                throw new Error("Missing or invalid user_id or coins in order note");
            }

            const userId = userIdMatch[1];
            const coins = parseInt(coinsMatch[1], 10);

            // Start transaction
            await client.query("BEGIN");

            // Add coins to user
            await client.query(
                "UPDATE users SET coins = coins + $1 WHERE id = $2",
                [coins, userId]
            );

            // Log the transaction
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
