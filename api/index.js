import app from '../Backend/index.js';
import { connectDB } from '../Backend/src/config/db.js';

export default async function handler(req, res) {
  try {
    await connectDB();
  } catch (err) {
    console.warn('[Vercel Serverless] DB connection notice on request:', err.message);
  }
  return app(req, res);
}
