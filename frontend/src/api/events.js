import { apiClient } from './client';

export const eventsAPI = {
  getEvents: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiClient(`/events${queryString}`);
  },

  getFeaturedEvents: () => apiClient('/events/featured'),

  getEventById: (idOrSlug) => apiClient(`/events/${idOrSlug}`),

  getMyCoordinatedEvents: () => apiClient('/events/coordinator/my-events'),

  createEvent: (eventData) =>
    apiClient('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    }),

  updateEvent: (id, eventData) =>
    apiClient(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    }),

  deleteEvent: (id) =>
    apiClient(`/events/${id}`, {
      method: 'DELETE',
    }),
};
