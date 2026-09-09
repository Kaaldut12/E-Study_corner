// backend/routes/fileRoutes.js
import express from 'express';
import { downloadFileAttachment } from '../controllers/fileController.js';
import { verifyToken } from '../src/middleware/authMiddleware.js';

const router = express.Router();

// Download endpoint for assignment and homework documents
router.post('/download', verifyToken, downloadFileAttachment);

export default router;
