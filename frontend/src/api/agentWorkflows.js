import apiClient from './client';

export const agentWorkflowAPI = {
  // List all workflows (Admin + TravelAgent)
  getAll: (tripId) =>
    apiClient.get('/AgentWorkflows', { params: tripId ? { tripId } : {} }),

  // Full workflow detail with all execution logs
  getById: (id) => apiClient.get(`/AgentWorkflows/${id}`),

  // Latest workflow for a specific trip
  getByTrip: (tripId) => apiClient.get(`/AgentWorkflows/by-trip/${tripId}`),
};