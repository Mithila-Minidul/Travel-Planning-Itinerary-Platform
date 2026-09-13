import apiClient from './client';

export const destinationAPI = {
  getAll: () => apiClient.get('/Destinations'),
  getById: (id) => apiClient.get(`/Destinations/${id}`),
  getWeather: (id) => apiClient.get(`/Destinations/${id}/weather`),
  create: (data) => apiClient.post('/Destinations', data),
  remove: (id) => apiClient.delete(`/Destinations/${id}`),
};