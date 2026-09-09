// backend/src/services/dataStore.js
import mongoose from 'mongoose';
import User from '../../models/User.js';
import Course from '../../models/Course.js';
import Lesson from '../../models/Lesson.js';
import Quiz from '../../models/Quiz.js';
import Question from '../../models/Question.js';
import QuizAttempt from '../../models/QuizAttempt.js';
import Note from '../../models/Note.js';
import Bookmark from '../../models/Bookmark.js';
import Progress from '../../models/Progress.js';
import Notification from '../../models/Notification.js';
import Enquiry from '../../models/Enquiry.js';
import StudyMaterial from '../../models/StudyMaterial.js';
import Assignment from '../../models/Assignment.js';
import Submission from '../../models/Submission.js';
import SupportMessage from '../../models/SupportMessage.js';
import Feedback from '../../models/Feedback.js';
import TeacherQuestion from '../../models/TeacherQuestion.js';
import Enrollment from '../../models/Enrollment.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { getDefaultPermissions } from '../constants/permissions.js';
import {
  seedUsers,
  seedCourses,
  seedLessons,
  seedQuizzes,
  seedQuestions,
  seedQuizAttempts,
  seedNotes,
  seedBookmarks,
  seedProgress,
  seedNotifications,
  seedEnquiries,
  seedStudyMaterials,
  seedAssignments,
  seedSubmissions,
  seedSupportMessages,
  seedFeedback,
  seedTeacherQuestions
} from '../../seed.js';

// In-memory fallback stores populated with seed data
const memUsers = [...seedUsers];
const memCourses = [...seedCourses];
const memLessons = [...seedLessons];
const memQuizzes = [...seedQuizzes];
const memQuestions = [...seedQuestions];
const memQuizAttempts = [...seedQuizAttempts];
const memNotes = [...seedNotes];
const memBookmarks = [...seedBookmarks];
const memProgress = [...seedProgress];
const memNotifications = [...seedNotifications];
const memEnquiries = [...seedEnquiries];
const memStudyMaterials = [...seedStudyMaterials];
const memAssignments = [...seedAssignments];
const memSubmissions = [...seedSubmissions];
const memSupportMessages = [...seedSupportMessages];
const memFeedback = [...seedFeedback];
const memTeacherQuestions = [...seedTeacherQuestions];
const memEnrollments = [];

const isDBConnected = () => mongoose.connection.readyState === 1;

