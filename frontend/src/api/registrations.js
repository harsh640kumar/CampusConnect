import { apiClient } from './client';

export const registrationsAPI = {
  registerForEvent: (eventId) =>
    apiClient(`/registrations/${eventId}`, {
      method: 'POST',
    }),

  cancelRegistration: (eventId) =>
    apiClient(`/registrations/${eventId}/cancel`, {
      method: 'POST',
    }),

  getMyRegistrations: () => apiClient('/registrations/my-registrations'),

  getEventRegistrations: (eventId) => apiClient(`/registrations/event/${eventId}`),

  updateAttendanceStatus: (registrationId, attendanceStatus) =>
    apiClient(`/registrations/${registrationId}/attendance`, {
      method: 'PATCH',
      body: JSON.stringify({ attendanceStatus }),
    }),
};
