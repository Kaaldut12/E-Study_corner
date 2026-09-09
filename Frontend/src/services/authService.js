import api from './api';

export const login = (credentials) => api.post('/auth/login', credentials);
export const register = (details) => api.post('/auth/register', details);
export const getMe = () => api.get('/auth/me');
export const requestPasswordReset = (email) => api.post('/auth/reset-password', { email });
