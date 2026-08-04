/**
 * Dastyor Store — Server Entry Point
 * 
 * Clean entry point: initializes express, mounts middleware & routes, serves frontend.
 * All business logic is in controllers/, services/, models/.
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Config
const { dbInit } = require('./config/database.cjs');
const corsOptions = require('./config/cors.cjs');
const telegramConfig = require('./config/telegram.cjs');

// Services
const telegramService = require('./services/TelegramService.cjs');

// Routes
const publicRoutes = require('./routes/publicRoutes.cjs');
const adminRoutes = require('./routes/adminRoutes.cjs');

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 8000;

// ─── Global Middleware ─────────────────────────────────────────
app.use(cors(corsOptions));
app.use(express.json({ limit: '5mb' }));

// Request logging (simple structured logging)
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path.startsWith('/api/')) {
      console.log(`[${req.method}] ${req.path} → ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// ─── Direct Health Check Endpoints ──────────────────────────────
app.get(['/health', '/ping'], (req, res) => {
  res.status(200).json({
    success: true,
    status: 'ok',
    message: 'Dastyor Store Server is active',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ─── API Routes ────────────────────────────────────────────────
app.use('/api', publicRoutes);
app.use('/api/admin', adminRoutes);

// ─── Dynamic OG Meta Tags ──────────────────────────────────────
const backendProducts = [
  { id: 'p1', title: { uz: "L'Oréal Paris Mascarasi", ru: "L'Oréal Paris Mascarasi", en: "L'Oréal Paris Mascara" }, description: { uz: "Kipriklarga maksimal hajm va uzunlik beruvchi professional tush.", ru: "Профессиональная тушь для объема и удлинения ресниц.", en: "Professional mascara for volume and length." }, image: '/images/mascara.png' },
  { id: 'p2', title: { uz: 'Ампула SKIN1004 с центеллой', ru: 'Ампула SKIN1004 с центеллой', en: 'SKIN1004 Centella Ampoule' }, description: { uz: "Centella asiatica terini tinchlantiruvchi va namlantiruvchi ampula.", ru: "Успокаивающая ампула на основе экстракта центеллы.", en: "Soothing and hydrating Centella ampoule." }, image: '/images/centella.png' },
  { id: 'p3', title: { uz: 'NARS Radiant Konsiler', ru: 'NARS Radiant Консилер', en: 'NARS Radiant Concealer' }, description: { uz: "Yuqori qoplamali, namlantiruvchi va tabiiy ko'rinish beruvchi konsiler.", ru: "Высокое покрытие, увлажняющий консилер.", en: "High coverage, hydrating creamy concealer." }, image: '/images/concealer.png' },
  { id: 'p4', title: { uz: 'Revolution bronzeri', ru: 'Revolution бронзер', en: 'Revolution Bronzer' }, description: { uz: "Yuzga tabiiy bronz rang beruvchi kompakt pudra.", ru: "Компактная пудра для естественного бронзового сияния.", en: "Compact powder for natural bronze glow." }, image: '/images/bronzer.png' },
  { id: 'p5', title: { uz: 'Qizil atirgullar guldastasi', ru: 'Букет красных роз', en: 'Red Roses Bouquet' }, description: { uz: "Qizil gullardan iborat chiroyli guldasta.", ru: "Красивый букет из свежих красных роз.", en: "Beautiful bouquet of fresh red roses." }, image: '/images/roses.png' },
  { id: 'p6', title: { uz: 'Summer Meadow guldastasi', ru: 'Букет "Летний луг"', en: 'Summer Meadow Bouquet' }, description: { uz: "Yovvoyi gullardan iborat yozgi guldasta.", ru: "Летний букет из полевых цветов.", en: "Summer bouquet of field daisies and poppies." }, image: '/images/wildflowers.png' },
  { id: 'p7', title: { uz: 'Erkaklar ko\'ylak-jileti', ru: 'Мужская рубашка-жакет', en: "Men's Shirt Jacket" }, description: { uz: "Erkaklar uchun zamonaviy katak naqshli jilet-ko'ylak.", ru: "Стильная мужская рубашка-жакет в клетку.", en: "Stylish plaid men's shirt-jacket." }, image: '/images/shirt.png' },
  { id: 'p8', title: { uz: 'Ayollar trikotaj kardigani', ru: 'Синий вязаный кардиган', en: 'Blue Knitted Cardigan' }, description: { uz: "Trikotaj yoqali va tugmali nafis ayollar ko'k kardigani.", ru: "Уютный синий вязаный кардиган с воротником.", en: "Cozy blue knitted cardigan with collar." }, image: '/images/cardigan.png' },
  { id: 'p9', title: { uz: 'Wireless Earbuds Pro', ru: 'Wireless Earbuds Pro', en: 'Wireless Earbuds Pro' }, description: { uz: "Shovqinni bostiruvchi premium simsiz quloqchinlar.", ru: "Беспроводные наушники с активным шумоподавлением.", en: "Premium wireless earbuds with active noise cancellation." }, image: '/images/headphones.png' },
  { id: 'p10', title: { uz: 'Krossovki Asics Gel-1130', ru: 'Кроссовки Asics Gel-1130', en: 'Asics Gel-1130 Sneakers' }, description: { uz: 'Krem va ko\'k rangli zamonaviy hamda yugurish uchun o\'ta qulay krossovkalar.', ru: 'Удобные и стильные кроссовки Asics.', en: 'Comfortable and stylish Asics sneakers.' }, image: '/images/sneakers.png' }
];

app.get('/', (req, res, next) => {
  const indexPath = path.join(__dirname, '../dist/index.html');
  if (!fs.existsSync(indexPath)) {
    return res.status(200).json({
      success: true,
      service: 'Dastyor Store Backend API',
      status: 'online',
      timestamp: new Date().toISOString(),
      healthCheck: '/api/health'
    });
  }

  let html = fs.readFileSync(indexPath, 'utf-8');
  const NGROK_URL = telegramConfig.ngrokUrl;
  const productId = req.query.product || req.query.productId;
  const lang = req.query.lang || 'uz';

  let ogTitle = "Dastyor Store — Telegram Mini App";
  let ogDesc = "Siz xohlagan mahsulotlar arzon va tezkor yetkazib berish bilan!";
  let ogImage = NGROK_URL + "/images/skincare_banner.png";

  if (productId) {
    const product = backendProducts.find(p => p.id === productId);
    if (product) {
      ogTitle = `🛒 ${product.title[lang] || product.title['uz']}`;
      ogDesc = product.description[lang] || product.description['uz'];
      ogImage = NGROK_URL + product.image;
    }
  }

  const ogTags = `
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${ogTitle.replace(/"/g, '&quot;')}" />
    <meta property="og:description" content="${ogDesc.replace(/"/g, '&quot;')}" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:url" content="${NGROK_URL}${req.originalUrl}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${ogTitle.replace(/"/g, '&quot;')}" />
    <meta name="twitter:description" content="${ogDesc.replace(/"/g, '&quot;')}" />
    <meta name="twitter:image" content="${ogImage}" />
  `;

  html = html.replace('<head>', `<head>${ogTags}`);
  res.send(html);
});

// ─── Static Files ──────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use(express.static(path.join(__dirname, '../dist')));

// ─── SPA Fallback & Default Response ───────────────────────────
app.use((req, res) => {
  const indexPath = path.join(__dirname, '../dist/index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    if (req.path.startsWith('/api/')) {
      res.status(404).json({ success: false, message: 'API endpoint not found' });
    } else {
      res.status(200).json({
        success: true,
        service: 'Dastyor Store Backend API',
        status: 'online',
        timestamp: new Date().toISOString()
      });
    }
  }
});

// ─── Startup ───────────────────────────────────────────────────
async function start() {
  try {
    // 1. Initialize database
    await dbInit();
    console.log('[Server] Database initialized successfully.');

    // 2. Initialize Telegram bot
    await telegramService.init();

    // 3. Start HTTP server
    app.listen(PORT, () => {
      console.log(`[Server] Running on http://localhost:${PORT}`);
      console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (err) {
    console.error('[Server] Startup failed:', err.message);
    process.exit(1);
  }
}

start();
