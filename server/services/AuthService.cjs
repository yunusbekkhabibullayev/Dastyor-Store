/**
 * Auth Service
 * 
 * JWT token generation and verification for admin authentication.
 * Inspired by online-menu's TelegramAuthService.php pattern.
 */

const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'qlay_store_jwt_secret_2026_change_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

const AuthService = {
  /**
   * Verify admin credentials and return JWT token
   */
  verifyAdmin: (email, password) => {
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@qlay.uz';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const token = jwt.sign(
        { email, role: 'admin' },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );
      return { success: true, token };
    }

    return { success: false };
  },

  /**
   * Verify a JWT token
   */
  verifyToken: (token) => {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return null;
    }
  }
};

module.exports = AuthService;
