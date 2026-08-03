/**
 * Admin Routes
 * 
 * All admin API endpoints with auth middleware.
 * Inspired by online-menu's Route::middleware(['auth', 'admin'])->prefix('admin') pattern.
 */

const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminController.cjs');
const adminBannerController = require('../controllers/adminBannerController.cjs');
const upload = require('../middleware/upload.cjs');
const { isAdmin } = require('../middleware/auth.cjs');
const { adminLimiter, loginLimiter } = require('../middleware/rateLimiter.cjs');
const { validate, schemas } = require('../middleware/validate.cjs');

// ─── Authentication (no auth middleware needed) ──────────────
router.post('/verify-password', loginLimiter, validate(schemas.adminLogin), adminController.verifyPassword);

// ─── All routes below require admin authentication ──────────
router.use(isAdmin);
router.use(adminLimiter);

// File Upload
router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Fayl yuklanmadi!' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ success: true, fileUrl });
});

// Dashboard
router.get('/stats', adminController.getStats);

// Orders
router.get('/orders', adminController.getOrders);
router.patch('/orders/:id/status', validate(schemas.orderStatus), adminController.updateOrderStatus);

// Categories CRUD
router.get('/categories', adminController.getCategories);
router.post('/categories', validate(schemas.category), adminController.createCategory);
router.put('/categories/:id', validate(schemas.category), adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);

// Products CRUD
router.get('/products', adminController.getProducts);
router.post('/products', validate(schemas.product), adminController.createProduct);
router.put('/products/:id', validate(schemas.product), adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);

// Banners CRUD
router.get('/banners', adminBannerController.getBanners);
router.post('/banners', adminBannerController.createBanner);
router.put('/banners/:id', adminBannerController.updateBanner);
router.delete('/banners/:id', adminBannerController.deleteBanner);

// Site Settings
router.get('/site-settings', adminController.getSiteSettings);
router.put('/site-settings', adminController.updateSiteSettings);
router.post('/test-telegram', adminController.testTelegram);
router.get('/telegram/webhook-status', adminController.getWebhookStatus);
router.post('/telegram/set-webhook', adminController.setWebhook);
router.post('/telegram/delete-webhook', adminController.deleteWebhook);

module.exports = router;
