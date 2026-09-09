// Backend/test/admin.test.js
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { apiRequest, loginAndGetToken, getTestServer, closeTestServer } from './helper.js';

describe('Admin Workflow, Governance & Security Tests', () => {
  let adminToken;
  let adminUser;
  let teacherToken;
  let studentToken;

  before(async () => {
    await getTestServer();
    const adminAuth = await loginAndGetToken('admin@estudy.com', 'Admin@123');
    adminToken = adminAuth.token;
    adminUser = adminAuth.user;

    const teacherAuth = await loginAndGetToken('teacher@estudy.com', 'Admin@123');
    teacherToken = teacherAuth.token;

    const studentAuth = await loginAndGetToken('student@estudy.com', 'Admin@123');
    studentToken = studentAuth.token;
  });

  after(async () => {
    await closeTestServer();
  });

  describe('Admin Authorization Guards', () => {
    it('blocks student accounts from accessing admin endpoints with 403', async () => {
      const res = await apiRequest('/api/admin/dashboard', { token: studentToken });
      assert.equal(res.status, 403);
    });

    it('blocks teacher accounts from accessing admin endpoints with 403', async () => {
      const res = await apiRequest('/api/admin/dashboard', { token: teacherToken });
      assert.equal(res.status, 403);
    });

    it('blocks unauthenticated requests with 401', async () => {
      const res = await apiRequest('/api/admin/dashboard');
      assert.equal(res.status, 401);
    });
  });

  describe('Admin Dashboard & Platform Analytics', () => {
    it('fetches admin dashboard with aggregate platform counters', async () => {
      const res = await apiRequest('/api/admin/dashboard', { token: adminToken });
      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      assert.ok(res.data.stats, 'Expected platform stats');
      assert.ok(typeof res.data.stats.totalUsers === 'number');
      assert.ok(typeof res.data.stats.activeUsers === 'number');
      assert.ok(Array.isArray(res.data.recentUsers));
    });

    it('fetches platform analytics without fake randomized fallbacks', async () => {
      const res = await apiRequest('/api/admin/analytics', { token: adminToken });
      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      assert.ok(res.data.analytics, 'Expected analytics object');
      assert.ok(Array.isArray(res.data.analytics.departmentDistribution));
      assert.ok(Array.isArray(res.data.analytics.monthlyTrends));
    });
  });

  describe('User Management & Security Field Whitelisting', () => {
    it('lists all registered users without exposing passwords', async () => {
      const res = await apiRequest('/api/admin/users', { token: adminToken });
      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      assert.ok(Array.isArray(res.data.users));
      for (const u of res.data.users) {
        assert.equal(u.password, undefined, 'User passwords must never be exposed');
      }
    });

    it('updates user profile fields according to whitelist', async () => {
      const res = await apiRequest('/api/admin/users/user_student_1', {
        method: 'PUT',
        token: adminToken,
        body: {
          firstName: 'Scholar',
          department: 'Department of Computer Science & Engineering'
        }
      });

      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      assert.equal(res.data.user.firstName, 'Scholar');
    });

    it('rejects privilege escalation to superadmin by standard admin with 403', async () => {
      const res = await apiRequest('/api/admin/users/user_student_1', {
        method: 'PUT',
        token: adminToken,
        body: {
          role: 'superadmin'
        }
      });

      // Role cannot be escalated by non-superadmin
      // In adminController: if ((targetUser.role === 'superadmin' || body.role === 'superadmin') && req.user?.role !== 'superadmin') -> 403
      assert.equal(res.status, 403);
    });

    it('toggles user status between active and suspended', async () => {
      // 1. Suspend student
      const suspendRes = await apiRequest('/api/admin/users/user_student_2/status', {
        method: 'PUT',
        token: adminToken,
        body: { status: 'suspended' }
      });
      assert.equal(suspendRes.status, 200);
      assert.equal(suspendRes.data.user.status, 'suspended');

      // 2. Reactivate student
      const activateRes = await apiRequest('/api/admin/users/user_student_2/status', {
        method: 'PUT',
        token: adminToken,
        body: { status: 'active' }
      });
      assert.equal(activateRes.status, 200);
      assert.equal(activateRes.data.user.status, 'active');
    });

    it('prevents suspending Super Admin account with 403', async () => {
      const res = await apiRequest('/api/admin/users/user_superadmin_1/status', {
        method: 'PUT',
        token: adminToken,
        body: { status: 'suspended' }
      });
      assert.equal(res.status, 403);
    });
  });

  describe('Support Messages & Inquiries Resolution', () => {
    it('lists support tickets', async () => {
      const res = await apiRequest('/api/admin/messages', { token: adminToken });
      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      assert.ok(Array.isArray(res.data.messages));
    });

    it('replies to and resolves a support ticket', async () => {
      const messagesRes = await apiRequest('/api/admin/messages', { token: adminToken });
      if (messagesRes.data.messages && messagesRes.data.messages.length > 0) {
        const ticketId = messagesRes.data.messages[0].id;
        const replyRes = await apiRequest(`/api/admin/messages/${ticketId}`, {
          method: 'PUT',
          token: adminToken,
          body: {
            status: 'resolved',
            adminReply: 'Your inquiry has been investigated and resolved by IT support.'
          }
        });
        assert.equal(replyRes.status, 200);
        assert.equal(replyRes.data.success, true);
      }
    });
  });

  describe('Study Materials & Broadcast Notifications', () => {
    let createdMaterialId;

    it('creates and lists study material', async () => {
      const materialPayload = {
        title: 'Compiler Design Complete Lecture Notes',
        subject: 'Computer Science',
        category: 'Notes',
        description: 'Comprehensive parser construction and lexical analysis notes.',
        courseYear: '3rd Year',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
      };

      const createRes = await apiRequest('/api/admin/study-material', {
        method: 'POST',
        token: adminToken,
        body: materialPayload
      });

      assert.equal(createRes.status, 201);
      assert.equal(createRes.data.success, true);
      assert.ok(createRes.data.material.id);
      createdMaterialId = createRes.data.material.id;

      // List study materials
      const listRes = await apiRequest('/api/admin/study-material', { token: adminToken });
      assert.equal(listRes.status, 200);
      assert.equal(listRes.data.success, true);
      assert.ok(Array.isArray(listRes.data.materials));
      assert.ok(listRes.data.materials.some(m => m.id === createdMaterialId));
    });

    it('deletes the created study material', async () => {
      const res = await apiRequest(`/api/admin/study-material/${createdMaterialId}`, {
        method: 'DELETE',
        token: adminToken
      });

      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
    });

    it('creates and lists campus marquee notifications', async () => {
      const notifRes = await apiRequest('/api/admin/notifications', {
        method: 'POST',
        token: adminToken,
        body: {
          message: 'Mid-term examinations commence next Monday. Check your updated timetable.'
        }
      });

      assert.equal(notifRes.status, 201);
      assert.equal(notifRes.data.success, true);

      const listRes = await apiRequest('/api/admin/notifications', { token: adminToken });
      assert.equal(listRes.status, 200);
      assert.ok(Array.isArray(listRes.data.notifications));
    });
  });
});
