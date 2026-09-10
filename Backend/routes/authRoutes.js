// backend/routes/authRoutes.js
import express from 'express';
import { login, register, getMe, resetPassword, confirmResetPassword, updateProfile, changePassword } from '../controllers/authController.js';
import { verifyToken } from '../src/middleware/authMiddleware.js';
import { authRateLimiter } from '../src/middleware/security.js';

const router = express.Router();

router.post('/login', authRateLimiter, login);
router.post('/register', authRateLimiter, register);
router.get('/me', verifyToken, getMe);
router.put('/profile', verifyToken, updateProfile);
router.post('/change-password', verifyToken, changePassword);
router.post('/reset-password', authRateLimiter, resetPassword);
router.post('/confirm-reset-password', authRateLimiter, confirmResetPassword);

export default router;

