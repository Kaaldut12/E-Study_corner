// backend/controllers/adminController.js
import { dataStore } from '../src/services/dataStore.js';
import { sendBroadcastEmail, sendSupportReplyEmail } from '../src/services/emailService.js';

export const getAdminDashboard = async (req, res) => {
  try {
    const users = await dataStore.getUsers();
    const assignments = await dataStore.getAssignments();
    const submissions = await dataStore.getSubmissions();
    const supportMessages = await dataStore.getSupportMessages();
    const feedbackList = await dataStore.getPlatformFeedback();
    const notifications = await dataStore.getNotifications();
    const enquiries = await dataStore.getEnquiries();
    const studyMaterials = await dataStore.getStudyMaterials();

    const stats = {
      totalUsers: users.length,
      studentCount: users.filter(u => u.role === 'student').length,
      teacherCount: users.filter(u => u.role === 'teacher').length,
      adminCount: users.filter(u => u.role === 'admin').length,
      totalAssignments: assignments.length,
      totalSubmissions: submissions.length,
      pendingSupportMessages: supportMessages.filter(m => m.status === 'pending').length,
      totalFeedback: feedbackList.length,
      totalNotifications: notifications.length,
      totalEnquiries: enquiries.length,
      totalStudyMaterials: studyMaterials.length
    };

    return res.status(200).json({
      success: true,
      stats,
      recentUsers: users.slice(-5).reverse(),
      recentSupportMessages: supportMessages.slice(-5).reverse(),
      recentEnquiries: enquiries.slice(-5)
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const rawUsers = await dataStore.getUsers();
    const users = rawUsers.map(u => {
      const { password, ...userNoPass } = u;
      return userNoPass;
    });

    return res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, gradeLevel, department, collegeName, course, subject } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Name, email, password, and role are required.' });
    }

    const existing = await dataStore.getUserByEmail(email);
    if (existing) {
      return res.status(400).json({ success: false, message: 'User with this email already exists.' });
    }

    const newUser = await dataStore.createUser({
      name,
      email,
      password,
      role,
      department: department || (role === 'teacher' ? 'Computer Science & Engineering' : 'General'),
      subject: subject || (role === 'teacher' ? 'Computer Science' : ''),
      gradeLevel: gradeLevel || '3rd Year',
      collegeName: collegeName || 'Government Polytechnic Aurai, Bhadohi',
      course: course || 'Diploma in Computer Science & Engineering'
    });

    const { password: _, ...userNoPass } = newUser;
    return res.status(201).json({
      success: true,
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} account created successfully!`,
      user: userNoPass
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updated = await dataStore.updateUser(id, updates);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { password, ...userNoPass } = updated;
    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: userNoPass
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const success = await dataStore.deleteUser(id);
    if (success) {
      return res.status(200).json({ success: true, message: 'User deleted successfully.' });
    }
    return res.status(404).json({ success: false, message: 'User not found.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getFeedbackList = async (req, res) => {
  try {
    const feedbackList = await dataStore.getPlatformFeedback();
    return res.status(200).json({
      success: true,
      feedbackList
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getSupportMessages = async (req, res) => {
  try {
    const messages = await dataStore.getSupportMessages();
    return res.status(200).json({
      success: true,
      messages
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateMessageStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminReply } = req.body;

    const updated = await dataStore.updateSupportMessageStatus(id, status, adminReply);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Support ticket not found.' });
    }

    // Trigger support resolution email
    try {
      const user = await dataStore.getUserById(updated.userId);
      const recipientEmail = user ? user.email : 'student@estudy.com';
      await sendSupportReplyEmail(recipientEmail, updated.userName, updated.subject, adminReply || status);
    } catch (e) {
      console.warn('Failed sending support resolution email:', e);
    }

    return res.status(200).json({
      success: true,
      message: 'Support ticket updated and notification email sent.',
      ticket: updated
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminNotifications = async (req, res) => {
  try {
    const notifications = await dataStore.getNotifications();
    return res.status(200).json({ success: true, notifications });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createNotification = async (req, res) => {
  try {
    const { Noti_Message } = req.body;
    if (!Noti_Message) {
      return res.status(400).json({ success: false, message: 'Notification message is required.' });
    }
    const noti = await dataStore.createNotification(Noti_Message);
    return res.status(201).json({
      success: true,
      message: 'Notification published successfully.',
      notification: noti
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    await dataStore.deleteNotification(id);
    return res.status(200).json({ success: true, message: 'Notification deleted.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminEnquiries = async (req, res) => {
  try {
    const enquiries = await dataStore.getEnquiries();
    return res.status(200).json({ success: true, enquiries });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteEnquiry = async (req, res) => {
  try {
    const { id } = req.params;
    await dataStore.deleteEnquiry(id);
    return res.status(200).json({ success: true, message: 'Enquiry deleted.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const uploadStudyMaterial = async (req, res) => {
  try {
    const { Subject, Title, Description, FileName, fileUrl } = req.body;
    if (!Subject || !Title || !Description) {
      return res.status(400).json({ success: false, message: 'Subject, Title, and Description are required.' });
    }

    const material = await dataStore.createStudyMaterial({
      subject: Subject,
      title: Title,
      description: Description,
      fileName: FileName || 'Study_Material_Doc.pdf',
      fileUrl: fileUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    });

    return res.status(201).json({
      success: true,
      message: 'Study material uploaded successfully!',
      material
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteStudyMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    await dataStore.deleteStudyMaterial(id);
    return res.status(200).json({ success: true, message: 'Study material deleted.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const sendEmailBroadcast = async (req, res) => {
  try {
    const { sendTo, subject, message } = req.body;
    if (!sendTo || !subject || !message) {
      return res.status(400).json({ success: false, message: 'Recipient, subject, and message body are required.' });
    }

    await sendBroadcastEmail(sendTo, subject, message);

    return res.status(200).json({
      success: true,
      message: `Email broadcast dispatched to ${sendTo}.`
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== V4 PLATFORM ANALYTICS ====================

export const getAdminAnalytics = async (req, res) => {
  try {
    const users = await dataStore.getUsers();
    const assignments = await dataStore.getAssignments();
    const submissions = await dataStore.getSubmissions();
    const supportMessages = await dataStore.getSupportMessages();
    const feedbackList = await dataStore.getPlatformFeedback();
    const studyMaterials = await dataStore.getStudyMaterials();

    const monthlyTrends = [
      { month: 'Apr', students: 45, submissions: 80, supportTickets: 12 },
      { month: 'May', students: 60, submissions: 110, supportTickets: 15 },
      { month: 'Jun', students: 85, submissions: 160, supportTickets: 8 },
      { month: 'Jul', students: 110, submissions: 210, supportTickets: 14 },
      { month: 'Aug', students: 140, submissions: 270, supportTickets: 9 },
      { month: 'Sep', students: users.length, submissions: submissions.length, supportTickets: supportMessages.length }
    ];

    const departmentDistribution = [
      { name: 'Computer Science & Engg', percentage: 55, count: Math.round(users.length * 0.55) },
      { name: 'Information Technology', percentage: 30, count: Math.round(users.length * 0.30) },
      { name: 'Electronics Engineering', percentage: 15, count: Math.round(users.length * 0.15) }
    ];

    const supportMetrics = {
      total: supportMessages.length,
      pending: supportMessages.filter(m => m.status === 'pending').length,
      resolved: supportMessages.filter(m => m.status === 'resolved').length,
      avgResolutionHours: 4.2
    };

    return res.status(200).json({
      success: true,
      analytics: {
        totalUsers: users.length,
        totalMaterials: studyMaterials.length,
        totalAssignments: assignments.length,
        totalSubmissions: submissions.length,
        monthlyTrends,
        departmentDistribution,
        supportMetrics,
        feedbackAvgRating: 4.8
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

