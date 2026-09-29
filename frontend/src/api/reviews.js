import apiClient from './client';

export const reviewAPI = {
  getAll: () => apiClient.get('/Reviews'),
  getForGuide: () => apiClient.get('/Reviews/guide'),
  reply: (id, reply) => apiClient.patch(`/Reviews/${id}/reply`, { reply }),
  deleteReply: (id) => apiClient.delete(`/Reviews/${id}/reply`),
  update: (id, rating, comment) => apiClient.put(`/Reviews/${id}`, { rating, comment }),
  delete: (id) => apiClient.delete(`/Reviews/${id}`),
};