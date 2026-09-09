// frontend/src/services/studentService.js
import api from './api';

export const studentService = {
  // --- DASHBOARD & OVERVIEW ---
  getDashboard: () => api.get('/student/dashboard').then(res => res.data),

  // --- COURSES, ENROLLMENT & LESSON COMPLETION ---
  getCourses: () => api.get('/student/courses').then(res => res.data),
  getCourseDetails: (courseId) => api.get(`/student/courses/${courseId}`).then(res => res.data),
  enrollCourse: (courseId) => api.post(`/student/courses/${courseId}/enroll`).then(res => res.data),
  completeLesson: (courseId, lessonId) =>
    api.post(`/student/courses/${courseId}/lessons/${lessonId}/complete`).then(res => res.data),

  // --- ASSIGNMENTS & SUBMISSIONS ---
  getAssignments: () => api.get('/student/assignments').then(res => res.data),
  submitAssignment: (assignmentId, payload) =>
    api.post(`/student/assignments/${assignmentId}/submissions`, payload).then(res => res.data),
  submitAssignmentLegacy: (payload) => api.post('/student/submit', payload).then(res => res.data),

  // --- NOTES ---
  getNotes: () => api.get('/student/notes').then(res => res.data),
  createNote: (note) => api.post('/student/notes', note).then(res => res.data),
  updateNote: (noteId, updates) => api.put(`/student/notes/${noteId}`, updates).then(res => res.data),
  deleteNote: (noteId) => api.delete(`/student/notes/${noteId}`).then(res => res.data),

  // --- QUIZZES ---
  getQuizzes: () => api.get('/student/quizzes').then(res => res.data),
  getQuizQuestions: (quizId) => api.get(`/student/quizzes/${quizId}`).then(res => res.data),
  submitQuizAttempt: (attempt) => api.post('/student/quizzes/submit', attempt).then(res => res.data),

  // --- BOOKMARKS ---
  getBookmarks: () => api.get('/student/bookmarks').then(res => res.data),
  toggleBookmark: (payload) => api.post('/student/bookmarks/toggle', payload).then(res => res.data),
  deleteBookmark: (bookmarkId) => api.delete(`/student/bookmarks/${bookmarkId}`).then(res => res.data),

  // --- PROGRESS & NOTIFICATIONS ---
  getProgressStats: () => api.get('/student/progress').then(res => res.data),
  getNotifications: () => api.get('/student/notifications').then(res => res.data),

  // --- TEACHER DOUBTS & Q&A ---
  getTeachers: () => api.get('/student/teachers').then(res => res.data),
  getQuestions: () => api.get('/student/questions').then(res => res.data),
  askTeacherQuestion: (questionData) => api.post('/student/questions', questionData).then(res => res.data),

  // --- AI COACH & LEARNING RECOMMENDATIONS ---
  askAICoach: (prompt) => api.post('/student/ai-coach', { prompt }).then(res => res.data),
  getRecommendations: () => api.get('/student/recommendations').then(res => res.data),
  getWeakTopics: () => api.get('/student/weak-topics').then(res => res.data),

  // --- STUDY MATERIALS & UTILITIES ---
  getStudyMaterials: () => api.get('/student/study-material').then(res => res.data),
  getFeedback: () => api.get('/student/feedback').then(res => res.data),
  updateProfile: (profileData) => api.put('/student/profile', profileData).then(res => res.data),
  changePassword: (currentPassword, newPassword) =>
    api.post('/student/change-password', { currentPassword, newPassword }).then(res => res.data),
  contactAdmin: (payload) => api.post('/student/contact-admin', payload).then(res => res.data),
  searchAll: (query) => api.get(`/student/search?q=${encodeURIComponent(query)}`).then(res => res.data)
};

export default studentService;
