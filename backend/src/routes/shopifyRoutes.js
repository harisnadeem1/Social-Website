const express = require('express');
const router = express.Router();
const ShopifyController = require('../controllers/shopifyController');

// Webhook endpoints (no auth required for webhooks)
router.post('/webhook/order/paid', ShopifyController.handleOrderPaid);

// Coin balance endpoint (with auth)
router.get('/coins/balance', ShopifyController.getCoinBalanceAPI);

module.exports = router;