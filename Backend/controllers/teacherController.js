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
        totalStudents
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
    const { title, subject, description, dueDate, totalPoints, resourceLink, attachmentUrl, attachmentName } = req.body;

    if (!title || !subject || !description || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Title, Subject, Description, and Due Date are required fields.'
      });
    }

    const newAssignment = await dataStore.createAssignment({
      title,
      subject,
      description,
      teacherId,
      teacherName,
      dueDate,
      totalPoints: Number(totalPoints) || 100,
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
    const assignment = await dataStore.getAssignmentById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found.' });
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
    const teacherName = req.user.name;
    const submissionId = req.params.id || req.body.submissionId;
    const { grade, feedback } = req.body;

    if (!submissionId || grade === undefined || grade === '') {
      return res.status(400).json({ success: false, message: 'Submission ID and Grade score are required.' });
    }

    const numericGrade = Number(grade);
    if (isNaN(numericGrade) || numericGrade < 0) {
      return res.status(400).json({ success: false, message: 'Grade score must be a valid positive number.' });
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

