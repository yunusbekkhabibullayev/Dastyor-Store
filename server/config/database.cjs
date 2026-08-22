/**
 * Database Configuration & Initialization
 * 
 * PostgreSQL connection via pg pool, helper functions, and schema initialization.
 */

const { Pool } = require('pg');
require('dotenv').config();

// Initialize PostgreSQL Pool
// SSL o'chirilgan — lokal Docker tarmog'idagi Postgres SSL'siz ishlaydi.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected error on idle client:', err.message);
});

// ─── Helper Functions ───────────────────────────────────────────

/** Convert SQLite ? placeholders to PostgreSQL $1, $2, etc. */
const convertQuery = (sql) => {
  let i = 1;
  return sql.replace(/\?/g, () => `$${i++}`);
};

/** Run INSERT, UPDATE, DELETE queries */
const dbRun = async (sql, params = []) => {
  const convertedSql = convertQuery(sql);
  try {
    const result = await pool.query(convertedSql, params);
    // pg doesn't return lastID unless RETURNING is used, but our app doesn't rely on lastID
    return { lastID: null, changes: result.rowCount };
  } catch (err) {
    throw err;
  }
};

/** Fetch all rows (SELECT) */
const dbAll = async (sql, params = []) => {
  const convertedSql = convertQuery(sql);
  try {
    const result = await pool.query(convertedSql, params);
    return result.rows;
  } catch (err) {
    throw err;
  }
};

/** Fetch single row */
const dbGet = async (sql, params = []) => {
  const convertedSql = convertQuery(sql);
  try {
    const result = await pool.query(convertedSql, params);
    return result.rows[0] || null;
  } catch (err) {
    throw err;
  }
};

// ─── Schema Initialization ──────────────────────────────────────

