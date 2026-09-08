// backend/routes/systemRoutes.js
import express from 'express';
import { getSystemHealth, getSystemMetrics } from '../controllers/systemController.js';
import { verifyToken, requireRole } from '../src/middleware/authMiddleware.js';

const router = express.Router();

// Public health check route
router.get('/health', getSystemHealth);

// Admin system performance metrics route
router.get('/metrics', verifyToken, requireRole(['admin']), getSystemMetrics);

export default router;
