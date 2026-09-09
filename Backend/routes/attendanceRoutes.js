// backend/routes/attendanceRoutes.js
import express from 'express';
import {
  checkInAttendance,
  getAttendanceStatus,
  getAllAttendance
} from '../controllers/attendanceController.js';
import { verifyToken, requireRole } from '../src/middleware/authMiddleware.js';

const router = express.Router();

// Student & Teacher attendance check-in & status
router.post('/check-in', verifyToken, checkInAttendance);
router.get('/status', verifyToken, getAttendanceStatus);
router.get('/my-stats', verifyToken, getAttendanceStatus);

// Administrative overview
router.get('/all', verifyToken, requireRole(['admin', 'teacher']), getAllAttendance);

export default router;
