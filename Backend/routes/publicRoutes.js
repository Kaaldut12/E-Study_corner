// backend/routes/publicRoutes.js
import express from 'express';
import { getPublicNotifications, saveEnquiry } from '../controllers/publicController.js';

const router = express.Router();

router.get('/notifications', getPublicNotifications);
router.post('/enquiry', saveEnquiry);

export default router;
