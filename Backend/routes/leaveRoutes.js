// backend/routes/leaveRoutes.js
import express from 'express';
import {
  applyForLeave,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus,
  deleteLeave
} from '../controllers/leaveController.js';
import { verifyToken, requireRole } from '../src/middleware/authMiddleware.js';

const router = express.Router();

// Apply for leave (Students, Teachers & Admins)
router.post(['/apply', '/'], verifyToken, applyForLeave);

// User's own leave applications
router.get('/my-leaves', verifyToken, getMyLeaves);

// Administrative and faculty review of leave applications
router.get(['/all', '/'], verifyToken, requireRole(['admin', 'teacher', 'superadmin']), getAllLeaves);
router.route('/:id/status')
  .patch(verifyToken, requireRole(['admin', 'teacher', 'superadmin']), updateLeaveStatus)
  .put(verifyToken, requireRole(['admin', 'teacher', 'superadmin']), updateLeaveStatus);

// Cancel / withdraw / delete leave application
router.delete('/:id', verifyToken, deleteLeave);

export default router;
