// backend/seed.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { pathToFileURL } from 'url';
import { hashPassword } from './src/utils/password.js';

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
import TeacherQuestion from './models/TeacherQuestion.js';

import { DEFAULT_ROLE_PERMISSIONS } from './src/constants/permissions.js';

dotenv.config();

export const seedSuperAdmin = {
  id: 'user_superadmin_1',
  name: process.env.SEED_SUPERADMIN_NAME || 'Platform Super Administrator',
  firstName: process.env.SEED_SUPERADMIN_FIRSTNAME || 'Super',
  lastName: process.env.SEED_SUPERADMIN_LASTNAME || 'Admin',
  email: process.env.SEED_SUPERADMIN_EMAIL || 'superadmin@estudy.com',
  password: hashPassword(process.env.SEED_SUPERADMIN_PASSWORD || 'SuperAdmin@123'),
  role: 'superadmin',
  permissions: DEFAULT_ROLE_PERMISSIONS.superadmin,
  gender: 'Male',
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
  permissions: DEFAULT_ROLE_PERMISSIONS.admin,
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
  permissions: DEFAULT_ROLE_PERMISSIONS.teacher,
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
  permissions: DEFAULT_ROLE_PERMISSIONS.student,
  gender: process.env.SEED_STUDENT_GENDER || 'Male',
  course: process.env.SEED_STUDENT_COURSE || 'Computer Science & Engineering',
  courseYear: process.env.SEED_STUDENT_YEAR || '1st Year',
  collegeName: process.env.COLLEGE_NAME || 'National Institute of Technology & Advanced Studies',
  mobileNo: process.env.SEED_STUDENT_PHONE || '9876543213',
  dob: process.env.SEED_STUDENT_DOB || '2005-05-10',
  addressP: process.env.SEED_STUDENT_ADDRESS || 'Student Hostel Block A, NITAS Campus',
  status: 'active'
};

export const seedStudent2 = {
  id: 'user_student_2',
  name: 'Priya Sharma',
  firstName: 'Priya',
  lastName: 'Sharma',
  email: 'priya@estudy.com',
  password: hashPassword('Admin@123'),
  role: 'student',
  permissions: DEFAULT_ROLE_PERMISSIONS.student,
  gender: 'Female',
  course: 'Computer Science & Engineering',
  courseYear: '2nd Year',
  collegeName: process.env.COLLEGE_NAME || 'National Institute of Technology & Advanced Studies',
  mobileNo: '9876543214',
  dob: '2004-09-18',
  addressP: 'Student Hostel Block B, NITAS Campus',
  status: 'active'
};

export const seedStudent3 = {
  id: 'user_student_3',
  name: 'Rahul Verma',
  firstName: 'Rahul',
  lastName: 'Verma',
  email: 'rahul@estudy.com',
  password: hashPassword('Admin@123'),
  role: 'student',
  permissions: DEFAULT_ROLE_PERMISSIONS.student,
  gender: 'Male',
  course: 'Information Technology',
  courseYear: '1st Year',
  collegeName: process.env.COLLEGE_NAME || 'National Institute of Technology & Advanced Studies',
  mobileNo: '9876543215',
  dob: '2005-02-14',
  addressP: 'Student Hostel Block A, NITAS Campus',
  status: 'active'
};

export const seedUsers = [seedSuperAdmin, seedAdmin, seedTeacher, seedStudent, seedStudent2, seedStudent3];

