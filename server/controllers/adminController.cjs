/**
 * Admin Controller
 * 
 * Handles all admin API endpoints: stats, orders, products CRUD, categories CRUD.
 * Inspired by online-menu's Admin/OrderController.php, Admin/CategoryController.php.
 */

const Category = require('../models/Category.cjs');
const Product = require('../models/Product.cjs');
const Order = require('../models/Order.cjs');
const SiteSettings = require('../models/SiteSettings.cjs');
const AuthService = require('../services/AuthService.cjs');
const telegramService = require('../services/TelegramService.cjs');
const cacheService = require('../services/cacheService.cjs');

const adminController = {
  /** GET /api/admin/site-settings */
  getSiteSettings: async (req, res) => {
    try {
      const settings = await SiteSettings.get();
      res.json({ success: true, settings });
    } catch (error) {
      console.error('[API] Admin get site settings error:', error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /** PUT /api/admin/site-settings */
  updateSiteSettings: async (req, res) => {
    try {
      const settings = await SiteSettings.update(req.body);
      cacheService.clear('siteSettings');
      res.json({ success: true, settings, message: 'Sozlamalar saqlandi!' });
    } catch (error) {
      console.error('[API] Admin update site settings error:', error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /** POST /api/admin/test-telegram */
  testTelegram: async (req, res) => {
    try {
      const settings = await SiteSettings.get();
      const botToken = req.body.bot_token || settings.bot_token;
      
      if (!botToken) {
        return res.status(400).json({
          success: false,
          message: 'Telegram Bot Token kiritilmagan!'
        });
      }

      // Try sending test message using Telegram API
      const result = await telegramService.sendNotification({
        id: 'TEST-001',
        name: 'Test Administrator',
        phone: '+998 90 123 45 67',
        address: 'Test Manzil',
        paymentMethod: 'cash',
        total: 100000,
        items: [{ title: { uz: 'Test Mahsulot' }, quantity: 1, price: 100000 }]
      });

      res.json({
        success: true,
        message: 'Telegram ulanishi muvaffaqiyatli sinovdan o\'tdi!'
      });
    } catch (error) {
      console.error('[API] Telegram test error:', error.message);
      res.status(500).json({
        success: false,
        message: `Telegram xatosi: ${error.message}`
      });
    }
  },

  /** GET /api/admin/telegram/webhook-status */
  getWebhookStatus: async (req, res) => {
    try {
      const webhookInfo = await telegramService.getWebhookInfo();
      res.json({ success: true, webhookInfo });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /** POST /api/admin/telegram/set-webhook */
  setWebhook: async (req, res) => {
    try {
      const { url } = req.body;
      const result = await telegramService.setWebhook(url);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /** POST /api/admin/telegram/delete-webhook */
  deleteWebhook: async (req, res) => {
    try {
      const result = await telegramService.deleteWebhook();
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
  // ─── Authentication ────────────────────────────────────────

  /**
   * POST /api/admin/auth/check — Check admin status & role (Supports Telegram ID and JWT token via POST)
   */
  checkAuth: async (req, res) => {
    try {
      const { initData, token } = req.body || {};
      const { getAdminInfo, JWT_SECRET, ROLE_PERMISSIONS } = require('../middleware/auth.cjs');
      const { verifyInitData } = require('../services/telegramAuth.cjs');
      const jwt = require('jsonwebtoken');

      // 1. Check via Telegram WebApp initData — HMAC-verified against the bot
      // token, so the user id inside it can be trusted. A raw client-supplied
      // telegramId (old behavior) cannot: anyone could claim any admin's id.
      const rawInitData = initData || req.headers['x-telegram-init-data'];
      if (rawInitData) {
        const tgUser = verifyInitData(rawInitData);
        if (tgUser) {
          const adminInfo = await getAdminInfo(tgUser.id);
          if (adminInfo) {
            return res.json({
              success: true,
              isAdmin: true,
              user: {
                id: adminInfo.id,
                role: adminInfo.role,
                permissions: adminInfo.permissions,
                source: 'telegram'
              }
            });
          }
        }
      }

      // 2. Check via JWT Token (POST body or Authorization header)
      const bearerToken = token || req.headers['authorization'] || req.headers['x-admin-token'];
      if (bearerToken) {
        const cleanToken = typeof bearerToken === 'string' && bearerToken.startsWith('Bearer ')
          ? bearerToken.substring(7)
          : bearerToken;
        try {
          const decoded = jwt.verify(cleanToken, JWT_SECRET);
          if (decoded && decoded.role) {
            const role = decoded.role === 'admin' ? 'super_admin' : decoded.role;
            return res.json({
              success: true,
              isAdmin: true,
              user: {
                id: decoded.id || decoded.email || decoded.login,
                name: decoded.name || 'Admin',
                login: decoded.login,
                role: role,
                permissions: ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.super_admin,
                source: 'jwt'
              }
            });
          }
        } catch (jwtErr) {
          // Token invalid or expired
        }
      }

      return res.json({ success: true, isAdmin: false, user: null });
    } catch (err) {
      console.error('[Admin Auth] checkAuth error:', err);
      res.status(500).json({ success: false, message: 'Server xatosi' });
    }
  },

  /**
   * POST /api/admin/verify-password — Staff / Admin login (returns JWT with role)
   */
  verifyPassword: async (req, res) => {
    try {
      const { email, login, identifier, password } = req.body;
      const username = login || identifier || email;
      const result = await AuthService.verifyAdmin(username, password);

      if (result.success) {
        const { ROLE_PERMISSIONS } = require('../middleware/auth.cjs');
        const role = result.employee?.role || 'super_admin';
        res.json({
          success: true,
          token: result.token,
          role: role,
          employee: result.employee,
          permissions: ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.super_admin,
          message: 'Kirish muvaffaqiyatli!'
        });
      } else {
        res.status(401).json({ success: false, message: result.message || 'Login yoki parol noto\'g\'ri!' });
      }
    } catch (e) {
      console.error('[Admin] verifyPassword error:', e);
      res.status(500).json({ success: false, message: 'Server xatoligi' });
    }
  },

  // ─── Dashboard ─────────────────────────────────────────────

  /**
   * GET /api/admin/stats — Dashboard statistics
   */
  getStats: async (req, res) => {
    try {
      const stats = await Order.getStats();
      res.json({ success: true, stats });
    } catch (error) {
      console.error('[Admin] Failed to fetch stats:', error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // ─── Orders ────────────────────────────────────────────────

  /**
   * GET /api/admin/orders — All orders with items
   */
  getOrders: async (req, res) => {
    try {
      const orders = await Order.getAll();
      for (const order of orders) {
        const items = await Order.getItems(order.id);
        order.items = items.map(item => ({
          ...item,
          title: { uz: item.title_uz, ru: item.title_ru, en: item.title_en }
        }));
      }
      res.json({ success: true, orders });
    } catch (error) {
      console.error('[Admin] Failed to fetch orders:', error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * PATCH /api/admin/orders/:id/status — Update order status + send Telegram notification
   * Inspired by online-menu's Admin/OrderController::updateStatus()
   */
  updateOrderStatus: async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
      const order = await Order.getById(id);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Buyurtma topilmadi.' });
      }

      const oldStatus = order.status;

      // Don't update if status is the same
      if (oldStatus === status) {
        return res.json({ success: true, message: 'Status o\'zgarmadi.' });
      }

      await Order.updateStatus(id, status);
      console.log(`[Admin] Order ${id} status: ${oldStatus} → ${status}`);

      // Restore stock if the order is cancelled
      if (status === 'cancelled' && oldStatus !== 'cancelled') {
        const orderItems = await Order.getItems(id);
        const Product = require('../models/Product.cjs');
        const { dbRun } = require('../config/database.cjs');
        for (const item of orderItems) {
          // Increase main stock for each cancelled item
          await dbRun(
            "UPDATE products SET stock = stock + ? WHERE id = ?",
            [item.quantity, item.product_id]
          );

          // Restore variant stock if applicable
          if (item.selected_variant) {
            const product = await Product.getById(item.product_id);
            if (product && product.attributes) {
              try {
                const attrs = typeof product.attributes === 'string' ? JSON.parse(product.attributes) : product.attributes;
                if (attrs.combinations) {
                  const selVar = typeof item.selected_variant === 'string' ? JSON.parse(item.selected_variant) : item.selected_variant;
                  const combKeys = Object.keys(selVar);
                  const comb = attrs.combinations.find(c => {
                    return combKeys.every(k => c.values[k] === selVar[k]);
                  });
                  if (comb) {
                    const currentStock = parseFloat(comb.stock) || 0;
                    comb.stock = (currentStock + parseFloat(item.quantity)).toString();
                    await dbRun("UPDATE products SET attributes = ? WHERE id = ?", [JSON.stringify(attrs), product.id]);
                  }
                }
              } catch (e) {
                console.error('Failed to restore variant stock:', e);
              }
            }
          }
        }
        cacheService.clear('products');
        console.log(`[Admin] Restored stock for cancelled order ${id}`);
      }

      // Send Telegram notification (non-blocking)
      if (order.user_id) {
        try {
          await telegramService.sendStatusUpdate(order.user_id, id, status);
        } catch (telegramError) {
          console.error(`[Admin] Telegram notification failed for order ${id}:`, telegramError.message);
        }
      }

      res.json({ success: true, message: 'Status yangilandi va xaridorga xabar berildi.' });
    } catch (error) {
      console.error(`[Admin] Failed to update order ${id}:`, error.message);
      res.status(500).json({ success: false, message: 'Xatolik yuz berdi.' });
    }
  },

  // ─── Categories CRUD ──────────────────────────────────────

  /**
   * GET /api/admin/categories
   */
  getCategories: async (req, res) => {
    try {
      const categories = await Category.getAll();
      res.json({ success: true, categories });
    } catch (error) {
      console.error('[Admin] Failed to fetch categories:', error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * POST /api/admin/categories
   */
  createCategory: async (req, res) => {
    const { id, name_uz, name_ru, name_en, sort_order, is_active } = req.body;
    try {
      const activeVal = (is_active === true || is_active === 1 || is_active === 'true') ? 1 : 0;
      await Category.create(id, name_uz, name_ru, name_en, parseInt(sort_order) || 0, activeVal);
      console.log(`[Admin] Category created: ${id}`);
      cacheService.clear('categories');
      res.json({ success: true, message: 'Kategoriya muvaffaqiyatli qo\'shildi.' });
    } catch (error) {
      console.error('[Admin] Failed to create category:', error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * PUT /api/admin/categories/:id
   */
  updateCategory: async (req, res) => {
    const { id } = req.params;
    const { name_uz, name_ru, name_en, sort_order, is_active } = req.body;
    try {
      const activeVal = (is_active === true || is_active === 1 || is_active === 'true') ? 1 : 0;
      await Category.update(id, name_uz, name_ru, name_en, parseInt(sort_order) || 0, activeVal);
      console.log(`[Admin] Category updated: ${id}`);
      cacheService.clear('categories');
      res.json({ success: true, message: 'Kategoriya muvaffaqiyatli yangilandi.' });
    } catch (error) {
      console.error(`[Admin] Failed to update category ${id}:`, error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * DELETE /api/admin/categories/:id
   */
  deleteCategory: async (req, res) => {
    const { id } = req.params;
    try {
      await Category.delete(id);
      console.log(`[Admin] Category deleted: ${id}`);
      cacheService.clear('categories');
      res.json({ success: true, message: 'Kategoriya muvaffaqiyatli o\'chirildi.' });
    } catch (error) {
      console.error(`[Admin] Failed to delete category ${id}:`, error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // ─── Products CRUD ─────────────────────────────────────────

  /**
   * GET /api/admin/products
   */
  getProducts: async (req, res) => {
    try {
      const products = await Product.getAll();
      const parsed = products.map(p => {
        let attributesObj = {};
        if (p.attributes) {
          try {
            attributesObj = typeof p.attributes === 'string' ? JSON.parse(p.attributes) : p.attributes;
          } catch (e) {
            console.warn(`[Admin] Failed to parse attributes for product ${p.id}:`, e.message);
          }
        }
        return {
          ...p,
          attributes: attributesObj
        };
      });
      res.json({ success: true, products: parsed });
    } catch (error) {
      console.error('[Admin] Failed to fetch products:', error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * POST /api/admin/products
   */
  createProduct: async (req, res) => {
    try {
      await Product.create(req.body);
      console.log(`[Admin] Product created: ${req.body.id}`);
      cacheService.clear('products');
      res.json({ success: true, message: 'Mahsulot muvaffaqiyatli qo\'shildi.' });
    } catch (error) {
      console.error('[Admin] Failed to create product:', error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * PUT /api/admin/products/:id
   */
  updateProduct: async (req, res) => {
    const { id } = req.params;
    try {
      await Product.update(id, req.body);
      console.log(`[Admin] Product updated: ${id}`);
      cacheService.clear('products');
      res.json({ success: true, message: 'Mahsulot muvaffaqiyatli yangilandi.' });
    } catch (error) {
      console.error(`[Admin] Failed to update product ${id}:`, error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * DELETE /api/admin/products/:id
   */
  deleteProduct: async (req, res) => {
    const { id } = req.params;
    try {
      await Product.delete(id);
      console.log(`[Admin] Product deleted: ${id}`);
      cacheService.clear('products');
      res.json({ success: true, message: 'Mahsulot muvaffaqiyatli o\'chirildi.' });
    } catch (error) {
      console.error(`[Admin] Failed to delete product ${id}:`, error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // ─── Customer CRM ───────────────────────────────────────────

  /**
   * GET /api/admin/users — List customers with pagination & filters
   */
  getUsers: async (req, res) => {
    try {
      const User = require('../models/User.cjs');
      const { search, source, isBlocked, page, limit, sortBy } = req.query;

      const result = await User.getAll({
        search: search || '',
        source: source || 'all',
        isBlocked: isBlocked || 'all',
        page: parseInt(page, 10) || 1,
        limit: parseInt(limit, 10) || 20,
        sortBy: sortBy || 'last_active_at'
      });

      const stats = await User.getCRMStats();

      res.json({
        success: true,
        ...result,
        stats
      });
    } catch (error) {
      console.error('[Admin CRM] Failed to fetch users:', error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * GET /api/admin/users/:id — Customer profile with full order history
   */
  getUserDetail: async (req, res) => {
    try {
      const User = require('../models/User.cjs');
      const Order = require('../models/Order.cjs');
      const { id } = req.params;

      const user = await User.getById(id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'Mijoz topilmadi' });
      }

      // Fetch user's orders
      let orders = [];
      if (user.telegram_id && !user.telegram_id.startsWith('web_')) {
        orders = await Order.getByUserId(user.telegram_id);
      }
      if ((!orders || orders.length === 0) && user.phone) {
        orders = await Order.getByPhone(user.phone);
      }

      res.json({
        success: true,
        user,
        orders: orders || []
      });
    } catch (error) {
      console.error(`[Admin CRM] Failed to fetch user ${req.params.id}:`, error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * PATCH /api/admin/users/:id/block — Toggle customer block status
   */
  toggleUserBlock: async (req, res) => {
    try {
      const User = require('../models/User.cjs');
      const { id } = req.params;

      const user = await User.toggleBlock(id);
      res.json({
        success: true,
        message: user.is_blocked ? 'Mijoz bloklandi.' : 'Mijoz blokdan chiqarildi.',
        user
      });
    } catch (error) {
      console.error(`[Admin CRM] Failed to toggle block for ${req.params.id}:`, error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * PATCH /api/admin/users/:id/notes — Update admin CRM notes for customer
   */
  updateUserNotes: async (req, res) => {
    try {
      const User = require('../models/User.cjs');
      const { id } = req.params;
      const { notes } = req.body;

      const user = await User.updateNotes(id, notes || '');
      res.json({
        success: true,
        message: 'Eslatma saqlandi.',
        user
      });
    } catch (error) {
      console.error(`[Admin CRM] Failed to update notes for ${req.params.id}:`, error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // ─── Employees & Staff Management ───────────────────────────

  /**
   * GET /api/admin/employees
   */
  getEmployees: async (req, res) => {
    try {
      const Employee = require('../models/Employee.cjs');
      const employees = await Employee.getAll();
      res.json({ success: true, employees });
    } catch (error) {
      console.error('[Admin] Failed to get employees:', error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * POST /api/admin/employees
   */
  createEmployee: async (req, res) => {
    try {
      const Employee = require('../models/Employee.cjs');
      const employee = await Employee.create(req.body);
      res.json({ success: true, message: 'Xodim muvaffaqiyatli qo\'shildi.', employee });
    } catch (error) {
      console.error('[Admin] Failed to create employee:', error.message);
      res.status(400).json({ success: false, message: error.message });
    }
  },

  /**
   * PUT /api/admin/employees/:id
   */
  updateEmployee: async (req, res) => {
    try {
      const Employee = require('../models/Employee.cjs');
      const { id } = req.params;
      const employee = await Employee.update(id, req.body);
      res.json({ success: true, message: 'Xodim ma\'lumotlari yangilandi.', employee });
    } catch (error) {
      console.error(`[Admin] Failed to update employee ${req.params.id}:`, error.message);
      res.status(400).json({ success: false, message: error.message });
    }
  },

  /**
   * DELETE /api/admin/employees/:id
   */
  deleteEmployee: async (req, res) => {
    try {
      const Employee = require('../models/Employee.cjs');
      const { id } = req.params;
      await Employee.delete(id);
      res.json({ success: true, message: 'Xodim o\'chirildi.' });
    } catch (error) {
      console.error(`[Admin] Failed to delete employee ${req.params.id}:`, error.message);
      res.status(400).json({ success: false, message: error.message });
    }
  },

  /**
   * GET /api/admin/employees/setup-info — Public invite link validation
   */
  getEmployeeSetupInfo: async (req, res) => {
    try {
      const { id, token } = req.query;
      const Employee = require('../models/Employee.cjs');
      const emp = await Employee.getById(id);
      if (!emp) {
        return res.status(404).json({ success: false, message: 'Xodim topilmadi' });
      }
      const expectedToken = Employee.generateSetupToken(emp);
      if (!token || token !== expectedToken) {
        return res.status(403).json({ success: false, message: 'Yaroqsiz yoki eskirgan taklif havolasi' });
      }

      res.json({
        success: true,
        employee: {
          id: emp.id,
          name: emp.name,
          login: emp.login,
          role: emp.role,
          telegram_id: emp.telegram_id,
          phone: emp.phone
        }
      });
    } catch (e) {
      console.error('[Admin] getEmployeeSetupInfo error:', e);
      res.status(500).json({ success: false, message: 'Server xatosi' });
    }
  },

  /**
   * POST /api/admin/employees/setup-credentials — Staff set self login & password
   */
  setupEmployeeCredentials: async (req, res) => {
    try {
      const { id, token, login, password } = req.body;
      const Employee = require('../models/Employee.cjs');
      const emp = await Employee.getById(id);
      if (!emp) {
        return res.status(404).json({ success: false, message: 'Xodim topilmadi' });
      }
      const expectedToken = Employee.generateSetupToken(emp);
      if (!token || token !== expectedToken) {
        return res.status(403).json({ success: false, message: 'Yaroqsiz havola' });
      }

      if (!login || login.trim().length < 3) {
        return res.status(400).json({ success: false, message: 'Login kamida 3 ta belgidan iborat bo\'lishi kerak' });
      }
      if (!password || password.length < 4) {
        return res.status(400).json({ success: false, message: 'Parol kamida 4 ta belgidan iborat bo\'lishi kerak' });
      }

      const updated = await Employee.update(emp.id, {
        login: login.trim().toLowerCase(),
        password: password.trim()
      });

      // Generate JWT for automatic login
      const jwt = require('jsonwebtoken');
      const JWT_SECRET = process.env.JWT_SECRET || 'qlay_store_jwt_secret_2026_change_in_production';
      const authToken = jwt.sign(
        {
          id: updated.id,
          name: updated.name,
          login: updated.login,
          telegram_id: updated.telegram_id,
          role: updated.role || 'manager'
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      const { ROLE_PERMISSIONS } = require('../middleware/auth.cjs');
      const role = updated.role || 'manager';

      res.json({
        success: true,
        message: 'Login va parol muvaffaqiyatli o\'rnatildi!',
        token: authToken,
        role: role,
        employee: updated,
        permissions: ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.manager
      });
    } catch (e) {
      console.error('[Admin] setupEmployeeCredentials error:', e);
      res.status(400).json({ success: false, message: e.message || 'Saqlashda xatolik yuz berdi' });
    }
  },

  /** GET /api/admin/profile */
  getMyProfile: async (req, res) => {
    try {
      const user = req.adminUser;
      if (!user) {
        return res.status(401).json({ success: false, message: 'Foydalanuvchi aniqlanmadi' });
      }

      let employeeData = null;
      const Employee = require('../models/Employee.cjs');

      if (user.id && typeof user.id === 'number' && user.id > 0) {
        employeeData = await Employee.getById(user.id);
      }
      if (!employeeData && user.telegram_id) {
        employeeData = await Employee.getByTelegramId(user.telegram_id);
      }
      if (!employeeData && user.login) {
        employeeData = await Employee.getByLogin(user.login);
      }

      res.json({
        success: true,
        profile: {
          id: employeeData ? employeeData.id : user.id,
          name: employeeData ? employeeData.name : user.name,
          login: employeeData ? employeeData.login : user.login,
          phone: employeeData ? employeeData.phone : user.phone,
          telegram_id: employeeData ? employeeData.telegram_id : (user.telegram_id || user.id),
          role: employeeData ? employeeData.role : user.role,
          notes: employeeData ? employeeData.notes : user.notes,
          permissions: user.permissions,
          source: user.source
        }
      });
    } catch (e) {
      console.error('[Admin] getMyProfile error:', e);
      res.status(500).json({ success: false, message: e.message });
    }
  },

  /** PUT /api/admin/profile */
  updateMyProfile: async (req, res) => {
    try {
      const user = req.adminUser;
      if (!user) {
        return res.status(401).json({ success: false, message: 'Foydalanuvchi aniqlanmadi' });
      }

      const { name, phone, password } = req.body;
      const Employee = require('../models/Employee.cjs');

      let employee = null;
      if (user.id && typeof user.id === 'number' && user.id > 0) {
        employee = await Employee.getById(user.id);
      }
      if (!employee && user.telegram_id) {
        employee = await Employee.getByTelegramId(user.telegram_id);
      }
      if (!employee && user.login) {
        employee = await Employee.getByLogin(user.login);
      }

      if (employee) {
        const updateData = {};
        if (name && name.trim()) updateData.name = name.trim();
        if (phone !== undefined) updateData.phone = phone.trim();
        if (password && password.trim()) updateData.password = password.trim();

        const updated = await Employee.update(employee.id, updateData);

        // Renew JWT token with updated name
        const jwt = require('jsonwebtoken');
        const JWT_SECRET = process.env.JWT_SECRET || 'qlay_store_jwt_secret_2026_change_in_production';
        const newToken = jwt.sign(
          {
            id: updated.id,
            name: updated.name,
            login: updated.login,
            telegram_id: updated.telegram_id,
            role: updated.role || 'manager'
          },
          JWT_SECRET,
          { expiresIn: '7d' }
        );

        return res.json({
          success: true,
          message: 'Profil ma\'lumotlari muvaffaqiyatli saqlandi!',
          token: newToken,
          user: {
            id: updated.id,
            name: updated.name,
            login: updated.login,
            phone: updated.phone,
            telegram_id: updated.telegram_id,
            role: updated.role,
            permissions: user.permissions,
            source: user.source
          }
        });
      } else {
        return res.status(404).json({ success: false, message: 'Xodim ma\'lumoti topilmadi' });
      }
    } catch (e) {
      console.error('[Admin] updateMyProfile error:', e);
      res.status(400).json({ success: false, message: e.message || 'Saqlashda xatolik yuz berdi' });
    }
  }
};

module.exports = adminController;
