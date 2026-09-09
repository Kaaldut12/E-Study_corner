// frontend/src/services/teacherService.js
import api from './api';

export const teacherService = {
  // --- DASHBOARD & STUDENTS ---
  getDashboard: () => api.get('/teacher/dashboard').then(res => res.data),
  getStudents: () => api.get('/teacher/students').then(res => res.data),

  // --- COURSES ---
  getCourses: () => api.get('/teacher/courses').then(res => res.data),
  createCourse: (courseData) => api.post('/teacher/courses', courseData).then(res => res.data),

  // --- ASSIGNMENTS ---
  getAssignments: () => api.get('/teacher/assignments').then(res => res.data),
  createAssignment: (assignmentData) => api.post('/teacher/assignments', assignmentData).then(res => res.data),
  deleteAssignment: (id) => api.delete(`/teacher/assignments/${id}`).then(res => res.data),

  // --- SUBMISSIONS & GRADING ---
  getSubmissionsForAssignment: (assignmentId) =>
    api.get(`/teacher/assignments/${assignmentId}/submissions`).then(res => res.data),
  gradeSubmission: (submissionId, grade, feedback) =>
    api.post(`/teacher/submissions/${submissionId}/grade`, { grade, feedback }).then(res => res.data),

  // --- STUDENT QUESTIONS & DOUBTS ---
  getQuestions: () => api.get('/teacher/questions').then(res => res.data),
  replyQuestion: (questionId, replyText) =>
    api.post(`/teacher/questions/${questionId}/reply`, { replyText }).then(res => res.data)
};

export default teacherService;
