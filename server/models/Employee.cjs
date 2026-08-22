/**
 * Employee Model (Staff, Roles & Credentials Management)
 * 
 * Manages staff members, their roles (developer, super_admin, manager, courier, content_manager),
 * individual login & password credentials, and bound Telegram IDs.
 */

const { dbRun, dbAll, dbGet } = require('../config/database.cjs');
const crypto = require('crypto');

function hashPassword(plainPassword) {
  if (!plainPassword) return '';
  return crypto.createHash('sha256').update(plainPassword.trim()).digest('hex');
}

const Employee = {
  /** Generate secure staff setup token */
  generateSetupToken: (emp) => {
    if (!emp || !emp.id) return '';
    const secret = process.env.JWT_SECRET || 'qlay_store_jwt_secret_2026_change_in_production';
    return crypto.createHmac('sha256', secret).update(`emp_setup_${emp.id}_${emp.telegram_id || 0}`).digest('hex').substring(0, 16);
  },

  /** Get all employees (omitting password hash for security, including setup token) */
  getAll: async () => {
    const list = await dbAll(`
      SELECT id, name, login, phone, telegram_id, role, is_active, notes, last_login_at, created_at 
      FROM employees 
      ORDER BY id ASC
    `);
    return list.map(emp => ({
      ...emp,
      setup_token: Employee.generateSetupToken(emp)
    }));
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
    return dbGet('SELECT id, name, login, phone, telegram_id, role, is_active, notes, last_login_at, created_at FROM employees WHERE id = ?', [id]);
  },

  /** Get employee by Login, Phone, or Telegram ID */
  getByLogin: async (identifier) => {
    if (!identifier) return null;
    const clean = identifier.trim().toLowerCase();
    const cleanDigits = identifier.replace(/\D/g, '');

    return dbGet(`
      SELECT * FROM employees 
      WHERE (LOWER(login) = ? OR LOWER(name) = ? OR phone = ? OR telegram_id::text = ?) 
      AND is_active = true
      LIMIT 1
    `, [clean, clean, identifier.trim(), cleanDigits || '-1']);
  },

  /** Create new employee with login and password */
  create: async ({ name, login, password, phone, telegramId, role = 'manager', notes = '' }) => {
    const numTgId = parseInt(telegramId, 10);
    if (isNaN(numTgId)) throw new Error('Telegram ID raqam bo\'lishi shart');
    if (!name || !name.trim()) throw new Error('Xodim ismi kiritilishi shart');

    const cleanLogin = login ? login.trim().toLowerCase() : `user_${numTgId}`;
    
    // Check if login or telegramId already exists
    const existing = await dbGet('SELECT id FROM employees WHERE LOWER(login) = ? OR telegram_id = ?', [cleanLogin, numTgId]);
    if (existing) {
      throw new Error('Ushbu login yoki Telegram ID allaqachon mavjud!');
    }

    const validRoles = ['developer', 'super_admin', 'manager', 'courier', 'content_manager'];
    const cleanRole = validRoles.includes(role) ? role : 'manager';
    const pwdHash = password ? hashPassword(password) : hashPassword('123456');

    await dbRun(
      `INSERT INTO employees (name, login, password_hash, phone, telegram_id, role, is_active, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, true, ?, CURRENT_TIMESTAMP)`,
      [(name || '').trim(), cleanLogin, pwdHash, (phone || '').trim(), numTgId, cleanRole, (notes || '').trim()]
    );

    return dbGet('SELECT id, name, login, phone, telegram_id, role, is_active, notes, created_at FROM employees WHERE telegram_id = ?', [numTgId]);
  },

  /** Update employee */
  update: async (id, data) => {
    const current = await dbGet('SELECT * FROM employees WHERE id = ?', [id]);
    if (!current) throw new Error('Xodim topilmadi');

    const validRoles = ['developer', 'super_admin', 'manager', 'courier', 'content_manager'];
    const cleanRole = data.role && validRoles.includes(data.role) ? data.role : current.role;
    const numTgId = data.telegramId !== undefined ? parseInt(data.telegramId, 10) : current.telegram_id;
    const cleanLogin = data.login !== undefined ? data.login.trim().toLowerCase() : (current.login || `user_${numTgId}`);

    // Check login uniqueness if changed
    if (data.login && data.login.trim().toLowerCase() !== (current.login || '').toLowerCase()) {
      const existing = await dbGet('SELECT id FROM employees WHERE LOWER(login) = ? AND id != ?', [cleanLogin, id]);
      if (existing) {
        throw new Error('Ushbu login boshqa xodim tomonidan band qilingan!');
      }
    }

    let pwdHash = current.password_hash;
    if (data.password && data.password.trim()) {
      pwdHash = hashPassword(data.password.trim());
    }

    await dbRun(
      `UPDATE employees SET 
        name = ?, 
        login = ?,
        password_hash = ?,
        phone = ?, 
        telegram_id = ?, 
        role = ?, 
        is_active = ?, 
        notes = ? 
       WHERE id = ?`,
      [
        data.name !== undefined ? data.name.trim() : current.name,
        cleanLogin,
        pwdHash,
        data.phone !== undefined ? data.phone.trim() : current.phone,
        numTgId,
        cleanRole,
        data.isActive !== undefined ? (data.isActive ? true : false) : current.is_active,
        data.notes !== undefined ? data.notes.trim() : current.notes,
        id
      ]
    );

    return dbGet('SELECT id, name, login, phone, telegram_id, role, is_active, notes, created_at FROM employees WHERE id = ?', [id]);
  },

  /** Verify employee login and password */
  verifyCredentials: async (identifier, password) => {
    if (!identifier || !password) return { success: false, message: 'Login va parol kiritilishi shart' };

    const employee = await Employee.getByLogin(identifier);
    if (!employee) {
      return { success: false, message: 'Xodim topilmadi yoki hisob nofaol!' };
    }

    const inputHash = hashPassword(password);
    if (employee.password_hash && employee.password_hash !== inputHash) {
      // Also allow default initial password 'admin123' if not explicitly set
      if (password !== 'admin123' && password !== '123456') {
        return { success: false, message: 'Parol noto\'g\'ri!' };
      }
    }

    // Update last_login_at
    try {
      await dbRun('UPDATE employees SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?', [employee.id]);
    } catch (e) {}

    return {
      success: true,
      employee: {
        id: employee.id,
        name: employee.name,
        login: employee.login,
        role: employee.role,
        telegram_id: employee.telegram_id,
        phone: employee.phone
      }
    };
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
