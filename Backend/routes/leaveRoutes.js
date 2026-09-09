// backend/routes/leaveRoutes.js
import express from 'express';
import {
  applyForLeave,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus
} from '../controllers/leaveController.js';
import { verifyToken, requireRole } from '../src/middleware/authMiddleware.js';

const router = express.Router();

// Apply for leave (Students & Teachers)
router.post('/apply', verifyToken, applyForLeave);

// User's own leave applications
router.get('/my-leaves', verifyToken, getMyLeaves);

// Administrative and faculty review of leave applications
router.get('/all', verifyToken, requireRole(['admin', 'teacher']), getAllLeaves);
router.patch('/:id/status', verifyToken, requireRole(['admin', 'teacher']), updateLeaveStatus);

export default router;
