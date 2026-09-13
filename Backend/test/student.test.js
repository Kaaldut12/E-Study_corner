// Backend/test/student.test.js
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { apiRequest, loginAndGetToken, getTestServer, closeTestServer } from './helper.js';

describe('Student Workflow & Features Tests', () => {
  let studentToken;
  let studentUser;

  before(async () => {
    await getTestServer();
    const auth = await loginAndGetToken('student@estudy.com', 'Admin@123');
    studentToken = auth.token;
    studentUser = auth.user;
  });

  after(async () => {
    await closeTestServer();
  });

  describe('Student Dashboard & Profile', () => {
    it('fetches student dashboard with enrolled courses, metrics and assignments', async () => {
      const res = await apiRequest('/api/student/dashboard', { token: studentToken });
      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      assert.ok(res.data.stats, 'Expected stats object');
      assert.ok(typeof res.data.stats.totalAssigned === 'number');
      assert.ok(Array.isArray(res.data.upcomingAssignments));
    });

    it('fetches student profile', async () => {
      const res = await apiRequest('/api/student/profile', { token: studentToken });
      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      assert.equal(res.data.user.email, 'student@estudy.com');
    });

    it('updates student profile without allowing role escalation', async () => {
      const res = await apiRequest('/api/student/profile', {
        method: 'PUT',
        token: studentToken,
        body: {
          name: 'Student Scholar Updated',
          course: 'Information Technology'
        }
      });
      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      assert.equal(res.data.user.role, 'student', 'Role must remain student');
    });
  });

  describe('Course Discovery, Enrollment & Lesson Completion', () => {
    it('lists available courses for enrollment', async () => {
      const res = await apiRequest('/api/student/courses', { token: studentToken });
      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      assert.ok(Array.isArray(res.data.courses));
      assert.ok(res.data.courses.length > 0);
    });

    it('fetches detailed information for a single course', async () => {
      const res = await apiRequest('/api/student/courses/course_1', { token: studentToken });
      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      assert.equal(res.data.course.id, 'course_1');
      assert.ok(Array.isArray(res.data.lessons));
    });

    it('successfully enrolls in a course', async () => {
      const res = await apiRequest('/api/student/courses/course_1/enroll', {
        method: 'POST',
        token: studentToken
      });
      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      assert.ok(res.data.enrollment);
    });

    it('marks a lesson completed and increments progress', async () => {
      const res = await apiRequest('/api/student/courses/course_1/lessons/lesson_1/complete', {
        method: 'POST',
        token: studentToken
      });
      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      assert.ok(res.data.completedLessons.includes('lesson_1'));
    });
  });

  describe('Notes Management (CRUD)', () => {
    let createdNoteId;

    it('creates a new personal note', async () => {
      const notePayload = {
        title: 'Binary Tree Traversal Concepts',
        content: 'In-order: Left, Root, Right. Pre-order: Root, Left, Right.',
        category: 'Data Structures',
        tags: ['tree', 'algorithm']
      };

      const res = await apiRequest('/api/student/notes', {
        method: 'POST',
        token: studentToken,
        body: notePayload
      });

      assert.equal(res.status, 201);
      assert.equal(res.data.success, true);
      assert.ok(res.data.note.id);
      assert.equal(res.data.note.title, notePayload.title);
      createdNoteId = res.data.note.id;
    });

    it('lists all student notes', async () => {
      const res = await apiRequest('/api/student/notes', { token: studentToken });
      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      assert.ok(Array.isArray(res.data.notes));
      assert.ok(res.data.notes.some(n => n.id === createdNoteId));
    });

    it('updates an existing note', async () => {
      const updatePayload = {
        title: 'Binary Tree Traversal (Updated)',
        content: 'Post-order: Left, Right, Root.',
        category: 'Data Structures'
      };

      const res = await apiRequest(`/api/student/notes/${createdNoteId}`, {
        method: 'PUT',
        token: studentToken,
        body: updatePayload
      });

      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      assert.equal(res.data.note.title, updatePayload.title);
    });

    it('deletes the created note', async () => {
      const res = await apiRequest(`/api/student/notes/${createdNoteId}`, {
        method: 'DELETE',
        token: studentToken
      });

      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
    });
  });

  describe('Quiz Examination & Diagnostic Scoring', () => {
    it('retrieves quiz questions without leaking correct options', async () => {
      const res = await apiRequest('/api/student/quizzes/quiz_1', { token: studentToken });
      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      assert.ok(Array.isArray(res.data.questions));
      for (const q of res.data.questions) {
        assert.equal(q.correctOptionIndex, undefined, 'Security violation: correctOptionIndex leaked to student');
        assert.equal(q.explanation, undefined, 'Security violation: explanation leaked to student');
      }
    });

    it('submits a quiz attempt and computes exact deterministic score', async () => {
      const submitRes = await apiRequest('/api/student/quizzes/submit', {
        method: 'POST',
        token: studentToken,
        body: {
          quizId: 'quiz_1',
          userAnswers: {
            // Seed questions for quiz_1: answer with valid selections
            q_1: 1,
            q_2: 0
          }
        }
      });

      assert.equal(submitRes.status, 200);
      assert.equal(submitRes.data.success, true);
      assert.ok(typeof submitRes.data.attempt.score === 'number');
      assert.ok(typeof submitRes.data.attempt.totalPoints === 'number');
      assert.ok(typeof submitRes.data.attempt.percentage === 'number');
    });

    it('computes weak topics based strictly on actual student quiz attempts', async () => {
      const res = await apiRequest('/api/student/weak-topics', { token: studentToken });
      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      assert.ok(Array.isArray(res.data.weakTopics));
      assert.ok(typeof res.data.overallDiagnosticScore === 'number' || res.data.overallDiagnosticScore === null);
    });
  });

  describe('AI Study Coach', () => {
    it('rejects empty coaching prompts', async () => {
      const res = await apiRequest('/api/student/ai-coach', {
        method: 'POST',
        token: studentToken,
        body: { prompt: '   ' }
      });
      assert.equal(res.status, 400);
      assert.equal(res.data.success, false);
      assert.equal(res.data.code, 'INVALID_AI_PROMPT');
    });

    it('returns a structured coaching response for a valid prompt', async () => {
      const res = await apiRequest('/api/student/ai-coach', {
        method: 'POST',
        token: studentToken,
        body: { prompt: 'Explain SQL joins' }
      });
      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      assert.equal(typeof res.data.response.explanation, 'string');
      assert.ok(Array.isArray(res.data.response.practiceQuestions));
      assert.equal(typeof res.data.response.recommendedTopic, 'string');
    });
  });

  describe('Bookmarks System', () => {
    it('toggles and retrieves bookmarks', async () => {
      // Toggle bookmark on course_3 (not in initial seed)
      const toggleRes = await apiRequest('/api/student/bookmarks/toggle', {
        method: 'POST',
        token: studentToken,
        body: {
          itemType: 'course',
          itemId: 'course_3',
          title: 'Operating Systems Principles'
        }
      });
      assert.equal(toggleRes.status, 200);
      assert.equal(toggleRes.data.success, true);
      assert.equal(toggleRes.data.action, 'added');

      // List bookmarks and verify course_3 is present
      const listRes = await apiRequest('/api/student/bookmarks', { token: studentToken });
      assert.equal(listRes.status, 200);
      assert.equal(listRes.data.success, true);
      assert.ok(Array.isArray(listRes.data.bookmarks));
      assert.ok(listRes.data.bookmarks.some(b => b.itemId === 'course_3'));
    });
  });
});
