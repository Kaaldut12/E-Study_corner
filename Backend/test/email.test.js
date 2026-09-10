// Backend/test/email.test.js
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { apiRequest, loginAndGetToken, getTestServer, closeTestServer } from './helper.js';
import { getEmailConfig, verifyEmailConnection, sendEmail } from '../src/services/emailService.js';

describe('Nodemailer Email Service & Endpoints Tests', () => {
  let adminToken;
  let studentToken;

  before(async () => {
    await getTestServer();
    const adminAuth = await loginAndGetToken('admin@estudy.com', 'Admin@123');
    adminToken = adminAuth.token;

    const studentAuth = await loginAndGetToken('student@estudy.com', 'Admin@123');
    studentToken = studentAuth.token;
  });

  after(async () => {
    await closeTestServer();
  });

  describe('Nodemailer Core Service Units', () => {
    it('resolves email configuration without crashing', () => {
      const config = getEmailConfig();
      assert.ok(typeof config === 'object');
      assert.ok('port' in config);
      assert.ok('from' in config);
    });

    it('verifies transporter connection gracefully in test environment', async () => {
      const status = await verifyEmailConnection();
      assert.ok(typeof status === 'object');
      assert.ok('connected' in status);
      assert.ok('mode' in status);
    });

    it('successfully dispatches email using sendEmail', async () => {
      const result = await sendEmail({
        to: 'student@estudy.com',
        subject: 'Welcome to Semester',
        text: 'Class begins Monday.',
        html: '<p>Class begins Monday.</p>'
      });
      assert.equal(result.success, true);
      assert.ok(result.messageId);
    });

    it('rejects sendEmail calls missing recipient or subject', async () => {
      await assert.rejects(
        () => sendEmail({ subject: 'No recipient', text: 'Hello' }),
        { message: 'Email recipient "to" is required.' }
      );
      await assert.rejects(
        () => sendEmail({ to: 'student@estudy.com', text: 'Hello' }),
        { message: 'Email "subject" is required.' }
      );
    });
  });

  describe('Admin Email API Endpoints', () => {
    it('blocks non-admin users from email endpoints', async () => {
      const res = await apiRequest('/api/admin/email-status', { token: studentToken });
      assert.equal(res.status, 403);
    });

    it('allows admin to query email connection status', async () => {
      const res = await apiRequest('/api/admin/email-status', { token: adminToken });
      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      assert.ok(res.data.status);
    });

    it('allows admin to send a test email', async () => {
      const res = await apiRequest('/api/admin/email-test', {
        method: 'POST',
        token: adminToken,
        body: { to: 'admin@estudy.com' }
      });
      if (res.status !== 200) console.log('email-test failed with:', res.data);
      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      assert.ok(res.data.message.includes('admin@estudy.com'));
    });

    it('allows admin to send a broadcast email via POST /api/admin/send-email', async () => {
      const res = await apiRequest('/api/admin/send-email', {
        method: 'POST',
        token: adminToken,
        body: {
          sendTo: 'cohort@estudy.com',
          subject: 'Semester Exam Update',
          message: 'Please check your portal schedule.'
        }
      });
      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
    });
  });
});