export const seedCourses = [
  {
    id: 'course_1',
    code: 'CS-301',
    title: 'Data Structures & Algorithms in Python & C++',
    description: 'Master core data structures including Linked Lists, Balanced Trees, Hash Tables, and Graphs alongside sorting and search optimizations.',
    subject: 'Computer Science',
    department: 'Computer Science & Engineering',
    courseYear: '2nd Year',
    teacherId: 'user_teacher_1',
    teacherName: 'Faculty Lecturer',
    thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop',
    modulesCount: 5,
    lessonsCount: 14,
    enrolledCount: 62,
    rating: 4.9,
    status: 'active'
  },
  {
    id: 'course_2',
    code: 'CS-302',
    title: 'Database Management Systems & SQL Mastery',
    description: 'Relational data modeling, Normalization (1NF to BCNF), Indexing, Transactions, ACID guarantees, and advanced PostgreSQL queries.',
    subject: 'Computer Science',
    department: 'Computer Science & Engineering',
    courseYear: '2nd Year',
    teacherId: 'user_teacher_1',
    teacherName: 'Faculty Lecturer',
    thumbnail: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600&auto=format&fit=crop',
    modulesCount: 4,
    lessonsCount: 12,
    enrolledCount: 48,
    rating: 4.8,
    status: 'active'
  },
  {
    id: 'course_3',
    code: 'CS-303',
    title: 'Operating Systems Principles & Concurrency',
    description: 'Processes, CPU scheduling, thread synchronization, deadlocks, virtual memory management, and paging implementations.',
    subject: 'Computer Science',
    department: 'Computer Science & Engineering',
    courseYear: '3rd Year',
    teacherId: 'user_teacher_1',
    teacherName: 'Faculty Lecturer',
    thumbnail: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=600&auto=format&fit=crop',
    modulesCount: 4,
    lessonsCount: 10,
    enrolledCount: 53,
    rating: 4.7,
    status: 'active'
  },
  {
    id: 'course_4',
    code: 'CS-304',
    title: 'Modern Full-Stack Web Development',
    description: 'Build production-ready web apps with React 19, Node.js, Express, MongoDB, TailwindCSS, and RESTful API architecture.',
    subject: 'Computer Science',
    department: 'Computer Science & Engineering',
    courseYear: '1st Year',
    teacherId: 'user_teacher_1',
    teacherName: 'Faculty Lecturer',
    thumbnail: 'https://images.unsplash.com/photo-1593720219276-0b1eacd0aef4?w=600&auto=format&fit=crop',
    modulesCount: 6,
    lessonsCount: 18,
    enrolledCount: 75,
    rating: 4.9,
    status: 'active'
  }
];

export const seedLessons = [
  {
    id: 'lesson_1',
    courseId: 'course_1',
    title: 'Asymptotic Notation & Time Complexity',
    duration: '22 mins',
    order: 1,
    content: 'Comprehensive analysis of Big-O, Big-Omega, and Big-Theta notation with practical code walkthroughs.'
  },
  {
    id: 'lesson_2',
    courseId: 'course_1',
    title: 'Binary Search Trees & Node Balancing',
    duration: '28 mins',
    order: 2,
    content: 'Insertion, recursive search, deletion cases, and height balance properties in Binary Search Trees.'
  },
  {
    id: 'lesson_3',
    courseId: 'course_2',
    title: 'Relational Model & Keys (Primary, Foreign, Candidate)',
    duration: '20 mins',
    order: 1,
    content: 'Formal definition of relational schemas, tuple attributes, and referential integrity constraints.'
  },
  {
    id: 'lesson_4',
    courseId: 'course_3',
    title: 'Process Lifecycle & Context Switching',
    duration: '25 mins',
    order: 1,
    content: 'Understanding process states (Ready, Running, Blocked) and PCB data structures.'
  }
];

export const seedQuizzes = [
  {
    id: 'quiz_1',
    courseId: 'course_1',
    title: 'Data Structures - Trees & Complexity Quiz',
    subject: 'Computer Science',
    description: 'Test your understanding of tree traversals, search complexity, and binary tree balancing.',
    timeLimitMinutes: 15,
    totalQuestions: 4,
    passingScore: 70,
    teacherId: 'user_teacher_1',
    teacherName: 'Faculty Lecturer'
  },
  {
    id: 'quiz_2',
    courseId: 'course_2',
    title: 'DBMS - Normalization & SQL Queries Quiz',
    subject: 'Computer Science',
    description: 'Verify your proficiency in 1NF, 2NF, 3NF, BCNF, and relational integrity constraints.',
    timeLimitMinutes: 15,
    totalQuestions: 4,
    passingScore: 70,
    teacherId: 'user_teacher_1',
    teacherName: 'Faculty Lecturer'
  },
  {
    id: 'quiz_3',
    courseId: 'course_3',
    title: 'Operating Systems - Scheduling & Deadlocks Quiz',
    subject: 'Computer Science',
    description: 'Assessment covering Round Robin scheduling, banker algorithm, and synchronization primitives.',
    timeLimitMinutes: 15,
    totalQuestions: 4,
    passingScore: 70,
    teacherId: 'user_teacher_1',
    teacherName: 'Faculty Lecturer'
  }
];

