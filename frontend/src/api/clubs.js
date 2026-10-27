import { apiClient } from './client';

export const clubsAPI = {
  getClubs: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiClient(`/clubs${queryString}`);
  },

  getClubById: (idOrSlug) => apiClient(`/clubs/${idOrSlug}`),

  getMyCoordinatedClubs: () => apiClient('/clubs/my/coordinated'),

  createClub: (clubData) =>
    apiClient('/clubs', {
      method: 'POST',
      body: JSON.stringify(clubData),
    }),

  updateClub: (id, clubData) =>
    apiClient(`/clubs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(clubData),
    }),

  deleteClub: (id) =>
    apiClient(`/clubs/${id}`, {
      method: 'DELETE',
    }),

  joinClub: (id) =>
    apiClient(`/clubs/${id}/join`, {
      method: 'POST',
    }),

  leaveClub: (id) =>
    apiClient(`/clubs/${id}/leave`, {
      method: 'POST',
    }),
};
