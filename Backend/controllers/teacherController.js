// backend/controllers/teacherController.js
import { dataStore } from '../src/services/dataStore.js';

export const getTeacherDashboard = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const isSuperAdmin = req.user.role === 'superadmin';
    const allAssignments = await dataStore.getAssignments();
    const teacherAssignments = isSuperAdmin ? allAssignments : allAssignments.filter(a => a.teacherId === teacherId);

    const allSubmissions = await dataStore.getSubmissions();
    const teacherSubmissions = isSuperAdmin
      ? allSubmissions
      : allSubmissions.filter(s => teacherAssignments.some(a => a.id === s.assignmentId));

    const pendingGradingCount = teacherSubmissions.filter(s => s.status === 'submitted').length;
    const gradedCount = teacherSubmissions.filter(s => s.status === 'graded').length;

    const allUsers = await dataStore.getUsers();
    const totalStudents = allUsers.filter(u => u.role === 'student').length;

    const studentLeaves = await dataStore.getAllLeaves({ userRole: 'student' });
    const pendingStudentLeavesCount = studentLeaves.filter(l => l.status === 'pending').length;

    const enrichedPending = teacherSubmissions
      .filter(s => s.status === 'submitted')
      .slice(0, 5)
      .map(sub => {
        const asg = allAssignments.find(a => a.id === sub.assignmentId);
        return {
          ...sub,
          assignmentTitle: asg ? asg.title : 'Coursework Task',
          subject: asg ? asg.subject : 'Coursework'
        };
      });

    return res.status(200).json({
      success: true,
      stats: {
        totalAssignments: teacherAssignments.length,
        totalSubmissions: teacherSubmissions.length,
        pendingGradingCount,
        gradedCount,
        totalStudents,
        pendingStudentLeavesCount
      },
      recentAssignments: teacherAssignments.slice(-4).reverse(),
      pendingGradingSubmissions: enrichedPending
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getTeacherAssignments = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const isSuperAdmin = req.user.role === 'superadmin';
    const allAssignments = await dataStore.getAssignments();
    const teacherAssignments = isSuperAdmin ? allAssignments : allAssignments.filter(a => a.teacherId === teacherId);

    const allSubmissions = await dataStore.getSubmissions();
    const assignmentsWithStats = teacherAssignments.map(asg => {
      const subList = allSubmissions.filter(s => s.assignmentId === asg.id);
      return {
        ...asg,
        submissionCount: subList.length,
        pendingGradeCount: subList.filter(s => s.status === 'submitted').length
      };
    });

    return res.status(200).json({
      success: true,
      assignments: assignmentsWithStats
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createAssignment = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const teacherName = req.user.name;
    const isAdmin = ['admin', 'superadmin'].includes(req.user.role);
    const { courseId, title, subject, description, dueDate, totalPoints, resourceLink, attachmentUrl, attachmentName, category } = req.body;

    if (!title || !subject || !description || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Title, Subject, Description, and Due Date are required fields.'
      });
    }

    let resolvedCourseId = courseId;
    if (!resolvedCourseId) {
      const allCourses = await dataStore.getCourses();
      const teacherCourses = allCourses.filter(c => c.teacherId === teacherId);
      if (teacherCourses.length > 0) {
        const match = teacherCourses.find(c => c.subject?.toLowerCase() === subject?.toLowerCase());
        resolvedCourseId = match ? match.id : teacherCourses[0].id;
      } else if (allCourses.length > 0) {
        resolvedCourseId = allCourses[0].id;
      }
    }

    if (!resolvedCourseId) {
      return res.status(400).json({
        success: false,
        message: 'A valid courseId is required to associate this assignment with a course.'
      });
    }

    const course = await dataStore.getCourseById(resolvedCourseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Specified course not found.' });
    }
    if (!isAdmin && course.teacherId && course.teacherId !== teacherId) {
      return res.status(403).json({ success: false, message: 'Unauthorized: You can only create assignments for your own courses.' });
    }

    const newAssignment = await dataStore.createAssignment({
      courseId: resolvedCourseId,
      title,
      subject,
      description,
      teacherId,
      teacherName,
      dueDate,
      totalPoints: Number(totalPoints) || 100,
      category: category || 'assignment',
      resourceLink: resourceLink || '',
      attachmentUrl: attachmentUrl || '',
      attachmentName: attachmentName || ''
    });

    // Notify students about new assignment
    try {
      await dataStore.createNotification(`New coursework assigned: "${title}" by ${teacherName} (${subject})`);
    } catch (e) {
      console.warn('Notification post warning:', e.message);
    }

    return res.status(201).json({
      success: true,
      message: 'Assignment created successfully!',
      assignment: newAssignment
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const teacherId = req.user.id;
    const isAdmin = ['admin', 'superadmin'].includes(req.user.role);

    const assignment = await dataStore.getAssignmentById(id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found.' });
    }

    if (!isAdmin && assignment.teacherId !== teacherId) {
      return res.status(403).json({ success: false, message: 'Unauthorized: You can only delete your own assignments.' });
    }

    const success = await dataStore.deleteAssignment(id);
    if (success) {
      return res.status(200).json({ success: true, message: 'Assignment deleted successfully.' });
    }
    return res.status(404).json({ success: false, message: 'Assignment not found.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getSubmissionsForAssignment = async (req, res) => {
  try {
    const assignmentId = req.params.assignmentId || req.params.id;
    const teacherId = req.user.id;
    const isAdmin = ['admin', 'superadmin'].includes(req.user.role);

    const assignment = await dataStore.getAssignmentById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found.' });
    }

    if (!isAdmin && assignment.teacherId !== teacherId) {
      return res.status(403).json({ success: false, message: 'Unauthorized: You can only view submissions for your own assignments.' });
    }

    const submissions = await dataStore.getSubmissionsForAssignment(assignmentId);

    return res.status(200).json({
      success: true,
      assignment,
      submissions
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const gradeSubmission = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const teacherName = req.user.name;
    const isAdmin = ['admin', 'superadmin'].includes(req.user.role);
    const submissionId = req.params.id || req.body.submissionId;
    const { grade, feedback } = req.body;

    if (!submissionId || grade === undefined || grade === '') {
      return res.status(400).json({ success: false, message: 'Submission ID and Grade score are required.' });
    }

    const numericGrade = Number(grade);
    if (isNaN(numericGrade) || numericGrade < 0) {
      return res.status(400).json({ success: false, message: 'Grade score must be a valid positive number.' });
    }

    const submission = await dataStore.getSubmissionById(submissionId);
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found.' });
    }

    const assignment = await dataStore.getAssignmentById(submission.assignmentId);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Associated assignment not found.' });
    }

    const maxPoints = assignment.totalPoints !== undefined ? assignment.totalPoints : 100;
    if (numericGrade > maxPoints) {
      return res.status(400).json({
        success: false,
        message: `Grade cannot exceed the maximum assignment score of ${maxPoints} points.`
      });
    }

    // Verify teacher owns the assignment (or is admin/superadmin)
    if (!isAdmin) {
      if (assignment.teacherId !== teacherId) {
        return res.status(403).json({ success: false, message: 'Unauthorized: You can only grade submissions for your own assignments.' });
      }
    }

    const updatedSub = await dataStore.gradeSubmission(submissionId, numericGrade, feedback || '', teacherName);
    if (!updatedSub) {
      return res.status(404).json({ success: false, message: 'Submission not found.' });
    }

    // Post notification for student's record
    try {
      await dataStore.createNotification(`Grade updated: ${updatedSub.studentName} scored ${numericGrade} pts with feedback from ${teacherName}`);
    } catch (e) {
      console.warn('Notification post warning:', e.message);
    }

    return res.status(200).json({
      success: true,
      message: 'Submission graded successfully!',
      submission: updatedSub
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== V4 PLATFORM EXTENSIONS ====================

export const getTeacherCourses = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const isSuperAdmin = req.user.role === 'superadmin';
    const allCourses = await dataStore.getCourses();
    const teacherCourses = isSuperAdmin ? allCourses : allCourses.filter(c => c.teacherId === teacherId);

    return res.status(200).json({
      success: true,
      courses: teacherCourses
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createTeacherCourse = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const teacherName = req.user.name;
    const { code, title, subject, description, department, courseYear, thumbnail } = req.body;

    if (!title || !subject || !description || !code) {
      return res.status(400).json({
        success: false,
        message: 'Course Code, Title, Subject, and Description are required.'
      });
    }

    const created = await dataStore.createCourse({
      code,
      title,
      description,
      subject,
      department: department || 'Computer Science & Engineering',
      courseYear: courseYear || '3rd Year',
      teacherId,
      teacherName,
      thumbnail: thumbnail || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop',
      modulesCount: 3,
      lessonsCount: 8,
      enrolledCount: 0,
      rating: 5.0
    });

    return res.status(201).json({
      success: true,
      message: 'Course published successfully!',
      course: created
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getTeacherStudents = async (req, res) => {
  try {
    const allUsers = await dataStore.getUsers();
    const students = allUsers.filter(u => u.role === 'student');

    const allSubmissions = await dataStore.getSubmissions();

    const studentsWithStats = students.map(s => {
      const studentSubs = allSubmissions.filter(sub => sub.studentId === s.id);
      const gradedSubs = studentSubs.filter(sub => sub.status === 'graded');
      const avgGrade = gradedSubs.length > 0
        ? Math.round(gradedSubs.reduce((acc, sub) => acc + (Number(sub.grade) || 0), 0) / gradedSubs.length)
        : 'N/A';

      const { password, ...studentData } = s;
      return {
        ...studentData,
        submissionsCount: studentSubs.length,
        avgGrade: avgGrade !== 'N/A' ? `${avgGrade}%` : 'No Grades'
      };
    });

    return res.status(200).json({
      success: true,
      students: studentsWithStats
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== STUDENT QUESTIONS & DOUBTS ====================

export const getTeacherQuestions = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const isSuperAdmin = req.user.role === 'superadmin';
    const questions = isSuperAdmin
      ? await dataStore.getTeacherQuestionsForTeacher('')
      : await dataStore.getTeacherQuestionsForTeacher(teacherId);

    return res.status(200).json({
      success: true,
      questions
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const replyTeacherQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { replyText } = req.body;
    const teacherId = req.user.role === 'superadmin' ? undefined : req.user.id;
    const teacherName = req.user.name || 'Instructor';

    if (!replyText || !replyText.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Reply text cannot be empty.'
      });
    }

    const updated = await dataStore.replyTeacherQuestion(id, replyText.trim(), teacherId);
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Question not found or you are not authorized to reply to this question.'
      });
    }

    if (dataStore.createNotification) {
      await dataStore.createNotification(`Instructor ${teacherName} replied to your question: "${updated.title.slice(0, 45)}"`);
    }

    return res.status(200).json({
      success: true,
      message: 'Reply sent successfully to student!',
      question: updated
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== COURSE EDIT & DELETE ====================

export const updateTeacherCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const teacherId = req.user.id;
    const isAdmin = ['admin', 'superadmin'].includes(req.user.role);

    const result = await dataStore.updateCourse(id, req.body, teacherId, isAdmin);
    if (result.error === 'not_found') {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }
    if (result.error === 'unauthorized') {
      return res.status(403).json({ success: false, message: 'Unauthorized: You do not own this course.' });
    }
    return res.status(200).json({ success: true, message: 'Course updated successfully.', course: result.data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteTeacherCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const teacherId = req.user.id;
    const isAdmin = ['admin', 'superadmin'].includes(req.user.role);

    const result = await dataStore.deleteCourse(id, teacherId, isAdmin);
    if (result.error === 'not_found') {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }
    if (result.error === 'unauthorized') {
      return res.status(403).json({ success: false, message: 'Unauthorized: You do not own this course.' });
    }
    return res.status(200).json({ success: true, message: 'Course deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== LESSON MANAGEMENT ====================

export const createTeacherLesson = async (req, res) => {
  try {
    const courseId = req.params.courseId || req.body.courseId;
    const teacherId = req.user.id;
    const isAdmin = ['admin', 'superadmin'].includes(req.user.role);

    if (!courseId) {
      return res.status(400).json({ success: false, message: 'Course ID is required.' });
    }
    if (!req.body.title || !req.body.moduleTitle) {
      return res.status(400).json({ success: false, message: 'Title and Module Title are required.' });
    }

    const result = await dataStore.createLesson(courseId, req.body, teacherId, isAdmin);
    if (result.error === 'not_found') {
      return res.status(404).json({ success: false, message: result.message || 'Course not found.' });
    }
    if (result.error === 'unauthorized') {
      return res.status(403).json({ success: false, message: result.message || 'Unauthorized.' });
    }
    return res.status(201).json({ success: true, message: 'Lesson created successfully.', lesson: result.data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTeacherLesson = async (req, res) => {
  try {
    const { id, lessonId } = req.params;
    const targetId = lessonId || id;
    const teacherId = req.user.id;
    const isAdmin = ['admin', 'superadmin'].includes(req.user.role);

    const result = await dataStore.updateLesson(targetId, req.body, teacherId, isAdmin);
    if (result.error === 'not_found') {
      return res.status(404).json({ success: false, message: result.message || 'Lesson not found.' });
    }
    if (result.error === 'unauthorized') {
      return res.status(403).json({ success: false, message: result.message || 'Unauthorized.' });
    }
    return res.status(200).json({ success: true, message: 'Lesson updated successfully.', lesson: result.data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteTeacherLesson = async (req, res) => {
  try {
    const { id, lessonId } = req.params;
    const targetId = lessonId || id;
    const teacherId = req.user.id;
    const isAdmin = ['admin', 'superadmin'].includes(req.user.role);

    const result = await dataStore.deleteLesson(targetId, teacherId, isAdmin);
    if (result.error === 'not_found') {
      return res.status(404).json({ success: false, message: result.message || 'Lesson not found.' });
    }
    if (result.error === 'unauthorized') {
      return res.status(403).json({ success: false, message: result.message || 'Unauthorized.' });
    }
    return res.status(200).json({ success: true, message: 'Lesson deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== QUIZ MANAGEMENT ====================

export const createTeacherQuiz = async (req, res) => {
  try {
    const courseId = req.params.courseId || req.body.courseId;
    const teacherId = req.user.id;
    const teacherName = req.user.name;
    const isAdmin = ['admin', 'superadmin'].includes(req.user.role);

    if (!req.body.title || !req.body.subject) {
      return res.status(400).json({ success: false, message: 'Title and Subject are required for quiz.' });
    }

    const result = await dataStore.createQuiz(courseId, req.body, teacherId, teacherName, isAdmin);
    if (result.error === 'not_found') {
      return res.status(404).json({ success: false, message: result.message || 'Course not found.' });
    }
    if (result.error === 'unauthorized') {
      return res.status(403).json({ success: false, message: result.message || 'Unauthorized.' });
    }
    return res.status(201).json({ success: true, message: 'Quiz created successfully.', quiz: result.data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTeacherQuiz = async (req, res) => {
  try {
    const { id, quizId } = req.params;
    const targetId = quizId || id;
    const teacherId = req.user.id;
    const isAdmin = ['admin', 'superadmin'].includes(req.user.role);

    const result = await dataStore.updateQuiz(targetId, req.body, teacherId, isAdmin);
    if (result.error === 'not_found') {
      return res.status(404).json({ success: false, message: result.message || 'Quiz not found.' });
    }
    if (result.error === 'unauthorized') {
      return res.status(403).json({ success: false, message: result.message || 'Unauthorized.' });
    }
    return res.status(200).json({ success: true, message: 'Quiz updated successfully.', quiz: result.data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteTeacherQuiz = async (req, res) => {
  try {
    const { id, quizId } = req.params;
    const targetId = quizId || id;
    const teacherId = req.user.id;
    const isAdmin = ['admin', 'superadmin'].includes(req.user.role);

    const result = await dataStore.deleteQuiz(targetId, teacherId, isAdmin);
    if (result.error === 'not_found') {
      return res.status(404).json({ success: false, message: result.message || 'Quiz not found.' });
    }
    if (result.error === 'unauthorized') {
      return res.status(403).json({ success: false, message: result.message || 'Unauthorized.' });
    }
    return res.status(200).json({ success: true, message: 'Quiz deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== QUESTION MANAGEMENT ====================

export const createTeacherQuestionItem = async (req, res) => {
  try {
    const quizId = req.params.quizId || req.body.quizId;
    const teacherId = req.user.id;
    const isAdmin = ['admin', 'superadmin'].includes(req.user.role);

    if (!quizId) {
      return res.status(400).json({ success: false, message: 'Quiz ID is required.' });
    }
    if (!req.body.questionText || !req.body.options || req.body.correctOptionIndex === undefined) {
      return res.status(400).json({ success: false, message: 'questionText, options, and correctOptionIndex are required.' });
    }

    const result = await dataStore.createQuestion(quizId, req.body, teacherId, isAdmin);
    if (result.error === 'not_found') {
      return res.status(404).json({ success: false, message: result.message || 'Quiz not found.' });
    }
    if (result.error === 'unauthorized') {
      return res.status(403).json({ success: false, message: result.message || 'Unauthorized.' });
    }
    return res.status(201).json({ success: true, message: 'Question created successfully.', question: result.data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTeacherQuestionItem = async (req, res) => {
  try {
    const { id, questionId } = req.params;
    const targetId = questionId || id;
    const teacherId = req.user.id;
    const isAdmin = ['admin', 'superadmin'].includes(req.user.role);

    const result = await dataStore.updateQuestion(targetId, req.body, teacherId, isAdmin);
    if (result.error === 'not_found') {
      return res.status(404).json({ success: false, message: result.message || 'Question not found.' });
    }
    if (result.error === 'unauthorized') {
      return res.status(403).json({ success: false, message: result.message || 'Unauthorized.' });
    }
    return res.status(200).json({ success: true, message: 'Question updated successfully.', question: result.data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteTeacherQuestionItem = async (req, res) => {
  try {
    const { id, questionId } = req.params;
    const targetId = questionId || id;
    const teacherId = req.user.id;
    const isAdmin = ['admin', 'superadmin'].includes(req.user.role);

    const result = await dataStore.deleteQuestion(targetId, teacherId, isAdmin);
    if (result.error === 'not_found') {
      return res.status(404).json({ success: false, message: result.message || 'Question not found.' });
    }
    if (result.error === 'unauthorized') {
      return res.status(403).json({ success: false, message: result.message || 'Unauthorized.' });
    }
    return res.status(200).json({ success: true, message: 'Question deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== STUDENT ACTIONS INSPECTOR ====================

export const getStudentFullDetails = async (req, res) => {
  try {
    const studentId = req.params.studentId || req.params.id;
    const users = await dataStore.getUsers();
    const student = users.find(u => u.id === studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    // 1. All submissions made by this student
    const allSubs = await dataStore.getSubmissions();
    const allAsgs = await dataStore.getAssignments();
    const studentSubs = allSubs
      .filter(s => s.studentId === studentId)
      .map(s => {
        const asg = allAsgs.find(a => a.id === s.assignmentId) || {};
        return {
          ...s,
          assignmentTitle: asg.title || 'Coursework Assignment',
          subject: asg.subject || 'Academic',
          category: asg.category || 'assignment',
          totalPoints: asg.totalPoints || 100,
          dueDate: asg.dueDate
        };
      });

    // 2. All leave requests made by this student
    const studentLeaves = await dataStore.getUserLeaves(studentId);

    // 3. Complete attendance stats & logs for this student
    const attendanceStats = await dataStore.getUserAttendanceStats(studentId);

    // 4. Questions / doubts submitted by this student
    const questions = await dataStore.getTeacherQuestionsForTeacher('');
    const studentQuestions = questions.filter(q => q.studentId === studentId);

    const { password, ...safeStudent } = student;

    return res.status(200).json({
      success: true,
      student: safeStudent,
      submissions: studentSubs,
      leaves: studentLeaves,
      attendance: attendanceStats,
      questions: studentQuestions
    });
  } catch (error) {
    console.error('getStudentFullDetails error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};



