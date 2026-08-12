/**
 * Category Model
 * 
 * CRUD operations for categories table.
 * Inspired by online-menu's Category.php model.
 */

const { dbRun, dbAll, dbGet } = require('../config/database.cjs');

const Category = {
  /** Get all categories */
  getAll: () => {
    return dbAll("SELECT * FROM categories ORDER BY sort_order, id");
  },

  /** Get single category by ID */
  getById: (id) => {
    return dbGet("SELECT * FROM categories WHERE id = ?", [id]);
  },

  /** Create new category */
  create: (id, name_uz, name_ru, name_en, sort_order = 0, is_active = 1) => {
    return dbRun(
      "INSERT INTO categories (id, name_uz, name_ru, name_en, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?)",
      [id, name_uz, name_ru, name_en, sort_order, is_active]
    );
  },

  /** Update existing category */
  update: (id, name_uz, name_ru, name_en, sort_order = 0, is_active = 1) => {
    return dbRun(
      "UPDATE categories SET name_uz = ?, name_ru = ?, name_en = ?, sort_order = ?, is_active = ? WHERE id = ?",
      [name_uz, name_ru, name_en, sort_order, is_active, id]
    );
  },

  /** Delete category by ID */
  delete: async (id) => {
    const check = await dbGet("SELECT COUNT(*) as count FROM products WHERE category_id = ?", [id]);
    if (check && parseInt(check.count, 10) > 0) {
      throw new Error("Ushbu kategoriyada mahsulotlar mavjud bo'lgani uchun uni o'chirib bo'lmaydi. Iltimos, oldin ichidagi mahsulotlarni boshqa kategoriyaga o'tkazing yoki o'chiring.");
    }
    return dbRun("DELETE FROM categories WHERE id = ?", [id]);
  },

  /** Count total categories */
  count: async () => {
    const row = await dbGet("SELECT COUNT(*) as count FROM categories");
    return row.count;
  }
};

module.exports = Category;
