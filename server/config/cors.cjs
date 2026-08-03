/**
 * CORS Configuration
 * 
 * Whitelist-based CORS with automatic ngrok and Telegram domain support.
 */

require('dotenv').config();

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:8000,http://localhost:5173')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

// Auto-add NGROK_URL to allowed origins if configured
const ngrokUrl = process.env.NGROK_URL || '';
if (ngrokUrl && !allowedOrigins.includes(ngrokUrl)) {
  allowedOrigins.push(ngrokUrl);
}

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, server-to-server, same-origin, Telegram WebApp)
    if (!origin) return callback(null, true);

    // In development, allow all origins
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }

    // In production, check whitelist + allow Telegram WebApp & Vercel origins
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      origin.endsWith('.onrender.com') ||
      origin.endsWith('.ngrok-free.app') ||
      origin.endsWith('.ngrok-free.dev') ||
      origin.endsWith('.telegram.org') ||
      origin === 'https://web.telegram.org'
    ) {
      return callback(null, true);
    }

    callback(new Error('CORS policy: Origin not allowed'));
  },
  credentials: true,
  optionsSuccessStatus: 200
};

module.exports = corsOptions;
