// backend/controllers/authController.js
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { dataStore } from '../src/services/dataStore.js';
import { sendPasswordResetEmail } from '../src/services/emailService.js';
import { hashPassword, isBcryptHash, verifyPassword } from '../src/utils/password.js';

import { getDefaultPermissions } from '../src/constants/permissions.js';
import { JWT_SECRET, JWT_EXPIRATION } from '../src/config/env.js';

const toPublicUser = (user) => {
  const {
    id, name, firstName, lastName, email, role, permissions, gender, collegeName, course,
    courseYear, mobileNo, dob, addressP, userpic, status, joinedAt, createdAt,
    updatedAt
  } = user;
  return {
    id, name, firstName, lastName, email, role,
    permissions: (permissions && permissions.length > 0) ? permissions : getDefaultPermissions(role),
    gender, collegeName, course,
    courseYear, mobileNo, dob, addressP, userpic, status, joinedAt, createdAt,
    updatedAt
  };
};

export const login = async (req, res) => {
  try {
    const emailAddress = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body.password === 'string' ? req.body.password : '';
    const { role } = req.body;
    if (!emailAddress || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    const user = await dataStore.getUserByEmail(emailAddress);
    if (!user || !verifyPassword(password, user.password)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    if (!isBcryptHash(user.password)) {
      await dataStore.updateUser(user.id, { password: hashPassword(password) });
    }

    const isRoleMatch = !role || user.role === role || (role === 'admin' && user.role === 'superadmin');
    if (!isRoleMatch) {
      return res.status(403).json({
        success: false,
        message: `Account found, but role '${role}' does not match registered role '${user.role}'.`
      });
    }

    // Generate token
    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: (user.permissions && user.permissions.length > 0) ? user.permissions : getDefaultPermissions(user.role)
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRATION });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: toPublicUser(user)
    });
  } catch (error) {
    console.error('Error in login:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error during login'
    });
  }
};

export const register = async (req, res) => {
  try {
    const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body.password === 'string' ? req.body.password : '';
    const { gradeLevel, department, collegeName, course, courseYear, gender, mobileNo, dob, addressP } = req.body;
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Name, a valid email, and a password of at least 8 characters are required.'
      });
    }

    // Public self-registration is strictly restricted to Student accounts only
    if (req.body.role && req.body.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Teacher and Administrator accounts cannot be self-registered. Only System Administrators can add Teacher accounts.'
      });
    }

    const role = 'student';

    const existingUser = await dataStore.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists.'
      });
    }

    const newUser = await dataStore.createUser({
      name,
      email,
      password,
      role,
      gender: gender || 'Male',
      collegeName: collegeName || process.env.COLLEGE_NAME || 'National Institute of Technology & Advanced Studies',
      course: course || 'Computer Science & Engineering',
      courseYear: courseYear || '1st Year',
      mobileNo: mobileNo || '',
      dob: dob || '',
      addressP: addressP || '',
      gradeLevel: gradeLevel || 'Grade 10',
      department: department || 'General Studies'
    });

    const token = jwt.sign(
      {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        permissions: (newUser.permissions && newUser.permissions.length > 0) ? newUser.permissions : getDefaultPermissions(newUser.role)
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRATION }
    );

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: toPublicUser(newUser)
    });
  } catch (error) {
    console.error('Error in register:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during registration'
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await dataStore.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.status(200).json({
      success: true,
      user: toPublicUser(user)
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// --- PASSWORD RESET WITH EMAIL OTP ---

export const resetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }
    const cleanEmail = email.trim().toLowerCase();
    const user = await dataStore.getUserByEmail(cleanEmail);
    if (!user) {
      // Security: Prevent account enumeration by returning a uniform success message
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email address, a password reset code has been sent.'
      });
    }

    // Generate 6-digit cryptographically secure OTP code
    const resetOTP = crypto.randomInt(100000, 1000000).toString();
    await dataStore.setResetOTP(cleanEmail, resetOTP);

    // Send email with reset OTP
    await sendPasswordResetEmail(cleanEmail, user.name, resetOTP);

    return res.status(200).json({
      success: true,
      message: 'If an account exists with this email address, a password reset code has been sent.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const confirmResetPassword = async (req, res) => {
  try {
    const { email, resetCode, newPassword } = req.body;
    if (!email || !resetCode || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, 6-digit OTP reset code, and new password are required.'
      });
    }

    const result = await dataStore.confirmResetOTP(email, resetCode, newPassword);
    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
