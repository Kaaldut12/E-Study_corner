// frontend/src/services/teacherService.js
import api from './api';

export const teacherService = {
  // --- DASHBOARD & STUDENTS ---
  getDashboard: () => api.get('/teacher/dashboard').then(res => res.data),
  getStudents: () => api.get('/teacher/students').then(res => res.data),

  // --- COURSES ---
  getCourses: () => api.get('/teacher/courses').then(res => res.data),
  createCourse: (courseData) => api.post('/teacher/courses', courseData).then(res => res.data),
  updateCourse: (id, courseData) => api.put(`/teacher/courses/${id}`, courseData).then(res => res.data),
  deleteCourse: (id) => api.delete(`/teacher/courses/${id}`).then(res => res.data),

  // --- LESSONS ---
  createLesson: (lessonData) => api.post('/teacher/lessons', lessonData).then(res => res.data),
  updateLesson: (id, lessonData) => api.put(`/teacher/lessons/${id}`, lessonData).then(res => res.data),
  deleteLesson: (id) => api.delete(`/teacher/lessons/${id}`).then(res => res.data),

  // --- QUIZZES ---
  createQuiz: (quizData) => api.post('/teacher/quizzes', quizData).then(res => res.data),
  updateQuiz: (id, quizData) => api.put(`/teacher/quizzes/${id}`, quizData).then(res => res.data),
  deleteQuiz: (id) => api.delete(`/teacher/quizzes/${id}`).then(res => res.data),

  // --- QUESTIONS ---
  createQuestion: (questionData) => api.post('/teacher/questions', questionData).then(res => res.data),
  updateQuestion: (id, questionData) => api.put(`/teacher/questions/${id}`, questionData).then(res => res.data),
  deleteQuestion: (id) => api.delete(`/teacher/questions/${id}`).then(res => res.data),

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
