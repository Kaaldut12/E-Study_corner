// backend/src/seed/seedDatabase.js
import mongoose from 'mongoose';
import { seedDatabase } from '../../seed.js';

console.log('🚀 Initiating explicit database seed process...');

seedDatabase()
  .then(() => {
    console.log('✅ Seed completed successfully.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Seed execution failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });
