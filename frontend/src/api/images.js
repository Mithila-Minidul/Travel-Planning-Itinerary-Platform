import apiClient from './client';

export const imageAPI = {
  upload: (file, folder) => {
    const data = new FormData();
    data.append('file', file);
    return apiClient.post(`/Image/upload/${folder}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  remove: (url) => apiClient.delete('/Image/delete', { params: { url } }),
};
