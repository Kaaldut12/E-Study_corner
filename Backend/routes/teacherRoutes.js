// backend/routes/teacherRoutes.js
import express from 'express';
import {
  getTeacherDashboard,
  getTeacherAssignments,
  createAssignment,
  deleteAssignment,
  getSubmissionsForAssignment,
  gradeSubmission,
  getTeacherCourses,
  createTeacherCourse,
  getTeacherStudents,
  getTeacherQuestions,
  replyTeacherQuestion
} from '../controllers/teacherController.js';
import { verifyToken, requireRole } from '../src/middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);
router.use(requireRole(['teacher']));

router.get('/dashboard', getTeacherDashboard);
router.get('/students', getTeacherStudents);
router.get('/assignments', getTeacherAssignments);
router.post('/assignments', createAssignment);
router.delete('/assignments/:id', deleteAssignment);
router.get('/submissions/:assignmentId', getSubmissionsForAssignment);
router.post('/grade-submission', gradeSubmission);

// Student Doubts & Q&A
router.get('/questions', getTeacherQuestions);
router.post('/questions/:id/reply', replyTeacherQuestion);

// V4 Course Creator Routes
router.get('/courses', getTeacherCourses);
router.post('/create-course', createTeacherCourse);

export default router;

