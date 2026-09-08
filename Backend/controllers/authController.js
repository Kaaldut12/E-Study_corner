// backend/controllers/authController.js
import jwt from 'jsonwebtoken';
import { dataStore } from '../src/services/dataStore.js';
import { sendPasswordResetEmail } from '../src/services/emailService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '24h';

export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    const user = await dataStore.getUserByEmail(email);
    if (!user || user.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    if (role && user.role !== role) {
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
      role: user.role
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRATION });

    const { password: _, ...userWithoutPassword } = user;

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Error in login:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    });
  }
};

export const register = async (req, res) => {
  try {
    const { name, email, password, gradeLevel, department, collegeName, course, courseYear, gender, mobileNo, dob, addressP } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.'
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
      collegeName: collegeName || 'Government Polytechnic Aurai, Bhadohi',
      course: course || 'Diploma in Computer Science & Engineering',
      courseYear: courseYear || '3rd Year',
      mobileNo: mobileNo || '',
      dob: dob || '',
      addressP: addressP || '',
      gradeLevel: gradeLevel || 'Grade 10',
      department: department || 'General Studies'
    });

    const token = jwt.sign(
      { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRATION }
    );

    const { password: _, ...userWithoutPassword } = newUser;

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: userWithoutPassword
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
    const { password: _, ...userWithoutPassword } = user;
    return res.status(200).json({
      success: true,
      user: userWithoutPassword
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
    const user = await dataStore.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this email address.' });
    }

    // Generate 6-digit random OTP code
    const resetOTP = Math.floor(100000 + Math.random() * 900000).toString();
    await dataStore.setResetOTP(email, resetOTP);

    // Send email with reset OTP
    await sendPasswordResetEmail(email, user.name, resetOTP);

    return res.status(200).json({
      success: true,
      message: `Password reset OTP code sent to ${email}.`,
      demoOTP: resetOTP
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
