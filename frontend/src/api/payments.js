import apiClient from './client';

export const paymentAPI = {
  process: (bookingId, method = 'Mock') =>
    apiClient.post(`/Payments/process/${bookingId}`, { method }),
  previewRefund: (bookingId) =>
    apiClient.get(`/Payments/${bookingId}/refund-preview`),
  refund: (bookingId, reason) =>
    apiClient.post(`/Payments/${bookingId}/refund`, { reason }),
};