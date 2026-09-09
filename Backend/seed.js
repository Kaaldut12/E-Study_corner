import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { pathToFileURL } from 'node:url';

import User from './models/User.js';
import Course from './models/Course.js';
import Lesson from './models/Lesson.js';
import Quiz from './models/Quiz.js';
import Question from './models/Question.js';
import QuizAttempt from './models/QuizAttempt.js';
import Note from './models/Note.js';
import Bookmark from './models/Bookmark.js';
import Progress from './models/Progress.js';
import Notification from './models/Notification.js';
import Enquiry from './models/Enquiry.js';
import StudyMaterial from './models/StudyMaterial.js';
import Assignment from './models/Assignment.js';
import Submission from './models/Submission.js';
import SupportMessage from './models/SupportMessage.js';
import Feedback from './models/Feedback.js';
import { hashPassword } from './src/utils/password.js';

dotenv.config();

export const seedSuperAdmin = {
  id: 'user_superadmin_1',
  name: process.env.SEED_SUPERADMIN_NAME || 'Platform Super Administrator',
  firstName: process.env.SEED_SUPERADMIN_FIRSTNAME || 'Super',
  lastName: process.env.SEED_SUPERADMIN_LASTNAME || 'Admin',
  email: process.env.SEED_SUPERADMIN_EMAIL || 'superadmin@estudy.com',
  password: hashPassword(process.env.SEED_SUPERADMIN_PASSWORD || 'SuperAdmin@123'),
  role: 'superadmin',
  gender: process.env.SEED_SUPERADMIN_GENDER || 'Male',
  department: process.env.SEED_SUPERADMIN_DEPT || 'Administration & Platform Governance',
  collegeName: process.env.COLLEGE_NAME || 'National Institute of Technology & Advanced Studies',
  mobileNo: process.env.SEED_SUPERADMIN_PHONE || '9876543210',
  dob: process.env.SEED_SUPERADMIN_DOB || '1980-01-01',
  addressP: process.env.SEED_SUPERADMIN_ADDRESS || 'Administration Block, NITAS Campus',
  status: 'active'
};

export const seedAdmin = {
  id: 'user_admin_1',
  name: process.env.SEED_ADMIN_NAME || 'Department Administrator',
  firstName: process.env.SEED_ADMIN_FIRSTNAME || 'Admin',
  lastName: process.env.SEED_ADMIN_LASTNAME || 'Officer',
  email: process.env.SEED_ADMIN_EMAIL || 'admin@estudy.com',
  password: hashPassword(process.env.SEED_DEFAULT_PASSWORD || 'Admin@123'),
  role: 'admin',
  gender: process.env.SEED_ADMIN_GENDER || 'Male',
  department: process.env.SEED_ADMIN_DEPT || 'Department of CS & Engg',
  collegeName: process.env.COLLEGE_NAME || 'National Institute of Technology & Advanced Studies',
  mobileNo: process.env.SEED_ADMIN_PHONE || '9876543211',
  dob: process.env.SEED_ADMIN_DOB || '1978-04-12',
  addressP: process.env.SEED_ADMIN_ADDRESS || 'Academic Complex, NITAS Campus',
  status: 'active'
};

export const seedTeacher = {
  id: 'user_teacher_1',
  name: process.env.SEED_TEACHER_NAME || 'Faculty Lecturer',
  firstName: process.env.SEED_TEACHER_FIRSTNAME || 'Faculty',
  lastName: process.env.SEED_TEACHER_LASTNAME || 'Lecturer',
  email: process.env.SEED_TEACHER_EMAIL || 'teacher@estudy.com',
  password: hashPassword(process.env.SEED_DEFAULT_PASSWORD || 'Admin@123'),
  role: 'teacher',
  gender: process.env.SEED_TEACHER_GENDER || 'Male',
  department: process.env.SEED_TEACHER_DEPT || 'Department of CS & Engg',
  collegeName: process.env.COLLEGE_NAME || 'National Institute of Technology & Advanced Studies',
  mobileNo: process.env.SEED_TEACHER_PHONE || '9876543212',
  dob: process.env.SEED_TEACHER_DOB || '1982-08-15',
  addressP: process.env.SEED_TEACHER_ADDRESS || 'Faculty Residential Quarters, NITAS Campus',
  status: 'active'
};

