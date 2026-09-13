import apiClient from './client';

export const categoryAPI = {
  getAll: () => apiClient.get('/Categories'),
  create: (data) => apiClient.post('/Categories', data),
};