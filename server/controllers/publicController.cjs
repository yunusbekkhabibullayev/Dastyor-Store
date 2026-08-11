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
  /** GET /api/site-settings */
  getSiteSettings: async (req, res) => {
    try {
      let settings = cacheService.get('siteSettings');
      if (!settings) {
        settings = await SiteSettings.get();
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
            attributes: attributesObj
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
   * POST /api/checkout — Process checkout with stock validation
   * Inspired by online-menu's OrderController::store() with DB::beginTransaction()
   */
  checkout: async (req, res) => {
    const { orderId, cart, address, phone, paymentMethod, user, total } = req.body;

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

    try {
      // Stock validation — check all items before creating order
      for (const item of cart) {
        const product = await Product.getById(item.id);
        if (!product) {
          return res.status(400).json({
            success: false,
            message: `Mahsulot topilmadi: ${item.id}`
          });
        }
        
        let availableStock = product.stock;
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
          availableStock = comb.stock !== undefined && comb.stock !== null && comb.stock !== '' ? parseInt(comb.stock, 10) : 0;
          if (item.selectedVariant) {
            const variantDesc = Object.entries(item.selectedVariant).map(([k, v]) => `${v}`).join(', ');
            title = `${title} (${variantDesc})`;
          }
        }
        
        if (availableStock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `"${title}" uchun yetarli zaxira yo'q. Mavjud: ${availableStock} ta.`
          });
        }
      }

      // Generate order ID
      const chatId = user.id;
      const numId = orderId ? orderId.replace('ORD-', '') : Math.floor(100 + Math.random() * 900);
      const dbOrderId = orderId || `ORD-${numId}`;

      const items = cart.map(item => ({
        id: item.id,
        quantity: item.quantity,
        price: item.price,
        selectedVariant: item.selectedVariant ? JSON.stringify(item.selectedVariant) : null
      }));

      const orderRecord = {
        id: dbOrderId,
        userId: chatId,
        name: user.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : 'Mijoz',
        phone,
        address,
        paymentMethod,
        totalAmount: total,
        status: 'processing',
        createdAt: new Date().toISOString().split('T')[0],
        items
      };

      // 1. Save order to database
      await Order.create(orderRecord);
      console.log(`[Checkout] Order ${dbOrderId} saved to database.`);

      // 2. Decrease stock for each item
      for (const item of cart) {
        const product = await Product.getById(item.id);
        if (product) {
          let attrs = null;
          if (product.attributes) {
            try {
              attrs = typeof product.attributes === 'string' ? JSON.parse(product.attributes) : product.attributes;
            } catch (e) {
              console.error('Failed to parse product attributes for stock decrease:', e);
            }
          }
          
          if (attrs && attrs.variants && attrs.variants.length > 0) {
            const comb = findCombination(attrs, item.selectedVariant);
            if (comb) {
              const currentStockVal = comb.stock !== undefined && comb.stock !== null && comb.stock !== '' ? parseInt(comb.stock, 10) : 0;
              comb.stock = Math.max(0, currentStockVal - item.quantity).toString();
              
              // Also update main product stock as sum of all variant combination stocks
              const totalStock = attrs.combinations.reduce((sum, c) => sum + (parseInt(c.stock, 10) || 0), 0);
              
              await Product.update(product.id, {
                ...product,
                stock: totalStock,
                attributes: attrs
              });
              console.log(`[Checkout] Decreased variant stock for product ${product.id} (${JSON.stringify(item.selectedVariant)}) to ${comb.stock}. Total stock: ${totalStock}.`);
            } else {
              await Product.decreaseStock(item.id, item.quantity);
            }
          } else {
            await Product.decreaseStock(item.id, item.quantity);
          }
        }
      }

      // 3. Send Telegram notification (non-blocking, don't fail checkout)
      try {
        await telegramService.sendOrderConfirmation(chatId, dbOrderId);
      } catch (telegramError) {
        console.error('[Checkout] Telegram notification failed:', telegramError.message);
      }

      // 4. Notify admins of new order (non-blocking)
      try {
        const detailedItems = [];
        for (const item of cart) {
          const product = await Product.getById(item.id);
          detailedItems.push({
            title: product ? { uz: product.title_uz, ru: product.title_ru, en: product.title_en } : { uz: item.id },
            quantity: item.quantity,
            price: item.price,
            selectedVariant: item.selectedVariant
          });
        }
        await telegramService.sendNotification({
          id: dbOrderId,
          name: orderRecord.name,
          phone: orderRecord.phone,
          address: orderRecord.address,
          paymentMethod: orderRecord.paymentMethod,
          total: orderRecord.totalAmount,
          items: detailedItems
        });
      } catch (adminNotifyError) {
        console.error('[Checkout] Admin Telegram notification failed:', adminNotifyError.message);
      }

      // 5. Clear products cache since stock decreased
      cacheService.clear('products');

      res.json({ success: true, message: 'Buyurtma tasdiqlandi!' });

    } catch (error) {
      console.error('[Checkout] Failed to process:', error.message);
      res.status(500).json({ success: false, message: 'Buyurtmani saqlashda xatolik yuz berdi.' });
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
  },

  /**
   * GET /api/user/profile — Fetch user profile across devices
   */
  getUserProfile: async (req, res) => {
    try {
      const { userId } = req.query;
      if (!userId) return res.status(400).json({ success: false, message: 'userId is required' });
      const { dbGet } = require('../config/database.cjs');
      const row = await dbGet('SELECT * FROM users WHERE telegram_id = ?', [String(userId)]);
      if (!row) {
        return res.json({ success: true, profile: null });
      }
      res.json({
        success: true,
        profile: {
          name: row.name || '',
          phone: row.phone || '',
          address: row.address || ''
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
      if (!userId) return res.status(400).json({ success: false, message: 'userId is required' });
      const { dbRun } = require('../config/database.cjs');
      await dbRun(
        `INSERT INTO users (telegram_id, name, phone, address, updated_at)
         VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
         ON CONFLICT(telegram_id) DO UPDATE SET
         name = excluded.name,
         phone = excluded.phone,
         address = excluded.address,
         updated_at = CURRENT_TIMESTAMP`,
        [String(userId), name || '', phone || '', address || '']
      );
      res.json({ success: true });
    } catch (error) {
      console.error('[API] Failed to save user profile:', error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

module.exports = publicController;