export const seedStudent = {
  id: 'user_student_1',
  name: process.env.SEED_STUDENT_NAME || 'Student Scholar',
  firstName: process.env.SEED_STUDENT_FIRSTNAME || 'Student',
  lastName: process.env.SEED_STUDENT_LASTNAME || 'Scholar',
  email: process.env.SEED_STUDENT_EMAIL || 'student@estudy.com',
  password: hashPassword(process.env.SEED_DEFAULT_PASSWORD || 'Admin@123'),
  role: 'student',
  gender: process.env.SEED_STUDENT_GENDER || 'Male',
  course: process.env.SEED_STUDENT_COURSE || 'Computer Science & Engineering',
  courseYear: process.env.SEED_STUDENT_YEAR || '1st Year',
  collegeName: process.env.COLLEGE_NAME || 'National Institute of Technology & Advanced Studies',
  mobileNo: process.env.SEED_STUDENT_PHONE || '9876543213',
  dob: process.env.SEED_STUDENT_DOB || '2005-05-10',
  addressP: process.env.SEED_STUDENT_ADDRESS || 'Student Hostel Block A, NITAS Campus',
  status: 'active'
};

export const seedUsers = [seedSuperAdmin, seedAdmin, seedTeacher, seedStudent];
export const seedCourses = [];
export const seedLessons = [];
export const seedQuizzes = [];
export const seedQuestions = [];
export const seedQuizAttempts = [];
export const seedNotes = [];
export const seedBookmarks = [];
export const seedProgress = [];
export const seedNotifications = [];
export const seedEnquiries = [];
export const seedStudyMaterials = [];
export const seedAssignments = [
  {
    id: 'asg_1',
    title: 'Data Structures & Algorithms - Binary Search Trees Implementation',
    subject: 'Computer Science',
    description: 'Design and implement a robust Binary Search Tree (BST) supporting insertion, deletion of nodes with two children, in-order traversal, and height calculation. Include clear time-complexity analysis.',
    teacherId: 'user_teacher_1',
    teacherName: process.env.SEED_TEACHER_NAME || 'Faculty Lecturer',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    totalPoints: 100,
    resourceLink: 'https://en.wikipedia.org/wiki/Binary_search_tree',
    attachmentUrl: '',
    attachmentName: '',
    createdAt: new Date()
  },
  {
    id: 'asg_2',
    title: 'Operating Systems - Process Scheduling Simulator',
    subject: 'Computer Science',
    description: 'Implement Round Robin (RR) and Shortest Job First (SJF) process scheduling algorithms in Python, C++, or Java. Submit your code along with average waiting time and turnaround time calculations.',
    teacherId: 'user_teacher_1',
    teacherName: process.env.SEED_TEACHER_NAME || 'Faculty Lecturer',
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    totalPoints: 100,
    resourceLink: '',
    attachmentUrl: '',
    attachmentName: '',
    createdAt: new Date()
  }
];

export const seedSubmissions = [
  {
    id: 'sub_demo_1',
    assignmentId: 'asg_1',
    studentId: 'user_student_1',
    studentName: process.env.SEED_STUDENT_NAME || 'Student Scholar',
    submissionText: 'Implemented full BinarySearchTree class in Python with insertion, deletion, and in-order traversal return array. Handled edge case where deleted root has two children.',
    attachmentUrl: 'https://github.com/student-demo/bst-solution',
    fileName: 'BST_Implementation.py',
    fileSize: '45.2 KB',
    submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    status: 'submitted',
    grade: null,
    totalPoints: 100,
    feedback: '',
    gradedAt: null,
    gradedBy: null
  }
];
export const seedSupportMessages = [];
export const seedFeedback = [];

const seedCollections = [
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

export const seedDatabase = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/estudy_db';
  await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 5000 });

  let insertedCount = 0;
  for (const [Model, documents] of seedCollections) {
    for (const document of documents) {
      const result = await Model.updateOne(
        { id: document.id },
        { $set: document },
        { upsert: true }
      );
      insertedCount += result.upsertedCount;
    }
  }

  console.log(`Seed complete. Inserted ${insertedCount} document(s).`);
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  seedDatabase()
    .catch((error) => {
      console.error(`Seed failed: ${error.message}`);
      process.exitCode = 1;
    })
    .finally(async () => {
      if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
    });
}