const dbInit = async () => {
  // Create tables using PostgreSQL syntax
  await dbRun(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name_uz TEXT NOT NULL,
      name_ru TEXT NOT NULL,
      name_en TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS users (
      telegram_id TEXT PRIMARY KEY,
      name TEXT,
      phone TEXT,
      address TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      category_id TEXT,
      title_uz TEXT NOT NULL,
      title_ru TEXT NOT NULL,
      title_en TEXT NOT NULL,
      description_uz TEXT,
      description_ru TEXT,
      description_en TEXT,
      price INTEGER NOT NULL CHECK(price >= 0),
      old_price INTEGER CHECK(old_price IS NULL OR old_price >= 0),
      stock NUMERIC(10,2) DEFAULT 0 CHECK(stock >= 0),
      image TEXT,
      attributes TEXT,
      unit TEXT DEFAULT 'dona',
      FOREIGN KEY (category_id) REFERENCES categories(id)
    )
  `);

  // Sequential order numbers (ORD-1, ORD-2, ...) — Order.getNextId() draws from
  // this. A fresh/empty DB starts at 1; an existing DB keeps counting from
  // wherever it already was (nextval is monotonic, IF NOT EXISTS is a no-op).
  await dbRun(`CREATE SEQUENCE IF NOT EXISTS orders_id_seq`);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id BIGINT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      payment_method TEXT,
      total_amount INTEGER NOT NULL CHECK(total_amount >= 0),
      status TEXT DEFAULT 'processing' CHECK(status IN ('processing', 'shipping', 'delivered', 'cancelled')),
      created_at TEXT NOT NULL
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS order_items (
      id SERIAL PRIMARY KEY,
      order_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      quantity NUMERIC(10,2) NOT NULL CHECK(quantity > 0),
      price INTEGER NOT NULL CHECK(price >= 0),
      selected_variant TEXT,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS banners (
      id SERIAL PRIMARY KEY,
      title_uz TEXT,
      title_ru TEXT,
      title_en TEXT,
      subtitle_uz TEXT,
      subtitle_ru TEXT,
      subtitle_en TEXT,
      image TEXT NOT NULL,
      badge_uz TEXT,
      badge_ru TEXT,
      badge_en TEXT,
      button_text_uz TEXT,
      button_text_ru TEXT,
      button_text_en TEXT
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS site_settings (
      id SERIAL PRIMARY KEY,
      name TEXT DEFAULT 'Ravshan Rivoj Market',
      description TEXT DEFAULT 'Oziq-ovqat mahsulotlari do''koni',
      logo TEXT DEFAULT '',
      phone TEXT DEFAULT '+998 90 123 45 67',
      address TEXT DEFAULT 'Toshkent sh.',
      working_hours TEXT DEFAULT '09:00 - 22:00',
      telegram_channel TEXT DEFAULT '',
      instagram TEXT DEFAULT '',
      bot_token TEXT DEFAULT '',
      bot_username TEXT DEFAULT 'ravshan_rivoj_bot',
      delivery_price INTEGER DEFAULT 0,
      bts_delivery_price INTEGER DEFAULT 50000,
      is_delivery_active INTEGER DEFAULT 1,
      is_bts_active INTEGER DEFAULT 1,
      admin_ids TEXT DEFAULT '',
      is_active INTEGER DEFAULT 1
    )
  `);

  // Seed default site settings if table is empty
  const settingsCount = await dbGet("SELECT COUNT(*) as count FROM site_settings");
  if (parseInt(settingsCount.count, 10) === 0) {
    await dbRun(`
      INSERT INTO site_settings (id, name, description, logo, phone, address, working_hours, telegram_channel, instagram, bot_token, bot_username, delivery_price, bts_delivery_price, is_active)
      VALUES (1, 'Ravshan Rivoj Market', 'Oziq-ovqat mahsulotlari do''koni', '', '+998 90 123 45 67', 'Toshkent sh.', '09:00 - 22:00', '', '', '', 'ravshan_rivoj_bot', 0, 50000, 1)
    `);
  }

  // Create indexes for better query performance
  await dbRun('CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id)');
  await dbRun('CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id)');
  await dbRun('CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)');
  await dbRun('CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at)');
  await dbRun('CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id)');
  
  // Migrations using information_schema for PostgreSQL
  const checkColumn = async (table, column) => {
    const res = await dbGet("SELECT column_name FROM information_schema.columns WHERE table_name = $1 AND column_name = $2", [table, column]);
    return !!res;
  };

  if (!(await checkColumn('products', 'attributes'))) {
    try { await dbRun("ALTER TABLE products ADD COLUMN attributes TEXT"); } catch (e) {}
  }
  if (!(await checkColumn('categories', 'sort_order'))) {
    try { await dbRun("ALTER TABLE categories ADD COLUMN sort_order INTEGER DEFAULT 0"); } catch (e) {}
  }
  if (!(await checkColumn('categories', 'is_active'))) {
    try { await dbRun("ALTER TABLE categories ADD COLUMN is_active INTEGER DEFAULT 1"); } catch (e) {}
  }
  if (!(await checkColumn('site_settings', 'admin_ids'))) {
    try { await dbRun("ALTER TABLE site_settings ADD COLUMN admin_ids TEXT DEFAULT ''"); } catch (e) {}
  }
  if (!(await checkColumn('site_settings', 'admin_roles'))) {
    try { await dbRun("ALTER TABLE site_settings ADD COLUMN admin_roles TEXT DEFAULT '{}'"); } catch (e) {}
  }
  if (!(await checkColumn('site_settings', 'bts_delivery_price'))) {
    try { await dbRun("ALTER TABLE site_settings ADD COLUMN bts_delivery_price INTEGER DEFAULT 50000"); } catch (e) {}
  }
  if (!(await checkColumn('order_items', 'selected_variant'))) {
    try { await dbRun("ALTER TABLE order_items ADD COLUMN selected_variant TEXT"); } catch (e) {}
  }
  if (!(await checkColumn('products', 'unit'))) {
    try { await dbRun("ALTER TABLE products ADD COLUMN unit TEXT DEFAULT 'dona'"); } catch (e) {}
  }

  // Users CRM table column migrations
  if (!(await checkColumn('users', 'username'))) {
    try { await dbRun("ALTER TABLE users ADD COLUMN username TEXT"); } catch (e) {}
  }
  if (!(await checkColumn('users', 'avatar_url'))) {
    try { await dbRun("ALTER TABLE users ADD COLUMN avatar_url TEXT"); } catch (e) {}
  }
  if (!(await checkColumn('users', 'source'))) {
    try { await dbRun("ALTER TABLE users ADD COLUMN source VARCHAR(20) DEFAULT 'web'"); } catch (e) {}
  }
  if (!(await checkColumn('users', 'total_orders'))) {
    try { await dbRun("ALTER TABLE users ADD COLUMN total_orders INTEGER DEFAULT 0"); } catch (e) {}
  }
  if (!(await checkColumn('users', 'total_spent'))) {
    try { await dbRun("ALTER TABLE users ADD COLUMN total_spent BIGINT DEFAULT 0"); } catch (e) {}
  }
  if (!(await checkColumn('users', 'is_blocked'))) {
    try { await dbRun("ALTER TABLE users ADD COLUMN is_blocked BOOLEAN DEFAULT false"); } catch (e) {}
  }
  if (!(await checkColumn('users', 'notes'))) {
    try { await dbRun("ALTER TABLE users ADD COLUMN notes TEXT"); } catch (e) {}
  }
  if (!(await checkColumn('users', 'created_at'))) {
    try { await dbRun("ALTER TABLE users ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP"); } catch (e) {}
  }
  if (!(await checkColumn('users', 'last_active_at'))) {
    try { await dbRun("ALTER TABLE users ADD COLUMN last_active_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP"); } catch (e) {}
  }
  if (!(await checkColumn('users', 'saved_addresses'))) {
    try { await dbRun("ALTER TABLE users ADD COLUMN saved_addresses TEXT DEFAULT '[]'"); } catch (e) {}
  }

  // Site settings delivery active flags
  if (!(await checkColumn('site_settings', 'is_delivery_active'))) {
    try { await dbRun("ALTER TABLE site_settings ADD COLUMN is_delivery_active INTEGER DEFAULT 1"); } catch (e) {}
  }
  if (!(await checkColumn('site_settings', 'is_bts_active'))) {
    try { await dbRun("ALTER TABLE site_settings ADD COLUMN is_bts_active INTEGER DEFAULT 1"); } catch (e) {}
  }

  try {
    await dbRun('CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone)');
  } catch (e) {}

  // Alter column types to NUMERIC(10,2) to support decimal quantities and stocks
  try {
    await dbRun("ALTER TABLE order_items ALTER COLUMN quantity TYPE NUMERIC(10,2)");
    console.log("[DB Migration] Migrated order_items.quantity to NUMERIC(10,2)");
  } catch (e) {
    console.error("[DB Migration] Error migrating order_items.quantity:", e.message);
  }

  try {
    await dbRun("ALTER TABLE products ALTER COLUMN stock TYPE NUMERIC(10,2)");
    console.log("[DB Migration] Migrated products.stock to NUMERIC(10,2)");
  } catch (e) {
    console.error("[DB Migration] Error migrating products.stock:", e.message);
  }

  // Drop NOT NULL constraint on banners title columns to make them optional
  try {
    await dbRun("ALTER TABLE banners ALTER COLUMN title_uz DROP NOT NULL");
    await dbRun("ALTER TABLE banners ALTER COLUMN title_ru DROP NOT NULL");
    await dbRun("ALTER TABLE banners ALTER COLUMN title_en DROP NOT NULL");
    console.log("[DB Migration] Dropped NOT NULL constraints on banner title columns");
  } catch (e) {
    console.warn("[DB Migration] Failed to drop NOT NULL constraints on banner title columns:", e.message);
  }

  // ─── Employees Table (Staff & Roles Management) ──────────────────────────
  await dbRun(`
    CREATE TABLE IF NOT EXISTS employees (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      phone VARCHAR(20),
      telegram_id BIGINT UNIQUE NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'manager',
      is_active BOOLEAN DEFAULT true,
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `);
  try {
    await dbRun('CREATE INDEX IF NOT EXISTS idx_employees_telegram_id ON employees(telegram_id)');
  } catch (e) {}

  // Seed primary developer & admins into employees table if empty
  try {
    const empCount = await dbGet("SELECT COUNT(*) as count FROM employees");
    if (parseInt(empCount.count, 10) === 0) {
      // Add primary developer
      await dbRun(
        `INSERT INTO employees (name, phone, telegram_id, role, notes) 
         VALUES ('Yunusbek Khabibullayev (Dasturchi)', '+998901234567', 1165441564, 'developer', 'Bosh dasturchi / Tizim yaratuvchisi')
         ON CONFLICT (telegram_id) DO NOTHING`
      );

      // Seed existing admin IDs from site_settings or telegramConfig
      const settings = await dbGet("SELECT admin_ids, admin_roles FROM site_settings WHERE id = 1");
      if (settings && settings.admin_ids) {
        const ids = settings.admin_ids.split(',').map(s => parseInt(s.trim(), 10)).filter(id => !isNaN(id));
        let roles = {};
        try { roles = typeof settings.admin_roles === 'string' ? JSON.parse(settings.admin_roles) : (settings.admin_roles || {}); } catch (e) {}

        for (const tgId of ids) {
          if (tgId === 1165441564) continue;
          const assignedRole = roles[String(tgId)] || 'manager';
          await dbRun(
            `INSERT INTO employees (name, phone, telegram_id, role, notes)
             VALUES (?, '', ?, ?, 'Asosiy admin sozlamalaridan olingan')
             ON CONFLICT (telegram_id) DO NOTHING`,
            [`Xodim (${tgId})`, tgId, assignedRole]
          );
        }
      }
    }
  } catch (e) {
    console.error("[DB Migration] Failed to seed initial employees:", e.message);
  }

  // ─── Deduplicate and Normalize User Phone Numbers in Users Table ─────────
  try {
    // 1. Normalize all phone numbers in users table to digits only with leading '+'
    const allUsers = await dbAll("SELECT telegram_id, name, phone, address, total_orders, total_spent, last_active_at, created_at FROM users");
    const phoneGroups = {};

    for (const u of allUsers) {
      if (!u.phone) continue;
      const cleanPhone = '+' + u.phone.replace(/[^\d]/g, '').replace(/^998/, '998');
      const normalized = cleanPhone.startsWith('+998') ? cleanPhone : ('+998' + cleanPhone.replace(/^\+/, ''));
      
      // Update normalized phone
      if (u.phone !== normalized) {
        try {
          await dbRun("UPDATE users SET phone = ? WHERE telegram_id = ?", [normalized, u.telegram_id]);
          u.phone = normalized;
        } catch (e) {}
      }

      if (!phoneGroups[normalized]) {
        phoneGroups[normalized] = [];
      }
      phoneGroups[normalized].push(u);
    }

    // 2. For each phone group with duplicates, merge them into the single best record
    for (const [phone, group] of Object.entries(phoneGroups)) {
      if (group.length > 1) {
        // Find best record (has real telegram_id, highest orders, or newest)
        group.sort((a, b) => {
          const aHasTg = a.telegram_id && !a.telegram_id.startsWith('web_');
          const bHasTg = b.telegram_id && !b.telegram_id.startsWith('web_');
          if (aHasTg && !bHasTg) return -1;
          if (!aHasTg && bHasTg) return 1;
          return (b.total_orders || 0) - (a.total_orders || 0);
        });

        const primary = group[0];
        const duplicates = group.slice(1);

        for (const dup of duplicates) {
          // Re-link orders if duplicate has a different user_id
          if (dup.telegram_id && primary.telegram_id && dup.telegram_id !== primary.telegram_id) {
            try {
              await dbRun("UPDATE orders SET user_id = ? WHERE user_id = ?", [primary.telegram_id, dup.telegram_id]);
            } catch (e) {}
          }
          // Delete duplicate user row
          await dbRun("DELETE FROM users WHERE telegram_id = ?", [dup.telegram_id]);
          console.log(`[DB Migration] Merged duplicate user ${dup.name || dup.telegram_id} into primary ${primary.name || primary.telegram_id} for phone ${phone}`);
        }
      }
    }
  } catch (e) {
    console.warn("[DB Migration] User phone deduplication note:", e.message);
  }

  // ─── Seed Data (Disabled for Production) ──────────────────────────────────────────────
  // No initial seeding of categories/products to start with a completely empty catalog.
};

module.exports = {
  dbRun,
  dbAll,
  dbGet,
  dbInit,
  pool
};
