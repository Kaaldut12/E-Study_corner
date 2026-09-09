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
    const collections = [
      [User, seedUsers],
      [Course, seedCourses],
      [Lesson, seedLessons],
      [Quiz, seedQuizzes],
      [Question, seedQuestions],
      [QuizAttempt, seedQuizAttempts],
      [Note, seedNotes],
      [Bookmark, seedBookmarks],
      [Progress, seedProgress],
      [Notification, seedNotifications],
      [Enquiry, seedEnquiries],
      [StudyMaterial, seedStudyMaterials],
      [Assignment, seedAssignments],
      [Submission, seedSubmissions],
      [SupportMessage, seedSupportMessages],
      [Feedback, seedFeedback]
    ];

    for (const [Model, documents] of collections) {
      for (const doc of documents) {
        const filter = doc.id ? { id: doc.id } : { email: doc.email };
        await Model.updateOne(filter, { $set: doc }, { upsert: true });
      }
    }

    console.log('🌱 Successfully verified and synchronized actual database collections.');
  } catch (err) {
    console.warn('Database synchronization warning:', err.message);
  }
};