export const dataStore = {
  // ==================== USERS ====================
  getUsers: async () => {
    if (isDBConnected()) {
      try {
        const list = await User.find().lean();
        if (list && list.length > 0) {
          return list.map(u => ({
            ...u,
            permissions: (u.permissions && u.permissions.length > 0) ? u.permissions : getDefaultPermissions(u.role)
          }));
        }
      } catch (err) {
        console.warn('[dataStore] DB getUsers error, using fallback:', err.message);
      }
    }
    return memUsers.map(u => ({
      ...u,
      permissions: (u.permissions && u.permissions.length > 0) ? u.permissions : getDefaultPermissions(u.role)
    }));
  },

  getUserById: async (id) => {
    if (isDBConnected()) {
      try {
        const u = await User.findOne({ id }).lean();
        if (u) {
          return {
            ...u,
            permissions: (u.permissions && u.permissions.length > 0) ? u.permissions : getDefaultPermissions(u.role)
          };
        }
      } catch (err) {
        console.warn('[dataStore] DB getUserById error, using fallback:', err.message);
      }
    }
    const u = memUsers.find(x => x.id === id);
    if (!u) return null;
    return {
      ...u,
      permissions: (u.permissions && u.permissions.length > 0) ? u.permissions : getDefaultPermissions(u.role)
    };
  },

  getUserByEmail: async (email) => {
    if (!email) return null;
    const cleanEmail = email.toLowerCase();
    if (isDBConnected()) {
      try {
        const u = await User.findOne({ email: cleanEmail }).lean();
        if (u) {
          return {
            ...u,
            permissions: (u.permissions && u.permissions.length > 0) ? u.permissions : getDefaultPermissions(u.role)
          };
        }
      } catch (err) {
        console.warn('[dataStore] DB getUserByEmail error, using fallback:', err.message);
      }
    }
    const u = memUsers.find(x => x.email.toLowerCase() === cleanEmail);
    if (!u) return null;
    return {
      ...u,
      permissions: (u.permissions && u.permissions.length > 0) ? u.permissions : getDefaultPermissions(u.role)
    };
  },

  createUser: async (userData) => {
    const newId = userData.id || `user_${Date.now()}`;
    const userRole = userData.role || 'student';
    const permissions = (Array.isArray(userData.permissions) && userData.permissions.length > 0)
      ? userData.permissions
      : getDefaultPermissions(userRole);

    const payload = {
      id: newId,
      status: 'active',
      joinedAt: new Date(),
      collegeName: userData.collegeName || process.env.COLLEGE_NAME || 'National Institute of Technology & Advanced Studies',
      course: userData.course || 'Computer Science & Engineering',
      courseYear: userData.courseYear || '1st Year',
      ...userData,
      role: userRole,
      permissions,
      password: hashPassword(userData.password)
    };

    if (isDBConnected()) {
      try {
        const doc = await User.create(payload);
        const resObj = doc.toObject ? doc.toObject() : doc;
        memUsers.push(resObj);
        return {
          ...resObj,
          permissions: (resObj.permissions && resObj.permissions.length > 0) ? resObj.permissions : permissions
        };
      } catch (err) {
        console.warn('[dataStore] DB createUser error, storing in fallback:', err.message);
      }
    }

    memUsers.push(payload);
    return payload;
  },

  updateUser: async (id, updates) => {
    if (isDBConnected()) {
      try {
        const doc = await User.findOneAndUpdate({ id }, { $set: updates }, { new: true }).lean();
        if (doc) {
          const mIdx = memUsers.findIndex(u => u.id === id);
          if (mIdx !== -1) memUsers[mIdx] = { ...memUsers[mIdx], ...updates };
          return {
            ...doc,
            permissions: (doc.permissions && doc.permissions.length > 0) ? doc.permissions : getDefaultPermissions(doc.role)
          };
        }
      } catch (err) {
        console.warn('[dataStore] DB updateUser error:', err.message);
      }
    }
    const idx = memUsers.findIndex(u => u.id === id);
    if (idx !== -1) {
      memUsers[idx] = { ...memUsers[idx], ...updates };
      return {
        ...memUsers[idx],
        permissions: (memUsers[idx].permissions && memUsers[idx].permissions.length > 0)
          ? memUsers[idx].permissions
          : getDefaultPermissions(memUsers[idx].role)
      };
    }
    return null;
  },

  setResetOTP: async (email, resetCode) => {
    const expires = Date.now() + 15 * 60 * 1000;
    if (isDBConnected()) {
      try {
        return await User.findOneAndUpdate(
          { email: email.toLowerCase() },
          { $set: { resetCode, resetExpires: expires } },
          { new: true }
        ).lean();
      } catch (err) {
        console.warn('[dataStore] DB setResetOTP error:', err.message);
      }
    }
    const u = memUsers.find(x => x.email.toLowerCase() === email.toLowerCase());
    if (u) {
      u.resetCode = resetCode;
      u.resetExpires = expires;
      return u;
    }
    return null;
  },

  confirmResetOTP: async (email, resetCode, newPassword) => {
    const cleanEmail = email.toLowerCase();
    let user = null;
    if (isDBConnected()) {
      try {
        user = await User.findOne({ email: cleanEmail }).lean();
      } catch (err) {
        console.warn('[dataStore] DB confirmResetOTP lookup error:', err.message);
      }
    }
    if (!user) {
      user = memUsers.find(x => x.email.toLowerCase() === cleanEmail);
    }
    if (!user) return { success: false, message: 'No account found with this email.' };
    if (!user.resetCode || user.resetCode !== resetCode) {
      return { success: false, message: 'Invalid 6-digit OTP reset code.' };
    }
    if (Date.now() > user.resetExpires) {
      return { success: false, message: 'OTP code has expired. Please request a new one.' };
    }

    const hashed = hashPassword(newPassword);
    if (isDBConnected()) {
      try {
        await User.updateOne(
          { email: cleanEmail },
          { $set: { password: hashed, resetCode: null, resetExpires: null } }
        );
      } catch (err) {
        console.warn('[dataStore] DB password update error:', err.message);
      }
    }
    const mUser = memUsers.find(x => x.email.toLowerCase() === cleanEmail);
    if (mUser) {
      mUser.password = hashed;
      mUser.resetCode = null;
      mUser.resetExpires = null;
    }

    return { success: true, message: 'Password reset successfully! You can now log in with your new password.' };
  },

  changeUserPassword: async (id, currentPass, newPass) => {
    let user = null;
    if (isDBConnected()) {
      try {
        user = await User.findOne({ id }).lean();
      } catch (err) {
        console.warn('[dataStore] DB changeUserPassword error:', err.message);
      }
    }
    if (!user) {
      user = memUsers.find(x => x.id === id);
    }
    if (!user) return { success: false, message: 'User not found' };
    if (!verifyPassword(currentPass, user.password)) return { success: false, message: 'Current password is incorrect' };

    const hashed = hashPassword(newPass);
    if (isDBConnected()) {
      try {
        await User.updateOne({ id }, { $set: { password: hashed } });
      } catch (err) {
        console.warn('[dataStore] DB update password error:', err.message);
      }
    }
    const mUser = memUsers.find(x => x.id === id);
    if (mUser) {
      mUser.password = hashed;
    }
    return { success: true, message: 'Password updated successfully' };
  },

  deleteUser: async (id) => {
    if (isDBConnected()) {
      try {
        const res = await User.deleteOne({ id });
        const mIdx = memUsers.findIndex(x => x.id === id);
        if (mIdx !== -1) memUsers.splice(mIdx, 1);
        return res.deletedCount > 0;
      } catch (err) {
        console.warn('[dataStore] DB deleteUser error:', err.message);
      }
    }
    const idx = memUsers.findIndex(x => x.id === id);
    if (idx !== -1) {
      memUsers.splice(idx, 1);
      return true;
    }
    return false;
  },

  // ==================== NOTIFICATIONS ====================
  getNotifications: async () => {
    if (isDBConnected()) {
      try {
        const docs = await Notification.find().sort({ createdAt: -1 }).lean();
        if (docs && docs.length > 0) return docs;
      } catch (err) {
        console.warn('[dataStore] DB getNotifications error:', err.message);
      }
    }
    return memNotifications;
  },

  createNotification: async (notiMessage) => {
    const text = typeof notiMessage === 'object' && notiMessage !== null
      ? (notiMessage.notiMessage || notiMessage.message || JSON.stringify(notiMessage))
      : String(notiMessage);

    const payload = {
      id: `noti_${Date.now()}`,
      notificationId: memNotifications.length + 101,
      notiMessage: text,
      notiDt: new Date(),
      createdAt: new Date()
    };

    if (isDBConnected()) {
      try {
        const doc = await Notification.create(payload);
        const resObj = doc.toObject ? doc.toObject() : doc;
        memNotifications.unshift(resObj);
        return resObj;
      } catch (err) {
        console.warn('[dataStore] DB createNotification error:', err.message);
      }
    }
    memNotifications.unshift(payload);
    return payload;
  },

  deleteNotification: async (id) => {
    if (isDBConnected()) {
      try {
        await Notification.deleteOne({ id });
      } catch (err) {
        console.warn('[dataStore] DB deleteNotification error:', err.message);
      }
    }
    const idx = memNotifications.findIndex(x => x.id === id);
    if (idx !== -1) memNotifications.splice(idx, 1);
    return true;
  },

  // ==================== ENQUIRIES ====================
  getEnquiries: async () => {
    if (isDBConnected()) {
      try {
        const docs = await Enquiry.find().sort({ createdAt: -1 }).lean();
        if (docs && docs.length > 0) return docs;
      } catch (err) {
        console.warn('[dataStore] DB getEnquiries error:', err.message);
      }
    }
    return memEnquiries;
  },

  createEnquiry: async (enqData) => {
    const payload = {
      id: `enq_${Date.now()}`,
      enquiryId: memEnquiries.length + 1,
      enquiryDt: new Date(),
      createdAt: new Date(),
      ...enqData
    };
    if (isDBConnected()) {
      try {
        const doc = await Enquiry.create(payload);
        const resObj = doc.toObject ? doc.toObject() : doc;
        memEnquiries.unshift(resObj);
        return resObj;
      } catch (err) {
        console.warn('[dataStore] DB createEnquiry error:', err.message);
      }
    }
    memEnquiries.unshift(payload);
    return payload;
  },

  deleteEnquiry: async (id) => {
    if (isDBConnected()) {
      try {
        await Enquiry.deleteOne({ id });
      } catch (err) {
        console.warn('[dataStore] DB deleteEnquiry error:', err.message);
      }
    }
    const idx = memEnquiries.findIndex(x => x.id === id);
    if (idx !== -1) memEnquiries.splice(idx, 1);
    return true;
  },

  // ==================== STUDY MATERIALS ====================
  getStudyMaterials: async () => {
    if (isDBConnected()) {
      try {
        const docs = await StudyMaterial.find().sort({ createdAt: -1 }).lean();
        if (docs && docs.length > 0) return docs;
      } catch (err) {
        console.warn('[dataStore] DB getStudyMaterials error:', err.message);
      }
    }
    return memStudyMaterials;
  },

  createStudyMaterial: async (matData) => {
    const payload = {
      id: `mat_${Date.now()}`,
      materialId: memStudyMaterials.length + 1,
      uploadDt: new Date(),
      createdAt: new Date(),
      fileUrl: matData.fileUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      ...matData
    };
    if (isDBConnected()) {
      try {
        const doc = await StudyMaterial.create(payload);
        const resObj = doc.toObject ? doc.toObject() : doc;
        memStudyMaterials.unshift(resObj);
        return resObj;
      } catch (err) {
        console.warn('[dataStore] DB createStudyMaterial error:', err.message);
      }
    }
    memStudyMaterials.unshift(payload);
    return payload;
  },

  deleteStudyMaterial: async (id) => {
    if (isDBConnected()) {
      try {
        await StudyMaterial.deleteOne({ id });
      } catch (err) {
        console.warn('[dataStore] DB deleteStudyMaterial error:', err.message);
      }
    }
    const idx = memStudyMaterials.findIndex(x => x.id === id);
    if (idx !== -1) memStudyMaterials.splice(idx, 1);
    return true;
  },

  // ==================== ASSIGNMENTS ====================
  getAssignments: async () => {
    if (isDBConnected()) {
      try {
        const docs = await Assignment.find().sort({ createdAt: -1 }).lean();
        if (docs && docs.length > 0) return docs;
      } catch (err) {
        console.warn('[dataStore] DB getAssignments error:', err.message);
      }
    }
    return memAssignments;
  },

  getAssignmentById: async (id) => {
    if (isDBConnected()) {
      try {
        const doc = await Assignment.findOne({ id }).lean();
        if (doc) return doc;
      } catch (err) {
        console.warn('[dataStore] DB getAssignmentById error:', err.message);
      }
    }
    return memAssignments.find(x => x.id === id) || null;
  },

  createAssignment: async (asgData) => {
    const payload = {
      id: asgData.id || `asg_${Date.now()}`,
      createdAt: new Date(),
      ...asgData
    };
    if (isDBConnected()) {
      try {
        const doc = await Assignment.create(payload);
        const resObj = doc.toObject ? doc.toObject() : doc;
        memAssignments.unshift(resObj);
        return resObj;
      } catch (err) {
        console.warn('[dataStore] DB createAssignment error:', err.message);
      }
    }
    memAssignments.unshift(payload);
    return payload;
  },

  deleteAssignment: async (id) => {
    if (isDBConnected()) {
      try {
        await Assignment.deleteOne({ id });
        await Submission.deleteMany({ assignmentId: id });
      } catch (err) {
        console.warn('[dataStore] DB deleteAssignment error:', err.message);
      }
    }
    const idx = memAssignments.findIndex(x => x.id === id);
    if (idx !== -1) memAssignments.splice(idx, 1);
    return true;
  },

  // ==================== SUBMISSIONS ====================
  getSubmissions: async () => {
    if (isDBConnected()) {
      try {
        const docs = await Submission.find().sort({ createdAt: -1 }).lean();
        if (docs && docs.length > 0) return docs;
      } catch (err) {
        console.warn('[dataStore] DB getSubmissions error:', err.message);
      }
    }
    return memSubmissions;
  },

  getSubmissionById: async (id) => {
    if (isDBConnected()) {
      try {
        const doc = await Submission.findOne({ id }).lean();
        if (doc) return doc;
      } catch (err) {
        console.warn('[dataStore] DB getSubmissionById error:', err.message);
      }
    }
    return memSubmissions.find(x => x.id === id) || null;
  },

  getSubmissionsForStudent: async (studentId) => {
    if (isDBConnected()) {
      try {
        const docs = await Submission.find({ studentId }).lean();
        if (docs && docs.length > 0) return docs;
      } catch (err) {
        console.warn('[dataStore] DB getSubmissionsForStudent error:', err.message);
      }
    }
    return memSubmissions.filter(x => x.studentId === studentId);
  },

  getSubmissionsForAssignment: async (assignmentId) => {
    if (isDBConnected()) {
      try {
        const docs = await Submission.find({ assignmentId }).lean();
        if (docs && docs.length > 0) return docs;
      } catch (err) {
        console.warn('[dataStore] DB getSubmissionsForAssignment error:', err.message);
      }
    }
    return memSubmissions.filter(x => x.assignmentId === assignmentId);
  },

  createSubmission: async (subData) => {
    if (isDBConnected()) {
      try {
        const existing = await Submission.findOne({ assignmentId: subData.assignmentId, studentId: subData.studentId });
        if (existing) {
          const updated = await Submission.findOneAndUpdate(
            { _id: existing._id },
            { $set: { ...subData, submittedAt: new Date(), status: 'submitted' } },
            { new: true }
          ).lean();
          return updated;
        }
        const doc = await Submission.create({
          id: `sub_${Date.now()}`,
          submittedAt: new Date(),
          status: 'submitted',
          grade: null,
          feedback: '',
          gradedAt: null,
          gradedBy: null,
          ...subData
        });
        return doc.toObject ? doc.toObject() : doc;
      } catch (err) {
        console.warn('[dataStore] DB createSubmission error:', err.message);
      }
    }
    const idx = memSubmissions.findIndex(s => s.assignmentId === subData.assignmentId && s.studentId === subData.studentId);
    if (idx !== -1) {
      memSubmissions[idx] = { ...memSubmissions[idx], ...subData, submittedAt: new Date(), status: 'submitted' };
      return memSubmissions[idx];
    }
    const payload = {
      id: `sub_${Date.now()}`,
      submittedAt: new Date(),
      status: 'submitted',
      grade: null,
      feedback: '',
      gradedAt: null,
      gradedBy: null,
      ...subData
    };
    memSubmissions.unshift(payload);
    return payload;
  },

  gradeSubmission: async (submissionId, grade, feedback, teacherName) => {
    if (isDBConnected()) {
      try {
        const doc = await Submission.findOneAndUpdate(
          { id: submissionId },
          { $set: { grade: Number(grade), feedback, status: 'graded', gradedAt: new Date(), gradedBy: teacherName } },
          { new: true }
        ).lean();
        if (doc) return doc;
      } catch (err) {
        console.warn('[dataStore] DB gradeSubmission error:', err.message);
      }
    }
    const s = memSubmissions.find(x => x.id === submissionId);
    if (s) {
      s.grade = Number(grade);
      s.feedback = feedback;
      s.status = 'graded';
      s.gradedAt = new Date();
      s.gradedBy = teacherName;
      return s;
    }
    return null;
  },

  // ==================== SUPPORT MESSAGES ====================
  getSupportMessages: async () => {
    if (isDBConnected()) {
      try {
        const docs = await SupportMessage.find().sort({ createdAt: -1 }).lean();
        if (docs && docs.length > 0) return docs;
      } catch (err) {
        console.warn('[dataStore] DB getSupportMessages error:', err.message);
      }
    }
    return memSupportMessages;
  },

  createSupportMessage: async (msgData) => {
    const payload = {
      id: `msg_${Date.now()}`,
      status: 'pending',
      createdAt: new Date(),
      adminReply: '',
      ...msgData
    };
    if (isDBConnected()) {
      try {
        const doc = await SupportMessage.create(payload);
        return doc.toObject ? doc.toObject() : doc;
      } catch (err) {
        console.warn('[dataStore] DB createSupportMessage error:', err.message);
      }
    }
    memSupportMessages.unshift(payload);
    return payload;
  },

  updateSupportMessageStatus: async (id, status, adminReply) => {
    if (isDBConnected()) {
      try {
        const doc = await SupportMessage.findOneAndUpdate(
          { id },
          { $set: { status, adminReply } },
          { new: true }
        ).lean();
        if (doc) return doc;
      } catch (err) {
        console.warn('[dataStore] DB updateSupportMessageStatus error:', err.message);
      }
    }
    const msg = memSupportMessages.find(x => x.id === id);
    if (msg) {
      msg.status = status;
      msg.adminReply = adminReply;
      return msg;
    }
    return null;
  },

  // ==================== FEEDBACK ====================
  getPlatformFeedback: async () => {
    if (isDBConnected()) {
      try {
        const docs = await Feedback.find().sort({ createdAt: -1 }).lean();
        if (docs && docs.length > 0) return docs;
      } catch (err) {
        console.warn('[dataStore] DB getPlatformFeedback error:', err.message);
      }
    }
    return memFeedback;
  },

  createPlatformFeedback: async (fbData) => {
    const payload = {
      id: `fb_${Date.now()}`,
      createdAt: new Date(),
      ...fbData
    };
    if (isDBConnected()) {
      try {
        const doc = await Feedback.create(payload);
        return doc.toObject ? doc.toObject() : doc;
      } catch (err) {
        console.warn('[dataStore] DB createPlatformFeedback error:', err.message);
      }
    }
    memFeedback.unshift(payload);
    return payload;
  },

  // ==================== COURSES ====================
  getCourses: async () => {
    if (isDBConnected()) {
      try {
        const docs = await Course.find().lean();
        if (docs && docs.length > 0) return docs;
      } catch (err) {
        console.warn('[dataStore] DB getCourses error:', err.message);
      }
    }
    return memCourses;
  },

  getCourseById: async (id) => {
    if (isDBConnected()) {
      try {
        const doc = await Course.findOne({ id }).lean();
        if (doc) return doc;
      } catch (err) {
        console.warn('[dataStore] DB getCourseById error:', err.message);
      }
    }
    return memCourses.find(x => x.id === id) || null;
  },

  createCourse: async (courseData) => {
    const payload = {
      id: courseData.id || `course_${Date.now()}`,
      createdAt: new Date(),
      status: 'active',
      ...courseData
    };
    if (isDBConnected()) {
      try {
        const doc = await Course.create(payload);
        return doc.toObject ? doc.toObject() : doc;
      } catch (err) {
        console.warn('[dataStore] DB createCourse error:', err.message);
      }
    }
    memCourses.unshift(payload);
    return payload;
  },

  // ==================== LESSONS ====================
  getLessonsForCourse: async (courseId) => {
    if (isDBConnected()) {
      try {
        const docs = await Lesson.find({ courseId }).sort({ order: 1 }).lean();
        if (docs && docs.length > 0) return docs;
      } catch (err) {
        console.warn('[dataStore] DB getLessonsForCourse error:', err.message);
      }
    }
    return memLessons.filter(l => l.courseId === courseId);
  },

  // ==================== QUIZZES ====================
  getQuizzes: async () => {
    if (isDBConnected()) {
      try {
        const docs = await Quiz.find().lean();
        if (docs && docs.length > 0) return docs;
      } catch (err) {
        console.warn('[dataStore] DB getQuizzes error:', err.message);
      }
    }
    return memQuizzes;
  },

  getQuestionsForQuiz: async (quizId) => {
    if (isDBConnected()) {
      try {
        const docs = await Question.find({ quizId }).lean();
        if (docs && docs.length > 0) return docs;
      } catch (err) {
        console.warn('[dataStore] DB getQuestionsForQuiz error:', err.message);
      }
    }
    return memQuestions.filter(q => q.quizId === quizId);
  },

  saveQuizAttempt: async (attemptData) => {
    if (isDBConnected()) {
      try {
        const doc = await QuizAttempt.create(attemptData);
        return doc.toObject ? doc.toObject() : doc;
      } catch (err) {
        console.warn('[dataStore] DB saveQuizAttempt error:', err.message);
      }
    }
    memQuizAttempts.unshift(attemptData);
    return attemptData;
  },

  getQuizAttempts: async (studentId) => {
    if (isDBConnected()) {
      try {
        const docs = await QuizAttempt.find({ studentId }).sort({ attemptedAt: -1 }).lean();
        if (docs && docs.length > 0) return docs;
      } catch (err) {
        console.warn('[dataStore] DB getQuizAttempts error:', err.message);
      }
    }
    return memQuizAttempts.filter(a => a.studentId === studentId);
  },

  // ==================== NOTES ====================
  getStudentNotes: async (studentId) => {
    if (isDBConnected()) {
      try {
        const docs = await Note.find({ studentId }).sort({ isPinned: -1, updatedAt: -1 }).lean();
        if (docs && docs.length > 0) return docs;
      } catch (err) {
        console.warn('[dataStore] DB getStudentNotes error:', err.message);
      }
    }
    return memNotes.filter(n => n.studentId === studentId);
  },

  createNote: async (noteData) => {
    const payload = { id: `note_${Date.now()}`, createdAt: new Date(), updatedAt: new Date(), ...noteData };
    if (isDBConnected()) {
      try {
        const doc = await Note.create(payload);
        return doc.toObject ? doc.toObject() : doc;
      } catch (err) {
        console.warn('[dataStore] DB createNote error:', err.message);
      }
    }
    memNotes.unshift(payload);
    return payload;
  },

  updateNote: async (noteId, updates) => {
    if (isDBConnected()) {
      try {
        const doc = await Note.findOneAndUpdate({ id: noteId }, { $set: updates }, { new: true }).lean();
        if (doc) return doc;
      } catch (err) {
        console.warn('[dataStore] DB updateNote error:', err.message);
      }
    }
    const idx = memNotes.findIndex(n => n.id === noteId);
    if (idx !== -1) {
      memNotes[idx] = { ...memNotes[idx], ...updates, updatedAt: new Date() };
      return memNotes[idx];
    }
    return null;
  },

  deleteNote: async (noteId) => {
    if (isDBConnected()) {
      try {
        await Note.deleteOne({ id: noteId });
      } catch (err) {
        console.warn('[dataStore] DB deleteNote error:', err.message);
      }
    }
    const idx = memNotes.findIndex(n => n.id === noteId);
    if (idx !== -1) memNotes.splice(idx, 1);
    return true;
  },

  // ==================== BOOKMARKS ====================
  getStudentBookmarks: async (studentId) => {
    if (isDBConnected()) {
      try {
        const docs = await Bookmark.find({ studentId }).lean();
        if (docs && docs.length > 0) return docs;
      } catch (err) {
        console.warn('[dataStore] DB getStudentBookmarks error:', err.message);
      }
    }
    return memBookmarks.filter(b => b.studentId === studentId);
  },

  toggleBookmark: async (studentId, itemType, itemId, title, url) => {
    if (isDBConnected()) {
      try {
        const existing = await Bookmark.findOne({ studentId, itemId });
        if (existing) {
          await Bookmark.deleteOne({ _id: existing._id });
          return { action: 'removed', bookmarked: false };
        }
        const doc = await Bookmark.create({
          id: `bm_${Date.now()}`,
          studentId,
          itemType,
          itemId,
          title,
          url: url || ''
        });
        return { action: 'added', bookmarked: true, bookmark: doc.toObject ? doc.toObject() : doc };
      } catch (err) {
        console.warn('[dataStore] DB toggleBookmark error:', err.message);
      }
    }
    const existingIdx = memBookmarks.findIndex(b => b.studentId === studentId && b.itemId === itemId);
    if (existingIdx !== -1) {
      memBookmarks.splice(existingIdx, 1);
      return { action: 'removed', bookmarked: false };
    }
    const bm = {
      id: `bm_${Date.now()}`,
      studentId,
      itemType,
      itemId,
      title,
      url: url || ''
    };
    memBookmarks.unshift(bm);
    return { action: 'added', bookmarked: true, bookmark: bm };
  },

  deleteBookmark: async (studentId, bookmarkId) => {
    if (isDBConnected()) {
      try {
        await Bookmark.deleteOne({ studentId, id: bookmarkId });
      } catch (err) {
        console.warn('[dataStore] DB deleteBookmark error:', err.message);
      }
    }
    const idx = memBookmarks.findIndex(b => b.studentId === studentId && b.id === bookmarkId);
    if (idx !== -1) memBookmarks.splice(idx, 1);
    return true;
  },

  // ==================== PROGRESS ====================
  getStudentProgress: async (studentId) => {
    if (isDBConnected()) {
      try {
        const docs = await Progress.find({ studentId }).lean();
        if (docs && docs.length > 0) return docs;
      } catch (err) {
        console.warn('[dataStore] DB getStudentProgress error:', err.message);
      }
    }
    return memProgress.filter(p => p.studentId === studentId);
  },

  updateStudentProgress: async (studentId, courseId, updates) => {
    if (isDBConnected()) {
      try {
        const doc = await Progress.findOneAndUpdate(
          { studentId, courseId },
          { $set: updates },
          { new: true, upsert: true }
        ).lean();
        if (doc) return doc;
      } catch (err) {
        console.warn('[dataStore] DB updateStudentProgress error:', err.message);
      }
    }
    const idx = memProgress.findIndex(p => p.studentId === studentId && p.courseId === courseId);
    if (idx !== -1) {
      memProgress[idx] = { ...memProgress[idx], ...updates };
      return memProgress[idx];
    }
    const newProg = { id: `prog_${Date.now()}`, studentId, courseId, ...updates };
    memProgress.push(newProg);
    return newProg;
  },

  // ==================== ENROLLMENT & LESSON COMPLETION ====================
  getEnrollment: async (studentId, courseId) => {
    if (isDBConnected()) {
      try {
        const doc = await Enrollment.findOne({ studentId, courseId }).lean();
        if (doc) return doc;
      } catch (err) {
        console.warn('[dataStore] DB getEnrollment error:', err.message);
      }
    }
    return memEnrollments.find(e => e.studentId === studentId && e.courseId === courseId) || null;
  },

  getStudentEnrollments: async (studentId) => {
    if (isDBConnected()) {
      try {
        const docs = await Enrollment.find({ studentId }).lean();
        if (docs && docs.length > 0) return docs;
      } catch (err) {
        console.warn('[dataStore] DB getStudentEnrollments error:', err.message);
      }
    }
    return memEnrollments.filter(e => e.studentId === studentId);
  },

  enrollStudentInCourse: async (studentId, studentName, courseId, courseTitle) => {
    const existingMem = memEnrollments.find(e => e.studentId === studentId && e.courseId === courseId);
    if (existingMem) return existingMem;

    const payload = {
      id: `enr_${Date.now()}`,
      studentId,
      studentName: studentName || 'Student',
      courseId,
      courseTitle: courseTitle || '',
      enrolledAt: new Date(),
      status: 'enrolled',
      progressPercentage: 0,
      completedLessons: []
    };

    if (isDBConnected()) {
      try {
        const existing = await Enrollment.findOne({ studentId, courseId });
        if (existing) return existing.toObject ? existing.toObject() : existing;

        const doc = await Enrollment.create(payload);
        await Course.updateOne({ id: courseId }, { $inc: { enrolledCount: 1 } });
        await Progress.findOneAndUpdate(
          { studentId, courseId },
          {
            $setOnInsert: {
              id: `prog_${Date.now()}`,
              studentId,
              studentName: studentName || 'Student',
              courseId,
              courseTitle: courseTitle || '',
              completedLessons: [],
              percentage: 0
            }
          },
          { upsert: true }
        );
        memEnrollments.push(payload);
        return doc.toObject ? doc.toObject() : doc;
      } catch (err) {
        console.warn('[dataStore] DB enrollStudent error:', err.message);
      }
    }

    memEnrollments.push(payload);
    return payload;
  },

  completeStudentLesson: async (studentId, studentName, courseId, lessonId) => {
    const lessonsForCourse = memLessons.filter(l => l.courseId === courseId);
    const totalCount = lessonsForCourse.length > 0 ? lessonsForCourse.length : 1;

    let enrollment = memEnrollments.find(e => e.studentId === studentId && e.courseId === courseId);
    if (!enrollment) {
      const course = memCourses.find(c => c.id === courseId);
      enrollment = {
        id: `enr_${Date.now()}`,
        studentId,
        studentName: studentName || 'Student',
        courseId,
        courseTitle: course ? course.title : '',
        enrolledAt: new Date(),
        status: 'enrolled',
        progressPercentage: 0,
        completedLessons: []
      };
      memEnrollments.push(enrollment);
    }

    const completedSet = new Set(enrollment.completedLessons || []);
    completedSet.add(lessonId);
    const completedArray = Array.from(completedSet);
    const progressPercentage = Math.min(100, Math.round((completedArray.length / totalCount) * 100));
    const isFinished = progressPercentage >= 100;

    enrollment.completedLessons = completedArray;
    enrollment.progressPercentage = progressPercentage;
    if (isFinished) {
      enrollment.status = 'completed';
      enrollment.completedAt = new Date();
    }

    if (isDBConnected()) {
      try {
        let dbEnrollment = await Enrollment.findOne({ studentId, courseId });
        if (!dbEnrollment) {
          dbEnrollment = await Enrollment.create(enrollment);
        } else {
          dbEnrollment.completedLessons = completedArray;
          dbEnrollment.progressPercentage = progressPercentage;
          if (isFinished) {
            dbEnrollment.status = 'completed';
            dbEnrollment.completedAt = new Date();
          }
          await dbEnrollment.save();
        }
        await Progress.findOneAndUpdate(
          { studentId, courseId },
          {
            $set: {
              completedLessons: completedArray,
              percentage: progressPercentage,
              lastActiveAt: new Date()
            },
            $inc: { totalStudyMinutes: 20 }
          },
          { upsert: true, new: true }
        );
      } catch (err) {
        console.warn('[dataStore] DB completeStudentLesson error:', err.message);
      }
    }

    return {
      success: true,
      completedLessons: completedArray,
      progressPercentage,
      isFinished
    };
  },

  // ==================== TEACHER QUESTIONS & DOUBTS ====================
  getTeachersList: async () => {
    if (isDBConnected()) {
      try {
        const list = await User.find({ role: { $in: ['teacher', 'superadmin'] } }).lean();
        if (list && list.length > 0) {
          return list.map(t => ({
            id: t.id,
            name: t.name,
            email: t.email,
            department: t.department || 'Academic Faculty',
            subject: t.subject || 'Coursework Instructor',
            userpic: t.userpic || 'default.jpg'
          }));
        }
      } catch (err) {
        console.warn('[dataStore] DB getTeachersList error:', err.message);
      }
    }
    return memUsers.filter(u => u.role === 'teacher' || u.role === 'superadmin').map(t => ({
      id: t.id,
      name: t.name,
      email: t.email,
      department: t.department || 'Academic Faculty',
      subject: t.subject || 'Coursework Instructor',
      userpic: t.userpic || 'default.jpg'
    }));
  },

  getTeacherQuestionsForStudent: async (studentId) => {
    if (isDBConnected()) {
      try {
        const docs = await TeacherQuestion.find({ studentId }).sort({ createdAt: -1 }).lean();
        if (docs && docs.length > 0) return docs;
      } catch (err) {
        console.warn('[dataStore] DB getTeacherQuestionsForStudent error:', err.message);
      }
    }
    return memTeacherQuestions.filter(q => q.studentId === studentId);
  },

  getTeacherQuestionsForTeacher: async (teacherId) => {
    if (isDBConnected()) {
      try {
        const docs = await TeacherQuestion.find({ teacherId }).sort({ createdAt: -1 }).lean();
        if (docs && docs.length > 0) return docs;
      } catch (err) {
        console.warn('[dataStore] DB getTeacherQuestionsForTeacher error:', err.message);
      }
    }
    return memTeacherQuestions.filter(q => q.teacherId === teacherId);
  },

  createTeacherQuestion: async (data) => {
    const payload = {
      id: `tq_${Date.now()}`,
      status: 'pending',
      teacherReply: '',
      repliedAt: null,
      createdAt: new Date(),
      ...data
    };
    if (isDBConnected()) {
      try {
        const doc = await TeacherQuestion.create(payload);
        return doc.toObject ? doc.toObject() : doc;
      } catch (err) {
        console.warn('[dataStore] DB createTeacherQuestion error:', err.message);
      }
    }
    memTeacherQuestions.unshift(payload);
    return payload;
  },

  replyTeacherQuestion: async (id, replyText, teacherId) => {
    const updates = {
      teacherReply: replyText,
      status: 'answered',
      repliedAt: new Date()
    };
    if (isDBConnected()) {
      try {
        const doc = await TeacherQuestion.findOneAndUpdate(
          { id, ...(teacherId ? { teacherId } : {}) },
          { $set: updates },
          { new: true }
        ).lean();
        if (doc) return doc;
      } catch (err) {
        console.warn('[dataStore] DB replyTeacherQuestion error:', err.message);
      }
    }
    const q = memTeacherQuestions.find(x => x.id === id);
    if (q) {
      q.teacherReply = replyText;
      q.status = 'answered';
      q.repliedAt = new Date();
      return q;
    }
    return null;
  },

  adminReplyTeacherQuestion: async (id, replyText, adminName = 'Platform Administrator') => {
    const updates = {
      teacherReply: `[Admin Resolution - ${adminName}]: ${replyText}`,
      status: 'answered',
      repliedAt: new Date()
    };
    if (isDBConnected()) {
      try {
        const doc = await TeacherQuestion.findOneAndUpdate(
          { id },
          { $set: updates },
          { new: true }
        ).lean();
        if (doc) return doc;
      } catch (err) {
        console.warn('[dataStore] DB adminReplyTeacherQuestion error:', err.message);
      }
    }
    const q = memTeacherQuestions.find(x => x.id === id);
    if (q) {
      q.teacherReply = updates.teacherReply;
      q.status = 'answered';
      q.repliedAt = new Date();
      return q;
    }
    return null;
  },

  getAllTeacherQuestions: async () => {
    if (isDBConnected()) {
      try {
        const docs = await TeacherQuestion.find().sort({ createdAt: -1 }).lean();
        if (docs && docs.length > 0) return docs;
      } catch (err) {
        console.warn('[dataStore] DB getAllTeacherQuestions error:', err.message);
      }
    }
    return memTeacherQuestions;
  },

  getAllQuizAttempts: async () => {
    if (isDBConnected()) {
      try {
        const docs = await QuizAttempt.find().sort({ attemptedAt: -1 }).lean();
        if (docs && docs.length > 0) return docs;
      } catch (err) {
        console.warn('[dataStore] DB getAllQuizAttempts error:', err.message);
      }
    }
    return memQuizAttempts;
  },

  getAllQuestions: async () => {
    if (isDBConnected()) {
      try {
        const docs = await Question.find().lean();
        if (docs && docs.length > 0) return docs;
      } catch (err) {
        console.warn('[dataStore] DB getAllQuestions error:', err.message);
      }
    }
    return memQuestions;
  },

  getAllLessons: async () => {
    if (isDBConnected()) {
      try {
        const docs = await Lesson.find().lean();
        if (docs && docs.length > 0) return docs;
      } catch (err) {
        console.warn('[dataStore] DB getAllLessons error:', err.message);
      }
    }
    return memLessons;
  },

  getAllNotes: async () => {
    if (isDBConnected()) {
      try {
        const docs = await Note.find().lean();
        if (docs && docs.length > 0) return docs;
      } catch (err) {
        console.warn('[dataStore] DB getAllNotes error:', err.message);
      }
    }
    return memNotes;
  },

  getAllBookmarks: async () => {
    if (isDBConnected()) {
      try {
        const docs = await Bookmark.find().lean();
        if (docs && docs.length > 0) return docs;
      } catch (err) {
        console.warn('[dataStore] DB getAllBookmarks error:', err.message);
      }
    }
    return memBookmarks;
  },

  getAllProgress: async () => {
    if (isDBConnected()) {
      try {
        const docs = await Progress.find().lean();
        if (docs && docs.length > 0) return docs;
      } catch (err) {
        console.warn('[dataStore] DB getAllProgress error:', err.message);
      }
    }
    return memProgress;
  },

  toggleUserStatus: async (id, status) => {
    return await dataStore.updateUser(id, { status });
  }
};
