// backend/controllers/studentControllers.js
import { dataStore } from '../src/services/dataStore.js';

export const getStudentDashboard = async (req, res) => {
  try {
    const studentId = req.user.id;
    const allAssignments = await dataStore.getAssignments();
    const studentSubmissions = await dataStore.getSubmissionsForStudent(studentId);

    const pendingAssignments = allAssignments.filter(a => {
      return !studentSubmissions.some(s => s.assignmentId === a.id);
    });

    const gradedSubmissions = studentSubmissions.filter(s => s.status === 'graded');
    const totalScoreEarned = gradedSubmissions.reduce((acc, curr) => acc + (curr.grade || 0), 0);
    const totalPossiblePoints = gradedSubmissions.reduce((acc, curr) => acc + (curr.totalPoints || 100), 0);
    const averageGradePercentage = totalPossiblePoints > 0 ? Math.round((totalScoreEarned / totalPossiblePoints) * 100) : 0;

    const enrichedFeedback = gradedSubmissions.slice(-3).reverse().map(sub => {
      const asg = allAssignments.find(a => a.id === sub.assignmentId);
      return {
        ...sub,
        assignmentTitle: asg ? asg.title : 'Coursework Assignment',
        subject: asg ? asg.subject : 'Academics'
      };
    });

    return res.status(200).json({
      success: true,
      stats: {
        totalAssigned: allAssignments.length,
        pendingCount: pendingAssignments.length,
        submittedCount: studentSubmissions.length,
        gradedCount: gradedSubmissions.length,
        averageGradePercentage
      },
      upcomingAssignments: pendingAssignments.slice(0, 3),
      recentFeedback: enrichedFeedback
    });
  } catch (error) {
    console.error('Error in getStudentDashboard:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getStudentAssignments = async (req, res) => {
  try {
    const studentId = req.user.id;
    const allAssignments = await dataStore.getAssignments();
    const studentSubmissions = await dataStore.getSubmissionsForStudent(studentId);

    const assignmentsWithStatus = allAssignments.map(asg => {
      const submission = studentSubmissions.find(s => s.assignmentId === asg.id);
      return {
        ...asg,
        submission: submission || null,
        status: submission ? submission.status : 'pending'
      };
    });

    return res.status(200).json({
      success: true,
      assignments: assignmentsWithStatus
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const submitAssignment = async (req, res) => {
  try {
    const studentId = req.user.id;
    const studentName = req.user.name;
    const assignmentId = req.params.id || req.body.assignmentId;
    const { submissionText, attachmentUrl, fileName, fileSize } = req.body;

    if (!assignmentId) {
      return res.status(400).json({ success: false, message: 'Assignment ID is required.' });
    }

    const assignment = await dataStore.getAssignmentById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found.' });
    }

    const submission = await dataStore.createSubmission({
      assignmentId,
      studentId,
      studentName,
      submissionText: submissionText || '',
      attachmentUrl: attachmentUrl || '',
      fileName: fileName || '',
      fileSize: fileSize || '',
      totalPoints: assignment.totalPoints || 100
    });

    // Post notification for student's record / activity feed
    try {
      await dataStore.createNotification(`Student ${studentName} turned in coursework for: ${assignment.title}`);
    } catch (e) {
      console.warn('Failed to post submission notification:', e.message);
    }

    return res.status(200).json({
      success: true,
      message: 'Assignment submitted successfully!',
      submission
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getStudentFeedback = async (req, res) => {
  try {
    const studentId = req.user.id;
    const studentSubmissions = await dataStore.getSubmissionsForStudent(studentId);
    const allAssignments = await dataStore.getAssignments();

    const gradedSubmissions = studentSubmissions
      .filter(s => s.status === 'graded')
      .map(s => {
        const asg = allAssignments.find(a => a.id === s.assignmentId);
        return {
          ...s,
          assignmentTitle: asg ? asg.title : 'Assignment',
          subject: asg ? asg.subject : 'General'
        };
      });

    return res.status(200).json({
      success: true,
      feedbackList: gradedSubmissions
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const sendContactMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const userName = req.user.name;
    const userRole = req.user.role;
    const { subject, category, message } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ success: false, message: 'Subject and message are required.' });
    }

    const ticket = await dataStore.createSupportMessage({
      userId,
      userName,
      userRole,
      subject,
      category: category || 'General Support',
      message
    });

    return res.status(201).json({
      success: true,
      message: 'Support request submitted to Administrator.',
      ticket
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getStudyMaterials = async (req, res) => {
  try {
    const materials = await dataStore.getStudyMaterials();
    return res.status(200).json({
      success: true,
      materials
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const studentId = req.user.id;
    
    // Security: Only allow updating safe profile attributes, never permissions, role, email, password, or id
    const ALLOWED_PROFILE_FIELDS = [
      'name', 'firstName', 'lastName', 'gender', 'mobileNo',
      'dob', 'addressP', 'course', 'courseYear', 'userpic'
    ];
    const updates = {};
    ALLOWED_PROFILE_FIELDS.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updated = await dataStore.updateUser(studentId, updates);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    const { password: _, ...userNoPass } = updated;
    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      user: userNoPass
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { Pass, NewPass, ConfPass } = req.body;

    if (!Pass || !NewPass || !ConfPass) {
      return res.status(400).json({ success: false, message: 'Current, new, and confirm password fields are required.' });
    }

    if (NewPass !== ConfPass) {
      return res.status(400).json({ success: false, message: 'New password and confirm password do not match.' });
    }

    const result = await dataStore.changeUserPassword(studentId, Pass, NewPass);
    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== V1 FOUNDATION EXTENSIONS ====================

// --- COURSES & ENROLLMENT ---
export const getStudentCourses = async (req, res) => {
  try {
    const studentId = req.user.id;
    const allCourses = await dataStore.getCourses();
    const userProgress = await dataStore.getStudentProgress(studentId);
    const enrollments = await dataStore.getStudentEnrollments(studentId);

    const coursesWithProgress = allCourses.map(c => {
      const enrollment = enrollments.find(e => e.courseId === c.id);
      const prog = userProgress.find(p => p.courseId === c.id);
      const isEnrolled = !!enrollment;
      const completedLessons = enrollment ? (enrollment.completedLessons || []) : (prog ? (prog.completedLessons || []) : []);
      const progressPercentage = enrollment ? enrollment.progressPercentage : (prog ? prog.percentage : 0);

      return {
        ...c,
        isEnrolled,
        enrollmentStatus: enrollment ? enrollment.status : 'not_enrolled',
        progressPercentage,
        completedLessonsCount: completedLessons.length
      };
    });

    return res.status(200).json({
      success: true,
      courses: coursesWithProgress
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.id;
    const allCourses = await dataStore.getCourses();
    const course = allCourses.find(c => c.id === courseId);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const lessons = await dataStore.getLessonsForCourse(courseId);
    const enrollment = await dataStore.getEnrollment(studentId, courseId);
    const userProgress = await dataStore.getStudentProgress(studentId);
    const prog = userProgress.find(p => p.courseId === courseId);

    const isEnrolled = !!enrollment;
    const completedLessons = enrollment ? (enrollment.completedLessons || []) : (prog ? (prog.completedLessons || []) : []);
    const percentage = enrollment ? enrollment.progressPercentage : (prog ? prog.percentage : 0);

    return res.status(200).json({
      success: true,
      course: {
        ...course,
        isEnrolled,
        enrollmentStatus: enrollment ? enrollment.status : 'not_enrolled'
      },
      lessons,
      isEnrolled,
      progress: {
        percentage,
        completedLessons
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const enrollCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.id;
    const studentName = req.user.name;

    const course = await dataStore.getCourseById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const enrollment = await dataStore.enrollStudentInCourse(studentId, studentName, courseId, course.title);

    try {
      await dataStore.createNotification(`Welcome to ${course.title}! You are successfully enrolled.`);
    } catch (e) {
      console.warn('Enrollment notification warning:', e.message);
    }

    return res.status(200).json({
      success: true,
      message: `Enrolled in ${course.title} successfully!`,
      enrollment
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const completeLesson = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const studentId = req.user.id;
    const studentName = req.user.name;

    const result = await dataStore.completeStudentLesson(studentId, studentName, courseId, lessonId);

    return res.status(200).json({
      success: true,
      message: 'Lesson marked as completed!',
      ...result
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// --- NOTES ---
export const getNotes = async (req, res) => {
  try {
    const studentId = req.user.id;
    const notes = await dataStore.getStudentNotes(studentId);
    return res.status(200).json({
      success: true,
      notes
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createNote = async (req, res) => {
  try {
    const studentId = req.user.id;
    const studentName = req.user.name;
    const { title, content, category, tags, courseId, lessonId, isPinned, color } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Note title and content are required.' });
    }

    const newNote = {
      id: `note_${Date.now()}`,
      studentId,
      studentName,
      title,
      content,
      category: category || 'General',
      tags: tags || [],
      courseId: courseId || null,
      lessonId: lessonId || null,
      isPinned: !!isPinned,
      isArchived: false,
      color: color || '#3B82F6',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const note = await dataStore.createNote(newNote);

    return res.status(201).json({
      success: true,
      message: 'Note created successfully!',
      note
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const updates = req.body;
    const studentId = req.user.id;
    const note = await dataStore.updateNote(noteId, { ...updates, updatedAt: new Date() }, studentId);
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found or unauthorized' });
    }
    return res.status(200).json({
      success: true,
      message: 'Note updated successfully!',
      note
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const studentId = req.user.id;
    const deleted = await dataStore.deleteNote(noteId, studentId);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Note not found or unauthorized' });
    }
    return res.status(200).json({
      success: true,
      message: 'Note deleted successfully.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// --- GLOBAL SEARCH ---
export const searchAll = async (req, res) => {
  try {
    const query = (req.query.q || '').toLowerCase().trim();
    if (!query) {
      return res.status(200).json({ success: true, results: { courses: [], materials: [], notes: [] } });
    }

    const courses = await dataStore.getCourses();
    const materials = await dataStore.getStudyMaterials();
    const notes = await dataStore.getStudentNotes(req.user.id);

    const filteredCourses = courses.filter(c =>
      c.title.toLowerCase().includes(query) ||
      c.subject.toLowerCase().includes(query) ||
      c.description.toLowerCase().includes(query)
    );

    const filteredMaterials = materials.filter(m =>
      m.title.toLowerCase().includes(query) ||
      m.subject.toLowerCase().includes(query) ||
      m.description.toLowerCase().includes(query)
    );

    const filteredNotes = notes.filter(n =>
      n.title.toLowerCase().includes(query) ||
      n.content.toLowerCase().includes(query) ||
      n.category.toLowerCase().includes(query)
    );

    return res.status(200).json({
      success: true,
      query,
      results: {
        courses: filteredCourses,
        materials: filteredMaterials,
        notes: filteredNotes
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== V2 LEARNING SYSTEM EXTENSIONS ====================

// --- QUIZZES ---
export const getStudentQuizzes = async (req, res) => {
  try {
    const studentId = req.user.id;
    const quizzes = await dataStore.getQuizzes();
    const attempts = dataStore.getQuizAttempts ? await dataStore.getQuizAttempts(studentId) : [];

    const quizzesWithStatus = quizzes.map(q => {
      const studentAttempts = attempts.filter(a => a.quizId === q.id);
      const bestAttempt = studentAttempts.sort((a, b) => b.score - a.score)[0];
      return {
        ...q,
        attemptCount: studentAttempts.length,
        bestScore: bestAttempt ? bestAttempt.score : null,
        passed: bestAttempt ? bestAttempt.passed : false
      };
    });

    return res.status(200).json({
      success: true,
      quizzes: quizzesWithStatus
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getQuizQuestions = async (req, res) => {
  try {
    const { quizId } = req.params;
    const quizzes = await dataStore.getQuizzes();
    const quiz = quizzes.find(q => q.id === quizId);

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    const questions = await dataStore.getQuestionsForQuiz(quizId);
    // Security: Strip correctOptionIndex and explanation so answer keys are not leaked to students over the wire
    const sanitizedQuestions = questions.map(({ correctOptionIndex, explanation, ...rest }) => rest);

    return res.status(200).json({
      success: true,
      quiz,
      questions: sanitizedQuestions
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const submitQuizAttempt = async (req, res) => {
  try {
    const studentId = req.user.id;
    const studentName = req.user.name;
    const { quizId, userAnswers, timeTakenSeconds } = req.body;

    const quizzes = await dataStore.getQuizzes();
    const quiz = quizzes.find(q => q.id === quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    const questions = await dataStore.getQuestionsForQuiz(quizId);
    let totalScore = 0;
    const maxScore = questions.reduce((acc, q) => acc + (q.points || 10), 0);

    const processedAnswers = questions.map(q => {
      const selectedOption = userAnswers ? userAnswers[q.id] : null;
      const isCorrect = selectedOption === q.correctOptionIndex;
      if (isCorrect) totalScore += (q.points || 10);
      return {
        questionId: q.id,
        selectedOption,
        correctOptionIndex: q.correctOptionIndex,
        isCorrect,
        explanation: q.explanation
      };
    });

    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
    const passed = percentage >= (quiz.passingScore || 70);

    const attemptRecord = {
      id: `att_${Date.now()}`,
      quizId,
      quizTitle: quiz.title,
      studentId,
      studentName,
      score: totalScore,
      totalPoints: maxScore,
      percentage,
      passed,
      timeTakenSeconds: timeTakenSeconds || 180,
      answers: processedAnswers,
      attemptedAt: new Date()
    };

    const savedAttempt = await dataStore.saveQuizAttempt(attemptRecord);

    return res.status(200).json({
      success: true,
      message: passed ? 'Congratulations! You passed the quiz.' : 'Quiz completed. Keep practicing to improve your score!',
      attempt: savedAttempt
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// --- BOOKMARKS ---
export const getStudentBookmarks = async (req, res) => {
  try {
    const studentId = req.user.id;
    const bookmarks = await dataStore.getStudentBookmarks(studentId);
    return res.status(200).json({
      success: true,
      bookmarks
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleBookmark = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { itemType, itemId, title, url } = req.body;

    if (!itemType || !itemId || !title) {
      return res.status(400).json({ success: false, message: 'itemType, itemId, and title are required.' });
    }

    const result = await dataStore.toggleBookmark(studentId, itemType, itemId, title, url);

    return res.status(200).json({
      success: true,
      message: result.action === 'added' ? 'Bookmark added!' : 'Bookmark removed.',
      ...result
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteBookmark = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { bookmarkId } = req.params;
    await dataStore.deleteBookmark(studentId, bookmarkId);
    return res.status(200).json({
      success: true,
      message: 'Bookmark removed successfully.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// --- PROGRESS TRACKING ---
export const getStudentProgressStats = async (req, res) => {
  try {
    const studentId = req.user.id;
    const progressRecords = await dataStore.getStudentProgress(studentId);
    const notes = await dataStore.getStudentNotes(studentId);

    const totalStudyMinutes = progressRecords.reduce((acc, curr) => acc + (curr.totalStudyMinutes || 0), 240);
    const studyStreakDays = progressRecords.length > 0 ? (progressRecords[0].studyStreakDays || 5) : 5;

    const subjectSkills = [
      { name: 'Data Structures & Algorithms', percentage: 80, color: 'from-indigo-500 to-purple-500' },
      { name: 'Database Management Systems (SQL)', percentage: 65, color: 'from-purple-500 to-pink-500' },
      { name: 'Web Development & React.js', percentage: 55, color: 'from-emerald-500 to-teal-500' },
      { name: 'Computer Networks & TCP/IP', percentage: 40, color: 'from-amber-500 to-orange-500' }
    ];

    return res.status(200).json({
      success: true,
      stats: {
        totalStudyMinutes,
        studyStreakDays,
        completedCoursesCount: 2,
        activeNotesCount: notes.length,
        subjectSkills
      },
      courseProgress: progressRecords
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// --- NOTIFICATIONS ---
export const getStudentNotifications = async (req, res) => {
  try {
    const notifications = await dataStore.getNotifications();
    return res.status(200).json({
      success: true,
      notifications
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== V3 ADVANCED LEARNING EXTENSIONS ====================

// --- AI COACH ---
export const askAICoach = async (req, res) => {
  try {
    const { prompt, category } = req.body;
    const userPrompt = (prompt || '').toLowerCase();

    let reply = {
      explanation: 'AI Coach recommendation: Focus on mastering fundamental principles and reviewing key code examples.',
      codeSnippet: '',
      practiceQuestions: [],
      recommendedTopic: 'Data Structures & Algorithms'
    };

    if (userPrompt.includes('tree') || userPrompt.includes('dsa') || userPrompt.includes('c++')) {
      reply = {
        explanation: 'In Binary Search Trees (BST), every node in the left subtree has a key smaller than the root, and every node in the right subtree has a key greater than the root. Search, insertion, and deletion operate in O(log N) time on average.',
        codeSnippet: `class Node {\npublic:\n    int data;\n    Node* left;\n    Node* right;\n    Node(int val) : data(val), left(nullptr), right(nullptr) {}\n};`,
        practiceQuestions: [
          'What is the worst-case search time complexity of an unbalanced BST?',
          'Explain the difference between In-Order, Pre-Order, and Post-Order tree traversals.'
        ],
        recommendedTopic: 'Binary Search Trees & Re-balancing'
      };
    } else if (userPrompt.includes('sql') || userPrompt.includes('dbms') || userPrompt.includes('join')) {
      reply = {
        explanation: 'SQL JOINs combine rows from two or more tables based on a related column between them. INNER JOIN selects records with matching values in both tables, whereas LEFT JOIN returns all records from the left table and matched records from the right table.',
        codeSnippet: `SELECT Students.name, Courses.title\nFROM Students\nINNER JOIN Enrollments ON Students.id = Enrollments.student_id\nINNER JOIN Courses ON Enrollments.course_id = Courses.id;`,
        practiceQuestions: [
          'What happens when a LEFT JOIN finds no match in the right table?',
          'Which normal form eliminates partial dependencies?'
        ],
        recommendedTopic: 'Database Normalization (3NF & BCNF)'
      };
    } else if (userPrompt.includes('plan') || userPrompt.includes('schedule') || userPrompt.includes('exam')) {
      reply = {
        explanation: 'Here is your personalized 7-Day AI Revision Plan:\n• Days 1-2: Review Data Structures (Arrays, Linked Lists, BSTs).\n• Days 3-4: DBMS Normalization & SQL Query Optimization.\n• Days 5-6: Web Development (React hooks, JWT Auth).\n• Day 7: Full practice quiz simulations and final notes revision.',
        codeSnippet: '',
        practiceQuestions: ['Complete 2 practice quizzes daily', 'Review pinned notes for 30 minutes every morning'],
        recommendedTopic: 'Exam Revision Timetable'
      };
    } else {
      reply = {
        explanation: `AI Coach response for "${prompt}": Learning is a step-by-step process. Break down complex topics into smaller modules, practice code implementations daily, and solve practice quizzes to reinforce memory retention.`,
        codeSnippet: `// Practice makes perfect!\nconsole.log("Keep learning with E-Study Corner!");`,
        practiceQuestions: ['Solve today\'s practice quiz', 'Create a personal note summarizing key concepts'],
        recommendedTopic: 'Core Subject Concepts'
      };
    }

    return res.status(200).json({
      success: true,
      prompt,
      category: category || 'General Coaching',
      response: reply
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// --- AI RECOMMENDATIONS ---
export const getAIRecommendations = async (req, res) => {
  try {
    const studentId = req.user.id;
    const courses = await dataStore.getCourses();
    const materials = await dataStore.getStudyMaterials();

    const recommendedCourses = courses.slice(0, 2);
    const recommendedMaterials = materials.slice(0, 2);

    return res.status(200).json({
      success: true,
      recommendations: {
        courses: recommendedCourses,
        materials: recommendedMaterials,
        nextRecommendedTopic: 'Tree Traversals & Graph Search Algorithms',
        reasoning: 'Based on your 80% score in DSA Fundamentals, we recommend advancing to Graph Algorithms.'
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// --- WEAK TOPIC DETECTION ---
export const getWeakTopicAnalysis = async (req, res) => {
  try {
    const studentId = req.user.id;
    const attempts = await dataStore.getQuizAttempts(studentId);
    const quizzes = await dataStore.getQuizzes();

    let totalQuestionsAnswered = 0;
    let totalCorrect = 0;
    const incorrectQuestions = [];

    for (const att of attempts) {
      if (att.answers && Array.isArray(att.answers)) {
        for (const ans of att.answers) {
          totalQuestionsAnswered++;
          if (ans.isCorrect) {
            totalCorrect++;
          } else {
            incorrectQuestions.push({ quizId: att.quizId, questionId: ans.questionId });
          }
        }
      }
    }

    const overallDiagnosticScore = totalQuestionsAnswered > 0
      ? Math.round((totalCorrect / totalQuestionsAnswered) * 100)
      : 78;

    let weakTopics = [];
    if (incorrectQuestions.length > 0) {
      for (const item of incorrectQuestions.slice(0, 4)) {
        const quiz = quizzes.find(q => q.id === item.quizId);
        const questions = await dataStore.getQuestionsForQuiz(item.quizId);
        const qDoc = questions.find(q => q.id === item.questionId);
        weakTopics.push({
          topic: qDoc ? qDoc.questionText.slice(0, 55) + '...' : 'Practice Quiz Item Review',
          subject: quiz ? quiz.subject : 'Computer Science',
          accuracy: Math.floor(Math.random() * 25 + 30),
          status: 'Needs Practice',
          recommendation: qDoc && qDoc.explanation ? qDoc.explanation : 'Review course study materials and re-take topic quiz.',
          actionUrl: '/student/quizzes'
        });
      }
    } else {
      weakTopics = [
        {
          topic: 'Data Structures & Algorithmic Complexities',
          subject: 'Computer Science',
          accuracy: 90,
          status: 'Mastered',
          recommendation: 'Exceptional performance across all attempted quizzes. Keep practicing full mock assessments.',
          actionUrl: '/student/quizzes'
        }
      ];
    }

    return res.status(200).json({
      success: true,
      weakTopics,
      overallDiagnosticScore
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== DIRECT TEACHER Q&A & DOUBTS ====================

export const getAvailableTeachers = async (req, res) => {
  try {
    const teachers = await dataStore.getTeachersList();
    return res.status(200).json({
      success: true,
      teachers
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getStudentQuestions = async (req, res) => {
  try {
    const studentId = req.user.id;
    const questions = await dataStore.getTeacherQuestionsForStudent(studentId);
    return res.status(200).json({
      success: true,
      questions
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const askTeacherQuestion = async (req, res) => {
  try {
    const studentId = req.user.id;
    const studentName = req.user.name || 'Student Scholar';
    const studentEmail = req.user.email || '';
    const { teacherId, teacherName, assignmentId, assignmentTitle, subject, title, question } = req.body;

    if (!teacherId || !title || !question) {
      return res.status(400).json({
        success: false,
        message: 'Teacher selection, question title, and question body are required.'
      });
    }

    let resolvedTeacherName = teacherName;
    if (!resolvedTeacherName) {
      const teacherUser = await dataStore.getUserById(teacherId);
      resolvedTeacherName = teacherUser ? teacherUser.name : 'Faculty Instructor';
    }

    const newQuestion = await dataStore.createTeacherQuestion({
      studentId,
      studentName,
      studentEmail,
      teacherId,
      teacherName: resolvedTeacherName,
      assignmentId: assignmentId || '',
      assignmentTitle: assignmentTitle || '',
      subject: subject || 'Academic Doubt',
      title: title.trim(),
      question: question.trim()
    });

    if (dataStore.createNotification) {
      await dataStore.createNotification(`New academic doubt from ${studentName}: "${title.slice(0, 45)}..."`);
    }

    return res.status(201).json({
      success: true,
      message: `Your question has been sent directly to ${resolvedTeacherName}!`,
      question: newQuestion
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};



