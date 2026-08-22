/**
 * User Model (CRM & Unified Customer Management)
 * 
 * Manages customer accounts across Telegram Mini App and Web Store.
 * Connects both channels via phone number and Telegram ID.
 */

const { dbRun, dbAll, dbGet } = require('../config/database.cjs');

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
   * Find user by ID or Telegram ID
   */
  getById: async (id) => {
    if (!id) return null;
    return dbGet('SELECT * FROM users WHERE id = ? OR telegram_id = ?', [id, String(id)]);
  },

  /**
   * Synchronize & link customer between Telegram and Web
   */
  sync: async ({ telegramId, phone, name, username, avatarUrl, address, source = 'web' }) => {
    const tId = telegramId ? String(telegramId) : null;
    const cleanPhone = normalizePhone(phone);
    const cleanName = (name || '').trim() || (cleanPhone ? `Mijoz (${cleanPhone.slice(-4)})` : 'Mijoz');

    let existingUser = null;

    // 1. Search by Telegram ID
    if (tId) {
      existingUser = await dbGet('SELECT * FROM users WHERE telegram_id = ?', [tId]);
    }

    // 2. Search by Phone if not found yet
    if (!existingUser && cleanPhone) {
      existingUser = await dbGet('SELECT * FROM users WHERE phone = ?', [cleanPhone]);
    }

    if (existingUser) {
      // Determine combined source
      let newSource = existingUser.source || 'web';
      if ((tId && existingUser.source === 'web') || (cleanPhone && existingUser.source === 'telegram')) {
        newSource = 'both';
      }

      const updatedTelegramId = tId || existingUser.telegram_id;
      const updatedPhone = cleanPhone || existingUser.phone;
      const updatedName = (name && name.trim()) ? name.trim() : existingUser.name;
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

    await dbRun(
      `INSERT INTO users (telegram_id, phone, name, username, avatar_url, address, source, total_orders, total_spent, is_blocked, created_at, last_active_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [
        initialTelegramId,
        cleanPhone,
        cleanName,
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
