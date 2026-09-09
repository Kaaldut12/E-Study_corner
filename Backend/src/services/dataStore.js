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
  seedFeedback
} from '../../seed.js';

// Initial Memory Store Seed Fallback
let users = [...seedUsers];
let courses = [...seedCourses];
let lessons = [...seedLessons];
let quizzes = [...seedQuizzes];
let questions = [...seedQuestions];
let quizAttempts = [...seedQuizAttempts];
let notes = [...seedNotes];
let bookmarks = [...seedBookmarks];
let progressList = [...seedProgress];
let notifications = [...seedNotifications];
let enquiries = [...seedEnquiries];
let studyMaterials = [...seedStudyMaterials];
let assignments = [...seedAssignments];
let submissions = [...seedSubmissions];
let supportMessages = [...seedSupportMessages];
let platformFeedback = [...seedFeedback];

const isDBConnected = () => mongoose.connection.readyState === 1;

export const dataStore = {
  // --- USERS ---
  getUsers: async () => {
    let list;
    if (isDBConnected()) {
      list = await User.find().lean();
    } else {
      list = users;
    }
    return list.map(u => ({
      ...u,
      permissions: (u.permissions && u.permissions.length > 0) ? u.permissions : getDefaultPermissions(u.role)
    }));
  },
  getUserById: async (id) => {
    let u;
    if (isDBConnected()) {
      u = await User.findOne({ id }).lean();
    } else {
      u = users.find(x => x.id === id);
    }
    if (!u) return null;
    return {
      ...u,
      permissions: (u.permissions && u.permissions.length > 0) ? u.permissions : getDefaultPermissions(u.role)
    };
  },
  getUserByEmail: async (email) => {
    let u;
    if (isDBConnected()) {
      u = await User.findOne({ email: email.toLowerCase() }).lean();
    } else {
      u = users.find(x => x.email.toLowerCase() === email.toLowerCase());
    }
    if (!u) return null;
    return {
      ...u,
      permissions: (u.permissions && u.permissions.length > 0) ? u.permissions : getDefaultPermissions(u.role)
    };
  },
  createUser: async (userData) => {
    const newId = `user_${Date.now()}`;
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
      const doc = await User.create(payload);
      const resObj = doc.toObject();
      return {
        ...resObj,
        permissions: (resObj.permissions && resObj.permissions.length > 0) ? resObj.permissions : permissions
      };
    }

    users.push(payload);
    return payload;
  },
  updateUser: async (id, updates) => {
    if (isDBConnected()) {
      const doc = await User.findOneAndUpdate({ id }, { $set: updates }, { new: true }).lean();
      if (!doc) return null;
      return {
        ...doc,
        permissions: (doc.permissions && doc.permissions.length > 0) ? doc.permissions : getDefaultPermissions(doc.role)
      };
    }
    const idx = users.findIndex(u => u.id === id);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...updates };
      return users[idx];
    }
    return null;
  },
  setResetOTP: async (email, resetCode) => {
    const expires = Date.now() + 15 * 60 * 1000;
    if (isDBConnected()) {
      return await User.findOneAndUpdate(
        { email: email.toLowerCase() },
        { $set: { resetCode, resetExpires: expires } },
        { new: true }
      ).lean();
    }
    const u = users.find(x => x.email.toLowerCase() === email.toLowerCase());
    if (u) {
      u.resetCode = resetCode;
      u.resetExpires = expires;
      return u;
    }
    return null;
  },
  confirmResetOTP: async (email, resetCode, newPassword) => {
    const user = isDBConnected()
      ? await User.findOne({ email: email.toLowerCase() }).lean()
      : users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) return { success: false, message: 'No account found with this email.' };
    if (!user.resetCode || user.resetCode !== resetCode) {
      return { success: false, message: 'Invalid 6-digit OTP reset code.' };
    }
    if (Date.now() > user.resetExpires) {
      return { success: false, message: 'OTP code has expired. Please request a new one.' };
    }

    if (isDBConnected()) {
      await User.updateOne(
        { email: email.toLowerCase() },
        { $set: { password: hashPassword(newPassword), resetCode: null, resetExpires: null } }
      );
    } else {
      user.password = hashPassword(newPassword);
      user.resetCode = null;
      user.resetExpires = null;
    }

    return { success: true, message: 'Password reset successfully! You can now log in with your new password.' };
  },
  changeUserPassword: async (id, currentPass, newPass) => {
    const user = isDBConnected()
      ? await User.findOne({ id }).lean()
      : users.find(u => u.id === id);

    if (!user) return { success: false, message: 'User not found' };
    if (!verifyPassword(currentPass, user.password)) return { success: false, message: 'Current password is incorrect' };

    if (isDBConnected()) {
      await User.updateOne({ id }, { $set: { password: hashPassword(newPass) } });
    } else {
      user.password = hashPassword(newPass);
    }

    return { success: true, message: 'Password updated successfully' };
  },
  deleteUser: async (id) => {
    if (isDBConnected()) {
      const res = await User.deleteOne({ id });
      return res.deletedCount > 0;
    }
    const initialLen = users.length;
    users = users.filter(u => u.id !== id);
    return users.length < initialLen;
  },

  // --- NOTIFICATIONS ---
  getNotifications: async () => {
    if (isDBConnected()) return await Notification.find().sort({ createdAt: -1 }).lean();
    return notifications;
  },
  createNotification: async (notiMessage) => {
    const payload = {
      id: `noti_${Date.now()}`,
      notificationId: notifications.length + 101,
      notiMessage,
      notiDt: new Date()
    };
    if (isDBConnected()) {
      const doc = await Notification.create(payload);
      return doc.toObject();
    }
    notifications.unshift(payload);
    return payload;
  },
  deleteNotification: async (id) => {
    if (isDBConnected()) {
      await Notification.deleteOne({ id });
      return true;
    }
    notifications = notifications.filter(n => n.id !== id);
    return true;
  },

  // --- ENQUIRIES ---
  getEnquiries: async () => {
    if (isDBConnected()) return await Enquiry.find().sort({ createdAt: -1 }).lean();
    return enquiries;
  },
  createEnquiry: async (enqData) => {
    const payload = {
      id: `enq_${Date.now()}`,
      enquiryId: enquiries.length + 1,
      enquiryDt: new Date(),
      ...enqData
    };
    if (isDBConnected()) {
      const doc = await Enquiry.create(payload);
      return doc.toObject();
    }
    enquiries.unshift(payload);
    return payload;
  },
  deleteEnquiry: async (id) => {
    if (isDBConnected()) {
      await Enquiry.deleteOne({ id });
      return true;
    }
    enquiries = enquiries.filter(e => e.id !== id);
    return true;
  },

  // --- STUDY MATERIALS ---
  getStudyMaterials: async () => {
    if (isDBConnected()) return await StudyMaterial.find().sort({ createdAt: -1 }).lean();
    return studyMaterials;
  },
  createStudyMaterial: async (matData) => {
    const payload = {
      id: `mat_${Date.now()}`,
      materialId: studyMaterials.length + 1,
      uploadDt: new Date(),
      fileUrl: matData.fileUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      ...matData
    };
    if (isDBConnected()) {
      const doc = await StudyMaterial.create(payload);
      return doc.toObject();
    }
    studyMaterials.unshift(payload);
    return payload;
  },
  deleteStudyMaterial: async (id) => {
    if (isDBConnected()) {
      await StudyMaterial.deleteOne({ id });
      return true;
    }
    studyMaterials = studyMaterials.filter(m => m.id !== id);
    return true;
  },

  // --- ASSIGNMENTS ---
  getAssignments: async () => {
    if (isDBConnected()) return await Assignment.find().sort({ createdAt: -1 }).lean();
    return assignments;
  },
  getAssignmentById: async (id) => {
    if (isDBConnected()) return await Assignment.findOne({ id }).lean();
    return assignments.find(a => a.id === id);
  },
  createAssignment: async (asgData) => {
    const payload = {
      id: `asg_${Date.now()}`,
      createdAt: new Date(),
      ...asgData
    };
    if (isDBConnected()) {
      const doc = await Assignment.create(payload);
      return doc.toObject();
    }
    assignments.push(payload);
    return payload;
  },
  deleteAssignment: async (id) => {
    if (isDBConnected()) {
      await Assignment.deleteOne({ id });
      await Submission.deleteMany({ assignmentId: id });
      return true;
    }
    assignments = assignments.filter(a => a.id !== id);
    submissions = submissions.filter(s => s.assignmentId !== id);
    return true;
  },

  // --- SUBMISSIONS ---
  getSubmissions: async () => {
    if (isDBConnected()) return await Submission.find().sort({ createdAt: -1 }).lean();
    return submissions;
  },
  getSubmissionById: async (id) => {
    if (isDBConnected()) return await Submission.findOne({ id }).lean();
    return submissions.find(s => s.id === id);
  },
  getSubmissionsForStudent: async (studentId) => {
    if (isDBConnected()) return await Submission.find({ studentId }).lean();
    return submissions.filter(s => s.studentId === studentId);
  },
  getSubmissionsForAssignment: async (assignmentId) => {
    if (isDBConnected()) return await Submission.find({ assignmentId }).lean();
    return submissions.filter(s => s.assignmentId === assignmentId);
  },
  createSubmission: async (subData) => {
    if (isDBConnected()) {
      const existing = await Submission.findOne({ assignmentId: subData.assignmentId, studentId: subData.studentId });
      if (existing) {
        return await Submission.findOneAndUpdate(
          { _id: existing._id },
          { $set: { ...subData, submittedAt: new Date(), status: 'submitted' } },
          { new: true }
        ).lean();
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
      const doc = await Submission.create(payload);
      return doc.toObject();
    }

    const existingIdx = submissions.findIndex(s => s.assignmentId === subData.assignmentId && s.studentId === subData.studentId);
    if (existingIdx !== -1) {
      submissions[existingIdx] = { ...submissions[existingIdx], ...subData, submittedAt: new Date().toISOString(), status: 'submitted' };
      return submissions[existingIdx];
    }
    const newSub = {
      id: `sub_${Date.now()}`,
      submittedAt: new Date().toISOString(),
      status: 'submitted',
      grade: null,
      feedback: '',
      gradedAt: null,
      gradedBy: null,
      ...subData
    };
    submissions.push(newSub);
    return newSub;
  },
  gradeSubmission: async (submissionId, grade, feedback, teacherName) => {
    if (isDBConnected()) {
      return await Submission.findOneAndUpdate(
        { id: submissionId },
        { $set: { grade: Number(grade), feedback, status: 'graded', gradedAt: new Date(), gradedBy: teacherName } },
        { new: true }
      ).lean();
    }
    const sub = submissions.find(s => s.id === submissionId);
    if (sub) {
      sub.grade = Number(grade);
      sub.feedback = feedback;
      sub.status = 'graded';
      sub.gradedAt = new Date().toISOString();
      sub.gradedBy = teacherName;
      return sub;
    }
    return null;
  },

  // --- SUPPORT MESSAGES ---
  getSupportMessages: async () => {
    if (isDBConnected()) return await SupportMessage.find().sort({ createdAt: -1 }).lean();
    return supportMessages;
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
      const doc = await SupportMessage.create(payload);
      return doc.toObject();
    }
    supportMessages.push(payload);
    return payload;
  },
  updateSupportMessageStatus: async (id, status, adminReply) => {
    if (isDBConnected()) {
      return await SupportMessage.findOneAndUpdate(
        { id },
        { $set: { status, adminReply } },
        { new: true }
      ).lean();
    }
    const msg = supportMessages.find(m => m.id === id);
    if (msg) {
      msg.status = status;
      if (adminReply !== undefined) msg.adminReply = adminReply;
      return msg;
    }
    return null;
  },

  // --- FEEDBACK ---
  getPlatformFeedback: async () => {
    if (isDBConnected()) return await Feedback.find().sort({ createdAt: -1 }).lean();
    return platformFeedback;
  },
  createPlatformFeedback: async (fbData) => {
    const payload = {
      id: `fb_${Date.now()}`,
      createdAt: new Date(),
      ...fbData
    };
    if (isDBConnected()) {
      const doc = await Feedback.create(payload);
      return doc.toObject();
    }
    platformFeedback.push(payload);
    return payload;
  },

  // --- COURSES ---
  getCourses: async () => {
    if (isDBConnected()) return await Course.find().lean();
    return courses;
  },
  createCourse: async (courseData) => {
    const payload = {
      id: `course_${Date.now()}`,
      createdAt: new Date(),
      status: 'active',
      ...courseData
    };
    if (isDBConnected()) {
      const doc = await Course.create(payload);
      return doc.toObject();
    }
    courses.unshift(payload);
    return payload;
  },

  // --- LESSONS ---
  getLessonsForCourse: async (courseId) => {
    if (isDBConnected()) return await Lesson.find({ courseId }).sort({ lessonOrder: 1 }).lean();
    return lessons.filter(l => l.courseId === courseId);
  },

  // --- QUIZZES ---
  getQuizzes: async () => {
    if (isDBConnected()) return await Quiz.find().lean();
    return quizzes;
  },
  getQuestionsForQuiz: async (quizId) => {
    if (isDBConnected()) return await Question.find({ quizId }).lean();
    return questions.filter(q => q.quizId === quizId);
  },
  saveQuizAttempt: async (attemptData) => {
    if (isDBConnected()) {
      const doc = await QuizAttempt.create(attemptData);
      return doc.toObject();
    }
    quizAttempts.unshift(attemptData);
    return attemptData;
  },
  getQuizAttempts: async (studentId) => {
    if (isDBConnected()) {
      return await QuizAttempt.find({ studentId }).sort({ attemptedAt: -1 }).lean();
    }
    return quizAttempts.filter(a => a.studentId === studentId);
  },

  // --- NOTES ---
  getStudentNotes: async (studentId) => {
    if (isDBConnected()) return await Note.find({ studentId }).sort({ isPinned: -1, updatedAt: -1 }).lean();
    return notes.filter(n => n.studentId === studentId);
  },
  createNote: async (noteData) => {
    if (isDBConnected()) {
      const doc = await Note.create(noteData);
      return doc.toObject();
    }
    notes.unshift(noteData);
    return noteData;
  },
  updateNote: async (noteId, updates) => {
    if (isDBConnected()) {
      return await Note.findOneAndUpdate({ id: noteId }, { $set: updates }, { new: true }).lean();
    }
    const idx = notes.findIndex(n => n.id === noteId);
    if (idx !== -1) {
      notes[idx] = { ...notes[idx], ...updates };
      return notes[idx];
    }
    return null;
  },
  deleteNote: async (noteId) => {
    if (isDBConnected()) {
      await Note.deleteOne({ id: noteId });
      return true;
    }
    notes = notes.filter(n => n.id !== noteId);
    return true;
  },

  // --- BOOKMARKS ---
  getStudentBookmarks: async (studentId) => {
    if (isDBConnected()) return await Bookmark.find({ studentId }).lean();
    return bookmarks.filter(b => b.studentId === studentId);
  },
  toggleBookmark: async (studentId, itemType, itemId, title, url) => {
    if (isDBConnected()) {
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
      return { action: 'added', bookmarked: true, bookmark: doc.toObject() };
    }
    const existingIdx = bookmarks.findIndex(b => b.studentId === studentId && b.itemId === itemId);
    if (existingIdx !== -1) {
      bookmarks.splice(existingIdx, 1);
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
    bookmarks.unshift(bm);
    return { action: 'added', bookmarked: true, bookmark: bm };
  },
  deleteBookmark: async (studentId, bookmarkId) => {
    if (isDBConnected()) {
      await Bookmark.deleteOne({ studentId, id: bookmarkId });
      return true;
    }
    bookmarks = bookmarks.filter(b => !(b.studentId === studentId && b.id === bookmarkId));
    return true;
  },

  // --- PROGRESS ---
  getStudentProgress: async (studentId) => {
    if (isDBConnected()) return await Progress.find({ studentId }).lean();
    return progressList.filter(p => p.studentId === studentId);
  },
  updateStudentProgress: async (studentId, courseId, updates) => {
    if (isDBConnected()) {
      return await Progress.findOneAndUpdate(
        { studentId, courseId },
        { $set: updates },
        { new: true, upsert: true }
      ).lean();
    }
    const idx = progressList.findIndex(p => p.studentId === studentId && p.courseId === courseId);
    if (idx !== -1) {
      progressList[idx] = { ...progressList[idx], ...updates };
      return progressList[idx];
    }
    const newProg = { id: `prog_${Date.now()}`, studentId, courseId, ...updates };
    progressList.push(newProg);
    return newProg;
  }
};
