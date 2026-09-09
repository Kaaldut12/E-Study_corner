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

const router = express.Router();

router.use(verifyToken);
router.use(requireRole(['student']));

router.get('/dashboard', getStudentDashboard);
router.get('/assignments', getStudentAssignments);
router.post('/submit', submitAssignment);
router.get('/feedback', getStudentFeedback);
router.post('/contact-admin', sendContactMessage);

// Direct Student-Teacher Q&A & Doubts
router.get('/teachers', getAvailableTeachers);
router.get('/questions', getStudentQuestions);
router.post('/questions', askTeacherQuestion);

// Project Report Extensions
router.get('/study-material', getStudyMaterials);
router.put('/profile', updateProfile);
router.post('/change-password', changePassword);

// V1 Foundation Routes
router.get('/courses', getStudentCourses);
router.get('/courses/:courseId', getCourseDetails);
router.get('/notes', getNotes);
router.post('/notes', createNote);
router.put('/notes/:noteId', updateNote);
router.delete('/notes/:noteId', deleteNote);
router.get('/search', searchAll);

// V2 Learning System Routes
router.get('/quizzes', getStudentQuizzes);
router.get('/quizzes/:quizId', getQuizQuestions);
router.post('/quizzes/submit', submitQuizAttempt);
router.get('/bookmarks', getStudentBookmarks);
router.post('/bookmarks/toggle', toggleBookmark);
router.delete('/bookmarks/:bookmarkId', deleteBookmark);
router.get('/progress', getStudentProgressStats);
router.get('/notifications', getStudentNotifications);

// V3 Advanced Learning Routes
router.post('/ai-coach', askAICoach);
router.get('/recommendations', getAIRecommendations);
router.get('/weak-topics', getWeakTopicAnalysis);

export default router;



