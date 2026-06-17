/**
 * eventService.js — CRUD operations for events.
 *
 * createEvent / updateEvent accept FormData so the backend
 * can handle multipart uploads (poster images, etc.).
 */

import api from './api';

/** List events with optional query params (search, category, status, page, limit). */
export const getEvents = (params = {}) =>
  api.get('/events', { params });

/** Get a single event by ID. */
export const getEvent = (id) =>
  api.get(`/events/${id}`);

/** Create a new event (multipart FormData). */
export const createEvent = (formData) =>
  api.post('/events', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

/** Update an existing event (multipart FormData). */
export const updateEvent = (id, formData) =>
  api.put(`/events/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

/** Delete an event. */
export const deleteEvent = (id) =>
  api.delete(`/events/${id}`);
