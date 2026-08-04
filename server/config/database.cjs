/**
 * Database Configuration & Initialization
 * 
 * PostgreSQL connection via pg pool, helper functions, and schema initialization.
 */

const { Pool } = require('pg');
require('dotenv').config();

// Initialize PostgreSQL Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected error on idle client', err);
  process.exit(-1);
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
      stock INTEGER DEFAULT 0 CHECK(stock >= 0),
      image TEXT,
      attributes TEXT,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    )
  `);

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
      quantity INTEGER NOT NULL CHECK(quantity > 0),
      price INTEGER NOT NULL CHECK(price >= 0),
      selected_variant TEXT,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS banners (
      id SERIAL PRIMARY KEY,
      title_uz TEXT NOT NULL,
      title_ru TEXT NOT NULL,
      title_en TEXT NOT NULL,
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
      name TEXT DEFAULT 'Dastyor Store',
      description TEXT DEFAULT 'Eng sara kosmetika va gullar do''koni',
      logo TEXT DEFAULT '',
      phone TEXT DEFAULT '+998 90 123 45 67',
      address TEXT DEFAULT 'Toshkent sh., Chilonzor tumani, Qatortol ko''chasi 15-uy',
      working_hours TEXT DEFAULT '09:00 - 22:00',
      telegram_channel TEXT DEFAULT 'https://t.me/qlaystore',
      instagram TEXT DEFAULT 'https://instagram.com/qlaystore',
      bot_token TEXT DEFAULT '',
      bot_username TEXT DEFAULT 'qlay_store_bot',
      delivery_price INTEGER DEFAULT 0,
      bts_delivery_price INTEGER DEFAULT 50000,
      admin_ids TEXT DEFAULT '',
      is_active INTEGER DEFAULT 1
    )
  `);

  // Seed default site settings if table is empty
  const settingsCount = await dbGet("SELECT COUNT(*) as count FROM site_settings");
  if (parseInt(settingsCount.count, 10) === 0) {
    await dbRun(`
      INSERT INTO site_settings (id, name, description, logo, phone, address, working_hours, telegram_channel, instagram, bot_token, bot_username, delivery_price, bts_delivery_price, is_active)
      VALUES (1, 'Dastyor Store', 'Eng sara kosmetika va gullar do''koni', '', '+998 90 123 45 67', 'Toshkent sh., Chilonzor tumani, Qatortol ko''chasi 15-uy', '09:00 - 22:00', 'https://t.me/qlaystore', 'https://instagram.com/qlaystore', '', 'qlay_store_bot', 0, 50000, 1)
    `);
  } else {
    await dbRun("UPDATE site_settings SET logo = '' WHERE logo = '/images/mascara.png'");
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
  if (!(await checkColumn('site_settings', 'bts_delivery_price'))) {
    try { await dbRun("ALTER TABLE site_settings ADD COLUMN bts_delivery_price INTEGER DEFAULT 50000"); } catch (e) {}
  }
  if (!(await checkColumn('order_items', 'selected_variant'))) {
    try { await dbRun("ALTER TABLE order_items ADD COLUMN selected_variant TEXT"); } catch (e) {}
  }

  // ─── Seed Data ──────────────────────────────────────────────
  const catCount = await dbGet("SELECT COUNT(*) as count FROM categories");
  if (parseInt(catCount.count, 10) === 0) {
    const defaultCategories = [
      { id: 'cosmetics', name: { uz: 'Kosmetika', ru: 'Косметика', en: 'Cosmetics' } },
      { id: 'flowers', name: { uz: 'Gullar', ru: 'Цветы', en: 'Flowers' } },
      { id: 'men', name: { uz: 'Erkaklar modasi', ru: 'Мужская мода', en: "Men's Fashion" } },
      { id: 'women', name: { uz: 'Ayollar modasi', ru: 'Женская мода', en: "Women's Fashion" } },
      { id: 'electronics', name: { uz: 'Elektronika', ru: 'Электроника', en: 'Electronics' } },
    ];
    for (const cat of defaultCategories) {
      await dbRun(
        "INSERT INTO categories (id, name_uz, name_ru, name_en, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?)",
        [cat.id, cat.name.uz, cat.name.ru, cat.name.en, 0, 1]
      );
    }
    console.log('[DB] Seeded default categories');
  }

  const prodCount = await dbGet("SELECT COUNT(*) as count FROM products");
  if (parseInt(prodCount.count, 10) === 0) {
    const defaultProducts = [
      {
        id: 'prod_1', category_id: 'cosmetics', price: 145000, old_price: 180000, stock: 10,
        title: { uz: "L'Oréal Paris Bambi Ko'z Tushi", ru: "Тушь L'Oréal Paris Bambi", en: "L'Oréal Paris Bambi Mascara" },
        description: { uz: 'Kipriklarni uzaytiruvchi va qalinlashtiruvchi tush', ru: 'Удлиняющая и утолщающая тушь', en: 'Lengthening and thickening mascara' },
        image: '/images/mascara.png'
      },
      {
        id: 'prod_2', category_id: 'cosmetics', price: 210000, old_price: null, stock: 5,
        title: { uz: 'SKIN1004 Centella Ampulasi', ru: 'Ампула SKIN1004 Centella', en: 'SKIN1004 Centella Ampoule' },
        description: { uz: 'Yuz terisini tinchlantiruvchi va namlovchi zardob', ru: 'Успокаивающая и увлажняющая сыворотка', en: 'Soothing and moisturizing serum' },
        image: '/images/ampoule.png'
      },
      {
        id: 'prod_3', category_id: 'flowers', price: 350000, old_price: 400000, stock: 3,
        title: { uz: '101 ta Qizil Atirgul Guldastasi', ru: 'Букет из 101 красной розы', en: 'Букет из 101 красной розы' },
        description: { uz: 'Yaqinlar uchun maxsus sovg\'a', ru: 'Особый подарок для близких', en: 'Special gift for loved ones' },
        image: '/images/roses.png'
      }
    ];
    for (const prod of defaultProducts) {
      await dbRun(
        "INSERT INTO products (id, category_id, title_uz, title_ru, title_en, description_uz, description_ru, description_en, price, old_price, stock, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [prod.id, prod.category_id, prod.title.uz, prod.title.ru, prod.title.en, prod.description.uz, prod.description.ru, prod.description.en, prod.price, prod.old_price, prod.stock, prod.image]
      );
    }
    console.log('[DB] Seeded default products');
  }
};

module.exports = {
  dbRun,
  dbAll,
  dbGet,
  dbInit,
  pool
};
