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

const publicController = {
  /** GET /api/site-settings */
  getSiteSettings: async (req, res) => {
    try {
      const settings = await SiteSettings.get();
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
      const products = await Product.getAll();
      const mapped = products.map(p => {
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
      res.json({ success: true, products: mapped });
    } catch (error) {
      console.error('[API] Failed to fetch products:', error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getCategories: async (req, res) => {
    try {
      const categories = await Category.getAll();
      const mapped = categories.map(c => ({
        id: c.id,
        name_uz: c.name_uz,
        name_ru: c.name_ru,
        name_en: c.name_en,
        name: { uz: c.name_uz, ru: c.name_ru, en: c.name_en },
        sort_order: c.sort_order,
        is_active: c.is_active
      }));
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
        if (product.stock < item.quantity) {
          const title = product.title_uz || product.id;
          return res.status(400).json({
            success: false,
            message: `"${title}" uchun yetarli zaxira yo'q. Mavjud: ${product.stock} ta.`
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
        price: item.price
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
        const result = await Product.decreaseStock(item.id, item.quantity);
        if (result.changes === 0) {
          console.warn(`[Checkout] Stock decrease failed for product ${item.id} — possible race condition.`);
        }
      }

      // 3. Send Telegram notification (non-blocking, don't fail checkout)
      try {
        await telegramService.sendOrderConfirmation(chatId, dbOrderId);
      } catch (telegramError) {
        console.error('[Checkout] Telegram notification failed:', telegramError.message);
      }

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
      const banners = await Banner.getAll();
      const mapped = banners.map(b => ({
        id: b.id,
        title: { uz: b.title_uz, ru: b.title_ru, en: b.title_en },
        subtitle: { uz: b.subtitle_uz, ru: b.subtitle_ru, en: b.subtitle_en },
        image: b.image,
        badge: { uz: b.badge_uz, ru: b.badge_ru, en: b.badge_en },
        buttonText: { uz: b.button_text_uz, ru: b.button_text_ru, en: b.button_text_en }
      }));
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
