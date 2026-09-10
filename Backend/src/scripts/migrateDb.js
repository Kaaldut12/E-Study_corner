// backend/src/scripts/migrateDb.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const migrateAllData = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set in environment variables.');
  }

  const maskedUri = uri.replace(/\/\/[^@]+@/, '//***:***@');
  console.log(`📡 Connecting to MongoDB Atlas cluster (${maskedUri})...`);

  const connection = await mongoose.createConnection(uri, { serverSelectionTimeoutMS: 15000 }).asPromise();
  console.log('✓ Successfully connected to cluster!');

  const sourceDb = connection.useDb('test');
  const targetDbName = 'estudy';
  const targetDb = connection.useDb(targetDbName);

  const sourceCollections = await sourceDb.db.listCollections().toArray();
  console.log(`\n📦 Found ${sourceCollections.length} collection(s) in source database ("test"):`);

  let totalDocumentsMigrated = 0;

  for (const col of sourceCollections) {
    const colName = col.name;
    if (colName.startsWith('system.')) continue;

    const sourceCollection = sourceDb.collection(colName);
    const targetCollection = targetDb.collection(colName);

    const docs = await sourceCollection.find({}).toArray();
    console.log(`\n🔄 Migrating "${colName}": ${docs.length} document(s)...`);

    if (docs.length > 0) {
      // Upsert each document by _id to avoid duplicate key or partial copy issues
      const operations = docs.map(doc => ({
        replaceOne: {
          filter: { _id: doc._id },
          replacement: doc,
          upsert: true
        }
      }));

      await targetCollection.bulkWrite(operations, { ordered: false });
      totalDocumentsMigrated += docs.length;
      console.log(`  ✓ Successfully migrated ${docs.length} document(s) into "${targetDbName}.${colName}".`);
    } else {
      console.log(`  ℹ "${colName}" is empty, skipping document transfer.`);
    }

    // Copy indexes (excluding default _id_ index)
    try {
      const indexes = await sourceCollection.indexes();
      for (const idx of indexes) {
        if (idx.name === '_id_') continue;
        const keys = idx.key;
        const options = {
          name: idx.name,
          unique: Boolean(idx.unique),
          sparse: Boolean(idx.sparse)
        };
        await targetCollection.createIndex(keys, options);
      }
    } catch (idxErr) {
      console.warn(`  ⚠️ Index copy notice for "${colName}":`, idxErr.message);
    }
  }

  // Also verify user accounts in target DB
  const targetUsersCount = await targetDb.collection('users').countDocuments();
  console.log(`\n👥 Users in "${targetDbName}" database: ${targetUsersCount}`);

  const sampleUsers = await targetDb.collection('users').find({}, { projection: { email: 1, role: 1, name: 1, id: 1 } }).toArray();
  sampleUsers.forEach(u => {
    console.log(`  - ${u.email} (${u.role}) [ID: ${u.id}]`);
  });

  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║               ✓ DATABASE MIGRATION COMPLETE                      ║
╠══════════════════════════════════════════════════════════════════╣
║  Source DB:         test                                         ║
║  Destination DB:    ${targetDbName.padEnd(45)}║
║  Total Collections: ${String(sourceCollections.length).padEnd(45)}║
║  Total Documents:   ${String(totalDocumentsMigrated).padEnd(45)}║
╚══════════════════════════════════════════════════════════════════╝
  `);

  await connection.close();
};

migrateAllData()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  });
