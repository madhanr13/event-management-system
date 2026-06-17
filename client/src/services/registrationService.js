/**
 * registrationService.js — event registration API calls.
 */

import api from './api';

/** Register the current user for an event. */
export const registerForEvent = (eventId) =>
  api.post('/registrations', { eventId });

/** Get all registrations for the current user. */
export const getMyRegistrations = () =>
  api.get('/registrations/my');

/** Get all registrations for a specific event (organizer / admin). */
export const getEventRegistrations = (eventId) =>
  api.get(`/registrations/event/${eventId}`);

/** Cancel a registration by its ID. */
export const cancelRegistration = (id) =>
  api.delete(`/registrations/${id}`);

/** Export participant list for an event (returns a Blob / file download). */
export const exportParticipants = (eventId) =>
  api.get(`/registrations/event/${eventId}/export`, { responseType: 'blob' })
    ;
