// backend/src/config/db.js
import mongoose from 'mongoose';
import { MONGODB_URI } from './env.js';

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export const connectDB = async () => {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (mongoose.connection.readyState === 1) {
    cached.conn = mongoose.connection;
    return cached.conn;
  }

  // In test mode (unless explicitly requested), skip attempting network DB connection for lightning fast tests
  if (process.env.NODE_ENV === 'test' && !process.env.TEST_WITH_LIVE_DB) {
    return null;
  }

  // On Vercel, if MONGODB_URI points to localhost / 127.0.0.1, skip attempting cloud/external connection
  if (process.env.VERCEL && (MONGODB_URI.includes('127.0.0.1') || MONGODB_URI.includes('localhost'))) {
    console.warn('[MongoDB] Notice: Running on Vercel with localhost MONGODB_URI. Operating with in-memory hybrid store.');
    return null;
  }

  if (!cached.promise) {
    const opts = {
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000,
    };

    cached.promise = (async () => {
      try {
        const mongooseInstance = await mongoose.connect(MONGODB_URI, opts);
        console.log(`[MongoDB] Connected Successfully: ${mongooseInstance.connection.host}/${mongooseInstance.connection.name}`);
        cached.conn = mongooseInstance.connection;
        return cached.conn;
      } catch (err) {
        if (!process.env.VERCEL && process.env.NODE_ENV !== 'production' && !MONGODB_URI.includes('127.0.0.1') && !MONGODB_URI.includes('localhost')) {
          console.warn(`[MongoDB] Cloud Atlas connection failed (${err.message}). Attempting local fallback (mongodb://127.0.0.1:27017/estudy_db)...`);
          try {
            const localInstance = await mongoose.connect('mongodb://127.0.0.1:27017/estudy_db', opts);
            console.log(`[MongoDB] Connected to local MongoDB fallback: ${localInstance.connection.host}/${localInstance.connection.name}`);
            cached.conn = localInstance.connection;
            return cached.conn;
          } catch {
            console.warn('[MongoDB] Local MongoDB fallback is also unreachable.');
          }
        }
        cached.promise = null;
        cached.conn = null;
        console.error(`[MongoDB] Connection Error: ${err.message}`);
        throw err;
      }
    })();
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    cached.conn = null;
    throw e;
  }

  return cached.conn;
};

mongoose.connection.on('error', (err) => {
  console.error('MongoDB runtime connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB connection lost. Reconnecting on next request...');
});

