const express = require("express");
const router = express.Router();
const { createUser ,getDashboardStats, getAllUsers, deleteUser, createGirlProfile } = require("../controllers/adminController");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

router.post("/create-girl-profile", verifyToken, isAdmin, createGirlProfile);



// Add these:
router.get("/users", verifyToken, isAdmin, getAllUsers);
router.delete("/users/:id", verifyToken, isAdmin, deleteUser);

router.get("/stats", verifyToken, isAdmin, getDashboardStats);

router.post("/create", verifyToken, isAdmin, createUser);
router.get("/stats", verifyToken, isAdmin, getDashboardStats);


module.exports = router;
