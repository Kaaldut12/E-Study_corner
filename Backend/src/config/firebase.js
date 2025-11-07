import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

const serviceAccountPath = path.join(process.cwd(), 'config', 'serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.warn('Warning: serviceAccountKey.json not found. Firebase Admin will not initialize.');
} else {
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
}

export const db = admin.firestore();
export const auth = admin.auth();
export default admin;