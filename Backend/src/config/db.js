// backend/src/config/db.js
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

export const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/estudy_db';

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000 // 5 sec timeout for fallback
    });

    console.log(`
╔══════════════════════════════════════════════════════════════╗
║  MongoDB Connected Successfully!                             ║
║  Host: ${conn.connection.host}                              ║
║  Database: ${conn.connection.name}                            ║
╚══════════════════════════════════════════════════════════════╝
    `);

    // Auto-seed MongoDB collections if empty
    await seedInitialData();
  } catch (error) {
    console.warn(`MongoDB Connection Warning: ${error.message}. Running with memory repository fallback.`);
  }
};

const seedInitialData = async () => {
  try {
    for (const user of seedUsers) {
      await User.updateOne(
        { email: user.email },
        { $setOnInsert: user },
        { upsert: true }
      );
    }
    if ((await Course.countDocuments()) === 0) await Course.insertMany(seedCourses);
    if ((await Lesson.countDocuments()) === 0) await Lesson.insertMany(seedLessons);
    if ((await Quiz.countDocuments()) === 0) await Quiz.insertMany(seedQuizzes);
    if ((await Question.countDocuments()) === 0) await Question.insertMany(seedQuestions);
    if ((await QuizAttempt.countDocuments()) === 0) await QuizAttempt.insertMany(seedQuizAttempts);
    if ((await Note.countDocuments()) === 0) await Note.insertMany(seedNotes);
    if ((await Bookmark.countDocuments()) === 0) await Bookmark.insertMany(seedBookmarks);
    if ((await Progress.countDocuments()) === 0) await Progress.insertMany(seedProgress);
    if ((await Notification.countDocuments()) === 0) await Notification.insertMany(seedNotifications);
    if ((await Enquiry.countDocuments()) === 0) await Enquiry.insertMany(seedEnquiries);
    if ((await StudyMaterial.countDocuments()) === 0) await StudyMaterial.insertMany(seedStudyMaterials);
    if ((await Assignment.countDocuments()) === 0) await Assignment.insertMany(seedAssignments);
    if ((await Submission.countDocuments()) === 0) await Submission.insertMany(seedSubmissions);
    if ((await SupportMessage.countDocuments()) === 0) await SupportMessage.insertMany(seedSupportMessages);
    if ((await Feedback.countDocuments()) === 0) await Feedback.insertMany(seedFeedback);

    console.log('🌱 Verified and auto-seeded initial E-Study Corner collections.');
  } catch (err) {
    console.warn('Seeding warning:', err.message);
  }
};

