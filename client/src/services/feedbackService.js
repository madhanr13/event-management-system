/**
 * feedbackService.js — event feedback API calls.
 */

import api from './api';

/** Submit feedback for an event. */
export const submitFeedback = (data) =>
  api.post('/feedback', data);

/** Get all feedback entries for an event. */
export const getEventFeedback = (eventId) =>
  api.get(`/feedback/event/${eventId}`);

/** Get aggregated feedback stats (avg rating, counts) for an event. */
export const getEventFeedbackStats = (eventId) =>
  api.get(`/feedback/event/${eventId}/stats`);
