/**
 * Auth Service
 * 
 * JWT token generation and verification for staff & admin authentication.
 */

const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee.cjs');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'qlay_store_jwt_secret_2026_change_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const AuthService = {
  /**
   * Verify staff / admin credentials and return JWT token
   */
  verifyAdmin: async (identifier, password) => {
    const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@qlay.uz').toLowerCase();
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

    const cleanIdentifier = (identifier || '').trim().toLowerCase();

    // 1. Check Root .env Admin credentials
    if ((cleanIdentifier === ADMIN_EMAIL || cleanIdentifier === 'admin') && password === ADMIN_PASSWORD) {
      const token = jwt.sign(
        {
          id: 0,
          name: 'Super Administrator',
          login: 'admin',
          email: ADMIN_EMAIL,
          role: 'super_admin'
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );
      return {
        success: true,
        token,
        employee: {
          id: 0,
          name: 'Super Administrator',
          login: 'admin',
          role: 'super_admin'
        }
      };
    }

    // 2. Check Employee database credentials
    try {
      const result = await Employee.verifyCredentials(identifier, password);
      if (result.success && result.employee) {
        const emp = result.employee;
        const token = jwt.sign(
          {
            id: emp.id,
            name: emp.name,
            login: emp.login,
            telegram_id: emp.telegram_id,
            role: emp.role || 'manager'
          },
          JWT_SECRET,
          { expiresIn: JWT_EXPIRES_IN }
        );
        return {
          success: true,
          token,
          employee: emp
        };
      }
      return { success: false, message: result.message || 'Login yoki parol noto\'g\'ri!' };
    } catch (err) {
      console.error('[AuthService] verifyAdmin error:', err);
      return { success: false, message: 'Tizimga kirishda xatolik yuz berdi' };
    }
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
