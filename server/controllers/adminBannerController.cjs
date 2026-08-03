/**
 * Admin Banner Controller
 * 
 * Handles Admin CRUD operations for promo banners.
 */

const Banner = require('../models/Banner.cjs');

const adminBannerController = {
  /**
   * GET /api/admin/banners
   */
  getBanners: async (req, res) => {
    try {
      const banners = await Banner.getAll();
      res.json({ success: true, banners });
    } catch (error) {
      console.error('[Admin Banners] Failed to fetch:', error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * POST /api/admin/banners
   */
  createBanner: async (req, res) => {
    try {
      await Banner.create(req.body);
      console.log('[Admin Banners] Banner created.');
      res.json({ success: true, message: 'Reklama banneri muvaffaqiyatli qo\'shildi.' });
    } catch (error) {
      console.error('[Admin Banners] Failed to create:', error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * PUT /api/admin/banners/:id
   */
  updateBanner: async (req, res) => {
    const { id } = req.params;
    try {
      await Banner.update(id, req.body);
      console.log(`[Admin Banners] Banner ${id} updated.`);
      res.json({ success: true, message: 'Reklama banneri muvaffaqiyatli yangilandi.' });
    } catch (error) {
      console.error(`[Admin Banners] Failed to update banner ${id}:`, error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * DELETE /api/admin/banners/:id
   */
  deleteBanner: async (req, res) => {
    const { id } = req.params;
    try {
      await Banner.delete(id);
      console.log(`[Admin Banners] Banner ${id} deleted.`);
      res.json({ success: true, message: 'Reklama banneri muvaffaqiyatli o\'chirildi.' });
    } catch (error) {
      console.error(`[Admin Banners] Failed to delete banner ${id}:`, error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

module.exports = adminBannerController;
