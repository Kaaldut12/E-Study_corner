// backend/src/config/env.js
import dotenv from 'dotenv';

dotenv.config();

const NODE_ENV = process.env.NODE_ENV || 'development';
const isProduction = NODE_ENV === 'production';

// Strict validation in production: fail fast if secrets are missing
if (isProduction && !process.env.JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable is required in production.');
}

if (isProduction && !process.env.MONGODB_URI) {
  throw new Error('FATAL: MONGODB_URI environment variable is required in production.');
}

export const PORT = process.env.PORT || 3001;
export const ENV = NODE_ENV;
export const IS_PRODUCTION = isProduction;

export const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_estudy_do_not_use_in_prod';
export const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '24h';

export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/estudy_db';

// Allowed CORS origins
const rawFrontendUrls = process.env.FRONTEND_URL || 'http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173';
export const ALLOWED_ORIGINS = rawFrontendUrls
  .split(',')
  .map(url => url.trim())
  .filter(Boolean);

export const COLLEGE_NAME = process.env.COLLEGE_NAME || 'National Institute of Technology & Advanced Studies';