export const seedQuestions = [
  // Questions for quiz_1
  {
    id: 'q_1',
    quizId: 'quiz_1',
    questionText: 'What is the worst-case time complexity of searching in an unbalanced Binary Search Tree?',
    options: ['O(1)', 'O(log N)', 'O(N)', 'O(N log N)'],
    correctOptionIndex: 2,
    explanation: 'When a BST is completely unbalanced (skewed), it degenerates into a linked list with O(N) lookup.',
    points: 25
  },
  {
    id: 'q_2',
    quizId: 'quiz_1',
    questionText: 'Which tree traversal yields elements of a Binary Search Tree in sorted ascending order?',
    options: ['Pre-order', 'In-order', 'Post-order', 'Level-order'],
    correctOptionIndex: 1,
    explanation: 'In-order traversal visits left subtree, root, and right subtree, producing ascending sorted keys.',
    points: 25
  },
  {
    id: 'q_3',
    quizId: 'quiz_1',
    questionText: 'What is the maximum number of nodes at level L (where root is level 0) in a binary tree?',
    options: ['2^L', '2^(L+1)', '2L', 'L^2'],
    correctOptionIndex: 0,
    explanation: 'Each level doubles the potential node capacity, yielding 2^L nodes at level L.',
    points: 25
  },
  {
    id: 'q_4',
    quizId: 'quiz_1',
    questionText: 'Which data structure is fundamentally used to implement Breadth-First Search (BFS)?',
    options: ['Stack', 'Queue', 'Priority Queue', 'Array List'],
    correctOptionIndex: 1,
    explanation: 'BFS uses a FIFO Queue to traverse level by level.',
    points: 25
  },

  // Questions for quiz_2
  {
    id: 'q_5',
    quizId: 'quiz_2',
    questionText: 'A relation is in Second Normal Form (2NF) if it is in 1NF and contains no:',
    options: ['Transitive dependencies', 'Partial functional dependencies', 'Multivalued attributes', 'Duplicate tuples'],
    correctOptionIndex: 1,
    explanation: '2NF eliminates partial dependencies where non-prime attributes depend on a proper subset of a candidate key.',
    points: 25
  },
  {
    id: 'q_6',
    quizId: 'quiz_2',
    questionText: 'Which SQL clause is used to filter aggregated group results produced by GROUP BY?',
    options: ['WHERE', 'HAVING', 'FILTER', 'LIMIT'],
    correctOptionIndex: 1,
    explanation: 'The HAVING clause filters aggregated groups after the GROUP BY evaluation.',
    points: 25
  },
  {
    id: 'q_7',
    quizId: 'quiz_2',
    questionText: 'Which property of ACID ensures all operations in a transaction either complete or none do?',
    options: ['Atomicity', 'Consistency', 'Isolation', 'Durability'],
    correctOptionIndex: 0,
    explanation: 'Atomicity guarantees an all-or-nothing execution unit.',
    points: 25
  },
  {
    id: 'q_8',
    quizId: 'quiz_2',
    questionText: 'Which type of JOIN returns all records from the left table and matched records from the right?',
    options: ['INNER JOIN', 'RIGHT OUTER JOIN', 'LEFT OUTER JOIN', 'FULL JOIN'],
    correctOptionIndex: 2,
    explanation: 'LEFT OUTER JOIN preserves every tuple from the left relation, filling NULLs for non-matches.',
    points: 25
  },

  // Questions for quiz_3
  {
    id: 'q_9',
    quizId: 'quiz_3',
    questionText: 'Which CPU scheduling algorithm is preemptive and allocates a fixed time quantum to each ready process?',
    options: ['First-Come, First-Served', 'Shortest Job First', 'Round Robin', 'Priority Scheduling'],
    correctOptionIndex: 2,
    explanation: 'Round Robin assigns each process a discrete time slice (quantum) in circular order.',
    points: 25
  },
  {
    id: 'q_10',
    quizId: 'quiz_3',
    questionText: 'Which of the following is NOT one of the four Coffman conditions necessary for deadlock?',
    options: ['Mutual Exclusion', 'Hold and Wait', 'Preemption Allowed', 'Circular Wait'],
    correctOptionIndex: 2,
    explanation: 'Deadlock requires No Preemption. If preemption is allowed, deadlock cannot occur.',
    points: 25
  },
  {
    id: 'q_11',
    quizId: 'quiz_3',
    questionText: 'What occurs when the OS spends more time swapping pages in and out of memory than executing processes?',
    options: ['Fragmentation', 'Thrashing', 'Starvation', 'Paging fault'],
    correctOptionIndex: 1,
    explanation: 'Thrashing occurs when high memory pressure causes continuous page fault handling.',
    points: 25
  },
  {
    id: 'q_12',
    quizId: 'quiz_3',
    questionText: 'A semaphore initialized to value 1 is commonly known as a:',
    options: ['Counting semaphore', 'Binary semaphore / Mutex', 'Condition variable', 'Spinlock buffer'],
    correctOptionIndex: 1,
    explanation: 'A binary semaphore has values 0 and 1, functioning as a mutual exclusion lock (mutex).',
    points: 25
  }
];

