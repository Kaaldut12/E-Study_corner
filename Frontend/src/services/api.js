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
      // If VITE_API_URL is missing or was defaulted to localhost, route to same-origin /api
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
  timeout: 15000
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
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
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

// Also attach Bearer token to default global axios instance for legacy calls
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
