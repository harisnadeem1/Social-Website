const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const { 
  getAffiliateDashboard,
  createCampaign,
  deleteCampaign,
  getFeaturedGirls
} = require("../controllers/affiliateDashboardController");

// Get dashboard data (affiliate-only)
router.get("/dashboard", verifyToken, getAffiliateDashboard);

// Create a campaign
router.post("/campaigns", verifyToken, createCampaign);

// Delete a campaign
router.delete("/campaigns/:id", verifyToken, deleteCampaign);

// Get featured girls for dropdown
router.get("/featured-girls", verifyToken, getFeaturedGirls);

module.exports = router;
