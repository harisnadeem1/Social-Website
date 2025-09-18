const express = require("express");
const router = express.Router();
const { getAffiliates, createAffiliate ,deleteAffiliate, getAffiliateById } = require("../controllers/affiliateController");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

// Only admins can manage affiliates
router.get("/", verifyToken, isAdmin, getAffiliates);
router.post("/", verifyToken, isAdmin, createAffiliate);
router.delete("/:id", verifyToken, isAdmin, deleteAffiliate);
router.get("/:id", verifyToken, isAdmin, getAffiliateById);



module.exports = router;
