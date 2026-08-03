/**
 * Public Routes
 * 
 * All public-facing API endpoints.
 * Inspired by online-menu's Route grouping pattern.
 */

const express = require('express');
const router = express.Router();

const publicController = require('../controllers/publicController.cjs');
const { publicLimiter, checkoutLimiter } = require('../middleware/rateLimiter.cjs');
const { validate, schemas } = require('../middleware/validate.cjs');

// Health check
router.get('/health', publicController.healthCheck);

// Bot info
router.get('/bot-info', publicController.getBotInfo);

// Site settings (public)
router.get('/site-settings', publicLimiter, publicController.getSiteSettings);

// Products, Categories & Banners (public, rate-limited)
router.get('/products', publicLimiter, publicController.getProducts);
router.get('/categories', publicLimiter, publicController.getCategories);
router.get('/banners', publicLimiter, publicController.getBanners);

// User profile (sync across devices)
router.get('/user/profile', publicLimiter, publicController.getUserProfile);
router.post('/user/profile', publicLimiter, publicController.saveUserProfile);

// User order history
router.get('/user/:userId/orders', publicLimiter, publicController.getUserOrders);

// Checkout (stricter rate limit + validation)
router.post('/checkout', checkoutLimiter, validate(schemas.checkout), publicController.checkout);

module.exports = router;