export const seedQuizAttempts = [
  {
    id: 'qa_1',
    quizId: 'quiz_1',
    studentId: 'user_student_1',
    studentName: 'Student Scholar',
    score: 100,
    totalPoints: 100,
    passed: true,
    percentage: 100,
    timeTakenSeconds: 150,
    answers: [
      { questionId: 'q_1', selectedOption: 1, isCorrect: true },
      { questionId: 'q_2', selectedOption: 2, isCorrect: true },
      { questionId: 'q_3', selectedOption: 0, isCorrect: true },
      { questionId: 'q_4', selectedOption: 2, isCorrect: true }
    ],
    attemptedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'qa_2',
    quizId: 'quiz_2',
    studentId: 'user_student_1',
    studentName: 'Student Scholar',
    score: 50,
    totalPoints: 100,
    passed: false,
    percentage: 50,
    timeTakenSeconds: 220,
    answers: [
      { questionId: 'q_5', selectedOption: 1, isCorrect: true },
      { questionId: 'q_6', selectedOption: 0, isCorrect: false },
      { questionId: 'q_7', selectedOption: 1, isCorrect: false },
      { questionId: 'q_8', selectedOption: 2, isCorrect: true }
    ],
    attemptedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  }
];

export const seedNotes = [
  {
    id: 'note_1',
    studentId: 'user_student_1',
    studentName: 'Student Scholar',
    title: 'Time Complexity Quick Reference',
    content: 'O(1): Direct array index\nO(log N): Binary Search, BST balanced search\nO(N): Linear scan\nO(N log N): MergeSort, QuickSort (avg), HeapSort\nO(N^2): BubbleSort, InsertionSort',
    category: 'Computer Science',
    tags: ['DSA', 'Algorithms', 'Complexity'],
    color: '#3B82F6',
    isPinned: true,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'note_2',
    studentId: 'user_student_1',
    studentName: 'Student Scholar',
    title: 'SQL Normalization Rules Checklist',
    content: '1NF: Atomic values, unique column names, no repeating groups.\n2NF: 1NF + no partial dependency on composite primary key.\n3NF: 2NF + no transitive dependency.\nBCNF: For every functional dependency X -> Y, X is a superkey.',
    category: 'Database Systems',
    tags: ['SQL', 'DBMS', 'Normalization'],
    color: '#8B5CF6',
    isPinned: false,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  }
];

export const seedBookmarks = [
  {
    id: 'bm_1',
    studentId: 'user_student_1',
    itemType: 'material',
    itemId: 'mat_1',
    title: 'Data Structures & Algorithms Complete Reference Handbook',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  },
  {
    id: 'bm_2',
    studentId: 'user_student_1',
    itemType: 'course',
    itemId: 'course_1',
    title: 'Data Structures & Algorithms in Python & C++',
    url: '/student/courses'
  }
];

export const seedProgress = [
  {
    id: 'prog_1',
    studentId: 'user_student_1',
    studentName: 'Student Scholar',
    courseId: 'course_1',
    courseTitle: 'Data Structures & Algorithms in Python & C++',
    completedLessons: ['les_1', 'les_2'],
    percentage: 65,
    studyStreakDays: 6,
    totalStudyMinutes: 320,
    lastActiveAt: new Date()
  },
  {
    id: 'prog_2',
    studentId: 'user_student_1',
    studentName: 'Student Scholar',
    courseId: 'course_2',
    courseTitle: 'Database Management Systems & SQL Mastery',
    completedLessons: ['les_3'],
    percentage: 40,
    studyStreakDays: 6,
    totalStudyMinutes: 180,
    lastActiveAt: new Date()
  }
];

