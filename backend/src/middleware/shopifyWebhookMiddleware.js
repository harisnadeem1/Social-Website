const express = require('express');

const shopifyWebhookMiddleware = (req, res, next) => {
  // Only apply raw body parsing for Shopify webhook routes
  if (req.path.includes('/shopify')) {
    // Parse raw body as buffer for HMAC verification
    express.raw({ type: 'application/json' })(req, res, next);
  } else {
    next();
  }
};

module.exports = shopifyWebhookMiddleware;