// Backend/test/helper.js
import app from '../index.js';

let serverInstance = null;
let baseUrl = '';

/**
 * Initializes and starts an ephemeral HTTP server on an open OS-assigned port.
 */
export async function getTestServer() {
  if (serverInstance && baseUrl) {
    return { server: serverInstance, baseUrl };
  }

  return new Promise((resolve, reject) => {
    const server = app.listen(0, '127.0.0.1', () => {
      const address = server.address();
      baseUrl = `http://127.0.0.1:${address.port}`;
      serverInstance = server;
      resolve({ server: serverInstance, baseUrl });
    });

    server.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Gracefully shuts down the test server.
 */
export async function closeTestServer() {
  if (serverInstance) {
    return new Promise((resolve) => {
      serverInstance.close(() => {
        serverInstance = null;
        baseUrl = '';
        resolve();
      });
    });
  }
}

/**
 * Universal JSON/HTTP request client for endpoint testing.
 */
export async function apiRequest(endpoint, {
  method = 'GET',
  headers = {},
  body = null,
  token = null
} = {}) {
  const { baseUrl: host } = await getTestServer();
  const targetUrl = endpoint.startsWith('http') ? endpoint : `${host}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const reqHeaders = { ...headers };
  if (token) {
    reqHeaders['Authorization'] = `Bearer ${token}`;
  }

  let reqBody = undefined;
  if (body !== null && typeof body === 'object') {
    reqHeaders['Content-Type'] = 'application/json';
    reqBody = JSON.stringify(body);
  } else if (body !== null && body !== undefined) {
    reqBody = String(body);
  }

  const response = await fetch(targetUrl, {
    method,
    headers: reqHeaders,
    body: reqBody
  });

  const responseText = await response.text();
  let parsedData = null;
  try {
    parsedData = JSON.parse(responseText);
  } catch {
    parsedData = responseText;
  }

  return {
    status: response.status,
    ok: response.ok,
    headers: response.headers,
    data: parsedData
  };
}

/**
 * Helper to authenticate and retrieve a valid Bearer token for testing.
 */
export async function loginAndGetToken(email, password = 'Admin@123') {
  const res = await apiRequest('/api/auth/login', {
    method: 'POST',
    body: { email, password }
  });

  if (!res.ok) {
    throw new Error(`Login failed for ${email} (${res.status}): ${JSON.stringify(res.data)}`);
  }

  return {
    token: res.data.token,
    user: res.data.user
  };
}
