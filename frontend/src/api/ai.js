import apiClient from './client';

export const aiAPI = {
  // AI Workflow endpoints (to be built by other members)
  // This is the skeleton for Member 2, 3, 4 to implement
  triggerItinerary: (data) => apiClient.post('/ai/generate-itinerary', data),
  getWorkflow: (id) => apiClient.get(`/ai/workflows/${id}`),
  approve: (id) => apiClient.put(`/ai/workflows/${id}/approve`),
  reject: (id, reason) => apiClient.put(`/ai/workflows/${id}/reject`, { reason }),
  getLogs: (id) => apiClient.get(`/ai/execution-logs/${id}`),
};