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

// Shopify integration
const shopifyWebhookMiddleware = require("./src/middleware/shopifyWebhookMiddleware");
const shopifyRoutes = require("./src/routes/shopifyRoutes");

const app = express();

// --- CORS ---
app.use(cors({
  origin: ["http://localhost:5173", "http://91.99.139.75", "https://liebenly.com"],
  credentials: true
}));

// --- Shopify webhook middleware (MUST be before bodyParser.json()) ---
app.use('/api/shopify', shopifyWebhookMiddleware);

// --- Standard JSON body parser for all other routes ---
app.use(bodyParser.json());

// --- Routes ---
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

// --- Shopify webhook routes ---
app.use('/api/shopify', shopifyRoutes);

module.exports = app;