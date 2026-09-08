// backend/seed.js
/**
 * ============================================================================
 * E-STUDY CORNER — FUTURE VERSION BACKEND SEED ENGINE & DATASET
 * ============================================================================
 * Comprehensive seed data covering all modules:
 * Users, Courses, Lessons, Quizzes, Questions, QuizAttempts, Notes, Bookmarks,
 * Progress, StudyMaterials, Assignments, Submissions, Notifications, Enquiries,
 * SupportMessages, and Feedback.
 * ============================================================================
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
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

dotenv.config();

const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/estudy_db';

// 1. USERS SEED
export const seedUsers = [
  {
    id: 'user_admin_1',
    name: 'Dr. Rajeev Kumar (HOD)',
    firstName: 'Rajeev',
    lastName: 'Kumar',
    email: 'admin@estudy.com',
    password: 'password123',
    role: 'admin',
    gender: 'Male',
    department: 'Department of CS & Engg',
    collegeName: 'Government Polytechnic Aurai, Bhadohi',
    mobileNo: '9876500001',
    dob: '1978-04-12',
    addressP: 'Polytechnic Campus, Bhadohi, U.P.',
    status: 'active'
  },
  {
    id: 'user_admin_2',
    name: 'Er. Aakash Verma',
    firstName: 'Aakash',
    lastName: 'Verma',
    email: 'admin2@estudy.com',
    password: 'password123',
    role: 'admin',
    gender: 'Male',
    department: 'System Administration & IT Cell',
    collegeName: 'Government Polytechnic Aurai, Bhadohi',
    mobileNo: '9876500002',
    dob: '1985-09-25',
    addressP: 'Tagore Town, Prayagraj, U.P.',
    status: 'active'
  },
  {
    id: 'user_teacher_1',
    name: 'Er. Durgesh Nandani',
    firstName: 'Durgesh',
    lastName: 'Nandani',
    email: 'teacher@estudy.com',
    password: 'password123',
    role: 'teacher',
    gender: 'Male',
    department: 'Computer Science & Engineering',
    collegeName: 'Government Polytechnic Aurai, Bhadohi',
    teacherId: 'TCH-5001',
    mobileNo: '9876500003',
    dob: '1988-11-15',
    addressP: 'Gyanpur, Bhadohi, U.P.',
    status: 'active'
  },
  {
    id: 'user_teacher_2',
    name: 'Prof. Sunita Sharma',
    firstName: 'Sunita',
    lastName: 'Sharma',
    email: 'sunita@estudy.com',
    password: 'password123',
    role: 'teacher',
    gender: 'Female',
    department: 'Information Technology',
    collegeName: 'Government Polytechnic Aurai, Bhadohi',
    teacherId: 'TCH-5002',
    mobileNo: '9876500004',
    dob: '1990-06-18',
    addressP: 'Sigra, Varanasi, U.P.',
    status: 'active'
  },
  {
    id: 'user_student_1',
    name: 'Alex Johnson',
    firstName: 'Alex',
    lastName: 'Johnson',
    email: 'student@estudy.com',
    password: 'password123',
    role: 'student',
    gender: 'Male',
    collegeName: 'Government Polytechnic Aurai, Bhadohi',
    course: 'Diploma in Computer Science & Engineering',
    courseYear: '3rd Year',
    mobileNo: '9876543210',
    dob: '2004-05-15',
    addressP: 'Station Road, Bhadohi, U.P.',
    status: 'active'
  },
  {
    id: 'user_student_2',
    name: 'Sophia Chen',
    firstName: 'Sophia',
    lastName: 'Chen',
    email: 'sophia@estudy.com',
    password: 'password123',
    role: 'student',
    gender: 'Female',
    collegeName: 'Government Polytechnic Aurai, Bhadohi',
    course: 'Diploma in Information Technology',
    courseYear: '2nd Year',
    mobileNo: '9876543211',
    dob: '2005-08-20',
    addressP: 'Civil Lines, Lucknow, U.P.',
    status: 'active'
  },
  {
    id: 'user_student_3',
    name: 'Rahul Sharma',
    firstName: 'Rahul',
    lastName: 'Sharma',
    email: 'rahul@estudy.com',
    password: 'password123',
    role: 'student',
    gender: 'Male',
    collegeName: 'Government Polytechnic Aurai, Bhadohi',
    course: 'Diploma in Computer Science & Engineering',
    courseYear: '3rd Year',
    mobileNo: '9876543212',
    dob: '2004-01-10',
    addressP: 'Katra, Prayagraj, U.P.',
    status: 'active'
  },
  {
    id: 'user_student_4',
    name: 'Ananya Patel',
    firstName: 'Ananya',
    lastName: 'Patel',
    email: 'ananya@estudy.com',
    password: 'password123',
    role: 'student',
    gender: 'Female',
    collegeName: 'Government Polytechnic Aurai, Bhadohi',
    course: 'Diploma in Information Technology',
    courseYear: '1st Year',
    mobileNo: '9876543213',
    dob: '2006-03-22',
    addressP: 'Cantt, Varanasi, U.P.',
    status: 'active'
  }
];

// 2. COURSES SEED
export const seedCourses = [
  {
    id: 'course_dsa_301',
    code: 'CS-301',
    title: 'Data Structures & Algorithms in C++',
    description: 'Master core data structures including arrays, linked lists, stacks, queues, trees, graphs, dynamic programming, and sorting algorithms.',
    subject: 'Computer Science',
    department: 'Computer Science & Engineering',
    courseYear: '3rd Year',
    teacherId: 'user_teacher_1',
    teacherName: 'Er. Durgesh Nandani',
    thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop',
    modulesCount: 4,
    lessonsCount: 12,
    enrolledCount: 68,
    rating: 4.9,
    status: 'active'
  },
  {
    id: 'course_dbms_302',
    code: 'IT-302',
    title: 'Database Management Systems & SQL',
    description: 'Learn relational database modeling, ER diagrams, normalization (1NF-3NF), SQL queries, indexing, transactions, and ACID properties.',
    subject: 'Information Technology',
    department: 'Information Technology',
    courseYear: '2nd Year',
    teacherId: 'user_teacher_2',
    teacherName: 'Prof. Sunita Sharma',
    thumbnail: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600&auto=format&fit=crop',
    modulesCount: 4,
    lessonsCount: 10,
    enrolledCount: 52,
    rating: 4.8,
    status: 'active'
  },
  {
    id: 'course_web_303',
    code: 'CS-303',
    title: 'Modern Full-Stack Web Development',
    description: 'Build modern responsive web applications using HTML5, CSS3, JavaScript ES6+, React.js, Node.js, Express, and MongoDB.',
    subject: 'Web Development',
    department: 'Computer Science & Engineering',
    courseYear: '3rd Year',
    teacherId: 'user_teacher_1',
    teacherName: 'Er. Durgesh Nandani',
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop',
    modulesCount: 5,
    lessonsCount: 15,
    enrolledCount: 75,
    rating: 4.95,
    status: 'active'
  }
];

// 3. LESSONS SEED
export const seedLessons = [
  {
    id: 'les_dsa_01',
    courseId: 'course_dsa_301',
    moduleTitle: 'Module 1: Introduction to Data Structures',
    lessonOrder: 1,
    title: 'Arrays & Memory Allocation',
    description: 'Contiguous memory allocation, static vs dynamic arrays, time complexity analysis of array operations.',
    contentType: 'article',
    contentUrl: 'https://developer.mozilla.org',
    durationMinutes: 25,
    isFreePreview: true
  },
  {
    id: 'les_dsa_02',
    courseId: 'course_dsa_301',
    moduleTitle: 'Module 1: Introduction to Data Structures',
    lessonOrder: 2,
    title: 'Singly and Doubly Linked Lists',
    description: 'Pointer manipulation, node insertion, deletion, reversing linked lists, and cycle detection algorithms.',
    contentType: 'video',
    contentUrl: 'https://www.youtube.com/watch?v=dummy_dsa_ll',
    durationMinutes: 35,
    isFreePreview: true
  },
  {
    id: 'les_dbms_01',
    courseId: 'course_dbms_302',
    moduleTitle: 'Module 1: Database Architecture',
    lessonOrder: 1,
    title: 'Relational Model & ER Diagrams',
    description: 'Entities, attributes, primary keys, foreign keys, cardinality, and building Entity-Relationship diagrams.',
    contentType: 'pdf',
    contentUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    durationMinutes: 30,
    isFreePreview: true
  }
];

// 4. QUIZZES SEED
export const seedQuizzes = [
  {
    id: 'quiz_dsa_101',
    courseId: 'course_dsa_301',
    title: 'Data Structures Fundamentals Quiz',
    subject: 'Computer Science',
    description: 'Test your understanding of Arrays, Linked Lists, Stacks, Queues, and Time Complexity.',
    timeLimitMinutes: 15,
    totalQuestions: 3,
    passingScore: 70,
    teacherId: 'user_teacher_1',
    teacherName: 'Er. Durgesh Nandani'
  },
  {
    id: 'quiz_dbms_102',
    courseId: 'course_dbms_302',
    title: 'SQL & Database Normalization Quiz',
    subject: 'Information Technology',
    description: 'Evaluate your knowledge on SQL JOINs, 1NF, 2NF, 3NF, and BCNF normalization rules.',
    timeLimitMinutes: 15,
    totalQuestions: 2,
    passingScore: 70,
    teacherId: 'user_teacher_2',
    teacherName: 'Prof. Sunita Sharma'
  }
];

// 5. QUESTIONS SEED
export const seedQuestions = [
  {
    id: 'q_dsa_01',
    quizId: 'quiz_dsa_101',
    questionText: 'What is the time complexity to search an element in a balanced Binary Search Tree (BST)?',
    options: ['O(1)', 'O(log N)', 'O(N)', 'O(N log N)'],
    correctOptionIndex: 1,
    explanation: 'In a balanced BST, each step divides the search space in half, resulting in logarithmic O(log N) time complexity.',
    points: 10
  },
  {
    id: 'q_dsa_02',
    quizId: 'quiz_dsa_101',
    questionText: 'Which data structure follows the Last-In-First-Out (LIFO) principle?',
    options: ['Queue', 'Linked List', 'Stack', 'Heap'],
    correctOptionIndex: 2,
    explanation: 'A Stack processes elements in LIFO order where push and pop operations occur at the top of the stack.',
    points: 10
  },
  {
    id: 'q_dsa_03',
    quizId: 'quiz_dsa_101',
    questionText: 'What is the worst-case time complexity of Quick Sort?',
    options: ['O(N log N)', 'O(N)', 'O(N^2)', 'O(1)'],
    correctOptionIndex: 2,
    explanation: 'Quick Sort takes O(N^2) time when the pivot chosen is consistently the smallest or largest element.',
    points: 10
  },
  {
    id: 'q_dbms_01',
    quizId: 'quiz_dbms_102',
    questionText: 'Which SQL keyword is used to eliminate duplicate records from a SELECT query result?',
    options: ['UNIQUE', 'DISTINCT', 'GROUP BY', 'FILTER'],
    correctOptionIndex: 1,
    explanation: 'SELECT DISTINCT removes duplicate rows from the query output.',
    points: 10
  },
  {
    id: 'q_dbms_02',
    quizId: 'quiz_dbms_102',
    questionText: 'A table is in 2NF if it is in 1NF and contains no...',
    options: ['Transitive dependencies', 'Partial dependencies', 'Multi-valued dependencies', 'Duplicate rows'],
    correctOptionIndex: 1,
    explanation: 'Second Normal Form (2NF) requires that no non-prime attribute is dependent on a proper subset of any candidate key (no partial dependency).',
    points: 10
  }
];

// 6. QUIZ ATTEMPTS SEED
export const seedQuizAttempts = [
  {
    id: 'att_01',
    quizId: 'quiz_dsa_101',
    quizTitle: 'Data Structures Fundamentals Quiz',
    studentId: 'user_student_1',
    studentName: 'Alex Johnson',
    score: 30,
    totalPoints: 30,
    percentage: 100,
    passed: true,
    timeTakenSeconds: 420,
    answers: [
      { questionId: 'q_dsa_01', selectedOption: 1, isCorrect: true },
      { questionId: 'q_dsa_02', selectedOption: 2, isCorrect: true },
      { questionId: 'q_dsa_03', selectedOption: 2, isCorrect: true }
    ],
    attemptedAt: new Date('2026-09-07T14:30:00.000Z')
  },
  {
    id: 'att_02',
    quizId: 'quiz_dsa_101',
    quizTitle: 'Data Structures Fundamentals Quiz',
    studentId: 'user_student_2',
    studentName: 'Sophia Chen',
    score: 20,
    totalPoints: 30,
    percentage: 66.7,
    passed: false,
    timeTakenSeconds: 510,
    answers: [
      { questionId: 'q_dsa_01', selectedOption: 1, isCorrect: true },
      { questionId: 'q_dsa_02', selectedOption: 2, isCorrect: true },
      { questionId: 'q_dsa_03', selectedOption: 0, isCorrect: false }
    ],
    attemptedAt: new Date('2026-09-08T09:15:00.000Z')
  }
];

// 7. NOTES SEED
export const seedNotes = [
  {
    id: 'note_01',
    studentId: 'user_student_1',
    studentName: 'Alex Johnson',
    title: 'BST Deletion & Tree Balancing Logic',
    content: 'When deleting a node with 2 children in a Binary Search Tree, replace the node value with its In-Order Successor (smallest in right subtree) or In-Order Predecessor.',
    category: 'Computer Science',
    tags: ['DSA', 'Trees', 'C++'],
    courseId: 'course_dsa_301',
    lessonId: 'les_dsa_02',
    isPinned: true,
    isArchived: false,
    color: '#3B82F6'
  },
  {
    id: 'note_02',
    studentId: 'user_student_1',
    studentName: 'Alex Johnson',
    title: 'SQL Join Types Quick Reference',
    content: 'INNER JOIN returns matching rows in both tables. LEFT JOIN returns all rows from left table and matched rows from right. RIGHT JOIN returns all right table rows.',
    category: 'Information Technology',
    tags: ['DBMS', 'SQL', 'Databases'],
    courseId: 'course_dbms_302',
    lessonId: 'les_dbms_01',
    isPinned: false,
    isArchived: false,
    color: '#10B981'
  }
];

// 8. BOOKMARKS SEED
export const seedBookmarks = [
  {
    id: 'bm_01',
    studentId: 'user_student_1',
    itemType: 'course',
    itemId: 'course_dsa_301',
    title: 'Data Structures & Algorithms in C++',
    url: '/student/courses/course_dsa_301'
  },
  {
    id: 'bm_02',
    studentId: 'user_student_1',
    itemType: 'material',
    itemId: 'mat_1',
    title: 'Data Structures & Algorithms Complete Notes PDF',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  }
];

// 9. PROGRESS SEED
export const seedProgress = [
  {
    id: 'prog_01',
    studentId: 'user_student_1',
    studentName: 'Alex Johnson',
    courseId: 'course_dsa_301',
    courseTitle: 'Data Structures & Algorithms in C++',
    completedLessons: ['les_dsa_01', 'les_dsa_02'],
    percentage: 80,
    studyStreakDays: 5,
    totalStudyMinutes: 240,
    lastActiveAt: new Date('2026-09-08T08:00:00.000Z')
  },
  {
    id: 'prog_02',
    studentId: 'user_student_2',
    studentName: 'Sophia Chen',
    courseId: 'course_dbms_302',
    courseTitle: 'Database Management Systems & SQL',
    completedLessons: ['les_dbms_01'],
    percentage: 55,
    studyStreakDays: 3,
    totalStudyMinutes: 150,
    lastActiveAt: new Date('2026-09-07T16:00:00.000Z')
  }
];

// 10. NOTIFICATIONS SEED
export const seedNotifications = [
  {
    id: 'noti_1',
    notificationId: 101,
    notiMessage: '📢 Welcome to E-Study Corner (Smart Learning Pathashala) - Government Polytechnic Aurai session 2024!',
    notiDt: new Date('2026-09-01T10:00:00.000Z')
  },
  {
    id: 'noti_2',
    notificationId: 102,
    notiMessage: '📝 Final Year Major Project submissions for CS/IT Diploma are now open.',
    notiDt: new Date('2026-09-03T12:00:00.000Z')
  },
  {
    id: 'noti_3',
    notificationId: 103,
    notiMessage: '🗓️ Mid-Semester Examination schedule published for 2nd & 3rd Year students.',
    notiDt: new Date('2026-09-05T09:30:00.000Z')
  },
  {
    id: 'noti_4',
    notificationId: 104,
    notiMessage: '⚡ Special Workshop on Cloud Computing & Microservices scheduled for this Friday in Auditorium A.',
    notiDt: new Date('2026-09-07T14:00:00.000Z')
  }
];

// 11. ENQUIRIES SEED
export const seedEnquiries = [
  {
    id: 'enq_1',
    enquiryId: 1,
    name: 'Mayank Singh',
    email: 'mayank@polytechnic.ac.in',
    mobileNo: '9123456789',
    message: 'I want to inquire about the online lecture schedules for 3rd Year CS Diploma.',
    enquiryDt: new Date('2026-09-06T10:15:00.000Z')
  },
  {
    id: 'enq_2',
    enquiryId: 2,
    name: 'Ritu Gupta',
    email: 'ritu.g@gmail.com',
    mobileNo: '9811223344',
    message: 'Regarding admission criteria for Lateral Entry in Information Technology branch.',
    enquiryDt: new Date('2026-09-07T11:45:00.000Z')
  },
  {
    id: 'enq_3',
    enquiryId: 3,
    name: 'Vikram Malhotra',
    email: 'vikram.m@techmail.com',
    mobileNo: '9786543210',
    message: 'Can industry mentors register for conducting online guest sessions on Web Architecture?',
    enquiryDt: new Date('2026-09-08T08:20:00.000Z')
  }
];

// 12. STUDY MATERIALS SEED
export const seedStudyMaterials = [
  {
    id: 'mat_1',
    materialId: 1,
    subject: 'Computer Science',
    title: 'Data Structures & Algorithms Complete Notes',
    description: 'Comprehensive study notes covering Arrays, Linked Lists, Stacks, Queues, Binary Search Trees, and Graphs.',
    fileName: 'DSA_Complete_Notes.pdf',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    uploadDt: new Date('2026-09-02T10:00:00.000Z')
  },
  {
    id: 'mat_2',
    materialId: 2,
    subject: 'Information Technology',
    title: 'Database Management Systems & SQL Cheatsheet',
    description: 'Detailed guide on ER Diagram modeling, Normalization (1NF to 3NF), Relational Algebra, and SQL queries.',
    fileName: 'DBMS_SQL_Guide.pdf',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    uploadDt: new Date('2026-09-04T14:30:00.000Z')
  },
  {
    id: 'mat_3',
    materialId: 3,
    subject: 'Web Development',
    title: 'Modern React & Node.js Full-Stack Handbook',
    description: 'Step-by-step guide for creating RESTful APIs, JWT Authentication, Express middleware, and React components.',
    fileName: 'FullStack_React_Node.pdf',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    uploadDt: new Date('2026-09-05T16:00:00.000Z')
  },
  {
    id: 'mat_4',
    materialId: 4,
    subject: 'Computer Networks',
    title: 'TCP/IP Protocol Suite & Subnetting Guide',
    description: 'Deep dive into OSI models, IP Addressing, CIDR subnetting, Routing algorithms, and Socket programming.',
    fileName: 'Networking_TCPIP.pdf',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    uploadDt: new Date('2026-09-07T11:10:00.000Z')
  }
];

// 13. ASSIGNMENTS SEED
export const seedAssignments = [
  {
    id: 'asg_1',
    title: 'Data Structures & Algorithms - Binary Trees Implementation',
    subject: 'Computer Science',
    description: 'Implement a Binary Search Tree in JavaScript or Python with methods for insertion, deletion, and tree traversals.',
    teacherId: 'user_teacher_1',
    teacherName: 'Er. Durgesh Nandani',
    dueDate: new Date('2026-09-15T23:59:59.000Z'),
    totalPoints: 100,
    resourceLink: 'https://developer.mozilla.org',
    createdAt: new Date('2026-09-01T10:00:00.000Z')
  },
  {
    id: 'asg_2',
    title: 'Database Management Systems - E-Commerce Relational Schema Design',
    subject: 'Information Technology',
    description: 'Design an normalized 3NF ER database schema for an online store handling customers, orders, products, and invoices.',
    teacherId: 'user_teacher_2',
    teacherName: 'Prof. Sunita Sharma',
    dueDate: new Date('2026-09-20T23:59:59.000Z'),
    totalPoints: 100,
    resourceLink: 'https://www.mongodb.com/docs',
    createdAt: new Date('2026-09-04T11:00:00.000Z')
  }
];

// 14. SUBMISSIONS SEED
export const seedSubmissions = [
  {
    id: 'sub_1',
    assignmentId: 'asg_1',
    studentId: 'user_student_1',
    studentName: 'Alex Johnson',
    submissionText: 'Implemented BinarySearchTree class with delete node re-balancing logic and in-order traversal return array.',
    attachmentUrl: 'https://github.com/alex-student/bst-assignment',
    submittedAt: new Date('2026-09-07T11:00:00.000Z'),
    status: 'graded',
    grade: 95,
    totalPoints: 100,
    feedback: 'Excellent work! BST implementation handled edge cases correctly.',
    gradedAt: new Date('2026-09-07T14:00:00.000Z'),
    gradedBy: 'Er. Durgesh Nandani'
  },
  {
    id: 'sub_2',
    assignmentId: 'asg_1',
    studentId: 'user_student_2',
    studentName: 'Sophia Chen',
    submissionText: 'Binary Search Tree code uploaded with unit tests for insertion and search methods.',
    attachmentUrl: 'https://github.com/sophia-chen/bst-code',
    submittedAt: new Date('2026-09-07T15:30:00.000Z'),
    status: 'graded',
    grade: 88,
    totalPoints: 100,
    feedback: 'Good attempt on tree traversal. Make sure to handle null root edge case in deletion.',
    gradedAt: new Date('2026-09-08T09:00:00.000Z'),
    gradedBy: 'Er. Durgesh Nandani'
  },
  {
    id: 'sub_3',
    assignmentId: 'asg_2',
    studentId: 'user_student_3',
    studentName: 'Rahul Sharma',
    submissionText: 'Created normalized tables for Customers, Products, Orders, and OrderItems with Foreign Key constraints.',
    attachmentUrl: 'https://github.com/rahul-sharma/db-schema',
    submittedAt: new Date('2026-09-08T07:45:00.000Z'),
    status: 'submitted',
    grade: null,
    totalPoints: 100,
    feedback: '',
    gradedAt: null,
    gradedBy: null
  }
];

// 15. SUPPORT MESSAGES SEED
export const seedSupportMessages = [
  {
    id: 'msg_1',
    userId: 'user_student_1',
    userName: 'Alex Johnson',
    userRole: 'student',
    subject: 'Issue submitting PDF files',
    category: 'Technical Support',
    message: 'Hello, is there a size limit for project zip attachments on the submission tab?',
    status: 'pending',
    createdAt: new Date('2026-09-06T14:10:00.000Z'),
    adminReply: ''
  },
  {
    id: 'msg_2',
    userId: 'user_student_2',
    userName: 'Sophia Chen',
    userRole: 'student',
    subject: 'Need access to Lab 3 Software Repositories',
    category: 'Account & Access',
    message: 'Requesting SSH key authorization for CS Diploma Lab server 3.',
    status: 'pending',
    createdAt: new Date('2026-09-07T10:20:00.000Z'),
    adminReply: ''
  },
  {
    id: 'msg_3',
    userId: 'user_student_3',
    userName: 'Rahul Sharma',
    userRole: 'student',
    subject: 'Password reset query for library portal',
    category: 'General Support',
    message: 'I am unable to login to the digital library portal with my student email.',
    status: 'resolved',
    createdAt: new Date('2026-09-05T12:00:00.000Z'),
    adminReply: 'Password reset link sent to your registered email address.'
  }
];

// 16. FEEDBACK SEED
export const seedFeedback = [
  {
    id: 'fb_1',
    studentId: 'user_student_1',
    studentName: 'Alex Johnson',
    topic: 'Online Study Material Feedback',
    assignmentTitle: 'Data Structures Notes',
    rating: 5,
    comment: 'The study material notes and lab manuals provided by Government Polytechnic Aurai portal are very clear and helpful.',
    createdAt: new Date('2026-09-06T12:00:00.000Z')
  },
  {
    id: 'fb_2',
    studentId: 'user_student_2',
    studentName: 'Sophia Chen',
    topic: 'Mobile Responsiveness & Dashboard UI',
    assignmentTitle: 'E-Study Corner Platform',
    rating: 5,
    comment: 'Admin and Student interface feels clean, modern, and accessible on mobile devices!',
    createdAt: new Date('2026-09-07T16:45:00.000Z')
  },
  {
    id: 'fb_3',
    studentId: 'user_student_3',
    studentName: 'Rahul Sharma',
    topic: 'Assignment & Notice Board Tracker',
    assignmentTitle: 'DBMS Schema Design',
    rating: 4,
    comment: 'Great platform for tracking upcoming homework deadlines and downloading notes.',
    createdAt: new Date('2026-09-08T08:30:00.000Z')
  }
];

// SEED EXECUTION ENGINE
async function runSeed() {
  console.log('🌱 Starting E-Study Corner Comprehensive Database Seeder...');
  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`Connected to MongoDB: ${conn.connection.host}/${conn.connection.name}`);

    // Clear existing collections
    await Promise.all([
      User.deleteMany({}),
      Course.deleteMany({}),
      Lesson.deleteMany({}),
      Quiz.deleteMany({}),
      Question.deleteMany({}),
      QuizAttempt.deleteMany({}),
      Note.deleteMany({}),
      Bookmark.deleteMany({}),
      Progress.deleteMany({}),
      Notification.deleteMany({}),
      Enquiry.deleteMany({}),
      StudyMaterial.deleteMany({}),
      Assignment.deleteMany({}),
      Submission.deleteMany({}),
      SupportMessage.deleteMany({}),
      Feedback.deleteMany({})
    ]);

    console.log('🧹 Cleared all existing collection data.');

    // Insert seeds
    await User.insertMany(seedUsers);
    await Course.insertMany(seedCourses);
    await Lesson.insertMany(seedLessons);
    await Quiz.insertMany(seedQuizzes);
    await Question.insertMany(seedQuestions);
    await QuizAttempt.insertMany(seedQuizAttempts);
    await Note.insertMany(seedNotes);
    await Bookmark.insertMany(seedBookmarks);
    await Progress.insertMany(seedProgress);
    await Notification.insertMany(seedNotifications);
    await Enquiry.insertMany(seedEnquiries);
    await StudyMaterial.insertMany(seedStudyMaterials);
    await Assignment.insertMany(seedAssignments);
    await Submission.insertMany(seedSubmissions);
    await SupportMessage.insertMany(seedSupportMessages);
    await Feedback.insertMany(seedFeedback);

    console.log(`
╔══════════════════════════════════════════════════════════════╗
║  🌱 Database Seeded Successfully!                            ║
╠══════════════════════════════════════════════════════════════╣
║  • Users:           ${seedUsers.length} (Admins: 2, Teachers: 2, Students: 4)║
║  • Courses:         ${seedCourses.length}                                      ║
║  • Lessons:         ${seedLessons.length}                                      ║
║  • Quizzes:         ${seedQuizzes.length}                                      ║
║  • Questions:       ${seedQuestions.length}                                      ║
║  • Quiz Attempts:   ${seedQuizAttempts.length}                                      ║
║  • Notes:           ${seedNotes.length}                                      ║
║  • Bookmarks:       ${seedBookmarks.length}                                      ║
║  • Progress Records:${seedProgress.length}                                      ║
║  • Notifications:   ${seedNotifications.length}                                      ║
║  • Enquiries:       ${seedEnquiries.length}                                      ║
║  • Study Materials: ${seedStudyMaterials.length}                                      ║
║  • Assignments:     ${seedAssignments.length}                                      ║
║  • Submissions:     ${seedSubmissions.length}                                      ║
║  • Support Messages:${seedSupportMessages.length} (Pending: 2, Resolved: 1)         ║
║  • Feedback Items:  ${seedFeedback.length}                                      ║
╚══════════════════════════════════════════════════════════════╝
    `);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    console.log('💡 Tip: Ensure MongoDB server is running if attempting direct DB insertion.');
    process.exit(1);
  }
}

if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  runSeed();
}
