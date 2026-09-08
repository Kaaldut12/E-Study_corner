// backend/routes/teacherRoutes.js
import express from 'express';
import {
  getTeacherDashboard,
  getTeacherAssignments,
  createAssignment,
  deleteAssignment,
  getSubmissionsForAssignment,
  gradeSubmission
} from '../controllers/teacherController.js';
import { verifyToken, requireRole } from '../src/middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);
router.use(requireRole(['teacher']));

router.get('/dashboard', getTeacherDashboard);
router.get('/assignments', getTeacherAssignments);
router.post('/assignments', createAssignment);
router.delete('/assignments/:id', deleteAssignment);
router.get('/submissions/:assignmentId', getSubmissionsForAssignment);
router.post('/grade-submission', gradeSubmission);

export default router;
