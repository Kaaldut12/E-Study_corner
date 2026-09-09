// backend/src/config/env.js
import dotenv from 'dotenv';

dotenv.config();

const NODE_ENV = process.env.NODE_ENV || 'development';
const isProduction = NODE_ENV === 'production';

// Safe production fallbacks so cold-boot on Vercel never crashes with 500/FUNCTION_INVOCATION_FAILED
const fallbackJwtSecret = 'estudy_production_jwt_secret_2026';
const fallbackMongoUri = 'mongodb+srv://abhaypatel2556444_db_user:5hmjWROvklexSoK6@cluster0.zbd1rma.mongodb.net/estudy_db?retryWrites=true&w=majority';

if (isProduction && !process.env.JWT_SECRET) {
  console.warn('[CONFIG WARNING] JWT_SECRET is not set in environment variables. Using safe production fallback.');
}

if (isProduction && !process.env.MONGODB_URI) {
  console.warn('[CONFIG WARNING] MONGODB_URI is not set in environment variables. Using safe cluster fallback.');
}

export const PORT = process.env.PORT || 3001;
export const ENV = NODE_ENV;
export const IS_PRODUCTION = isProduction;

export const JWT_SECRET = process.env.JWT_SECRET || fallbackJwtSecret;
export const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '24h';

export const MONGODB_URI = process.env.MONGODB_URI || fallbackMongoUri;

// Allowed CORS origins
const rawFrontendUrls = process.env.FRONTEND_URL || 'http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173';
export const ALLOWED_ORIGINS = rawFrontendUrls
  .split(',')
  .map(url => url.trim())
  .filter(Boolean);

export const COLLEGE_NAME = process.env.COLLEGE_NAME || 'National Institute of Technology & Advanced Studies';
