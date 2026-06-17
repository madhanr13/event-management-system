/**
 * @fileoverview Certificate routes.
 * Defines routes for certificate generation and retrieval.
 * @module routes/certificateRoutes
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const {
  generateCertificate,
  getMyCertificates,
} = require('../controllers/certificateController');

/**
 * @route   GET /api/certificates/generate/:eventId
 * @desc    Generate a participation certificate for an event
 * @access  Private (Student)
 */
router.get(
  '/generate/:eventId',
  protect,
  authorize('student'),
  generateCertificate
);

/**
 * @route   GET /api/certificates/my
 * @desc    Get current user's certificates
 * @access  Private (Student)
 */
router.get(
  '/my',
  protect,
  authorize('student'),
  getMyCertificates
);

module.exports = router;
