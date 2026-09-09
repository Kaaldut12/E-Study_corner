// backend/routes/adminRoutes.js
import express from 'express';
import {
  getAdminDashboard,
  getAdminAnalytics,
  getSystemPermissions,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getFeedbackList,
  getSupportMessages,
  updateMessageStatus,
  getAdminNotifications,
  createNotification,
  deleteNotification,
  getAdminEnquiries,
  deleteEnquiry,
  getAdminStudyMaterials,
  uploadStudyMaterial,
  deleteStudyMaterial,
  sendEmailBroadcast,
  toggleUserStatus,
  triggerDatabaseResync,
  adminReplyStudentQuestion
} from '../controllers/adminController.js';
import { getStudentFullDetails } from '../controllers/teacherController.js';
import { verifyToken, requireRole } from '../src/middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);
router.use(requireRole(['admin', 'superadmin']));

router.get('/dashboard', getAdminDashboard);
router.get('/analytics', getAdminAnalytics);
router.get('/permissions', getSystemPermissions);
router.get('/users', getAllUsers);
router.get('/students/:studentId/details', getStudentFullDetails);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.route('/users/:id/status')
  .put(toggleUserStatus)
  .patch(toggleUserStatus);
router.delete('/users/:id', deleteUser);
router.get('/feedback', getFeedbackList);
router.get('/messages', getSupportMessages);
router.put('/messages/:id', updateMessageStatus);
router.post('/messages/:id/reply', updateMessageStatus);
router.put('/questions/:id/reply', adminReplyStudentQuestion);
router.post('/action/resync', triggerDatabaseResync);

// Notification Management (Tbl_Notification)
router.get('/notifications', getAdminNotifications);
router.post('/notifications', createNotification);
router.delete('/notifications/:id', deleteNotification);

// Enquiry Management (Tbl_Enquiry)
router.get('/enquiries', getAdminEnquiries);
router.delete('/enquiries/:id', deleteEnquiry);

// Study Material Management (Tbl_StudyMaterial) - supports canonical singular and plural
router.get(['/study-material', '/study-materials'], getAdminStudyMaterials);
router.post(['/study-material', '/study-materials'], uploadStudyMaterial);
router.delete(['/study-material/:id', '/study-materials/:id'], deleteStudyMaterial);

// Email Sender (EmailSender)
router.post('/send-email', sendEmailBroadcast);

export default router;
