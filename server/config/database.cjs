/**
 * Database Configuration & Initialization
 * 
 * SQLite connection, helper functions, and schema initialization.
 * Inspired by online-menu's database config pattern.
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../../database.sqlite');
const db = new sqlite3.Database(dbPath);

// ─── Helper Functions ───────────────────────────────────────────

/** Run INSERT, UPDATE, DELETE queries */
const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this); // { lastID, changes }
    });
  });
};

/** Fetch all rows (SELECT) */
const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

/** Fetch single row */
const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

// ─── Schema Initialization ──────────────────────────────────────

const dbInit = async () => {
  // Enable WAL mode for better concurrent read performance
  await dbRun('PRAGMA journal_mode=WAL');
  await dbRun('PRAGMA foreign_keys=ON');

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
      user_id INTEGER,
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
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      quantity INTEGER NOT NULL CHECK(quantity > 0),
      price INTEGER NOT NULL CHECK(price >= 0),
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS banners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
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
      id INTEGER PRIMARY KEY DEFAULT 1,
      name TEXT DEFAULT 'Qlay Store',
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
      is_active INTEGER DEFAULT 1
    )
  `);

  // Seed default site settings if table is empty
  const settingsCount = await dbGet("SELECT COUNT(*) as count FROM site_settings");
  if (settingsCount.count === 0) {
    await dbRun(`
      INSERT INTO site_settings (id, name, description, logo, phone, address, working_hours, telegram_channel, instagram, bot_token, bot_username, delivery_price, is_active)
      VALUES (1, 'Qlay Store', 'Eng sara kosmetika va gullar do''koni', '', '+998 90 123 45 67', 'Toshkent sh., Chilonzor tumani, Qatortol ko''chasi 15-uy', '09:00 - 22:00', 'https://t.me/qlaystore', 'https://instagram.com/qlaystore', '', 'qlay_store_bot', 0, 1)
    `);
  } else {
    // Clear out hardcoded mascara default logo from site_settings if present
    await dbRun("UPDATE site_settings SET logo = '' WHERE logo = '/images/mascara.png'");
  }

  // Create indexes for better query performance
  await dbRun('CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id)');
  await dbRun('CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id)');
  await dbRun('CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)');
  await dbRun('CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at)');
  await dbRun('CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id)');
  
  // Migration check: Add attributes column to products if it doesn't exist
  const columns = await dbAll("PRAGMA table_info(products)");
  const hasAttributes = columns.some(c => c.name === 'attributes');
  if (!hasAttributes) {
    try {
      await dbRun("ALTER TABLE products ADD COLUMN attributes TEXT");
      console.log('[DB] Migrated: added "attributes" column to products table.');
    } catch (e) {
      console.error('[DB] Migration failed for products.attributes:', e.message);
    }
  }

  // Migration check: Add sort_order and is_active columns to categories if they don't exist
  const catColumns = await dbAll("PRAGMA table_info(categories)");
  const hasSortOrder = catColumns.some(c => c.name === 'sort_order');
  if (!hasSortOrder) {
    try {
      await dbRun("ALTER TABLE categories ADD COLUMN sort_order INTEGER DEFAULT 0");
      await dbRun("ALTER TABLE categories ADD COLUMN is_active INTEGER DEFAULT 1");
      console.log('[DB] Migrated: added "sort_order" and "is_active" columns to categories table.');
    } catch (e) {
      console.error('[DB] Migration failed for categories columns:', e.message);
    }
  }

  // ─── Seed Data ──────────────────────────────────────────────

  const catCount = await dbGet("SELECT COUNT(*) as count FROM categories");
  if (catCount.count === 0) {
    const defaultCategories = [
      { id: 'cosmetics', name: { uz: 'Kosmetika', ru: 'Косметика', en: 'Cosmetics' } },
      { id: 'flowers', name: { uz: 'Gullar', ru: 'Цветы', en: 'Flowers' } },
      { id: 'men', name: { uz: 'Erkaklar modasi', ru: 'Мужская мода', en: "Men's Fashion" } },
      { id: 'women', name: { uz: 'Ayollar modasi', ru: 'Женская мода', en: "Women's Fashion" } },
      { id: 'electronics', name: { uz: 'Elektronika', ru: 'Электроника', en: 'Electronics' } },
    ];
    for (const cat of defaultCategories) {
      await dbRun(
        "INSERT INTO categories (id, name_uz, name_ru, name_en) VALUES (?, ?, ?, ?)",
        [cat.id, cat.name.uz, cat.name.ru, cat.name.en]
      );
    }
    console.log('[DB] Default categories seeded successfully.');
  }

  const prodCount = await dbGet("SELECT COUNT(*) as count FROM products");
  if (prodCount.count === 0) {
    const defaultProducts = [
      {
        id: 'p1', categoryId: 'cosmetics',
        title: { uz: "L'Oréal Paris Bambi Eye Mascarasi", ru: "L'Oréal Paris Bambi Eye Mascarasi", en: "L'Oréal Paris Bambi Eye Mascara" },
        description: { uz: 'Kipriklarga maksimal hajm va uzunlik beruvchi professional tush. Suv va terga chidamli formula.', ru: 'Профессиональная тушь для максимального объема и удлинения ресниц. Водостойкая и устойчивая формула.', en: 'Professional mascara that gives maximum volume and length to lashes. Water and sweat resistant formula.' },
        price: 100000, oldPrice: null, stock: 7, image: '/images/mascara.png'
      },
      {
        id: 'p2', categoryId: 'cosmetics',
        title: { uz: 'Ампула SKIN1004 с центеллой', ru: 'Ампула SKIN1004 с центеллой', en: 'SKIN1004 Centella Ampoule' },
        description: { uz: 'Centella asiatica o\'simligidan tayyorlangan terini tinchlantiruvchi va namlantiruvchi ampula.', ru: 'Успокаивающая и увлажняющая ампула на основе экстракта центеллы азиатской.', en: 'Soothing and hydrating ampoule made with pure Centella Asiatica extract.' },
        price: 100000, oldPrice: null, stock: 3, image: '/images/centella.png'
      },
      {
        id: 'p3', categoryId: 'cosmetics',
        title: { uz: 'NARS Radiant Krem Konsiler', ru: 'NARS Radiant Krem Konsiler', en: 'NARS Radiant Creamy Concealer' },
        description: { uz: 'Yuqori qoplamali, namlantiruvchi va tabiiy ko\'rinish beruvchi konsiler.', ru: 'Высокое покрытие, увлажняющий консилер с естественным финишем.', en: 'High coverage, hydrating, and natural-looking creamy concealer.' },
        price: 90000, oldPrice: 130000, stock: 1, image: '/images/concealer.png'
      },
      {
        id: 'p4', categoryId: 'cosmetics',
        title: { uz: 'Revolution bronzeri', ru: 'Revolution bronzeri', en: 'Revolution Compact Bronzer' },
        description: { uz: 'Yuzga tabiiy bronz rang beruvchi kompakt pudra.', ru: 'Компактная пудра для естественного возрастающего сияния.', en: 'Compact powder for a natural bronze glow.' },
        price: 150000, oldPrice: null, stock: 1, image: '/images/bronzer.png'
      },
      {
        id: 'p5', categoryId: 'flowers',
        title: { uz: 'Букет красных роз', ru: 'Букет красных роз', en: 'Red Roses Bouquet' },
        description: { uz: 'Qizil gullardan iborat chiroyli guldasta.', ru: 'Красивый букет из свежих красных роз, перевязанный лентой.', en: 'A beautiful bouquet of fresh red roses wrapped with a ribbon.' },
        price: 300000, oldPrice: null, stock: 3, image: '/images/roses.png'
      },
      {
        id: 'p6', categoryId: 'flowers',
        title: { uz: 'Букет "Летний луг"', ru: 'Букет "Летний луг"', en: 'Summer Meadow Bouquet' },
        description: { uz: 'Yovvoyi gullardan iborat yozgi guldasta.', ru: 'Летний букет из полевых ромашек, васильков и диких маков.', en: 'A summer bouquet of field daisies, cornflowers, and wild poppies.' },
        price: 220000, oldPrice: null, stock: 4, image: '/images/wildflowers.png'
      },
      {
        id: 'p7', categoryId: 'men',
        title: { uz: 'Мужская рубашка-жакет', ru: 'Мужская рубашка-жакет', en: "Men's Shirt Jacket" },
        description: { uz: 'Erkaklar uchun zamonaviy katak naqshli jilet-ko\'ylak. Kundalik kiyish uchun juda qulay.', ru: 'Стильная мужская рубашка-жакет в клетку. Отличный вариант для повседневного стиля.', en: 'Stylish plaid men\'s shirt-jacket. Great option for casual style.' },
        price: 75000, oldPrice: null, stock: 5, image: '/images/shirt.png'
      },
      {
        id: 'p8', categoryId: 'women',
        title: { uz: 'Синий вязаный кардиган', ru: 'Синий вязаный кардиган с воротником', en: 'Blue Knitted Cardigan with Collar' },
        description: { uz: 'Trikotaj yoqali va tugmali nafis ayollar ko\'k kardigani. Yumshoq va iliq material.', ru: 'Уютный синий вязаный кардиган с широким воротником и узором косы.', en: 'Cozy blue knitted cardigan with a wide collar and cable knit pattern.' },
        price: 100000, oldPrice: 200000, stock: 10, image: '/images/cardigan.png'
      },
      {
        id: 'p9', categoryId: 'electronics',
        title: { uz: 'Wireless Earbuds Pro', ru: 'Wireless Earbuds Pro', en: 'Wireless Earbuds Pro' },
        description: { uz: 'Shovqinni bostiruvchi va yuqori chastotali ovoz beruvchi premium simsiz quloqchinlar.', ru: 'Беспроводные наушники с активным шумоподавлением и премиальным звуком.', en: 'Premium wireless earbuds with active noise cancellation and high fidelity sound.' },
        price: 490000, oldPrice: 650000, stock: 8, image: '/images/headphones.png'
      },
      {
        id: 'p10', categoryId: 'men',
        title: { uz: 'Krossovki Asics Gel-1130', ru: 'Кроссовки Asics Gel-1130', en: 'Asics Gel-1130 Sneakers' },
        description: { uz: 'Krem va ko\'k rangli zamonaviy hamda yugurish uchun o\'ta qulay krossovkalar. Kundalik kiyish uchun ham mos keladi.', ru: 'Удобные и стильные кроссовки Asics в кремово-синем исполнении. Идеальны для бега и на каждый день.', en: 'Comfortable and stylish Asics sneakers in cream-blue. Ideal for running and everyday wear.' },
        price: 850000, oldPrice: 1200000, stock: 6, image: '/images/sneakers.png'
      }
    ];
    for (const prod of defaultProducts) {
      await dbRun(
        "INSERT INTO products (id, category_id, title_uz, title_ru, title_en, description_uz, description_ru, description_en, price, old_price, stock, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [prod.id, prod.categoryId, prod.title.uz, prod.title.ru, prod.title.en, prod.description.uz, prod.description.ru, prod.description.en, prod.price, prod.oldPrice, prod.stock, prod.image]
      );
    }
    console.log('[DB] Default products seeded successfully.');
  }

  // Orders table starts completely empty for real production users

  // Seed Banners if empty
  const bannerCount = await dbGet("SELECT COUNT(*) as count FROM banners");
  if (bannerCount.count === 0) {
    const defaultBanners = [
      {
        title_uz: 'SPRING BOUQUET', title_ru: 'SPRING BOUQUET', title_en: 'SPRING BOUQUET',
        subtitle_uz: 'Gullar kolleksiyasi 2026', subtitle_ru: 'Коллекция цветов 2026', subtitle_en: 'Flower Collection 2026',
        image: '/images/spring_bouquet.png',
        badge_uz: 'YANGI', badge_ru: 'НОВИНКА', badge_en: 'NEW',
        button_text_uz: "Ko'rish", button_text_ru: 'Смотреть', button_text_en: 'View'
      },
      {
        title_uz: 'Madagascar Centella Skincare', title_ru: 'Madagascar Centella Skincare', title_en: 'Madagascar Centella Skincare',
        subtitle_uz: "Tabiiy parvarish va go'zallik", subtitle_ru: 'Натуральный уход и красота', subtitle_en: 'Natural Care and Beauty',
        image: '/images/skincare_banner.png',
        badge_uz: 'TOP', badge_ru: 'ТОП', badge_en: 'TOP',
        button_text_uz: 'Batafsil', button_text_ru: 'Подробнее', button_text_en: 'Details'
      },
      {
        title_uz: 'Yozgi Kolleksiya 2026', title_ru: 'Летняя Коллекция 2026', title_en: 'Summer Collection 2026',
        subtitle_uz: "Zamonaviy kiyimlar to'plami", subtitle_ru: 'Стильная одежда', subtitle_en: 'Stylish clothing collection',
        image: '/images/mens_fashion_banner.png',
        badge_uz: 'MODA', badge_ru: 'МОДА', badge_en: 'FASHION',
        button_text_uz: 'Tanlash', button_text_ru: 'Выбрать', button_text_en: 'Select'
      },
      {
        title_uz: 'Premium Elektronika', title_ru: 'Премиум Электроника', title_en: 'Premium Electronics',
        subtitle_uz: 'Eng yaxshi naushniklar va gadjetlar', subtitle_ru: 'Лучшие наушники и гаджеты', subtitle_en: 'Best headphones and gadgets',
        image: '/images/electronics_banner.png',
        badge_uz: 'AKSION', badge_ru: 'АКЦИЯ', badge_en: 'SALE',
        button_text_uz: "Ko'rish", button_text_ru: 'Смотреть', button_text_en: 'View'
      }
    ];
    for (const b of defaultBanners) {
      await dbRun(
        `INSERT INTO banners (title_uz, title_ru, title_en, subtitle_uz, subtitle_ru, subtitle_en, image, badge_uz, badge_ru, badge_en, button_text_uz, button_text_ru, button_text_en) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [b.title_uz, b.title_ru, b.title_en, b.subtitle_uz, b.subtitle_ru, b.subtitle_en, b.image, b.badge_uz, b.badge_ru, b.badge_en, b.button_text_uz, b.button_text_ru, b.button_text_en]
      );
    }
    console.log('[DB] Default banners seeded successfully.');
  }
};

module.exports = { db, dbRun, dbAll, dbGet, dbInit };
