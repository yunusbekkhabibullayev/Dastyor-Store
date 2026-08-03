/**
 * Telegram Bot Configuration
 * 
 * All Telegram-related config values from .env
 * Inspired by online-menu's config/services.php pattern.
 */

require('dotenv').config();

const telegramConfig = {
  botToken: process.env.BOT_TOKEN || '',
  ngrokUrl: process.env.NGROK_URL || '',
  adminIds: (process.env.ADMIN_IDS || '')
    .split(',')
    .map(id => parseInt(id.trim(), 10))
    .filter(id => !isNaN(id)),
};

// Validate critical config on load
if (!telegramConfig.botToken) {
  console.warn('[Config] WARNING: BOT_TOKEN is not set in .env file. Telegram bot will not function.');
}

if (!telegramConfig.ngrokUrl) {
  console.warn('[Config] WARNING: NGROK_URL is not set in .env file. WebApp links will not work.');
}

module.exports = telegramConfig;
