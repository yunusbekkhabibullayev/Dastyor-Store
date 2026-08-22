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

// ─── Authentication (publicly accessible endpoints) ──────────────
router.post('/verify-password', loginLimiter, validate(schemas.adminLogin), adminController.verifyPassword);
router.post('/auth/check', loginLimiter, adminController.checkAuth);

// ─── All routes below require admin authentication ──────────
const { requireRole } = require('../middleware/auth.cjs');

router.use(isAdmin);
router.use(adminLimiter);

const path = require('path');
const fs = require('fs');

const UPLOADS_DIR = path.join(__dirname, '../../uploads');

// File Upload
router.post('/upload', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Fayl yuklanmadi!' });
  }

  try {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(req.file.originalname);
    const filename = 'upload-' + uniqueSuffix + ext;

    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    fs.writeFileSync(path.join(UPLOADS_DIR, filename), req.file.buffer);

    res.json({ success: true, fileUrl: '/uploads/' + filename });
  } catch (err) {
    console.error('Server upload error:', err);
    res.status(500).json({ success: false, message: 'Server xatosi.' });
  }
});

// Dashboard (super_admin, manager)
router.get('/stats', requireRole(['super_admin', 'manager']), adminController.getStats);

// Orders (super_admin, manager, courier)
router.get('/orders', requireRole(['super_admin', 'manager', 'courier']), adminController.getOrders);
router.patch('/orders/:id/status', requireRole(['super_admin', 'manager', 'courier']), validate(schemas.orderStatus), adminController.updateOrderStatus);

// Categories CRUD (super_admin, content_manager, manager)
router.get('/categories', adminController.getCategories);
router.post('/categories', requireRole(['super_admin', 'content_manager']), validate(schemas.category), adminController.createCategory);
router.put('/categories/:id', requireRole(['super_admin', 'content_manager']), validate(schemas.category), adminController.updateCategory);
router.delete('/categories/:id', requireRole(['super_admin', 'content_manager']), adminController.deleteCategory);

// Products CRUD (super_admin, content_manager, manager)
router.get('/products', adminController.getProducts);
router.post('/products', requireRole(['super_admin', 'content_manager']), validate(schemas.product), adminController.createProduct);
router.put('/products/:id', requireRole(['super_admin', 'content_manager']), validate(schemas.product), adminController.updateProduct);
router.delete('/products/:id', requireRole(['super_admin', 'content_manager']), adminController.deleteProduct);

// Banners CRUD (super_admin, content_manager)
router.get('/banners', adminBannerController.getBanners);
router.post('/banners', requireRole(['super_admin', 'content_manager']), adminBannerController.createBanner);
router.put('/banners/:id', requireRole(['super_admin', 'content_manager']), adminBannerController.updateBanner);
router.delete('/banners/:id', requireRole(['super_admin', 'content_manager']), adminBannerController.deleteBanner);

// Site Settings (super_admin only)
router.get('/site-settings', requireRole(['super_admin']), adminController.getSiteSettings);
router.put('/site-settings', requireRole(['super_admin']), adminController.updateSiteSettings);
router.post('/test-telegram', requireRole(['super_admin']), adminController.testTelegram);
router.get('/telegram/webhook-status', requireRole(['super_admin']), adminController.getWebhookStatus);
router.post('/telegram/set-webhook', requireRole(['super_admin']), adminController.setWebhook);
router.post('/telegram/delete-webhook', requireRole(['super_admin']), adminController.deleteWebhook);

// Customer CRM (super_admin, manager)
router.get('/users', requireRole(['super_admin', 'manager']), adminController.getUsers);
router.get('/users/:id', requireRole(['super_admin', 'manager']), adminController.getUserDetail);
router.patch('/users/:id/block', requireRole(['super_admin', 'manager']), adminController.toggleUserBlock);
router.patch('/users/:id/notes', requireRole(['super_admin', 'manager']), adminController.updateUserNotes);

// Staff & Employees Management (super_admin, developer)
router.get('/employees', requireRole(['super_admin', 'developer']), adminController.getEmployees);
router.post('/employees', requireRole(['super_admin', 'developer']), adminController.createEmployee);
router.put('/employees/:id', requireRole(['super_admin', 'developer']), adminController.updateEmployee);
router.delete('/employees/:id', requireRole(['super_admin', 'developer']), adminController.deleteEmployee);

module.exports = router;
