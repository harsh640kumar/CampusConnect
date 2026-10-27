import { apiClient } from './client';

export const statsAPI = {
  getAdminStats: () => apiClient('/stats/admin'),
  getCoordinatorStats: () => apiClient('/stats/coordinator'),
};

export const usersAPI = {
  getUsers: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiClient(`/users${queryString}`);
  },

  updateUserRole: (id, role) =>
    apiClient(`/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    }),

  toggleUserStatus: (id) =>
    apiClient(`/users/${id}/status`, {
      method: 'PATCH',
    }),

  getCoordinators: () => apiClient('/users/coordinators'),
};
