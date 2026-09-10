// backend/src/services/twoStepDB.js
import mongoose from 'mongoose';
import { getPrimaryConn, getSecondaryConn, connectSecondaryDB, getDualConnectionStatus } from '../config/db.js';
import { ENABLE_TWO_STEP_DB } from '../config/env.js';

const getCol = (conn, name) => (conn.db ? conn.db.collection(name) : conn.collection(name));

/**
 * Two-Step Database Persistence Service
 *
 * Persists operations in two synchronized steps:
 *  Step 1: Primary Database (MongoDB Atlas Cloud)
 *  Step 2: Secondary Database (Local MongoDB / Backup Store)
 */
export const twoStepDB = {
  /**
   * Two-Step Save (Insert or Upsert) across Primary and Secondary
   *
   * @param {Object} params
   * @param {string} params.collection - Collection name (e.g. 'users', 'courses')
   * @param {Object} params.filter - Matching filter for update/upsert
   * @param {Object} params.data - Document data to set
   * @param {boolean} [params.upsert=true] - Whether to upsert if not found
   * @returns {Promise<{success: boolean, primary: boolean, secondary: boolean}>}
   */
  save: async ({ collection, filter, data, upsert = true }) => {
    const result = { success: false, primary: false, secondary: false };

    // STEP 1: Save to Primary Database
    const primary = getPrimaryConn();
    if (primary && primary.readyState === 1) {
      try {
        await getCol(primary, collection).updateOne(
          filter,
          { $set: data },
          { upsert }
        );
        result.primary = true;
        result.success = true;
      } catch (err) {
        console.warn(`[Two-Step DB: Step 1 (Primary) Error on "${collection}"]:`, err.message);
      }
    }

    // STEP 2: Save to Secondary Database
    if (ENABLE_TWO_STEP_DB) {
      let secondary = getSecondaryConn();
      if (!secondary) {
        secondary = await connectSecondaryDB().catch(() => null);
      }

      if (secondary && secondary.readyState === 1) {
        try {
          await getCol(secondary, collection).updateOne(
            filter,
            { $set: data },
            { upsert }
          );
          result.secondary = true;
          result.success = true;
        } catch (err) {
          console.warn(`[Two-Step DB: Step 2 (Secondary) Notice on "${collection}"]:`, err.message);
        }
      }
    }

    return result;
  },

  /**
   * Two-Step Delete across Primary and Secondary
   *
   * @param {Object} params
   * @param {string} params.collection - Collection name
   * @param {Object} params.filter - Matching filter
   * @returns {Promise<{success: boolean, primary: boolean, secondary: boolean}>}
   */
  delete: async ({ collection, filter }) => {
    const result = { success: false, primary: false, secondary: false };

    // STEP 1: Delete from Primary Database
    const primary = getPrimaryConn();
    if (primary && primary.readyState === 1) {
      try {
        await getCol(primary, collection).deleteOne(filter);
        result.primary = true;
        result.success = true;
      } catch (err) {
        console.warn(`[Two-Step DB: Step 1 (Primary) Delete Error on "${collection}"]:`, err.message);
      }
    }

    // STEP 2: Delete from Secondary Database
    if (ENABLE_TWO_STEP_DB) {
      let secondary = getSecondaryConn();
      if (!secondary) {
        secondary = await connectSecondaryDB().catch(() => null);
      }

      if (secondary && secondary.readyState === 1) {
        try {
          await getCol(secondary, collection).deleteOne(filter);
          result.secondary = true;
          result.success = true;
        } catch (err) {
          console.warn(`[Two-Step DB: Step 2 (Secondary) Delete Notice on "${collection}"]:`, err.message);
        }
      }
    }

    return result;
  },

  /**
   * Explicitly replicate a saved or updated document to Secondary DB
   *
   * @param {Object} params
   * @param {string} params.collection
   * @param {Object} params.filter
   * @param {Object} params.data
   * @param {boolean} [params.upsert=true]
   */
  replicateToSecondary: async ({ collection, filter, data, upsert = true }) => {
    if (!ENABLE_TWO_STEP_DB) return false;
    let secondary = getSecondaryConn();
    if (!secondary) {
      secondary = await connectSecondaryDB().catch(() => null);
    }
    if (secondary && secondary.readyState === 1) {
      try {
        await getCol(secondary, collection).updateOne(filter, { $set: data }, { upsert });
        return true;
      } catch (err) {
        console.warn(`[Two-Step DB Secondary Replication Notice on "${collection}"]:`, err.message);
      }
    }
    return false;
  },

  /**
   * Explicitly delete a document from Secondary DB
   */
  deleteFromSecondary: async ({ collection, filter }) => {
    if (!ENABLE_TWO_STEP_DB) return false;
    let secondary = getSecondaryConn();
    if (!secondary) {
      secondary = await connectSecondaryDB().catch(() => null);
    }
    if (secondary && secondary.readyState === 1) {
      try {
        await getCol(secondary, collection).deleteOne(filter);
        return true;
      } catch (err) {
        console.warn(`[Two-Step DB Secondary Delete Notice on "${collection}"]:`, err.message);
      }
    }
    return false;
  },

  /**
   * Explicitly delete multiple documents from Secondary DB
   */
  deleteManyFromSecondary: async ({ collection, filter }) => {
    if (!ENABLE_TWO_STEP_DB) return false;
    let secondary = getSecondaryConn();
    if (!secondary) {
      secondary = await connectSecondaryDB().catch(() => null);
    }
    if (secondary && secondary.readyState === 1) {
      try {
        await getCol(secondary, collection).deleteMany(filter);
        return true;
      } catch (err) {
        console.warn(`[Two-Step DB Secondary DeleteMany Notice on "${collection}"]:`, err.message);
      }
    }
    return false;
  },

  /**
   * Read with automatic failover between Primary and Secondary
   *
   * @param {string} collection
   * @param {Function} queryFn - Async callback receiving the active collection
   * @returns {Promise<any>}
   */
  read: async (collection, queryFn) => {
    const primary = getPrimaryConn();
    if (primary && primary.readyState === 1) {
      try {
        return await queryFn(getCol(primary, collection));
      } catch (err) {
        console.warn(`[Two-Step DB] Primary read error on "${collection}", failing over to secondary:`, err.message);
      }
    }

    let secondary = getSecondaryConn();
    if (!secondary) {
      secondary = await connectSecondaryDB().catch(() => null);
    }

    if (secondary && secondary.readyState === 1) {
      return await queryFn(getCol(secondary, collection));
    }

    return null;
  },

  /**
   * Get health status of both database nodes
   */
  getStatus: getDualConnectionStatus
};

