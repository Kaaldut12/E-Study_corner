// backend/src/config/env.js
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from Backend/ or project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const isRunningInTestRunner = Boolean(process.env.NODE_TEST_CONTEXT || process.argv.some(arg => arg.includes('test')));
const NODE_ENV = isRunningInTestRunner ? 'test' : (process.env.NODE_ENV || 'development');
process.env.NODE_ENV = NODE_ENV;
const isProduction = NODE_ENV === 'production';
const isVercel = Boolean(process.env.VERCEL || process.env.VERCEL_ENV);

// Explicit environment requirements: both JWT_SECRET and MONGODB_URI are strictly required
if (!process.env.JWT_SECRET) {
  if (NODE_ENV === 'test') {
    process.env.JWT_SECRET = 'test-jwt-secret-for-automated-tests-minimum-32-chars-long';
  } else {
    throw new Error('JWT_SECRET is required. Please set JWT_SECRET in your .env file or hosting environment variables.');
  }
}

if (!process.env.MONGODB_URI) {
  if (NODE_ENV === 'test') {
    process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/test-e-study';
  } else {
    throw new Error('MONGODB_URI is required. Please set MONGODB_URI in your .env file or hosting environment variables.');
  }
}

export const PORT = process.env.PORT || 3001;
export const ENV = NODE_ENV;
export const IS_PRODUCTION = isProduction;
export const IS_VERCEL = isVercel;

export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '24h';

export const MONGODB_URI = process.env.MONGODB_URI.trim();

// Allowed CORS origins: strictly configured domains only
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
