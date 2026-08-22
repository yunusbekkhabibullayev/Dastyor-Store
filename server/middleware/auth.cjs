/**
 * Admin Authentication & RBAC Middleware
 * 
 * Supports JWT token and Telegram ID authentication with Role-Based Access Control.
 */

const jwt = require('jsonwebtoken');
const telegramConfig = require('../config/telegram.cjs');
const { verifyInitData } = require('../services/telegramAuth.cjs');

require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'qlay_store_jwt_secret_2026_change_in_production';

const { dbGet } = require('../config/database.cjs');

const ROLE_PERMISSIONS = {
  super_admin: ['dashboard', 'orders', 'products', 'categories', 'settings', 'site-settings', 'users'],
  manager: ['dashboard', 'orders', 'products', 'users'],
  courier: ['orders'],
  content_manager: ['products', 'categories', 'settings']
};

/**
 * Resolve admin user role & permissions from DB / Config
 */
const getAdminInfo = async (identifier) => {
  if (!identifier) return null;

  // 1. Check if identifier is string / JWT email
  if (typeof identifier === 'string' && identifier.includes('@')) {
    return {
      id: identifier,
      role: 'super_admin',
      permissions: ROLE_PERMISSIONS.super_admin,
      source: 'jwt'
    };
  }

  // 2. Telegram ID check
  const numId = parseInt(identifier, 10);
  if (isNaN(numId)) return null;

  let adminIds = [...telegramConfig.adminIds];
  let adminRoles = {};

  try {
    const settings = await dbGet("SELECT admin_ids, admin_roles FROM site_settings WHERE id = 1");
    if (settings) {
      if (settings.admin_ids) {
        const dbAdminIds = settings.admin_ids
          .split(',')
          .map(id => parseInt(id.trim(), 10))
          .filter(id => !isNaN(id));
        adminIds = Array.from(new Set([...adminIds, ...dbAdminIds]));
      }
      if (settings.admin_roles) {
        try {
          adminRoles = typeof settings.admin_roles === 'string' ? JSON.parse(settings.admin_roles) : settings.admin_roles;
        } catch (e) {}
      }
    }
  } catch (e) {
    console.error('Failed to load admin settings from database:', e);
  }

  if (adminIds.includes(numId)) {
    // Specific role or default to super_admin for primary env admins, manager for others
    const isPrimaryAdmin = telegramConfig.adminIds.includes(numId) || numId === 1165441564;
    const assignedRole = adminRoles[String(numId)] || (isPrimaryAdmin ? 'super_admin' : 'manager');
    const validRole = ROLE_PERMISSIONS[assignedRole] ? assignedRole : 'super_admin';

    return {
      id: numId,
      role: validRole,
      permissions: ROLE_PERMISSIONS[validRole] || ROLE_PERMISSIONS.manager,
      source: 'telegram'
    };
  }

  return null;
};

const isAdmin = async (req, res, next) => {
  // 1. Authenticate via Telegram WebApp — initData is HMAC-signed by Telegram
  // using the bot token, so its user id can be trusted once verified. Never
  // trust a raw client-supplied id (X-Admin-Id / body.telegramId) — anyone
  // can put any number in a header.
  const initData = req.headers['x-telegram-init-data'] || (req.body && req.body.initData);
  if (initData) {
    const tgUser = verifyInitData(initData);
    if (tgUser) {
      const adminInfo = await getAdminInfo(tgUser.id);
      if (adminInfo) {
        req.adminUser = adminInfo;
        return next();
      }
    }
  }

  // 2. Authenticate via JWT Bearer Token (Desktop Web Browser environment)
  const authHeader = req.headers['authorization'] || req.headers['x-admin-token'] || (req.body && req.body.token);
  if (authHeader) {
    const token = typeof authHeader === 'string' && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded && (decoded.role === 'admin' || decoded.role === 'super_admin')) {
        // Password login (AuthService) always signs role:'admin' — the
        // highest-trust login path, mapped to 'super_admin' here. Spreading
        // ...decoded AFTER these fields would silently put role back to
        // 'admin' and fail every requireRole(['super_admin', ...]) check.
        const role = decoded.role === 'admin' ? 'super_admin' : decoded.role;
        req.adminUser = {
          ...decoded,
          id: decoded.email,
          role,
          permissions: ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.super_admin,
          source: 'jwt'
        };
        return next();
      }
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Token muddati tugagan. Qayta kiring.' });
      }
    }
  }

  return res.status(403).json({ success: false, message: 'Admin huquqi mavjud emas!' });
};

/**
 * Require specific roles middleware
 */
const requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.adminUser) {
      return res.status(403).json({ success: false, message: 'Ruxsat berilmagan!' });
    }
    const userRole = req.adminUser.role || 'super_admin';
    if (userRole === 'super_admin' || allowedRoles.includes(userRole)) {
      return next();
    }
    return res.status(403).json({
      success: false,
      message: `Ushbu amal uchun ruxsat yo'q. Talab qilinadigan rol: ${allowedRoles.join(', ')}`
    });
  };
};

module.exports = { isAdmin, requireRole, getAdminInfo, ROLE_PERMISSIONS, JWT_SECRET };
