/**
 * Employee Model (Staff & Roles Management)
 * 
 * Manages staff members, their roles (developer, super_admin, manager, courier, content_manager)
 * and bound Telegram IDs.
 */

const { dbRun, dbAll, dbGet } = require('../config/database.cjs');

const Employee = {
  /** Get all employees */
  getAll: async () => {
    return dbAll('SELECT * FROM employees ORDER BY id ASC');
  },

  /** Get active employee by Telegram ID */
  getByTelegramId: async (telegramId) => {
    if (!telegramId) return null;
    const numId = parseInt(telegramId, 10);
    if (isNaN(numId)) return null;
    return dbGet('SELECT * FROM employees WHERE telegram_id = ? AND is_active = true', [numId]);
  },

  /** Get employee by ID */
  getById: async (id) => {
    return dbGet('SELECT * FROM employees WHERE id = ?', [id]);
  },

  /** Create new employee */
  create: async ({ name, phone, telegramId, role = 'manager', notes = '' }) => {
    const numTgId = parseInt(telegramId, 10);
    if (isNaN(numTgId)) throw new Error('Telegram ID raqam bo\'lishi shart');
    if (!name || !name.trim()) throw new Error('Xodim ismi kiritilishi shart');

    const validRoles = ['developer', 'super_admin', 'manager', 'courier', 'content_manager'];
    const cleanRole = validRoles.includes(role) ? role : 'manager';

    await dbRun(
      `INSERT INTO employees (name, phone, telegram_id, role, is_active, notes, created_at)
       VALUES (?, ?, ?, ?, true, ?, CURRENT_TIMESTAMP)`,
      [(name || '').trim(), (phone || '').trim(), numTgId, cleanRole, (notes || '').trim()]
    );

    return dbGet('SELECT * FROM employees WHERE telegram_id = ?', [numTgId]);
  },

  /** Update employee */
  update: async (id, data) => {
    const current = await dbGet('SELECT * FROM employees WHERE id = ?', [id]);
    if (!current) throw new Error('Xodim topilmadi');

    const validRoles = ['developer', 'super_admin', 'manager', 'courier', 'content_manager'];
    const cleanRole = data.role && validRoles.includes(data.role) ? data.role : current.role;
    const numTgId = data.telegramId !== undefined ? parseInt(data.telegramId, 10) : current.telegram_id;

    await dbRun(
      `UPDATE employees SET 
        name = ?, 
        phone = ?, 
        telegram_id = ?, 
        role = ?, 
        is_active = ?, 
        notes = ? 
       WHERE id = ?`,
      [
        data.name !== undefined ? data.name.trim() : current.name,
        data.phone !== undefined ? data.phone.trim() : current.phone,
        numTgId,
        cleanRole,
        data.isActive !== undefined ? (data.isActive ? true : false) : current.is_active,
        data.notes !== undefined ? data.notes.trim() : current.notes,
        id
      ]
    );

    return dbGet('SELECT * FROM employees WHERE id = ?', [id]);
  },

  /** Delete employee */
  delete: async (id) => {
    const current = await dbGet('SELECT * FROM employees WHERE id = ?', [id]);
    if (!current) throw new Error('Xodim topilmadi');
    if (current.role === 'developer') {
      throw new Error('Dasturchi akkauntini o\'chirib bo\'lmaydi');
    }
    await dbRun('DELETE FROM employees WHERE id = ?', [id]);
    return { success: true };
  }
};

module.exports = Employee;
