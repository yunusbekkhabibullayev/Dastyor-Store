/**
 * User Model (CRM & Unified Customer Management)
 * 
 * Manages customer accounts across Telegram Mini App and Web Store.
 * Connects both channels via phone number and Telegram ID.
 */

const { dbRun, dbAll, dbGet } = require('../config/database.cjs');
const crypto = require('crypto');

const hashPassword = (plainPassword) => {
  if (!plainPassword) return '';
  return crypto.createHash('sha256').update(plainPassword.trim()).digest('hex');
};

const normalizePhone = (phone) => {
  if (!phone) return null;
  const digits = String(phone).replace(/[^\d+]/g, '');
  if (!digits.startsWith('+') && digits.startsWith('998')) {
    return '+' + digits;
  } else if (!digits.startsWith('+') && digits.length === 9) {
    return '+998' + digits;
  }
  return digits;
};

const User = {
  /**
   * Check if phone exists and has password set
   */
  checkPhone: async (phone) => {
    const cleanPhone = normalizePhone(phone);
    if (!cleanPhone) return { exists: false, user: null };
    const user = await dbGet('SELECT telegram_id, name, phone, password_hash, address FROM users WHERE phone = ?', [cleanPhone]);
    if (!user) return { exists: false, user: null };
    return {
      exists: true,
      user: {
        telegram_id: user.telegram_id,
        name: user.name,
        phone: user.phone,
        hasPassword: !!user.password_hash,
        address: user.address
      }
    };
  },

  /**
   * Login customer with phone & password
   */
  loginWithPassword: async (phone, password) => {
    const cleanPhone = normalizePhone(phone);
    if (!cleanPhone) throw new Error('Telefon raqami noto\'g\'ri');
    if (!password) throw new Error('Parol kiritilmadi');

    const user = await dbGet('SELECT * FROM users WHERE phone = ?', [cleanPhone]);
    if (!user) throw new Error('Ushbu telefon raqamiga ega foydalanuvchi topilmadi');
    if (user.is_blocked) throw new Error('Akkauntingiz bloklangan. Iltimos, do\'kon ma\'muriyatiga murojaat qiling');

    const pwdHash = hashPassword(password);
    if (!user.password_hash || user.password_hash !== pwdHash) {
      throw new Error('Kiritilgan maxfiy parol noto\'g\'ri!');
    }

    await dbRun('UPDATE users SET last_active_at = CURRENT_TIMESTAMP WHERE telegram_id = ?', [user.telegram_id]);
    const { password_hash, ...safeUser } = user;
    return safeUser;
  },

  /**
   * Register new customer or set password
   */
  register: async ({ phone, name, password, address }) => {
    const cleanPhone = normalizePhone(phone);
    if (!cleanPhone) throw new Error('Telefon raqami kiritilishi shart');
    if (!name || !name.trim()) throw new Error('Ism kiritilishi shart');
    if (!password || password.length < 4) throw new Error('Parol kamida 4 ta belgidan iborat bo\'lishi shart');

    const pwdHash = hashPassword(password);
    const cleanName = name.trim();
    const cleanAddress = address ? address.trim() : '';

    let existing = await dbGet('SELECT * FROM users WHERE phone = ?', [cleanPhone]);

    if (existing) {
      await dbRun(
        `UPDATE users SET 
          name = ?, 
          password_hash = ?, 
          address = COALESCE(NULLIF(?, ''), address), 
          last_active_at = CURRENT_TIMESTAMP 
         WHERE telegram_id = ?`,
        [cleanName, pwdHash, cleanAddress, existing.telegram_id]
      );
      const updated = await dbGet('SELECT * FROM users WHERE telegram_id = ?', [existing.telegram_id]);
      const { password_hash, ...safeUser } = updated;
      return safeUser;
    } else {
      const generatedId = 'web_' + cleanPhone.replace(/\D/g, '');
      await dbRun(
        `INSERT INTO users (telegram_id, name, phone, password_hash, address, source, created_at, last_active_at)
         VALUES (?, ?, ?, ?, ?, 'web', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [generatedId, cleanName, cleanPhone, pwdHash, cleanAddress]
      );
      const newUser = await dbGet('SELECT * FROM users WHERE telegram_id = ?', [generatedId]);
      const { password_hash, ...safeUser } = newUser;
      return safeUser;
    }
  },

  /**
   * Update customer profile & password
   */
  updateProfile: async (identifier, { name, phone, password, address, avatarUrl, avatar_url }) => {
    const user = await User.getById(identifier);
    if (!user) throw new Error('Foydalanuvchi topilmadi');

    const cleanName = name !== undefined ? name.trim() : user.name;
    const cleanPhone = phone !== undefined ? normalizePhone(phone) : user.phone;
    const cleanAddress = address !== undefined ? address.trim() : user.address;
    const cleanAvatar = (avatarUrl !== undefined || avatar_url !== undefined) 
      ? (avatarUrl || avatar_url) 
      : user.avatar_url;

    let pwdHash = user.password_hash;
    if (password && password.trim()) {
      pwdHash = hashPassword(password);
    }

    await dbRun(
      `UPDATE users SET 
        name = ?, 
        phone = ?, 
        password_hash = ?, 
        address = ?, 
        avatar_url = ?, 
        last_active_at = CURRENT_TIMESTAMP 
       WHERE telegram_id = ?`,
      [cleanName, cleanPhone, pwdHash, cleanAddress, cleanAvatar, user.telegram_id]
    );

    const updated = await dbGet('SELECT * FROM users WHERE telegram_id = ?', [user.telegram_id]);
    const { password_hash, ...safeUser } = updated;
    return safeUser;
  },

  /**
   * Get customer saved addresses
   */
  getAddresses: async (identifier) => {
    const user = await User.getById(identifier);
    if (!user) return [];

    let list = [];
    if (user.saved_addresses) {
      try {
        list = typeof user.saved_addresses === 'string' ? JSON.parse(user.saved_addresses) : user.saved_addresses;
      } catch (e) {
        list = [];
      }
    }

    // If saved_addresses is empty but user.address exists, migrate it
    if (list.length === 0 && user.address && user.address.trim()) {
      const defaultAddr = {
        id: 'addr_' + Date.now(),
        title: 'Asosiy manzil',
        address: user.address.trim(),
        is_default: true,
        created_at: new Date().toISOString()
      };
      list = [defaultAddr];
      await dbRun('UPDATE users SET saved_addresses = ? WHERE telegram_id = ?', [JSON.stringify(list), user.telegram_id]);
    }

    return Array.isArray(list) ? list : [];
  },

  /**
   * Save customer addresses list
   */
  saveAddresses: async (identifier, addresses) => {
    const user = await User.getById(identifier);
    if (!user) throw new Error('Foydalanuvchi topilmadi');

    const validList = Array.isArray(addresses) ? addresses : [];
    const defaultAddr = validList.find(a => a.is_default) || validList[0];
    const mainAddressStr = defaultAddr ? defaultAddr.address : (user.address || '');

    await dbRun(
      'UPDATE users SET saved_addresses = ?, address = ?, last_active_at = CURRENT_TIMESTAMP WHERE telegram_id = ?',
      [JSON.stringify(validList), mainAddressStr, user.telegram_id]
    );

    return validList;
  },

  /**
   * Find user by Telegram ID
   */
  getByTelegramId: async (telegramId) => {
    if (!telegramId) return null;
    return dbGet('SELECT * FROM users WHERE telegram_id = ?', [String(telegramId)]);
  },

  /**
   * Find user by Phone number
   */
  getByPhone: async (phone) => {
    const cleanPhone = normalizePhone(phone);
    if (!cleanPhone) return null;
    return dbGet('SELECT * FROM users WHERE phone = ?', [cleanPhone]);
  },

  /**
   * Find user by ID, Telegram ID, or Phone
   */
  getById: async (id) => {
    if (!id) return null;
    const strId = String(id).trim();
    return dbGet('SELECT * FROM users WHERE telegram_id = ? OR phone = ?', [strId, strId]);
  },

  /**
   * Synchronize & link customer between Telegram and Web (Strict 1 phone = 1 customer)
   */
  sync: async ({ telegramId, phone, name, username, avatarUrl, address, source = 'web' }) => {
    const tId = telegramId ? String(telegramId) : null;
    const cleanPhone = normalizePhone(phone);
    const cleanName = (name || '').trim();

    let existingUser = null;

    // 1. Search by Phone first (Phone is universal key)
    if (cleanPhone) {
      existingUser = await dbGet('SELECT * FROM users WHERE phone = ?', [cleanPhone]);
    }

    // 2. Search by Telegram ID if not found by phone
    if (!existingUser && tId) {
      existingUser = await dbGet('SELECT * FROM users WHERE telegram_id = ?', [tId]);
    }

    if (existingUser) {
      // Determine combined source
      let newSource = existingUser.source || 'web';
      if ((tId && existingUser.source === 'web') || (cleanPhone && existingUser.source === 'telegram')) {
        newSource = 'both';
      }

      const updatedTelegramId = (tId && !tId.startsWith('web_')) ? tId : existingUser.telegram_id;
      const updatedPhone = cleanPhone || existingUser.phone;
      const updatedName = cleanName || existingUser.name || (updatedPhone ? `Mijoz (${updatedPhone.slice(-4)})` : 'Mijoz');
      const updatedUsername = username !== undefined ? username : existingUser.username;
      const updatedAvatar = avatarUrl !== undefined ? avatarUrl : existingUser.avatar_url;
      const updatedAddress = (address && address.trim()) ? address.trim() : existingUser.address;

      await dbRun(
        `UPDATE users SET 
          telegram_id = ?, 
          phone = ?, 
          name = ?, 
          username = ?, 
          avatar_url = ?, 
          address = ?, 
          source = ?, 
          last_active_at = CURRENT_TIMESTAMP 
         WHERE telegram_id = ?`,
        [
          updatedTelegramId,
          updatedPhone,
          updatedName,
          updatedUsername,
          updatedAvatar,
          updatedAddress,
          newSource,
          existingUser.telegram_id
        ]
      );

      // Recalculate orders and spending
      await User.recalculateStats(updatedTelegramId, updatedPhone);

      return dbGet('SELECT * FROM users WHERE telegram_id = ?', [updatedTelegramId]);
    }

    // 3. Create new customer profile
    const initialTelegramId = tId || `web_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const userSource = tId ? (cleanPhone ? 'both' : 'telegram') : 'web';
    const finalName = cleanName || (cleanPhone ? `Mijoz (${cleanPhone.slice(-4)})` : 'Mijoz');

    await dbRun(
      `INSERT INTO users (telegram_id, phone, name, username, avatar_url, address, source, total_orders, total_spent, is_blocked, created_at, last_active_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [
        initialTelegramId,
        cleanPhone,
        finalName,
        username || null,
        avatarUrl || null,
        address || '',
        userSource
      ]
    );

    if (cleanPhone || tId) {
      await User.recalculateStats(initialTelegramId, cleanPhone);
    }

    return dbGet('SELECT * FROM users WHERE telegram_id = ?', [initialTelegramId]);
  },

  /**
   * Recalculate total orders and spending for a customer from orders table
   */
  recalculateStats: async (telegramId, phone) => {
    try {
      const cleanPhone = normalizePhone(phone);
      const numTelegramId = parseInt(telegramId, 10);

      let statsQuery = 'SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as spent FROM orders WHERE (';
      const params = [];

      if (!isNaN(numTelegramId) && cleanPhone) {
        statsQuery += 'user_id = ? OR phone = ?)';
        params.push(numTelegramId, cleanPhone);
      } else if (!isNaN(numTelegramId)) {
        statsQuery += 'user_id = ?)';
        params.push(numTelegramId);
      } else if (cleanPhone) {
        statsQuery += 'phone = ?)';
        params.push(cleanPhone);
      } else {
        return;
      }

      statsQuery += " AND status != 'cancelled'";

      const stats = await dbGet(statsQuery, params);
      const totalOrders = stats ? parseInt(stats.count, 10) || 0 : 0;
      const totalSpent = stats ? parseInt(stats.spent, 10) || 0 : 0;

      await dbRun(
        'UPDATE users SET total_orders = ?, total_spent = ? WHERE telegram_id = ? OR (phone = ? AND phone IS NOT NULL)',
        [totalOrders, totalSpent, String(telegramId), cleanPhone]
      );
    } catch (e) {
      console.error('Failed to recalculate user stats:', e);
    }
  },

  /**
   * Get all users for Admin CRM with filtering, search, pagination
   */
  getAll: async ({ search = '', source = 'all', isBlocked = 'all', page = 1, limit = 20, sortBy = 'last_active_at' } = {}) => {
    const offset = (page - 1) * limit;
    let whereClauses = [];
    const params = [];

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      whereClauses.push('(name ILIKE ? OR phone ILIKE ? OR username ILIKE ? OR address ILIKE ?)');
      params.push(term, term, term, term);
    }

    if (source && source !== 'all') {
      whereClauses.push('source = ?');
      params.push(source);
    }

    if (isBlocked !== 'all') {
      whereClauses.push('is_blocked = ?');
      params.push(isBlocked === 'true' || isBlocked === true);
    }

    const whereStr = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Allowed sort columns
    const allowedSort = ['created_at', 'last_active_at', 'total_orders', 'total_spent', 'name'];
    const cleanSort = allowedSort.includes(sortBy) ? sortBy : 'last_active_at';

    const countQuery = `SELECT COUNT(*) as total FROM users ${whereStr}`;
    const totalResult = await dbGet(countQuery, params);
    const total = totalResult ? parseInt(totalResult.total, 10) : 0;

    const dataQuery = `
      SELECT * FROM users 
      ${whereStr} 
      ORDER BY ${cleanSort} DESC 
      LIMIT ? OFFSET ?
    `;
    const users = await dbAll(dataQuery, [...params, limit, offset]);

    return {
      users: users || [],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1
    };
  },

  /**
   * Get customer summary statistics for Admin CRM
   */
  getCRMStats: async () => {
    const totalUsers = await dbGet('SELECT COUNT(*) as total FROM users');
    const telegramUsers = await dbGet("SELECT COUNT(*) as count FROM users WHERE source IN ('telegram', 'both')");
    const webUsers = await dbGet("SELECT COUNT(*) as count FROM users WHERE source IN ('web', 'both')");
    const activeBuyers = await dbGet('SELECT COUNT(*) as count FROM users WHERE total_orders > 0');
    const totalRevenue = await dbGet('SELECT COALESCE(SUM(total_spent), 0) as total FROM users');

    return {
      totalUsers: totalUsers ? parseInt(totalUsers.total, 10) : 0,
      telegramUsers: telegramUsers ? parseInt(telegramUsers.count, 10) : 0,
      webUsers: webUsers ? parseInt(webUsers.count, 10) : 0,
      activeBuyers: activeBuyers ? parseInt(activeBuyers.count, 10) : 0,
      totalRevenue: totalRevenue ? parseInt(totalRevenue.total, 10) : 0
    };
  },

  /**
   * Toggle user blocked state
   */
  toggleBlock: async (telegramId) => {
    const user = await dbGet('SELECT is_blocked FROM users WHERE telegram_id = ?', [String(telegramId)]);
    if (!user) throw new Error('Mijoz topilmadi');

    const newBlocked = !user.is_blocked;
    await dbRun('UPDATE users SET is_blocked = ? WHERE telegram_id = ?', [newBlocked, String(telegramId)]);
    return dbGet('SELECT * FROM users WHERE telegram_id = ?', [String(telegramId)]);
  },

  /**
   * Update internal admin CRM notes for customer
   */
  updateNotes: async (telegramId, notes) => {
    await dbRun('UPDATE users SET notes = ? WHERE telegram_id = ?', [notes, String(telegramId)]);
    return dbGet('SELECT * FROM users WHERE telegram_id = ?', [String(telegramId)]);
  }
};

module.exports = User;
