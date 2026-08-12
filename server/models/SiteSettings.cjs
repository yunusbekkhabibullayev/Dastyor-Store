/**
 * SiteSettings Model
 * 
 * Manages site configurations (Name, Logo, Contacts, Bot Token, etc.)
 * Uses MERGE strategy: only updates fields that are actually provided in the request,
 * preserving existing values for omitted fields.
 */

const { dbRun, dbGet } = require('../config/database.cjs');

const SiteSettings = {
  /** Get site settings */
  get: async () => {
    let settings = await dbGet("SELECT * FROM site_settings WHERE id = 1");
    if (!settings) {
      await dbRun(`
        INSERT INTO site_settings (id, name, description, logo, phone, address, working_hours, telegram_channel, instagram, bot_token, bot_username, delivery_price, bts_delivery_price, is_active)
        VALUES (1, 'Ravshan Rivoj Market', 'Oziq-ovqat mahsulotlari do''koni', '', '+998 90 123 45 67', 'Jizzax viloyati, Mirzacho''l tumani', '09:00 - 22:00', '', '', '', 'ravshan_rivoj_bot', 0, 0, 1)
      `);
      settings = await dbGet("SELECT * FROM site_settings WHERE id = 1");
    }
    return settings;
  },

  /** Update site settings — MERGE strategy: only updates provided fields */
  update: async (data) => {
    // First, get current settings from DB
    const current = await dbGet("SELECT * FROM site_settings WHERE id = 1");
    if (!current) {
      throw new Error('Site settings not found');
    }

    // Merge: use new value if provided, otherwise keep existing DB value
    const merged = {
      name: data.name !== undefined ? data.name : current.name,
      description: data.description !== undefined ? data.description : current.description,
      logo: data.logo !== undefined ? data.logo : current.logo,
      phone: data.phone !== undefined ? data.phone : current.phone,
      address: data.address !== undefined ? data.address : current.address,
      working_hours: data.working_hours !== undefined ? data.working_hours : current.working_hours,
      telegram_channel: data.telegram_channel !== undefined ? data.telegram_channel : current.telegram_channel,
      instagram: data.instagram !== undefined ? data.instagram : current.instagram,
      bot_token: data.bot_token !== undefined ? data.bot_token : current.bot_token,
      bot_username: data.bot_username !== undefined ? data.bot_username : current.bot_username,
      delivery_price: data.delivery_price !== undefined ? (parseInt(data.delivery_price, 10) || 0) : (current.delivery_price || 0),
      bts_delivery_price: data.bts_delivery_price !== undefined ? (parseInt(data.bts_delivery_price, 10) || 0) : (current.bts_delivery_price || 0),
      admin_ids: data.admin_ids !== undefined ? data.admin_ids : current.admin_ids,
      is_active: data.is_active !== undefined ? (data.is_active ? 1 : 0) : current.is_active
    };

    await dbRun(
      `UPDATE site_settings SET 
        name = ?, description = ?, logo = ?, phone = ?, address = ?, 
        working_hours = ?, telegram_channel = ?, instagram = ?, 
        bot_token = ?, bot_username = ?, delivery_price = ?, bts_delivery_price = ?, admin_ids = ?, is_active = ?
       WHERE id = 1`,
      [
        merged.name,
        merged.description,
        merged.logo,
        merged.phone,
        merged.address,
        merged.working_hours,
        merged.telegram_channel,
        merged.instagram,
        merged.bot_token,
        merged.bot_username,
        merged.delivery_price,
        merged.bts_delivery_price,
        merged.admin_ids,
        merged.is_active
      ]
    );

    return dbGet("SELECT * FROM site_settings WHERE id = 1");
  }
};

module.exports = SiteSettings;
