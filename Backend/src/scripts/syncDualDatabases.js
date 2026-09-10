// backend/src/scripts/syncDualDatabases.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const syncDatabases = async () => {
  const primaryUri = process.env.MONGODB_URI;
  const secondaryUri = process.env.SECONDARY_MONGODB_URI || 'mongodb://127.0.0.1:27017/estudy';

  if (!primaryUri) {
    throw new Error('MONGODB_URI is required.');
  }

  const maskedPrimary = primaryUri.replace(/\/\/[^@]+@/, '//***:***@');
  const maskedSecondary = secondaryUri.replace(/\/\/[^@]+@/, '//***:***@');

  console.log(`📡 Connecting to Primary Database (Step 1: Atlas Cloud: ${maskedPrimary})...`);
  const primaryConn = await mongoose.createConnection(primaryUri, { serverSelectionTimeoutMS: 10000 }).asPromise();
  console.log('✓ Primary DB Connected!');

  console.log(`📡 Connecting to Secondary Database (Step 2: Local DB: ${maskedSecondary})...`);
  const secondaryConn = await mongoose.createConnection(secondaryUri, { serverSelectionTimeoutMS: 10000 }).asPromise();
  console.log('✓ Secondary DB Connected!');

  const primaryDb = primaryConn.db;
  const secondaryDb = secondaryConn.db;

  const collections = await primaryDb.listCollections().toArray();
  console.log(`\n🔄 Synchronizing ${collections.length} collection(s) between Primary and Secondary...`);

  const stats = [];

  for (const col of collections) {
    const colName = col.name;
    if (colName.startsWith('system.')) continue;

    const primCol = primaryDb.collection(colName);
    const secCol = secondaryDb.collection(colName);

    const primDocs = await primCol.find({}).toArray();

    if (primDocs.length > 0) {
      const ops = primDocs.map(doc => ({
        replaceOne: {
          filter: { _id: doc._id },
          replacement: doc,
          upsert: true
        }
      }));
      await secCol.bulkWrite(ops, { ordered: false });
    }

    // Sync indexes
    try {
      const indexes = await primCol.indexes();
      for (const idx of indexes) {
        if (idx.name === '_id_') continue;
        await secCol.createIndex(idx.key, {
          name: idx.name,
          unique: Boolean(idx.unique),
          sparse: Boolean(idx.sparse)
        });
      }
    } catch (idxErr) {
      // ignore minor index warnings
    }

    const secCount = await secCol.countDocuments();
    stats.push({
      collection: colName,
      primaryCount: primDocs.length,
      secondaryCount: secCount,
      synced: primDocs.length === secCount
    });
  }

  console.log('\n📊 Dual Database Sync Results:');
  console.log('─'.repeat(65));
  console.log(
    'Collection'.padEnd(22) +
    'Primary (Atlas)'.padEnd(18) +
    'Secondary (Local)'.padEnd(18) +
    'Status'
  );
  console.log('─'.repeat(65));

  for (const s of stats) {
    console.log(
      s.collection.padEnd(22) +
      String(s.primaryCount).padEnd(18) +
      String(s.secondaryCount).padEnd(18) +
      (s.synced ? '✓ Synced' : '⚠️ Discrepancy')
    );
  }
  console.log('─'.repeat(65));

  await primaryConn.close();
  await secondaryConn.close();
  console.log('\n✅ Dual database synchronization completed successfully.');
};

syncDatabases()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Sync failed:', err.message);
    process.exit(1);
  });
