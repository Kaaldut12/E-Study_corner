// backend/routes/authRoutes.js
import express from 'express';
import { login, register, getMe, resetPassword, confirmResetPassword } from '../controllers/authController.js';
import { verifyToken } from '../src/middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.get('/me', verifyToken, getMe);
router.post('/reset-password', resetPassword);
router.post('/confirm-reset-password', confirmResetPassword);

export default router;
