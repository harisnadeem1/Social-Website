const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./src/routes/authRoutes");
const profileRoutes = require('./src/routes/profileRoutes');
const adminRouter = require("./src/routes/adminRoutes"); // adjust path as needed
const girlRoutes = require("./src/routes/girlRoutes");
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








const app = express();
// app.use(cors());


app.use(cors({
  origin: ["http://localhost:5173", "http://91.99.139.75","https://liebenly.com"],
  credentials: true
}));



app.use(express.json());

app.use("/api/auth", authRoutes);


app.use('/api/profile', profileRoutes);

app.use("/api/admin", adminRouter); // This means /api/admin/create is valid
app.use("/api/girls", girlRoutes);
app.use('/api/coins', coinRoutes);

app.use('/api/winks', winkRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/users', userConversationRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/messages', messageRoutes);

app.use('/api/chatter', chatterRoutes);
app.use('/api/chatter-lock', chatterLockRoutes);

app.use('/api/chatter/likes', chatterLikeRoutes);
app.use('/api/boost-profile', boostRoutes);
app.use('/api/notifications', notificationRoutes);

app.use('/api/users/settings', userRoutes);
app.use('/api/gifts', giftRoutes);

app.use('/api/images', imageRoutes);
app.use('/api/public', publicProfileRoutes);


module.exports = app;