/**
 * Mongoose Schema Plugin for Automatic Two-Step Secondary DB Replication
 *
 * Automatically replicates Mongoose writes (save, create, update, delete)
 * to the Secondary Database without requiring manual hooks in controllers.
 */
export const mongooseTwoStepPlugin = (schema) => {
  schema.post('save', async function (doc) {
    if (!ENABLE_TWO_STEP_DB || process.env.NODE_ENV === 'test') return;
    try {
      const colName = doc.constructor.collection.name;
      let secondary = getSecondaryConn();
      if (!secondary) secondary = await connectSecondaryDB().catch(() => null);
      if (secondary && secondary.readyState === 1) {
        const obj = doc.toObject ? doc.toObject() : doc;
        await getCol(secondary, colName).replaceOne({ _id: doc._id }, obj, { upsert: true });
      }
    } catch (err) {
      console.warn('[Two-Step DB Plugin save notice]:', err.message);
    }
  });

  schema.post('findOneAndUpdate', async function (doc) {
    if (!ENABLE_TWO_STEP_DB || !doc || process.env.NODE_ENV === 'test') return;
    try {
      const colName = this.model.collection.name;
      let secondary = getSecondaryConn();
      if (!secondary) secondary = await connectSecondaryDB().catch(() => null);
      if (secondary && secondary.readyState === 1) {
        const obj = doc.toObject ? doc.toObject() : doc;
        if (doc._id) {
          await getCol(secondary, colName).replaceOne({ _id: doc._id }, obj, { upsert: true });
        }
      }
    } catch (err) {
      console.warn('[Two-Step DB Plugin findOneAndUpdate notice]:', err.message);
    }
  });

  schema.post('findOneAndDelete', async function (doc) {
    if (!ENABLE_TWO_STEP_DB || !doc || process.env.NODE_ENV === 'test') return;
    try {
      const colName = this.model.collection.name;
      let secondary = getSecondaryConn();
      if (!secondary) secondary = await connectSecondaryDB().catch(() => null);
      if (secondary && secondary.readyState === 1 && doc._id) {
        await getCol(secondary, colName).deleteOne({ _id: doc._id });
      }
    } catch (err) {
      console.warn('[Two-Step DB Plugin findOneAndDelete notice]:', err.message);
    }
  });

  schema.post('deleteOne', { document: false, query: true }, async function () {
    if (!ENABLE_TWO_STEP_DB || process.env.NODE_ENV === 'test') return;
    try {
      const filter = this.getFilter ? this.getFilter() : null;
      if (!filter) return;
      const colName = this.model.collection.name;
      let secondary = getSecondaryConn();
      if (!secondary) secondary = await connectSecondaryDB().catch(() => null);
      if (secondary && secondary.readyState === 1) {
        await getCol(secondary, colName).deleteOne(filter);
      }
    } catch (err) {
      console.warn('[Two-Step DB Plugin deleteOne notice]:', err.message);
    }
  });

  schema.post('deleteMany', { document: false, query: true }, async function () {
    if (!ENABLE_TWO_STEP_DB || process.env.NODE_ENV === 'test') return;
    try {
      const filter = this.getFilter ? this.getFilter() : null;
      if (!filter) return;
      const colName = this.model.collection.name;
      let secondary = getSecondaryConn();
      if (!secondary) secondary = await connectSecondaryDB().catch(() => null);
      if (secondary && secondary.readyState === 1) {
        await getCol(secondary, colName).deleteMany(filter);
      }
    } catch (err) {
      console.warn('[Two-Step DB Plugin deleteMany notice]:', err.message);
    }
  });

  schema.post('updateOne', { document: false, query: true }, async function () {
    if (!ENABLE_TWO_STEP_DB || process.env.NODE_ENV === 'test') return;
    try {
      const filter = this.getFilter ? this.getFilter() : null;
      const update = this.getUpdate ? this.getUpdate() : null;
      if (!filter || !update) return;
      const colName = this.model.collection.name;
      let secondary = getSecondaryConn();
      if (!secondary) secondary = await connectSecondaryDB().catch(() => null);
      if (secondary && secondary.readyState === 1) {
        await getCol(secondary, colName).updateOne(filter, update, { upsert: false });
      }
    } catch (err) {
      console.warn('[Two-Step DB Plugin updateOne notice]:', err.message);
    }
  });

  schema.post('updateMany', { document: false, query: true }, async function () {
    if (!ENABLE_TWO_STEP_DB || process.env.NODE_ENV === 'test') return;
    try {
      const filter = this.getFilter ? this.getFilter() : null;
      const update = this.getUpdate ? this.getUpdate() : null;
      if (!filter || !update) return;
      const colName = this.model.collection.name;
      let secondary = getSecondaryConn();
      if (!secondary) secondary = await connectSecondaryDB().catch(() => null);
      if (secondary && secondary.readyState === 1) {
        await getCol(secondary, colName).updateMany(filter, update, { upsert: false });
      }
    } catch (err) {
      console.warn('[Two-Step DB Plugin updateMany notice]:', err.message);
    }
  });
};

// Register plugin globally with Mongoose so all compiled models inherit it automatically
mongoose.plugin(mongooseTwoStepPlugin);

export default twoStepDB;
