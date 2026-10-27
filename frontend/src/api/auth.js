import { apiClient } from './client';

export const authAPI = {
  login: (credentials) =>
    apiClient('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  register: (userData) =>
    apiClient('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  getCurrentUser: () => apiClient('/auth/me'),

  updateProfile: (profileData) =>
    apiClient('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }),
};
