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
import {
  validateAssignment,
  validateCourse,
  validateGrade
} from '../src/middleware/validationMiddleware.js';

const router = express.Router();

router.use(verifyToken);
router.use(requireRole(['teacher']));

router.get('/dashboard', getTeacherDashboard);
router.get('/students', getTeacherStudents);

// Course Management (Supports REST POST /courses and legacy POST /create-course)
router.get('/courses', getTeacherCourses);
router.post('/courses', validateCourse, createTeacherCourse);
router.post('/create-course', validateCourse, createTeacherCourse);

// Assignment Management
router.get('/assignments', getTeacherAssignments);
router.post('/assignments', validateAssignment, createAssignment);
router.delete('/assignments/:id', deleteAssignment);

// Submissions & Grading (REST + Legacy endpoints)
router.get('/assignments/:id/submissions', getSubmissionsForAssignment);
router.get('/submissions/:assignmentId', getSubmissionsForAssignment);
router.post('/submissions/:id/grade', validateGrade, gradeSubmission);
router.post('/grade-submission', validateGrade, gradeSubmission);

// Student Doubts & Q&A
router.get('/questions', getTeacherQuestions);
router.post('/questions/:id/reply', replyTeacherQuestion);

export default router;
