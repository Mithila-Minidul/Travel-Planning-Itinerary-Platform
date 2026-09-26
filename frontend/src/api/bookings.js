import apiClient from './client';

export const bookingAPI = {
  create: (data) => apiClient.post('/Bookings', data),
  getAll: () => apiClient.get('/Bookings'),
  getById: (id) => apiClient.get(`/Bookings/${id}`),
  confirm: (id) => apiClient.patch(`/Bookings/${id}/confirm`),
  reject: (id, reason) => apiClient.patch(`/Bookings/${id}/reject`, { reason }),
  cancel: (id, reason) => apiClient.patch(`/Bookings/${id}/cancel`, { reason }),
  checkIn: (id, code) =>
    apiClient.patch(`/Bookings/${id}/check-in`, null, { params: { code } }),
  checkInByCode: (confirmationCode) =>
    apiClient.post('/Bookings/check-in-by-code', { confirmationCode }),
};