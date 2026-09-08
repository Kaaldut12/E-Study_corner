// backend/routes/adminRoutes.js
import express from 'express';
import {
  getAdminDashboard,
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
  uploadStudyMaterial,
  deleteStudyMaterial,
  sendEmailBroadcast
} from '../controllers/adminController.js';
import { verifyToken, requireRole } from '../src/middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);
router.use(requireRole(['admin']));

router.get('/dashboard', getAdminDashboard);
router.get('/users', getAllUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/feedback', getFeedbackList);
router.get('/messages', getSupportMessages);
router.put('/messages/:id', updateMessageStatus);

// Notification Management (Tbl_Notification)
router.get('/notifications', getAdminNotifications);
router.post('/notifications', createNotification);
router.delete('/notifications/:id', deleteNotification);

// Enquiry Management (Tbl_Enquiry)
router.get('/enquiries', getAdminEnquiries);
router.delete('/enquiries/:id', deleteEnquiry);

// Study Material Upload (Tbl_StudyMaterial)
router.post('/study-material', uploadStudyMaterial);
router.delete('/study-material/:id', deleteStudyMaterial);

// Email Sender (EmailSender)
router.post('/send-email', sendEmailBroadcast);

export default router;
