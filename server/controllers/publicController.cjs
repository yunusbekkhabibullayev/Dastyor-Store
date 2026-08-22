/**
 * Public Controller
 * 
 * Handles all public-facing API endpoints: products, categories, checkout, user orders.
 * Inspired by online-menu's OrderController.php and MenuController.php.
 */

const Category = require('../models/Category.cjs');
const Product = require('../models/Product.cjs');
const Order = require('../models/Order.cjs');
const Banner = require('../models/Banner.cjs');
const SiteSettings = require('../models/SiteSettings.cjs');
const telegramService = require('../services/TelegramService.cjs');
const cacheService = require('../services/cacheService.cjs');

const publicController = {
  /**
   * GET /api/site-settings — public, unauthenticated. Only display-safe
   * fields: bot_token/admin_ids/admin_roles never leave the server here
   * (use GET /api/admin/site-settings, which is auth-gated, for those).
   */
  getSiteSettings: async (req, res) => {
    try {
      let settings = cacheService.get('siteSettings');
      if (!settings) {
        const full = await SiteSettings.get();
        const {
          id, name, description, logo, phone, address, working_hours,
          telegram_channel, instagram, bot_username, delivery_price,
          bts_delivery_price, is_delivery_active, is_bts_active, is_active
        } = full;
        settings = {
          id, name, description, logo, phone, address, working_hours,
          telegram_channel, instagram, bot_username, delivery_price,
          bts_delivery_price,
          is_delivery_active: is_delivery_active !== undefined ? is_delivery_active : 1,
          is_bts_active: is_bts_active !== undefined ? is_bts_active : 1,
          is_active
        };
        cacheService.set('siteSettings', settings);
      }
      res.json({ success: true, settings });
    } catch (error) {
      console.error('[API] Failed to fetch site settings:', error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  },
  /**
   * GET /api/products — Public product listing
   */
  getProducts: async (req, res) => {
    try {
      let mapped = cacheService.get('products');
      if (!mapped) {
        const products = await Product.getAll();
        mapped = products.map(p => {
          let attributesObj = {};
          if (p.attributes) {
            try {
              attributesObj = typeof p.attributes === 'string' ? JSON.parse(p.attributes) : p.attributes;
            } catch (e) {
              console.warn(`[API] Failed to parse attributes for product ${p.id}:`, e.message);
            }
          }
          return {
            id: p.id,
            categoryId: p.category_id,
            category_id: p.category_id,
            title_uz: p.title_uz,
            title_ru: p.title_ru,
            title_en: p.title_en,
            description_uz: p.description_uz,
            description_ru: p.description_ru,
            description_en: p.description_en,
            title: { uz: p.title_uz, ru: p.title_ru, en: p.title_en },
            description: { uz: p.description_uz, ru: p.description_ru, en: p.description_en },
            price: p.price,
            oldPrice: p.old_price,
            old_price: p.old_price,
            stock: p.stock,
            image: p.image,
            images: [p.image],
            attributes: attributesObj,
            unit: p.unit || 'dona'
          };
        });
        cacheService.set('products', mapped);
      }
      res.json({ success: true, products: mapped });
    } catch (error) {
      console.error('[API] Failed to fetch products:', error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getCategories: async (req, res) => {
    try {
      let mapped = cacheService.get('categories');
      if (!mapped) {
        const categories = await Category.getAll();
        mapped = categories.map(c => ({
          id: c.id,
          name_uz: c.name_uz,
          name_ru: c.name_ru,
          name_en: c.name_en,
          name: { uz: c.name_uz, ru: c.name_ru, en: c.name_en },
          sort_order: c.sort_order,
          is_active: c.is_active
        }));
        cacheService.set('categories', mapped);
      }
      res.json({ success: true, categories: mapped });
    } catch (error) {
      console.error('[API] Failed to fetch categories:', error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * GET /api/user/:userId/orders — User order history
   */
  getUserOrders: async (req, res) => {
    const { userId } = req.params;
    try {
      const orders = await Order.getByUserId(userId);
      for (const order of orders) {
        const items = await Order.getItems(order.id);
        order.items = items.map(item => ({
          ...item,
          title: { uz: item.title_uz, ru: item.title_ru, en: item.title_en }
        }));
      }
      res.json({ success: true, orders });
    } catch (error) {
      console.error(`[API] Failed to fetch orders for user ${userId}:`, error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * GET /api/orders/public/:orderId — Public Order Verification for QR Code Scans
   */
  getPublicOrder: async (req, res) => {
    const { orderId } = req.params;
    try {
      const order = await Order.getById(orderId);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Buyurtma topilmadi' });
      }
      const rawItems = await Order.getItems(order.id);
      const items = rawItems.map(item => ({
        ...item,
        title: { uz: item.title_uz, ru: item.title_ru, en: item.title_en }
      }));

      res.json({
        success: true,
        order: {
          id: order.id,
          date: order.created_at,
          total: order.total_amount,
          status: order.status,
          address: order.address,
          customer_name: order.name,
          phone: order.phone,
          payment_method: order.payment_method,
          items
        }
      });
    } catch (error) {
      console.error(`[API] Failed to fetch public order ${orderId}:`, error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * POST /api/checkout — Process checkout with transaction & promo discount
   */
  checkout: async (req, res) => {
    const { cart, address, phone, paymentMethod, user, total, appliedPromo } = req.body;

    if (!user || !user.id) {
      return res.status(400).json({ success: false, message: 'Foydalanuvchi ma\'lumotlari to\'liq emas.' });
    }

    const findCombination = (productAttributes, selectedVariant) => {
      if (!productAttributes || !productAttributes.combinations || !selectedVariant) return null;
      return productAttributes.combinations.find(comb => {
        const combKeys = Object.keys(comb.values);
        const selKeys = Object.keys(selectedVariant);
        if (combKeys.length !== selKeys.length) return false;
        return combKeys.every(k => comb.values[k] === selectedVariant[k]);
      });
    };

    const { pool, dbGet } = require('../config/database.cjs');

    try {
      let subtotal = 0;
      const validItems = [];
      const productUpdates = [];

      // 1. Stock validation & Price Calculation
      for (const item of cart) {
        const product = await Product.getById(item.id);
        if (!product) {
          return res.status(400).json({
            success: false,
            message: `Mahsulot topilmadi: ${item.id}`
          });
        }
        
        let availableStock = parseFloat(product.stock) || 0;
        let itemPrice = product.price; // Use base price from DB
        let title = product.title_uz || product.id;
        
        let attrs = null;
        if (product.attributes) {
          try {
            attrs = typeof product.attributes === 'string' ? JSON.parse(product.attributes) : product.attributes;
          } catch (e) {
            console.error('Failed to parse product attributes:', e);
          }
        }
        
        if (attrs && attrs.variants && attrs.variants.length > 0) {
          const comb = findCombination(attrs, item.selectedVariant);
          if (!comb) {
            return res.status(400).json({
              success: false,
              message: `"${title}" uchun tanlangan variant mavjud emas.`
            });
          }
          availableStock = comb.stock !== undefined && comb.stock !== null && comb.stock !== '' ? parseFloat(comb.stock) : 0;
          if (comb.price) {
             itemPrice = parseInt(comb.price, 10);
          }
          if (item.selectedVariant) {
            const variantDesc = Object.entries(item.selectedVariant).map(([k, v]) => `${v}`).join(', ');
            title = `${title} (${variantDesc})`;
          }

          const currentStockVal = comb.stock !== undefined && comb.stock !== null && comb.stock !== '' ? parseFloat(comb.stock) : 0;
          comb.stock = Math.max(0, currentStockVal - item.quantity).toString();
          const totalStock = attrs.combinations.reduce((sum, c) => sum + (parseFloat(c.stock) || 0), 0);
          productUpdates.push({
            type: 'variant',
            id: product.id,
            totalStock,
            attributes: attrs
          });
        } else {
          productUpdates.push({
            type: 'simple',
            id: item.id,
            quantity: item.quantity
          });
        }
        
        if (availableStock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `"${title}" uchun yetarli zaxira yo'q. Mavjud: ${availableStock} ta.`
          });
        }

        subtotal += itemPrice * item.quantity;
        validItems.push({
          id: item.id,
          quantity: item.quantity,
          price: itemPrice, // Secure DB price
          selectedVariant: item.selectedVariant ? JSON.stringify(item.selectedVariant) : null
        });
      }

      // 2. Promo Code Calculation
      let discountAmount = 0;
      if (appliedPromo && appliedPromo.code) {
        const cleanCode = String(appliedPromo.code).trim().toUpperCase();
        let validPercent = 0;
        if (cleanCode === 'RAVSHANRIVOJ2026' || cleanCode === 'PROMO15') validPercent = 15;
        else if (cleanCode === 'PROMO10' || cleanCode === 'SKIDKA10') validPercent = 10;
        else if (appliedPromo.discountPercent && Number(appliedPromo.discountPercent) > 0) {
          validPercent = Math.min(50, Math.max(1, parseInt(appliedPromo.discountPercent, 10)));
        }
        discountAmount = Math.round((subtotal * validPercent) / 100);
      }

      let calculatedTotal = Math.max(0, subtotal - discountAmount);

      // Add delivery price if applicable
      const isDelivery = ['Yetkazib berish', 'Доставка', 'Delivery'].includes(paymentMethod);
      if (isDelivery) {
        const settings = await dbGet("SELECT delivery_price FROM site_settings WHERE id = 1");
        const deliveryPrice = settings && settings.delivery_price !== undefined ? settings.delivery_price : 30000;
        calculatedTotal += deliveryPrice;
      }

      // Generate order ID — sequential, server-authoritative
      const chatId = user.id;
      const dbOrderId = await Order.getNextId();

      const orderRecord = {
        id: dbOrderId,
        userId: chatId,
        name: user.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : 'Mijoz',
        phone,
        address,
        paymentMethod,
        totalAmount: calculatedTotal,
        status: 'processing',
        createdAt: Order.nowTashkent(),
        items: validItems
      };

      // 3. Database Transaction Execution
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Insert Order
        await client.query(
          "INSERT INTO orders (id, user_id, name, phone, address, payment_method, total_amount, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
          [dbOrderId, chatId, orderRecord.name, phone, address, paymentMethod, calculatedTotal, 'processing', orderRecord.createdAt]
        );

        // Insert Order Items
        for (const item of validItems) {
          await client.query(
            "INSERT INTO order_items (order_id, product_id, quantity, price, selected_variant) VALUES ($1, $2, $3, $4, $5)",
            [dbOrderId, item.id, item.quantity, item.price, item.selectedVariant]
          );
        }

        // Decrement Stock
        for (const update of productUpdates) {
          if (update.type === 'variant') {
            await client.query(
              "UPDATE products SET stock = $1, attributes = $2 WHERE id = $3",
              [update.totalStock, JSON.stringify(update.attributes), update.id]
            );
          } else {
            await client.query(
              "UPDATE products SET stock = GREATEST(0, stock - $1) WHERE id = $2",
              [update.quantity, update.id]
            );
          }
        }

        await client.query('COMMIT');
        console.log(`[Checkout] Order ${dbOrderId} successfully committed to database in transaction.`);
      } catch (txErr) {
        await client.query('ROLLBACK');
        throw txErr;
      } finally {
        client.release();
      }

      // 4. Send Telegram notification (non-blocking, don't fail checkout)
      try {
        await telegramService.sendOrderConfirmation(chatId, dbOrderId);
      } catch (telegramError) {
        console.error('[Checkout] Telegram notification failed:', telegramError.message);
      }

      // 5. Notify admins of new order (non-blocking)
      try {
        const detailedItems = [];
        for (const item of cart) {
          const product = await Product.getById(item.id);
          detailedItems.push({
            title: product ? { uz: product.title_uz, ru: product.title_ru, en: product.title_en } : { uz: item.id },
            quantity: item.quantity,
            price: item.price,
            selectedVariant: item.selectedVariant,
            unit: product ? (product.unit || 'dona') : 'dona'
          });
        }
        await telegramService.sendNotification({
          id: dbOrderId,
          name: orderRecord.name,
          phone: orderRecord.phone,
          address: orderRecord.address,
          addressCoords: req.body.addressCoords || null,
          paymentMethod: orderRecord.paymentMethod,
          total: orderRecord.totalAmount,
          items: detailedItems
        });
      } catch (adminNotifyError) {
        console.error('[Checkout] Admin Telegram notification failed:', adminNotifyError.message);
      }

      // 6. Sync customer to users table & update CRM stats
      try {
        const User = require('../models/User.cjs');
        await User.sync({
          telegramId: chatId ? String(chatId) : null,
          phone: orderRecord.phone,
          name: orderRecord.name,
          username: user?.username || null,
          address: orderRecord.address,
          source: chatId ? 'telegram' : 'web'
        });
      } catch (userSyncErr) {
        console.warn('[Checkout] User sync error:', userSyncErr.message);
      }

      // 7. Clear products cache since stock decreased
      cacheService.clear('products');

      res.json({ success: true, message: 'Buyurtma tasdiqlandi!', orderId: dbOrderId });

    } catch (error) {
      console.error('[Checkout] Failed to process:', error.message);
      res.status(500).json({ success: false, message: 'Buyurtmani saqlashda xatolik yuz berdi.' });
    }
  },

  /**
   * POST /api/user/sync — Synchronize customer profile across Telegram and Web
   */
  syncUser: async (req, res) => {
    try {
      const { initData, phone, name, address, source } = req.body || {};
      const { verifyInitData } = require('../services/telegramAuth.cjs');
      const User = require('../models/User.cjs');

      let telegramId = null;
      let tgUsername = null;
      let tgName = null;

      if (initData) {
        const tgUser = verifyInitData(initData);
        if (tgUser) {
          telegramId = tgUser.id;
          tgUsername = tgUser.username;
          tgName = `${tgUser.first_name || ''} ${tgUser.last_name || ''}`.trim();
        }
      }

      const syncResult = await User.sync({
        telegramId,
        phone,
        name: name || tgName,
        username: tgUsername,
        address,
        source: source || (telegramId ? 'telegram' : 'web')
      });

      res.json({
        success: true,
        user: syncResult
      });
    } catch (error) {
      console.error('[API] Failed to sync user:', error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * GET /api/user/profile — Fetch user profile across devices
   */
  getUserProfile: async (req, res) => {
    try {
      const { userId, phone } = req.query;
      const User = require('../models/User.cjs');

      let row = null;
      if (userId) {
        row = await User.getByTelegramId(userId);
      }
      if (!row && phone) {
        row = await User.getByPhone(phone);
      }

      if (!row) {
        return res.json({ success: true, profile: null });
      }

      res.json({
        success: true,
        profile: {
          id: row.id,
          telegram_id: row.telegram_id,
          name: row.name || '',
          phone: row.phone || '',
          address: row.address || '',
          source: row.source || 'web',
          total_orders: row.total_orders || 0,
          total_spent: row.total_spent || 0
        }
      });
    } catch (error) {
      console.error('[API] Failed to get user profile:', error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * POST /api/user/profile — Save user profile across devices
   */
  saveUserProfile: async (req, res) => {
    try {
      const { userId, name, phone, address } = req.body;
      const User = require('../models/User.cjs');

      const updated = await User.sync({
        telegramId: userId ? String(userId) : null,
        phone,
        name,
        address
      });

      res.json({ success: true, user: updated });
    } catch (error) {
      console.error('[API] Failed to save user profile:', error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * POST /api/user/auth/check-phone — Check if phone exists and has password
   */
  checkUserPhone: async (req, res) => {
    try {
      const { phone } = req.body;
      const User = require('../models/User.cjs');
      const result = await User.checkPhone(phone);
      res.json({ success: true, exists: result.exists, user: result.user });
    } catch (e) {
      res.status(400).json({ success: false, message: e.message || 'Xatolik yuz berdi' });
    }
  },

  /**
   * POST /api/user/auth/login — Customer login with phone & password
   */
  loginUser: async (req, res) => {
    try {
      const { phone, password } = req.body;
      const User = require('../models/User.cjs');
      const jwt = require('jsonwebtoken');
      const JWT_SECRET = process.env.JWT_SECRET || 'qlay_store_jwt_secret_2026_change_in_production';

      const user = await User.loginWithPassword(phone, password);
      const token = jwt.sign(
        { id: user.telegram_id, phone: user.phone, name: user.name, role: 'customer' },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      const userOrders = await Order.getByUserId(user.telegram_id);

      res.json({
        success: true,
        message: 'Tizimga muvaffaqiyatli kirildi!',
        token,
        user,
        orders: userOrders
      });
    } catch (e) {
      res.status(400).json({ success: false, message: e.message || 'Kirishda xatolik yuz berdi' });
    }
  },

  /**
   * POST /api/user/auth/register — Customer registration
   */
  registerUser: async (req, res) => {
    try {
      const { phone, name, password, address } = req.body;
      const User = require('../models/User.cjs');
      const jwt = require('jsonwebtoken');
      const JWT_SECRET = process.env.JWT_SECRET || 'qlay_store_jwt_secret_2026_change_in_production';

      const user = await User.register({ phone, name, password, address });
      const token = jwt.sign(
        { id: user.telegram_id, phone: user.phone, name: user.name, role: 'customer' },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      res.json({
        success: true,
        message: 'Ro\'yxatdan o\'tish muvaffaqiyatli yakunlandi!',
        token,
        user
      });
    } catch (e) {
      res.status(400).json({ success: false, message: e.message || 'Ro\'yxatdan o\'tishda xatolik yuz berdi' });
    }
  },

  /**
   * GET /api/user/me — Get authenticated customer profile & orders
   */
  getMe: async (req, res) => {
    try {
      const authHeader = req.headers['authorization'];
      let userId = null;
      let phone = req.query.phone;

      if (authHeader && authHeader.startsWith('Bearer ')) {
        const jwt = require('jsonwebtoken');
        const JWT_SECRET = process.env.JWT_SECRET || 'qlay_store_jwt_secret_2026_change_in_production';
        try {
          const decoded = jwt.verify(authHeader.substring(7), JWT_SECRET);
          userId = decoded.id;
          phone = decoded.phone || phone;
        } catch (e) {}
      }

      const User = require('../models/User.cjs');
      let user = null;
      if (userId) {
        user = await User.getByTelegramId(userId);
      }
      if (!user && phone) {
        user = await User.getByPhone(phone);
      }

      if (!user) {
        return res.status(404).json({ success: false, message: 'Foydalanuvchi topilmadi' });
      }

      const { password_hash, ...safeUser } = user;
      const userOrders = await Order.getByUserId(user.telegram_id);

      res.json({
        success: true,
        user: safeUser,
        orders: userOrders
      });
    } catch (e) {
      res.status(500).json({ success: false, message: e.message });
    }
  },

  /**
   * PUT /api/user/me — Update customer profile
   */
  updateMe: async (req, res) => {
    try {
      const authHeader = req.headers['authorization'];
      let identifier = req.body.userId || req.body.phone;

      if (authHeader && authHeader.startsWith('Bearer ')) {
        const jwt = require('jsonwebtoken');
        const JWT_SECRET = process.env.JWT_SECRET || 'qlay_store_jwt_secret_2026_change_in_production';
        try {
          const decoded = jwt.verify(authHeader.substring(7), JWT_SECRET);
          identifier = decoded.id || decoded.phone || identifier;
        } catch (e) {}
      }

      if (!identifier) {
        return res.status(400).json({ success: false, message: 'Foydalanuvchi aniqlanmadi' });
      }

      const User = require('../models/User.cjs');
      const updatedUser = await User.updateProfile(identifier, req.body);

      res.json({
        success: true,
        message: 'Profil ma\'lumotlari yangilandi!',
        user: updatedUser
      });
    } catch (e) {
      res.status(400).json({ success: false, message: e.message });
    }
  },

  /**
   * POST /api/user/upload-avatar — Upload customer profile avatar
   */
  uploadAvatar: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Rasm fayli yuklanmadi' });
      }
      const path = require('path');
      const fs = require('fs');
      const UPLOADS_DIR = path.join(__dirname, '../../uploads');
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(req.file.originalname) || '.jpg';
      const filename = 'avatar-' + uniqueSuffix + ext;

      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
      fs.writeFileSync(path.join(UPLOADS_DIR, filename), req.file.buffer);

      const fileUrl = '/uploads/' + filename;
      res.json({ success: true, fileUrl });
    } catch (err) {
      console.error('[API] Avatar upload error:', err);
      res.status(500).json({ success: false, message: err.message || 'Rasm yuklashda xatolik' });
    }
  },

  /**
   * GET /api/geocode/reverse — Multi-provider robust reverse geocoder with in-memory caching
   */
  reverseGeocode: async (req, res) => {
    try {
      const lat = parseFloat(req.query.lat);
      const lon = parseFloat(req.query.lon || req.query.lng);

      if (isNaN(lat) || isNaN(lon)) {
        return res.status(400).json({ success: false, message: 'Koordinatalar noto\'g\'ri' });
      }

      const lang = req.query.lang || 'uz';
      const cacheKey = `${lat.toFixed(4)}_${lon.toFixed(4)}_${lang}`;

      // In-memory caching for 10-meter radius
      if (!global.geocodeCache) {
        global.geocodeCache = new Map();
      }
      if (global.geocodeCache.has(cacheKey)) {
        const cached = global.geocodeCache.get(cacheKey);
        return res.json({ success: true, address: cached, cached: true, lat, lon });
      }

      let formattedAddress = '';

      // Provider 1: OpenStreetMap Nominatim with custom User-Agent
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);
        const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1&accept-language=${lang}`;

        const response = await fetch(nominatimUrl, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'DastyorStoreApp/2.0 (admin@dastyor.store)',
            'Accept': 'application/json'
          }
        });
        clearTimeout(timeout);

        if (response.ok) {
          const data = await response.json();
          if (data && data.address) {
            const a = data.address;
            const poi = a.shop || a.amenity || a.building || a.office || a.leisure || a.tourism || data.name || '';
            const house = a.house_number || a.building || '';
            const road = a.road || a.pedestrian || a.street || '';
            const streetPart = road ? (house ? `${road}, ${house}-uy` : road) : (house ? `${house}-uy` : '');
            const neighbourhood = a.residential || a.neighbourhood || a.quarter || a.suburb || '';
            const district = a.city_district || a.district || a.borough || '';
            const city = a.city || a.town || a.village || a.county || a.state || '';

            const parts = [
              poi && poi !== road ? poi : '',
              streetPart,
              neighbourhood,
              district && district !== city ? district : '',
              city
            ].filter(Boolean);

            formattedAddress = parts.join(', ') || data.display_name.split(',').slice(0, 4).join(', ');
          }
        }
      } catch (e) {
        console.warn('[Geocode API] Nominatim attempt failed, trying fallback:', e.message);
      }

      // Provider 2: Photon Komoot Geocoder (Fallback)
      if (!formattedAddress) {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 3500);
          const photonUrl = `https://photon.komoot.io/reverse?lat=${lat}&lon=${lon}`;
          const response = await fetch(photonUrl, { signal: controller.signal });
          clearTimeout(timeout);

          if (response.ok) {
            const data = await response.json();
            if (data && data.features && data.features.length > 0) {
              const p = data.features[0].properties || {};
              const parts = [
                p.name,
                p.street ? (p.housenumber ? `${p.street}, ${p.housenumber}-uy` : p.street) : (p.housenumber ? `${p.housenumber}-uy` : ''),
                p.district,
                p.city || p.town || p.state
              ].filter(Boolean);
              formattedAddress = parts.join(', ');
            }
          }
        } catch (e) {
          console.warn('[Geocode API] Photon fallback failed:', e.message);
        }
      }

      // Provider 3: BigDataCloud Reverse Geocoder (Fallback)
      if (!formattedAddress) {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 3500);
          const bdcUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=${lang}`;
          const response = await fetch(bdcUrl, { signal: controller.signal });
          clearTimeout(timeout);

          if (response.ok) {
            const data = await response.json();
            if (data) {
              const parts = [
                data.localityInfo?.administrative?.[4]?.name || data.locality,
                data.localityInfo?.administrative?.[3]?.name,
                data.localityInfo?.administrative?.[2]?.name || data.city,
                data.principalSubdivision
              ].filter(Boolean);
              formattedAddress = parts.join(', ');
            }
          }
        } catch (e) {
          console.warn('[Geocode API] BigDataCloud fallback failed:', e.message);
        }
      }

      if (!formattedAddress) {
        formattedAddress = `Manzil: ${lat.toFixed(5)}, ${lon.toFixed(5)}`;
      }

      // Store in memory cache (limit to 1000 items)
      if (global.geocodeCache.size > 1000) {
        global.geocodeCache.clear();
      }
      global.geocodeCache.set(cacheKey, formattedAddress);

      res.json({
        success: true,
        address: formattedAddress,
        lat,
        lon
      });
    } catch (err) {
      console.error('[Geocode API] Error:', err.message);
      const lat = parseFloat(req.query.lat);
      const lon = parseFloat(req.query.lon || req.query.lng);
      res.json({
        success: true,
        address: `Manzil: ${lat.toFixed(5)}, ${lon.toFixed(5)}`,
        lat,
        lon
      });
    }
  },

  /**
   * GET /api/user/addresses — Get customer saved addresses
   */
  getUserAddresses: async (req, res) => {
    try {
      const authHeader = req.headers['authorization'];
      let identifier = req.query.userId || req.query.phone;

      if (authHeader && authHeader.startsWith('Bearer ')) {
        const jwt = require('jsonwebtoken');
        const JWT_SECRET = process.env.JWT_SECRET || 'qlay_store_jwt_secret_2026_change_in_production';
        try {
          const decoded = jwt.verify(authHeader.substring(7), JWT_SECRET);
          identifier = decoded.id || decoded.phone || identifier;
        } catch (e) {}
      }

      if (!identifier) {
        return res.status(400).json({ success: false, message: 'Foydalanuvchi aniqlanmadi' });
      }

      const User = require('../models/User.cjs');
      const addresses = await User.getAddresses(identifier);

      res.json({ success: true, addresses });
    } catch (e) {
      res.status(500).json({ success: false, message: e.message });
    }
  },

  /**
   * POST /api/user/addresses — Save customer addresses list
   */
  saveUserAddresses: async (req, res) => {
    try {
      const authHeader = req.headers['authorization'];
      let identifier = req.body.userId || req.body.phone;

      if (authHeader && authHeader.startsWith('Bearer ')) {
        const jwt = require('jsonwebtoken');
        const JWT_SECRET = process.env.JWT_SECRET || 'qlay_store_jwt_secret_2026_change_in_production';
        try {
          const decoded = jwt.verify(authHeader.substring(7), JWT_SECRET);
          identifier = decoded.id || decoded.phone || identifier;
        } catch (e) {}
      }

      if (!identifier) {
        return res.status(400).json({ success: false, message: 'Foydalanuvchi aniqlanmadi' });
      }

      const User = require('../models/User.cjs');
      const addresses = await User.saveAddresses(identifier, req.body.addresses);

      res.json({
        success: true,
        message: 'Manzillar muvaffaqiyatli saqlandi!',
        addresses
      });
    } catch (e) {
      res.status(400).json({ success: false, message: e.message });
    }
  },

  /**
   * GET /api/bot-info — Bot username for frontend
   */
  getBotInfo: (req, res) => {
    res.json({ success: true, username: telegramService.getBotUsername() });
  },

  /**
   * GET /api/banners — Public promo banners listing
   */
  getBanners: async (req, res) => {
    try {
      let mapped = cacheService.get('banners');
      if (!mapped) {
        const banners = await Banner.getAll();
        mapped = banners.map(b => ({
          id: b.id,
          title: { uz: b.title_uz, ru: b.title_ru, en: b.title_en },
          subtitle: { uz: b.subtitle_uz, ru: b.subtitle_ru, en: b.subtitle_en },
          image: b.image,
          badge: { uz: b.badge_uz, ru: b.badge_ru, en: b.badge_en },
          buttonText: { uz: b.button_text_uz, ru: b.button_text_ru, en: b.button_text_en }
        }));
        cacheService.set('banners', mapped);
      }
      res.json({ success: true, banners: mapped });
    } catch (error) {
      console.error('[API] Failed to fetch banners:', error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * GET /api/health — Health check endpoint
   */
  healthCheck: (req, res) => {
    res.json({
      success: true,
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      telegram: telegramService.isConfigured
    });
  }
};

module.exports = publicController;
