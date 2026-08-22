/**
 * Telegram WebApp initData verification.
 *
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 *
 * initDataUnsafe.user (used elsewhere in the client) is exactly that — unsafe.
 * It's parsed client-side with no signature check, so any request can claim
 * to be any Telegram user. This verifies the *signed* initData string against
 * the bot token, server-side, before trusting the user id inside it.
 */

const crypto = require('crypto');
const telegramConfig = require('./../config/telegram.cjs');

const MAX_AUTH_AGE_SECONDS = 24 * 60 * 60; // reject stale/replayed initData

/**
 * Verify a Telegram WebApp initData string.
 * Returns the authenticated Telegram user object, or null if the signature
 * is missing, invalid, or the data is too old.
 */
function verifyInitData(initData) {
  if (!initData || typeof initData !== 'string') return null;
  if (!telegramConfig.botToken) return null;

  let params;
  try {
    params = new URLSearchParams(initData);
  } catch (e) {
    return null;
  }

  const hash = params.get('hash');
  if (!hash) return null;
  params.delete('hash');

  const dataCheckString = Array.from(params.entries())
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(telegramConfig.botToken).digest();
  const computedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  const a = Buffer.from(computedHash, 'hex');
  const b = Buffer.from(hash, 'hex');
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  const authDate = parseInt(params.get('auth_date'), 10);
  if (!authDate || Date.now() / 1000 - authDate > MAX_AUTH_AGE_SECONDS) return null;

  const userRaw = params.get('user');
  if (!userRaw) return null;
  try {
    const user = JSON.parse(userRaw);
    if (!user || !user.id) return null;
    return user;
  } catch (e) {
    return null;
  }
}

module.exports = { verifyInitData };
