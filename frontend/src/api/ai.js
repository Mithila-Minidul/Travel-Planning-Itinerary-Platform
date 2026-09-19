import apiClient from './client';

export const aiAPI = {
    // Generate itinerary
    generateItinerary: (tripId) =>
        apiClient.post('/ai/generate-itinerary', { tripId }),

    // Backward-compatible alias
    triggerItinerary: (data) =>
        apiClient.post('/ai/generate-itinerary', data),

    // Get workflow
    getWorkflow: (id) =>
        apiClient.get(`/ai/workflows/${id}`),

    // Get latest workflow for a trip
    getLatestForTrip: (tripId) =>
        apiClient.get(`/ai/trips/${tripId}/latest`),

    // Get pending workflows for AI review queue
    getPending: () =>
        apiClient.get('/ai/workflows/pending'),

    // Edit itinerary
    editItinerary: (id, data) =>
        apiClient.put(`/ai/workflows/${id}/itinerary`, data),

    // Approve itinerary
    approve: (id, notes = '') =>
        apiClient.put(`/ai/workflows/${id}/approve`, { notes }),

    // Reject itinerary
    reject: (id, reason) =>
        apiClient.put(`/ai/workflows/${id}/reject`, { notes: reason }),

    // Request revision
    requestRevision: (id, notes) =>
        apiClient.put(`/ai/workflows/${id}/revise`, { notes }),

    // Get execution logs
    getLogs: (id) =>
        apiClient.get(`/ai/execution-logs/${id}`),
};