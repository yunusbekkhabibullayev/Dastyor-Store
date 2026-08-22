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
const upload = require('../middleware/upload.cjs');

// Health check & version
router.get('/health', publicController.healthCheck);
router.get('/version', (req, res) => {
  const { getVersionInfo } = require('../config/version.cjs');
  res.json({ success: true, ...getVersionInfo() });
});

// Bot info
router.get('/bot-info', publicController.getBotInfo);

// Site settings (public)
router.get('/site-settings', publicLimiter, publicController.getSiteSettings);

// Products, Categories & Banners (public, rate-limited)
router.get('/products', publicLimiter, publicController.getProducts);
router.get('/categories', publicLimiter, publicController.getCategories);
router.get('/banners', publicLimiter, publicController.getBanners);

// User profile & Phone Auth (sync across devices)
router.post('/user/auth/check-phone', publicLimiter, publicController.checkUserPhone);
router.post('/user/auth/login', publicLimiter, publicController.loginUser);
router.post('/user/auth/register', publicLimiter, publicController.registerUser);
router.get('/user/me', publicLimiter, publicController.getMe);
router.put('/user/me', publicLimiter, publicController.updateMe);
router.post('/user/upload-avatar', publicLimiter, upload.single('image'), publicController.uploadAvatar);
router.get('/user/addresses', publicLimiter, publicController.getUserAddresses);
router.post('/user/addresses', publicLimiter, publicController.saveUserAddresses);
router.get('/user/profile', publicLimiter, publicController.getUserProfile);
router.post('/user/profile', publicLimiter, publicController.saveUserProfile);
router.post('/user/sync', publicLimiter, publicController.syncUser);

// User order history & Public order verification
router.get('/user/:userId/orders', publicLimiter, publicController.getUserOrders);
router.get('/orders/public/:orderId', publicLimiter, publicController.getPublicOrder);

// Geocode
router.get('/geocode/reverse', publicLimiter, publicController.reverseGeocode);

// Checkout (stricter rate limit + validation)
router.post('/checkout', checkoutLimiter, validate(schemas.checkout), publicController.checkout);

module.exports = router;
