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
  searchAll
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

export default router;

