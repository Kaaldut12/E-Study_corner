// frontend/src/services/api.js
import axios from 'axios';

/**
 * Dynamically resolves the API base URL.
 * Prevents remote deployments (e.g. Vercel) from failing with "Network Error"
 * caused by accidentally calling http://localhost:3001.
 */
const resolveApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;

  if (typeof window !== 'undefined') {
    const isRemote = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

    if (isRemote) {
      // If VITE_API_URL points to a remote backend (not localhost), use it and ensure /api
      if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
        const clean = envUrl.replace(/\/+$/, '');
        return clean.endsWith('/api') ? clean : `${clean}/api`;
      }
      // If VITE_API_URL is missing or was defaulted to localhost, alert developer in console and route to same-origin /api
      console.warn(
        '[API Configuration Notice]: VITE_API_URL is not set for remote deployment. Falling back to same-origin /api. If your backend is deployed separately, specify VITE_API_URL=https://your-backend.vercel.app/api in Vercel Environment Variables.'
      );
      return `${window.location.origin}/api`;
    }
  }

  const base = (envUrl || 'http://localhost:3001/api').replace(/\/+$/, '');
  return base.endsWith('/api') ? base : `${base}/api`;
};

export const API_BASE_URL = resolveApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000
});

// Attach JWT Bearer token to custom api instance
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response error interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Standardize error message extraction
    let message = error.response?.data?.message;
    if (!message) {
      if (error.message === 'Network Error') {
        message = 'Unable to reach the server. Please verify your connection or try again in a moment.';
      } else {
        message = error.message || 'An unexpected error occurred';
      }
    }
    const code = error.response?.data?.code || 'UNKNOWN_ERROR';

    // Auto logout on 401 token expiration (unless on auth routes)
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user_data');
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject({ ...error, parsedMessage: message, errorCode: code });
  }
);

export default api;
