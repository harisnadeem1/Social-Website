const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const authRoutes = require("./src/routes/authRoutes");
const profileRoutes = require('./src/routes/profileRoutes');
const adminRouter = require("./src/routes/adminRoutes");
const girlRoutes = require('./src/routes/girlRoutes');
const winkRoutes = require('./src/routes/winkRoutes');
const likeRoutes = require('./src/routes/likeRoutes');
const coinRoutes = require('./src/routes/coinsRoutes');
const userConversationRoutes = require('./src/routes/userConversationRoutes');
const conversationRoutes = require('./src/routes/conversationRoutes');
const messageRoutes = require('./src/routes/messageRoutes');
const chatterRoutes = require('./src/routes/chatterRoutes');
const chatterLockRoutes = require('./src/routes/chatterLockRoutes');
const chatterLikeRoutes = require('./src/routes/chatterLikes');
const boostRoutes = require('./src/routes/boostRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const userRoutes = require('./src/routes/userRoutes');
const giftRoutes = require('./src/routes/giftRoutes');
const imageRoutes = require('./src/routes/imagesRoutes');
const publicProfileRoutes = require('./src/routes/publicProfileRoutes');
const autoEngagementRoutes = require('./src/routes/autoEngagementRoutes');
const mobilenavRoutes = require('./src/routes/mobilenav');

const affiliateRoutes = require("./src/routes/affiliateRoutes");
const affiliateDashboardRoutes = require("./src/routes/affiliateDashboardRoutes");
const referralRoutes = require("./src/routes/referralRoutes");


// Shopify integration
const shopifyRoutes = require("./src/routes/shopify");

const app = express();

// --- CORS ---
app.use(cors({
  origin: ["http://localhost:5173", "http://91.99.139.75", "https://liebenly.com"],
  credentials: true
}));

// --- Shopify webhook routes with raw body parser (MUST be before bodyParser.json()) ---
app.use('/api/shopify', express.raw({ type: 'application/json' }), shopifyRoutes);

// --- Standard JSON body parser for all other routes ---
app.use(bodyParser.json());

// --- Other Routes ---
app.use("/api/auth", authRoutes);
app.use('/api/profile', profileRoutes);
app.use("/api/admin", adminRouter);
app.use("/api/girls", girlRoutes);
app.use('/api/coins', coinRoutes);
app.use('/api/winks', winkRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/users', userConversationRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/chatter', chatterRoutes);
app.use('/api/chatter-lock', chatterLockRoutes);
app.use('/api/auto-engagement', autoEngagementRoutes);
app.use('/api/chatter/likes', chatterLikeRoutes);
app.use('/api/boost-profile', boostRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users/settings', userRoutes);
app.use('/api/gifts', giftRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/public', publicProfileRoutes);
app.use('/api/mobilenav', mobilenavRoutes);

app.use("/api/affiliates", affiliateRoutes);
app.use("/api/affiliate", affiliateDashboardRoutes);
app.use("/api/referral", referralRoutes);



module.exports = app;