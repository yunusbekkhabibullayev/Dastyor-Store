/**
 * Cache Service
 * 
 * Simple in-memory cache with TTL (Time-To-Live) for public API endpoints.
 * Provides caching, automatic expiration, and explicit cache invalidation.
 */

const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

const cache = {
  products: { data: null, expiresAt: 0 },
  categories: { data: null, expiresAt: 0 },
  banners: { data: null, expiresAt: 0 },
  siteSettings: { data: null, expiresAt: 0 }
};

const cacheService = {
  get: (key) => {
    const entry = cache[key];
    if (!entry || !entry.data) return null;
    if (Date.now() > entry.expiresAt) {
      cache[key] = { data: null, expiresAt: 0 };
      return null;
    }
    return entry.data;
  },
  set: (key, value, ttlMs = DEFAULT_TTL_MS) => {
    cache[key] = {
      data: value,
      expiresAt: Date.now() + ttlMs
    };
  },
  clear: (key) => {
    if (key && cache[key]) {
      cache[key] = { data: null, expiresAt: 0 };
      console.log(`[Cache] Cleared cache for key: ${key}`);
    } else {
      for (const k of Object.keys(cache)) {
        cache[k] = { data: null, expiresAt: 0 };
      }
      console.log('[Cache] Cleared all caches');
    }
  }
};

module.exports = cacheService;
