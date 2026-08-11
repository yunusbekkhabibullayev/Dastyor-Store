/**
 * Cache Service
 * 
 * Simple in-memory cache for public API endpoints.
 * Provides caching and cache invalidation.
 */

const cache = {
  products: null,
  categories: null,
  banners: null,
  siteSettings: null
};

const cacheService = {
  get: (key) => {
    return cache[key];
  },
  set: (key, value) => {
    cache[key] = value;
  },
  clear: (key) => {
    if (key) {
      cache[key] = null;
      console.log(`[Cache] Cleared cache for key: ${key}`);
    } else {
      cache.products = null;
      cache.categories = null;
      cache.banners = null;
      cache.siteSettings = null;
      console.log('[Cache] Cleared all caches');
    }
  }
};

module.exports = cacheService;
