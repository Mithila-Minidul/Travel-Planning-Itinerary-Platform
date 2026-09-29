import apiClient from './client';

export const adminUserAPI = {
  // Fetches all Travel Agents (Pending & Approved)
  getTravelAgents: () => apiClient.get('/AdminUsers/travel-agents'),
  
  // Updates the IsActive status (true = Approve, false = Reject/Disable)
  updateAgentStatus: (id, isActive) => 
    apiClient.patch(`/AdminUsers/travel-agents/${id}/status`, { isActive }),

  // ✅ ADD THIS: Fetches all Travelers
  getTravelers: () => apiClient.get('/AdminUsers/travelers'),

    // ✅ Recent activity feed for dashboard
  getRecentActivity: (limit = 5) => apiClient.get(`/AdminUsers/recent-activity?limit=${limit}`),
};