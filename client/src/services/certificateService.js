/**
 * certificateService.js — certificate generation & retrieval.
 */

import api from './api';

/** Generate a certificate for a completed event. */
export const generateCertificate = (eventId) =>
  api.post(`/certificates/generate/${eventId}`);

/** Get all certificates for the current user. */
export const getMyCertificates = () =>
  api.get('/certificates/my');
