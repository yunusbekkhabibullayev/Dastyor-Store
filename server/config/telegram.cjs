/**
 * Telegram Bot Configuration
 * 
 * All Telegram-related config values from .env
 * Inspired by online-menu's config/services.php pattern.
 */

require('dotenv').config();

const publicUrl = process.env.WEBAPP_URL || process.env.NGROK_URL || 'https://ravshanrivoj-market.vercel.app';

const telegramConfig = {
  botToken: process.env.BOT_TOKEN || '',
  ngrokUrl: publicUrl,
  // Webhook rejimi faqat public HTTPS URL bor bo'lganda yoqiladi (WEBAPP_URL orqali
  // aniqlanadi) — bo'lmasa polling'ga tushadi (masalan lokal dev muhitida).
  webhookUrl: process.env.WEBAPP_URL ? `${publicUrl}/telegram/webhook` : null,
  adminIds: (process.env.ADMIN_IDS || process.env.ADMIN_TELEGRAM_ID || '1165441564')
    .toString()
    .split(',')
    .map(id => parseInt(id.trim(), 10))
    .filter(id => !isNaN(id)),
};

// Validate critical config on load
if (!telegramConfig.botToken) {
  console.warn('[Config] WARNING: BOT_TOKEN is not set in .env file. Telegram bot will not function.');
}

module.exports = telegramConfig;
