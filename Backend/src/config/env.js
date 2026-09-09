// backend/src/config/env.js
import dotenv from 'dotenv';

dotenv.config();

const NODE_ENV = process.env.NODE_ENV || 'development';
const isProduction = NODE_ENV === 'production';
const isVercel = Boolean(process.env.VERCEL || process.env.VERCEL_ENV);

// Strict production requirement: no fallback secrets in source code
const jwtSecret = process.env.JWT_SECRET || (isProduction ? null : 'dev_jwt_secret_change_in_production');
const mongoUri = (process.env.MONGODB_URI || '').trim() || (isProduction ? null : 'mongodb://127.0.0.1:27017/estudy_dev');

if (!jwtSecret) {
  throw new Error('JWT_SECRET is required. Please provide a secure JWT_SECRET environment variable.');
}

if (!mongoUri) {
  throw new Error('MONGODB_URI is required. Please provide a valid MONGODB_URI environment variable.');
}

export const PORT = process.env.PORT || 3001;
export const ENV = NODE_ENV;
export const IS_PRODUCTION = isProduction;
export const IS_VERCEL = isVercel;

export const JWT_SECRET = jwtSecret;
export const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '24h';

export const MONGODB_URI = mongoUri;

// Allowed CORS origins: explicitly allow production domains, local dev servers, and configured FRONTEND_URL
const defaultOrigins = [
  'https://e-study-corner.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173'
];

const customOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map(url => url.trim())
  .filter(Boolean);

export const ALLOWED_ORIGINS = Array.from(new Set([...defaultOrigins, ...customOrigins]));

export const COLLEGE_NAME = process.env.COLLEGE_NAME || 'National Institute of Technology & Advanced Studies';
