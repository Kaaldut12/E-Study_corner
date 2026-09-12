// backend/src/config/db.js
import mongoose from 'mongoose';
import { MONGODB_URI, SECONDARY_MONGODB_URI, ENABLE_TWO_STEP_DB } from './env.js';

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = {
    conn: null,
    promise: null,
    secondaryConn: null,
    secondaryPromise: null
  };
}

/**
 * Connects to Secondary / Backup database (e.g. local MongoDB)
 */
export const connectSecondaryDB = async () => {
  if (!ENABLE_TWO_STEP_DB || !SECONDARY_MONGODB_URI) {
    return null;
  }

  if (cached.secondaryConn && cached.secondaryConn.readyState === 1) {
    return cached.secondaryConn;
  }

  if (!cached.secondaryPromise) {
    const opts = {
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000,
    };

    cached.secondaryPromise = (async () => {
      try {
        const sec = await mongoose.createConnection(SECONDARY_MONGODB_URI, opts).asPromise();
        console.log(`[Two-Step DB] Secondary DB Connected: ${sec.host}/${sec.name}`);
        cached.secondaryConn = sec;

        sec.on('error', (err) => {
          console.warn('[Two-Step DB] Secondary DB runtime notice:', err.message);
        });

        sec.on('disconnected', () => {
          cached.secondaryConn = null;
          cached.secondaryPromise = null;
        });

        return cached.secondaryConn;
      } catch (err) {
        cached.secondaryPromise = null;
        cached.secondaryConn = null;
        console.warn(`[Two-Step DB] Secondary DB is currently offline (${err.message}). Step 2 will be skipped gracefully.`);
        return null;
      }
    })();
  }

  try {
    return await cached.secondaryPromise;
  } catch {
    cached.secondaryPromise = null;
    cached.secondaryConn = null;
    return null;
  }
};

/**
 * Connects to Primary Database (Atlas) and initializes Secondary DB in background.
 */
export const connectDB = async () => {
  if (cached.conn && mongoose.connection.readyState === 1) {
    // Ensure secondary connection is active in background if enabled
    if (ENABLE_TWO_STEP_DB && !cached.secondaryConn && !cached.secondaryPromise) {
      connectSecondaryDB().catch(() => {});
    }
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
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    };

    cached.promise = (async () => {
      try {
        const mongooseInstance = await mongoose.connect(MONGODB_URI, opts);
        console.log(`[MongoDB] Primary DB Connected: ${mongooseInstance.connection.host}/${mongooseInstance.connection.name}`);
        cached.conn = mongooseInstance.connection;

        // Initialize secondary connection in parallel for two-step architecture
        if (ENABLE_TWO_STEP_DB) {
          connectSecondaryDB().catch(() => {});
        }

        return cached.conn;
      } catch (err) {
        if (!process.env.VERCEL && process.env.NODE_ENV !== 'production' && SECONDARY_MONGODB_URI && !MONGODB_URI.includes('127.0.0.1') && !MONGODB_URI.includes('localhost')) {
          console.warn(`[MongoDB] Cloud Atlas connection failed (${err.message}). Attempting local fallback (${SECONDARY_MONGODB_URI})...`);
          try {
            const localInstance = await mongoose.connect(SECONDARY_MONGODB_URI, opts);
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

export const getPrimaryConn = () => {
  return mongoose.connection.readyState === 1 ? mongoose.connection : cached.conn;
};

export const getSecondaryConn = () => {
  return (cached.secondaryConn && cached.secondaryConn.readyState === 1) ? cached.secondaryConn : null;
};

export const getDualConnectionStatus = () => {
  const primary = getPrimaryConn();
  const secondary = getSecondaryConn();

  return {
    twoStepEnabled: ENABLE_TWO_STEP_DB,
    primary: {
      connected: Boolean(primary && primary.readyState === 1),
      host: primary?.host,
      database: primary?.name,
      readyState: primary?.readyState || 0
    },
    secondary: {
      connected: Boolean(secondary && secondary.readyState === 1),
      host: secondary?.host,
      database: secondary?.name,
      readyState: secondary?.readyState || 0
    }
  };
};

mongoose.connection.on('error', (err) => {
  console.error('MongoDB runtime connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB primary connection lost. Reconnecting on next request...');
});
