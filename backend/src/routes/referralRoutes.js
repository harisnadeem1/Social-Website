const express = require("express");
const { trackClick } = require("../controllers/referralController");

const router = express.Router();

// Track referral clicks
router.post("/click", trackClick);

module.exports = router;
