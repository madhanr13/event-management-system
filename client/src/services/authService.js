/**
 * authService.js — authentication API calls.
 */

import api from './api';

/** Login with email & password → { token, user } */
export const login = (credentials) =>
  api.post('/auth/login', credentials);

/** Register a new account → { token, user } */
export const register = (data) =>
  api.post('/auth/register', data);

/** Fetch the currently-authenticated user's profile */
export const getProfile = () =>
  api.get('/auth/me');

/** Update the current user's profile */
export const updateProfile = (data) =>
  api.put('/auth/profile', data);