export const seedNotifications = [
  {
    id: 'noti_1',
    notificationId: 101,
    notiMessage: 'Mid-semester coursework assignment submissions are open. Please review due dates.',
    notiDt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'noti_2',
    notificationId: 102,
    notiMessage: 'New reference notes on Database Management & SQL have been published to the study library.',
    notiDt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'noti_3',
    notificationId: 103,
    notiMessage: 'Practice Quizzes for Data Structures and Operating Systems are now accessible.',
    notiDt: new Date()
  }
];

export const seedEnquiries = [
  {
    id: 'enq_1',
    enquiryId: 1,
    name: 'Ananya Roy',
    email: 'ananya.roy@example.com',
    mobileNo: '9876500001',
    course: 'Computer Science & Engineering',
    message: 'I would like to inquire about the admission criteria and syllabus for the upcoming academic session.',
    enquiryDt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'enq_2',
    enquiryId: 2,
    name: 'Vikram Mehta',
    email: 'vikram.m@example.com',
    mobileNo: '9876500002',
    course: 'Information Technology',
    message: 'Are online certification credits transferable toward the 2nd year curriculum?',
    enquiryDt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  }
];

export const seedStudyMaterials = [
  {
    id: 'mat_1',
    materialId: 1,
    subject: 'Computer Science',
    title: 'Data Structures & Algorithms Complete Reference Handbook',
    description: 'Comprehensive guide covering asymptotic analysis, trees, graphs, sorting, dynamic programming, and interview problems.',
    fileName: 'DSA_Comprehensive_Guide.pdf',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    uploadDt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'mat_2',
    materialId: 2,
    subject: 'Computer Science',
    title: 'Database Management Systems & SQL Query Architecture',
    description: 'In-depth notes on relational algebra, normalization steps, indexing strategies, and PostgreSQL queries.',
    fileName: 'DBMS_Architecture_SQL_Notes.pdf',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    uploadDt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'mat_3',
    materialId: 3,
    subject: 'Computer Science',
    title: 'Operating Systems Principles & Scheduling Algorithms',
    description: 'Handwritten notes on process synchronization, mutex locks, CPU scheduling, and virtual memory paging.',
    fileName: 'OS_Principles_Handwritten_Notes.pdf',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    uploadDt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'mat_4',
    materialId: 4,
    subject: 'Computer Science',
    title: 'Computer Networks Protocols & OSI 7-Layer Model Guide',
    description: 'Quick reference sheet detailing IP addressing, subnetting, TCP three-way handshake, UDP, and DNS resolution.',
    fileName: 'Computer_Networks_Reference.pdf',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    uploadDt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  }
];

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
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
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
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'asg_3',
    title: 'Database Systems - Normalized Schema Design & SQL Queries',
    subject: 'Computer Science',
    description: 'Design a 3NF normalized schema for an E-commerce platform. Write SQL queries for top-selling products, customer order histories, and inventory triggers.',
    teacherId: 'user_teacher_1',
    teacherName: process.env.SEED_TEACHER_NAME || 'Faculty Lecturer',
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    totalPoints: 75,
    resourceLink: '',
    attachmentUrl: '',
    attachmentName: '',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
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
    submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    status: 'graded',
    grade: 92,
    totalPoints: 100,
    feedback: 'Excellent work! Clean and modular class structure. All traversal edge cases passed.',
    gradedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    gradedBy: process.env.SEED_TEACHER_NAME || 'Faculty Lecturer'
  },
  {
    id: 'sub_demo_2',
    assignmentId: 'asg_1',
    studentId: 'user_student_2',
    studentName: 'Priya Sharma',
    submissionText: 'Created AVL self-balancing tree node rotation functions in C++ with detailed comments.',
    attachmentUrl: '',
    fileName: 'AVL_Tree_Solution.cpp',
    fileSize: '68.4 KB',
    submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    status: 'submitted',
    grade: null,
    totalPoints: 100,
    feedback: '',
    gradedAt: null,
    gradedBy: null
  },
  {
    id: 'sub_demo_3',
    assignmentId: 'asg_3',
    studentId: 'user_student_1',
    studentName: process.env.SEED_STUDENT_NAME || 'Student Scholar',
    submissionText: 'Designed 3NF database schema for orders, customers, and order_items with sample queries.',
    attachmentUrl: '',
    fileName: 'ecommerce_schema.sql',
    fileSize: '32.1 KB',
    submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    status: 'graded',
    grade: 70,
    totalPoints: 75,
    feedback: 'Very solid relational design. Foreign key cascading constraints are properly configured.',
    gradedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    gradedBy: process.env.SEED_TEACHER_NAME || 'Faculty Lecturer'
  }
];

