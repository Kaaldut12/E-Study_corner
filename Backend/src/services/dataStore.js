// backend/src/services/dataStore.js
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

export const dataStore = {
  // ==================== USERS ====================
  getUsers: async () => {
    const list = await User.find().lean();
    return list.map(u => ({
      ...u,
      permissions: (u.permissions && u.permissions.length > 0) ? u.permissions : getDefaultPermissions(u.role)
    }));
  },

  getUserById: async (id) => {
    const u = await User.findOne({ id }).lean();
    if (!u) return null;
    return {
      ...u,
      permissions: (u.permissions && u.permissions.length > 0) ? u.permissions : getDefaultPermissions(u.role)
    };
  },

  getUserByEmail: async (email) => {
    if (!email) return null;
    const u = await User.findOne({ email: email.toLowerCase() }).lean();
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

    const doc = await User.create(payload);
    const resObj = doc.toObject ? doc.toObject() : doc;
    return {
      ...resObj,
      permissions: (resObj.permissions && resObj.permissions.length > 0) ? resObj.permissions : permissions
    };
  },

  updateUser: async (id, updates) => {
    const doc = await User.findOneAndUpdate({ id }, { $set: updates }, { new: true }).lean();
    if (!doc) return null;
    return {
      ...doc,
      permissions: (doc.permissions && doc.permissions.length > 0) ? doc.permissions : getDefaultPermissions(doc.role)
    };
  },

  setResetOTP: async (email, resetCode) => {
    const expires = Date.now() + 15 * 60 * 1000;
    return await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { $set: { resetCode, resetExpires: expires } },
      { new: true }
    ).lean();
  },

  confirmResetOTP: async (email, resetCode, newPassword) => {
    const user = await User.findOne({ email: email.toLowerCase() }).lean();
    if (!user) return { success: false, message: 'No account found with this email.' };
    if (!user.resetCode || user.resetCode !== resetCode) {
      return { success: false, message: 'Invalid 6-digit OTP reset code.' };
    }
    if (Date.now() > user.resetExpires) {
      return { success: false, message: 'OTP code has expired. Please request a new one.' };
    }

    await User.updateOne(
      { email: email.toLowerCase() },
      { $set: { password: hashPassword(newPassword), resetCode: null, resetExpires: null } }
    );

    return { success: true, message: 'Password reset successfully! You can now log in with your new password.' };
  },

  changeUserPassword: async (id, currentPass, newPass) => {
    const user = await User.findOne({ id }).lean();
    if (!user) return { success: false, message: 'User not found' };
    if (!verifyPassword(currentPass, user.password)) return { success: false, message: 'Current password is incorrect' };

    await User.updateOne({ id }, { $set: { password: hashPassword(newPass) } });
    return { success: true, message: 'Password updated successfully' };
  },

  deleteUser: async (id) => {
    const res = await User.deleteOne({ id });
    return res.deletedCount > 0;
  },

  // ==================== NOTIFICATIONS ====================
  getNotifications: async () => {
    return await Notification.find().sort({ createdAt: -1 }).lean();
  },

  createNotification: async (notiMessage) => {
    const text = typeof notiMessage === 'object' && notiMessage !== null
      ? (notiMessage.notiMessage || notiMessage.message || JSON.stringify(notiMessage))
      : String(notiMessage);

    const count = await Notification.countDocuments();
    const payload = {
      id: `noti_${Date.now()}`,
      notificationId: count + 101,
      notiMessage: text,
      notiDt: new Date()
    };
    const doc = await Notification.create(payload);
    return doc.toObject();
  },

  deleteNotification: async (id) => {
    await Notification.deleteOne({ id });
    return true;
  },

  // ==================== ENQUIRIES ====================
  getEnquiries: async () => {
    return await Enquiry.find().sort({ createdAt: -1 }).lean();
  },

  createEnquiry: async (enqData) => {
    const count = await Enquiry.countDocuments();
    const payload = {
      id: `enq_${Date.now()}`,
      enquiryId: count + 1,
      enquiryDt: new Date(),
      ...enqData
    };
    const doc = await Enquiry.create(payload);
    return doc.toObject();
  },

  deleteEnquiry: async (id) => {
    await Enquiry.deleteOne({ id });
    return true;
  },

  // ==================== STUDY MATERIALS ====================
  getStudyMaterials: async () => {
    return await StudyMaterial.find().sort({ createdAt: -1 }).lean();
  },

  createStudyMaterial: async (matData) => {
    const count = await StudyMaterial.countDocuments();
    const payload = {
      id: `mat_${Date.now()}`,
      materialId: count + 1,
      uploadDt: new Date(),
      fileUrl: matData.fileUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      ...matData
    };
    const doc = await StudyMaterial.create(payload);
    return doc.toObject();
  },

  deleteStudyMaterial: async (id) => {
    await StudyMaterial.deleteOne({ id });
    return true;
  },

  // ==================== ASSIGNMENTS ====================
  getAssignments: async () => {
    return await Assignment.find().sort({ createdAt: -1 }).lean();
  },

  getAssignmentById: async (id) => {
    return await Assignment.findOne({ id }).lean();
  },

  createAssignment: async (asgData) => {
    const payload = {
      id: asgData.id || `asg_${Date.now()}`,
      createdAt: new Date(),
      ...asgData
    };
    const doc = await Assignment.create(payload);
    return doc.toObject();
  },

  deleteAssignment: async (id) => {
    await Assignment.deleteOne({ id });
    await Submission.deleteMany({ assignmentId: id });
    return true;
  },

  // ==================== SUBMISSIONS ====================
  getSubmissions: async () => {
    return await Submission.find().sort({ createdAt: -1 }).lean();
  },

  getSubmissionById: async (id) => {
    return await Submission.findOne({ id }).lean();
  },

  getSubmissionsForStudent: async (studentId) => {
    return await Submission.find({ studentId }).lean();
  },

  getSubmissionsForAssignment: async (assignmentId) => {
    return await Submission.find({ assignmentId }).lean();
  },

  createSubmission: async (subData) => {
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
  },

  gradeSubmission: async (submissionId, grade, feedback, teacherName) => {
    return await Submission.findOneAndUpdate(
      { id: submissionId },
      { $set: { grade: Number(grade), feedback, status: 'graded', gradedAt: new Date(), gradedBy: teacherName } },
      { new: true }
    ).lean();
  },

  // ==================== SUPPORT MESSAGES ====================
  getSupportMessages: async () => {
    return await SupportMessage.find().sort({ createdAt: -1 }).lean();
  },

  createSupportMessage: async (msgData) => {
    const payload = {
      id: `msg_${Date.now()}`,
      status: 'pending',
      createdAt: new Date(),
      adminReply: '',
      ...msgData
    };
    const doc = await SupportMessage.create(payload);
    return doc.toObject();
  },

  updateSupportMessageStatus: async (id, status, adminReply) => {
    return await SupportMessage.findOneAndUpdate(
      { id },
      { $set: { status, adminReply } },
      { new: true }
    ).lean();
  },

  // ==================== FEEDBACK ====================
  getPlatformFeedback: async () => {
    return await Feedback.find().sort({ createdAt: -1 }).lean();
  },

  createPlatformFeedback: async (fbData) => {
    const payload = {
      id: `fb_${Date.now()}`,
      createdAt: new Date(),
      ...fbData
    };
    const doc = await Feedback.create(payload);
    return doc.toObject();
  },

  // ==================== COURSES ====================
  getCourses: async () => {
    return await Course.find().lean();
  },

  getCourseById: async (id) => {
    return await Course.findOne({ id }).lean();
  },

  createCourse: async (courseData) => {
    const payload = {
      id: courseData.id || `course_${Date.now()}`,
      createdAt: new Date(),
      status: 'active',
      ...courseData
    };
    const doc = await Course.create(payload);
    return doc.toObject();
  },

  // ==================== LESSONS ====================
  getLessonsForCourse: async (courseId) => {
    return await Lesson.find({ courseId }).sort({ lessonOrder: 1 }).lean();
  },

  // ==================== QUIZZES ====================
  getQuizzes: async () => {
    return await Quiz.find().lean();
  },

  getQuestionsForQuiz: async (quizId) => {
    return await Question.find({ quizId }).lean();
  },

  saveQuizAttempt: async (attemptData) => {
    const doc = await QuizAttempt.create(attemptData);
    return doc.toObject ? doc.toObject() : doc;
  },

  getQuizAttempts: async (studentId) => {
    return await QuizAttempt.find({ studentId }).sort({ attemptedAt: -1 }).lean();
  },

  // ==================== NOTES ====================
  getStudentNotes: async (studentId) => {
    return await Note.find({ studentId }).sort({ isPinned: -1, updatedAt: -1 }).lean();
  },

  createNote: async (noteData) => {
    const doc = await Note.create(noteData);
    return doc.toObject ? doc.toObject() : doc;
  },

  updateNote: async (noteId, updates) => {
    return await Note.findOneAndUpdate({ id: noteId }, { $set: updates }, { new: true }).lean();
  },

  deleteNote: async (noteId) => {
    await Note.deleteOne({ id: noteId });
    return true;
  },

  // ==================== BOOKMARKS ====================
  getStudentBookmarks: async (studentId) => {
    return await Bookmark.find({ studentId }).lean();
  },

  toggleBookmark: async (studentId, itemType, itemId, title, url) => {
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
  },

  deleteBookmark: async (studentId, bookmarkId) => {
    await Bookmark.deleteOne({ studentId, id: bookmarkId });
    return true;
  },

  // ==================== PROGRESS ====================
  getStudentProgress: async (studentId) => {
    return await Progress.find({ studentId }).lean();
  },

  updateStudentProgress: async (studentId, courseId, updates) => {
    return await Progress.findOneAndUpdate(
      { studentId, courseId },
      { $set: updates },
      { new: true, upsert: true }
    ).lean();
  },

  // ==================== ENROLLMENT & LESSON COMPLETION ====================
  getEnrollment: async (studentId, courseId) => {
    return await Enrollment.findOne({ studentId, courseId }).lean();
  },

  getStudentEnrollments: async (studentId) => {
    return await Enrollment.find({ studentId }).lean();
  },

  enrollStudentInCourse: async (studentId, studentName, courseId, courseTitle) => {
    const existing = await Enrollment.findOne({ studentId, courseId });
    if (existing) {
      return existing.toObject ? existing.toObject() : existing;
    }

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

    const doc = await Enrollment.create(payload);

    // Increment enrolledCount on Course
    await Course.updateOne({ id: courseId }, { $inc: { enrolledCount: 1 } });

    // Ensure Progress record exists
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

    return doc.toObject ? doc.toObject() : doc;
  },

  completeStudentLesson: async (studentId, studentName, courseId, lessonId) => {
    // 1. Fetch total lessons in this course
    const totalLessons = await Lesson.countDocuments({ courseId });
    const totalCount = totalLessons > 0 ? totalLessons : 1;

    // 2. Find or create enrollment
    let enrollment = await Enrollment.findOne({ studentId, courseId });
    if (!enrollment) {
      const course = await Course.findOne({ id: courseId }).lean();
      enrollment = await Enrollment.create({
        id: `enr_${Date.now()}`,
        studentId,
        studentName: studentName || 'Student',
        courseId,
        courseTitle: course ? course.title : '',
        enrolledAt: new Date(),
        status: 'enrolled',
        progressPercentage: 0,
        completedLessons: []
      });
      await Course.updateOne({ id: courseId }, { $inc: { enrolledCount: 1 } });
    }

    // 3. Add lessonId if not already completed
    const completedSet = new Set(enrollment.completedLessons || []);
    completedSet.add(lessonId);
    const completedArray = Array.from(completedSet);

    // 4. Calculate real percentage
    const progressPercentage = Math.min(100, Math.round((completedArray.length / totalCount) * 100));
    const isFinished = progressPercentage >= 100;

    enrollment.completedLessons = completedArray;
    enrollment.progressPercentage = progressPercentage;
    if (isFinished) {
      enrollment.status = 'completed';
      enrollment.completedAt = new Date();
    }
    await enrollment.save();

    // 5. Update Progress record synchronously
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

    return {
      success: true,
      completedLessons: completedArray,
      progressPercentage,
      isFinished
    };
  },

  // ==================== TEACHER QUESTIONS & DOUBTS ====================
  getTeachersList: async () => {
    const list = await User.find({ role: { $in: ['teacher', 'superadmin'] } }).lean();
    return list.map(t => ({
      id: t.id,
      name: t.name,
      email: t.email,
      department: t.department || 'Academic Faculty',
      subject: t.subject || 'Coursework Instructor',
      userpic: t.userpic || 'default.jpg'
    }));
  },

  getTeacherQuestionsForStudent: async (studentId) => {
    return await TeacherQuestion.find({ studentId }).sort({ createdAt: -1 }).lean();
  },

  getTeacherQuestionsForTeacher: async (teacherId) => {
    return await TeacherQuestion.find({ teacherId }).sort({ createdAt: -1 }).lean();
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
    const doc = await TeacherQuestion.create(payload);
    return doc.toObject ? doc.toObject() : doc;
  },

  replyTeacherQuestion: async (id, replyText, teacherId) => {
    const updates = {
      teacherReply: replyText,
      status: 'answered',
      repliedAt: new Date()
    };
    return await TeacherQuestion.findOneAndUpdate(
      { id, ...(teacherId ? { teacherId } : {}) },
      { $set: updates },
      { new: true }
    ).lean();
  },

  adminReplyTeacherQuestion: async (id, replyText, adminName = 'Platform Administrator') => {
    const updates = {
      teacherReply: `[Admin Resolution - ${adminName}]: ${replyText}`,
      status: 'answered',
      repliedAt: new Date()
    };
    return await TeacherQuestion.findOneAndUpdate(
      { id },
      { $set: updates },
      { new: true }
    ).lean();
  },

  getAllTeacherQuestions: async () => {
    return await TeacherQuestion.find().sort({ createdAt: -1 }).lean();
  },

  getAllQuizAttempts: async () => {
    return await QuizAttempt.find().sort({ attemptedAt: -1 }).lean();
  },

  getAllQuestions: async () => {
    return await Question.find().lean();
  },

  getAllLessons: async () => {
    return await Lesson.find().lean();
  },

  getAllNotes: async () => {
    return await Note.find().lean();
  },

  getAllBookmarks: async () => {
    return await Bookmark.find().lean();
  },

  getAllProgress: async () => {
    return await Progress.find().lean();
  },

  toggleUserStatus: async (id, status) => {
    return await dataStore.updateUser(id, { status });
  }
};
