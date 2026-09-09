// backend/src/config/db.js
import mongoose from 'mongoose';
import { MONGODB_URI, IS_PRODUCTION } from './env.js';

export const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });

    console.log(`
╔══════════════════════════════════════════════════════════════╗
║  MongoDB Connected Successfully!                             ║
║  Host: ${conn.connection.host}
║  Database: ${conn.connection.name}
╚══════════════════════════════════════════════════════════════╝
    `);

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB runtime connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB connection lost. Reconnecting...');
    });

    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    if (IS_PRODUCTION) {
      throw new Error(`Database connection failed: ${error.message}`);
    }
  }
};
