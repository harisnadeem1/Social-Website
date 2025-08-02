const crypto = require('crypto');
const db = require('../config/db'); // Your existing database connection

class ShopifyController {
  
  // Verify Shopify webhook signature
  static verifyWebhook(rawBody, signature, secret) {
    try {
      const hmac = crypto.createHmac('sha256', secret);
      hmac.update(rawBody, 'utf8');
      const calculatedSignature = hmac.digest('base64');
      
      return crypto.timingSafeEqual(
        Buffer.from(signature, 'base64'),
        Buffer.from(calculatedSignature, 'base64')
      );
    } catch (error) {
      console.error('Webhook verification error:', error);
      return false;
    }
  }

  // Find user by ID
  static async findUserById(userId) {
    try {
      const query = 'SELECT * FROM users WHERE id = $1';
      const result = await db.query(query, [userId]);
      return result.rows[0];
    } catch (error) {
      console.error('Error finding user by ID:', error);
      return null;
    }
  }

  // Find user by email
  static async findUserByEmail(email) {
    try {
      const query = 'SELECT * FROM users WHERE email = $1';
      const result = await db.query(query, [email]);
      return result.rows[0];
    } catch (error) {
      console.error('Error finding user by email:', error);
      return null;
    }
  }

  // Get user's coin balance
  static async getCoinBalance(userId) {
    try {
      const query = 'SELECT balance FROM coins WHERE user_id = $1';
      const result = await db.query(query, [userId]);
      return result.rows[0]?.balance || 0;
    } catch (error) {
      console.error('Error getting coin balance:', error);
      return 0;
    }
  }

  // Update user's coin balance
  static async updateCoinBalance(userId, newBalance) {
    try {
      const query = `
        INSERT INTO coins (user_id, balance, updated_at) 
        VALUES ($1, $2, CURRENT_TIMESTAMP)
        ON CONFLICT (user_id) 
        DO UPDATE SET balance = $2, updated_at = CURRENT_TIMESTAMP
      `;
      await db.query(query, [userId, newBalance]);
      return true;
    } catch (error) {
      console.error('Error updating coin balance:', error);
      return false;
    }
  }

  // Check if transaction already exists (prevent duplicate processing)
  static async findTransactionByPurpose(userId, purpose) {
    try {
      const query = 'SELECT * FROM transactions WHERE user_id = $1 AND purpose = $2 LIMIT 1';
      const result = await db.query(query, [userId, purpose]);
      return result.rows[0];
    } catch (error) {
      console.error('Error finding transaction by purpose:', error);
      return null;
    }
  }

  // Create transaction record
  static async createTransaction(userId, amount, type, purpose) {
    try {
      const query = `
        INSERT INTO transactions (user_id, amount, type, purpose, created_at)
        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
        RETURNING *
      `;
      const result = await db.query(query, [userId, amount, type, purpose]);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating transaction:', error);
      return null;
    }
  }

