import apiClient from './client';

export const guideAPI = {
  getAll: (status) => apiClient.get('/LocalGuides', { params: { status } }),
  getById: (id) => apiClient.get(`/LocalGuides/${id}`),
  updateStatus: (id, status) => apiClient.patch(`/LocalGuides/${id}/status`, null, { params: { status } }),
  getMyStats: () => apiClient.get('/LocalGuides/me/stats'),
};