export const seedSupportMessages = [
  {
    id: 'msg_1',
    userId: 'user_student_1',
    userName: 'Student Scholar',
    userRole: 'student',
    subject: 'Issue submitting large PDF assignments',
    category: 'Technical Support',
    message: 'Hello, when uploading a PDF assignment over 15MB, does the platform support multipart uploads or should we compress the document first?',
    status: 'pending',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    adminReply: ''
  },
  {
    id: 'msg_2',
    userId: 'user_student_2',
    userName: 'Priya Sharma',
    userRole: 'student',
    subject: 'Request for CS-301 supplementary reading materials',
    category: 'Academic Query',
    message: 'Could the department upload reference slides for Red-Black Tree balancing and rotations?',
    status: 'resolved',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    adminReply: 'Reference materials on balanced BSTs and Red-Black trees have been added to the Study Materials library.'
  }
];

export const seedFeedback = [
  {
    id: 'fb_1',
    userId: 'user_student_1',
    userName: 'Student Scholar',
    userRole: 'student',
    rating: 5,
    category: 'Platform Usability',
    feedbackText: 'The assignment submission flow and instant grade feedback cards are extremely convenient and clear!',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'fb_2',
    userId: 'user_teacher_1',
    userName: 'Faculty Lecturer',
    userRole: 'teacher',
    rating: 5,
    category: 'Grading Tools',
    feedbackText: 'Grading coursework submissions and attaching personalized qualitative feedback is seamless.',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  }
];

export const seedTeacherQuestions = [
  {
    id: 'tq_1',
    studentId: 'user_student_1',
    studentName: process.env.SEED_STUDENT_NAME || 'Student Scholar',
    studentEmail: 'student@estudy.com',
    teacherId: 'user_teacher_1',
    teacherName: process.env.SEED_TEACHER_NAME || 'Faculty Lecturer',
    assignmentId: 'asg_1',
    assignmentTitle: 'Data Structures & Algorithms - Binary Search Trees Implementation',
    subject: 'Computer Science',
    title: 'How should we handle memory deallocation in binary tree node deletion?',
    question: 'In Assignment 1, when deleting a node with two children, should we replace it with the inorder successor or predecessor? Also, does it matter if we preserve the left or right subtree balance?',
    status: 'answered',
    teacherReply: 'Great question! Either inorder successor or predecessor is theoretically valid, but conventionally we use the in-order successor (the smallest node in the right subtree). Make sure to properly update the parent pointers when detaching the replacement node.',
    repliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'tq_2',
    studentId: 'user_student_2',
    studentName: 'Priya Sharma',
    studentEmail: 'priya@estudy.com',
    teacherId: 'user_teacher_1',
    teacherName: process.env.SEED_TEACHER_NAME || 'Faculty Lecturer',
    assignmentId: 'asg_2',
    assignmentTitle: 'Operating Systems - Process Scheduling Simulator',
    subject: 'Operating Systems',
    title: 'Clarification on Round Robin time quantum edge case',
    question: 'If a process finishes its CPU burst at the exact same millisecond that its time quantum expires, should it be placed in the termination queue before or after a newly arriving process enters the ready queue?',
    status: 'pending',
    teacherReply: '',
    repliedAt: null,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  }
];

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
  [Feedback, seedFeedback],
  [TeacherQuestion, seedTeacherQuestions]
];

export const seedDatabase = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/estudy_db';
  await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 5000 });

  let upsertedCount = 0;
  for (const [Model, documents] of seedCollections) {
    for (const document of documents) {
      const filter = document.id ? { id: document.id } : { email: document.email };
      const result = await Model.updateOne(
        filter,
        { $set: document },
        { upsert: true }
      );
      if (result.upsertedCount || result.modifiedCount) upsertedCount++;
    }
  }

  console.log(`Seed complete. Synchronized ${upsertedCount} document(s) with MongoDB.`);
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
