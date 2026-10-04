import apiClient from './client';

export const tripAPI = {
  getAllTrips: () => apiClient.get('/Trips'),
  getTripById: (id) => apiClient.get(`/Trips/${id}`),
  createTrip: (data) => apiClient.post('/Trips', data),
  reviewTrip: (id, data) => apiClient.patch(`/Trips/${id}/review`, data),
  deleteTrip: (id) => apiClient.delete(`/Trips/${id}`),
};