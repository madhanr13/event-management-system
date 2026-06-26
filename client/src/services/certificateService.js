/**
 * certificateService.js — certificate generation & retrieval.
 */

import api from './api';

/** Generate (or retrieve existing) a certificate for a completed event. */
export const generateCertificate = (eventId) =>
  api.get(`/certificates/generate/${eventId}`);

/** Get all certificates for the current user. */
export const getMyCertificates = () =>
  api.get('/certificates/my');
