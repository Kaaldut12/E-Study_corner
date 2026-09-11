// backend/routes/attendanceRoutes.js
import express from 'express';
import {
  checkInAttendance,
  getAttendanceStatus,
  getAllAttendance,
  markStudentAttendance,
  getStudentAttendance,
  getRosterAttendance,
  markBatchAttendance
} from '../controllers/attendanceController.js';
import { verifyToken, requireRole } from '../src/middleware/authMiddleware.js';

const router = express.Router();

// Student & Teacher attendance check-in & status
router.post('/check-in', verifyToken, checkInAttendance);
router.get('/status', verifyToken, getAttendanceStatus);
router.get('/my-stats', verifyToken, getAttendanceStatus);

// Classroom roster & batch operations
router.get('/roster', verifyToken, requireRole(['admin', 'teacher', 'superadmin']), getRosterAttendance);
router.post('/mark-batch', verifyToken, requireRole(['admin', 'teacher', 'superadmin']), markBatchAttendance);

// Administrative & Teacher attendance management
router.get('/all', verifyToken, requireRole(['admin', 'teacher', 'superadmin']), getAllAttendance);
router.get('/student/:studentId', verifyToken, requireRole(['admin', 'teacher', 'superadmin']), getStudentAttendance);
router.post('/mark-student', verifyToken, requireRole(['admin', 'teacher', 'superadmin']), markStudentAttendance);

export default router;
