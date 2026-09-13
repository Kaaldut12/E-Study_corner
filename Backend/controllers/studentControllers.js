// backend/controllers/studentControllers.js
import { dataStore } from '../src/services/dataStore.js';
import { generateAICoachResponse } from '../src/services/aiCoachEngine.js';

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

    // Verify student is enrolled in the course associated with this assignment
    if (assignment.courseId) {
      const enrollment = await dataStore.getEnrollment(studentId, assignment.courseId);
      if (!enrollment) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You must be actively enrolled in this course to submit assignments.'
        });
      }
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

export const getStudentTickets = async (req, res) => {
  try {
    const studentId = req.user.id;
    const tickets = await dataStore.getSupportMessagesByUserId(studentId);
    return res.status(200).json({
      success: true,
      tickets: tickets || []
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

export const getProfile = async (req, res) => {
  try {
    const studentId = req.user.id;
    const user = await dataStore.getUserById(studentId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }
    const { password: _, ...userNoPass } = user;
    return res.status(200).json({
      success: true,
      user: userNoPass
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
    const currentPass = req.body.Pass || req.body.currentPassword || req.body.password;
    const newPass = req.body.NewPass || req.body.newPassword;
    const confPass = req.body.ConfPass || req.body.confirmPassword || newPass;

    if (!currentPass || !newPass) {
      return res.status(400).json({ success: false, message: 'Current and new password fields are required.' });
    }

    if (newPass !== confPass) {
      return res.status(400).json({ success: false, message: 'New password and confirm password do not match.' });
    }

    const result = await dataStore.changeUserPassword(studentId, currentPass, newPass);
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

    // Filter and sanitize lessons based on enrollment & free preview status
    const sanitizedLessons = lessons.map(lesson => {
      const isPreview = lesson.isFreePreview === true || lesson.isFreePreview === 'true';
      if (isEnrolled || isPreview) {
        return {
          ...lesson,
          isFreePreview: isPreview,
          isLocked: false
        };
      }
      return {
        id: lesson.id,
        courseId: lesson.courseId,
        moduleTitle: lesson.moduleTitle,
        lessonOrder: lesson.lessonOrder || lesson.order || 1,
        title: lesson.title,
        description: lesson.description || '',
        durationMinutes: lesson.durationMinutes || 20,
        contentType: lesson.contentType || 'article',
        isFreePreview: false,
        isLocked: true,
        contentUrl: '',
        content: ''
      };
    });

    return res.status(200).json({
      success: true,
      course: {
        ...course,
        isEnrolled,
        enrollmentStatus: enrollment ? enrollment.status : 'not_enrolled'
      },
      lessons: sanitizedLessons,
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

    // 1. Verify Course exists
    const course = await dataStore.getCourseById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    // 2. Verify Lesson exists
    const lesson = await dataStore.getLessonById(lessonId);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found.' });
    }

    // 3. Verify Lesson belongs to Course
    if (lesson.courseId !== courseId) {
      return res.status(400).json({ success: false, message: 'Lesson does not belong to this course.' });
    }

    // 4. Verify Student is actively enrolled in Course (do NOT auto-enroll)
    const enrollment = await dataStore.getEnrollment(studentId, courseId);
    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'You must enroll in this course first.'
      });
    }

    // 5. Complete lesson via service-level verification and recalculate progress
    const result = await dataStore.completeStudentLesson(studentId, studentName, courseId, lessonId);
    if (!result || !result.success) {
      const statusCode = result?.code === 'NOT_ENROLLED' ? 403 :
        (result?.code === 'COURSE_NOT_FOUND' || result?.code === 'LESSON_NOT_FOUND') ? 404 : 400;
      return res.status(statusCode).json({
        success: false,
        message: result?.message || 'Unable to complete lesson.'
      });
    }

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
    const studentId = req.user.id;
    const quizzes = await dataStore.getQuizzes();
    const quiz = quizzes.find(q => q.id === quizId);

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    // 1. Enrollment check: verify student is enrolled in the course that this quiz belongs to
    if (quiz.courseId) {
      const enrollment = await dataStore.getEnrollment(studentId, quiz.courseId);
      if (!enrollment) {
        return res.status(403).json({
          success: false,
          message: 'You must be enrolled in this course to access this quiz.'
        });
      }
    }

    // 2. Attempt limit check: enforce maxAttempts (default 3)
    const maxAttempts = quiz.maxAttempts || 3;
    const previousAttempts = await dataStore.getQuizAttemptsForStudentAndQuiz(studentId, quizId);
    if (previousAttempts && previousAttempts.length >= maxAttempts) {
      return res.status(403).json({
        success: false,
        message: `Maximum attempts (${maxAttempts}) reached for this quiz.`
      });
    }

    // Record server-side start time for elapsed time verification
    dataStore.startQuizSession(studentId, quizId);

    const questions = await dataStore.getQuestionsForQuiz(quizId);
    // Security: Strip correctOptionIndex and explanation so answer keys are not leaked to students over the wire
    const sanitizedQuestions = questions.map(({ correctOptionIndex, explanation, ...rest }) => rest);

    return res.status(200).json({
      success: true,
      quiz,
      attemptNumber: (previousAttempts?.length || 0) + 1,
      maxAttempts,
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
    const { quizId, userAnswers } = req.body;

    const quizzes = await dataStore.getQuizzes();
    const quiz = quizzes.find(q => q.id === quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    // 1. Enrollment check: verify student is enrolled in the course that this quiz belongs to
    if (quiz.courseId) {
      const enrollment = await dataStore.getEnrollment(studentId, quiz.courseId);
      if (!enrollment) {
        return res.status(403).json({
          success: false,
          message: 'You must be enrolled in this course to submit quiz attempts.'
        });
      }
    }

    // 2. Attempt limit check: enforce maxAttempts (default 3)
    const maxAttempts = quiz.maxAttempts || 3;
    const previousAttempts = await dataStore.getQuizAttemptsForStudentAndQuiz(studentId, quizId);
    if (previousAttempts && previousAttempts.length >= maxAttempts) {
      return res.status(403).json({
        success: false,
        message: `Maximum attempts (${maxAttempts}) reached for this quiz.`
      });
    }

    // 3. Server-side timing calculation: never trust client duration
    const quizSession = dataStore.getQuizSession(studentId, quizId);
    let verifiedElapsedSeconds = 180;
    if (quizSession && quizSession.startTime) {
      const serverElapsed = Math.round((Date.now() - quizSession.startTime) / 1000);
      if (serverElapsed > 0) {
        verifiedElapsedSeconds = serverElapsed;
      }
    } else {
      const maxAllowedSeconds = (quiz.timeLimitMinutes || 15) * 60;
      verifiedElapsedSeconds = Math.min(180, maxAllowedSeconds);
    }

    // Invalidate session immediately to prevent reuse
    dataStore.clearQuizSession(studentId, quizId);

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
      timeTakenSeconds: verifiedElapsedSeconds,
      answers: processedAnswers,
      attemptedAt: new Date()
    };

    const savedAttempt = await dataStore.saveQuizAttempt(attemptRecord);

    // Return safe review DTO: do not leak correctOptionIndex
    const safeReviewAnswers = processedAnswers.map(({ questionId, selectedOption, isCorrect, explanation }) => ({
      questionId,
      selectedOption,
      isCorrect,
      explanation
    }));

    return res.status(200).json({
      success: true,
      message: passed ? 'Congratulations! You passed the quiz.' : 'Quiz completed. Keep practicing to improve your score!',
      attempt: {
        id: savedAttempt.id || attemptRecord.id,
        quizId,
        quizTitle: quiz.title,
        studentId,
        studentName,
        score: totalScore,
        totalPoints: maxScore,
        percentage,
        passed,
        timeTakenSeconds: verifiedElapsedSeconds,
        attemptNumber: (previousAttempts?.length || 0) + 1,
        maxAttempts,
        answers: safeReviewAnswers,
        attemptedAt: attemptRecord.attemptedAt
      }
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
    const quizAttempts = await dataStore.getQuizAttempts(studentId);
    const submissions = await dataStore.getSubmissionsForStudent(studentId);
    const courses = await dataStore.getCourses();
    const quizzes = await dataStore.getQuizzes();
    const assignments = await dataStore.getAssignments();

    // Genuine study time & streak calculation (starting at 0 for students with no activity)
    const totalStudyMinutes = progressRecords.reduce((acc, curr) => acc + (curr.totalStudyMinutes || 0), 0);
    const studyStreakDays = progressRecords.length > 0 ? (progressRecords[0].studyStreakDays || 0) : 0;
    const completedCoursesCount = progressRecords.filter(p => (p.progressPercentage || 0) >= 100 || p.completed).length;

    // Calculate subject mastery from real student quiz performance, completed coursework, and progress
    const subjectMap = new Map();
    const colorGradients = [
      'from-indigo-500 to-purple-500',
      'from-purple-500 to-pink-500',
      'from-emerald-500 to-teal-500',
      'from-amber-500 to-orange-500'
    ];

    // Seed from available courses
    (courses || []).slice(0, 4).forEach(c => {
      const subjectName = c.subject || c.title || 'Coursework';
      if (!subjectMap.has(subjectName)) {
        subjectMap.set(subjectName, []);
      }
    });

    // Factor in student quiz performance
    (quizAttempts || []).forEach(qa => {
      const qz = (quizzes || []).find(q => q.id === qa.quizId);
      const subjectName = qz?.subject || 'Examinations';
      const qCount = qa.totalQuestions || 5;
      const pct = Math.min(100, Math.round(((qa.score || 0) / qCount) * 100));
      if (!subjectMap.has(subjectName)) subjectMap.set(subjectName, []);
      subjectMap.get(subjectName).push(pct);
    });

    // Factor in graded assignment performance
    (submissions || []).filter(s => s.status === 'graded').forEach(sub => {
      const asg = (assignments || []).find(a => a.id === sub.assignmentId);
      const subjectName = asg?.subject || 'Assignments';
      const maxPts = sub.totalPoints || 100;
      const pct = Math.min(100, Math.round(((sub.grade || 0) / maxPts) * 100));
      if (!subjectMap.has(subjectName)) subjectMap.set(subjectName, []);
      subjectMap.get(subjectName).push(pct);
    });

    // Factor in course progress
    (progressRecords || []).forEach(pr => {
      const c = (courses || []).find(course => course.id === pr.courseId);
      const subjectName = c?.subject || pr.courseTitle;
      if (subjectName) {
        if (!subjectMap.has(subjectName)) subjectMap.set(subjectName, []);
        if (pr.progressPercentage) subjectMap.get(subjectName).push(pr.progressPercentage);
      }
    });

    // If no records yet, provide subject names with honest 0% mastery
    const subjectSkills = Array.from(subjectMap.entries()).slice(0, 4).map(([name, scores], idx) => {
      const percentage = scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;
      return {
        name,
        percentage,
        color: colorGradients[idx % colorGradients.length]
      };
    });

    return res.status(200).json({
      success: true,
      stats: {
        totalStudyMinutes,
        studyStreakDays,
        completedCoursesCount,
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
    const { prompt, category, history } = req.body;
    const studentId = req.user?.id;
    const studentName = req.user?.name || req.user?.firstName || 'Student';

    const attempts = studentId ? await dataStore.getQuizAttempts(studentId) : [];

    const reply = await generateAICoachResponse({
      prompt,
      history: Array.isArray(history) ? history : [],
      studentName,
      studentId,
      attempts
    });

    return res.status(200).json({
      success: true,
      prompt,
      category: category || reply.category || 'General Coaching',
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
    const attempts = await dataStore.getQuizAttempts(studentId);

    const recommendedCourses = (courses || []).slice(0, 3);
    const recommendedMaterials = (materials || []).slice(0, 3);

    let nextRecommendedTopic = recommendedCourses[0] ? recommendedCourses[0].title : 'Core Foundations';
    let reasoning = 'Explore active courses and study materials to begin building your academic mastery.';

    if (attempts && attempts.length > 0) {
      const avgScore = Math.round(attempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / attempts.length);
      const latestQuiz = attempts[0];
      reasoning = `Based on your ${avgScore}% average score across ${attempts.length} quiz assessment(s), we recommend continuing practice on core modules.`;
      if (latestQuiz && latestQuiz.quizTitle) {
        nextRecommendedTopic = `Advanced ${latestQuiz.quizTitle} Review & Exercises`;
      }
    }

    return res.status(200).json({
      success: true,
      recommendations: {
        courses: recommendedCourses,
        materials: recommendedMaterials,
        nextRecommendedTopic,
        reasoning
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

    // If no attempts recorded, return clean zero-state
    if (!attempts || attempts.length === 0) {
      return res.status(200).json({
        success: true,
        weakTopics: [],
        overallDiagnosticScore: null,
        message: 'No quiz attempts recorded yet. Complete a quiz to analyze weak topics and track diagnostic accuracy.'
      });
    }

    let totalQuestionsAnswered = 0;
    let totalCorrect = 0;
    const topicStats = {}; // topicKey -> { correct, total, quizId, questionId, subject, topicTitle, explanation }
    const quizMap = new Map((quizzes || []).map(q => [q.id, q]));

    for (const att of attempts) {
      if (att.answers && Array.isArray(att.answers)) {
        const quiz = quizMap.get(att.quizId);
        const subject = quiz ? quiz.subject : 'General Academics';
        const quizTitle = quiz ? quiz.title : 'Assessment';

        for (const ans of att.answers) {
          totalQuestionsAnswered++;
          const key = `${att.quizId}_${ans.questionId}`;

          if (!topicStats[key]) {
            topicStats[key] = {
              quizId: att.quizId,
              questionId: ans.questionId,
              subject,
              quizTitle,
              correct: 0,
              total: 0
            };
          }

          topicStats[key].total++;
          if (ans.isCorrect) {
            totalCorrect++;
            topicStats[key].correct++;
          }
        }
      }
    }

    if (totalQuestionsAnswered === 0) {
      return res.status(200).json({
        success: true,
        weakTopics: [],
        overallDiagnosticScore: null,
        message: 'No answers recorded yet in attempted quizzes.'
      });
    }

    const overallDiagnosticScore = Math.round((totalCorrect / totalQuestionsAnswered) * 100);

    // Calculate real accuracy per question/topic item
    const statItems = Object.values(topicStats);
    const weakStatItems = statItems
      .map(item => ({
        ...item,
        accuracy: Math.round((item.correct / item.total) * 100)
      }))
      .filter(item => item.accuracy < 75);

    // Optimize DB query: fetch questions once per unique quiz in parallel (eliminating N+1 queries)
    const quizQuestionsCache = new Map();
    const uniqueQuizIds = [...new Set(weakStatItems.map(item => item.quizId))];
    await Promise.all(
      uniqueQuizIds.map(async (quizId) => {
        const questions = await dataStore.getQuestionsForQuiz(quizId);
        quizQuestionsCache.set(quizId, questions || []);
      })
    );

    const weakTopics = [];
    for (const item of weakStatItems) {
      const questions = quizQuestionsCache.get(item.quizId) || [];
      const qDoc = questions.find(q => q.id === item.questionId);

      weakTopics.push({
        topicId: `${item.quizId}_${item.questionId}`,
        topic: qDoc ? qDoc.questionText.slice(0, 60) + '...' : `${item.quizTitle} Quiz Concept`,
        subject: item.subject,
        accuracy: item.accuracy,
        status: item.accuracy < 50 ? 'Critical Review' : 'Needs Practice',
        recommendation: qDoc && qDoc.explanation ? qDoc.explanation : 'Review course study materials and re-take topic quiz.',
        actionUrl: `/student/quizzes/${item.quizId}`
      });
    }

    // Sort weakest topics first
    weakTopics.sort((a, b) => a.accuracy - b.accuracy);

    return res.status(200).json({
      success: true,
      weakTopics: weakTopics.slice(0, 6),
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



