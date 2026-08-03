/**
 * Banner Model
 * 
 * CRUD operations for banners table.
 */

const { dbRun, dbAll, dbGet } = require('../config/database.cjs');

const Banner = {
  /** Get all banners */
  getAll: () => {
    return dbAll("SELECT * FROM banners ORDER BY id DESC");
  },

  /** Get single banner by ID */
  getById: (id) => {
    return dbGet("SELECT * FROM banners WHERE id = ?", [id]);
  },

  /** Create new banner */
  create: (data) => {
    const { 
      title_uz, title_ru, title_en, 
      subtitle_uz, subtitle_ru, subtitle_en, 
      image, 
      badge_uz, badge_ru, badge_en, 
      button_text_uz, button_text_ru, button_text_en 
    } = data;

    return dbRun(
      `INSERT INTO banners (
        title_uz, title_ru, title_en, 
        subtitle_uz, subtitle_ru, subtitle_en, 
        image, 
        badge_uz, badge_ru, badge_en, 
        button_text_uz, button_text_ru, button_text_en
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title_uz, title_ru, title_en, 
        subtitle_uz, subtitle_ru, subtitle_en, 
        image, 
        badge_uz, badge_ru, badge_en, 
        button_text_uz, button_text_ru, button_text_en
      ]
    );
  },

  /** Update existing banner */
  update: (id, data) => {
    const { 
      title_uz, title_ru, title_en, 
      subtitle_uz, subtitle_ru, subtitle_en, 
      image, 
      badge_uz, badge_ru, badge_en, 
      button_text_uz, button_text_ru, button_text_en 
    } = data;

    return dbRun(
      `UPDATE banners SET 
        title_uz = ?, title_ru = ?, title_en = ?, 
        subtitle_uz = ?, subtitle_ru = ?, subtitle_en = ?, 
        image = ?, 
        badge_uz = ?, badge_ru = ?, badge_en = ?, 
        button_text_uz = ?, button_text_ru = ?, button_text_en = ? 
      WHERE id = ?`,
      [
        title_uz, title_ru, title_en, 
        subtitle_uz, subtitle_ru, subtitle_en, 
        image, 
        badge_uz, badge_ru, badge_en, 
        button_text_uz, button_text_ru, button_text_en,
        id
      ]
    );
  },

  /** Delete banner by ID */
  delete: (id) => {
    return dbRun("DELETE FROM banners WHERE id = ?", [id]);
  }
};

module.exports = Banner;
