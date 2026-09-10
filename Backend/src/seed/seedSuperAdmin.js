// backend/src/seed/seedSuperAdmin.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

import User from '../../models/User.js';
import { hashPassword } from '../utils/password.js';
import { DEFAULT_ROLE_PERMISSIONS } from '../constants/permissions.js';
import { twoStepDB } from '../services/twoStepDB.js';

export const seedSuperAdminUser = async () => {
  const primaryURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/estudy';
  const localFallbackURI = process.env.SECONDARY_MONGODB_URI || 'mongodb://127.0.0.1:27017/estudy';
  let connectedURI = primaryURI;

  try {
    const masked = primaryURI.replace(/\/\/[^@]+@/, '//***:***@');
    console.log(`📡 Connecting to database (${masked}) ...`);
    await mongoose.connect(primaryURI, { serverSelectionTimeoutMS: 5000 });
  } catch (err) {
    if (primaryURI !== localFallbackURI) {
      console.warn(`\n⚠️  Could not connect to primary database (${err.message}).`);
      console.warn(`Tip: If using MongoDB Atlas, whitelist your current IP in Atlas -> Security -> Network Access.`);
      console.log(`Attempting fallback to local MongoDB (${localFallbackURI}) ...`);
      await mongoose.connect(localFallbackURI, { serverSelectionTimeoutMS: 5000 });
      connectedURI = localFallbackURI;
      console.log(`✓ Connected to local MongoDB successfully.`);
    } else {
      throw err;
    }
  }

  const superAdminData = {
    id: 'user_superadmin_1',
    name: process.env.SEED_SUPERADMIN_NAME || 'Platform Super Administrator',
    firstName: process.env.SEED_SUPERADMIN_FIRSTNAME || 'Super',
    lastName: process.env.SEED_SUPERADMIN_LASTNAME || 'Admin',
    email: (process.env.SEED_SUPERADMIN_EMAIL || 'abhaypatel2556444@gmail.com').trim().toLowerCase(),
    password: hashPassword(process.env.SEED_SUPERADMIN_PASSWORD || 'SuperAdmin@123'),
    role: 'superadmin',
    permissions: DEFAULT_ROLE_PERMISSIONS.superadmin,
    gender: 'Male',
    department: process.env.SEED_SUPERADMIN_DEPT || 'Administration & Platform Governance',
    collegeName: process.env.COLLEGE_NAME || 'E-Study Academy',
    mobileNo: process.env.SEED_SUPERADMIN_PHONE || '9335856018',
    dob: process.env.SEED_SUPERADMIN_DOB || '2004-07-28',
    addressP: process.env.SEED_SUPERADMIN_ADDRESS || 'Administration Block',
    status: 'active'
  };

  const result = await User.findOneAndUpdate(
    {
      $or: [
        { email: superAdminData.email },
        { id: superAdminData.id },
        { role: 'superadmin' }
      ]
    },
    { $set: superAdminData },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // Explicit Step 2 replication for guaranteed dual-database persistence
  await twoStepDB.replicateToSecondary({
    collection: 'users',
    filter: { email: superAdminData.email },
    data: superAdminData,
    upsert: true
  });

  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║              ✓ SUPERADMIN SEEDED SUCCESSFULLY                    ║
╠══════════════════════════════════════════════════════════════════╣
║  Name:      ${result.name.padEnd(48)}║
║  Email:     ${result.email.padEnd(48)}║
║  Password:  ${(process.env.SEED_SUPERADMIN_PASSWORD || 'SuperAdmin@123').padEnd(48)}║
║  Role:      ${result.role.padEnd(48)}║
║  Status:    ${result.status.padEnd(48)}║
║  Database:  ${(connectedURI.includes('127.0.0.1') ? 'Local MongoDB (127.0.0.1:27017)' : 'MongoDB Atlas Cluster').padEnd(48)}║
╚══════════════════════════════════════════════════════════════════╝
  `);

  return result;
};

// Direct script execution
seedSuperAdminUser()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Failed to seed superadmin:', err.message);
    process.exit(1);
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });
