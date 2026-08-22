/**
 * Rate Limiting Middleware
 * 
 * Different rate limits for different endpoint groups.
 * Inspired by online-menu's ->middleware('throttle:10,1') pattern.
 */

const rateLimit = require('express-rate-limit');

/** Public API: 300 requests per minute (smooth SPA navigation & asset loading) */
const publicLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Juda ko\'p so\'rov yuborildi. Iltimos, bir oz kuting.'
  }
});

/** Admin API: 300 requests per minute */
const adminLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Juda ko\'p so\'rov yuborildi. Iltimos, bir oz kuting.'
  }
});

/** Checkout: 30 requests per minute (brute-force protection) */
const checkoutLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Buyurtma berish cheklangan. 1 daqiqa kuting.'
  }
});

/** Login: 20 requests per minute (brute-force protection) */
const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Kirish urinishlari cheklandi. 1 daqiqa kuting.'
  }
});

module.exports = { publicLimiter, adminLimiter, checkoutLimiter, loginLimiter };
