// server.js
const http = require("http");
const dotenv = require("dotenv");
const app = require("./app");
const { Server } = require("socket.io");
const { releaseExpiredLocks } = require("./src/utils/lockCleanup");

dotenv.config();

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://91.99.139.75","https://liebenly.com"], // ✅ Add your frontend production domain here later
    methods: ["GET", "POST"],
    credentials: true
  }
  // transports: ["websocket"]
});

// Global access for emitting from controllers
global.io = io;

// Auto-release expired locks
setInterval(releaseExpiredLocks, 60 * 2000);

// Socket.IO logic
io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  socket.on("join_chat", (roomId) => {
    socket.join(roomId);
    console.log(`✅ Socket ${socket.id} joined ${roomId}`);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Socket disconnected:", socket.id);
  });
});


server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
