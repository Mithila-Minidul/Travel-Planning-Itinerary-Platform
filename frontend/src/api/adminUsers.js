import apiClient from './client';

export const adminUserAPI = {
  // Fetches all Travel Agents (Pending, Active, Rejected)
  getTravelAgents: () => apiClient.get('/AdminUsers/travel-agents'),

  // Updates the Status string ('Active' or 'Rejected')
  updateAgentStatus: (id, status) =>
    apiClient.patch(`/AdminUsers/travel-agents/${id}/status`, { status }),

  // Fetches all Travelers
  getTravelers: () => apiClient.get('/AdminUsers/travelers'),

  // Recent activity feed for dashboard
  getRecentActivity: (limit = 5) => apiClient.get(`/AdminUsers/recent-activity?limit=${limit}`),
};