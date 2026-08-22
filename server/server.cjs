/**
 * Ravshan Rivoj Market — Server Entry Point
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
    message: 'Ravshan Rivoj Market Server is active',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ─── Telegram Webhook Receiver ──────────────────────────────────
// Telegram bu yerga POST qiladi (webhook rejimida, TelegramService.init()
// tomonidan sozlanadi). Body express.json() bilan allaqachon parse qilingan.
app.post('/telegram/webhook', (req, res) => {
  telegramService.handleWebhookUpdate(req.body);
  res.sendStatus(200);
});

// ─── API Routes ────────────────────────────────────────────────
app.use('/api', publicRoutes);
app.use('/api/admin', adminRoutes);

// ─── Dynamic OG Meta Tags ──────────────────────────────────────
const Product = require('./models/Product.cjs');

app.get('/', async (req, res, next) => {
  const indexPath = path.join(__dirname, '../dist/index.html');
  if (!fs.existsSync(indexPath)) {
    return res.status(200).json({
      success: true,
      service: 'Ravshan Rivoj Market Backend API',
      status: 'online',
      timestamp: new Date().toISOString(),
      healthCheck: '/api/health'
    });
  }

  let html = fs.readFileSync(indexPath, 'utf-8');
  const NGROK_URL = telegramConfig.ngrokUrl;
  const productId = req.query.product || req.query.productId;
  const lang = req.query.lang || 'uz';

  let ogTitle = "Ravshan Rivoj Market — Telegram Mini App";
  let ogDesc = "Siz xohlagan mahsulotlar arzon va tezkor yetkazib berish bilan!";
  let ogImage = NGROK_URL + "/uploads/logo.png";

  if (productId) {
    try {
      const product = await Product.getById(productId);
      if (product) {
        ogTitle = `🛒 ${product[`title_${lang}`] || product.title_uz || 'Mahsulot'}`;
        ogDesc = product[`description_${lang}`] || product.description_uz || ogDesc;
        if (product.image) {
          ogImage = product.image.startsWith('http') ? product.image : (NGROK_URL + product.image);
        }
      }
    } catch (e) {
      console.warn('[OG Meta] Failed to load product for OG tags:', e.message);
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
        service: 'Ravshan Rivoj Market Backend API',
        status: 'online',
        timestamp: new Date().toISOString()
      });
    }
  }
});

// ─── Global Error Handler ────────────────────────────────────────
// Express route/middleware xatolarini ushlab, .env ADMIN_IDS'ga TG orqali
// xabar beradi. Har doim JSON response bilan tugaydi (client HTML olmasin).
app.use((err, req, res, next) => {
  console.error(`[Server] Unhandled error on ${req.method} ${req.path}:`, err);
  telegramService
    .notifyAdminsThrottled(
      `${req.method} ${req.path}: ${err.message}`,
      `🚨 *Server xatosi*\n\n*So'rov:* \`${req.method} ${req.path}\`\n*Xabar:* ${String(err.message || err).slice(0, 500)}`
    )
    .catch(() => {});
  if (res.headersSent) return next(err);
  res.status(500).json({ success: false, message: 'Server xatosi yuz berdi.' });
});

// Process darajasidagi kutilmagan xatolar — ham TG'ga xabar beradi, jarayonni
// o'zi to'xtatmaydi (crash bo'lsa, Docker restart:always qayta ko'taradi).
process.on('uncaughtException', (err) => {
  console.error('[Server] Uncaught exception:', err);
  telegramService
    .notifyAdminsThrottled(
      `uncaughtException:${err.message}`,
      `🚨 *Uncaught exception*\n\n${String(err.message || err).slice(0, 500)}`
    )
    .catch(() => {});
});
process.on('unhandledRejection', (reason) => {
  console.error('[Server] Unhandled rejection:', reason);
  const msg = reason && reason.message ? reason.message : String(reason);
  telegramService
    .notifyAdminsThrottled(`unhandledRejection:${msg}`, `🚨 *Unhandled promise rejection*\n\n${msg.slice(0, 500)}`)
    .catch(() => {});
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

      // Sayt yangilandi/qayta ishga tushdi — .env ADMIN_IDS'ga xabar
      telegramService
        .notifyAdmins(`✅ *Sayt yangilandi*\n\nServer qayta ishga tushdi va ishlamoqda.\n🕐 ${new Date().toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' })}`)
        .catch(() => {});
    });
  } catch (err) {
    console.error('[Server] Startup failed:', err.message);
    process.exit(1);
  }
}

start();
