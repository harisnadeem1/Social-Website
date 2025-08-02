const crypto = require("crypto");
const pool = require("../config/db");

function verifyShopifyWebhook(req) {
    const hmacHeader = req.get("X-Shopify-Hmac-Sha256");
    const generatedHmac = crypto
        .createHmac("sha256", process.env.SHOPIFY_WEBHOOK_SECRET)
        .update(req.body) // ✅ req.body is Buffer now
        .digest("base64");

    return crypto.timingSafeEqual(Buffer.from(hmacHeader, "utf8"), Buffer.from(generatedHmac, "utf8"));
}

exports.ordersPaid = async (req, res) => {
    if (!verifyShopifyWebhook(req)) {
        return res.status(401).send("Unauthorized");
    }

    try {
        // ✅ Parse body AFTER verification
        const order = JSON.parse(req.body.toString("utf8"));
        const note = order.note || "";

        const noteData = {};
        note.split(";").forEach(pair => {
            const [key, value] = pair.split(":");
            if (key && value) {
                noteData[key.trim()] = value.trim();
            }
        });

        const { user_id, package_price, coins } = noteData;
        if (!user_id || !coins) {
            console.log("❌ Missing required data:", { user_id, package_price, coins });
            return res.status(400).send("Invalid note data");
        }

        console.log("Webhook received:", noteData, "---------------------------");
        console.log("Processing for user:", user_id, "Package:", package_price, "Coins:", coins);

        // Start a transaction to ensure data consistency
        await pool.query('BEGIN');

        try {
            // 1. Check if user exists in coins table, if not create entry
            const coinCheck = await pool.query(
                "SELECT id, balance FROM coins WHERE user_id = $1",
                [parseInt(user_id)]
            );

            if (coinCheck.rows.length === 0) {
                // Create coins entry for user if doesn't exist
                await pool.query(
                    "INSERT INTO coins (user_id, balance, last_transaction_at) VALUES ($1, $2, NOW())",
                    [parseInt(user_id), parseInt(coins)]
                );
                console.log(`✅ Created coins entry for user ${user_id} with ${coins} coins`);
            } else {
                // Update existing coins balance
                await pool.query(
                    "UPDATE coins SET balance = balance + $1, last_transaction_at = NOW(), updated_at = NOW() WHERE user_id = $2",
                    [parseInt(coins), parseInt(user_id)]
                );
                console.log(`✅ Updated coins for user ${user_id}, added ${coins} coins`);
            }

            // 2. Record the transaction
            // Extract numeric price from package_price (e.g., "€2.99" -> "2.99")
            const numericPrice = package_price.replace(/[€$£,]/g, '').trim();
            
            await pool.query(
                `INSERT INTO transactions (user_id, amount, type, purpose, created_at)
                 VALUES ($1, $2, $3, $4, NOW())`,
                [
                    parseInt(user_id), 
                    parseFloat(numericPrice), 
                    'buy', 
                    `Coin purchase - ${coins} coins for ${package_price}`
                ]
            );

            // Commit the transaction
            await pool.query('COMMIT');

            console.log(`✅ Transaction completed: ${coins} coins added to user ${user_id} for ${package_price}`);
            res.status(200).send("Webhook processed successfully");

        } catch (dbError) {
            // Rollback on error
            await pool.query('ROLLBACK');
            throw dbError;
        }

    } catch (error) {
        console.error("❌ Error processing webhook:", error);
        
        // More detailed error logging
        if (error.code === '23503') {
            console.error("💡 Foreign key constraint error - User might not exist in users table");
        } else if (error.code === '42703') {
            console.error("💡 Column does not exist - Check table structure");
        }
        
        res.status(500).send("Server error");
    }
};