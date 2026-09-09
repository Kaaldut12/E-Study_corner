// Backend/test/teacher.test.js
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { apiRequest, loginAndGetToken, getTestServer, closeTestServer } from './helper.js';

describe('Teacher Workflow & Grading Tests', () => {
  let teacherToken;
  let teacherUser;
  let studentToken;

  before(async () => {
    await getTestServer();
    const teacherAuth = await loginAndGetToken('teacher@estudy.com', 'Admin@123');
    teacherToken = teacherAuth.token;
    teacherUser = teacherAuth.user;

    const studentAuth = await loginAndGetToken('student@estudy.com', 'Admin@123');
    studentToken = studentAuth.token;
  });

  after(async () => {
    await closeTestServer();
  });

  describe('Teacher Authorization Guards', () => {
    it('blocks student accounts from accessing teacher endpoints with 403', async () => {
      const res = await apiRequest('/api/teacher/dashboard', { token: studentToken });
      assert.equal(res.status, 403);
    });

    it('blocks unauthenticated requests with 401', async () => {
      const res = await apiRequest('/api/teacher/dashboard');
      assert.equal(res.status, 401);
    });
  });

  describe('Teacher Dashboard & Metrics', () => {
    it('fetches teacher dashboard metrics and managed courses', async () => {
      const res = await apiRequest('/api/teacher/dashboard', { token: teacherToken });
      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      assert.ok(res.data.stats, 'Expected stats object');
      assert.ok(Array.isArray(res.data.recentAssignments));
      assert.ok(Array.isArray(res.data.pendingGradingSubmissions));
    });

    it('lists courses assigned to the teacher', async () => {
      const res = await apiRequest('/api/teacher/courses', { token: teacherToken });
      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      assert.ok(Array.isArray(res.data.courses));
    });
  });

  describe('Course, Lesson & Assessment Authoring', () => {
    let createdCourseId;
    let createdQuizId;

    it('creates a new course with input validation', async () => {
      // 1. Validation test: missing required fields
      const invalidRes = await apiRequest('/api/teacher/courses', {
        method: 'POST',
        token: teacherToken,
        body: { title: 'Incomplete Course' }
      });
      assert.equal(invalidRes.status, 400);

      // 2. Valid course creation
      const coursePayload = {
        code: 'CS-401',
        title: 'Distributed Systems & Microservices',
        subject: 'Computer Science',
        department: 'Computer Science & Engineering',
        description: 'Consensus protocols, Raft, Paxos, and distributed data pipelines.',
        courseYear: '4th Year'
      };

      const res = await apiRequest('/api/teacher/courses', {
        method: 'POST',
        token: teacherToken,
        body: coursePayload
      });

      assert.equal(res.status, 201);
      assert.equal(res.data.success, true);
      assert.ok(res.data.course.id);
      assert.equal(res.data.course.title, coursePayload.title);
      createdCourseId = res.data.course.id;
    });

    it('creates a lesson inside the course', async () => {
      const lessonPayload = {
        courseId: createdCourseId,
        moduleTitle: 'Module 1: Consensus Fundamentals',
        lessonOrder: 1,
        title: 'Introduction to the Raft Consensus Protocol',
        description: 'Leader election, log replication, and safety guarantees in Raft.',
        durationMinutes: 40
      };

      const res = await apiRequest('/api/teacher/lessons', {
        method: 'POST',
        token: teacherToken,
        body: lessonPayload
      });

      assert.equal(res.status, 201);
      assert.equal(res.data.success, true);
      assert.ok(res.data.lesson.id);
      assert.equal(res.data.lesson.title, lessonPayload.title);
    });

    it('creates a quiz and quiz questions', async () => {
      const quizPayload = {
        courseId: createdCourseId,
        title: 'Distributed Systems Diagnostics',
        subject: 'Computer Science',
        timeLimitMinutes: 20,
        passingPercentage: 60
      };

      const quizRes = await apiRequest('/api/teacher/quizzes', {
        method: 'POST',
        token: teacherToken,
        body: quizPayload
      });

      assert.equal(quizRes.status, 201);
      assert.equal(quizRes.data.success, true);
      createdQuizId = quizRes.data.quiz.id;

      // Add a question
      const questionRes = await apiRequest(`/api/teacher/quizzes/${createdQuizId}/questions`, {
        method: 'POST',
        token: teacherToken,
        body: {
          quizId: createdQuizId,
          questionText: 'What is the primary role of the leader in Raft?',
          options: [
            'Only storing logs without replicating',
            'Accepting client requests and managing log replication',
            'Handling TLS encryption',
            'Generating random seeds'
          ],
          correctOptionIndex: 1,
          points: 10,
          explanation: 'The leader in Raft coordinates all log replication to maintain consistency.'
        }
      });

      assert.equal(questionRes.status, 201);
      assert.equal(questionRes.data.success, true);
    });

    it('creates an assignment for students', async () => {
      const assignmentPayload = {
        courseId: createdCourseId,
        title: 'Build a 3-Node Raft Cluster in Go or Node.js',
        subject: 'Distributed Systems',
        description: 'Implement leader heartbeats and log entry replication across 3 simulated nodes.',
        dueDate: '2026-10-15',
        totalPoints: 100
      };

      const res = await apiRequest('/api/teacher/assignments', {
        method: 'POST',
        token: teacherToken,
        body: assignmentPayload
      });

      assert.equal(res.status, 201);
      assert.equal(res.data.success, true);
      assert.ok(res.data.assignment.id);
    });
  });

  describe('Student Submission Grading & Validation', () => {
    it('rejects invalid or out-of-range grades with 400', async () => {
      // 1. Reject negative grade
      const negRes = await apiRequest('/api/teacher/submissions/sub_demo_2/grade', {
        method: 'POST',
        token: teacherToken,
        body: {
          grade: -10,
          feedback: 'Negative score test'
        }
      });
      assert.equal(negRes.status, 400);

      // 2. Reject grade exceeding assignment max points (150 > 100)
      const excessRes = await apiRequest('/api/teacher/submissions/sub_demo_2/grade', {
        method: 'POST',
        token: teacherToken,
        body: {
          grade: 150,
          feedback: 'Excess score test'
        }
      });
      assert.equal(excessRes.status, 400);
      assert.match(excessRes.data.message, /cannot exceed the maximum/i);
    });

    it('grades a student submission with valid score and updates status', async () => {
      const res = await apiRequest('/api/teacher/submissions/sub_demo_2/grade', {
        method: 'POST',
        token: teacherToken,
        body: {
          grade: 95,
          feedback: 'Outstanding AVL tree rotation logic and clean comments.'
        }
      });

      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      assert.equal(res.data.submission.grade, 95);
      assert.equal(res.data.submission.status, 'graded');
    });
  });

  describe('Academic Doubts & Q&A Workflow', () => {
    it('fetches questions submitted to teacher', async () => {
      const res = await apiRequest('/api/teacher/questions', { token: teacherToken });
      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      assert.ok(Array.isArray(res.data.questions));
    });

    it('replies to student academic question', async () => {
      const res = await apiRequest('/api/teacher/questions/tq_1/reply', {
        method: 'POST',
        token: teacherToken,
        body: {
          replyText: 'Follow-up answer: Always balance right after removing the in-order successor node.'
        }
      });

      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
    });
  });
});
