import apiClient from './client';

export const tripAPI = {
  getAll: () => apiClient.get('/Trips'),
  getById: (id) => apiClient.get(`/Trips/${id}`),
  create: (data) => apiClient.post('/Trips', data),
  update: (id, data) => apiClient.put(`/Trips/${id}`, data),
  remove: (id) => apiClient.delete(`/Trips/${id}`),
  validate: (id) => apiClient.post(`/Trips/${id}/validate`),
  getStops: (tripId) => apiClient.get(`/trips/${tripId}/stops`),
  getStop: (tripId, stopId) => apiClient.get(`/trips/${tripId}/stops/${stopId}`),
  createStop: (tripId, data) => apiClient.post(`/trips/${tripId}/stops`, data),
  updateStop: (tripId, stopId, data) => apiClient.put(`/trips/${tripId}/stops/${stopId}`, data),
  removeStop: (tripId, stopId) => apiClient.delete(`/trips/${tripId}/stops/${stopId}`),
};
