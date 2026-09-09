// backend/src/config/env.js
import dotenv from 'dotenv';

dotenv.config();

const NODE_ENV = process.env.NODE_ENV || 'development';
const isProduction = NODE_ENV === 'production';
const isVercel = Boolean(process.env.VERCEL || process.env.VERCEL_ENV);

// Safe production fallbacks so cold-boot on Vercel never crashes with 500/FUNCTION_INVOCATION_FAILED
const fallbackJwtSecret = 'estudy_production_jwt_secret_2026';
const fallbackMongoUri = 'mongodb+srv://abhaypatel2556444_db_user:5hmjWROvklexSoK6@cluster0.zbd1rma.mongodb.net/estudy_db?retryWrites=true&w=majority';

const rawMongoUri = (process.env.MONGODB_URI || '').trim();
const isLocalhostMongo = rawMongoUri.includes('127.0.0.1') || rawMongoUri.includes('localhost');

let resolvedMongoUri;
if ((isVercel || isProduction) && isLocalhostMongo) {
  console.warn('[CONFIG WARNING] MONGODB_URI in production/Vercel points to localhost/127.0.0.1 which is invalid in serverless. Falling back to MongoDB Atlas cloud cluster.');
  resolvedMongoUri = fallbackMongoUri;
} else {
  resolvedMongoUri = rawMongoUri || fallbackMongoUri;
}

if (isProduction && !process.env.JWT_SECRET) {
  console.warn('[CONFIG WARNING] JWT_SECRET is not set in environment variables. Using safe production fallback.');
}

if (isProduction && (!process.env.MONGODB_URI || isLocalhostMongo)) {
  console.warn('[CONFIG WARNING] Using MongoDB Atlas cloud cluster.');
}

export const PORT = process.env.PORT || 3001;
export const ENV = NODE_ENV;
export const IS_PRODUCTION = isProduction;
export const IS_VERCEL = isVercel;

export const JWT_SECRET = process.env.JWT_SECRET || fallbackJwtSecret;
export const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '24h';

export const MONGODB_URI = resolvedMongoUri;

// Allowed CORS origins
const rawFrontendUrls = process.env.FRONTEND_URL || 'http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173';
export const ALLOWED_ORIGINS = rawFrontendUrls
  .split(',')
  .map(url => url.trim())
  .filter(Boolean);

export const COLLEGE_NAME = process.env.COLLEGE_NAME || 'National Institute of Technology & Advanced Studies';
