/**
 * Admin Authentication Middleware
 * 
 * Supports JWT token and Telegram ID authentication.
 * Inspired by online-menu's AdminMiddleware.php pattern.
 */

const jwt = require('jsonwebtoken');
const telegramConfig = require('../config/telegram.cjs');

require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'qlay_store_jwt_secret_2026_change_in_production';

const isAdmin = (req, res, next) => {
  // 1. Authenticate via Telegram ID (Bot/WebApp environment)
  const adminId = parseInt(req.headers['x-admin-id'], 10);
  if (adminId && telegramConfig.adminIds.includes(adminId)) {
    req.adminUser = { id: adminId, source: 'telegram' };
    return next();
  }

  // 2. Authenticate via JWT Bearer Token (Desktop Web Browser environment)
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded && decoded.role === 'admin') {
        req.adminUser = { id: decoded.email, source: 'jwt', ...decoded };
        return next();
      }
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Token muddati tugagan. Qayta kiring.' });
      }
      // Invalid token — fall through to 403
    }
  }

  return res.status(403).json({ success: false, message: 'Admin huquqi mavjud emas!' });
};

module.exports = { isAdmin, JWT_SECRET };
