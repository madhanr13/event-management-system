/**
 * adminService.js — admin-only API calls.
 * All functions unwrap `response.data` so callers get the API body directly.
 */

import api from './api';

/** Fetch aggregated dashboard statistics. */
export const getDashboard = async () => {
  const { data } = await api.get('/admin/dashboard');
  return data;
};

/** List users with optional filters (search, role, page, limit). */
export const getUsers = async (params = {}) => {
  const { data } = await api.get('/admin/users', { params });
  return data;
};

/** Change a user's role. */
export const updateUserRole = async (userId, role) => {
  const { data } = await api.put(`/admin/users/${userId}/role`, { role });
  return data;
};

/** Delete a user account. */
export const deleteUser = async (userId) => {
  const { data } = await api.delete(`/admin/users/${userId}`);
  return data;
};

/** Admin-level event deletion (any event). */
export const deleteEvent = async (eventId) => {
  const { data } = await api.delete(`/admin/events/${eventId}`);
  return data;
};

/** Fetch platform-wide reports. */
export const getReports = async () => {
  const { data } = await api.get('/admin/reports');
  return data;
};
