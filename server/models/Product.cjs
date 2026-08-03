/**
 * Product Model
 * 
 * CRUD operations for products table with pagination support.
 * Inspired by online-menu's FoodItem.php model.
 */

const { dbRun, dbAll, dbGet } = require('../config/database.cjs');

const Product = {
  /** Get all products (with optional pagination) */
  getAll: (page = null, limit = null) => {
    if (page && limit) {
      const offset = (page - 1) * limit;
      return dbAll("SELECT * FROM products ORDER BY id LIMIT ? OFFSET ?", [limit, offset]);
    }
    return dbAll("SELECT * FROM products ORDER BY id");
  },

  /** Get single product by ID */
  getById: (id) => {
    return dbGet("SELECT * FROM products WHERE id = ?", [id]);
  },

  /** Get products by category */
  getByCategory: (categoryId) => {
    return dbAll("SELECT * FROM products WHERE category_id = ? ORDER BY id", [categoryId]);
  },

  /** Create new product */
  create: (data) => {
    const { id, category_id, title_uz, title_ru, title_en, description_uz, description_ru, description_en, price, old_price, stock, image, attributes } = data;
    const attrString = attributes ? (typeof attributes === 'string' ? attributes : JSON.stringify(attributes)) : null;
    return dbRun(
      "INSERT INTO products (id, category_id, title_uz, title_ru, title_en, description_uz, description_ru, description_en, price, old_price, stock, image, attributes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [id, category_id, title_uz, title_ru, title_en, description_uz, description_ru, description_en, price, old_price, stock, image, attrString]
    );
  },

  /** Update existing product */
  update: (id, data) => {
    const { category_id, title_uz, title_ru, title_en, description_uz, description_ru, description_en, price, old_price, stock, image, attributes } = data;
    const attrString = attributes ? (typeof attributes === 'string' ? attributes : JSON.stringify(attributes)) : null;
    return dbRun(
      "UPDATE products SET category_id = ?, title_uz = ?, title_ru = ?, title_en = ?, description_uz = ?, description_ru = ?, description_en = ?, price = ?, old_price = ?, stock = ?, image = ?, attributes = ? WHERE id = ?",
      [category_id, title_uz, title_ru, title_en, description_uz, description_ru, description_en, price, old_price, stock, image, attrString, id]
    );
  },

  /** Delete product by ID */
  delete: async (id) => {
    await dbRun("DELETE FROM order_items WHERE product_id = ?", [id]);
    return dbRun("DELETE FROM products WHERE id = ?", [id]);
  },

  /** Decrease stock for a product (during checkout) */
  decreaseStock: (id, quantity) => {
    return dbRun(
      "UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?",
      [quantity, id]
    );
  },

  /** Count total products */
  count: async () => {
    const row = await dbGet("SELECT COUNT(*) as count FROM products");
    return row.count;
  }
};

module.exports = Product;
