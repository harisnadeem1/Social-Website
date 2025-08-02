const shopifyWebhookMiddleware = (req, res, next) => {
  // Only apply to Shopify webhook routes
  if (req.path.includes('/shopify/webhook')) {
    let data = '';
    req.setEncoding('utf8');
    
    req.on('data', (chunk) => {
      data += chunk;
    });
    
    req.on('end', () => {
      req.rawBody = data;
      try {
        req.body = JSON.parse(data);
      } catch (e) {
        req.body = {};
      }
      next();
    });
  } else {
    next();
  }
};

module.exports = shopifyWebhookMiddleware;