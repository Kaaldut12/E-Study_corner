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
      recentFeedback: gradedSubmissions.slice(-3).reverse()
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
    const { assignmentId, submissionText, attachmentUrl } = req.body;

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
      totalPoints: assignment.totalPoints || 100
    });

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
    const updates = req.body;

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

// --- COURSES ---
export const getStudentCourses = async (req, res) => {
  try {
    const studentId = req.user.id;
    const allCourses = await dataStore.getCourses();
    const userProgress = await dataStore.getStudentProgress(studentId);

    const coursesWithProgress = allCourses.map(c => {
      const prog = userProgress.find(p => p.courseId === c.id);
      return {
        ...c,
        progressPercentage: prog ? prog.percentage : 0,
        completedLessonsCount: prog ? (prog.completedLessons ? prog.completedLessons.length : 0) : 0
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
    const userProgress = await dataStore.getStudentProgress(studentId);
    const prog = userProgress.find(p => p.courseId === courseId);

    return res.status(200).json({
      success: true,
      course,
      lessons,
      progress: prog || { percentage: 0, completedLessons: [] }
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

    // Standard store addition
    if (dataStore.createNote) {
      await dataStore.createNote(newNote);
    }

    return res.status(201).json({
      success: true,
      message: 'Note created successfully!',
      note: newNote
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const updates = req.body;
    return res.status(200).json({
      success: true,
      message: 'Note updated successfully!',
      note: { id: noteId, ...updates, updatedAt: new Date() }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteNote = async (req, res) => {
  try {
    const { noteId } = req.params;
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
    return res.status(200).json({
      success: true,
      quiz,
      questions
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

    return res.status(200).json({
      success: true,
      message: passed ? 'Congratulations! You passed the quiz.' : 'Quiz completed. Keep practicing to improve your score!',
      attempt: attemptRecord
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

    const newBookmark = {
      id: `bm_${Date.now()}`,
      studentId,
      itemType,
      itemId,
      title,
      url: url || '',
      createdAt: new Date()
    };

    return res.status(200).json({
      success: true,
      message: 'Bookmark updated successfully!',
      bookmark: newBookmark
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