  // Create notification
  static async createNotification(userId, type, content) {
    try {
      const query = `
        INSERT INTO notifications (user_id, type, content, is_read, created_at)
        VALUES ($1, $2, $3, false, CURRENT_TIMESTAMP)
        RETURNING *
      `;
      const result = await db.query(query, [userId, type, content]);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  }

  // Handle order paid webhook
  static async handleOrderPaid(req, res) {
    try {
      const signature = req.get('X-Shopify-Hmac-Sha256');
      const rawBody = req.rawBody;
      
      // Verify webhook authenticity
      if (!ShopifyController.verifyWebhook(rawBody, signature, process.env.SHOPIFY_WEBHOOK_SECRET)) {
        console.error('❌ Invalid webhook signature');
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const order = req.body;
      console.log('📦 Shopify Order received:', order.id, 'Status:', order.financial_status);

      // Only process paid orders
      if (order.financial_status !== 'paid') {
        console.log('⏳ Order not paid yet, skipping...');
        return res.status(200).json({ message: 'Order not paid yet' });
      }

      // Extract user info and coin data from order note
      let userId = null;
      let packageData = null;

      // Parse order note for user and package info
      if (order.note) {
        console.log('📝 Order note:', order.note);
        
        const userMatch = order.note.match(/user_id:([^;]+)/);
        const packageMatch = order.note.match(/package_id:(\d+)/);
        const coinsMatch = order.note.match(/coins:(\d+)/);
        
        if (userMatch) userId = userMatch[1];
        if (packageMatch && coinsMatch) {
          packageData = {
            packageId: parseInt(packageMatch[1]),
            totalCoins: parseInt(coinsMatch[1])
          };
        }
      }

      if (!userId || !packageData) {
        console.error('❌ Could not extract user_id or package data from order');
        console.log('Order note:', order.note);
        return res.status(400).json({ error: 'Invalid order data - missing user_id or package info' });
      }

      console.log('✅ Extracted data:', { userId, packageData });

      // Find user (try by ID first, then by email)
      let user = null;
      
      // If userId is numeric, try finding by ID
      if (!isNaN(userId)) {
        user = await ShopifyController.findUserById(parseInt(userId));
      }
      
      // If not found by ID, try finding by email
      if (!user) {
        user = await ShopifyController.findUserByEmail(userId);
      }
      
      // Fallback: try using order email
      if (!user && order.email) {
        user = await ShopifyController.findUserByEmail(order.email);
      }

      if (!user) {
        console.error('❌ User not found:', userId, order.email);
        return res.status(404).json({ error: 'User not found' });
      }

      console.log('👤 Found user:', user.id, user.email);

      // Check if we already processed this order (prevent duplicates)
      const orderPurpose = `Shopify Order #${order.order_number}`;
      const existingTransaction = await ShopifyController.findTransactionByPurpose(user.id, orderPurpose);
      
      if (existingTransaction) {
        console.log('✅ Order already processed:', order.order_number);
        return res.status(200).json({ message: 'Order already processed' });
      }

      // Get current coin balance
      const currentBalance = await ShopifyController.getCoinBalance(user.id);
      console.log('💰 Current balance:', currentBalance);

      // Add coins to user account
      const newBalance = currentBalance + packageData.totalCoins;
      const balanceUpdated = await ShopifyController.updateCoinBalance(user.id, newBalance);
      
      if (!balanceUpdated) {
        console.error('❌ Failed to update coin balance');
        return res.status(500).json({ error: 'Failed to update coin balance' });
      }

      console.log('💰 New balance:', newBalance);

      // Record transaction
      const transaction = await ShopifyController.createTransaction(
        user.id, 
        packageData.totalCoins, 
        'buy', 
        orderPurpose
      );
      
      if (!transaction) {
        console.error('❌ Failed to create transaction');
        return res.status(500).json({ error: 'Failed to create transaction' });
      }

      console.log('📊 Transaction created:', transaction.id);

      // Create notification
      const notificationContent = `🎉 ${packageData.totalCoins} coins added to your account! Order #${order.order_number}`;
      const notification = await ShopifyController.createNotification(
        user.id, 
        'coin_purchase', 
        notificationContent
      );
      
      if (notification) {
        console.log('🔔 Notification sent to user');
      }

      console.log('✅ Order processed successfully:', {
        orderId: order.id,
        orderNumber: order.order_number,
        userId: user.id,
        userEmail: user.email,
        coinsAdded: packageData.totalCoins,
        newBalance: newBalance,
        transactionId: transaction.id
      });

      res.status(200).json({ 
        success: true,
        message: 'Order processed successfully',
        order_number: order.order_number,
        user_id: user.id,
        coins_added: packageData.totalCoins,
        new_balance: newBalance,
        transaction_id: transaction.id
      });

    } catch (error) {
      console.error('❌ Shopify webhook error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get coin balance endpoint (for frontend to refresh balance)
  static async getCoinBalanceAPI(req, res) {
    try {
      // Extract user ID from token (assuming you have auth middleware)
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const token = authHeader.substring(7);
      
      // Simple JWT decode (you might want to use your existing auth logic)
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id || decoded.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      const balance = await ShopifyController.getCoinBalance(userId);
      
      res.json({
        success: true,
        balance: balance,
        user_id: userId
      });
    } catch (error) {
      console.error('Error getting coin balance:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get coin balance'
      });
    }
  }
}

module.exports = ShopifyController;