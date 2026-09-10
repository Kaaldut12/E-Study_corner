// backend/src/seed/seedUser.js
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

// Parse command-line arguments: --email=... --password=... --role=... --name=...
const parseArgs = () => {
  const args = {};
  process.argv.slice(2).forEach(arg => {
    if (arg.startsWith('--')) {
      const [key, ...values] = arg.replace(/^--/, '').split('=');
      args[key] = values.join('=');
    }
  });
  return args;
};

export const seedCustomUser = async () => {
  const args = parseArgs();

  // Prioritize CLI flags, then .env values, then defaults
  const email = (
    args.email ||
    process.env.NEW_USER_EMAIL ||
    process.env.SEED_SUPERADMIN_EMAIL ||
    'admin@estudy.com'
  ).trim().toLowerCase();

  const rawPassword =
    args.password ||
    process.env.NEW_USER_PASSWORD ||
    (email === process.env.SEED_SUPERADMIN_EMAIL ? process.env.SEED_SUPERADMIN_PASSWORD : null) ||
    process.env.SEED_DEFAULT_PASSWORD ||
    'Admin@123';

  const role = (
    args.role ||
    process.env.NEW_USER_ROLE ||
    (email === process.env.SEED_SUPERADMIN_EMAIL ? 'superadmin' : null) ||
    'admin'
  ).trim().toLowerCase();

  const name = (
    args.name ||
    process.env.NEW_USER_NAME ||
    (email === process.env.SEED_SUPERADMIN_EMAIL ? process.env.SEED_SUPERADMIN_NAME : null) ||
    (role === 'superadmin' ? 'Platform Super Administrator' : 'Platform Administrator')
  ).trim();

  const collegeName = process.env.COLLEGE_NAME || 'National Institute of Technology & Advanced Studies';
  const permissions = DEFAULT_ROLE_PERMISSIONS[role] || DEFAULT_ROLE_PERMISSIONS.admin || [];

  const primaryURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/estudy';
  const localFallbackURI = process.env.SECONDARY_MONGODB_URI || 'mongodb://127.0.0.1:27017/estudy';
  let connectedURI = primaryURI;

  try {
    const masked = primaryURI.replace(/\/\/[^@]+@/, '//***:***@');
    console.log(`📡 Connecting to database (${masked}) ...`);
    await mongoose.connect(primaryURI, { serverSelectionTimeoutMS: 5000 });
  } catch (err) {
    if (primaryURI !== localFallbackURI) {
      console.warn(`\n⚠️  Primary database connection failed (${err.message}).`);
      console.warn(`Tip: If using MongoDB Atlas, whitelist your current IP in Atlas -> Security -> Network Access.`);
      console.log(`Attempting fallback to local MongoDB (${localFallbackURI}) ...`);
      await mongoose.connect(localFallbackURI, { serverSelectionTimeoutMS: 5000 });
      connectedURI = localFallbackURI;
      console.log(`✓ Connected to local MongoDB successfully.`);
    } else {
      throw err;
    }
  }

  const existingUser = await User.findOne({ email });
  const userId = existingUser?.id || `user_${role}_${Date.now()}`;

  const userData = {
    id: userId,
    name,
    firstName: name.split(' ')[0] || name,
    lastName: name.split(' ').slice(1).join(' ') || '',
    email,
    password: hashPassword(rawPassword),
    role,
    permissions,
    collegeName,
    status: 'active'
  };

  const user = await User.findOneAndUpdate(
    { email },
    { $set: userData },
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
  );

  // Explicit Step 2 replication for guaranteed dual-database persistence
  await twoStepDB.replicateToSecondary({
    collection: 'users',
    filter: { email },
    data: userData,
    upsert: true
  });

  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║                 ✓ USER SEEDED / UPDATED                          ║
╠══════════════════════════════════════════════════════════════════╣
║  ID:        ${user.id.padEnd(48)}║
║  Name:      ${user.name.padEnd(48)}║
║  Email:     ${user.email.padEnd(48)}║
║  Password:  ${rawPassword.padEnd(48)}║
║  Role:      ${user.role.padEnd(48)}║
║  Status:    ${user.status.padEnd(48)}║
║  Database:  ${(connectedURI.includes('127.0.0.1') ? 'Local MongoDB (127.0.0.1:27017)' : 'MongoDB Atlas Cluster').padEnd(48)}║
╚══════════════════════════════════════════════════════════════════╝
  `);

  return user;
};

// Direct script execution
seedCustomUser()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Failed to seed user:', err.message);
    process.exit(1);
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });
