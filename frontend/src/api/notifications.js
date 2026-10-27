import { apiClient } from './client';

export const notificationsAPI = {
  getNotifications: () => apiClient('/notifications'),

  markAsRead: (id) =>
    apiClient(`/notifications/${id}/read`, {
      method: 'PATCH',
    }),

  markAllAsRead: () =>
    apiClient('/notifications/mark-all-read', {
      method: 'PATCH',
    }),

  deleteNotification: (id) =>
    apiClient(`/notifications/${id}`, {
      method: 'DELETE',
    }),
};
