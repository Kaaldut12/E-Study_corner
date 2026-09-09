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

  // On Vercel, if MONGODB_URI points to localhost / 127.0.0.1, skip attempting cloud connection to localhost
  if (process.env.VERCEL && (MONGODB_URI.includes('127.0.0.1') || MONGODB_URI.includes('localhost'))) {
    console.warn('[MongoDB] Notice: Running on Vercel with localhost MONGODB_URI. Operating with in-memory hybrid store.');
    return null;
  }

  if (!cached.promise) {
    const opts = {
      serverSelectionTimeoutMS: 2500,
      connectTimeoutMS: 3000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      console.log(`[MongoDB] Connected Successfully: ${mongooseInstance.connection.host}/${mongooseInstance.connection.name}`);
      cached.conn = mongooseInstance.connection;
      return cached.conn;
    }).catch((err) => {
      cached.promise = null;
      cached.conn = null;
      console.error(`[MongoDB] Connection Error: ${err.message}`);
      throw err;
    });
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

