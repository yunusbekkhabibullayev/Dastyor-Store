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

// ─── API Routes ────────────────────────────────────────────────
app.use('/api', publicRoutes);
app.use('/api/admin', adminRoutes);

// ─── Dynamic OG Meta Tags ──────────────────────────────────────
const backendProducts = [];

app.get('/', (req, res, next) => {
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
        service: 'Ravshan Rivoj Market Backend API',
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
