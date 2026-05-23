/**
 * Validation utility functions
 */

export const validators = {
  /**
   * Validate email
   */
  validateEmail: (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  /**
   * Validate phone
   */
  validatePhone: (phone) => {
    // Allow 10+ digit numbers (handles different formats)
    const re = /^[\d\s\-\+\(\)]{10,}$/;
    return re.test(phone.replace(/\s/g, ''));
  },

  /**
   * Validate name
   */
  validateName: (name) => {
    return name && name.trim().length >= 2;
  },

  /**
   * Validate required field
   */
  validateRequired: (value) => {
    return value !== null && value !== undefined && value !== '';
  },

  /**
   * Validate form data
   */
  validateFormData: (data, requiredFields) => {
    const errors = {};

    requiredFields.forEach((field) => {
      if (!validators.validateRequired(data[field])) {
        errors[field] = `${field} is required`;
      }
    });

    if (data.email && !validators.validateEmail(data.email)) {
      errors.email = 'Invalid email format';
    }

    if (data.phone && !validators.validatePhone(data.phone)) {
      errors.phone = 'Invalid phone format';
    }

    if (data.name && !validators.validateName(data.name)) {
      errors.name = 'Name must be at least 2 characters';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },

  /**
   * Sanitize input
   */
  sanitizeInput: (input) => {
    if (typeof input !== 'string') return input;
    return input.trim();
  },

  /**
   * Validate URL
   */
  validateUrl: (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },
};

export default validators;
