// Backend/test/auth.test.js
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { apiRequest, getTestServer, closeTestServer } from './helper.js';
import { dataStore } from '../src/services/dataStore.js';

describe('Auth Workflow & Security Tests', () => {
  before(async () => {
    await getTestServer();
  });

  after(async () => {
    await closeTestServer();
  });

  describe('User Registration', () => {
    it('successfully registers a new student account', async () => {
      const randomId = Math.random().toString(36).substring(2, 8);
      const studentPayload = {
        name: `Test Student ${randomId}`,
        email: `student_${randomId}@estudy.com`,
        password: 'Password@123',
        course: 'Computer Science',
        courseYear: '1st Year'
      };

      const res = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: studentPayload
      });

      assert.equal(res.status, 201);
      assert.equal(res.data.success, true);
      assert.ok(res.data.token, 'Expected JWT token in response');
      assert.equal(res.data.user.email, studentPayload.email);
      assert.equal(res.data.user.role, 'student');
      assert.equal(res.data.user.password, undefined, 'Password must never be returned in user payload');
    });

    it('rejects self-registration for privileged roles (teacher or admin)', async () => {
      const res = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: {
          name: 'Privilege Escalation Attempt',
          email: 'escalate@estudy.com',
          password: 'Password@123',
          role: 'teacher'
        }
      });

      assert.equal(res.status, 403);
      assert.equal(res.data.success, false);
      assert.match(res.data.message, /Access denied/i);
    });

    it('rejects duplicate email registration', async () => {
      const res = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: {
          name: 'Duplicate Student',
          email: 'student@estudy.com',
          password: 'Password@123'
        }
      });

      assert.equal(res.status, 400);
      assert.equal(res.data.success, false);
      assert.match(res.data.message, /already exists/i);
    });

    it('validates password minimum length and email format', async () => {
      const res = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: {
          name: 'Short Password User',
          email: 'invalid-email',
          password: '123'
        }
      });

      assert.equal(res.status, 400);
      assert.equal(res.data.success, false);
    });
  });

  describe('User Login', () => {
    it('authenticates valid student credentials', async () => {
      const res = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: {
          email: 'student@estudy.com',
          password: 'Admin@123'
        }
      });

      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      assert.ok(res.data.token);
      assert.equal(res.data.user.role, 'student');
    });

    it('rejects invalid password with 401', async () => {
      const res = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: {
          email: 'student@estudy.com',
          password: 'WrongPassword@999'
        }
      });

      assert.equal(res.status, 401);
      assert.equal(res.data.success, false);
    });

    it('rejects missing credentials with 400', async () => {
      const res = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: { email: '' }
      });

      assert.equal(res.status, 400);
      assert.equal(res.data.success, false);
    });

    it('rejects role mismatch with 403', async () => {
      const res = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: {
          email: 'student@estudy.com',
          password: 'Admin@123',
          role: 'teacher'
        }
      });

      assert.equal(res.status, 403);
      assert.equal(res.data.success, false);
    });
  });

  describe('Authenticated /me Endpoint', () => {
    it('returns profile when provided a valid Bearer token', async () => {
      const loginRes = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: { email: 'student@estudy.com', password: 'Admin@123' }
      });
      const token = loginRes.data.token;

      const meRes = await apiRequest('/api/auth/me', { token });
      assert.equal(meRes.status, 200);
      assert.equal(meRes.data.success, true);
      assert.equal(meRes.data.user.email, 'student@estudy.com');
    });

    it('rejects request with missing or invalid token with 401', async () => {
      const res = await apiRequest('/api/auth/me', {
        headers: { Authorization: 'Bearer invalid.token.payload' }
      });
      assert.equal(res.status, 401);
    });
  });

  describe('Password Reset with OTP', () => {
    it('issues an OTP and confirms password reset securely', async () => {
      const testEmail = 'student@estudy.com';

      // 1. Request password reset
      const resetReq = await apiRequest('/api/auth/reset-password', {
        method: 'POST',
        body: { email: testEmail }
      });
      assert.equal(resetReq.status, 200);

      // 2. Fetch user to retrieve the active reset code for testing
      const user = await dataStore.getUserByEmail(testEmail);
      assert.ok(user.resetCode, 'Expected resetCode to be generated and stored in dataStore');

      // 3. Reject wrong OTP
      const wrongOtpRes = await apiRequest('/api/auth/confirm-reset-password', {
        method: 'POST',
        body: {
          email: testEmail,
          resetCode: '000000',
          newPassword: 'BrandNewPassword@456'
        }
      });
      assert.equal(wrongOtpRes.status, 400);

      // 4. Confirm with the correct OTP
      // Note: In dataStore, user.resetCode stores the hashed OTP if MongoDB or the test store handles it.
      // But confirmResetOTP checks either plaintext match or SHA-256 match.
      // In dataStore.setResetOTP(email, resetOTP), resetCode was set.
      const confirmRes = await apiRequest('/api/auth/confirm-reset-password', {
        method: 'POST',
        body: {
          email: testEmail,
          resetCode: user.resetCode,
          newPassword: 'BrandNewPassword@456'
        }
      });
      assert.equal(confirmRes.status, 200);
      assert.equal(confirmRes.data.success, true);

      // 5. Verify new password allows login
      const loginRes = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: {
          email: testEmail,
          password: 'BrandNewPassword@456'
        }
      });
      assert.equal(loginRes.status, 200);
      assert.ok(loginRes.data.token);

      // Restore original password for other test suites
      await dataStore.updateUser(user.id, { password: 'Admin@123' });
    });
  });
});
