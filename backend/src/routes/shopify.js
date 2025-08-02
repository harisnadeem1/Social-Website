const express = require("express");
const router = express.Router();
const shopifyController = require("../controllers/shopifyController");

router.post("/orders-paid", shopifyController.ordersPaid);

module.exports = router;