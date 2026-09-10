import api from './api';

export const login = (credentials) => api.post('/auth/login', credentials);
export const register = (details) => api.post('/auth/register', details);
export const getMe = () => api.get('/auth/me');
export const updateProfile = (data) => api.put('/auth/profile', data);
export const changePassword = (data) => api.post('/auth/change-password', data);
export const requestPasswordReset = (email) => api.post('/auth/reset-password', { email });
export const confirmResetPassword = (data) => api.post('/auth/confirm-reset-password', data);
export const confirmPasswordReset = confirmResetPassword;

export default {
  login,
  register,
  getMe,
  updateProfile,
  changePassword,
  requestPasswordReset,
  confirmResetPassword,
  confirmPasswordReset
};
