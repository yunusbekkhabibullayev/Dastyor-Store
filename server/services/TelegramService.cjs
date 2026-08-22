/**
 * Telegram Service
 * 
 * Handles all Telegram Bot interactions: commands, notifications, menu button.
 * Direct Node.js adaptation of online-menu's TelegramService.php.
 */

const TelegramBot = require('node-telegram-bot-api').default;
const telegramConfig = require('../config/telegram.cjs');

class TelegramService {
  constructor() {
    this.bot = null;
    this.botUsername = '';
    this.isConfigured = false;
    this._lastErrorNotify = { key: null, at: 0 };
  }

  /**
   * Initialize the Telegram bot (called once at server startup)
   */
  async init() {
    if (!telegramConfig.botToken) {
      console.warn('[Telegram] Bot token not configured. Telegram features disabled.');
      return;
    }

    const useWebhook = !!telegramConfig.webhookUrl;

    try {
      // Webhook rejimida polling yoqilmaydi — update'lar /telegram/webhook
      // route orqali kelib, handleWebhookUpdate() bilan processUpdate qilinadi.
      this.bot = new TelegramBot(telegramConfig.botToken, { polling: !useWebhook });
      this.isConfigured = true;

      // Retrieve bot info
      const me = await this.bot.getMe();
      this.botUsername = me.username;
      console.log('[Telegram] Bot username:', this.botUsername);

      // Set up WebApp menu button
      await this.setupMenuButton();

      // Register /start command handler
      this.registerCommands();

      if (useWebhook) {
        await this.bot.setWebHook(telegramConfig.webhookUrl);
        console.log('[Telegram] Webhook mode:', telegramConfig.webhookUrl);
      } else {
        console.log('[Telegram] Polling mode (WEBAPP_URL sozlanmagan).');
      }

      console.log('[Telegram] Bot initialized successfully.');
    } catch (err) {
      console.error('[Telegram] Bot initialization failed:', err.message);
      this.isConfigured = false;
    }
  }

  /**
   * Feed an incoming Telegram update (from the /telegram/webhook Express route)
   * into node-telegram-bot-api's event pipeline. Webhook-mode counterpart of polling.
   */
  handleWebhookUpdate(update) {
    if (!this.bot) return;
    this.bot.processUpdate(update);
  }

  /**
   * Set up the WebApp Menu Button
   */
  async setupMenuButton() {
    if (!this.bot || !telegramConfig.ngrokUrl) return;

    try {
      await this.bot.setChatMenuButton({
        menu_button: JSON.stringify({
          type: 'web_app',
          text: '🛍️ Ravshan Rivoj Market',
          web_app: { url: telegramConfig.ngrokUrl }
        })
      });
      console.log('[Telegram] WebApp Menu Button configured to:', telegramConfig.ngrokUrl);
    } catch (error) {
      console.error('[Telegram] Failed to configure Menu Button:', error.message);
    }
  }

