// frontend/src/services/publicService.js
import api from './api';

export const publicService = {
  getNotifications: () => api.get('/public/notifications').then(res => res.data),
  submitEnquiry: (data) => api.post('/public/enquiry', data).then(res => res.data)
};

export default publicService;
