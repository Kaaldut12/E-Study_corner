// backend/src/utils/password.js
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';

const SALT_ROUNDS = 10;
const SCRYPT_PREFIX = 'scrypt';
const KEY_LENGTH = 64;

/**
 * Check if string is a valid bcrypt hash ($2a$, $2b$, etc.)
 */
export const isBcryptHash = (password) => {
  return typeof password === 'string' && (password.startsWith('$2a$') || password.startsWith('$2b$'));
};

/**
 * Check if string is any recognized secure password hash
 */
export const isHashedPassword = (password) => {
  if (typeof password !== 'string') return false;
  return isBcryptHash(password) || password.startsWith(`${SCRYPT_PREFIX}$`);
};

/**
 * Hash password with bcrypt (10 rounds).
 * Avoids re-hashing if already a bcrypt hash.
 */
export const hashPassword = (password) => {
  if (!password) return '';
  if (isBcryptHash(password)) return password;
  return bcrypt.hashSync(password, SALT_ROUNDS);
};

/**
 * Verify plaintext password against stored hash (supports bcrypt, legacy scrypt, and plain upgrade)
 */
export const verifyPassword = (password, storedPassword) => {
  if (!password || !storedPassword) return false;

  // 1. Primary: Bcrypt verification
  if (isBcryptHash(storedPassword)) {
    try {
      return bcrypt.compareSync(password, storedPassword);
    } catch {
      return false;
    }
  }

  // 2. Fallback: Legacy scrypt verification
  if (storedPassword.startsWith(`${SCRYPT_PREFIX}$`)) {
    try {
      const [, salt, storedHash] = storedPassword.split('$');
      if (!salt || !storedHash) return false;
      const hash = crypto.scryptSync(password, salt, KEY_LENGTH);
      const expectedHash = Buffer.from(storedHash, 'hex');
      return expectedHash.length === hash.length && crypto.timingSafeEqual(hash, expectedHash);
    } catch {
      return false;
    }
  }

  // 3. Fallback: Plaintext equality check (will be auto-upgraded upon login)
  return password === storedPassword;
};