  /**
   * Register bot command handlers
   */
  registerCommands() {
    if (!this.bot) return;

    // Handle /start command with optional deep link payload
    this.bot.onText(/\/start(.*)/, (msg, match) => {
      const chatId = msg.chat.id;
      const firstName = msg.from.first_name || '';
      const payload = match[1] ? match[1].trim() : '';
      const webAppUrl = payload
        ? `${telegramConfig.ngrokUrl}?product=${payload}`
        : telegramConfig.ngrokUrl;

      const text = payload
        ? `Assalomu alaykum, ${firstName}! 😊\n\nSiz tanlagan mahsulotni do'konda ko'rish uchun quyidagi tugmani bosing:`
        : `Assalomu alaykum, ${firstName}! 😊\n\nRavshan Rivoj Market do'konimizga xush kelibsiz. Do'konni ochish uchun quyidagi tugmani bosing:`;

      this.bot.sendMessage(chatId, text, {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: payload ? '🛍️ Mahsulotni ko\'rish' : '🛍️ Do\'konni ochish',
                web_app: { url: webAppUrl }
              }
            ]
          ]
        }
      });
    });
  }

  /**
   * Send order confirmation message to customer
   */
  async sendOrderConfirmation(chatId, orderId) {
    if (!this.bot || !this.isConfigured) {
      console.warn('[Telegram] Cannot send message: bot not configured.');
      return false;
    }

    const numId = orderId.replace('ORD-', '');
    const messageText = `✅ Rahmat! Buyurtma #${numId} qabul qilindi.\n\nBuyurtma holati o'zgarishi haqida sizni xabardor qilamiz.\n\nBuyurtmangiz uchun rahmat!`;

    try {
      await this.bot.sendMessage(chatId, messageText, { parse_mode: 'Markdown' });
      console.log(`[Telegram] Order confirmation sent to user ${chatId}`);
      return true;
    } catch (error) {
      console.error(`[Telegram] Failed to send order confirmation to ${chatId}:`, error.message);
      return false;
    }
  }

  /**
   * Send order status update notification to customer
   * Inspired by online-menu's sendStatusUpdateNotification()
   */
  async sendStatusUpdate(chatId, orderId, status) {
    if (!this.bot || !this.isConfigured) return false;

    const statusTexts = {
      processing: 'Tayyorlanmoqda ⏳',
      shipping: 'Yo\'lga chiqdi 🚚',
      delivered: 'Yetkazib berildi ✅',
      cancelled: 'Bekor qilindi ❌'
    };

    const statusText = statusTexts[status] || status;
    const numId = orderId.replace('ORD-', '');
    const userMessage = `🔔 *Buyurtma holati yangilandi!*\n\nSizning #${numId}-sonli buyurtmangiz holati: *${statusText}* holatiga o'zgartirildi.\n\nRavshan Rivoj Market do'koni xizmatlaridan foydalanganingiz uchun rahmat!`;

    try {
      await this.bot.sendMessage(chatId, userMessage, { parse_mode: 'Markdown' });
      console.log(`[Telegram] Status update sent to user ${chatId}: ${status}`);
      return true;
    } catch (error) {
      console.error(`[Telegram] Failed to send status update to ${chatId}:`, error.message);
      return false;
    }
  }

  /**
   * Send admin notification about a new order (used by test-telegram and checkout)
   */
  async sendNotification(orderData) {
    if (!this.bot || !this.isConfigured) {
      console.warn('[Telegram] Cannot send notification: bot not configured.');
      return false;
    }

    // Faqat .env ADMIN_IDS — bazadagi site_settings.admin_ids ataylab e'tiborga
    // olinmaydi (foydalanuvchi so'rovi: DB adminlar ko'rishi shart emas).
    const telegramConfig = require('../config/telegram.cjs');
    const adminIds = [...(telegramConfig.adminIds || [])];

    if (adminIds.length === 0) {
      console.warn('[Telegram] No admin IDs configured for notifications.');
      return false;
    }

    const numId = (orderData.id || 'TEST').replace('ORD-', '');
    const itemsList = (orderData.items || [])
      .map(item => {
        const title = item.title?.uz || item.title?.ru || 'Mahsulot';
        let variantDesc = '';
        const sv = item.selectedVariant || item.selected_variant;
        if (sv) {
          const varObj = typeof sv === 'string' ? JSON.parse(sv) : sv;
          variantDesc = ` (${Object.values(varObj).join(', ')})`;
        }
        const unit = item.unit || 'dona';
        const formattedQty = Number(item.quantity).toString();
        return `  • ${title}${variantDesc} × ${formattedQty} ${unit}`;
      })
      .join('\n');

    // Build address line: use precise coordinates if available, otherwise text-based search
    const coords = orderData.addressCoords;
    let addressLine;
    if (coords && coords.lat && coords.lng) {
      addressLine = `📍 *Manzil:* [${orderData.address || '—'}](https://www.google.com/maps?q=${coords.lat},${coords.lng})`;
    } else {
      addressLine = `📍 *Manzil:* [${orderData.address || '—'}](https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(orderData.address || '')})`;
    }

    const message = [
      `🛒 *Yangi buyurtma #${numId}*`,
      ``,
      `👤 *Mijoz:* ${orderData.name || 'Noma\'lum'}`,
      `📞 *Telefon:* ${orderData.phone || '—'}`,
      addressLine,
      `💳 *To'lov:* ${orderData.paymentMethod || '—'}`,
      ``,
      `📦 *Mahsulotlar:*`,
      itemsList || '  (bo\'sh)',
      ``,
      `💰 *Jami:* ${(orderData.total || 0).toLocaleString()} so'm`
    ].join('\n');

    let sent = false;
    for (const adminId of adminIds) {
      try {
        await this.bot.sendMessage(adminId, message, { parse_mode: 'Markdown' });
        console.log(`[Telegram] Order notification sent to admin ${adminId}`);
        sent = true;
      } catch (error) {
        console.error(`[Telegram] Failed to notify admin ${adminId}:`, error.message);
      }
    }
    return sent;
  }

  /**
   * Send a raw text message to every .env ADMIN_IDS admin (site update / error
   * notifications — bazadagi admin_ids bunga aralashmaydi, faqat .env).
   */
  async notifyAdmins(text) {
    if (!this.bot || !this.isConfigured) return false;
    const adminIds = telegramConfig.adminIds || [];
    if (adminIds.length === 0) return false;

    let sent = false;
    for (const adminId of adminIds) {
      try {
        await this.bot.sendMessage(adminId, text, { parse_mode: 'Markdown' });
        sent = true;
      } catch (error) {
        console.error(`[Telegram] notifyAdmins failed for ${adminId}:`, error.message);
      }
    }
    return sent;
  }

  /**
   * Same as notifyAdmins but collapses repeats of the same `key` within
   * cooldownMs — guards against notification floods from repeating errors
   * (e.g. a crash loop or a hot request-handler exception).
   */
  async notifyAdminsThrottled(key, text, cooldownMs = 5 * 60 * 1000) {
    const now = Date.now();
    if (this._lastErrorNotify.key === key && (now - this._lastErrorNotify.at) < cooldownMs) {
      return false;
    }
    this._lastErrorNotify = { key, at: now };
    return this.notifyAdmins(text);
  }

  /**
   * Get the bot username (for frontend)
   */
  getBotUsername() {
    return this.botUsername;
  }

  /** Get webhook info from Telegram API */
  async getWebhookInfo() {
    if (!this.bot) return null;
    try {
      return await this.bot.getWebHookInfo();
    } catch (err) {
      console.error('[Telegram] Failed to get webhook info:', err.message);
      return null;
    }
  }

  /** Set webhook URL — stops polling first to avoid conflict */
  async setWebhook(url) {
    if (!this.bot) return { success: false, message: 'Bot initialized emas' };
    try {
      // Stop polling before setting webhook (Telegram doesn't allow both)
      try { await this.bot.stopPolling(); } catch (e) { /* ignore */ }
      await this.bot.setWebHook(url);
      console.log(`[Telegram] Webhook set: ${url} (polling stopped)`);
      return { success: true, message: `Webhook o'rnatildi: ${url}` };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }

  /** Delete webhook — restarts polling after removal */
  async deleteWebhook() {
    if (!this.bot) return { success: false, message: 'Bot initialized emas' };
    try {
      await this.bot.deleteWebHook();
      // Restart polling after webhook is removed
      try { await this.bot.startPolling(); } catch (e) { /* ignore */ }
      console.log('[Telegram] Webhook deleted, polling restarted');
      return { success: true, message: "Webhook o'chirildi, polling qayta ishga tushdi" };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }
}

// Singleton instance
const telegramService = new TelegramService();

module.exports = telegramService;
