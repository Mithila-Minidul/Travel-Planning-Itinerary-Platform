import apiClient from './client';

export const experienceAPI = {
  getAll: (params) => apiClient.get('/Experiences', { params }),
  getById: (id, date) => apiClient.get(`/Experiences/${id}`, { params: { date } }),
  calculatePrice: (id, date) => apiClient.get(`/Experiences/${id}/price-calculation`, { params: { date } }),
  create: (data) => apiClient.post('/Experiences', data),
  updateStatus: (id, status) => apiClient.patch(`/Experiences/${id}/status`, null, { params: { status } }),
  searchForAgent: (data) => apiClient.post('/Experiences/search-agent-tool', data),
  getPending: () => apiClient.get('/Experiences/pending-approvals'),
};