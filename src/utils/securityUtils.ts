/**
 * Security & Input Validation Utilities
 * Ensures client-side sanitization, strict input validation,
 * protection against XSS and malformed payloads, and safe currency arithmetic.
 */

// Strip HTML tags and dangerous characters to prevent XSS
export const sanitizeText = (input: unknown, maxLength = 200): string => {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<[^>]*>/g, '') // Strip HTML tags
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '') // Strip control chars
    .replace(/javascript:/gi, '') // Strip pseudo-protocol
    .replace(/data:/gi, '')
    .trim()
    .slice(0, maxLength);
};

// Sanitize phone number input
export const sanitizePhone = (input: unknown): string => {
  if (typeof input !== 'string') return '';
  // Allow only +, digits, space, dashes, parentheses
  return input
    .replace(/[^0-9+\s\-()]/g, '')
    .trim()
    .slice(0, 25);
};

// Sanitize promo code: alphanumeric only, uppercase, max 20 chars
export const sanitizePromoCode = (input: unknown): string => {
  if (typeof input !== 'string') return '';
  return input
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .trim()
    .slice(0, 20);
};

// Sanitize search queries
export const sanitizeSearchQuery = (input: unknown): string => {
  if (typeof input !== 'string') return '';
  return sanitizeText(input, 80);
};

// Precise two-decimal currency calculation to avoid floating point anomalies
export const safeCurrencyRound = (amount: number): number => {
  if (typeof amount !== 'number' || isNaN(amount) || !isFinite(amount)) {
    return 0;
  }
  return Math.round(amount * 100) / 100;
};

// Clamp cart quantities securely between 1 and 99
export const clampCartQuantity = (qty: number): number => {
  if (typeof qty !== 'number' || isNaN(qty)) return 1;
  const intVal = Math.floor(qty);
  if (intVal < 1) return 1;
  if (intVal > 99) return 99;
  return intVal;
};

// Validation Results
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// Full Name Validation
export const validateFullName = (name: string): ValidationResult => {
  const clean = sanitizeText(name, 60);
  if (!clean || clean.length < 2) {
    return { isValid: false, error: 'Full name must be at least 2 characters.' };
  }
  if (clean.length > 60) {
    return { isValid: false, error: 'Full name cannot exceed 60 characters.' };
  }
  // Check for at least one alphabetical character
  if (!/[a-zA-Z\u00C0-\u024F\u0600-\u06FF]/.test(clean)) {
    return { isValid: false, error: 'Please enter a valid personal name.' };
  }
  return { isValid: true };
};

// Phone Number Validation
export const validatePhone = (phone: string): ValidationResult => {
  const clean = sanitizePhone(phone);
  const digitsOnly = clean.replace(/[^0-9]/g, '');

  if (!digitsOnly || digitsOnly.length < 7) {
    return { isValid: false, error: 'Please enter a valid phone number (at least 7 digits).' };
  }
  if (digitsOnly.length > 18) {
    return { isValid: false, error: 'Phone number cannot exceed 18 digits.' };
  }
  return { isValid: true };
};

// Delivery Address Validation
export const validateAddress = (address: string): ValidationResult => {
  const clean = sanitizeText(address, 200);
  if (!clean || clean.length < 6) {
    return { isValid: false, error: 'Delivery address must be at least 6 characters.' };
  }
  if (clean.length > 200) {
    return { isValid: false, error: 'Address cannot exceed 200 characters.' };
  }
  return { isValid: true };
};

// Validate delivery instructions (optional, but bounded)
export const validateInstructions = (instructions?: string): ValidationResult => {
  if (!instructions) return { isValid: true };
  const clean = sanitizeText(instructions, 150);
  if (instructions.length > 150) {
    return { isValid: false, error: 'Instructions cannot exceed 150 characters.' };
  }
  return { isValid: true };
};
