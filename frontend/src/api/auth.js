import apiClient from './client';

export const authAPI = {
  register: (data) => apiClient.post('/Auth/register', data),
  login: (data) => apiClient.post('/Auth/login', data),
  me: () => apiClient.get('/Auth/me'),
};