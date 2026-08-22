/**
 * Order Model
 * 
 * CRUD operations for orders + order_items tables.
 * Stats queries for admin dashboard.
 * Inspired by online-menu's Order.php model.
 */

const { dbRun, dbAll, dbGet } = require('../config/database.cjs');

/** Current moment in Tashkent local time, formatted "YYYY-MM-DD HH:MM:SS". */
function nowTashkent() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tashkent',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  }).formatToParts(new Date());
  const get = (type) => parts.find((p) => p.type === type).value;
  return `${get('year')}-${get('month')}-${get('day')} ${get('hour')}:${get('minute')}:${get('second')}`;
}

const Order = {
  nowTashkent,

  /**
   * Next sequential order id (ORD-1, ORD-2, ...) — atomic via Postgres
   * SEQUENCE, safe under concurrent checkouts. Continues from the highest
   * pre-existing order number (backfilled once, 2026-08-22).
   */
  getNextId: async () => {
    const row = await dbGet("SELECT nextval('orders_id_seq') AS n");
    return `ORD-${row.n}`;
  },

  /** Get all orders (newest first — safe numeric id order, which is chronological) */
  getAll: () => {
    return dbAll("SELECT * FROM orders ORDER BY (CASE WHEN id ~ '^ORD-[0-9]+$' THEN (REPLACE(id, 'ORD-', ''))::bigint ELSE 0 END) DESC, id DESC");
  },

  /** Get single order by ID */
  getById: (id) => {
    return dbGet("SELECT * FROM orders WHERE id = ?", [id]);
  },

  /** Get orders by user ID */
  getByUserId: (userId) => {
    const numId = parseInt(userId, 10);
    return dbAll(
      "SELECT * FROM orders WHERE user_id = ? OR user_id = ? ORDER BY (CASE WHEN id ~ '^ORD-[0-9]+$' THEN (REPLACE(id, 'ORD-', ''))::bigint ELSE 0 END) DESC, id DESC",
      [userId, isNaN(numId) ? userId : numId]
    );
  },

  /** Get order items with product info */
  getItems: (orderId) => {
    return dbAll(
      `SELECT oi.*, p.title_uz, p.title_ru, p.title_en, p.image, p.unit 
       FROM order_items oi 
       LEFT JOIN products p ON oi.product_id = p.id 
       WHERE oi.order_id = ?`,
      [orderId]
    );
  },

  /** Create new order with items (transaction-like) */
  create: async (orderData) => {
    const { id, userId, name, phone, address, paymentMethod, totalAmount, status, createdAt, items } = orderData;

    // Insert order
    await dbRun(
      "INSERT INTO orders (id, user_id, name, phone, address, payment_method, total_amount, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [id, userId, name, phone, address, paymentMethod, totalAmount, status || 'processing', createdAt]
    );

    // Insert order items
    for (const item of items) {
      await dbRun(
        "INSERT INTO order_items (order_id, product_id, quantity, price, selected_variant) VALUES (?, ?, ?, ?, ?)",
        [id, item.id, item.quantity, item.price, item.selectedVariant || null]
      );
    }
  },

  /** Update order status */
  updateStatus: (orderId, status) => {
    return dbRun("UPDATE orders SET status = ? WHERE id = ?", [status, orderId]);
  },

  /** Delete order and its items (CASCADE handles items) */
  delete: (orderId) => {
    return dbRun("DELETE FROM orders WHERE id = ?", [orderId]);
  },

  /** Get dashboard statistics */
  getStats: async () => {
    // created_at endi "YYYY-MM-DD HH:MM:SS" — sana bo'yicha solishtirish uchun
    // prefiks bilan (LIKE), aniq tenglik emas.
    const todayPrefix = `${nowTashkent().slice(0, 10)}%`;

    const [todayOrders, totalRevenue, todayRevenue, totalProducts, pendingOrders, totalCategories] = await Promise.all([
      dbGet("SELECT COUNT(*) as count FROM orders WHERE created_at LIKE ?", [todayPrefix]),
      dbGet("SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE status != 'cancelled'"),
      dbGet("SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE created_at LIKE ? AND status != 'cancelled'", [todayPrefix]),
      dbGet("SELECT COUNT(*) as count FROM products"),
      dbGet("SELECT COUNT(*) as count FROM orders WHERE status = 'processing'"),
      dbGet("SELECT COUNT(*) as count FROM categories"),
    ]);

    return {
      todayOrders: todayOrders.count || 0,
      totalRevenue: totalRevenue.total || 0,
      todayRevenue: todayRevenue.total || 0,
      totalProducts: totalProducts.count || 0,
      pendingOrders: pendingOrders.count || 0,
      totalCategories: totalCategories.count || 0
    };
  }
};

module.exports = Order;
