/**
 * Input Validation Middleware
 * 
 * Validation schemas for all API endpoints.
 * Inspired by online-menu's $request->validate() pattern.
 */

/**
 * Generic validation middleware factory.
 * Takes a schema object and returns an Express middleware.
 * 
 * Schema format: { fieldName: { required, type, min, max, pattern, values, validator } }
 */
const validate = (schema) => {
  return (req, res, next) => {
    const errors = [];
    const body = req.body;

    for (const [field, rules] of Object.entries(schema)) {
      const value = body[field];

      // Required check
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push(`${field} maydoni majburiy.`);
        continue;
      }

      // Skip optional fields that are not provided
      if (value === undefined || value === null) continue;

      // Type check
      if (rules.type === 'string' && typeof value !== 'string') {
        errors.push(`${field} matn bo'lishi kerak.`);
      }
      if (rules.type === 'number' && (typeof value !== 'number' || isNaN(value))) {
        errors.push(`${field} raqam bo'lishi kerak.`);
      }
      if (rules.type === 'integer' && (!Number.isInteger(value))) {
        errors.push(`${field} butun son bo'lishi kerak.`);
      }
      if (rules.type === 'array' && !Array.isArray(value)) {
        errors.push(`${field} massiv bo'lishi kerak.`);
      }
      if (rules.type === 'object' && (typeof value !== 'object' || Array.isArray(value))) {
        errors.push(`${field} obyekt bo'lishi kerak.`);
      }

      // Min/Max for numbers
      if (rules.min !== undefined && typeof value === 'number' && value < rules.min) {
        errors.push(`${field} kamida ${rules.min} bo'lishi kerak.`);
      }
      if (rules.max !== undefined && typeof value === 'number' && value > rules.max) {
        errors.push(`${field} ko'pi bilan ${rules.max} bo'lishi kerak.`);
      }

      // MinLength/MaxLength for strings
      if (rules.minLength !== undefined && typeof value === 'string' && value.length < rules.minLength) {
        errors.push(`${field} kamida ${rules.minLength} belgi bo'lishi kerak.`);
      }
      if (rules.maxLength !== undefined && typeof value === 'string' && value.length > rules.maxLength) {
        errors.push(`${field} ko'pi bilan ${rules.maxLength} belgi bo'lishi kerak.`);
      }

      // MinItems for arrays
      if (rules.minItems !== undefined && Array.isArray(value) && value.length < rules.minItems) {
        errors.push(`${field} da kamida ${rules.minItems} ta element bo'lishi kerak.`);
      }

      // Enum values check
      if (rules.values && !rules.values.includes(value)) {
        errors.push(`${field} quyidagilardan biri bo'lishi kerak: ${rules.values.join(', ')}.`);
      }

      // Pattern (regex) check
      if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
        errors.push(`${field} formati noto'g'ri.`);
      }

      // Custom validator
      if (rules.validator && typeof rules.validator === 'function') {
        const result = rules.validator(value);
        if (result !== true) {
          errors.push(result || `${field} yaroqsiz.`);
        }
      }
    }

    if (errors.length > 0) {
      return res.status(422).json({
        success: false,
        message: 'Validatsiya xatosi',
        errors
      });
    }

    next();
  };
};

// ─── Validation Schemas ────────────────────────────────────────

const schemas = {
  /** Checkout validation */
  checkout: {
    cart: { required: true, type: 'array', minItems: 1 },
    address: { required: true, type: 'string', minLength: 5, maxLength: 500 },
    phone: { required: true, type: 'string', minLength: 9, maxLength: 25 },
    paymentMethod: { required: true, type: 'string' },
    user: { required: true, type: 'object' },
    total: { required: true, type: 'number', min: 0 },
  },

  /** Category create/update validation */
  category: {
    name_uz: { required: true, type: 'string', minLength: 1, maxLength: 255 },
    name_ru: { required: true, type: 'string', minLength: 1, maxLength: 255 },
    name_en: { required: true, type: 'string', minLength: 1, maxLength: 255 },
  },

  /** Product create/update validation */
  product: {
    title_uz: { required: true, type: 'string', minLength: 1, maxLength: 500 },
    title_ru: { required: true, type: 'string', minLength: 1, maxLength: 500 },
    title_en: { required: true, type: 'string', minLength: 1, maxLength: 500 },
    price: { required: true, type: 'integer', min: 0 },
    stock: { required: true, type: 'integer', min: 0 },
  },

  /** Order status update validation */
  orderStatus: {
    status: { required: true, type: 'string', values: ['processing', 'shipping', 'delivered', 'cancelled'] },
  },

  /** Admin login validation */
  adminLogin: {
    email: { required: true, type: 'string' },
    password: { required: true, type: 'string', minLength: 1 },
  },
};

module.exports = { validate, schemas };
