// frontend/src/services/adminService.js
import api from './api';

export const adminService = {
  // --- DASHBOARD & ANALYTICS & HEALTH ---
  getDashboard: () => api.get('/admin/dashboard').then(res => res.data),
  getAnalytics: () => api.get('/admin/analytics').then(res => res.data),
  getSystemHealth: () => api.get('/system/health').then(res => res.data),
  getSystemMetrics: () => api.get('/system/metrics').then(res => res.data),
  triggerResync: () => api.post('/admin/action/resync').then(res => res.data),

  // --- USER MANAGEMENT ---
  getUsers: () => api.get('/admin/users').then(res => res.data),
  createUser: (userData) => api.post('/admin/users', userData).then(res => res.data),
  updateUser: (userId, updates) => api.put(`/admin/users/${userId}`, updates).then(res => res.data),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`).then(res => res.data),
  toggleUserStatus: (userId, status) => api.put(`/admin/users/${userId}/status`, { status }).then(res => res.data),

  // --- NOTIFICATIONS ---
  getNotifications: () => api.get('/admin/notifications').then(res => res.data),
  createNotification: (data) => api.post('/admin/notifications', data).then(res => res.data),
  deleteNotification: (id) => api.delete(`/admin/notifications/${id}`).then(res => res.data),

  // --- ENQUIRIES ---
  getEnquiries: () => api.get('/admin/enquiries').then(res => res.data),
  deleteEnquiry: (id) => api.delete(`/admin/enquiries/${id}`).then(res => res.data),

  // --- STUDY MATERIALS ---
  getStudyMaterials: () => api.get('/admin/study-material').then(res => res.data),
  uploadStudyMaterial: (data) => api.post('/admin/study-material', data).then(res => res.data),
  deleteStudyMaterial: (id) => api.delete(`/admin/study-material/${id}`).then(res => res.data),

  // --- FEEDBACK, SUPPORT MESSAGES & STUDENT DOUBTS ---
  getFeedback: () => api.get('/admin/feedback').then(res => res.data),
  getMessages: () => api.get('/admin/messages').then(res => res.data),
  replyMessage: (id, payload) => {
    const body = typeof payload === 'string' ? { adminReply: payload, status: 'resolved' } : payload;
    return api.put(`/admin/messages/${id}`, body).then(res => res.data);
  },
  replyQuestion: (questionId, replyText) =>
    api.put(`/admin/questions/${questionId}/reply`, { replyText }).then(res => res.data),

  // --- EMAIL ---
  sendEmail: (data) => api.post('/admin/send-email', data).then(res => res.data)
};

export default adminService;
