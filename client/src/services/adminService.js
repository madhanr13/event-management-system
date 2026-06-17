/**
 * adminService.js — admin-only API calls.
 */

import api from './api';

/** Fetch aggregated dashboard statistics. */
export const getDashboard = () =>
  api.get('/admin/dashboard');

/** List users with optional filters (search, role, page, limit). */
export const getUsers = (params = {}) =>
  api.get('/admin/users', { params });

/** Change a user's role. */
export const updateUserRole = (userId, role) =>
  api.put(`/admin/users/${userId}/role`, { role });

/** Delete a user account. */
export const deleteUser = (userId) =>
  api.delete(`/admin/users/${userId}`);

/** Admin-level event deletion (any event). */
export const deleteEvent = (eventId) =>
  api.delete(`/admin/events/${eventId}`);

/** Fetch platform-wide reports. */
export const getReports = () =>
  api.get('/admin/reports');
