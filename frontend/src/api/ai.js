import apiClient from './client';

export const aiAPI = {
  generateItinerary: (tripId) =>
      apiClient.post('/ai/generate-itinerary', { tripId }),

  getWorkflow: (id) =>
      apiClient.get(`/ai/workflows/${id}`),

  getLatestForTrip: (tripId) =>
      apiClient.get(`/ai/trips/${tripId}/latest`),

  getPending: () =>
      apiClient.get('/ai/workflows/pending'),

  editItinerary: (id, data) =>
      apiClient.put(`/ai/workflows/${id}/itinerary`, data),

  approve: (id, notes = '') =>
      apiClient.put(`/ai/workflows/${id}/approve`, { notes }),

  reject: (id, reason) =>
      apiClient.put(`/ai/workflows/${id}/reject`, { notes: reason }),

  requestRevision: (id, notes) =>
      apiClient.put(`/ai/workflows/${id}/revise`, { notes }),

  getLogs: (id) =>
      apiClient.get(`/ai/execution-logs/${id}`),
};
