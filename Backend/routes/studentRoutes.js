// backend/routes/studentRoutes.js
import express from 'express';
import {
  getStudentDashboard,
  getStudentAssignments,
  submitAssignment,
  getStudentFeedback,
  sendContactMessage,
  getStudyMaterials,
  updateProfile,
  changePassword,
  getStudentCourses,
  getCourseDetails,
  enrollCourse,
  completeLesson,
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  searchAll,
  getStudentQuizzes,
  getQuizQuestions,
  submitQuizAttempt,
  getStudentBookmarks,
  toggleBookmark,
  deleteBookmark,
  getStudentProgressStats,
  getStudentNotifications,
  askAICoach,
  getAIRecommendations,
  getWeakTopicAnalysis,
  getAvailableTeachers,
  getStudentQuestions,
  askTeacherQuestion
} from '../controllers/studentControllers.js';
import { verifyToken, requireRole } from '../src/middleware/authMiddleware.js';
import {
  validateSubmission,
  validateNote,
  validateTeacherQuestion
} from '../src/middleware/validationMiddleware.js';

const router = express.Router();

router.use(verifyToken);
router.use(requireRole(['student']));

router.get('/dashboard', getStudentDashboard);

// Assignments (REST + Legacy)
router.get('/assignments', getStudentAssignments);
router.post('/assignments/:id/submissions', validateSubmission, submitAssignment);
router.post('/submit', validateSubmission, submitAssignment);

router.get('/feedback', getStudentFeedback);
router.post('/contact-admin', sendContactMessage);

// Direct Student-Teacher Q&A & Doubts
router.get('/teachers', getAvailableTeachers);
router.get('/questions', getStudentQuestions);
router.post('/questions', validateTeacherQuestion, askTeacherQuestion);

// Study Material & Profile
router.get('/study-material', getStudyMaterials);
router.put('/profile', updateProfile);
router.post('/change-password', changePassword);

// Course Discovery, Details, Enrollment & Lesson Completion
router.get('/courses', getStudentCourses);
router.get('/courses/:courseId', getCourseDetails);
router.post('/courses/:courseId/enroll', enrollCourse);
router.post('/courses/:courseId/lessons/:lessonId/complete', completeLesson);

// Personal Notes
router.get('/notes', getNotes);
router.post('/notes', validateNote, createNote);
router.put('/notes/:noteId', validateNote, updateNote);
router.delete('/notes/:noteId', deleteNote);
router.get('/search', searchAll);

// Quizzes & Bookmarks
router.get('/quizzes', getStudentQuizzes);
router.get('/quizzes/:quizId', getQuizQuestions);
router.post('/quizzes/submit', submitQuizAttempt);
router.get('/bookmarks', getStudentBookmarks);
router.post('/bookmarks/toggle', toggleBookmark);
router.delete('/bookmarks/:bookmarkId', deleteBookmark);
router.get('/progress', getStudentProgressStats);
router.get('/notifications', getStudentNotifications);

// AI Coach & Learning Analytics
router.post('/ai-coach', askAICoach);
router.get('/recommendations', getAIRecommendations);
router.get('/weak-topics', getWeakTopicAnalysis);

export default router;
