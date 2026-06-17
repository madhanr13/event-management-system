/**
 * attendanceService.js — attendance verification API calls.
 */

import api from './api';

/** Verify / mark attendance (e.g. via QR code scan). */
export const verifyAttendance = (data) =>
  api.post('/attendance/verify', data);

/** Get attendance records for a specific event (organizer / admin). */
export const getEventAttendance = (eventId) =>
  api.get(`/attendance/event/${eventId}`);

/** Get the current user's attendance history. */
export const getMyAttendance = () =>
  api.get('/attendance/my');
