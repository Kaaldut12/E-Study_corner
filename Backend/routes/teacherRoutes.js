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
  updateTeacherCourse,
  deleteTeacherCourse,
  createTeacherLesson,
  updateTeacherLesson,
  deleteTeacherLesson,
  createTeacherQuiz,
  updateTeacherQuiz,
  deleteTeacherQuiz,
  createTeacherQuestionItem,
  updateTeacherQuestionItem,
  deleteTeacherQuestionItem,
  getTeacherStudents,
  getTeacherQuestions,
  replyTeacherQuestion
} from '../controllers/teacherController.js';
import { verifyToken, requireRole } from '../src/middleware/authMiddleware.js';
import {
  validateAssignment,
  validateCourse,
  validateLesson,
  validateQuiz,
  validateQuestion,
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
router.put('/courses/:id', updateTeacherCourse);
router.delete('/courses/:id', deleteTeacherCourse);

// Lesson Management
router.post('/courses/:courseId/lessons', validateLesson, createTeacherLesson);
router.post('/lessons', validateLesson, createTeacherLesson);
router.put('/lessons/:id', updateTeacherLesson);
router.delete('/lessons/:id', deleteTeacherLesson);

// Quiz Management
router.post('/courses/:courseId/quizzes', validateQuiz, createTeacherQuiz);
router.post('/quizzes', validateQuiz, createTeacherQuiz);
router.put('/quizzes/:id', updateTeacherQuiz);
router.delete('/quizzes/:id', deleteTeacherQuiz);

// Question Management
router.post('/quizzes/:quizId/questions', validateQuestion, createTeacherQuestionItem);
router.post('/questions', validateQuestion, createTeacherQuestionItem);
router.put('/questions/:id', updateTeacherQuestionItem);
router.delete('/questions/:id', deleteTeacherQuestionItem);

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

